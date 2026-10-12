import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Link, Outlet, useLocation, useNavigate, matchPath } from 'react-router-dom'
import clsx from 'clsx'
import Activity from 'lucide-react/dist/esm/icons/activity'
import LayoutDashboard from 'lucide-react/dist/esm/icons/layout-dashboard'
import Cpu from 'lucide-react/dist/esm/icons/cpu'
import Menu from 'lucide-react/dist/esm/icons/menu'
import X from 'lucide-react/dist/esm/icons/x'
import SearchIcon from 'lucide-react/dist/esm/icons/search'
import Bell from 'lucide-react/dist/esm/icons/bell'
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down'
import LogOut from 'lucide-react/dist/esm/icons/log-out'
import OffX from 'lucide-react/dist/esm/icons/x'
import { useAuth } from '../../context/auth.jsx'
import { StatusChip } from '../ui/badges.jsx'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/devices', label: 'Devices', Icon: Cpu },
]

const TAB_TITLES = [
  { path: '/dashboard', title: 'Dashboard' },
  { path: '/devices', title: 'Devices' },
  { path: '/devices/:id', title: 'Device details' },
]

function useOutsideClick(ref, cb) {
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) cb()
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [ref, cb])
}

export default function Layout() {
  const { user, devices = [], logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const searchRef = useRef(null)
  const notifRef = useRef(null)
  const accountRef = useRef(null)
  const itemRefs = useRef({})

  useOutsideClick(searchRef, () => setDropdownOpen(false))
  useOutsideClick(notifRef, () => setNotifOpen(false))
  useOutsideClick(accountRef, () => setAccountOpen(false))

  // Focus search input on Ctrl/Cmd+K
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        itemRefs.current.search?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const pageMeta = useMemo(() => {
    const hit = TAB_TITLES.find((t) => matchPath(t.path, location.pathname))
    return hit ? hit.title : 'PulseGrid'
  }, [location.pathname])

  const filteredDevices = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return devices
      .filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q) ||
          (d.type || '').toLowerCase().includes(q) ||
          (d.location || '').toLowerCase().includes(q),
      )
      .slice(0, 6)
  }, [query, devices])

  const offlineDevices = useMemo(() => devices.filter((d) => d.status === 'offline'), [devices])

  // Close mobile sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  if (!user) return null

  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-surface/95 backdrop-blur transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0 shadow-2xl shadow-black/50' : '-translate-x-full',
        )}
        aria-label="Main navigation"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-border px-5">
            <Link to="/dashboard" className="flex items-center gap-2 text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent shadow-md shadow-indigo-900/50">
                <Activity size={18} />
              </span>
              <span className="text-base font-bold tracking-tight">PulseGrid</span>
            </Link>
            <button
              type="button"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-surface-2 hover:text-white lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <OffX size={18} />
            </button>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Menu</p>
            {NAV.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  clsx(
                    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                    isActive
                      ? 'bg-accent/15 text-accent-hover ring-1 ring-accent/30'
                      : 'text-slate-400 hover:bg-surface-2 hover:text-white',
                  )
                }
              >
                <Icon size={18} aria-hidden="true" />
                {label}
              </NavLink>
            ))}
            <p className="px-3 pt-6 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">Fleet health</p>
            <div className="rounded-xl bg-card/70 p-3 ring-1 ring-border">
              <p className="text-xs text-slate-400">Fleet status</p>
              <p className="mt-1 flex items-center gap-2">
                <StatusChip status="online" size="sm" />
                <span className="text-xs text-slate-500">{devices.filter((d) => d.status === 'online').length} online</span>
              </p>
              {offlineDevices.length > 0 && (
                <p className="mt-2 text-[11px] text-rose-300">{offlineDevices.length} device(s) offline</p>
              )}
            </div>
          </nav>
          <div className="border-t border-border p-4 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/20 text-sm font-bold text-accent-hover">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user.name}</p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-surface/85 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-400 hover:bg-surface-2 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <h1 className="hidden text-base font-semibold text-white sm:block">{pageMeta}</h1>

          <div ref={searchRef} className="relative ml-auto w-full max-w-sm">
            <label htmlFor="global-search" className="sr-only">
              Search devices
            </label>
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <SearchIcon size={15} />
            </span>
            <input
              id="global-search"
              ref={(el) => (itemRefs.current.search = el)}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setDropdownOpen(true)
              }}
              onFocus={() => setDropdownOpen(!!query)}
              placeholder="Search devices…"
              className="w-full rounded-xl border border-border bg-surface-2/70 py-2 pl-9 pr-16 text-sm text-white placeholder:text-slate-500 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
              autoComplete="off"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-border px-1.5 py-0.5 text-[10px] text-slate-500">
              ⌘K
            </kbd>
            {dropdownOpen && filteredDevices.length > 0 && (
              <ul className="animate-fade-up absolute right-0 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/50">
                {filteredDevices.map((d) => (
                  <li key={d.id}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-surface-2"
                      onClick={() => {
                        setQuery('')
                        setDropdownOpen(false)
                        navigate(`/devices/${d.id}`)
                      }}
                    >
                      <span className="truncate">
                        <span className="font-medium text-white">{d.name}</span>
                        <span className="ml-2 text-xs text-slate-500">{d.id}</span>
                      </span>
                      <StatusChip status={d.status} size="sm" />
                    </button>
                  </li>
                ))}
                <li className="border-t border-border px-4 py-2 text-center text-xs text-slate-500">
                  Showing {filteredDevices.length} of {devices.length} devices
                </li>
              </ul>
            )}
          </div>

          <div ref={notifRef} className="relative">
            <button
              type="button"
              className="relative rounded-xl p-2 text-slate-400 transition hover:bg-surface-2 hover:text-white"
              onClick={() => setNotifOpen((o) => !o)}
              aria-label="Notifications"
            >
              <Bell size={19} />
              {offlineDevices.length > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-surface" aria-hidden="true" />
              )}
            </button>
            {notifOpen && (
              <div className="animate-fade-up absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-card shadow-2xl shadow-black/50">
                <div className="border-b border-border px-4 py-3">
                  <p className="text-sm font-semibold text-white">Notifications</p>
                </div>
                {offlineDevices.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-slate-400">All devices reporting normally 🎉</p>
                ) : (
                  <ul className="max-h-64 overflow-y-auto">
                    {offlineDevices.map((d) => (
                      <li key={d.id}>
                        <button
                          type="button"
                          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-2"
                          onClick={() => {
                            setNotifOpen(false)
                            navigate(`/devices/${d.id}`)
                          }}
                        >
                          <span className="h-2 w-2 shrink-0 rounded-full bg-rose-400" aria-hidden="true" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm text-white">{d.name} went offline</span>
                            <span className="block text-xs text-slate-500">{d.id} · {d.location}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div ref={accountRef} className="relative">
            <button
              type="button"
              onClick={() => setAccountOpen((o) => !o)}
              className="flex items-center gap-2 rounded-xl p-1.5 pr-2 transition hover:bg-surface-2"
              aria-label="Account menu"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/20 text-xs font-bold text-accent-hover">
                {initials}
              </span>
              <ChevronDown size={14} className="hidden text-slate-400 sm:block" />
            </button>
            {accountOpen && (
              <div className="animate-fade-up absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-1.5 shadow-2xl shadow-black/50">
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                </div>
                <div className="my-1 h-px bg-border" />
                <button
                  type="button"
                  onClick={() => {
                    setAccountOpen(false)
                    logout()
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-300 transition hover:bg-rose-500/10"
                >
                  <LogOut size={15} aria-hidden="true" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
