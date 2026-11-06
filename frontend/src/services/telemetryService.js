import { apiRequest } from './api.js'
import { getTelemetry } from './thingsboardApi.js'

function adaptDevice(device, telemetry) {
  const readings = telemetry?.readings || {}
  const points = Object.values(readings || {}).flat()
  const latest = (key) => {
    if (telemetry?.telemetry) return telemetry.telemetry[key] ?? null
    const point = readings?.[key]?.[0]
    return point ? Number(point.value) : null
  }
  const hasReadings =
    telemetry?.available === true ||
    [latest('temperature'), latest('humidity'), latest('battery')].some(
      (value) => value !== null,
    )
  const seriesByTimestamp = new Map()

  for (const [key, values] of Object.entries(readings || {})) {
    for (const point of values) {
      const row = seriesByTimestamp.get(point.ts) || {
        timestamp: point.ts,
        time: new Date(point.ts).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }
      row[key] = Number(point.value)
      seriesByTimestamp.set(point.ts, row)
    }
  }

  return {
    ...device,
    id: String(device.id),
    location: device.location || 'Not specified',
    status: hasReadings ? 'online' : telemetry?.status || device.status,
    telemetryError: telemetry?.error || null,
    lastSeen: telemetry?.timestamp || telemetry?.updatedAt || device.createdAt,
    signal: null,
    live: hasReadings
      ? {
          temperature: latest('temperature'),
          humidity: latest('humidity'),
          battery: latest('battery'),
          updatedAt:
            telemetry?.timestamp ||
            Math.max(...points.map((point) => point.ts)),
        }
      : null,
    series: [...seriesByTimestamp.values()].sort(
      (a, b) => a.timestamp - b.timestamp,
    ),
    attributes: {
      'Device type': device.type,
      Location: device.location || 'Not specified',
      'Installed on': new Date(device.createdAt).toLocaleDateString(),
      'ThingsBoard ID': device.thingsboardId || 'Not linked',
    },
    statusHistory: [],
  }
}

export async function fetchDevices() {
  const devices = await apiRequest('/devices')
  const telemetryResults = await Promise.all(
    devices.map(async (device) => {
      try {
        return await getTelemetry(device.id)
      } catch (error) {
        return {
          deviceId: device.id,
          available: false,
          telemetry: {
            temperature: null,
            humidity: null,
            battery: null,
          },
          timestamp: null,
          error: error instanceof Error ? error.message : 'Telemetry unavailable',
        }
      }
    }),
  )
  const telemetryById = new Map(
    telemetryResults.map((item) => [String(item.deviceId), item]),
  )
  return {
    data: devices.map((device) =>
      adaptDevice(device, telemetryById.get(String(device.id))),
    ),
  }
}

export async function createDevice(input) {
  const device = await apiRequest('/devices', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return adaptDevice(device)
}

export async function updateDevice(id, input) {
  const device = await apiRequest(`/devices/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
  return adaptDevice(device)
}

export function deleteDevice(id) {
  return apiRequest(`/devices/${id}`, { method: 'DELETE' })
}
