import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { resetPasswordRequest } from '../api/auth.api'
import { AuthPageShell } from '../components/auth/AuthPageShell'
import { getApiErrorMessage } from '../utils/apiError'
import { resetPasswordSchema } from '../validation/auth'

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')?.trim() ?? ''
  const [apiError, setApiError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  const onSubmit = handleSubmit(async ({ newPassword }) => {
    if (!token) return
    setApiError(null)
    try {
      await resetPasswordRequest({ token, newPassword })
      navigate('/login', { replace: true, state: { passwordChanged: true } })
    } catch (error) {
      setApiError(getApiErrorMessage(error))
    }
  })

  return (
    <AuthPageShell title="Choose a new password" description="Use a unique password with at least 12 characters. Reset links can be used only once.">
      {!token ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">This password reset link is incomplete. Request a new link and try again.</div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          {apiError && <div role="alert" className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertCircle className="size-5 shrink-0" aria-hidden="true" />{apiError}</div>}
          <PasswordField id="new-password" label="New password" error={errors.newPassword?.message} registration={register('newPassword')} />
          <PasswordField id="confirm-password" label="Confirm new password" error={errors.confirmPassword?.message} registration={register('confirmPassword')} />
          <button type="submit" disabled={isSubmitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60">
            {isSubmitting && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
            Update password
          </button>
        </form>
      )}
      <Link to="/login" className="mt-6 inline-flex text-sm font-semibold text-blue-700 hover:underline">Return to sign in</Link>
    </AuthPageShell>
  )
}

interface PasswordFieldProps {
  id: string
  label: string
  error?: string
  registration: UseFormRegisterReturn
}

function PasswordField({ id, label, error, registration }: PasswordFieldProps) {
  const errorId = `${id}-error`
  return <div><label htmlFor={id} className="mb-2 block text-sm font-semibold text-slate-800">{label}</label><input id={id} type="password" autoComplete="new-password" aria-invalid={Boolean(error)} aria-describedby={error ? errorId : undefined} {...registration} className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100" />{error && <p id={errorId} className="mt-1.5 text-sm text-red-600">{error}</p>}</div>
}
