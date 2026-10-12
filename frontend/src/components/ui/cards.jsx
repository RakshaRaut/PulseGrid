import clsx from 'clsx'

export function Card({ className, children, ...rest }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-border bg-card/80 shadow-lg shadow-black/20 backdrop-blur-sm',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export function SectionHeader({ title, subtitle, action, className }) {
  return (
    <div className={clsx('flex items-start justify-between gap-4', className)}>
      <div>
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

export function StatCard({ icon: Icon, label, value, hint, tone = 'accent', className, onClick }) {
  const tones = {
    accent: 'bg-indigo-500/15 text-indigo-300',
    success: 'bg-emerald-500/15 text-emerald-300',
    danger: 'bg-rose-500/15 text-rose-300',
    warning: 'bg-amber-500/15 text-amber-300',
    neutral: 'bg-slate-500/15 text-slate-300',
  }
  const isButton = typeof onClick === 'function'
  const Comp = isButton ? 'button' : 'div'
  return (
    <Comp
      onClick={isButton ? onClick : undefined}
      className={clsx(
        'flex items-center gap-4 rounded-2xl border border-border bg-card/80 p-4 shadow-lg shadow-black/20 backdrop-blur-sm sm:p-5',
        isButton && 'cursor-pointer text-left transition hover:border-accent-hover/50 hover:bg-card',
        className,
      )}
    >
      <span className={clsx('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', tones[tone])}>
        <Icon size={22} aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-400">{label}</p>
        <p className="mt-0.5 text-2xl font-semibold tracking-tight text-white">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      </div>
    </Comp>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 py-14 text-center">
      {Icon && (
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-500/10 text-slate-400">
          <Icon size={26} aria-hidden="true" />
        </span>
      )}
      <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function Spinner({ size = 20, className }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={clsx(
        'inline-block animate-spin rounded-full border-2 border-slate-500/30 border-t-accent',
        className,
      )}
      style={{ width: size, height: size }}
    />
  )
}

export function PageSkeleton({ bars = 3 }) {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-card/60" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-2xl bg-card/60" />
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-2xl bg-card/60" />
      ))}
    </div>
  )
}
