# Workforce Management Frontend

A React and TypeScript frontend for the existing Workforce Management API in `D:\hr-managemt`. It includes production session authentication, role-aware dashboards, employee management, leave workflows, and attendance tracking.

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

The backend must explicitly allow the frontend origin. For local development, allow `http://localhost:5173`; use `https://workforce.tharushadev.online` in production. The API must enable credentialed CORS because the refresh token is an HttpOnly cookie.

Do not use a wildcard origin when credentials or other sensitive cross-origin behavior is enabled. The access token is sent in the `Authorization` header, so that header and the required HTTP methods must be allowed.

## Vercel deployment

The root `vercel.json` rewrites direct requests such as `/login`, `/dashboard`, and `/attendance` to `index.html`, allowing React Router to resolve the route after a browser refresh. Set `VITE_API_BASE_URL` in the Vercel project environment and redeploy whenever that value changes.

The `Frontend CI` GitHub Actions workflow runs typechecking, linting, tests, and a production build for pull requests and pushes to `main`. Vercel remains responsible for deployment through its Git integration: connect `CodeMaestro2001/hr-saas-frontend`, set the production branch to `main`, and configure this production environment variable:

```dotenv
VITE_API_BASE_URL=https://api-workforce.tharushadev.online/api
```

Every push to a non-production branch creates a Vercel preview, while a successful Vercel build from `main` updates the live production domain. Keep the GitHub Actions check required on `main` so changes are validated before they are merged.

## Available routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/login` | Public | Email/password sign-in |
| `/forgot-password` | Public | Request a one-time reset link |
| `/reset-password?token=...` | Public | Choose a new password with a valid reset token |
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
| `/security` | Authenticated | Change password and revoke active sessions |

Unknown routes return to the dashboard, which redirects unauthenticated users to login.

## Authentication behavior

- Login uses `POST /api/auth/login`. The short-lived access JWT is held in memory only and attached as a Bearer token by the shared Axios client.
- The backend places a rotating refresh token in a `Secure`, `HttpOnly`, `SameSite=Strict` cookie. The app restores the session after a browser refresh without exposing that token to JavaScript.
- A protected request that receives `401` attempts one shared refresh and retries once. A failed refresh clears local state and returns to sign-in.
- Logout revokes the current refresh token. Changing or resetting a password revokes all active sessions.
- Forgot-password responses do not reveal whether an email exists. Reset links are single-use and expire according to backend configuration.
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

For authentication verification, sign in, refresh a protected page and confirm the session is restored, then sign out and confirm refresh does not restore it. Request a password reset, use the delivered link once, and confirm an old session is rejected. Finally, change the password from `/security` and confirm all sessions return to sign-in.

## Security notes

- Never place secrets in a `VITE_` variable; Vite exposes these values to the browser.
- `.env` files are ignored, while `.env.example` is committed as documentation.
- Passwords and access tokens are not logged or persisted in browser storage. Refresh tokens are inaccessible to frontend JavaScript.
- Production and local custom-domain setups are same-site. Vercel preview domains are cross-site with the production API, so refresh-cookie sessions are supported on the production custom domain rather than preview domains.
