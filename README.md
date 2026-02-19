# AI Interview Simulator (Desi Version)

A production-ready monorepo web app to simulate Indian-style interviews (Hinglish/English/Hindi), generate follow-up questions, and create a score-based feedback report.

## Stack
- Frontend: React + Vite + TypeScript + Tailwind + React Router
- Backend: Node.js + Express + TypeScript
- DB: SQLite via Prisma
- Auth: JWT email/password + guest token mode
- AI: OpenAI-compatible provider through `API_BASE_URL` + `API_KEY`

## Project Structure
- `server/` Express API + Prisma
- `client/` React app

## Setup
1. Copy env:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate Prisma client:
   ```bash
   npm run db:generate
   ```
4. Run migration:
   ```bash
   npm run db:migrate
   ```
5. Start both apps:
   ```bash
   npm run dev
   ```

- Client: http://localhost:5173
- Server: http://localhost:4000

## Key API Endpoints
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
- AI keys remain server-side only.
- Message endpoint is rate-limited.
- Inputs are validated with Zod.
- Interview/report responses use structured JSON with retry-on-invalid-json.
