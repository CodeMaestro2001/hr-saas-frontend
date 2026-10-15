import { BriefcaseBusiness, CalendarDays, Clock3, LayoutDashboard, UserRound, Users, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user } = useAuth()
  const workspaceLabel = user?.role === 'ADMIN' ? 'Admin workspace' : 'Employee workspace'

  return (
    <>
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-950 text-white shadow-xl transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-18 items-center justify-between border-b border-white/10 px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-600 shadow-lg shadow-blue-950/40">
              <BriefcaseBusiness className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold tracking-wide">Workforce</p>
              <p className="truncate text-xs text-slate-400">Management</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close navigation"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 lg:hidden"
            onClick={onClose}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="px-5 pb-3 pt-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{workspaceLabel}</p>
        </div>

        <nav className="flex-1 space-y-1 px-3" aria-label="Primary navigation">
          <NavLink
            to="/dashboard"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-white/8 hover:text-white'
              }`
            }
          >
            <LayoutDashboard className="size-5" aria-hidden="true" />
            Dashboard
          </NavLink>
          {user?.role === 'ADMIN' ? (
            <>
              <NavLink
                to="/employees"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-white/8 hover:text-white'
                  }`
                }
              >
                <Users className="size-5" aria-hidden="true" />
                Employees
              </NavLink>
              <NavLink
                to="/leave-management"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-white/8 hover:text-white'
                  }`
                }
              >
                <CalendarDays className="size-5" aria-hidden="true" />
                Leave requests
              </NavLink>
              <NavLink
                to="/attendance-management"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-white/8 hover:text-white'
                  }`
                }
              >
                <Clock3 className="size-5" aria-hidden="true" />
                Attendance
              </NavLink>
            </>
          ) : (
            <>
              <NavLink
                to="/profile"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-white/8 hover:text-white'
                  }`
                }
              >
                <UserRound className="size-5" aria-hidden="true" />
                My profile
              </NavLink>
              <NavLink
                to="/leaves"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-white/8 hover:text-white'
                  }`
                }
              >
                <CalendarDays className="size-5" aria-hidden="true" />
                My leave
              </NavLink>
              <NavLink
                to="/attendance"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-white/8 hover:text-white'
                  }`
                }
              >
                <Clock3 className="size-5" aria-hidden="true" />
                My attendance
              </NavLink>
            </>
          )}
        </nav>

        <div className="border-t border-white/10 p-5">
          <p className="text-xs leading-5 text-slate-500">
            Signed in to the {user?.role === 'ADMIN' ? 'management' : 'self-service'} portal
          </p>
        </div>
      </aside>
    </>
  )
}
