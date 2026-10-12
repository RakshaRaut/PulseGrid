// Simulated async API over the in-memory mock dataset.
// Mirrors a real REST interface so swapping in live endpoints is trivial.

import { buildFullDevice } from '../data/mockDevices.js'

const delay = (ms = 450) => new Promise((r) => setTimeout(r, ms))

export async function fetchDevices() {
  await delay()
  return { data: [] } // replaced by AuthProvider pattern; kept for interface parity
}

export async function fetchDeviceById(_id) {
  await delay()
  // Kept for interface parity — actual data flows from AuthProvider state.
}

export function refreshTelemetry(device) {
  return buildFullDevice(device)
}
