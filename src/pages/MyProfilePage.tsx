import { useQuery } from '@tanstack/react-query'
import { getEmployeeProfile } from '../api/employees.api'
import { DashboardError } from '../components/dashboard/DashboardError'
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton'
import { EmployeeProfileDetails } from '../components/employees/EmployeeProfileDetails'
import { getApiErrorMessage } from '../utils/apiError'

export function MyProfilePage() {
  const profileQuery = useQuery({
    queryKey: ['employees', 'me'],
    queryFn: getEmployeeProfile,
  })

  if (profileQuery.isPending) return <DashboardSkeleton />
  if (profileQuery.isError) {
    return <DashboardError message={getApiErrorMessage(profileQuery.error)} onRetry={() => void profileQuery.refetch()} />
  }

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-7">
        <p className="mb-2 text-sm font-semibold text-blue-700">Employee portal</p>
        <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">My profile</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Your employee information is read-only. Contact an administrator if it needs updating.</p>
      </header>
      <EmployeeProfileDetails employee={profileQuery.data} />
    </div>
  )
}
