import { Link } from 'react-router-dom'
import Activity from 'lucide-react/dist/esm/icons/activity'
import Database from 'lucide-react/dist/esm/icons/database'
import Bell from 'lucide-react/dist/esm/icons/bell'
import Gauge from 'lucide-react/dist/esm/icons/gauge'

const points = [
  { Icon: Gauge, text: 'Live sensor telemetry for every connected device' },
  { Icon: Database, text: 'Historical readings stored and charted automatically' },
  { Icon: Bell, text: 'Instant alerts when a device drops offline' },
]

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand / marketing panel */}
      <section className="relative hidden overflow-hidden bg-surface lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 bottom-0 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl"
        />
        <div className="relative">
          <Link to="/login" className="inline-flex items-center gap-2 text-white">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent shadow-md shadow-indigo-900/50">
              <Activity size={20} />
            </span>
            <span className="text-lg font-bold tracking-tight">PulseGrid</span>
          </Link>
        </div>
        <div className="relative max-w-md">
          <h1 className="text-3xl font-bold leading-tight text-white xl:text-4xl">
            Monitor every device in your fleet — from one dashboard.
          </h1>
          <ul className="mt-8 space-y-4">
            {points.map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card ring-1 ring-border">
                  <Icon size={16} className="text-indigo-300" aria-hidden="true" />
                </span>
                <span className="text-sm text-slate-300">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-slate-500">© 2026 PulseGrid. All rights reserved.</p>
      </section>

      {/* Form panel */}
      <section className="flex items-center justify-center bg-surface-2/40 px-4 py-10 sm:px-8">
        <div className="animate-fade-up w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <Activity size={18} />
            </span>
            <span className="font-bold text-white">PulseGrid</span>
          </div>
          <div className="rounded-2xl border border-border bg-card/70 p-6 shadow-xl shadow-black/30 backdrop-blur sm:p-8">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
            {children}
          </div>
          {footer && <div className="mt-6 text-center text-sm text-slate-400">{footer}</div>}
        </div>
      </section>
    </div>
  )
}
