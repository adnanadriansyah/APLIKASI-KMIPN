import api from './axios'

export async function getKamtibmas(params = {}) {
  const { data } = await api.get('/api/kamtibmas', { params })
  return data
}

export async function createKamtibmas(formData) {
  const { data } = await api.post('/api/kamtibmas', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function getKamtibmasDetail(id) {
  const { data } = await api.get(`/api/kamtibmas/${id}`)
  return data
}

export async function updateKamtibmasStatus(id, status) {
  const { data } = await api.put(`/api/kamtibmas/${id}/status`, { status })
  return data
}
