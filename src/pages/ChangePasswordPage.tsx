import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, LoaderCircle, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { changePasswordRequest } from '../api/auth.api'
import { useAuth } from '../hooks/useAuth'
import { getApiErrorMessage } from '../utils/apiError'
import { changePasswordSchema } from '../validation/auth'

type ChangePasswordValues = z.infer<typeof changePasswordSchema>

export function ChangePasswordPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [apiError, setApiError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const onSubmit = handleSubmit(async ({ currentPassword, newPassword }) => {
    setApiError(null)
    try {
      await changePasswordRequest({ currentPassword, newPassword })
      await logout()
      navigate('/login', { replace: true, state: { passwordChanged: true } })
    } catch (error) {
      setApiError(getApiErrorMessage(error))
    }
  })

  return (
    <div className="max-w-2xl">
      <header>
        <p className="mb-2 text-sm font-semibold text-blue-700">Account security</p>
        <h2 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Change password</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">Changing your password signs out every active session, including this one.</p>
      </header>

      <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-6 flex items-start gap-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-950">
          <ShieldCheck className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <p className="leading-6">Use at least 12 characters and avoid reusing a password from another service.</p>
        </div>
        {apiError && <div role="alert" className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertCircle className="size-5 shrink-0" aria-hidden="true" />{apiError}</div>}
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <PasswordField id="current-password" label="Current password" autoComplete="current-password" error={errors.currentPassword?.message} registration={register('currentPassword')} />
          <PasswordField id="security-new-password" label="New password" autoComplete="new-password" error={errors.newPassword?.message} registration={register('newPassword')} />
          <PasswordField id="security-confirm-password" label="Confirm new password" autoComplete="new-password" error={errors.confirmPassword?.message} registration={register('confirmPassword')} />
          <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60">
            {isSubmitting && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
            Change password
          </button>
        </form>
      </section>
    </div>
  )
}

interface PasswordFieldProps {
  id: string
  label: string
  autoComplete: string
  error?: string
  registration: UseFormRegisterReturn
}

function PasswordField({ id, label, autoComplete, error, registration }: PasswordFieldProps) {
  const errorId = `${id}-error`
  return <div><label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-800">{label}</label><input id={id} type="password" autoComplete={autoComplete} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} {...registration} className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100" />{error && <p id={errorId} className="mt-1.5 text-sm text-red-600">{error}</p>}</div>
}
