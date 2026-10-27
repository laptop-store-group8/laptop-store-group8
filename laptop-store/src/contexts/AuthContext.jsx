import { createContext, useContext, useState } from 'react'

// Temporary #14 contract; replace with the authentication implementation from #8.
const AuthContext = createContext(null)

export function AuthProvider({ children, initialUser = null }) {
  const [user, setUser] = useState(initialUser)
  const isAdmin = user?.role === 'admin' || user?.isAdmin === true

  function logout() {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
