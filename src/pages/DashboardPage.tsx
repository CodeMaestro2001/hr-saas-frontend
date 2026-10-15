import { useAuth } from '../hooks/useAuth'
import { AdminDashboardPage } from './AdminDashboardPage'
import { EmployeeDashboardPage } from './EmployeeDashboardPage'

export function DashboardPage() {
  const { user } = useAuth()

  return user?.role === 'ADMIN' ? <AdminDashboardPage /> : <EmployeeDashboardPage />
}
