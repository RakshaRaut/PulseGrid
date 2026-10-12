import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { buildDevices } from '../data/mockDevices.js'

const AuthContext = createContext(null)

const STORAGE_USERS = 'pulsegrid.users'
const STORAGE_SESSION = 'pulsegrid.session'

function loadUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_USERS)
    if (raw) return JSON.parse(raw)
  } catch {
    /* corrupted storage — fall through */
  }
  // Default demo account
  return [{ id: 1, name: 'Demo User', email: 'demo@pulsegrid.io', password: 'demo1234' }]
}

function persistUsers(users) {
  try {
    localStorage.setItem(STORAGE_USERS, JSON.stringify(users))
  } catch {
    /* storage unavailable (private mode) — session stays in-memory */
  }
}

function loadSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_SESSION) || 'null')
  } catch {
    return null
  }
}

function persistSession(session) {
  try {
    if (session) localStorage.setItem(STORAGE_SESSION, JSON.stringify(session))
    else localStorage.removeItem(STORAGE_SESSION)
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(loadUsers)
  const [user, setUser] = useState(loadSession)
  const [loading, setLoading] = useState(true)
  const [devices, setDevices] = useState(() => buildDevices())

  useEffect(() => {
    // Simulate restoring session / initial data fetch
    const t = setTimeout(() => setLoading(false), 250)
    return () => clearTimeout(t)
  }, [])

  const persist = useCallback((next) => {
    setUsers(next)
    persistUsers(next)
  }, [])

  const login = useCallback(
    async ({ email, password }) => {
      await new Promise((r) => setTimeout(r, 500)) // simulate network
      const found = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
      )
      if (!found) {
        throw new Error('Invalid email or password.')
      }
      const session = { id: found.id, name: found.name, email: found.email }
      setUser(session)
      persistSession(session)
      return session
    },
    [users],
  )

  const register = useCallback(
    async ({ name, email, password }) => {
      await new Promise((r) => setTimeout(r, 600)) // simulate network
      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('An account with this email already exists.')
      }
      const newUser = { id: Date.now(), name, email, password }
      persist([...users, newUser])
      const session = { id: newUser.id, name, email }
      setUser(session)
      persistSession(session)
      return session
    },
    [users, persist],
  )

  const logout = useCallback(() => {
    setUser(null)
    persistSession(null)
  }, [])

  const resetPassword = useCallback(
    async (email) => {
      await new Promise((r) => setTimeout(r, 500))
      const exists = users.some((u) => u.email.toLowerCase() === email.toLowerCase())
      if (!exists) throw new Error('No account found with this email.')
    },
    [users],
  )

  // Mock device mutations (in-memory only)
  const addDevice = useCallback(
    (input) => {
      const id = `DEV-${String(1001 + devices.length).padStart(4, '0')}`
      const now = new Date().toISOString()
      const device = {
        id,
        name: input.name,
        type: input.type,
        location: input.location,
        status: input.status ?? 'online',
        firmware: 'v1.0.0',
        batteryPercent: input.batteryPercent ?? 100,
        signal: 92,
        lastSeen: now,
        createdAt: now,
      }
      setDevices((prev) => [device, ...prev])
      return device
    },
    [devices.length],
  )

  const removeDevice = useCallback(
    (id) => setDevices((prev) => prev.filter((d) => d.id !== id)),
    [],
  )

  // Gently drift latest telemetry for devices to simulate live data
  useEffect(() => {
    const interval = setInterval(() => {
      setDevices((prev) =>
        prev.map((d) => {
          if (d.status !== 'online' || !d.live) return d
          const delta = (Math.random() - 0.5) * 0.4
          return {
            ...d,
            live: {
              ...d.live,
              temperature: Math.round((d.live.temperature + delta) * 10) / 10,
              humidity: Math.max(0, Math.min(100, d.live.humidity + Math.round((Math.random() - 0.5) * 2))),
              battery: d.live.battery,
              updatedAt: Date.now(),
            },
          }
        }),
      )
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, register, logout, resetPassword, devices, addDevice, removeDevice }),
    [user, loading, login, register, logout, resetPassword, devices, addDevice, removeDevice],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
