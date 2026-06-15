import { createContext, useContext, useState } from "react"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // null = not logged in, object = logged in user
  const [user, setUser] = useState(null)

  function login(username, _password) {
    // Replace with real API call
    setUser({ username, firstName: "John", lastName: "Doe" })
  }

  function register(username, firstName, lastName, _password) {
    // Replace with real API call
    setUser({ username, firstName, lastName })
  }

  function logout() {
    setUser(null)
  }

  function updateProfile(firstName, lastName) {
    setUser(prev => ({ ...prev, firstName, lastName }))
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}