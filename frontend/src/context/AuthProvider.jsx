import { useEffect, useState } from 'react'
import { getCurrentUser, loginUser, registerUser } from '../services/authService'
import { AuthContext } from './authContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('skillswap_token')))

  useEffect(() => {
    const token = localStorage.getItem('skillswap_token')

    if (!token) {
      return
    }

    getCurrentUser()
      .then(setUser)
      .catch(() => localStorage.removeItem('skillswap_token'))
      .finally(() => setLoading(false))
  }, [])

  function saveAuthentication(authResponse) {
    localStorage.setItem('skillswap_token', authResponse.token)
    setUser(authResponse.user)
  }

  async function register(formData) {
    const response = await registerUser(formData)
    saveAuthentication(response)
  }

  async function login(formData) {
    const response = await loginUser(formData)
    saveAuthentication(response)
  }

  function logout() {
    localStorage.removeItem('skillswap_token')
    setUser(null)
  }

  function updateUserName(name) {
    setUser((currentUser) => ({ ...currentUser, name }))
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateUserName }}>
      {children}
    </AuthContext.Provider>
  )
}
