# Frontend (Azota Corp)

## 1. Overview

This is the **React + Vite** frontend for the Azota Corp project. It provides:

- **Role-based UI** (admin / teacher / student)
- **Authentication flow** (token stored in `localStorage`)
- **Dashboard pages** for classes, exams, assignments, reports, and users
- **API integration** with the backend via a small `fetch` wrapper + typed API modules

## 2. Tech Stack

- **Framework**: React 19 (`react`, `react-dom`)
- **Routing**: React Router v7 (`react-router`)
- **Build tool**: Vite (`vite`, `@vitejs/plugin-react`)
- **Language**: TypeScript
- **State management**
  - **Server state**: TanStack Query (`@tanstack/react-query`)
  - **Client state**: React Context (`src/context/*`) + hooks (`src/hooks/*`)
- **API calls**: `fetch` (wrapped in `src/api/client.ts`)
- **UI / styling**
  - Tailwind CSS (`tailwindcss`, PostCSS)
  - shadcn-style components + Radix UI primitives (`@radix-ui/*`)
  - Icons: `lucide-react`
  - Animations: `framer-motion`
  - Charts: `recharts`
  - Toasts: `sonner` + Radix toast components under `src/components/ui/*`
- **Testing**: Vitest (`vitest`) and Playwright (`@playwright/test`)

## 3. Setup

### Install

From `frontend/`:

```bash
# npm
npm install

# yarn
yarn

# bun
bun install
```

### Environment variables

Vite only exposes environment variables prefixed with `VITE_`.

- **`VITE_API_BASE_URL`**: backend base URL, used by the API client.

Example (`frontend/.env`):

```bash
VITE_API_BASE_URL=http://localhost:8000
```

Notes:

- The frontend resolves API base URL in `src/utils/constants.ts`:
  - `import.meta.env.VITE_API_BASE_URL` (preferred)
  - `import.meta.env.API_BASE_URL` (legacy fallback)
- In dev, Vite also proxies `/api` to the backend (see `vite.config.ts`), so requests to `/api/...` can work without CORS configuration.

### Run project

```bash
# Start dev server
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

## 4. Project Structure

### Top-level (`frontend/`)

- **`public/`**: static assets served as-is
- **`src/`**: application source code
- **`tests/`**: e2e test(s) (Playwright)
- **`types/`**: local TypeScript type shims (e.g. `tailwindcss-animate`)
- **`dist/`**: production build output (generated)
- **Config files**: `vite.config.ts`, `tsconfig*.json`, `eslint.config.js`, `postcss.config.js`, `vitest.config.ts`, `playwright.config.ts`, `components.json`

### Source (`frontend/src/`)

- **Entry points & globals**: `main.tsx`, `App.tsx`, `index.css`, `App.css`
- **`pages/`**: route-level pages
  - Subfolders: `pages/admin/`, `pages/assignments/`, `pages/classes/`, `pages/exams/`, `pages/reports/`, `pages/student/`
- **`components/`**: shared UI components and layout pieces (sidebar, top navbar, charts, etc.)
  - `components/ui/`: Tailwind + Radix/shadcn-style primitives (Button, Input, Toast, etc.)
- **`api/`**: API client + domain modules
  - `api/client.ts`: `fetch` wrapper (adds JSON headers, attaches Bearer token, normalizes errors)
  - `api/auth.ts`, `api/classes.ts`, `api/exams.ts`, `api/assignments.ts`, `api/users.ts`: typed API functions
- **`context/`**: cross-app state providers (e.g. `AuthContext`, `ExamContext`)
- **`hooks/`**: reusable hooks (theme, language, auth helper, etc.)
- **`lib/`**: shared helpers (e.g. `src/lib/utils.ts`)
- **`router/`**: alternative router entry (`router/index.tsx`) and `ProtectedRoute` (note: the current app routes are defined in `src/App.tsx`)
- **`utils/`**: constants and small utilities

Alias:

- `@/` maps to `src/` (configured in `vite.config.ts` and `tsconfig.json`)

## 5. API Integration

### How frontend connects to backend

- The base URL is read from `VITE_API_BASE_URL` (see `src/utils/constants.ts`) and used by `src/api/client.ts`.
- API functions build paths like `/api/v1/...` and call the client’s helpers (`get`, `post`, `put`, `del`).
- In development, `vite.config.ts` proxies `/api` to `http://127.0.0.1:8000`.

### Where API calls are defined

All API calls live in `src/api/`:

- **Auth**: `src/api/auth.ts`
  - `POST /api/v1/auth/login`
  - `GET /api/v1/users/me`
- **Classes**: `src/api/classes.ts` (e.g. list, create, join, members)
- **Exams**: `src/api/exams.ts` (CRUD exams, CRUD questions under an exam)
- **Assignments / Reports**: `src/api/assignments.ts` (assignments, start/submit, result, reporting)
- **Users**: `src/api/users.ts`

Auth handling:

- Token is stored under `localStorage["azota_access_token"]` (see `AUTH_TOKEN_KEY`).
- `src/api/client.ts` automatically:
  - adds `Authorization: Bearer <token>` when provided
  - on `401`, clears the stored token and emits a `window` event (`auth:logout`) that `AuthContext` listens to.

## 6. Features

- **Authentication**
  - Login page and session persistence via token in `localStorage`
  - Route protection using `ProtectedRoute` (role gating supported)
- **Role-based dashboards**
  - Admin / teacher / student experiences (role detected from `/api/v1/users/me`)
- **Core modules**
  - Classes (create/join/list/details)
  - Exams (create/edit/delete + question management)
  - Assignments (create/list/start/submit/result)
  - Reporting (assignment report + admin overview report)
- **UI**
  - Responsive layout with sidebar + top navbar
  - Toast notifications and tooltip provider

## 7. Build & Deploy

### Build

```bash
npm run build
```

Output is generated by Vite (typically into `frontend/dist/`).

### Deploy

- Serve the built `dist/` folder with any static hosting (Nginx, Vercel static, S3/CloudFront, etc.).
- Ensure the deployed environment sets **`VITE_API_BASE_URL`** at build time (Vite env vars are baked into the bundle).

## 8. Known Issues

- **Two routing setups exist**:
  - Current app routes are defined in `src/App.tsx` using `<BrowserRouter>` and `<Routes>`.
  - There is also `src/router/index.tsx` / `src/router/ProtectedRoute.tsx` (legacy/alternate router entry). If you change routing, ensure you’re editing the correct entry.
- **Some pages exist in both root and grouped folders**:
  - For example, there are route-level files under `src/pages/` _and_ grouped versions under `src/pages/exams/`, `src/pages/admin/`, etc. When refactoring, confirm which one is imported by `src/App.tsx`.
- **Dev proxy vs base URL**:
  - In dev, `/api` is proxied to `http://127.0.0.1:8000` via `vite.config.ts`.
  - In all environments, API calls still depend on `VITE_API_BASE_URL` (used by `src/api/client.ts`). If it’s empty, requests may fail or hit the wrong origin.
