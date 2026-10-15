import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, UserMinus } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { deactivateEmployee, getEmployee, updateEmployee } from '../api/employees.api'
import { DashboardError } from '../components/dashboard/DashboardError'
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton'
import { EmployeeForm } from '../components/employees/EmployeeForm'
import { EmployeeProfileDetails } from '../components/employees/EmployeeProfileDetails'
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog'
import type { CreateEmployeeInput, UpdateEmployeeInput } from '../types/workforce'
import { getApiErrorMessage } from '../utils/apiError'

interface DetailsLocationState {
  notice?: string
}

export function EmployeeDetailsPage() {
  const { employeeId = '' } = useParams()
  const location = useLocation()
  const queryClient = useQueryClient()
  const initialNotice = (location.state as DetailsLocationState | null)?.notice ?? null
  const [notice, setNotice] = useState<string | null>(initialNotice)
  const [editError, setEditError] = useState<string | null>(null)
  const [isConfirmingDeactivate, setIsConfirmingDeactivate] = useState(false)
  const [deactivateError, setDeactivateError] = useState<string | null>(null)

  const employeeQuery = useQuery({
    queryKey: ['employees', 'detail', employeeId],
    queryFn: () => getEmployee(employeeId),
    enabled: Boolean(employeeId),
  })
  const updateMutation = useMutation({
    mutationFn: (input: UpdateEmployeeInput) => updateEmployee(employeeId, input),
  })
  const deactivateMutation = useMutation({
    mutationFn: () => deactivateEmployee(employeeId),
  })

  const refreshEmployeeQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['employees'] }),
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin', 'employees'] }),
    ])
  }

  const handleUpdate = async (input: CreateEmployeeInput | UpdateEmployeeInput) => {
    setEditError(null)
    setNotice(null)
    try {
      const employee = await updateMutation.mutateAsync(input as UpdateEmployeeInput)
      queryClient.setQueryData(['employees', 'detail', employeeId], employee)
      await refreshEmployeeQueries()
      setNotice('Employee details were updated successfully.')
    } catch (error) {
      setEditError(getApiErrorMessage(error))
    }
  }

  const handleDeactivate = async () => {
    setDeactivateError(null)
    try {
      const employee = await deactivateMutation.mutateAsync()
      queryClient.setQueryData(['employees', 'detail', employeeId], employee)
      await refreshEmployeeQueries()
      setIsConfirmingDeactivate(false)
      setNotice(`${employee.fullName} was deactivated.`)
    } catch (error) {
      setDeactivateError(getApiErrorMessage(error))
    }
  }

  const closeConfirmation = useCallback(() => {
    if (!deactivateMutation.isPending) {
      setIsConfirmingDeactivate(false)
      setDeactivateError(null)
    }
  }, [deactivateMutation.isPending])

  if (employeeQuery.isPending) return <DashboardSkeleton />
  if (employeeQuery.isError) {
    return <DashboardError message={getApiErrorMessage(employeeQuery.error)} onRetry={() => void employeeQuery.refetch()} />
  }

  const employee = employeeQuery.data
  if (!employee) return null

  return (
    <div className="mx-auto max-w-5xl">
      <Link to="/employees" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to employees
      </Link>
      <header className="mb-7 mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-blue-700">Employee management</p>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Employee details</h2>
        </div>
        {employee.isActive && (
          <button
            type="button"
            onClick={() => setIsConfirmingDeactivate(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            <UserMinus className="size-4" aria-hidden="true" />
            Deactivate employee
          </button>
        )}
      </header>

      {notice && <div role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</div>}
      <EmployeeProfileDetails employee={employee} />

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="edit-employee-title">
        <div className="mb-6">
          <h3 id="edit-employee-title" className="text-lg font-semibold text-slate-950">Edit employee</h3>
          <p className="mt-1 text-sm text-slate-500">Update the fields supported by the employee API.</p>
        </div>
        <EmployeeForm
          key={employee.updatedAt}
          mode="edit"
          employee={employee}
          isSubmitting={updateMutation.isPending}
          apiError={editError}
          onSubmit={handleUpdate}
        />
      </section>

      <ConfirmationDialog
        isOpen={isConfirmingDeactivate}
        title={`Deactivate ${employee.fullName}?`}
        description="They will no longer be able to sign in or access protected employee features. The backend does not currently provide a reactivation action."
        confirmLabel="Deactivate"
        pendingLabel="Deactivating…"
        isPending={deactivateMutation.isPending}
        error={deactivateError}
        onConfirm={() => void handleDeactivate()}
        onCancel={closeConfirmation}
      />
    </div>
  )
}
