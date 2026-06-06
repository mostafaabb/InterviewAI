# InterviewAI Deployment Guide

## Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Docker & Docker Compose (optional)
- Stripe Account
- OpenAI API Key
- Cloudinary Account
- Google OAuth Credentials
- SMTP Email Account

## Local Development

### 1. Clone and Install

```bash
git clone <repo-url>
cd InterviewAI

# Backend
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev

# Frontend (new terminal)
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

### 2. Environment Variables

Configure `.env` in backend:

```
DATABASE_URL=postgresql://user:password@localhost:5432/interviewai
JWT_SECRET=your-secret-key
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLOUDINARY_CLOUD_NAME=...
GOOGLE_CLIENT_ID=...
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FRONTEND_URL=http://localhost:3000
```

Frontend `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

### 3. Docker Deployment

```bash
# From root directory
docker-compose up -d

# This starts:
# - PostgreSQL on port 5432
# - Backend API on port 5000
# - Frontend on port 3000
```

## Production Deployment

### Backend (Render/Railway)

1. Push backend code to GitHub
2. Create a new Web Service on Render
3. Set build command: `npm install && npx prisma generate && npm run build`
4. Set start command: `npx prisma migrate deploy && npm start`
5. Add all environment variables
6. Set up a PostgreSQL database (Render or Supabase)

### Frontend (Vercel)

1. Push frontend code to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL` = your Render/Railway backend URL
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = your Google OAuth client ID
4. Deploy

### Database (Supabase PostgreSQL)

1. Create Supabase project
2. Copy database connection string
3. Add to backend environment as `DATABASE_URL`

### Stripe Setup

1. Create Stripe account
2. Create two products with monthly prices:
   - Pro ($12/month)
   - Premium ($25/month)
3. Copy price IDs to environment variables
4. Set up webhook endpoint: `https://your-api.com/api/webhook`
5. Copy webhook signing secret

### Domain & SSL

- Frontend: Configure custom domain in Vercel
- Backend: Render provides SSL automatically
- Add CORS origin in backend to your frontend domain

## Post-Deployment

1. Test registration and login
2. Test Stripe checkout flow
3. Test AI interview feature
4. Monitor logs for errors
5. Set up database backups

## Maintenance

- Monitor OpenAI API usage
- Monitor Stripe webhook events
- Regular database backups
- Update dependencies monthly
- Review and rotate API keys
