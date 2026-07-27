import api from './axios'

export async function getLinmas(params = {}) {
  const { data } = await api.get('/api/linmas', { params })
  return data
}

export async function createLinmas(payload) {
  const { data } = await api.post('/api/linmas', payload)
  return data
}

export async function updateLinmas(id, payload) {
  const { data } = await api.put(`/api/linmas/${id}`, payload)
  return data
}

export async function deleteLinmas(id) {
  const { data } = await api.delete(`/api/linmas/${id}`)
  return data
}
