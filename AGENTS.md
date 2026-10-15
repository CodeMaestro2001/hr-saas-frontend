# AGENTS.md — Workforce Management Frontend

## Project purpose
Build a simple, professional React frontend for an **existing** Workforce Management backend. This is a **separate Git repository** from the Node.js + Express + TypeScript + Prisma + PostgreSQL API.

The frontend demonstrates full-stack integration for an Associate Software Engineer interview. Favor understandable code and working features over advanced architecture.

## Read first
1. Read this file and `PROJECT_PLAN.md` before making changes.
2. Inspect existing code and `package.json` before adding or changing dependencies.
3. Implement **only the phase explicitly requested**. Stop and summarize afterward.
4. Do not assume the backend response structure. Check actual backend README, OpenAPI spec, code, or example responses. Ask for these if inaccessible; do not silently invent API contracts.

## Stack
- React + TypeScript + Vite
- React Router
- Tailwind CSS (use the version and setup that matches the installed packages)
- Axios for HTTP requests
- TanStack Query for server data
- React Hook Form + Zod for forms that benefit from validation
- Lucide React for icons
- No Redux, Next.js, micro-frontends, or unnecessary component libraries

## Structure
```text
src/
  api/               # shared Axios client and endpoint functions
  components/
    layout/          # sidebar, navbar, app layout
    ui/              # small reusable presentational components
  contexts/          # authentication context
  hooks/             # shared hooks
  pages/             # route-level pages
  types/             # backend contracts and shared types
  utils/             # focused helper functions
  App.tsx
  main.tsx
```
Use this structure as a guide, not a requirement to create unused files.

## Backend integration — critical
- The backend owns authentication, authorization, validation, business rules, and database access. **Never connect React directly to PostgreSQL.**
- Base URL comes from `import.meta.env.VITE_API_BASE_URL`, e.g. `http://localhost:3000/api` (confirm actual port).
- Use an Axios instance in `src/api/client.ts`, with centralized handling for request errors and authorization headers.
- Use real existing endpoints; do not use mock API data in completed feature pages.
- Known intended endpoints from the backend implementation plan (VERIFY against actual backend):
  - `POST /api/auth/login`, `GET /api/auth/me`
  - `POST /api/employees`, `GET /api/employees`, `GET /api/employees/me`, `GET /api/employees/:id`, `PATCH /api/employees/:id`, `PATCH /api/employees/:id/deactivate`
  - `POST /api/leaves`, `GET /api/leaves/me`, `GET /api/leaves`, `GET /api/leaves/:id`, `PATCH /api/leaves/:id/approve`, `PATCH /api/leaves/:id/reject`, `PATCH /api/leaves/:id/cancel`
  - `POST /api/attendance/check-in`, `POST /api/attendance/check-out`, `GET /api/attendance/me`, `GET /api/attendance/today`, `GET /api/attendance`, `GET /api/attendance/employee/:id`
- Routes listed above describe a *plan*, not verified implemented contracts; align parameter names, payloads, pagination, errors, and response shapes with running backend.
- Avoid duplicating `/api` when constructing URLs: if `VITE_API_BASE_URL` ends in `/api`, request paths should look like `/auth/login`.
- Explain CORS requirements to the backend owner: local Vite origin usually `http://localhost:5173`, and production origin must be configured explicitly.

## Authentication and permissions
- Use the real JWT login endpoint and real `/auth/me` endpoint.
- For initial version, keep the access token **in memory** (e.g. AuthContext). Do not persist token in localStorage/sessionStorage. Browser refresh requires login again; this is intentional.
- Attach `Authorization: Bearer <token>` to protected requests.
- Handle `401` by clearing the session and directing the user to login; handle `403` with an access-denied message.
- Display correct ADMIN/EMPLOYEE navigation; route guards improve UI but **backend authorization is the security boundary**.
- Never log access tokens, passwords, or sensitive API responses. Never expose server secrets in `VITE_` variables.
- Do not add refresh-token behavior unless the backend implements it and the user requests it.

## UI and accessibility
- Clean, professional, responsive dashboard. Light theme with restrained blue/neutral colors.
- Consistent spacing, typography, input labels, keyboard focus states, and adequate contrast.
- Include loading, empty, validation-error, API-error, and success states.
- Avoid elaborate animations, unnecessary charts, and fabricated dashboard metrics.
- Use semantic HTML and accessible form controls.

## TypeScript and React quality
- Prefer function components, hooks, explicit API types, and small, focused files.
- Do not use `any` to sidestep TypeScript errors; narrow unknown error values safely.
- Never mutate React state directly.
- Keep components responsible for rendering; API modules for requests; hooks/Query for asynchronous data.
- Do not duplicate business logic already enforced by backend; basic client-side validation is for UX.
- Reuse existing conventions; do not refactor unrelated code during a phase.

## Documentation and environment
- Maintain `.env.example` with `VITE_API_BASE_URL=http://localhost:3000/api` (example only).
- `.env` should be ignored by Git; never commit credentials or access tokens.
- Update `README.md` with install/run steps, backend startup prerequisite, environment variables, available routes, and testing notes.
- GitHub repo stays independent from the backend repo; link to the backend repo in README when known.

## Validation before finishing a phase
- Run `npm run build` and existing lint/tests/typecheck scripts as available; report actual outcomes.
- If dependencies or backend are unavailable, clearly say what could not be verified.
- Brief completion report: features, changed files, how to test, caveats, next phase.
- **Stop after the requested phase**. Do not implement later phases early.
