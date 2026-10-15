import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { CalendarClock } from 'lucide-react'
import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getAdminAttendance, getEmployeeAttendance } from '../api/attendance.api'
import { getAllEmployees } from '../api/employees.api'
import { AttendanceTable } from '../components/attendance/AttendanceTable'
import { DashboardError } from '../components/dashboard/DashboardError'
import { Pagination } from '../components/ui/Pagination'
import { getApiErrorMessage } from '../utils/apiError'

const PAGE_SIZE = 10

export function AdminAttendancePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const pageParam = Number(searchParams.get('page') ?? '1')
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1
  const employeeId = searchParams.get('employeeId') ?? ''
  const employeesQuery = useQuery({
    queryKey: ['attendance', 'admin', 'employees'],
    queryFn: getAllEmployees,
  })
  const attendanceQuery = useQuery({
    queryKey: ['attendance', 'admin', employeeId || 'all', { page }],
    queryFn: () => employeeId
      ? getEmployeeAttendance(employeeId, { page, limit: PAGE_SIZE })
      : getAdminAttendance({ page, limit: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  })
  const data = attendanceQuery.data

  useEffect(() => {
    if (data && data.pagination.totalPages > 0 && page > data.pagination.totalPages) {
      const params: Record<string, string> = { page: String(data.pagination.totalPages) }
      if (employeeId) params.employeeId = employeeId
      setSearchParams(params, { replace: true })
    }
  }, [data, employeeId, page, setSearchParams])

  const changeEmployee = (nextEmployeeId: string) => {
    setSearchParams(nextEmployeeId ? { employeeId: nextEmployeeId } : {})
  }
  const changePage = (nextPage: number) => {
    const params: Record<string, string> = { page: String(nextPage) }
    if (employeeId) params.employeeId = employeeId
    setSearchParams(params)
  }

  return (
    <div>
      <header>
        <p className="mb-2 text-sm font-semibold text-blue-700">Administration</p>
        <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Attendance management</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Review recorded employee sessions. This is a read-only view, and times are shown in your local time zone.
        </p>
      </header>

      <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <label htmlFor="attendance-employee-filter" className="block text-sm font-semibold text-slate-700">Employee</label>
        <select
          id="attendance-employee-filter"
          value={employeeId}
          disabled={employeesQuery.isPending}
          onChange={(event) => changeEmployee(event.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-wait disabled:bg-slate-50 sm:max-w-md"
        >
          <option value="">All employees</option>
          {(employeesQuery.data ?? []).map((employee) => (
            <option key={employee.id} value={employee.id}>{employee.fullName} — {employee.department}</option>
          ))}
        </select>
        {employeesQuery.isError && <p role="alert" className="mt-2 text-sm text-red-700">Employee filter unavailable: {getApiErrorMessage(employeesQuery.error)}</p>}
        <p className="mt-2 text-xs leading-5 text-slate-500">Selecting an employee uses the API’s employee-specific attendance history endpoint.</p>
      </div>

      <section aria-labelledby="admin-attendance-heading" className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
          <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><CalendarClock className="size-5" aria-hidden="true" /></span>
          <div>
            <h2 id="admin-attendance-heading" className="font-semibold text-slate-950">{employeeId ? 'Employee attendance history' : 'All attendance sessions'}</h2>
            <p className="mt-1 text-sm text-slate-500">Most recent check-ins appear first.</p>
          </div>
        </div>
        {attendanceQuery.isPending ? (
          <div role="status" aria-label="Loading attendance records" className="animate-pulse divide-y divide-slate-100">
            {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-18 bg-white" />)}
            <span className="sr-only">Loading attendance records…</span>
          </div>
        ) : attendanceQuery.isError ? (
          <div className="p-5"><DashboardError message={getApiErrorMessage(attendanceQuery.error)} onRetry={() => void attendanceQuery.refetch()} /></div>
        ) : data ? (
          <>
            <AttendanceTable
              records={data.data}
              showEmployee={!employeeId}
              emptyTitle={employeeId ? 'No attendance for this employee' : 'No attendance records'}
              emptyDescription={employeeId ? 'This employee has no recorded sessions.' : 'Employee check-ins will appear here.'}
            />
            <Pagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              totalItems={data.pagination.total}
              itemLabel="sessions"
              ariaLabel="Attendance management pages"
              onPageChange={changePage}
            />
          </>
        ) : null}
      </section>
    </div>
  )
}
