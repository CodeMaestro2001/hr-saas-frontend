import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export interface QuickAction {
  label: string
  description: string
  href: string
  icon: ReactNode
}

interface QuickActionsProps {
  actions: QuickAction[]
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <section aria-labelledby="quick-actions-title">
      <div className="mb-4">
        <h3 id="quick-actions-title" className="text-lg font-semibold text-slate-950">Quick navigation</h3>
        <p className="mt-1 text-sm text-slate-500">Jump to the information you need.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            to={action.href}
            className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700" aria-hidden="true">
              {action.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-slate-900">{action.label}</span>
              <span className="mt-0.5 block text-xs text-slate-500">{action.description}</span>
            </span>
            <ArrowRight className="size-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-blue-600" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  )
}
