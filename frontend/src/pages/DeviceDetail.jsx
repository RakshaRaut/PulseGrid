import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left'
import Cpu from 'lucide-react/dist/esm/icons/cpu'
import Thermometer from 'lucide-react/dist/esm/icons/thermometer'
import Droplets from 'lucide-react/dist/esm/icons/droplets'
import BatteryCharging from 'lucide-react/dist/esm/icons/battery-charging'
import Signal from 'lucide-react/dist/esm/icons/signal'
import MapPin from 'lucide-react/dist/esm/icons/map-pin'
import History from 'lucide-react/dist/esm/icons/history'
import Trash2 from 'lucide-react/dist/esm/icons/trash-2'
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw'
import { useAuth } from '../context/auth.jsx'
import { useToast } from '../context/toast.jsx'
import { Card, SectionHeader, EmptyState, Spinner } from '../components/ui/cards.jsx'
import { StatusChip, TypeIcon, HistoryIcon } from '../components/ui/badges.jsx'
import { Button } from '../components/ui/forms.jsx'
import { TempHumidityChart, BatteryBarChart, BatteryGauge } from '../components/charts/deviceCharts.jsx'
import { formatRelativeTime, formatTemp, formatHumidity, formatBattery } from '../utils/format.js'

function TelemetryCard({ icon: Icon, label, value, unit, tone, sparklineNote }) {
  const tones = {
    orange: 'from-orange-500/15 to-card text-orange-300',
    sky: 'from-sky-500/15 to-card text-sky-300',
    emerald: 'from-emerald-500/15 to-card text-emerald-300',
    rose: 'from-rose-500/15 to-card text-rose-300',
  }
  return (
    <Card className={`bg-gradient-to-br p-5 ${tones[tone]} `}>
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-400">{label}</p>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-surface-2/70 ${tones[tone].split(' ').pop()}`}>
          <Icon size={17} aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight text-white">
        {value}
        {unit && <span className="ml-1 text-base font-semibold text-slate-400">{unit}</span>}
      </p>
      {sparklineNote && <p className="mt-1 text-xs text-slate-500">{sparklineNote}</p>}
    </Card>
  )
}

export default function DeviceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { devices, loading: authLoading, refreshDevices, removeDevice } = useAuth()
  const { notify } = useToast()

  const device = useMemo(() => devices.find((d) => d.id === id), [devices, id])
  const [refreshing, setRefreshing] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const minMax = useMemo(() => {
    if (!device?.series?.length) return null
    const temps = device.series.map((p) => p.temperature).filter((v) => v != null)
    const hums = device.series.map((p) => p.humidity).filter((v) => v != null)
    return {
      tempMin: temps.length ? Math.min(...temps) : null,
      tempMax: temps.length ? Math.max(...temps) : null,
      humMin: hums.length ? Math.min(...hums) : null,
      humMax: hums.length ? Math.max(...hums) : null,
    }
  }, [device])

  if (authLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size={28} />
      </div>
    )
  }

  if (!device) {
    return (
      <EmptyState
        icon={Cpu}
        title="Device not found"
        description={`No device with ID "${id}" exists in your fleet. It may have been removed.`}
        action={
          <Button onClick={() => navigate('/devices')}>
            <ArrowLeft size={15} aria-hidden="true" /> Back to devices
          </Button>
        }
      />
    )
  }

  const offline = device.status === 'offline'

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refreshDevices()
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setRefreshing(false)
    }
  }

  const handleDelete = async () => {
    try {
      await removeDevice(device.id)
      notify(`${device.name} removed from fleet.`, 'info')
      setConfirmOpen(false)
      navigate('/devices')
    } catch (error) {
      notify(error.message, 'error')
    }
  }

  return (
    <div className="animate-fade-up space-y-5">
      {/* Breadcrumb + header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
            <Link to="/devices" className="hover:text-slate-300">Devices</Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-300">{device.deviceKey}</span>
          </nav>
          <div className="mt-2 flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-hover">
              <TypeIcon type={device.type} size={20} />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-white sm:text-2xl">{device.name}</h2>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-400">
                <span className="flex items-center gap-1"><MapPin size={12} aria-hidden="true" /> {device.location}</span>
                <span className="flex items-center gap-1"><Signal size={12} aria-hidden="true" /> {device.signal == null ? 'Unavailable' : `${device.signal}%`}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <StatusChip status={device.status} size="lg" />
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-surface-2/70 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-surface-2 disabled:opacity-50"
            title={offline ? 'Retry telemetry' : 'Refresh telemetry'}
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} aria-hidden="true" />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-rose-300 transition hover:bg-rose-500/20"
            aria-label={`Delete ${device.name}`}
            title="Delete device"
          >
            <Trash2 size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      {!offline && device.live && (
        <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-xs text-emerald-300">
          ● Live — values update every 5 seconds. Last update {formatRelativeTime(new Date(device.live.updatedAt).toISOString())}
        </p>
      )}
      {offline && (
        <p className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-2.5 text-xs text-rose-300">
          ⚠ Device is offline — telemetry readings are stale. Values shown are the last successfully reported readings.
        </p>
      )}
      {!device.live && device.telemetryError && (
        <p className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-2.5 text-xs text-amber-300">
          Telemetry is currently unavailable. {device.telemetryError}
        </p>
      )}
      {!device.live && !device.telemetryError && (
        <p className="rounded-xl border border-slate-500/20 bg-slate-500/5 px-4 py-2.5 text-xs text-slate-400">
          No telemetry has been reported for this device yet.
        </p>
      )}

      {/* Real-time telemetry cards */}
      <section aria-label="Current telemetry" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <TelemetryCard
          icon={Thermometer}
          label="Temperature"
          value={device.live ? formatTemp(device.live.temperature) : '—'} unit=""
          tone="orange"
          sparklineNote={minMax ? `24h range ${minMax.tempMin ?? '—'}° – ${minMax.tempMax ?? '—'}°C` : null}
        />
        <TelemetryCard
          icon={Droplets}
          label="Humidity"
          value={device.live ? formatHumidity(device.live.humidity) : '—'} unit=""
          tone="sky"
          sparklineNote={minMax ? `24h range ${minMax.humMin ?? '—'}% – ${minMax.humMax ?? '—'}%` : null}
        />
        <TelemetryCard
          icon={BatteryCharging}
          label="Battery"
          value={device.live ? formatBattery(device.live.battery) : '—'} unit=""
          tone={device.live?.battery <= 20 ? 'rose' : 'emerald'}
          sparklineNote="Estimated runtime from charge"
        />
        <TelemetryCard
          icon={Signal}
          label="Signal strength"
          value={device.signal == null ? '—' : `${device.signal}%`}
          tone={device.signal >= 60 ? 'emerald' : device.signal >= 30 ? 'sky' : 'rose'}
          sparklineNote={device.signal == null ? 'Not reported by device' : `Last seen ${formatRelativeTime(device.lastSeen)}`}
        />
      </section>

      {/* Charts */}
      <section className="grid gap-4 lg:grid-cols-3" aria-label="Telemetry history">
        <Card className="p-5 lg:col-span-2">
          <SectionHeader title="Temperature & humidity" subtitle="Last 24 hours · 15-minute sampling" />
          <div className="mt-4 h-72">
            <TempHumidityChart data={device.series ?? []} />
          </div>
        </Card>
        <Card className="flex flex-col items-center p-5">
          <SectionHeader title="Battery trend" subtitle="Charge over 24h" className="w-full" />
          <div className="mt-2 w-full max-w-[170px]">
            <BatteryGauge value={device.live ? device.live.battery : 0} size={150} />
          </div>
          <p className="text-2xl font-bold text-white">{device.live ? formatBattery(device.live.battery) : '—'}</p>
          <p className={`text-xs ${device.live?.battery <= 20 ? 'text-rose-300' : device.live?.battery <= 50 ? 'text-amber-300' : 'text-emerald-300'}`}>
            {device.live?.battery <= 20 ? 'Critical — replace soon' : device.live?.battery <= 50 ? 'Moderate draw' : 'Healthy'}
          </p>
          <div className="mt-3 h-28 w-full">
            <BatteryBarChart data={device.series?.slice(-12) ?? []} />
          </div>
        </Card>
      </section>

      {/* Attributes + status history */}
      <section className="grid gap-4 lg:grid-cols-2" aria-label="Device metadata">
        <Card className="p-5">
          <SectionHeader title="Device attributes" subtitle="Static metadata reported by the device" />
          <dl className="mt-4 divide-y divide-border/60">
            {Object.entries(device.attributes ?? {}).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                <dt className="text-slate-400">{k}</dt>
                <dd className="truncate text-right font-medium text-slate-200">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
        <Card className="p-5">
          <SectionHeader
            title="Status history"
            subtitle="Connection and maintenance events"
            action={<History size={16} className="text-slate-500" aria-hidden="true" />}
          />
          {device.statusHistory?.length ? (
            <ol className="mt-4 space-y-4">
              {device.statusHistory.map((evt) => (
                <li key={evt.id} className="flex gap-3">
                  <HistoryIcon type={evt.type} size={16} />
                  <div className="min-w-0 border-l border-border pb-1 pl-3">
                    <p className="text-sm font-medium text-slate-200">{evt.message}</p>
                    <p className="text-xs text-slate-500">{new Date(evt.at).toLocaleString()} · {formatRelativeTime(evt.at)}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="py-6 text-center text-sm text-slate-400">No events recorded yet.</p>
          )}
        </Card>
      </section>

      {/* Delete confirmation */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="animate-fade-up w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-2xl">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/15">
              <Trash2 size={20} className="text-rose-400" aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-semibold text-white">Remove device?</h3>
            <p className="mt-1 text-sm text-slate-400">
              <span className="font-medium text-slate-200">{device.name}</span> ({device.id}) will be permanently removed.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete}>Remove</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
