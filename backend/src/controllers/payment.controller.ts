import { Response } from 'express';
import prisma from '../config/prisma';
import { stripe } from '../config/stripe';
import { env } from '../config/env';
import { AuthRequest } from '../middleware/auth';

export const createCheckoutSession = async (req: AuthRequest, res: Response) => {
  try {
    const { plan } = req.body;
    const priceId = plan === 'PREMIUM' ? env.STRIPE_PREMIUM_PRICE_ID : env.STRIPE_PRO_PRICE_ID;

    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      include: { subscription: true },
    });

    if (!user) return res.status(404).json({ error: 'User not found.' });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      client_reference_id: user.id,
      success_url: `${env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.FRONTEND_URL}/pricing`,
      metadata: { userId: user.id, plan },
    });

    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session.' });
  }
};

export const createPortalSession = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      include: { subscription: true },
    });

    if (!user?.subscription?.stripeCustomerId) {
      return res.status(400).json({ error: 'No subscription found.' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.subscription.stripeCustomerId,
      return_url: `${env.FRONTEND_URL}/dashboard`,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Portal error:', error);
    res.status(500).json({ error: 'Failed to create portal session.' });
  }
};

export const handleWebhook = async (req: AuthRequest, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, env.STRIPE_WEBHOOK_SECRET);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const userId = session.metadata.userId;
        const plan = session.metadata.plan;

        const subscription = await stripe.subscriptions.retrieve(session.subscription);

        await prisma.subscription.update({
          where: { userId },
          data: {
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
            plan,
            status: 'ACTIVE',
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });

        await prisma.user.update({
          where: { id: userId },
          data: { plan },
        });
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const sub = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (sub) {
          await prisma.subscription.update({
            where: { id: sub.id },
            data: {
              status: subscription.status === 'active' ? 'ACTIVE' : 'CANCELED',
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const deletedSub = event.data.object as any;
        const existingSub = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: deletedSub.id },
        });

        if (existingSub) {
          await prisma.subscription.update({
            where: { id: existingSub.id },
            data: { plan: 'FREE', status: 'CANCELED' },
          });

          await prisma.user.update({
            where: { id: existingSub.userId },
            data: { plan: 'FREE' },
          });
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: 'Webhook signature verification failed.' });
  }
};

export const getSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user?.id },
    });

    res.json(subscription);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get subscription.' });
  }
};
