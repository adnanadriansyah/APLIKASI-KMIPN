import { useEffect, useState, useCallback } from 'react'
import { getKamtibmas, updateKamtibmasStatus } from '../../api/kamtibmas'
import { Card, Table, Badge, LoadingSpinner } from '../../components'
import { useToast } from '../../components/Toast'

export default function DesaKamtibmas() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)
  const toast = useToast()

  const load = useCallback((p = 1) => {
    setLoading(true)
    getKamtibmas({ page: p, per_page: 10 })
      .then((res) => {
        setData(res.data || [])
        setMeta(res.meta || null)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load(page) }, [page, load])

  const handleStatus = async (id, status) => {
    try {
      await updateKamtibmasStatus(id, status)
      toast.success(`Status diubah ke ${status}`)
      load(page)
    } catch (e) {
      toast.error('Gagal update status: ' + (e.response?.data?.message || e.message))
    }
  }

  const statusColor = (s) => s === 'baru' ? 'danger' : s === 'diproses' ? 'warning' : 'success'

  const columns = [
    { key: 'kategori', label: 'Kategori' },
    {
      key: 'user', label: 'Pelapor',
      render: (r) => r.user?.nama || '-',
    },
    { key: 'lokasi_text', label: 'Lokasi' },
    {
      key: 'created_at', label: 'Waktu',
      render: (r) => r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : '-',
    },
    {
      key: 'status', label: 'Status',
      render: (r) => <Badge color={statusColor(r.status)}>{r.status}</Badge>,
    },
    {
      key: 'aksi', label: 'Aksi',
      render: (r) => (
        <div className="flex gap-1">
          {r.status === 'baru' && (
            <button onClick={() => handleStatus(r.id, 'diproses')} className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition-colors">
              Proses
            </button>
          )}
          {r.status === 'diproses' && (
            <button onClick={() => handleStatus(r.id, 'selesai')} className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition-colors">
              Selesai
            </button>
          )}
          {r.status === 'selesai' && (
            <span className="text-xs text-gray-400 px-2">Selesai</span>
          )}
        </div>
      ),
    },
  ]

  if (loading) return <LoadingSpinner className="py-20" />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Laporan Kamtibmas</h1>
      </div>

      <Card>
        <Table columns={columns} data={data} emptyText="Belum ada laporan" />
      </Card>

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            Sebelumnya
          </button>
          <span className="text-sm text-gray-500">Halaman {meta.current_page} / {meta.last_page}</span>
          <button
            onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
            disabled={page >= meta.last_page}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  )
}
