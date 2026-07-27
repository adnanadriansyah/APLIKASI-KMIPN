import { createContext, useContext, useEffect, useState } from 'react'
import { login as apiLogin, fetchUser, logout as apiLogout } from '../api/auth'
import { resetAuthInit } from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (email, password) => {
    const u = await apiLogin(email, password)
    setUser(u)
    return u
  }

  const logout = async () => {
    try {
      await apiLogout()
    } finally {
      setUser(null)
      resetAuthInit()
    }
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext
