import { createContext } from 'react'
import type { User } from '@/clients/auth-client'

export const AuthContext = createContext<{
  user: User | null
  loading: boolean
  error: boolean
  logout: () => Promise<void>
} | null>(null)
