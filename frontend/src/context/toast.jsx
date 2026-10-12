import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import CheckCircleIcon from 'lucide-react/dist/esm/icons/check-circle'
import XCircleIcon from 'lucide-react/dist/esm/icons/x-circle'
import InfoIcon from 'lucide-react/dist/esm/icons/info'
import XIcon from 'lucide-react/dist/esm/icons/x'

const ToastContext = createContext(null)

let nextId = 1

const ICONS = {
  success: { Icon: CheckCircleIcon, classes: 'text-emerald-400' },
  error: { Icon: XCircleIcon, classes: 'text-rose-400' },
  info: { Icon: InfoIcon, classes: 'text-indigo-300' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const notify = useCallback(
    (message, type = 'success', duration = 4000) => {
      const id = nextId++
      setToasts((t) => [...t, { id, message, type }])
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration)
      }
    },
    [dismiss],
  )

  const value = useMemo(() => ({ notify, dismiss }), [notify, dismiss])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[100] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:items-end"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const { Icon, classes } = ICONS[t.type] ?? ICONS.info
          return (
            <div
              key={t.id}
              role="status"
              className="animate-toast-in pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-xl shadow-black/40 backdrop-blur"
            >
              <Icon size={18} className={classes} aria-hidden="true" />
              <p className="flex-1 text-sm text-slate-200">{t.message}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="rounded-lg p-1 text-slate-500 transition hover:bg-surface-2 hover:text-white"
                aria-label="Dismiss notification"
              >
                <XIcon size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
