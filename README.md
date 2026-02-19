# AI Interview Simulator (Desi Version)

Production-ready full-stack interview practice app with desi interviewer tone, role-based tracks, follow-up questions, scorecards, and history.

## Stack
- Client: React + Vite + TypeScript + Tailwind + React Router
- Server: Node.js + Express + TypeScript
- DB: Prisma + SQLite
- Auth: Email/password JWT + guest mode
- AI: OpenAI-compatible API (`API_BASE_URL`, `API_KEY`) from server side only

## Monorepo Structure
- `client/` frontend app
- `server/` API, Prisma schema, AI orchestration

## Setup
1. Install deps
   ```bash
   npm install
   ```
2. Configure env
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   ```
3. Generate Prisma client + migrate
   ```bash
   npm run prisma:generate --workspace server
   npm run prisma:migrate --workspace server
   ```
4. Run both apps
   ```bash
   npm run dev
   ```

- Client: `http://localhost:5173`
- Server: `http://localhost:4000`

## API Endpoints
- `POST /auth/signup`
- `POST /auth/login`
- `POST /sessions/start`
- `POST /sessions/:id/message`
- `POST /sessions/:id/end`
- `GET /sessions`
- `GET /sessions/:id`
- `DELETE /sessions/:id`
- `GET /sessions/:id/report`
- `GET /sessions/:id/pdf`

## Notes
- Message endpoint uses rate limiting.
- Inputs validated with `zod`.
- Message rendering sanitized in backend/frontend.
- Report endpoint retries once for strict JSON if model returns invalid JSON.
