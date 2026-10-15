import { AlertTriangle, CircleCheck, LoaderCircle, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface ConfirmationDialogProps {
  isOpen: boolean
  title: string
  description: string
  confirmLabel: string
  pendingLabel?: string
  tone?: 'danger' | 'positive'
  isPending?: boolean
  error?: string | null
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmationDialog({
  isOpen,
  title,
  description,
  confirmLabel,
  pendingLabel = 'Processing…',
  tone = 'danger',
  isPending = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    cancelButtonRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isPending) onCancel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isPending, onCancel])

  if (!isOpen) return null

  const isPositive = tone === 'positive'

  return (
    <div className="fixed inset-0 z-60 grid place-items-center bg-slate-950/50 px-4 backdrop-blur-sm" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
        aria-describedby="confirmation-description"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {isPositive
              ? <CircleCheck className="size-5" aria-hidden="true" />
              : <AlertTriangle className="size-5" aria-hidden="true" />}
          </span>
          <button
            type="button"
            aria-label="Close confirmation"
            disabled={isPending}
            onClick={onCancel}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <h2 id="confirmation-title" className="mt-5 text-lg font-semibold text-slate-950">{title}</h2>
        <p id="confirmation-description" className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            ref={cancelButtonRef}
            type="button"
            disabled={isPending}
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-65 ${isPositive ? 'bg-emerald-600 hover:bg-emerald-700 focus-visible:outline-emerald-600' : 'bg-red-600 hover:bg-red-700 focus-visible:outline-red-600'}`}
          >
            {isPending && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
            {isPending ? pendingLabel : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
