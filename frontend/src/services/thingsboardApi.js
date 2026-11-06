import { apiRequest } from './api.js'

export const getTelemetry = async (deviceId) => {
  return apiRequest(`/thingsboard/telemetry/${encodeURIComponent(deviceId)}`)
}