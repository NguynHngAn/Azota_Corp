# Azota Corp — Full-Stack (Frontend + Backend)

Azota Corp is an **Azota-like online exam platform** built as a full-stack project:

- **Backend API**: authentication + role-based access (admin/teacher/student) + CRUD for classes, exams, assignments
- **Frontend UI**: role-based dashboards that call the backend via a typed `fetch` client

This README explains **what the system does**, **how to run it locally**, and **how the frontend connects to the backend**.

---

## 1. Project Overview

### What it does

Example use-case:

- A **teacher** creates a class, creates an exam (with questions), and publishes an assignment.
- A **student** joins the class, starts the assignment, submits answers, and views results.
- An **admin** manages users and can access admin reporting views.

---

## 2. Architecture

```text
┌───────────────┐        HTTP (JSON)         ┌──────────────────────┐
│  Frontend     │  ───────────────────────▶  │  Backend (FastAPI)    │
│  React + Vite │  ◀───────────────────────  │  /api/v1/*            │
└───────┬───────┘     Bearer access token    └──────────┬───────────┘
        │                                               │
        │                                               │ SQLAlchemy
        │                                               ▼
        │                                       ┌───────────────────┐
        └────────────────────────────────────── │  PostgreSQL DB     │
                                                └───────────────────┘
```

---

## Project Structure (current)

```text
Azota_Corp/
  README.md
  backend/
    app/
      main.py
      config.py
      database.py
      api/v1/
      core/
      models/
      schemas/
      services/
      scripts/
        seed_users.py
    alembic/
    alembic.ini
    requirements.txt
    .env.example
    run_backend.ps1
    run_backend.bat
    seed_users.py
    check_db.py
    README.md
  frontend/
    src/
      api/
        client.ts
        auth.ts
      utils/constants.ts
    vite.config.ts
    package.json
    .env.example
    README.md
```

---

## 3. Tech Stack

### Frontend (`frontend/`)

- **React** (React 19) + **TypeScript**
- **Vite** build tooling
- **React Router** (v7, via `react-router`)
- **Data fetching**: `fetch` wrapper (`frontend/src/api/client.ts`)
- **Server state**: TanStack Query
- **Styling/UI**: Tailwind CSS + Radix UI primitives (shadcn-style components)
- **Testing**: Vitest (+ Playwright installed for e2e)

### Backend (`backend/`)

- **FastAPI** + **Uvicorn**
- **SQLAlchemy (2.x)** ORM
- **Alembic** migrations
- **JWT auth** (`python-jose`) + password hashing (`bcrypt`)
- **Settings**: `pydantic-settings` loads `backend/.env`

### Database

- **PostgreSQL**

---

## 4. Getting Started (IMPORTANT)

### 4.1 Clone repo

```bash
git clone <your-repo-url>
cd Azota_Corp
```

### 4.2 Setup Backend

#### Prerequisites

- Python 3.10+
- A running PostgreSQL instance

#### Install deps (backend)

```bash
cd backend
python -m pip install -r requirements.txt
```

#### Configure `.env` (backend)

Create `backend/.env` from the provided example:

```bash
cd backend
copy .env.example .env
```

Then edit `backend/.env` to point to your PostgreSQL (see [Environment Variables](#5-environment-variables)).

On macOS/Linux:

```bash
cd backend
cp .env.example .env
```

#### Run migrations + start server

```bash
cd backend
alembic upgrade head
```

Start the API server:

- PowerShell:

```powershell
cd backend
.\run_backend.ps1
```

- CMD:

```bat
cd backend
.\run_backend.bat
```

Backend will be available at **`http://127.0.0.1:8000`**.

Useful URLs:

- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`
- Health check: `http://127.0.0.1:8000/health`

### 4.3 Setup Frontend

#### Install deps (frontend)

```bash
cd frontend
npm install
```

#### Configure `.env` (frontend)

Create `frontend/.env` (or copy from example):

```bash
cd frontend
copy .env.example .env
```

Ensure it contains:

```env
VITE_API_BASE_URL=http://localhost:8000
```

#### Run dev server

```bash
cd frontend
npm run dev
```

Frontend dev server typically runs at **`http://localhost:5173`**.

---

## 5. Environment Variables

### Backend (`backend/.env`)

Backend loads env vars from `backend/.env` (configured in `backend/app/config.py`).

Variables supported by the backend settings:

- **`APP_NAME`**: API title (default: `Azota-like Exam API`)
- **`ENV`**: `development` | `staging` | `production`

JWT:

- **`SECRET_KEY`**: signing key for JWTs (must be kept secret in production)
- **`ALGORITHM`**: JWT algorithm (default: `HS256`)
- **`ACCESS_TOKEN_EXPIRE_MINUTES`**: access token TTL in minutes
- **`REFRESH_TOKEN_EXPIRE_DAYS`**: refresh token TTL in days

Database (choose one approach):

- **Option A (recommended)**: set **`DATABASE_URL`**
  - Example: `postgresql://postgres:your_password@localhost:5432/azota_exam`
- **Option B**: omit `DATABASE_URL` and set:
  - **`POSTGRES_HOST`**
  - **`POSTGRES_PORT`**
  - **`POSTGRES_USER`**
  - **`POSTGRES_PASSWORD`**
  - **`POSTGRES_DB`**

Other:

- **`AI_EXPLANATION_ENABLED`**: `true/false` feature toggle (default `false`)

Notes:

- `backend/.env.example` includes a minimal working set. Some settings (like the split `POSTGRES_*` vars and `AI_EXPLANATION_ENABLED`) are supported by code even if not listed in that example file.
- `backend/.env.example` also contains `DEBUG`, but backend settings currently derive debug mode from `ENV` and ignore unknown keys.

### Frontend (`frontend/.env`)

Vite only exposes env vars prefixed with `VITE_`.

- **`VITE_API_BASE_URL`**: backend base URL used by `frontend/src/api/client.ts`

Example:

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## 6. API Integration

### How frontend calls backend

- Frontend builds requests like `GET /api/v1/...` and calls them through `frontend/src/api/client.ts`.
- Requests are sent to: **`${VITE_API_BASE_URL}/api/v1/...`**

Development proxy:

- `frontend/vite.config.ts` proxies **`/api` → `http://127.0.0.1:8000`**.
- The API client still uses `VITE_API_BASE_URL` to construct the fetch URL, so keep `VITE_API_BASE_URL` set (local dev default is `http://localhost:8000`).

### Auth flow (login → token → request)

1. **Login**
   - Frontend calls `POST /api/v1/auth/login` with `{ email, password }`
   - Backend returns `access_token` and `refresh_token`
2. **Store token**
   - Frontend stores the access token in `localStorage` under key:
     - `azota_access_token` (see `AUTH_TOKEN_KEY` in `frontend/src/utils/constants.ts`)
3. **Authenticated requests**
   - Frontend attaches:
     - `Authorization: Bearer <access_token>`
4. **401 behavior**
   - If the backend returns `401`, the API client:
     - removes `azota_access_token` from `localStorage`
     - dispatches a `window` event: `auth:logout`

---

## 7. Seed Data (IMPORTANT for your case)

After you run migrations and start the backend (and the DB is reachable), seed demo users.

### Option A (recommended): seed 6 demo accounts

```bash
cd backend
python app/scripts/seed_users.py
```

Creates (or skips if already present):

- Admins:
  - `admin1@test.com` / `admin123`
  - `admin2@test.com` / `admin123`
- Teachers:
  - `teacher1@test.com` / `teacher123`
  - `teacher2@test.com` / `teacher123`
- Students:
  - `student1@test.com` / `student123`
  - `student2@test.com` / `student123`

### Option B: seed a minimal local set (3 users)

```bash
cd backend
python seed_users.py
```

Creates:

- `admin@azota.local` / `admin123`
- `teacher@azota.local` / `teacher123`
- `student@azota.local` / `student123`

---

## 8. Features

- **Authentication**
  - JWT access + refresh tokens (backend)
  - Token persisted in `localStorage` (frontend)
- **Roles**
  - `admin` / `teacher` / `student`
  - Role-based UI dashboards (frontend)
- **Core modules**
  - Users
  - Classes
  - Exams (including question management)
  - Assignments (start/submit/results)
- **Health & debugging**
  - `GET /health` and `GET /health/debug`

---

## 9. Development Workflow

### Branching

This repository is a git repo. If you want a simple workflow (recommendation):

- **`main`**: stable releases
- **`dev`**: active development/integration
- Feature branches: `feature/<short-name>` branched off `dev`

### Commit style

Keep commits small and readable. A conventional style works well (recommendation), for example:

- `feat: add ...`
- `fix: handle ...`
- `refactor: simplify ...`
- `docs: update ...`

---

## 10. Troubleshooting

### Backend can’t connect to DB

- Verify `backend/.env` exists and points to a valid PostgreSQL instance.
- Run the built-in DB debug helper:

```bash
cd backend
python check_db.py
```

### CORS / browser blocked requests

Backend CORS allows:

- `http://localhost:5173`
- `http://127.0.0.1:5173`

If your frontend runs on a different origin/port, update CORS config in `backend/app/main.py`.

### 401 Unauthorized

- Ensure you’re sending `Authorization: Bearer <access_token>` (not the refresh token).
- If you see frequent logouts, your access token might be expired; re-login to obtain a new one.
