# InterviewAI — AI-Powered Interview Preparation Platform

Interview preparation takes more than memorizing common questions. It requires understanding your strengths, practicing technical problems, communicating your ideas clearly, and knowing what to improve.

**InterviewAI** is a full-stack project built to bring these parts of interview preparation into one platform. It combines AI-assisted interview practice with tools designed to help candidates prepare for technical roles and track their learning.

I built this project to explore how AI can make interview preparation more interactive and personalized, while also working through the challenges of developing a complete web application with a frontend, backend, database, and external service integrations.

## What InterviewAI Offers

The platform is designed around several parts of the interview preparation process:

- **AI-powered interview practice** — generate interview questions and support practice sessions using configured AI providers.
- **Resume analysis** — help candidates review their resumes and identify areas to improve.
- **Technical coding challenges** — provide a place to practice coding problems and work through technical questions.
- **Answer evaluation and feedback** — help users understand their responses and identify potential areas for improvement.
- **Personalized learning plans** — organize preparation around skills and topics that need more attention.
- **Peer interview practice** — support interview preparation with other candidates, where the matching functionality is available.
- **User accounts and authentication** — manage access to the platform.
- **Subscription and payment integration** — support paid plans through Stripe where configured.

The exact availability of individual features depends on the current implementation. Some capabilities may require additional environment configuration or external API credentials.

## Technology Stack

The repository separates the frontend and backend, with supporting configuration for local development and deployment.

| Area | Technologies |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | Node.js |
| Database | PostgreSQL |
| Database access | Prisma |
| AI integration | OpenAI API, Google Gemini API |
| Authentication | JWT |
| Payments | Stripe |
| File and media services | Cloudinary |
| OAuth | Google OAuth |
| Deployment | Docker Compose, with separate frontend/backend deployment options |

## How It Works

At a high level, InterviewAI connects the user interface to backend services that manage application data, authentication, and AI-related operations.

1. A user accesses the frontend and interacts with the available preparation tools.
2. The frontend communicates with the backend through API requests.
3. The backend handles application logic and accesses the PostgreSQL database through Prisma.
4. Configured AI services support features that require generated questions, analysis, or feedback.
5. Other integrations, such as authentication providers, media storage, and payment services, support their respective workflows.

This separation makes the application easier to understand and maintain than placing all application logic in one layer.

## Project Structure

The repository is organized into separate frontend and backend applications.

```text
InterviewAI/
├── backend/
│   └── Server-side application and API
├── frontend/
│   └── Web application and user interface
├── .env.example
├── docker-compose.yml
└── DEPLOYMENT.md
```

The frontend handles the user-facing experience, while the backend is responsible for server-side logic and data operations. The deployment guide contains additional configuration and deployment information.

## Getting Started

### Prerequisites

Before running the project, prepare:

- Node.js 20 or later
- PostgreSQL 16 or later
- npm
- Git

Docker and Docker Compose can also be used if your local environment supports them.

You may need API credentials for the AI providers and other external services you intend to use.

### 1. Clone the repository

```bash
git clone https://github.com/mostafaabb/InterviewAI.git
cd InterviewAI
```

### 2. Configure the backend

Open the `backend` directory and install its dependencies:

```bash
cd backend
npm install
```

Create the backend environment file using the provided environment example. Configure the database connection, authentication secret, and any external service credentials required by the features you want to run.

Generate the Prisma client and prepare the database using the commands documented in `DEPLOYMENT.md`.

### 3. Start the backend

From the `backend` directory, run the development command defined in its `package.json`:

```bash
npm run dev
```

### 4. Configure and start the frontend

Open a second terminal from the repository root:

```bash
cd frontend
npm install
```

Create the frontend environment file from the example provided in the frontend directory. Configure the API URL and any other required public settings.

Start the frontend using its configured development script:

```bash
npm run dev
```

The deployment guide is the reference for the exact environment filenames, database commands, and application startup configuration. Check it before running the steps above, especially if the scripts have changed.

## Environment Variables

The project includes configuration for services such as:

- PostgreSQL database access
- JWT authentication
- OpenAI and Gemini API credentials
- Stripe payment processing and webhooks
- Cloudinary
- Google OAuth
- SMTP email delivery
- Frontend and backend URLs

Use `.env.example` and the frontend's environment example to identify the required variable names.

**Security note:** Never commit real API keys, database passwords, OAuth secrets, payment credentials, or JWT secrets to GitHub. Use local environment files for development and your hosting provider's secret-management settings for deployment.

## Deployment

The repository includes a `docker-compose.yml` file and a separate `DEPLOYMENT.md` guide.

The documented deployment approach covers running the services locally and deploying the frontend, backend, and PostgreSQL database separately.

For deployment, configure the production environment variables, database connection, frontend API URL, authentication settings, and any required third-party integrations. Test the main application flows after deployment rather than assuming a successful build means every feature is working.

## What I Focused On

InterviewAI brings together several areas of full-stack development that I want to continue improving:

- Structuring a frontend and backend as separate applications
- Connecting API endpoints with persistent database models
- Integrating external AI services into application workflows
- Managing environment-specific configuration
- Connecting authentication, payments, and third-party services
- Organizing local development and deployment instructions

For me, the value of this project is not just adding AI features. It is understanding how those features fit into a complete application and how the different parts work together.

## Project Status

InterviewAI is an evolving project. Refer to the source code and deployment documentation for the current implementation and setup requirements.

## Author

**Mostafa Borshalli**  
Full-Stack Developer

- Portfolio: https://mostafa-portfolio-black.vercel.app/
- GitHub: https://github.com/mostafaabb
- LinkedIn: https://linkedin.com/in/mostafa-borshalli-7a152a327
