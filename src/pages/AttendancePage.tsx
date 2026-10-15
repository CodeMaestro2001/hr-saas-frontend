import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarClock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { checkIn, checkOut, getMyAttendance, getMyTodayAttendance } from '../api/attendance.api'
import { AttendanceStatusCard } from '../components/attendance/AttendanceStatusCard'
import { AttendanceTable } from '../components/attendance/AttendanceTable'
import { DashboardError } from '../components/dashboard/DashboardError'
import { Pagination } from '../components/ui/Pagination'
import { getApiErrorMessage } from '../utils/apiError'
import { invalidateAttendanceQueries } from '../utils/attendanceQueries'
import { getAttendanceState } from '../utils/dashboard'

const PAGE_SIZE = 10

function AttendanceTableSkeleton() {
  return (
    <div role="status" aria-label="Loading attendance" className="animate-pulse divide-y divide-slate-100">
      {Array.from({ length: 5 }, (_, index) => <div key={index} className="h-18 bg-white" />)}
      <span className="sr-only">Loading attendance…</span>
    </div>
  )
}

export function AttendancePage() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const pageParam = Number(searchParams.get('page') ?? '1')
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1
  const [notice, setNotice] = useState<string | null>(null)

  const todayQuery = useQuery({
    queryKey: ['attendance', 'me', 'today'],
    queryFn: getMyTodayAttendance,
  })
  const historyQuery = useQuery({
    queryKey: ['attendance', 'me', 'history', { page }],
    queryFn: () => getMyAttendance({ page, limit: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  })
  const attendanceMutation = useMutation({
    mutationFn: (action: 'check-in' | 'check-out') => action === 'check-in' ? checkIn() : checkOut(),
    onSuccess: async (_, action) => {
      setNotice(action === 'check-in' ? 'You are checked in.' : 'You are checked out.')
      await invalidateAttendanceQueries(queryClient)
    },
    onError: async () => {
      await invalidateAttendanceQueries(queryClient)
    },
  })
  const history = historyQuery.data

  useEffect(() => {
    if (history && history.pagination.totalPages > 0 && page > history.pagination.totalPages) {
      setSearchParams({ page: String(history.pagination.totalPages) }, { replace: true })
    }
  }, [history, page, setSearchParams])

  const attendanceState = getAttendanceState(todayQuery.data ?? [])
  const runAttendanceAction = () => {
    setNotice(null)
    attendanceMutation.mutate(attendanceState === 'CHECKED_IN' ? 'check-out' : 'check-in')
  }

  return (
    <div>
      <header>
        <p className="mb-2 text-sm font-semibold text-blue-700">Employee portal</p>
        <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">My attendance</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Check in or out and review your recorded work sessions. Times are shown in your local time zone.
        </p>
      </header>

      {notice && <div role="status" className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</div>}
      {attendanceMutation.isError && (
        <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {getApiErrorMessage(attendanceMutation.error)}
        </div>
      )}

      <div className="mt-7">
        {todayQuery.isPending ? (
          <div role="status" aria-label="Loading current attendance status" className="h-35 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        ) : todayQuery.isError ? (
          <DashboardError message={getApiErrorMessage(todayQuery.error)} onRetry={() => void todayQuery.refetch()} />
        ) : (
          <AttendanceStatusCard records={todayQuery.data} isActionPending={attendanceMutation.isPending} onAction={runAttendanceAction} />
        )}
      </div>

      <section aria-labelledby="today-sessions-heading" className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <h2 id="today-sessions-heading" className="font-semibold text-slate-950">Today’s attendance sessions</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">Sessions overlapping the current UTC day, as defined by the API.</p>
        </div>
        {todayQuery.isPending ? <AttendanceTableSkeleton /> : todayQuery.isError ? (
          <div className="p-5"><p className="text-sm text-red-700">Today’s sessions could not be loaded.</p></div>
        ) : (
          <AttendanceTable records={todayQuery.data} emptyTitle="No sessions today" emptyDescription="Use Check in when you begin work." />
        )}
      </section>

      <section aria-labelledby="attendance-history-heading" className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
          <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><CalendarClock className="size-5" aria-hidden="true" /></span>
          <div>
            <h2 id="attendance-history-heading" className="font-semibold text-slate-950">Attendance history</h2>
            <p className="mt-1 text-sm text-slate-500">Your most recent sessions appear first.</p>
          </div>
        </div>
        {historyQuery.isPending ? <AttendanceTableSkeleton /> : historyQuery.isError ? (
          <div className="p-5"><DashboardError message={getApiErrorMessage(historyQuery.error)} onRetry={() => void historyQuery.refetch()} /></div>
        ) : history ? (
          <>
            <AttendanceTable records={history.data} />
            <Pagination
              page={history.pagination.page}
              totalPages={history.pagination.totalPages}
              totalItems={history.pagination.total}
              itemLabel="sessions"
              ariaLabel="My attendance history pages"
              onPageChange={(nextPage) => setSearchParams({ page: String(nextPage) })}
            />
          </>
        ) : null}
      </section>
    </div>
  )
}
