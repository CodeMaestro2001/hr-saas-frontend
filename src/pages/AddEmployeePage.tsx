import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createEmployee } from '../api/employees.api'
import { EmployeeForm } from '../components/employees/EmployeeForm'
import type { CreateEmployeeInput, UpdateEmployeeInput } from '../types/workforce'
import { getApiErrorMessage } from '../utils/apiError'

export function AddEmployeePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [apiError, setApiError] = useState<string | null>(null)
  const mutation = useMutation({ mutationFn: createEmployee })

  const handleSubmit = async (input: CreateEmployeeInput | UpdateEmployeeInput) => {
    setApiError(null)
    try {
      const employee = await mutation.mutateAsync(input as CreateEmployeeInput)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['employees'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'admin', 'employees'] }),
      ])
      navigate(`/employees/${employee.id}`, {
        replace: true,
        state: { notice: `${employee.fullName} was added successfully.` },
      })
    } catch (error) {
      setApiError(getApiErrorMessage(error))
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/employees" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to employees
      </Link>
      <header className="mb-7 mt-5">
        <p className="mb-2 text-sm font-semibold text-blue-700">Employee management</p>
        <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Add employee</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Create an employee profile and their initial login account.</p>
      </header>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" aria-label="New employee information">
        <EmployeeForm
          mode="create"
          isSubmitting={mutation.isPending}
          apiError={apiError}
          onSubmit={handleSubmit}
        />
      </section>
    </div>
  )
}
