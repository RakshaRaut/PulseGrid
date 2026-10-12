import clsx from 'clsx'
import WifiIcon from 'lucide-react/dist/esm/icons/wifi'
import WifiOffIcon from 'lucide-react/dist/esm/icons/wifi-off'
import WrenchIcon from 'lucide-react/dist/esm/icons/wrench'
import CpuIcon from 'lucide-react/dist/esm/icons/cpu'
import ZapIcon from 'lucide-react/dist/esm/icons/zap'
import LeafIcon from 'lucide-react/dist/esm/icons/leaf'
import ThermometerIcon from 'lucide-react/dist/esm/icons/thermometer'

const STATUS_STYLES = {
  online: {
    chip: 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30',
    dot: 'bg-emerald-400 animate-pulse-dot',
    icon: WifiIcon,
    label: 'Online',
  },
  offline: {
    chip: 'bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/30',
    dot: 'bg-rose-400',
    icon: WifiOffIcon,
    label: 'Offline',
  },
  maintenance: {
    chip: 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30',
    dot: 'bg-amber-400 animate-pulse-dot',
    icon: WrenchIcon,
    label: 'Maintenance',
  },
}

export const statusOptions = [
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
  { value: 'maintenance', label: 'Maintenance' },
]

export function StatusChip({ status, size = 'md', className }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.offline
  const Icon = s.icon
  const sizes = {
    sm: 'px-2 py-0.5 text-[11px] gap-1.5',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  }
  const dotSizes = { sm: 'h-1.5 w-1.5', md: 'h-1.5 w-1.5', lg: 'h-2 w-2' }
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium whitespace-nowrap',
        sizes[size],
        s.chip,
        className,
      )}
    >
      <span className={clsx('rounded-full', dotSizes[size], s.dot)} aria-hidden="true" />
      <Icon size={size === 'lg' ? 14 : 12} aria-hidden="true" />
      {s.label}
    </span>
  )
}

const TYPE_ICONS = {
  Environmental: LeafIcon,
  Energy: ZapIcon,
  Industrial: CpuIcon,
  Climate: ThermometerIcon,
}

export const typeOptions = Object.keys(TYPE_ICONS).map((t) => ({ value: t, label: t }))

export function TypeIcon({ type, size = 16, className }) {
  const Icon = TYPE_ICONS[type] ?? CpuIcon
  return <Icon size={size} className={className} aria-hidden="true" />
}

const HISTORY_ICON = {
  online: { icon: WifiIcon, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  offline: { icon: WifiOffIcon, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  maintenance: { icon: WrenchIcon, color: 'text-amber-400', bg: 'bg-amber-500/10' },
}

export function HistoryIcon({ type, size = 16 }) {
  const cfg = HISTORY_ICON[type] ?? HISTORY_ICON.offline
  const Icon = cfg.icon
  return (
    <span className={clsx('flex h-8 w-8 items-center justify-center rounded-full', cfg.bg)}>
      <Icon size={size} className={cfg.color} aria-hidden="true" />
    </span>
  )
}
