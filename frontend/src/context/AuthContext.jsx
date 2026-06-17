import { createContext, useContext, useState, useEffect } from "react"

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
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)  // cegah flash redirect ke login

  // restore session saat app load
  useEffect(() => {
    const token   = localStorage.getItem("access_token")
    const user_id = localStorage.getItem("user_id")

    if (token && user_id) {
      fetchUser(Number(user_id), token)
        .then(profile => setUser({ ...profile, access_token: token }))
        .catch(() => localStorage.clear())  // token expired/invalid, clear
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

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
    localStorage.setItem("access_token", access_token)
    localStorage.setItem("user_id", user_id)

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
    localStorage.setItem("access_token", access_token)
    localStorage.setItem("user_id", user_id)

    const profile = await fetchUser(user_id, access_token)
    setUser({ ...profile, access_token })
  }

  function logout() {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user_id")
    setUser(null)
  }

  async function updateProfile(firstName, lastName) {
    const res = await fetch(`${API}/users/${user.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.access_token}`,
      },
      body: JSON.stringify({ first_name: firstName, last_name: lastName }),
    })

    if (res.status === 401) {
      logout()  // token expired → langsung logout
      return
    }

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.detail ?? "Gagal update profil")
    }
    const updated = await res.json()
    setUser(prev => ({ ...updated, access_token: prev.access_token }))
  }

  // jangan render apapun sampai session restore selesai
  if (loading) return null

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