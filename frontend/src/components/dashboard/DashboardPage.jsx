import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Cpu from 'lucide-react/dist/esm/icons/cpu'
import Wifi from 'lucide-react/dist/esm/icons/wifi'
import WifiOff from 'lucide-react/dist/esm/icons/wifi-off'
import Wrench from 'lucide-react/dist/esm/icons/wrench'
import Thermometer from 'lucide-react/dist/esm/icons/thermometer'
import Droplets from 'lucide-react/dist/esm/icons/droplets'
import BatteryCharging from 'lucide-react/dist/esm/icons/battery-charging'
import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right'
import Plus from 'lucide-react/dist/esm/icons/plus'
import Trash2 from 'lucide-react/dist/esm/icons/trash-2'
import History from 'lucide-react/dist/esm/icons/history'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTooltip } from 'recharts'
import { useAuth } from '../../context/auth.jsx'
import { Card, StatCard, SectionHeader, EmptyState } from '../ui/cards.jsx'
import { StatusChip, TypeIcon } from '../ui/badges.jsx'
import { formatRelativeTime, formatTemp, formatHumidity, formatBattery } from '../../utils/format.js'
import { getDeviceEvents } from '../../utils/deviceEvents.js'
import { TempHumidityChart, BatteryGauge } from '../charts/deviceCharts.jsx'

const STATUS_COLORS = ['#34d399', '#f87171', '#fbbf24']

export default function DashboardPage() {
  const { devices } = useAuth()

  const stats = useMemo(() => {
    const total = devices.length
    const online = devices.filter((d) => d.status === 'online').length
    const offline = devices.filter((d) => d.status === 'offline').length
    const maintenance = devices.filter((d) => d.status === 'maintenance').length
    const reading = devices.filter((d) => d.status === 'online' && d.live)
    const avgTemp = reading.length ? reading.reduce((s, d) => s + d.live.temperature, 0) / reading.length : 0
    const avgHum = reading.length ? reading.reduce((s, d) => s + d.live.humidity, 0) / reading.length : 0
    const avgBat = reading.length ? reading.reduce((s, d) => s + d.live.battery, 0) / reading.length : 0
    const lowBatteryCount = devices.filter((d) => d.live && d.live.battery <= 35).length
    // Most recently updated device reporting to the backend (source of
    // 'latest temperature', 'latest humidity' and the fleet 'last update').
    const [latest] = devices
      .filter((d) => d.live && d.live.updatedAt)
      .sort((a, b) => b.live.updatedAt - a.live.updatedAt)
    // Add/remove history recorded locally (the backend does not keep
    // removed-device history). Refreshes alongside the 5s device poll.
    const events = getDeviceEvents()
    const added = events.filter((event) => event.type === 'added')
    const removed = events.filter((event) => event.type === 'removed')
    const lastItemOf = (list) =>
      list[0] ? `${list[0].name} · ${formatRelativeTime(list[0].at)}` : 'None recorded yet'
    return {
      total,
      online,
      offline,
      maintenance,
      avgTemp,
      avgHum,
      avgBat,
      lowBatteryCount,
      readingCount: reading.length,
      latest,
      activity: {
        addedCount: added.length,
        removedCount: removed.length,
        lastAdded: lastItemOf(added),
        lastRemoved: lastItemOf(removed),
      },
    }
  }, [devices])

  const statusData = useMemo(
    () => [
      { name: 'Online', value: stats.online },
      { name: 'Offline', value: stats.offline },
      { name: 'Maintenance', value: stats.maintenance },
    ],
    [stats],
  )

  const recent = useMemo(() => devices.slice(0, 8), [devices])
  const chartDevice = useMemo(() => recent.find((d) => d.series?.length) ?? null, [recent])
  const lowBattery = useMemo(() => devices.filter((d) => d.live && d.live.battery <= 35).slice(0, 4), [devices])
  const alerts = useMemo(() => devices.filter((d) => d.status === 'offline').slice(0, 4), [devices])

  if (!devices.length) {
    return (
      <EmptyState
        icon={Cpu}
        title="No devices yet"
        description="Register your first IoT device to see fleet metrics here."
        action={
          <Link to="/devices" className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover">
            Go to Devices
          </Link>
        }
      />
    )
  }

  return (
    <div className="animate-fade-up space-y-6">
      {/* Summary cards */}
      <section aria-label="Fleet summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Cpu} label="Total devices" value={stats.total} hint="Across all locations" tone="accent" />
        <StatCard
          icon={Wifi}
          label="Online"
          value={stats.online}
          hint={`${stats.total ? Math.round((stats.online / stats.total) * 100) : 0}% of fleet`}
          tone="success"
        />
        <StatCard icon={WifiOff} label="Offline" value={stats.offline} hint={stats.offline ? 'Needs attention' : 'All clear'} tone="danger" />
        <StatCard icon={Wrench} label="In maintenance" value={stats.maintenance} hint="Scheduled work" tone="warning" />
      </section>

      {/* Backend telemetry snapshot */}
      <section aria-label="Telemetry snapshot" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Thermometer}
          label="Total temperature"
          tone="accent"
          value={stats.readingCount ? formatTemp(stats.avgTemp) : '—'}
          hint={
            stats.latest
              ? `Fleet avg · latest ${formatTemp(stats.latest.live.temperature)} (${stats.latest.name})`
              : 'No live telemetry yet'
          }
        />
        <StatCard
          icon={Thermometer}
          label="Latest temperature"
          tone="accent"
          value={stats.latest ? formatTemp(stats.latest.live.temperature) : '—'}
          hint={stats.latest ? `From ${stats.latest.name}` : 'No live telemetry yet'}
        />
        <StatCard
          icon={Droplets}
          label="Latest humidity"
          tone="accent"
          value={stats.latest ? formatHumidity(stats.latest.live.humidity) : '—'}
          hint={stats.latest ? `Fleet avg ${formatHumidity(stats.avgHum)}` : 'No live telemetry yet'}
        />
        <StatCard
          icon={BatteryCharging}
          label="Battery status"
          tone={stats.lowBatteryCount ? 'warning' : 'success'}
          value={stats.readingCount ? formatBattery(stats.avgBat) : '—'}
          hint={
            stats.lowBatteryCount
              ? `${stats.lowBatteryCount} device${stats.lowBatteryCount > 1 ? 's' : ''} at or below 35%`
              : 'All reporting devices above 35%'
          }
        />
      </section>

      {/* Device lifecycle activity */}
      <section aria-label="Device lifecycle" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={Plus}
          label="Devices added"
          tone="success"
          value={stats.activity.addedCount}
          hint={`Most recent: ${stats.activity.lastAdded}`}
        />
        <StatCard
          icon={Trash2}
          label="Devices removed"
          tone={stats.activity.removedCount ? 'neutral' : 'success'}
          value={stats.activity.removedCount}
          hint={`Most recent: ${stats.activity.lastRemoved}`}
        />
        <StatCard
          icon={History}
          label="Last update"
          tone="neutral"
          value={stats.latest ? formatRelativeTime(stats.latest.live.updatedAt) : '—'}
          hint={stats.latest ? `${stats.latest.name} · refreshes every 5s` : 'Waiting for telemetry'}
        />
      </section>

      {/* Sensor readings + status distribution */}
      <section className="grid gap-4 lg:grid-cols-3" aria-label="Sensor overview">
        <Card className="p-5 lg:col-span-2">
          <SectionHeader title="Sensor readings" subtitle="Temperature & humidity stream across your newest devices" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {recent.slice(0, 4).map((d) => (
              <Link
                key={d.id}
                to={`/devices/${d.id}`}
                className="group rounded-xl border border-border bg-surface-2/50 p-4 transition hover:border-accent-hover/40 hover:bg-surface-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15 text-accent-hover">
                    <TypeIcon type={d.type} size={15} />
                  </span>
                  <StatusChip status={d.status} size="sm" />
                </div>
                <p className="mt-3 truncate text-sm font-semibold text-white group-hover:text-accent-hover">{d.name}</p>
                <p className="truncate text-[11px] text-slate-500">{d.id}</p>
                <dl className="mt-3 grid grid-cols-3 gap-1 text-center">
                  <div>
                    <dt className="sr-only">Temperature</dt>
                    <dd className="flex items-center justify-center gap-1 text-sm font-semibold text-orange-300">
                      <Thermometer size={13} aria-hidden="true" /> {d.live ? formatTemp(d.live.temperature) : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="sr-only">Humidity</dt>
                    <dd className="flex items-center justify-center gap-1 text-sm font-semibold text-sky-300">
                      <Droplets size={13} aria-hidden="true" /> {d.live ? formatHumidity(d.live.humidity) : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="sr-only">Battery</dt>
                    <dd className="flex items-center justify-center gap-1 text-sm font-semibold text-emerald-300">
                      <BatteryCharging size={13} aria-hidden="true" /> {d.live ? formatBattery(d.live.battery) : '—'}
                    </dd>
                  </div>
                </dl>
              </Link>
            ))}
          </div>
          <div className="mt-5 h-60">
            {chartDevice ? (
              <TempHumidityChart data={chartDevice.series} />
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-slate-400">No telemetry data available.</p>
            )}
          </div>
          {chartDevice && (
            <p className="mt-2 text-center text-[11px] text-slate-500">24h rolling window · {chartDevice.name}</p>
          )}
        </Card>

        <Card className="flex flex-col p-5">
          <SectionHeader title="Fleet status" subtitle="Distribution across the fleet" />
          <div className="relative mx-auto mt-4 h-52 w-full max-w-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" innerRadius="62%" outerRadius="90%" paddingAngle={4} strokeWidth={0}>
                  {statusData.map((entry, i) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[i]} />
                  ))}
                </Pie>
                <RTooltip contentStyle={{ background: '#0f172a', border: '1px solid #2a3b5f', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{stats.total}</span>
              <span className="text-xs text-slate-400">devices</span>
            </div>
          </div>
          <ul className="mt-4 w-full space-y-2">
            {statusData.map((s, i) => (
              <li key={s.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[i] }} aria-hidden="true" />
                  {s.name}
                </span>
                <span className="font-semibold text-white">{s.value}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 grid w-full grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-surface-2/60 p-3">
              <p className="flex items-center justify-center gap-1 text-lg font-bold text-orange-300">
                <Thermometer size={14} aria-hidden="true" /> {formatTemp(stats.avgTemp)}
              </p>
              <p className="text-[11px] text-slate-400">avg temp</p>
            </div>
            <div className="rounded-xl bg-surface-2/60 p-3">
              <p className="flex items-center justify-center gap-1 text-lg font-bold text-sky-300">
                <Droplets size={14} aria-hidden="true" /> {formatHumidity(stats.avgHum)}
              </p>
              <p className="text-[11px] text-slate-400">avg humidity</p>
            </div>
            <div className="rounded-xl bg-surface-2/60 p-3">
              <p className="flex items-center justify-center gap-1 text-lg font-bold text-emerald-300">
                <BatteryCharging size={14} aria-hidden="true" /> {formatBattery(stats.avgBat)}
              </p>
              <p className="text-[11px] text-slate-400">avg battery</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Recent devices table */}
      <Card className="overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <SectionHeader
            title="Recent devices"
            subtitle="Latest activity across your fleet"
            action={
              <Link to="/devices" className="inline-flex items-center gap-1 text-sm font-medium text-indigo-300 hover:text-indigo-200">
                View all <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            }
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3 font-medium">Device</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Temp</th>
                <th className="px-5 py-3 font-medium">Humidity</th>
                <th className="px-5 py-3 font-medium">Battery</th>
                <th className="px-5 py-3 font-medium">Last seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {recent.map((d) => (
                <tr key={d.id} className="transition hover:bg-surface-2/50">
                  <td className="px-5 py-3">
                    <Link to={`/devices/${d.id}`} className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent-hover">
                        <TypeIcon type={d.type} size={15} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-white">{d.name}</span>
                        <span className="block truncate text-xs text-slate-500">{d.id} · {d.location}</span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-5 py-3"><StatusChip status={d.status} size="sm" /></td>
                  <td className="px-5 py-3 text-orange-300">{d.live ? formatTemp(d.live.temperature) : '—'}</td>
                  <td className="px-5 py-3 text-sky-300">{d.live ? formatHumidity(d.live.humidity) : '—'}</td>
                  <td className="px-5 py-3 text-emerald-300">{d.live ? formatBattery(d.live.battery) : '—'}</td>
                  <td className="px-5 py-3 whitespace-nowrap text-slate-400">{formatRelativeTime(d.lastSeen)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Low battery + alerts */}
      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <SectionHeader title="Low battery" subtitle="Devices at or below 35% charge" />
          {lowBattery.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">All batteries above 35% ✓</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {lowBattery.map((d) => (
                <li key={d.id}>
                  <Link to={`/devices/${d.id}`} className="flex items-center gap-4 rounded-xl bg-surface-2/40 p-3 transition hover:bg-surface-2">
                    <BatteryGauge value={d.live.battery} size={52} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{d.name}</p>
                      <p className="text-xs text-slate-500">{d.id} · {d.location}</p>
                    </div>
                    <span className={`text-lg font-bold ${d.live.battery <= 20 ? 'text-rose-300' : 'text-amber-300'}`}>
                      {formatBattery(d.live.battery)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="p-5">
          <SectionHeader title="Recent alerts" subtitle="Devices that dropped offline" />
          {alerts.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">No active alerts — fleet healthy ✓</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {alerts.map((d) => (
                <li key={d.id}>
                  <Link to={`/devices/${d.id}`} className="flex items-center gap-3 rounded-xl bg-surface-2/40 p-3 transition hover:bg-surface-2">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-500/15">
                      <WifiOff size={15} className="text-rose-300" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">{d.name} went offline</p>
                      <p className="text-xs text-slate-500">{formatRelativeTime(d.lastSeen)} · {d.id} · {d.location}</p>
                    </div>
                    <StatusChip status="offline" size="sm" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  )
}
