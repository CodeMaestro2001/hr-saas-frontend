# Workforce Management Frontend

A React and TypeScript frontend for the existing Workforce Management API in `D:\hr-managemt`. Phases F1–F5 include JWT authentication, role-aware dashboards, employee management, leave workflows, and attendance tracking.

## Requirements

- Node.js 20 or newer
- npm
- The backend API and its PostgreSQL database running locally

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Confirm the API URL in `.env`:

   ```dotenv
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

   The configured value includes `/api`, so frontend requests use paths such as `/auth/login` rather than repeating the prefix.

4. Start the backend from `D:\hr-managemt` by following its README. Apply migrations and run its seed command if the demo accounts do not exist.

5. Start the frontend:

   ```bash
   npm run dev
   ```

   Vite normally serves the application at `http://localhost:5173`.

## CORS requirement

The backend must explicitly allow the frontend origin. For local development, allow `http://localhost:5173`; add the exact deployed frontend origin for production. The current backend inspected during Phase F1 does not configure CORS, so browser login will be blocked until CORS middleware is enabled there.

Do not use a wildcard origin when credentials or other sensitive cross-origin behavior is enabled. The access token is sent in the `Authorization` header, so that header and the required HTTP methods must be allowed.

## Vercel deployment

The root `vercel.json` rewrites direct requests such as `/login`, `/dashboard`, and `/attendance` to `index.html`, allowing React Router to resolve the route after a browser refresh. Set `VITE_API_BASE_URL` in the Vercel project environment and redeploy whenever that value changes.

## Available routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/login` | Public | Email/password sign-in |
| `/dashboard` | Authenticated | Role-aware application shell |
| `/employees` | ADMIN | Searchable, paginated employee directory |
| `/employees/new` | ADMIN | Add an employee and login account |
| `/employees/:employeeId` | ADMIN | View, edit, or deactivate an employee |
| `/profile` | EMPLOYEE | Read-only personal employee profile |
| `/leaves` | EMPLOYEE | Personal leave request history |
| `/leaves/new` | EMPLOYEE | Submit a leave request |
| `/leaves/:leaveId` | EMPLOYEE owner | View or cancel an owned request |
| `/leave-management` | ADMIN | Filtered, paginated leave review queue |
| `/leave-management/:leaveId` | ADMIN | Review leave details and approve or reject |
| `/attendance` | EMPLOYEE | Check in/out and review personal attendance |
| `/attendance-management` | ADMIN | Read-only workforce attendance and employee filtering |
| `/access-denied` | Authenticated | Permission error explanation |

Unknown routes return to the dashboard, which redirects unauthenticated users to login.

## Authentication behavior

- Login uses `POST /api/auth/login` and verifies the session with `GET /api/auth/me`.
- The JWT is held in memory only and attached as a Bearer token by the shared Axios client.
- Refreshing the browser clears the session and requires a new login by design.
- A `401` response clears the authenticated session; backend error messages and permission failures are shown in a user-friendly form.
- Navigation labels reflect the authenticated `ADMIN` or `EMPLOYEE` role. Backend authorization remains the security boundary.

## Dashboards

The dashboard route selects the correct experience from the `/auth/me` role:

- Administrators see exact total/active employee counts, the exact pending-leave count, and the five latest attendance sessions.
- Employees see their profile details, current attendance state for the backend's UTC day, exact pending-leave count, and their five latest leave requests.
- Dashboard data uses role-permitted backend endpoints through TanStack Query, with loading, retry, error, and empty states.
- Quick navigation links lead to the employee, leave, and attendance pages allowed for each role.

## Employee management

- Administrators can search the server-side employee directory, move through paginated results, add employees, view details, edit supported fields, and confirm deactivation.
- Employees can view only their own read-only profile through `/employees/me`.
- Forms match the backend's field lengths and date format and show both client validation and API errors.
- Successful mutations invalidate employee directory and dashboard data through TanStack Query.
- Frontend role guards provide clear navigation and access-denied states; the backend remains the authorization boundary.
- Deactivation is one-way in the current API. No reactivation behavior is offered by the frontend.

## Leave management

- Employees can submit annual, sick, or casual leave with inclusive date-only boundaries and a reason.
- Employees can view only their own requests and cancel only requests that are still pending.
- Administrators can view all requests, filter by status, paginate results, inspect details, and approve or reject pending requests.
- Approval, rejection, and cancellation require confirmation. `409` state conflicts and overlapping-date errors remain visible with the backend message, and affected queries are refreshed.
- Dates are sent as `YYYY-MM-DD` without browser timezone conversion. Displayed leave dates are formatted using UTC so the calendar date does not shift.
- Successful mutations refresh leave lists, details, and the relevant dashboard cards through TanStack Query.

## Attendance management

- Active employees can check in and check out through the bodyless backend action endpoints. The browser never creates or submits attendance times.
- Current status and today’s sessions come from `/attendance/today`; personal history is paginated through `/attendance/me`.
- Administrators have a read-only, paginated workforce view and can use the employee selector backed by `/attendance/employee/:id`.
- UTC timestamps are formatted in the viewer’s local time zone. Duration displays use the backend’s `workedMinutes`, including overnight sessions; the frontend does not calculate overtime or payroll.
- Successful actions and `409` conflicts refresh attendance and dashboard queries. `401` continues to clear the in-memory session, while `403` is presented as an access error.

## Checks

```bash
npm run typecheck
npm test
npm run lint
npm run build
```

To verify Phase F5 manually, sign in as an active employee and open `/attendance`. Check in, confirm the open session and local timestamp, then check out and confirm the backend-provided worked time. Move through personal history pages. Sign in as an administrator, open `/attendance-management`, paginate all sessions, and select an employee to use the employee-specific history endpoint. Confirm each role receives the access-denied page for the other role’s attendance route.

## Security notes

- Never place secrets in a `VITE_` variable; Vite exposes these values to the browser.
- `.env` files are ignored, while `.env.example` is committed as documentation.
- Passwords and access tokens are not logged or persisted in browser storage.
