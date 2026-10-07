/**
 * AuthContext.tsx — Contexto global de autenticação.
 *
 * Provê: { admin, token, login, logout, isAuthenticated }
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { authService, type LoginRequest } from '../services/api'

interface Admin {
  login: string
}

interface AuthContextValue {
  token: string | null
  admin: Admin | null
  loading: boolean
  error: string | null
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('token'),
  )
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('token')
    if (stored) setToken(stored)
  }, [])

  const login = async (
    credentials: LoginRequest,
  ): Promise<{ success: boolean; error?: string }> => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await authService.login(credentials)
      const { access_token } = data

      localStorage.setItem('token', access_token)
      setToken(access_token)
      setAdmin({ login: credentials.DS_LOGIN })
      return { success: true }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? 'Credenciais inválidas.'
      setError(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    authService.logout()
    setToken(null)
    setAdmin(null)
  }

  return (
    <AuthContext.Provider
      value={{ token, admin, loading, error, login, logout, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  return ctx
}
