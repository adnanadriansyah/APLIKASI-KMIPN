import api from './axios'

export async function getWarga(params = {}) {
  const { data } = await api.get('/api/warga', { params })
  return data
}

export async function getWargaDetail(id) {
  const { data } = await api.get(`/api/warga/${id}`)
  return data
}

export async function createWarga(payload) {
  const { data } = await api.post('/api/warga', payload)
  return data
}

export async function updateWarga(id, payload) {
  const { data } = await api.put(`/api/warga/${id}`, payload)
  return data
}

export async function deleteWarga(id) {
  const { data } = await api.delete(`/api/warga/${id}`)
  return data
}

export async function getDusuns() {
  const { data } = await api.get('/api/warga/meta/dusuns')
  return data
}
