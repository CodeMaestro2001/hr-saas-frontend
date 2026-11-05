import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, ArrowLeft, LoaderCircle, MailCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { forgotPasswordRequest } from '../api/auth.api'
import { AuthPageShell } from '../components/auth/AuthPageShell'
import { getApiErrorMessage } from '../utils/apiError'
import { forgotPasswordSchema } from '../validation/auth'

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = handleSubmit(async ({ email }) => {
    setApiError(null)
    try {
      const response = await forgotPasswordRequest(email)
      setMessage(response.message)
    } catch (error) {
      setApiError(getApiErrorMessage(error))
    }
  })

  return (
    <AuthPageShell title="Reset your password" description="Enter your account email. For security, the response is the same whether or not an account exists.">
      {message ? (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
          <MailCheck className="mb-3 size-5" aria-hidden="true" />
          <p className="font-semibold">Check your email</p>
          <p className="mt-1 leading-6">{message}</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          {apiError && <div role="alert" className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertCircle className="size-5 shrink-0" aria-hidden="true" />{apiError}</div>}
          <label htmlFor="forgot-email" className="mb-2 block text-sm font-semibold text-slate-800">Email address</label>
          <input id="forgot-email" type="email" autoComplete="email" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'forgot-email-error' : undefined} {...register('email')} className="w-full rounded-xl border border-slate-300 px-3.5 py-3 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100" />
          {errors.email && <p id="forgot-email-error" className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>}
          <button type="submit" disabled={isSubmitting} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-60">
            {isSubmitting && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
            Send reset link
          </button>
        </form>
      )}
      <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"><ArrowLeft className="size-4" aria-hidden="true" />Back to sign in</Link>
    </AuthPageShell>
  )
}
