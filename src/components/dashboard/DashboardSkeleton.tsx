export function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Loading dashboard" className="animate-pulse">
      <div className="h-4 w-28 rounded bg-slate-200" />
      <div className="mt-4 h-9 w-full max-w-md rounded bg-slate-200" />
      <div className="mt-3 h-4 w-full max-w-xl rounded bg-slate-200" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="h-40 rounded-2xl border border-slate-200 bg-white p-6">
            <div className="h-4 w-28 rounded bg-slate-200" />
            <div className="mt-5 h-9 w-16 rounded bg-slate-200" />
            <div className="mt-5 h-3 w-36 rounded bg-slate-100" />
          </div>
        ))}
      </div>
      <div className="mt-8 h-72 rounded-2xl border border-slate-200 bg-white" />
      <span className="sr-only">Loading dashboard data…</span>
    </div>
  )
}
