// Small localStorage-backed log of explicit device lifecycle events
// (added / removed) performed in the app. The backend does not keep
// removed-device history, so the dashboard draws its "Devices added"
// and "Devices removed" counters from this log.
// Newest event first, capped to keep storage bounded.

const STORAGE_KEY = 'pulsegrid.deviceEvents'
const MAX_EVENTS = 100

export function getDeviceEvents() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function appendEvent(type, device, at) {
  const event = {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    deviceId: device?.id ?? null,
    name: device?.name ?? 'Unknown device',
    at,
  }
  const events = [event, ...getDeviceEvents()].slice(0, MAX_EVENTS)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  return events
}

export function recordDeviceAdded(device) {
  return appendEvent('added', device, new Date().toISOString())
}

export function recordDeviceRemoved(device) {
  return appendEvent('removed', device, new Date().toISOString())
}
