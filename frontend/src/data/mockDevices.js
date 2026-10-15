// Realistic in-memory mock data for the IoT monitoring dashboard.
// Seeded pseudo-random generation keeps values stable between renders/reloads,
// with a small live-drift tick layered on top for "real-time" feel.

const NAMES_FIRST = ['Aurora', 'Nimbus', 'Vertex', 'Quartz', 'Echo', 'Lumen', 'Cascade', 'Orchid', 'Falcon', 'Zephyr', 'Solstice', 'Terra', 'Halcyon', 'Vega', 'Drift', 'Onyx', 'Prism', 'Summit', 'Aria', 'Nova']
const NAMES_LAST = ['Hub', 'Node', 'Sensor', 'Module', 'Gateway', 'Probe', 'Unit', 'Station']
export const deviceTypes = ['Environmental', 'Energy', 'Industrial', 'Climate']
export const locations = ['Warehouse A', 'Warehouse B', 'Server Room', 'Greenhouse', 'Production Floor', 'Rooftop']

// Deterministic PRNG (mulberry32)
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rand = mulberry32(20261012)
const pick = (arr) => arr[Math.floor(rand() * arr.length)]
const between = (min, max) => min + rand() * (max - min)
const round = (v, d = 1) => Number(v.toFixed(d))

function seedForId(id) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return h
}

function buildTelemetry(id, offline) {
  const r = mulberry32(seedForId('telemetry' + id))
  const randT = () => r()
  const baseTemp = between(18, 36).toFixed(1)
  const baseHum = between(30, 70).toFixed(0)
  const baseBat = between(28, 100).toFixed(0)
  const points = []
  const now = Date.now()
  const STEP = 15 * 60 * 1000 // 15 minutes
  for (let i = 23; i >= 0; i--) {
    const t = new Date(now - i * STEP)
    const wave = Math.sin(i / 3.2) * 2.2
    const drift = (randT() - 0.5) * 1.4
    const temp = Number((Number(baseTemp) + wave + drift).toFixed(1))
    const humidity = Math.round(
      Math.min(95, Math.max(20, Number(baseHum) + Math.cos(i / 2.6) * 6 + (randT() - 0.5) * 4))
    )
    const battery = Math.round(Number(baseBat) - (23 - i) * 0.12)
    points.push({
      time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: t.getTime(),
      temperature: temp,
      humidity,
      battery: Math.max(0, battery),
    })
  }
  const latest = points[points.length - 1]
  const status = offline ? 'offline' : 'online'
  return {
    latest: status === 'offline' ? { ...latest, temperature: null, humidity: null } : latest,
    series: offline ? points.slice(0, 12).map((p) => ({ ...p, temperature: null, humidity: null })).concat(points.slice(12)) : points,
    live: { temperature: status === 'offline' ? null : round(latest.temperature, 1), humidity: status === 'offline' ? null : latest.humidity, battery: latest.battery, updatedAt: now },
  }
}

function buildStatusHistory(id, device) {
  const r = mulberry32(seedForId('history' + id))
  const events = []
  const now = Date.now()
  const kinds = [
    { label: 'Went online', type: 'online' },
    { label: 'Connection dropped', type: 'offline' },
    { label: 'Entered maintenance mode', type: 'maintenance' },
    { label: 'Firmware update applied', type: 'maintenance' },
    { label: 'Heartbeat restored', type: 'online' },
  ]
  const count = 4 + Math.floor(r() * 3)
  for (let i = 0; i < count; i++) {
    const kind = kinds[Math.floor(r() * kinds.length)]
    const age = (i + 1) * (6 + Math.floor(r() * 20)) * 60 * 60 * 1000
    events.push({
      id: `${id}-evt-${i}`,
      type: kind.type,
      message: kind.label,
      at: new Date(now - age).toISOString(),
    })
  }
  // Guarantee the most recent event matches the device status story
  events[0] = {
    id: `${id}-evt-now`,
    type: device.status,
    message: device.status === 'online' ? 'Device online and reporting' : device.status === 'offline' ? 'Device went offline' : 'Scheduled maintenance window',
    at: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
  }
  return events
}

export function seededDevices() {
  const devices = []
  // Only one seeded device — the rest are created by users via the app.
  for (let i = 0; i < 1; i++) {
    const id = `DEV-${String(1001 + i).padStart(4, '0')}`
    const name = `${pick(NAMES_FIRST)} ${pick(NAMES_LAST)}`
    const statusRoll = rand()
    const status = statusRoll < 0.62 ? 'online' : statusRoll < 0.8 ? 'offline' : 'maintenance'
    const fwMajor = 1 + Math.floor(rand() * 3)
    const device = {
      id,
      name,
      type: pick(deviceTypes),
      location: pick(locations),
      status,
      firmware: `v${fwMajor}.${Math.floor(rand() * 10)}.${Math.floor(rand() * 9)}`,
      batteryPercent: status === 'offline' ? null : Math.round(between(15, 100)),
      signal: Math.round(between(0, 100)),
      lastSeen: new Date(Date.now() - Math.floor(between(0, 360) * 60 * 1000)).toISOString(),
      createdAt: new Date(Date.now() - Math.floor(between(30, 400)) * 24 * 60 * 60 * 1000).toISOString(),
    }
    devices.push(device)
  }
  return devices
}

// Fill in the presentation fields the backend API doesn't store.
// Values are derived deterministically from the device id so a given
// device always shows the same numbers between renders/reloads.
export function withDerivedFields(device) {
  const seed = seedForId(device.id ?? String(device.deviceKey ?? device.name))
  const r = mulberry32(seed)
  return {
    ...device,
    batteryPercent: device.batteryPercent ?? Math.round(35 + r() * 60),
    signal: device.signal ?? Math.round(45 + r() * 55),
    firmware: device.firmware ?? `v${1 + Math.floor(r() * 3)}.${Math.floor(r() * 10)}.${Math.floor(r() * 9)}`,
    status: device.status ?? 'offline',
  }
}

export function buildFullDevice(device) {
  const offline = device.status === 'offline'
  const telemetry = buildTelemetry(device.id, offline)
  return {
    ...device,
    attributes: {
      'Device type': device.type,
      Firmware: device.firmware,
      Location: device.location,
      'Installed on': new Date(device.createdAt).toLocaleDateString(),
      'Last seen': new Date(device.lastSeen).toLocaleString(),
      'Signal strength': `${device.signal}%`,
      'Uptime estimate': device.status === 'offline' ? '—' : `${Math.round(between(4, 720))}h`,
      Protocol: pick(['MQTT', 'CoAP', 'LoRaWAN', 'HTTP']),
    },
    ...telemetry,
    statusHistory: buildStatusHistory(device.id, device),
  }
}

export function buildDevices() {
  return seededDevices().map(buildFullDevice)
}
