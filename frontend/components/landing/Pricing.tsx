"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Get started with basic interview practice",
    features: [
      "3 AI Interviews/month",
      "10 Coding Challenges/month",
      "Basic Reports",
      "Progress Tracking",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$12",
    description: "For serious interview preparation",
    features: [
      "Unlimited AI Interviews",
      "Unlimited Coding Challenges",
      "Advanced Feedback Reports",
      "Resume Analyzer",
      "Job Description Analyzer",
      "Progress Analytics",
      "Priority Support",
    ],
    cta: "Start Pro",
    popular: true,
  },
  {
    name: "Premium",
    price: "$25",
    description: "For the best preparation experience",
    features: [
      "Everything in Pro",
      "System Design Interviews",
      "Personalized Roadmaps",
      "Priority AI Models (GPT-4)",
      "Custom Interview Categories",
      "Export Reports (PDF)",
      "API Access",
    ],
    cta: "Go Premium",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your preparation needs. Upgrade anytime.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className={`relative p-8 rounded-2xl border ${
                plan.popular
                  ? "border-primary/50 bg-primary/5 shadow-xl shadow-primary/10"
                  : "border-border/50 bg-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
                <div className="text-4xl font-bold mb-2">
                  {plan.price}
                  <span className="text-base font-normal text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href={plan.name === "Free" ? "/auth/register" : "/auth/register?plan=" + plan.name.toLowerCase()}>
                <Button
                  variant={plan.popular ? "gradient" : "outline"}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
