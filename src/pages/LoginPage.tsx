import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, ArrowRight, BriefcaseBusiness, LoaderCircle, LockKeyhole } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useAuth } from '../hooks/useAuth'
import { getApiErrorMessage } from '../utils/apiError'

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

interface LoginLocationState {
  from?: string
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [apiError, setApiError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null)

    try {
      await login(values)
      const state = location.state as LoginLocationState | null
      const destination = state?.from?.startsWith('/') ? state.from : '/dashboard'
      navigate(destination, { replace: true })
    } catch (error) {
      setApiError(getApiErrorMessage(error))
    }
  })

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,1fr)_minmax(28rem,0.8fr)]">
      <section className="relative hidden overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between" aria-label="About Workforce Management">
        <div className="absolute -right-32 -top-28 size-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-28 size-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-blue-600 shadow-lg shadow-blue-950">
            <BriefcaseBusiness className="size-6" aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold tracking-wide">Workforce</p>
            <p className="text-sm text-slate-400">Management Portal</p>
          </div>
        </div>

        <div className="relative max-w-xl pb-12">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">One connected workplace</p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
            Your workforce tools, in one clear workspace.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
            Sign in securely to access the tools available for your assigned role.
          </p>
        </div>

        <p className="relative text-sm text-slate-500">Workforce Management</p>
      </section>

      <section className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-9 lg:hidden">
            <span className="mb-5 grid size-11 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
              <BriefcaseBusiness className="size-6" aria-hidden="true" />
            </span>
            <p className="text-sm font-semibold text-slate-500">Workforce Management</p>
          </div>

          <div className="mb-8">
            <div className="mb-5 grid size-12 place-items-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700">
              <LockKeyhole className="size-6" aria-hidden="true" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">Welcome back.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Enter your account details to continue.</p>
          </div>

          {apiError && (
            <div role="alert" className="mb-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <p>{apiError}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={onSubmit} noValidate>
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-800">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                placeholder="name@company.com"
                {...register('email')}
              />
              {errors.email && <p id="email-error" className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-800">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'password-error' : undefined}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                placeholder="Enter your password"
                {...register('password')}
              />
              {errors.password && <p id="password-error" className="mt-1.5 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-65"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="size-4" aria-hidden="true" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs leading-5 text-slate-500">
            Contact your administrator if you need help accessing your account.
          </p>
        </div>
      </section>
    </main>
  )
}
