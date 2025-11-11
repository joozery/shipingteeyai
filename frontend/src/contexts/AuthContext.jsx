import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedAuth = localStorage.getItem('auth')
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth)
        if (parsed?.user && parsed?.token) {
          setUser(parsed.user)
          setToken(parsed.token)
        }
      } catch (error) {
        console.error('Error parsing stored auth:', error)
        localStorage.removeItem('auth')
      }
    }
    setLoading(false)
  }, [])

  const persistAuth = (authPayload) => {
    if (authPayload) {
      localStorage.setItem('auth', JSON.stringify(authPayload))
    } else {
      localStorage.removeItem('auth')
    }
  }

  const login = ({ user: userData, token: newToken }) => {
    setUser(userData)
    setToken(newToken)
    persistAuth({ user: userData, token: newToken })
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    persistAuth(null)
  }

  const updateUser = (userData) => {
    setUser(userData)
    persistAuth({ user: userData, token })
  }

  const value = {
    user,
    token,
    login,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user && !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}



