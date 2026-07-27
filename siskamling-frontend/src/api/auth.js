import api, { initAuth } from './axios'

export async function login(email, password) {
  await initAuth()
  const { data } = await api.post('/api/login', { email, password })
  return data.user
}

export async function logout() {
  await api.post('/api/logout')
}

export async function fetchUser() {
  const { data } = await api.get('/api/user')
  return data
}
