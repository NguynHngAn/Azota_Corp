# Azota-like Exam Backend (API)

FastAPI backend for an Azota-like exam platform. It exposes REST APIs for authentication and managing users, classes, exams, and assignments, backed by PostgreSQL.

## Project overview

- **Role-based users**: admin / teacher / student
- **JWT authentication**: access + refresh tokens
- **CRUD APIs** for core resources (users, classes, exams, assignments)
- **Database migrations** via Alembic
- **Seed scripts** to bootstrap demo users
- **Health endpoints** to validate API + DB connectivity

## Tech stack

- **Framework**: FastAPI
- **ASGI server**: Uvicorn
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy (2.x)
- **Migrations**: Alembic
- **Auth**: JWT (`python-jose`) + password hashing (`bcrypt`)
- **Settings**: `pydantic-settings` (loads `backend/.env`)

## Project structure

```text
backend/
  app/
    __init__.py
    main.py                 # FastAPI app + router registration + health endpoints
    config.py               # Settings (.env loading)
    database.py             # SQLAlchemy engine/session/base + DB dependency
    api/
      __init__.py
      deps.py               # Auth dependencies (current user, require_role)
      v1/
        __init__.py
        auth.py
        users.py
        classes.py
        exams.py
        assignments.py
    core/
      __init__.py
      security.py           # Password hashing + JWT encode/decode
    models/
      __init__.py
      user.py
      class_model.py
      exam.py
      assignment.py
    schemas/
      __init__.py
      auth.py
      user.py
      class_schema.py
      exam_schema.py
      assignment_schema.py
    services/
      __init__.py
      ai_explanation_service.py
      assignment_service.py
      class_service.py
      exam_service.py
      grading_service.py
    scripts/
      seed_users.py         # Seed demo users (admin/teacher/student x2)
  alembic/
    env.py
    versions/               # Migration revisions
  alembic.ini               # Alembic config (DB URL injected at runtime)
  requirements.txt          # Python dependencies
  run_backend.ps1           # Windows PowerShell launcher
  run_backend.bat           # Windows CMD launcher
  seed_users.py             # Alternative seeder (admin/teacher/student x1)
  check_db.py               # Debug helper: env loading + DB connectivity
  .env.example              # Example environment configuration
```

## Setup instructions

### Prerequisites

- **Python**: 3.10+ recommended
- **PostgreSQL**: a running PostgreSQL instance you can connect to

### Installation

From the repository root:

```bash
cd backend
python -m pip install -r requirements.txt
```

### Environment variables

The backend loads environment variables from `backend/.env` (same folder as `requirements.txt`).

Create your `.env` file:

```bash
cd backend
copy .env.example .env
```

Minimum configuration (example):

```env
# App
APP_NAME=Azota-like Exam API
ENV=development

# JWT
SECRET_KEY=change-me-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Database
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/azota_exam
```

Notes:

- **DB URL precedence**: if `DATABASE_URL` is set, it is used. Otherwise the app builds a URL from `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`.
- **Production**: always override `SECRET_KEY` and point `DATABASE_URL` to a secured database.

### Run the project

From `backend/`:

```bash
alembic upgrade head
```

Then start the API server (pick one):

- PowerShell:

```powershell
.\run_backend.ps1
```

- CMD:

```bat
.\run_backend.bat
```

The API will be available at `http://127.0.0.1:8000`.

## Database

### Migrations

Apply all migrations:

```bash
cd backend
alembic upgrade head
```

### Seeding data (IMPORTANT)

This project includes two seed scripts:

#### Option A (recommended): seed the demo accounts used in earlier docs

```bash
cd backend
python app/scripts/seed_users.py
```

Creates (or skips if already present):

- **Admins**:
  - `admin1@test.com` / `admin123`
  - `admin2@test.com` / `admin123`
- **Teachers**:
  - `teacher1@test.com` / `teacher123`
  - `teacher2@test.com` / `teacher123`
- **Students**:
  - `student1@test.com` / `student123`
  - `student2@test.com` / `student123`

#### Option B: seed a minimal local set

```bash
cd backend
python seed_users.py
```

Creates:

- `admin@azota.local` / `admin123`
- `teacher@azota.local` / `teacher123`
- `student@azota.local` / `student123`

## API documentation

Once the server is running:

- **Swagger UI**: `http://127.0.0.1:8000/docs`
- **ReDoc**: `http://127.0.0.1:8000/redoc`

## Authentication

### Login flow

- **Endpoint**: `POST /api/v1/auth/login`
- **Body**: `{ "email": "...", "password": "..." }`
- **Returns**: `access_token` and `refresh_token`

### Using the access token

Send the token as a Bearer token:

```http
Authorization: Bearer <access_token>
```

### Refreshing a token

- **Endpoint**: `POST /api/v1/auth/refresh`
- **Body**: `{ "refresh_token": "..." }`
- **Returns**: a new access + refresh token pair

## Testing

There is no automated test suite configured in `backend/` at the moment.

## Common issues

- **DB connection fails at startup**
  - Confirm `backend/.env` exists and `DATABASE_URL` is correct.
  - Run the DB debug helper:

```bash
cd backend
python check_db.py
```

- **Migrations not applied**
  - Run:

```bash
cd backend
alembic upgrade head
```

- **401 Not authenticated / Invalid token**
  - Ensure you are sending `Authorization: Bearer <access_token>` (not the refresh token).
  - Ensure `SECRET_KEY` and `ALGORITHM` are consistent across runs/environments.

## Useful endpoints

- `GET /health`: API + DB connectivity status
- `GET /health/debug`: shows `.env` presence + masked DB URL
- `GET /routes`: lists registered routes
