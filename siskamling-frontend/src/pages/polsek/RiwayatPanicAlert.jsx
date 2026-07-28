import { useEffect, useState, useCallback } from 'react'
import { getPanicHistory, respondPanic, completePanic } from '../../api/panic'
import { Card, Table, Badge, LoadingSpinner } from '../../components'

export default function RiwayatPanicAlert() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')

  const fetchData = useCallback((p = 1, status = '') => {
    setLoading(true)
    const params = { page: p, per_page: 10 }
    if (status) params.status = status
    getPanicHistory(params)
      .then((res) => {
        setData(res.data || [])
        setMeta(res.meta || null)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchData(page, statusFilter) }, [page, statusFilter, fetchData])

  const handleRespond = async (id) => {
    try {
      await respondPanic(id)
      fetchData(page, statusFilter)
    } catch (e) {
      alert('Gagal merespon: ' + (e.response?.data?.message || e.message))
    }
  }

  const handleComplete = async (id) => {
    try {
      await completePanic(id)
      fetchData(page, statusFilter)
    } catch (e) {
      alert('Gagal selesaikan: ' + (e.response?.data?.message || e.message))
    }
  }

  const statusColor = (s) => {
    if (s === 'terkirim') return 'danger'
    if (s === 'direspon') return 'warning'
    if (s === 'selesai') return 'success'
    return 'neutral'
  }

  const statusLabel = (s) => {
    if (s === 'terkirim') return 'Terkirim'
    if (s === 'direspon') return 'Direspon'
    if (s === 'selesai') return 'Selesai'
    return s
  }

  const columns = [
    {
      key: 'user', label: 'Pelapor',
      render: (r) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{r.user?.nama || '-'}</div>
          {r.user?.jabatan && <div className="text-xs text-gray-500">{r.user.jabatan}</div>}
          {r.user?.phone && <div className="text-xs text-gray-400">{r.user.phone}</div>}
        </div>
      ),
    },
    {
      key: 'latitude', label: 'Lokasi',
      render: (r) => (
        <div className="text-xs text-gray-500">
          {r.latitude && r.longitude ? `${r.latitude}, ${r.longitude}` : '-'}
        </div>
      ),
    },
    {
      key: 'status', label: 'Status',
      render: (r) => <Badge color={statusColor(r.status)}>{statusLabel(r.status)}</Badge>,
    },
    {
      key: 'responded_by', label: 'Direspon Oleh',
      render: (r) => r.responded_by ? (
        <div>
          <div className="text-sm text-gray-900">{r.responded_by.nama}</div>
          {r.responded_by.jabatan && <div className="text-xs text-gray-500">{r.responded_by.jabatan}</div>}
        </div>
      ) : <span className="text-gray-400">-</span>,
    },
    {
      key: 'created_at', label: 'Waktu Kejadian',
      render: (r) => r.created_at ? new Date(r.created_at).toLocaleString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      }) : '-',
    },
    {
      key: 'responded_at', label: 'Waktu Respon',
      render: (r) => r.responded_at ? new Date(r.responded_at).toLocaleString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      }) : '-',
    },
    {
      key: 'completed_by', label: 'Diselesaikan Oleh',
      render: (r) => r.completed_by ? (
        <div>
          <div className="text-sm text-gray-900">{r.completed_by.nama}</div>
          {r.completed_by.jabatan && <div className="text-xs text-gray-500">{r.completed_by.jabatan}</div>}
        </div>
      ) : <span className="text-gray-400">-</span>,
    },
    {
      key: 'aksi', label: 'Aksi',
      render: (r) => (
        <div className="flex gap-1">
          {r.status === 'terkirim' && (
            <button onClick={() => handleRespond(r.id)}
              className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200">
              Respon
            </button>
          )}
          {r.status === 'direspon' && (
            <button onClick={() => handleComplete(r.id)}
              className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200">
              Selesai
            </button>
          )}
        </div>
      ),
    },
  ]

  const filters = [
    { value: '', label: 'Semua' },
    { value: 'terkirim', label: 'Terkirim' },
    { value: 'direspon', label: 'Direspon' },
    { value: 'selesai', label: 'Selesai' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Riwayat Panic Alert</h1>
          <p className="text-sm text-gray-500 mt-0.5">Data dari MySQL &middot; Source of truth</p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {filters.map((f) => (
            <button key={f.value} onClick={() => { setStatusFilter(f.value); setPage(1); }}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${statusFilter === f.value ? 'bg-white text-gray-900 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        {loading ? (
          <LoadingSpinner className="py-12" />
        ) : (
          <Table columns={columns} data={data} emptyText="Belum ada riwayat panic alert" />
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
