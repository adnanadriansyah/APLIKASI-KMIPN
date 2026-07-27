import api from './axios'

export async function getJadwalRonda(params = {}) {
  const { data } = await api.get('/api/ronda/jadwal', { params })
  return data
}

export async function createJadwalRonda(payload) {
  const { data } = await api.post('/api/ronda/jadwal', payload)
  return data
}

export async function generateQrCode(jadwalRondaPetugasId) {
  const { data } = await api.post('/api/ronda/qrcode/generate', {
    jadwal_ronda_petugas_id: jadwalRondaPetugasId,
  })
  return data
}

export async function scanQrCode(code) {
  const { data } = await api.post('/api/ronda/qrcode/scan', { code })
  return data
}
