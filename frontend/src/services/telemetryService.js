import { buildFullDevice, withDerivedFields } from '../data/mockDevices.js'
import { apiRequest } from './api.js'

// Backend devices lack presentation-only fields (signal, battery label,
// firmware). Derive stable values and mirror the API shape the UI expects.
function adaptDevice(device, telemetry) {
  const presentation = buildFullDevice(
    withDerivedFields({
      ...device,
      id: String(device.id),
      location: device.location || 'Unknown',
      lastSeen: device.updatedAt || device.createdAt,
    }),
  )
  const readings = telemetry?.readings
  const seriesByTimestamp = new Map()
  for (const [key, points] of Object.entries(readings || {})) {
    for (const point of points || []) {
      const row = seriesByTimestamp.get(point.ts) || {
        timestamp: point.ts,
        time: new Date(point.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      row[key] = Number(point.value)
      seriesByTimestamp.set(point.ts, row)
    }
  }
  const series = [...seriesByTimestamp.values()].sort((a, b) => a.timestamp - b.timestamp)
  const latest = (key) => {
    const points = readings?.[key]
    return points?.length ? Number(points[0].value) : null
  }

  return {
    ...presentation,
    live: readings
      ? {
          temperature: latest('temperature'),
          humidity: latest('humidity'),
          battery: latest('battery'),
          updatedAt: Math.max(...Object.values(readings).flat().map((point) => point.ts), 0),
        }
      : null,
    series: series.map((point) => ({
      ...point,
      temperature: point.temperature ?? null,
      humidity: point.humidity ?? null,
      battery: point.battery ?? null,
    })),
    lastSeen: telemetry?.updatedAt || presentation.lastSeen,
  }
}

export async function fetchDevices() {
  const devices = await apiRequest('/devices')
  let telemetry = []
  try {
    telemetry = (await apiRequest('/devices/telemetry')).data || []
  } catch {
    // Device metadata remains usable while ThingsBoard is unavailable.
  }
  const telemetryById = new Map(telemetry.map((item) => [String(item.deviceId), item]))
  return { data: devices.map((device) => adaptDevice(device, telemetryById.get(String(device.id)))) }
}

export async function createDevice(input) {
  const device = await apiRequest('/devices', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return adaptDevice(device)
}

export async function deleteDevice(id) {
  await apiRequest(`/devices/${id}`, { method: 'DELETE' })
}

export function refreshTelemetry(device) {
  return buildFullDevice(device)
}
