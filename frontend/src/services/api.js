const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
export const TOKEN_STORAGE_KEY = 'token'
const LEGACY_TOKEN_STORAGE_KEY = 'pulsegrid.accessToken'

export function getAccessToken() {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token) return token

  const legacyToken = localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY)
  if (legacyToken) {
    localStorage.setItem(TOKEN_STORAGE_KEY, legacyToken)
    localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY)
  }
  return legacyToken
}

export async function apiRequest(path, options = {}) {
  const token = getAccessToken()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) {
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message
    throw new Error(message || `Request failed (${response.status})`)
  }
  return body
}
