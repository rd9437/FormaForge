# FormaForge

FormaForge is a full-stack form generation platform powered by Google Gemini. Users describe the form they need in natural language, the system retrieves the most relevant pieces of their historical form library, and Gemini returns a JSON schema that is rendered instantly on a public link. Submissions, media uploads, and contextual memory are all stored in MongoDB and surfaced in the dashboard.

## Tech Stack

- **Frontend**: Next.js 15 (App Router, TypeScript), SWR, Zustand
- **Backend**: Express (TypeScript), MongoDB (Mongoose), Google Gemini, Cloudinary
- **AI & Retrieval**: Gemini 1.5 Pro for generation, text-embedding-004 for semantic retrieval
- **Auth**: Email/password with JWT cookie session

## Features

- Prompt-to-schema generation with relevant memory context
- Semantic retrieval of top-K historical forms to keep prompts within token limits
- Dynamic form rendering with file uploads (Cloudinary)
- Public share links (`/form/[slug]`) that accept submissions and media
- Authenticated dashboard with previews, submission history, and memory traceability

## Repository Layout

```
frontend/   # Next.js application
backend/    # Express API server
```

## Getting Started

### 1. Clone and Install

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Environment Variables

Create `.env.local` in `frontend/` based on `.env.local.example`. The API base URL should point to the Express server and Cloudinary values should match your account configuration.

Create `.env` in `backend/` based on `.env.example`. Provide MongoDB Atlas credentials, a strong `JWT_SECRET`, your Gemini API key, and Cloudinary keys.

### 3. Run Locally

Open two terminals:

```bash
# Terminal 1 - backend
cd backend
npm run dev

# Terminal 2 - frontend
cd frontend
npm run dev
```

Frontend runs on `http://localhost:3000`, backend on `http://localhost:4000` by default.

## Context Memory & Retrieval

- Each generated form stores:
  - An embedding vector derived from the user prompt (`text-embedding-004`)
  - A compact summary (title plus top fields) used for human-readable memory chips
- When a new prompt arrives:
  1. Embed the prompt and compute cosine similarity across the user's stored embeddings.
  2. Select the top-K (default 5) most similar forms.
  3. Build the Gemini prompt with only these snippets, keeping token usage predictable even with 100K+ forms.

**Scalability**
- Embeddings are stored directly on the `Form` document, keeping retrieval to a single indexed query per user.
- Similarity scoring happens in memory; for very large libraries you can move embeddings into a vector database without changing the interface.
- Limiting context to top-K ensures predictable latency and avoids LLM token limits.

## API Overview

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Authenticate and issue session cookie |
| GET | `/api/forms` | List user forms |
| POST | `/api/forms/generate` | Generate new form via Gemini |
| GET | `/api/forms/:formId` | Fetch a form |
| PATCH | `/api/forms/:formId` | Update form metadata |
| DELETE | `/api/forms/:formId` | Delete form |
| GET | `/api/forms/:formId/submissions` | List submissions |
| GET | `/api/public/forms/:slug` | Public form schema |
| POST | `/api/public/forms/:slug/submit` | Submit response |
| POST | `/api/media/signature` | Cloudinary upload signature |

All authenticated routes require the `token` cookie returned from login/register.

## Tests & Linting

- Frontend: `npm run lint` (Next.js ESLint rules)
- Backend: `npm run lint` (TypeScript ESLint)

