import { useEffect, useState, useCallback } from 'react'
import { getRumahKosong } from '../../api/rumahKosong'
import { Card, Table, Badge, LoadingSpinner } from '../../components'

export default function RekapRumahKosong() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')

  const fetchData = useCallback((p = 1, status = '') => {
    setLoading(true)
    const params = { page: p, per_page: 10 }
    if (status) params.status = status
    getRumahKosong(params)
      .then((res) => {
        setData(res.data || [])
        setMeta(res.meta || null)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchData(page, statusFilter) }, [page, statusFilter, fetchData])

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
