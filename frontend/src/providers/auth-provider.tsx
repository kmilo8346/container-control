import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { authClient } from '@/clients/auth-client'
import type { User } from '@/clients/auth-client'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  useEffect(() => {
    let active = true
    authClient
      .me()
      .then((profile) => {
        if (active) setUser(profile)
      })
      .catch(() => {
        if (active) setError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])
  async function logout() {
    await authClient.logout()
    setUser(null)
  }
  return (
    <AuthContext.Provider value={{ user, loading, error, logout }}>{children}</AuthContext.Provider>
  )
}
