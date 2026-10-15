import { ShieldX } from 'lucide-react'
import { Link } from 'react-router-dom'

export function AccessDeniedPage() {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-red-50 text-red-700">
        <ShieldX className="size-6" aria-hidden="true" />
      </span>
      <h2 className="mt-5 text-xl font-semibold text-slate-950">Access denied</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">Your account does not have permission to view this page.</p>
      <Link to="/dashboard" className="mt-6 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
        Return to dashboard
      </Link>
    </div>
  )
}
