import { AlertCircle, RotateCcw } from 'lucide-react'

interface DashboardErrorProps {
  message: string
  onRetry: () => void
}

export function DashboardError({ message, onRetry }: DashboardErrorProps) {
  return (
    <div role="alert" className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="grid size-11 place-items-center rounded-xl bg-red-50 text-red-700">
        <AlertCircle className="size-5" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-slate-950">Dashboard data is unavailable</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <RotateCcw className="size-4" aria-hidden="true" />
        Try again
      </button>
    </div>
  )
}
