import api from './axios'

export async function getRumahKosong(params = {}) {
  const { data } = await api.get('/api/rumah-kosong', { params })
  return data
}

export async function createRumahKosong(payload) {
  const { data } = await api.post('/api/rumah-kosong', payload)
  return data
}

export async function deleteRumahKosong(id) {
  const { data } = await api.delete(`/api/rumah-kosong/${id}`)
  return data
}

export async function updateRumahKosong(id, payload) {
  const { data } = await api.put(`/api/rumah-kosong/${id}`, payload)
  return data
}
