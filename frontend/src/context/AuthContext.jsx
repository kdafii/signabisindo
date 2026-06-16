import { createContext, useContext, useState } from "react"

const API = import.meta.env.VITE_API_BASE_URL
const AuthContext = createContext(null)

async function fetchUser(user_id, access_token) {
  const res = await fetch(`${API}/users/${user_id}`, {
    headers: { Authorization: `Bearer ${access_token}` },
  })
  if (!res.ok) throw new Error("Gagal mengambil data user")
  return res.json()
}

export function AuthProvider({ children }) {
  // null = not logged in, object = logged in user
  const [user, setUser] = useState(null)

  async function login(username, password) {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail ?? "Login gagal")
    }

    const { access_token, user_id } = await res.json()
    const profile = await fetchUser(user_id, access_token)
    setUser({ ...profile, access_token })
  }

  async function register(username, firstName, lastName, password) {
    const res = await fetch(`${API}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        first_name: firstName,
        last_name: lastName,
        password,
      }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail ?? "Registrasi gagal")
    }

    const { access_token, user_id } = await res.json()
    const profile = await fetchUser(user_id, access_token)
    setUser({ ...profile, access_token })
  }

  function logout() {
    setUser(null)
  }

  async function updateProfile(firstName, lastName) {
    const res = await fetch(`${API}/users/${user.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.access_token}`,
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail ?? "Gagal update profil")
    }

    const updated = await res.json()
    setUser(prev => ({ ...updated, access_token: prev.access_token }))
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