import { forwardRef, useId } from 'react'
import clsx from 'clsx'
import AlertCircleIcon from 'lucide-react/dist/esm/icons/alert-circle'

const baseField =
  'w-full rounded-xl border border-border bg-surface-2/80 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 transition focus:border-accent focus:bg-surface-2 focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-50'

export function Field({ label, htmlFor, hint, error, children }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-rose-300" role="alert">
          <AlertCircleIcon size={13} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}

export const Input = forwardRef(function Input({ className, invalid, ...rest }, ref) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={clsx(baseField, invalid && 'border-rose-500/60 focus:border-rose-400 focus:ring-rose-500/30', className)}
      {...rest}
    />
  )
})

export const Select = forwardRef(function Select({ className, invalid, children, ...rest }, ref) {
  return (
    <select
      ref={ref}
      aria-invalid={invalid || undefined}
      className={clsx(baseField, 'appearance-none bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 fill=%27%2394a3b8%27 viewBox=%270 0 16 16%27%3E%3Cpath d=%27M8 11L3 6h10z%27/%3E%3C/svg%3E")] bg-[position:right_0.9rem_center] bg-no-repeat pr-9 [&>option]:bg-surface', invalid && 'border-rose-500/60', className)}
      {...rest}
    >
      {children}
    </select>
  )
})

export function Textarea({ className, invalid, ...rest }) {
  return <textarea className={clsx(baseField, 'resize-none', invalid && 'border-rose-500/60', className)} {...rest} />
}

export function Checkbox({ label, className, ...rest }) {
  const id = useId()
  return (
    <label htmlFor={id} className={clsx('flex cursor-pointer items-center gap-2 text-sm text-slate-300', className)}>
      <input
        id={id}
        type="checkbox"
        className="h-4 w-4 rounded border-border bg-surface-2 text-accent focus:ring-2 focus:ring-accent/40"
        {...rest}
      />
      {label}
    </label>
  )
}

export function Button({ variant = 'primary', size = 'md', className, loading, children, disabled, type = 'button', ...rest }) {
  const variants = {
    primary: 'bg-accent text-white hover:bg-accent-hover focus-visible:ring-accent/50 shadow-md shadow-indigo-900/40',
    secondary: 'bg-surface-2 text-slate-200 hover:bg-card ring-1 ring-border',
    ghost: 'text-slate-300 hover:bg-surface-2 hover:text-white',
    danger: 'bg-rose-600 text-white hover:bg-rose-500',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-sm',
  }
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
      )}
      {children}
    </button>
  )
}
