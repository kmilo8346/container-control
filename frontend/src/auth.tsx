import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
type User = { id: number; login: string; name: string | null; avatarUrl: string }
const AuthContext = createContext<{ user: User | null; loading: boolean; error: boolean; logout: () => Promise<void> } | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  useEffect(() => {
    let active = true
    fetch(`${API_URL}/auth/me`, { credentials: 'include' })
      .then(async response => {
        if (response.status === 401) return null
        if (!response.ok) throw new Error('Session check failed')
        return await response.json() as User
      })
      .then(profile => { if (active) setUser(profile) })
      .catch(() => { if (active) setError(true) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])
  async function logout() {
    const response = await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' })
    if (!response.ok) throw new Error('Logout failed')
    setUser(null)
  }
  return <AuthContext.Provider value={{ user, loading, error, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const auth = useContext(AuthContext)
  if (!auth) throw new Error('AuthProvider is required')
  return auth
}
