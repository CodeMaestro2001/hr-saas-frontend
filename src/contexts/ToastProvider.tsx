import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react'
import { ToastContext, type ToastInput, type ToastTone } from './toast-context'

interface ToastItem extends ToastInput { id: number; tone: ToastTone }

const toneClasses: Record<ToastTone, string> = {
  success: 'border-emerald-200 text-emerald-900',
  error: 'border-red-200 text-red-900',
  info: 'border-blue-200 text-blue-900',
}

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(1)
  const dismiss = useCallback((id: number) => setToasts((items) => items.filter((item) => item.id !== id)), [])
  const showToast = useCallback((input: ToastInput) => {
    const id = nextId.current++
    setToasts((items) => [...items.slice(-2), { ...input, id, tone: input.tone ?? 'info' }])
    window.setTimeout(() => dismiss(id), 5_000)
  }, [dismiss])
  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-end gap-3 sm:inset-x-auto sm:right-5 sm:w-96" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => {
          const Icon = icons[toast.tone]
          return (
            <div key={toast.id} role={toast.tone === 'error' ? 'alert' : 'status'} className={`pointer-events-auto flex w-full gap-3 rounded-xl border bg-white p-4 shadow-lg ${toneClasses[toast.tone]}`}>
              <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
              <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{toast.title}</p>{toast.description && <p className="mt-1 text-sm opacity-80">{toast.description}</p>}</div>
              <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification" className="rounded-md p-1 opacity-60 hover:bg-slate-100 hover:opacity-100"><X className="size-4" aria-hidden="true" /></button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
