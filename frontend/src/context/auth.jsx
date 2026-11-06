import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiRequest, TOKEN_STORAGE_KEY } from '../services/api.js'
import { createDevice, deleteDevice, fetchDevices, updateDevice } from '../services/telemetryService.js'
import { recordDeviceAdded, recordDeviceRemoved } from '../utils/deviceEvents.js'

const AuthContext = createContext(null)
const STORAGE_SESSION = 'pulsegrid.session'
const STORAGE_TOKEN = TOKEN_STORAGE_KEY

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_SESSION) || 'null')
  } catch {
    return null
  }
}

function persistSession(session, token) {
  if (session && token) {
    localStorage.setItem(STORAGE_SESSION, JSON.stringify(session))
    localStorage.setItem(STORAGE_TOKEN, token)
  } else {
    localStorage.removeItem(STORAGE_SESSION)
    localStorage.removeItem(STORAGE_TOKEN)
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadSession)
  const [loading, setLoading] = useState(true)
  const [devices, setDevices] = useState([])

  const loadDevices = useCallback(async () => {
    const result = await fetchDevices()
    setDevices(result.data)
  }, [])

  useEffect(() => {
    if (!user || !localStorage.getItem(STORAGE_TOKEN)) {
      setLoading(false)
      return
    }
    loadDevices()
      .catch(() => {
        setUser(null)
        persistSession(null)
      })
      .finally(() => setLoading(false))
  }, [user, loadDevices])

  useEffect(() => {
    if (!user) return undefined
    const interval = setInterval(() => {
      loadDevices().catch(() => {})
    }, 5000)
    return () => clearInterval(interval)
  }, [user, loadDevices])

  const login = useCallback(async (credentials) => {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
    setUser(result.user)
    persistSession(result.user, result.access_token)
    setDevices((await fetchDevices()).data)
    return result.user
  }, [])

  const register = useCallback(async (input) => {
    await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    return login({ email: input.email, password: input.password })
  }, [login])

  const logout = useCallback(() => {
    setUser(null)
    setDevices([])
    persistSession(null)
  }, [])

  const addDevice = useCallback(async (input) => {
    const device = await createDevice(input)
    recordDeviceAdded(device)
    setDevices((previous) => [device, ...previous])
    return device
  }, [])

  const removeDevice = useCallback(async (id) => {
    const removed = devices.find((device) => device.id === id)
    await deleteDevice(id)
    recordDeviceRemoved(removed)
    setDevices((previous) => previous.filter((device) => device.id !== id))
  }, [devices])

  const editDevice = useCallback(async (id, input) => {
    const device = await updateDevice(id, input)
    setDevices((previous) => previous.map((item) => (item.id === id ? device : item)))
    return device
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout, devices, refreshDevices: loadDevices, addDevice, editDevice, removeDevice }),
    [user, loading, login, register, logout, devices, loadDevices, addDevice, editDevice, removeDevice],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
