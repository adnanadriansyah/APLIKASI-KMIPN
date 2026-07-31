import api from './axios'

export function searchGlobal(q, signal) {
  return api.get('/api/search', { params: { q }, signal }).then((res) => res.data.data || [])
}
