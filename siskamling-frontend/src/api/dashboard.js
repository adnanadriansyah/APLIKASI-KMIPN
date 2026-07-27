import api from './axios'

export async function getPolsekSummary() {
  const { data } = await api.get('/api/dashboard/polsek')
  return data.data
}

export async function getDesaSummary() {
  const { data } = await api.get('/api/dashboard/desa')
  return data.data
}

export async function getWargaSummary() {
  const { data } = await api.get('/api/dashboard/warga')
  return data.data
}

export async function generateAiInsight() {
  const { data } = await api.post('/api/dashboard/desa/ai-insight/generate')
  return data
}

export async function getAiInsight() {
  const { data } = await api.get('/api/dashboard/desa/ai-insight')
  return data.data
}
