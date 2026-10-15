export type ActivityTone = 'blue' | 'emerald' | 'amber' | 'red' | 'slate'

export interface ActivityItem {
  id: string
  title: string
  description: string
  meta: string
  status?: string
  tone?: ActivityTone
}

interface RecentActivityProps {
  id?: string
  title: string
  description: string
  items: ActivityItem[]
  emptyTitle: string
  emptyDescription: string
}

const statusClasses: Record<ActivityTone, string> = {
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/15',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  amber: 'bg-amber-50 text-amber-800 ring-amber-600/15',
  red: 'bg-red-50 text-red-700 ring-red-600/15',
  slate: 'bg-slate-100 text-slate-700 ring-slate-600/10',
}

export function RecentActivity({
  id,
  title,
  description,
  items,
  emptyTitle,
  emptyDescription,
}: RecentActivityProps) {
  const titleId = `${id ?? 'recent-activity'}-title`

  return (
    <section id={id} className="scroll-mt-24 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby={titleId}>
      <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
        <h3 id={titleId} className="text-lg font-semibold text-slate-950">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      {items.length === 0 ? (
        <div className="px-5 py-12 text-center sm:px-6">
          <p className="text-sm font-semibold text-slate-800">{emptyTitle}</p>
          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-slate-500">{emptyDescription}</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {items.map((item) => (
            <li key={item.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3 sm:justify-end">
                <span className="text-xs text-slate-500">{item.meta}</span>
                {item.status && (
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClasses[item.tone ?? 'slate']}`}>
                    {item.status}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
