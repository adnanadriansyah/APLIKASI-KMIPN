import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getRumahKosong } from '../../api/rumahKosong'
import { getDusuns } from '../../api/warga'
import { Search } from 'lucide-react'
import { Card, Table, Badge, LoadingSpinner } from '../../components'

export default function RekapRumahKosong() {
  const [searchParams] = useSearchParams()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [dusunFilter, setDusunFilter] = useState('')
  const [search, setSearch] = useState('')
  const [dusuns, setDusuns] = useState([])

  const fetchData = useCallback((p = 1, status = '', dusunId = '', q = '') => {
    setLoading(true)
    const params = { page: p, per_page: 10 }
    if (status) params.status = status
    if (dusunId) params.dusun_id = dusunId
    if (q) params.search = q
    getRumahKosong(params)
      .then((res) => {
        setData(res.data || [])
        setMeta(res.meta || null)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchData(page, statusFilter, dusunFilter, search) }, [page, statusFilter, dusunFilter, search, fetchData])

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setSearch(q)
      setPage(1)
    }
  }, [searchParams])

  useEffect(() => {
    getDusuns().then((res) => setDusuns(res.data || [])).catch(console.error)
  }, [])

  const handleFilterChange = (status) => {
    setStatusFilter(status)
    setPage(1)
  }

  const columns = [
    {
      key: 'user', label: 'Pelapor',
      render: (r) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{r.user?.nama || '-'}</div>
          {r.user?.jabatan && <div className="text-xs text-gray-500">{r.user.jabatan}</div>}
        </div>
      ),
    },
    { key: 'alamat', label: 'Alamat' },
    { key: 'nama_penghuni', label: 'Penghuni', render: (r) => r.nama_penghuni || '-' },
    {
      key: 'tanggal_berangkat', label: 'Berangkat',
      render: (r) => new Date(r.tanggal_berangkat).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    },
    {
      key: 'tanggal_pulang', label: 'Pulang',
      render: (r) => new Date(r.tanggal_pulang).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    },
    { key: 'kontak_darurat', label: 'Kontak Darurat', render: (r) => r.kontak_darurat || '-' },
    {
      key: 'status', label: 'Status',
      render: (r) => <Badge color={r.status === 'aktif' ? 'warning' : 'success'}>{r.status === 'aktif' ? 'Aktif' : 'Selesai'}</Badge>,
    },
  ]

  const filters = [
    { value: '', label: 'Semua' },
    { value: 'aktif', label: 'Aktif' },
    { value: 'selesai', label: 'Selesai' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Rekap Rumah Kosong</h1>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => handleFilterChange(f.value)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                statusFilter === f.value
                  ? 'bg-white text-gray-900 shadow-sm font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Cari pelapor, penghuni, alamat..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100/80 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white focus:border-blue-200 transition-all"
          />
        </div>
        <select
          value={dusunFilter}
          onChange={(e) => { setDusunFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm bg-gray-100/80 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white focus:border-blue-200 transition-all"
        >
          <option value="">Semua Dusun</option>
          {dusuns.map((d) => (
            <option key={d.id} value={d.id}>{d.nama}</option>
          ))}
        </select>
      </div>

      <Card>
        {loading ? (
          <LoadingSpinner className="py-12" />
        ) : (
          <Table columns={columns} data={data} emptyText="Tidak ada laporan rumah kosong" />
        )}
      </Card>

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
            Sebelumnya
          </button>
          <span className="text-sm text-gray-500">Halaman {meta.current_page} / {meta.last_page}</span>
          <button onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))} disabled={page >= meta.last_page}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
            Berikutnya
          </button>
        </div>
      )}
    </div>
  )
}
