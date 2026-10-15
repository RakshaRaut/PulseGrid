import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Cpu from 'lucide-react/dist/esm/icons/cpu'
import Search from 'lucide-react/dist/esm/icons/search'
import Plus from 'lucide-react/dist/esm/icons/plus'
import LayoutGrid from 'lucide-react/dist/esm/icons/layout-grid'
import List from 'lucide-react/dist/esm/icons/list'
import Filter from 'lucide-react/dist/esm/icons/filter'
import X from 'lucide-react/dist/esm/icons/x'
import Trash2 from 'lucide-react/dist/esm/icons/trash-2'
import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right'
import Signal from 'lucide-react/dist/esm/icons/signal'
import MapPin from 'lucide-react/dist/esm/icons/map-pin'
import Thermometer from 'lucide-react/dist/esm/icons/thermometer'
import Droplets from 'lucide-react/dist/esm/icons/droplets'
import BatteryCharging from 'lucide-react/dist/esm/icons/battery-charging'
import { useAuth } from '../context/auth.jsx'
import { useToast } from '../context/toast.jsx'
import { Card, EmptyState, Spinner } from '../components/ui/cards.jsx'
import { StatusChip, TypeIcon, statusOptions, typeOptions } from '../components/ui/badges.jsx'
import { Button, Field, Input, Select } from '../components/ui/forms.jsx'
import { formatRelativeTime, formatTemp, formatHumidity, formatBattery } from '../utils/format.js'

const DEVICE_TYPES = typeOptions.map((t) => t.value)
const LOCATIONS = ['Warehouse A', 'Warehouse B', 'Server Room', 'Greenhouse', 'Production Floor', 'Rooftop']

function AddDeviceModal({ open, onClose, onSubmit }) {
  const [values, setValues] = useState({ name: '', type: DEVICE_TYPES[0], location: LOCATIONS[0], status: 'online', thingsboardId: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  if (!open) return null

  const validate = (v) => {
    const e = {}
    if (!v.name.trim()) e.name = 'Device name is required.'
    else if (v.name.trim().length < 3) e.name = 'Use at least 3 characters.'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validation = validate(values)
    setErrors(validation)
    if (Object.keys(validation).length) return
    setSaving(true)
    try {
      await onSubmit(values)
      setValues({ name: '', type: DEVICE_TYPES[0], location: LOCATIONS[0], status: 'online', thingsboardId: '' })
      onClose()
    } catch (error) {
      setErrors({ form: error.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Add device">
      <div className="animate-fade-up w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl shadow-black/50">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Add new device</h3>
            <p className="mt-0.5 text-sm text-slate-400">Register a sensor on your network.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-surface-2 hover:text-white" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
          {errors.form && <p role="alert" className="text-sm text-rose-300">{errors.form}</p>}
          <Field label="Device name" htmlFor="device-name" error={errors.name}>
            <Input
              id="device-name"
              placeholder="e.g. Rooftop Weather Node"
              value={values.name}
              onChange={(e) => {
                const next = { ...values, name: e.target.value }
                setValues(next)
                setErrors(validate(next))
              }}
              invalid={!!errors.name}
            />
          </Field>
          <Field label="Type" htmlFor="device-type">
            <Select id="device-type" value={values.type} onChange={(e) => setValues({ ...values, type: e.target.value })}>
              {DEVICE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Field label="Location" htmlFor="device-location">
            <Select id="device-location" value={values.location} onChange={(e) => setValues({ ...values, location: e.target.value })}>
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </Select>
          </Field>
          <Field label="Initial status" htmlFor="device-status">
            <Select id="device-status" value={values.status} onChange={(e) => setValues({ ...values, status: e.target.value })}>
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="ThingsBoard device ID (optional)" htmlFor="thingsboard-id">
            <Input
              id="thingsboard-id"
              placeholder="UUID from ThingsBoard"
              value={values.thingsboardId}
              onChange={(e) => setValues({ ...values, thingsboardId: e.target.value })}
            />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" loading={saving}>{saving ? 'Adding…' : 'Add device'}</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeviceCard({ device, onView }) {
  return (
    <Card className="group flex flex-col p-5 transition hover:border-accent-hover/40 hover:shadow-xl hover:shadow-indigo-950/30">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent-hover">
          <TypeIcon type={device.type} size={18} />
        </span>
        <StatusChip status={device.status} size="sm" />
      </div>
      <h3 className="mt-3 truncate font-semibold text-white group-hover:text-accent-hover">{device.name}</h3>
      <p className="truncate text-xs text-slate-500">{device.id} · {device.type}</p>
      <div className="mt-3 space-y-1.5 text-xs text-slate-400">
        <p className="flex items-center gap-1.5"><MapPin size={12} className="text-slate-500" aria-hidden="true" /> {device.location}</p>
        <p className="flex items-center gap-1.5"><Signal size={12} className="text-slate-500" aria-hidden="true" /> {device.signal}% signal</p>
        <p className="flex items-center gap-1.5"><Thermometer size={12} className="text-slate-500" aria-hidden="true" /> {device.live ? formatTemp(device.live.temperature) : '—'} · <Droplets size={12} aria-hidden="true" /> {device.live ? formatHumidity(device.live.humidity) : '—'}</p>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <BatteryCharging size={12} aria-hidden="true" />
          {device.live ? formatBattery(device.live.battery) : '—'}
        </span>
        <Link to={`/devices/${device.id}`} className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-300 hover:text-indigo-200">
          Details <ArrowUpRight size={12} aria-hidden="true" />
        </Link>
      </div>
      {onView && (
        <button type="button" className="sr-only" onClick={() => onView(device)}>View device</button>
      )}
    </Card>
  )
}

function DeviceRow({ device, onDelete }) {
  return (
    <tr className="transition hover:bg-surface-2/50">
      <td className="px-4 py-3 sm:px-5">
        <Link to={`/devices/${device.id}`} className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent-hover">
            <TypeIcon type={device.type} size={16} />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium text-white">{device.name}</span>
            <span className="block truncate text-xs text-slate-500">{device.id} · {device.type}</span>
          </span>
        </Link>
      </td>
      <td className="px-4 py-3 text-slate-300 sm:px-5"><MapPin size={12} className="mr-1 inline text-slate-500" aria-hidden="true" />{device.location}</td>
      <td className="px-4 py-3 sm:px-5"><StatusChip status={device.status} size="sm" /></td>
      <td className="px-4 py-3 text-orange-300 sm:px-5">{device.live ? formatTemp(device.live.temperature) : '—'}</td>
      <td className="px-4 py-3 text-sky-300 sm:px-5">{device.live ? formatHumidity(device.live.humidity) : '—'}</td>
      <td className="px-4 py-3 text-emerald-300 sm:px-5">{device.live ? formatBattery(device.live.battery) : '—'}</td>
      <td className="hidden px-4 py-3 text-slate-400 md:table-cell sm:px-5">{formatRelativeTime(device.lastSeen)}</td>
      <td className="px-4 py-3 text-right sm:px-5">
        <Link to={`/devices/${device.id}`} className="mr-1 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-indigo-300 hover:bg-accent/10">
          View <ArrowUpRight size={12} aria-hidden="true" />
        </Link>
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(device)}
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-300"
            aria-label={`Delete ${device.name}`}
          >
            <Trash2 size={14} aria-hidden="true" />
          </button>
        )}
      </td>
    </tr>
  )
}

export default function Devices() {
  const { devices, loading: authLoading, addDevice, removeDevice } = useAuth()
  const { notify } = useToast()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [sort, setSort] = useState('name')
  const [view, setView] = useState('grid')
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const availableLocations = useMemo(
    () => Array.from(new Set(devices.map((d) => d.location))).sort(),
    [devices],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = devices.filter((d) => {
      const matchesSearch = !q || [d.name, d.id, d.type, d.location].some((f) => (f || '').toLowerCase().includes(q))
      const matchesStatus = statusFilter === 'all' || d.status === statusFilter
      const matchesType = typeFilter === 'all' || d.type === typeFilter
      const matchesLocation = locationFilter === 'all' || d.location === locationFilter
      return matchesSearch && matchesStatus && matchesType && matchesLocation
    })
    const comparators = {
      name: (a, b) => a.name.localeCompare(b.name),
      status: (a, b) => a.status.localeCompare(b.status) || a.name.localeCompare(b.name),
      battery: (a, b) => (b.live?.battery ?? -1) - (a.live?.battery ?? -1),
      recent: (a, b) => new Date(b.lastSeen) - new Date(a.lastSeen),
    }
    return [...list].sort(comparators[sort] ?? comparators.name)
  }, [devices, search, statusFilter, typeFilter, locationFilter, sort])

  const activeFilters = [statusFilter !== 'all', typeFilter !== 'all', locationFilter !== 'all'].filter(Boolean).length
  const hasSearched = search || activeFilters > 0

  const handleAdd = async (input) => {
    await addDevice({
      ...input,
      deviceKey: `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
    })
    notify(`${input.name} added successfully!`, 'success')
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    try {
      await removeDevice(confirmDelete.id)
      notify(`${confirmDelete.name} removed from fleet.`, 'info')
      setConfirmDelete(null)
    } catch (error) {
      notify(error.message, 'error')
    }
  }

  const resetFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setTypeFilter('all')
    setLocationFilter('all')
  }

  if (authLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size={28} />
      </div>
    )
  }

  return (
    <div className="animate-fade-up space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Devices</h2>
          <p className="mt-0.5 text-sm text-slate-400">
            {devices.length} devices · {devices.filter((d) => d.status === 'online').length} online
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-border bg-surface-2/70 p-0.5">
            <button
              type="button"
              onClick={() => setView('grid')}
              className={`rounded-lg p-2 ${view === 'grid' ? 'bg-accent text-white' : 'text-slate-400 hover:text-white'}`}
              aria-label="Grid view"
              aria-pressed={view === 'grid'}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setView('table')}
              className={`rounded-lg p-2 ${view === 'table' ? 'bg-accent text-white' : 'text-slate-400 hover:text-white'}`}
              aria-label="Table view"
              aria-pressed={view === 'table'}
            >
              <List size={16} />
            </button>
          </div>
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={16} aria-hidden="true" /> Add device
          </Button>
        </div>
      </div>

      {/* Search + filters */}
      <Card className="p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="relative xl:col-span-2">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <Search size={15} aria-hidden="true" />
            </span>
            <label htmlFor="device-search" className="sr-only">Search devices</label>
            <Input
              id="device-search"
              placeholder="Search by name, ID, type or location…"
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Filter by status">
            <option value="all">All statuses</option>
            {statusOptions.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </Select>
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="Filter by type">
            <option value="all">All types</option>
            {DEVICE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
          <Select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} aria-label="Filter by location">
            <option value="all">All locations</option>
            {availableLocations.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </Select>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Filter size={13} aria-hidden="true" />
            <span>
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              {hasSearched ? ` (filtered from ${devices.length})` : ''}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-xs text-slate-500">Sort by</label>
            <Select id="sort" className="w-44 py-1.5 text-xs" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="name">Name (A–Z)</option>
              <option value="status">Status</option>
              <option value="battery">Battery (high → low)</option>
              <option value="recent">Recently seen</option>
            </Select>
            {(hasSearched) && (
              <button type="button" onClick={resetFilters} className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-rose-300 hover:bg-rose-500/10">
                <X size={12} aria-hidden="true" /> Clear
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Cpu}
          title={hasSearched ? 'No devices match your filters' : 'No devices registered'}
          description={
            hasSearched
              ? 'Try adjusting the search term or clearing filters to see all devices.'
              : 'Add your first device to start monitoring temperature, humidity and battery levels.'
          }
          action={
            hasSearched ? (
              <Button variant="secondary" onClick={resetFilters}>Clear all filters</Button>
            ) : (
              <Button onClick={() => setModalOpen(true)}><Plus size={16} aria-hidden="true" /> Add device</Button>
            )
          }
        />
      ) : view === 'grid' ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((d) => (
            <DeviceCard key={d.id} device={d} />
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3 font-medium sm:px-5">Device</th>
                  <th className="px-4 py-3 font-medium sm:px-5">Location</th>
                  <th className="px-4 py-3 font-medium sm:px-5">Status</th>
                  <th className="px-4 py-3 font-medium sm:px-5">Temp</th>
                  <th className="px-4 py-3 font-medium sm:px-5">Humidity</th>
                  <th className="px-4 py-3 font-medium sm:px-5">Battery</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell sm:px-5">Last seen</th>
                  <th className="px-4 py-3 text-right font-medium sm:px-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((d) => (
                  <DeviceRow key={d.id} device={d} onDelete={setConfirmDelete} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="animate-fade-up w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-2xl">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/15">
              <Trash2 size={20} className="text-rose-400" aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-semibold text-white">Remove device?</h3>
            <p className="mt-1 text-sm text-slate-400">
              <span className="font-medium text-slate-200">{confirmDelete.name}</span> ({confirmDelete.id}) will be permanently removed from your fleet.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="secondary" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button variant="danger" onClick={handleDelete}>Remove</Button>
            </div>
          </div>
        </div>
      )}

      <AddDeviceModal open={modalOpen} onClose={() => setModalOpen(false)} onSubmit={handleAdd} />
    </div>
  )
}
