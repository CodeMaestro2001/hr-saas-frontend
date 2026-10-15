import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Plus, Search, Users } from 'lucide-react'
import { type FormEvent, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getEmployees } from '../api/employees.api'
import { DashboardError } from '../components/dashboard/DashboardError'
import { EmployeeStatusBadge } from '../components/employees/EmployeeStatusBadge'
import { Pagination } from '../components/ui/Pagination'
import { getApiErrorMessage } from '../utils/apiError'

const PAGE_SIZE = 10

function DirectorySkeleton() {
  return (
    <div role="status" aria-label="Loading employees" className="animate-pulse divide-y divide-slate-100">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="grid grid-cols-4 gap-6 px-6 py-5">
          <div className="h-4 rounded bg-slate-200" />
          <div className="h-4 rounded bg-slate-100" />
          <div className="h-4 rounded bg-slate-100" />
          <div className="h-4 rounded bg-slate-100" />
        </div>
      ))}
      <span className="sr-only">Loading employees…</span>
    </div>
  )
}

export function EmployeesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const pageParam = Number(searchParams.get('page') ?? '1')
  const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1
  const search = searchParams.get('search')?.trim() ?? ''

  const employeesQuery = useQuery({
    queryKey: ['employees', 'list', { page, search }],
    queryFn: () => getEmployees({ page, limit: PAGE_SIZE, search: search || undefined }),
    placeholderData: keepPreviousData,
  })

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const nextSearch = String(formData.get('search') ?? '').trim()
    setSearchParams(nextSearch ? { search: nextSearch } : {})
  }

  const changePage = (nextPage: number) => {
    const params: Record<string, string> = { page: String(nextPage) }
    if (search) params.search = search
    setSearchParams(params)
  }

  const data = employeesQuery.data

  useEffect(() => {
    if (data && data.pagination.totalPages > 0 && page > data.pagination.totalPages) {
      const params: Record<string, string> = { page: String(data.pagination.totalPages) }
      if (search) params.search = search
      setSearchParams(params, { replace: true })
    }
  }, [data, page, search, setSearchParams])

  return (
    <div>
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-blue-700">Administration</p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Employee directory</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Search, review, and manage employee accounts.</p>
        </div>
        <Link
          to="/employees/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <Plus className="size-4" aria-hidden="true" />
          Add employee
        </Link>
      </header>

      <form onSubmit={handleSearch} role="search" className="mt-8 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="employee-search" className="sr-only">Search employees by name</label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            key={search}
            id="employee-search"
            name="search"
            type="search"
            defaultValue={search}
            placeholder="Search by employee name"
            maxLength={100}
            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Search
        </button>
      </form>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {employeesQuery.isPending ? (
          <DirectorySkeleton />
        ) : employeesQuery.isError ? (
          <div className="p-5 sm:p-6">
            <DashboardError message={getApiErrorMessage(employeesQuery.error)} onRetry={() => void employeesQuery.refetch()} />
          </div>
        ) : data && data.data.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-180 border-collapse text-left">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Employee</th>
                    <th scope="col" className="px-6 py-3.5">Department</th>
                    <th scope="col" className="px-6 py-3.5">Job title</th>
                    <th scope="col" className="px-6 py-3.5">Status</th>
                    <th scope="col" className="px-6 py-3.5 text-right"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.data.map((employee) => (
                    <tr key={employee.id} className="transition hover:bg-slate-50/70">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{employee.fullName}</p>
                        <p className="mt-1 text-xs text-slate-500">{employee.email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{employee.department}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{employee.jobTitle}</td>
                      <td className="px-6 py-4"><EmployeeStatusBadge isActive={employee.isActive} /></td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/employees/${employee.id}`}
                          className="text-sm font-semibold text-blue-700 hover:text-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={data.pagination.page}
              totalPages={data.pagination.totalPages}
              totalItems={data.pagination.total}
              onPageChange={changePage}
            />
          </>
        ) : (
          <div className="px-6 py-16 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
              <Users className="size-6" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-sm font-semibold text-slate-900">{search ? 'No matching employees' : 'No employees yet'}</h3>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">
              {search ? 'Try a different name or clear the search.' : 'Add the first employee to begin building the directory.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
