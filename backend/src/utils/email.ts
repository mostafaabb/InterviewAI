import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationUrl = `${env.FRONTEND_URL}/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"InterviewAI" <${env.SMTP_USER}>`,
    to: email,
    subject: 'Verify your InterviewAI account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to InterviewAI!</h2>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px;">Verify Email</a>
        <p>Or copy this link: ${verificationUrl}</p>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${env.FRONTEND_URL}/auth/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"InterviewAI" <${env.SMTP_USER}>`,
    to: email,
    subject: 'Reset your InterviewAI password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset Your Password</h2>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px;">Reset Password</a>
        <p>Or copy this link: ${resetUrl}</p>
      </div>
    `,
  });
};
