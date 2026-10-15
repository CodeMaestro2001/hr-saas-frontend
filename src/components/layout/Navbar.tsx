import { LogOut, Menu } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

interface NavbarProps {
  onOpenSidebar: () => void
}

export function Navbar({ onOpenSidebar }: NavbarProps) {
  const { logout, user } = useAuth()
  const { pathname } = useLocation()
  const pageTitle = pathname === '/attendance'
    ? 'My attendance'
    : pathname === '/attendance-management'
      ? 'Attendance management'
      : pathname === '/employees'
    ? 'Employees'
    : pathname === '/employees/new'
      ? 'Add employee'
      : pathname.startsWith('/employees/')
        ? 'Employee details'
        : pathname === '/profile'
          ? 'My profile'
          : pathname === '/leaves/new'
            ? 'Request leave'
            : pathname.startsWith('/leaves/')
              ? 'Leave request details'
              : pathname === '/leaves'
                ? 'My leave'
                : pathname.startsWith('/leave-management/')
                  ? 'Leave request details'
                  : pathname === '/leave-management'
                    ? 'Leave management'
                    : 'Dashboard'

  return (
    <header className="sticky top-0 z-30 flex h-18 items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <button
        type="button"
        aria-label="Open navigation"
        className="mr-3 rounded-lg p-2 text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 lg:hidden"
        onClick={onOpenSidebar}
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden text-right sm:block">
          <p className="max-w-56 truncate text-sm font-medium text-slate-800">{user?.email}</p>
          <p className="text-xs font-medium text-slate-500">
            {user?.role === 'ADMIN' ? 'Administrator' : 'Employee'}
          </p>
        </div>
        <div className="grid size-9 place-items-center rounded-full bg-blue-100 text-sm font-bold text-blue-700" aria-hidden="true">
          {user?.email.charAt(0).toUpperCase()}
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          <LogOut className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Sign out</span>
          <span className="sr-only sm:hidden">Sign out</span>
        </button>
      </div>
    </header>
  )
}
