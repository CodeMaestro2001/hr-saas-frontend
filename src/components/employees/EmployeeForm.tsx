import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import type { CreateEmployeeInput, Employee, UpdateEmployeeInput } from '../../types/workforce'
import {
  employeeFormSchema,
  type EmployeeFormInput,
  type EmployeeFormValues,
} from '../../validation/employee'

interface EmployeeFormProps {
  mode: 'create' | 'edit'
  employee?: Employee
  isSubmitting: boolean
  apiError?: string | null
  successMessage?: string | null
  onSubmit: (input: CreateEmployeeInput | UpdateEmployeeInput) => Promise<void>
}

interface FormFieldProps {
  id: string
  label: string
  error?: string
  children: React.ReactNode
}

function FormField({ id, label, error, children }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-800">{label}</label>
      {children}
      {error && <p id={`${id}-error`} className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  )
}

const inputClasses = 'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500'

export function EmployeeForm({
  mode,
  employee,
  isSubmitting,
  apiError,
  successMessage,
  onSubmit,
}: EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmployeeFormInput, unknown, EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: mode === 'create'
      ? {
          mode: 'create',
          fullName: '',
          email: '',
          password: '',
          department: '',
          jobTitle: '',
          hireDate: '',
        }
      : {
          mode: 'edit',
          fullName: employee?.fullName ?? '',
          email: employee?.email ?? '',
          password: '',
          department: employee?.department ?? '',
          jobTitle: employee?.jobTitle ?? '',
          hireDate: employee?.hireDate.slice(0, 10) ?? '',
        },
  })

  const submit = handleSubmit(async (values) => {
    const commonValues: UpdateEmployeeInput = {
      email: values.email.toLowerCase(),
      fullName: values.fullName,
      department: values.department,
      jobTitle: values.jobTitle,
      hireDate: values.hireDate,
    }

    await onSubmit(values.mode === 'create'
      ? { ...commonValues, password: values.password }
      : commonValues)
  })

  return (
    <form onSubmit={submit} noValidate className="space-y-6">
      {apiError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {apiError}
        </div>
      )}
      {successMessage && (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          {successMessage}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="fullName" label="Full name" error={errors.fullName?.message}>
          <input
            id="fullName"
            type="text"
            autoComplete="name"
            placeholder="Nimal Perera"
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
            disabled={isSubmitting}
            className={inputClasses}
            {...register('fullName')}
          />
        </FormField>

        <FormField id="email" label="Email address" error={errors.email?.message}>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="name@company.com"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            disabled={isSubmitting}
            className={inputClasses}
            {...register('email')}
          />
        </FormField>

        {mode === 'create' && (
          <FormField id="password" label="Initial password" error={errors.password?.message}>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : 'password-help'}
              disabled={isSubmitting}
              className={inputClasses}
              {...register('password')}
            />
            {!errors.password && <p id="password-help" className="mt-1.5 text-xs text-slate-500">8–72 characters. Share it securely with the employee.</p>}
          </FormField>
        )}

        <FormField id="department" label="Department" error={errors.department?.message}>
          <input
            id="department"
            type="text"
            placeholder="Engineering"
            aria-invalid={Boolean(errors.department)}
            aria-describedby={errors.department ? 'department-error' : undefined}
            disabled={isSubmitting}
            className={inputClasses}
            {...register('department')}
          />
        </FormField>

        <FormField id="jobTitle" label="Job title" error={errors.jobTitle?.message}>
          <input
            id="jobTitle"
            type="text"
            placeholder="Software Engineer"
            aria-invalid={Boolean(errors.jobTitle)}
            aria-describedby={errors.jobTitle ? 'jobTitle-error' : undefined}
            disabled={isSubmitting}
            className={inputClasses}
            {...register('jobTitle')}
          />
        </FormField>

        <FormField id="hireDate" label="Hire date" error={errors.hireDate?.message}>
          <input
            id="hireDate"
            type="date"
            aria-invalid={Boolean(errors.hireDate)}
            aria-describedby={errors.hireDate ? 'hireDate-error' : undefined}
            disabled={isSubmitting}
            className={inputClasses}
            {...register('hireDate')}
          />
        </FormField>
      </div>

      <div className="flex justify-end border-t border-slate-100 pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-65"
        >
          {isSubmitting ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
          {isSubmitting ? 'Saving…' : mode === 'create' ? 'Add employee' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}
