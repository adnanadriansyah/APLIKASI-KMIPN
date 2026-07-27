import api from './axios'

export async function triggerPanic(payload) {
  const { data } = await api.post('/api/panic', payload)
  return data
}

export async function getActivePanics(params = {}) {
  const { data } = await api.get('/api/panic/active', { params })
  return data
}

export async function getPanicHistory(params = {}) {
  const { data } = await api.get('/api/panic/history', { params })
  return data
}

export async function respondPanic(id) {
  const { data } = await api.put(`/api/panic/${id}/respond`)
  return data
}
