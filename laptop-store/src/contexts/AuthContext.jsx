import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import * as authApi from '../api/authApi'
import AuthContext from './AuthContextValue'

function getStoredUser() {
  const token = localStorage.getItem('token')
  const storedUser = localStorage.getItem('user')

  if (!token || !storedUser) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return null
  }

  try {
    const user = JSON.parse(storedUser)
    if (!user || typeof user !== 'object' || user.id == null) {
      throw new TypeError('Stored user is not valid')
    }

    delete user.password
    return user
  } catch (error) {
    console.warn('Không thể khôi phục phiên đăng nhập đã lưu.', error)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser)

  const login = useCallback(async (email, password) => {
    const authenticatedUser = await authApi.login(email, password)
    setUser(authenticatedUser)
    return authenticatedUser
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  useEffect(() => {
    window.addEventListener('auth:logout', logout)
    return () => window.removeEventListener('auth:logout', logout)
  }, [logout])

  const value = useMemo(
    () => ({ user, isAdmin: user?.role === 'admin', login, logout }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
