# Task Manager Full Stack

[![CI](https://github.com/ymatias/taskManager-lab1/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/ymatias/taskManager-lab1/actions/workflows/ci.yml)

Classroom assignment implementing a full-stack task manager with per-user authentication and
persistence. Each user sees only their own tasks. The repo has two independent npm projects:

- **`app/`** — Vite + React 18 + TypeScript frontend (Material UI v9, dark theme)
- **`backend/`** — Node.js + Express 5 + TypeScript API (hexagonal architecture, Prisma v7, PostgreSQL)

**Repository:** https://github.com/yitzhakmatias/taskManager (rama: `labo2`)

**Production:**
- Backend: https://task-manager-backend-omega.vercel.app
- Frontend: deploy `app/` to Vercel with `VITE_API_BASE_URL` pointing to the backend URL above

There is no root `package.json`. Run all npm commands from inside `app/` or `backend/`.

---

## How it works

1. On load, `App.tsx` reads `tm_token` from `localStorage`. If missing, it renders `LoginPage`.
2. The user logs in (`POST /login`) or registers (`POST /register`). On success the backend returns a JWT; `App.tsx` stores it in `localStorage` and in React state.
3. Once authenticated, `App.tsx` fetches the user's tasks (`GET /tasks`) and renders `Header → TaskInput → TaskList → Footer`. `TaskList` shows `EmptyState` when empty, otherwise a `TaskCard` per task.
4. Adding, toggling, and deleting tasks call `POST /tasks`, `PUT /tasks/:id`, and `DELETE /tasks/:id` — all with `Authorization: Bearer <token>`.
5. The backend `requireAuth` middleware verifies the JWT and attaches `req.userId`. Every task query is scoped to that user (`WHERE userId = req.userId`). Passwords are hashed with bcrypt (10 rounds).

---

## Project structure

```
app/                              Frontend (Vite + React + TS)
  src/
    components/
      Header.tsx
      TaskInput.tsx
      TaskList.tsx
      TaskCard.tsx
      EmptyState.tsx
      Footer.tsx
      LoginPage.tsx               Login / Register tabs
    services/
      taskService.ts              Single API layer (login, register, getTasks,
                                  createTask, toggleTask, deleteTask)
    App.tsx                       Owns all auth + task state
  index.html
  vite.config.ts
  local.settings.json             { "apiBaseUrl": "http://localhost:3000" }
                                  (gitignored — for local dev only)

backend/                          API (Node.js + Express + Prisma)
  prisma/
    schema.prisma                 Role, User, Task models
    seed.ts                       Creates user1@test.com and user2@test.com
  src/
    domain/
      entities/                   Task, User TypeScript types
      repositories/               ITaskRepository, IUserRepository (ports)
    application/
      auth/                       login, register, get-profile use cases
      task/                       get, create, update, delete task use cases
    infrastructure/
      database/                   Prisma repository implementations
      http/
        auth.router.ts            /login, /register, /profile routes
        task.router.ts            /tasks CRUD routes
        auth.middleware.ts        requireAuth — verifies JWT, attaches req.userId
    index.ts                      Composition root + Express server entry point
    swagger.ts                    OpenAPI 3.0 spec (served at /api-docs)
  vercel.json                     Vercel serverless config (buildCommand, routes)
  .env                            DATABASE_URL, JWT_SECRET (never commit)
```

---

## Running locally

### Backend

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init   # creates tables
npm run seed                         # inserts test users (see below)
npm run dev                          # http://localhost:3000
```

### Frontend

```bash
cd app
npm install
# Create app/local.settings.json if it doesn't exist:
echo '{ "apiBaseUrl": "http://localhost:3000" }' > local.settings.json
npm run dev                          # http://localhost:5173
```

---

## Environment variables

Create `backend/.env` (never commit this file):

```
DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require
JWT_SECRET=<any-secret-string>
PORT=3000
```

For Vercel deployment, set these same variables in the Vercel project settings under
**Settings → Environment Variables**.

---

## Test users (created by `npm run seed`)

| Email | Password |
|---|---|
| user1@test.com | password1 |
| user2@test.com | password2 |

---

## API endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /register | No | Create a new user — body: `{ name, email, password }` |
| POST | /login | No | Returns `{ message, token }` — body: `{ email, password }` |
| GET | /profile | Yes | Returns decoded JWT payload `{ userId }` |
| GET | /tasks | Yes | List the authenticated user's tasks |
| POST | /tasks | Yes | Create a task — body: `{ text }` |
| PUT | /tasks/:id | Yes | Update a task — body: `{ text?, completed? }` |
| DELETE | /tasks/:id | Yes | Delete a task |
| GET | /api-docs | No | Swagger UI (OpenAPI 3.0) |

All protected routes require header: `Authorization: Bearer <token>`

---

## Available scripts

| Location | Command | Description |
|---|---|---|
| `app/` | `npm run dev` | Start Vite dev server (port 5173) |
| `app/` | `npm run build` | `tsc -b && vite build` |
| `app/` | `npm run preview` | Preview the production build |
| `app/` | `npm run lint` | Run ESLint |
| `backend/` | `npm run dev` | Start API with nodemon + ts-node (port 3000) |
| `backend/` | `npm run build` | `prisma generate && tsc` |
| `backend/` | `npm start` | Run compiled `dist/index.js` |
| `backend/` | `npm run seed` | Seed the database with test users |
| `backend/` | `npm run lint` | Run ESLint |
| `backend/` | `npm test` | Run automated tests (**pending — Session 3**, not yet implemented) |

---

## Continuous Integration

Every push and Pull Request to `main` runs `.github/workflows/ci.yml`, which lints and builds both `app/` and `backend/` independently. See the badge at the top of this README for the current status of `main`.

---

## Deployment (Vercel)

### Backend
- Import `backend/` as a separate Vercel project.
- Vercel uses `backend/vercel.json` (`@vercel/node`, entry: `src/index.ts`).
- Set `DATABASE_URL` and `JWT_SECRET` in Vercel environment variables.

### Frontend
- Import `app/` as a separate Vercel project.
- Set **Root Directory** = `app/` in Vercel project settings.
- Add environment variable: `VITE_API_BASE_URL=https://task-manager-backend-omega.vercel.app`

---

## Security notes

- `backend/.env` is in `.gitignore` — **never commit credentials**.
- JWTs expire after 1 hour (`expiresIn: '1h'`).
- Passwords are hashed with bcrypt, 10 salt rounds.
- `localStorage` is used for JWT persistence (standard for SPAs; suitable for this academic context).
- All task queries are scoped by `userId` — users cannot access each other's tasks.

---

## Verification

```bash
# Frontend type-check + build
cd app && npm run build

# Backend type-check + build
cd backend && npm run build

# Test auth flow (requires running backend)
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@test.com","password":"password1"}'
```
