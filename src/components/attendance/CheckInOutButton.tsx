import { LogIn, LogOut, LoaderCircle } from 'lucide-react'

interface CheckInOutButtonProps {
  isCheckedIn: boolean
  isPending: boolean
  onClick: () => void
}

export function CheckInOutButton({ isCheckedIn, isPending, onClick }: CheckInOutButtonProps) {
  const label = isCheckedIn ? 'Check out' : 'Check in'
  const Icon = isCheckedIn ? LogOut : LogIn

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto ${
        isCheckedIn
          ? 'bg-slate-900 hover:bg-slate-800 focus-visible:outline-slate-900'
          : 'bg-blue-600 hover:bg-blue-700 focus-visible:outline-blue-600'
      }`}
    >
      {isPending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Icon className="size-4" aria-hidden="true" />}
      {isPending ? `${label}...` : label}
    </button>
  )
}
