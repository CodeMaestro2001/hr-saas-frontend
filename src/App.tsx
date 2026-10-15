import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { RoleRoute } from './components/auth/RoleRoute'
import { DashboardSkeleton } from './components/dashboard/DashboardSkeleton'
import { AppLayout } from './components/layout/AppLayout'
import { AuthProvider } from './contexts/AuthProvider'
import { useAuth } from './hooks/useAuth'
import { AccessDeniedPage } from './pages/AccessDeniedPage'
import { LoginPage } from './pages/LoginPage'

const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const AddEmployeePage = lazy(() => import('./pages/AddEmployeePage').then((module) => ({ default: module.AddEmployeePage })))
const EmployeeDetailsPage = lazy(() => import('./pages/EmployeeDetailsPage').then((module) => ({ default: module.EmployeeDetailsPage })))
const EmployeesPage = lazy(() => import('./pages/EmployeesPage').then((module) => ({ default: module.EmployeesPage })))
const MyProfilePage = lazy(() => import('./pages/MyProfilePage').then((module) => ({ default: module.MyProfilePage })))
const LeavePage = lazy(() => import('./pages/LeavePage').then((module) => ({ default: module.LeavePage })))
const RequestLeavePage = lazy(() => import('./pages/RequestLeavePage').then((module) => ({ default: module.RequestLeavePage })))
const AdminLeavePage = lazy(() => import('./pages/AdminLeavePage').then((module) => ({ default: module.AdminLeavePage })))
const LeaveDetailsPage = lazy(() => import('./pages/LeaveDetailsPage').then((module) => ({ default: module.LeaveDetailsPage })))
const AttendancePage = lazy(() => import('./pages/AttendancePage').then((module) => ({ default: module.AttendancePage })))
const AdminAttendancePage = lazy(() => import('./pages/AdminAttendancePage').then((module) => ({ default: module.AdminAttendancePage })))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth()

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/login" element={<LoginPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Suspense fallback={<DashboardSkeleton />}><DashboardPage /></Suspense>} />
                <Route path="/access-denied" element={<AccessDeniedPage />} />

                <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
                  <Route path="/employees" element={<Suspense fallback={<DashboardSkeleton />}><EmployeesPage /></Suspense>} />
                  <Route path="/employees/new" element={<Suspense fallback={<DashboardSkeleton />}><AddEmployeePage /></Suspense>} />
                  <Route path="/employees/:employeeId" element={<Suspense fallback={<DashboardSkeleton />}><EmployeeDetailsPage /></Suspense>} />
                  <Route path="/leave-management" element={<Suspense fallback={<DashboardSkeleton />}><AdminLeavePage /></Suspense>} />
                  <Route path="/leave-management/:leaveId" element={<Suspense fallback={<DashboardSkeleton />}><LeaveDetailsPage /></Suspense>} />
                  <Route path="/attendance-management" element={<Suspense fallback={<DashboardSkeleton />}><AdminAttendancePage /></Suspense>} />
                </Route>

                <Route element={<RoleRoute allowedRoles={['EMPLOYEE']} />}>
                  <Route path="/profile" element={<Suspense fallback={<DashboardSkeleton />}><MyProfilePage /></Suspense>} />
                  <Route path="/leaves" element={<Suspense fallback={<DashboardSkeleton />}><LeavePage /></Suspense>} />
                  <Route path="/leaves/new" element={<Suspense fallback={<DashboardSkeleton />}><RequestLeavePage /></Suspense>} />
                  <Route path="/leaves/:leaveId" element={<Suspense fallback={<DashboardSkeleton />}><LeaveDetailsPage /></Suspense>} />
                  <Route path="/attendance" element={<Suspense fallback={<DashboardSkeleton />}><AttendancePage /></Suspense>} />
                </Route>
              </Route>
            </Route>

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
