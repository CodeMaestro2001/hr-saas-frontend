# PROJECT_PLAN.md — Workforce Management Frontend

## Goal
Create a small, polished React + TypeScript application that connects to the existing Node.js Workforce Management API. Keep this frontend in a **separate Git repository**: `workforce-management-frontend`. Focus on basic end-to-end workflows relevant to a backend-oriented Associate Software Engineer interview.

## Scope and assumptions
- Backend is a separate running service using Node.js, Express, TypeScript, PostgreSQL and Prisma.
- Authentication uses JWT and ADMIN/EMPLOYEE roles.
- Backend phases 1–5 were planned for authentication, employee management, leave requests and attendance; **actual implementation and API contracts must be verified before connecting**.
- No new backend endpoints should be invented to make the UI work. If data is unavailable, use a clear empty or unavailable state and document the gap.
- Prefer fewer working, tested screens over many superficial pages.

## Technology
React + TypeScript + Vite, React Router, Tailwind CSS, Axios, TanStack Query, React Hook Form + Zod, Lucide React.

## Planned folder structure
```text
workforce-management-frontend/
  public/
  src/
    api/
      client.ts
      auth.api.ts
      employees.api.ts
      leaves.api.ts
      attendance.api.ts
    components/
      layout/
      ui/
    contexts/
    hooks/
    pages/
    types/
    utils/
    App.tsx
    main.tsx
  .env.example
  AGENTS.md
  PROJECT_PLAN.md
  README.md
  package.json
  vite.config.ts
```
Only create files when they become useful.

## Phase F1 — Foundation and authentication
**Objective:** Run the Vite app, implement secure-enough demo authentication, and provide a reusable layout.

Tasks:
1. Inspect existing Vite project and dependencies; configure Tailwind CSS and React Router.
2. Add centralized Axios client with `VITE_API_BASE_URL`.
3. Confirm backend login and current-user JSON contracts from actual code/docs.
4. Build responsive login page with email/password validation, loading state, and clear errors.
5. Add AuthContext with in-memory JWT and Bearer token handling; on refresh, user logs in again.
6. Build protected routes and ADMIN/EMPLOYEE-aware sidebar/nav, logout and basic dashboard shell.
7. Handle 401, 403, unavailable backend, and unknown errors gracefully.
8. Update `.env.example`, `.gitignore` and README; run build and available checks.

**Done when:** Valid login reaches a protected dashboard; invalid login shows an error; logout works; refresh requires new login; TypeScript build passes. No invented dashboard statistics.

## Phase F2 — Dashboard
**Objective:** Create a useful role-aware landing page without unnecessary complexity.

Tasks:
1. Display current user's name/email and role from `/auth/me`.
2. Show navigation/actions relevant to ADMIN vs EMPLOYEE.
3. Add simple, factual cards or recent lists only when existing backend endpoints support them (e.g. personal recent leaves/attendance).
4. Show loading, empty and error states; do not fabricate counts.
5. Polish responsiveness and reuse components.

**Done when:** Both roles see meaningful, correctly permissioned pages using real API responses.

## Phase F3 — Employee management
**Objective:** Implement employee workflows while respecting authorization.

Tasks:
1. Confirm exact endpoint paths, input types, outputs and paging contract.
2. ADMIN: list employees with basic pagination/search (when supported), view details, create, edit and deactivate.
3. EMPLOYEE: view own profile (`/employees/me`).
4. Use React Hook Form + Zod for create/edit forms; show field and backend errors.
5. Confirm deactivation action and refresh list cache after mutations.

**Done when:** ADMIN can complete the real workflows and EMPLOYEE cannot access admin UI; backend retains final authorization responsibility.

## Phase F4 — Leave management
**Objective:** Enable employees to request leave and admins to review it.

Tasks:
1. EMPLOYEE: submit leave request with leave type, start/end date and reason; list own requests; cancel pending request.
2. ADMIN: list requests with optional status filter, inspect details, approve/reject pending requests.
3. Match backend rules for validation, ownership and state transitions.
4. Handle date-only input without accidental timezone shifts.
5. After mutations, refresh TanStack Query data and show feedback.

**Done when:** Employee request → admin decision → employee views updated status works end-to-end.

## Phase F5 — Attendance management
**Objective:** Build a clear employee attendance workflow and admin overview.

Tasks:
1. EMPLOYEE: check in/out, see current session and personal history.
2. Show timestamps in a clearly indicated display timezone; backend timestamps remain UTC.
3. ADMIN: see employee attendance history and basic pagination if supported.
4. Prevent obvious repeated clicks in UI but rely on backend for concurrency protection.
5. Explain working minutes and empty/open sessions; no payroll/overtime logic.

**Done when:** Check-in → check-out → history is demonstrable; unauthorized actions are unavailable.

## Phase F6 — Quality and deployment
**Objective:** Make the application presentable and reliably demoable.

Tasks:
1. Review responsive layouts, accessible labels, error feedback, empty states and loading states.
2. Add focused frontend tests for auth, protected navigation, and critical forms (choose tooling appropriate to current code).
3. Add GitHub Actions CI to install dependencies and run build/lint/tests that exist.
4. Document backend/frontend startup, environment configuration, demo flows and screenshots (if supplied or captured legitimately).
5. Prepare deployment on a static hosting platform (e.g. Vercel) **only if requested**, configuring API base URL and backend CORS appropriately.
6. Verify that secrets are absent and no fake data is shown as real.

**Done when:** Production build succeeds, CI checks run, README is complete, and main demo flows work against the real backend.

## Local development
```bash
npm install
npm run dev
```
Example `.env` (match the actual backend port):
```dotenv
VITE_API_BASE_URL=http://localhost:3000/api
```
Run backend and its PostgreSQL database separately. The React app typically runs on `http://localhost:5173`. Ensure backend CORS allows that origin during development.

## Codex workflow
At the start of each phase, tell Codex:
> Read AGENTS.md and PROJECT_PLAN.md. Inspect the existing source. Implement **Phase Fx only**. Preserve existing working behavior, do not invent backend contracts, run available checks, summarize files changed and manual verification steps, then STOP.

## Interview discussion topics
React components, hooks, Context API, JWT and HTTP authorization, CORS, Axios interceptors, loading/error states, role-based UI vs backend authorization, REST APIs, TypeScript types, frontend/backend Git workflows and CI/CD.
