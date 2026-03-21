'use client'
import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface SessionUser {
  id: string; email: string; name: string; role: 'user' | 'admin'; avatar_id?: string
}
interface AuthContextType {
  user: SessionUser | null
  loading: boolean
  login: (email: string, password: string, isAdmin?: boolean) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session')
      const data = await res.json()
      setUser(data.authenticated ? data.user : null)
    } catch { setUser(null) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const login = async (email: string, password: string, isAdmin = false) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, isAdmin }),
      })
      const data = await res.json()
      if (data.success) { setUser(data.user); return { success: true } }
      return { success: false, error: data.error }
    } catch { return { success: false, error: 'Network error.' } }
  }

  const logout = async () => {
    // Clear only the current role's session, allow switching
    await fetch('/api/auth/logout', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: user?.role }),
    })
    setUser(null)
    if (user?.role === 'admin') router.push('/login?admin=1')
    else router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
