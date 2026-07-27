import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

let authInitialized = false

export async function initAuth() {
  if (authInitialized) return
  try {
    await api.get('/sanctum/csrf-cookie')
    authInitialized = true
  } catch (err) {
    console.error('Gagal inisialisasi CSRF cookie:', err)
    throw err
  }
}

export function resetAuthInit() {
  authInitialized = false
}

export default api
