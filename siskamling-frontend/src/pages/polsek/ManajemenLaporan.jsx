import { useEffect, useState, useCallback } from 'react'
import { getKamtibmas, getKamtibmasDetail, updateKamtibmasStatus } from '../../api/kamtibmas'
import { Card, Table, Badge, Modal, LoadingSpinner } from '../../components'

const STATUS_OPTIONS = [
  { value: 'baru', label: 'Baru', color: 'danger' },
  { value: 'diproses', label: 'Diproses', color: 'warning' },
  { value: 'selesai', label: 'Selesai', color: 'success' },
]

const URGENCY_COLOR = { rendah: 'success', sedang: 'warning', tinggi: 'danger' }

export default function ManajemenLaporan() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')

  const [detailOpen, setDetailOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [updating, setUpdating] = useState(false)

  const fetchData = useCallback((p = 1, status = '') => {
    setLoading(true)
    const params = { page: p, per_page: 10 }
    if (status) params.status = status
    getKamtibmas(params)
      .then((res) => {
        setData(res.data || [])
        setMeta(res.meta || null)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchData(page, statusFilter) }, [page, statusFilter, fetchData])

  const openDetail = async (id) => {
    setDetailOpen(true)
    setDetailLoading(true)
    try {
      const res = await getKamtibmasDetail(id)
      setDetail(res.data)
    } catch (e) {
      alert('Gagal memuat detail: ' + (e.response?.data?.message || e.message))
      setDetailOpen(false)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdating(true)
    try {
      await updateKamtibmasStatus(id, newStatus)
      setDetail((prev) => prev ? { ...prev, status: newStatus, status_label: STATUS_OPTIONS.find((s) => s.value === newStatus)?.label || newStatus } : prev)
      fetchData(page, statusFilter)
    } catch (e) {
      alert('Gagal update status: ' + (e.response?.data?.message || e.message))
    } finally {
      setUpdating(false)
    }
  }

  const statusColor = (s) => STATUS_OPTIONS.find((o) => o.value === s)?.color || 'neutral'

  const columns = [
    { key: 'user', label: 'Pelapor', render: (r) => r.user?.nama || '-' },
    { key: 'kategori_label', label: 'Kategori' },
    { key: 'dusun', label: 'Lingkungan', render: (r) => r.dusun?.nama || '-' },
    { key: 'lokasi_text', label: 'Lokasi', render: (r) => r.lokasi_text || '-' },
    {
      key: 'ai_summary', label: 'AI Summary',
      render: (r) => r.ai_summary ? (
        <div className="text-xs text-gray-600 max-w-[200px] truncate" title={r.ai_summary}>{r.ai_summary}</div>
      ) : <span className="text-gray-400">-</span>,
    },
    {
      key: 'urgency', label: 'Urgensi',
      render: (r) => r.ai_urgency_level ? (
        <Badge color={URGENCY_COLOR[r.ai_urgency_level] || 'neutral'}>{r.ai_urgency_level}</Badge>
      ) : <span className="text-gray-400">-</span>,
    },
    {
      key: 'status_label', label: 'Status',
      render: (r) => <Badge color={statusColor(r.status)}>{r.status_label}</Badge>,
    },
    {
      key: 'aksi', label: 'Aksi',
      render: (r) => (
        <button onClick={() => openDetail(r.id)} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
          Detail
        </button>
      ),
    },
  ]

  const filters = [
    { value: '', label: 'Semua' },
    { value: 'baru', label: 'Baru' },
    { value: 'diproses', label: 'Diproses' },
    { value: 'selesai', label: 'Selesai' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Laporan Kamtibmas</h1>
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
          <Table columns={columns} data={data} emptyText="Belum ada laporan kamtibmas" />
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

      {/* Detail Modal */}
      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Detail Laporan Kamtibmas" size="lg">
        {detailLoading ? (
          <LoadingSpinner className="py-8" />
        ) : detail ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Pelapor</div>
                <div className="text-sm font-medium text-gray-900">{detail.user?.nama}</div>
                {detail.user?.jabatan && <div className="text-xs text-gray-500">{detail.user.jabatan}</div>}
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Lingkungan</div>
                <div className="text-sm font-medium text-gray-900">{detail.dusun?.nama}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Kategori</div>
                <div className="text-sm font-medium text-gray-900">{detail.kategori_label}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Lokasi</div>
                <div className="text-sm text-gray-900">{detail.lokasi_text || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Tanggal</div>
                <div className="text-sm text-gray-900">{detail.created_at ? new Date(detail.created_at).toLocaleString('id-ID') : '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Status Saat Ini</div>
                <Badge color={statusColor(detail.status)}>{detail.status_label}</Badge>
              </div>
            </div>

            {detail.kronologi && (
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Kronologi</div>
                <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 whitespace-pre-wrap">{detail.kronologi}</div>
              </div>
            )}

            {detail.ai_summary && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="text-xs font-medium text-purple-600 mb-1">Ringkasan AI</div>
                <div className="text-sm text-purple-800">{detail.ai_summary}</div>
                {detail.ai_urgency_level && (
                  <div className="mt-2">
                    <span className="text-xs text-purple-500">Urgensi: </span>
                    <Badge color={URGENCY_COLOR[detail.ai_urgency_level] || 'neutral'}>{detail.ai_urgency_level}</Badge>
                  </div>
                )}
              </div>
            )}

            {detail.media?.length > 0 && (
              <div>
                <div className="text-xs text-gray-400 mb-1">Media ({detail.media.length} file)</div>
                <div className="flex gap-2 flex-wrap">
                  {detail.media.map((m) => (
                    <span key={m.id} className="text-xs bg-gray-100 px-2 py-1 rounded">{m.type}: {m.file_path?.split('/').pop()}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-400 mb-2">Ubah Status</div>
              <div className="flex gap-2">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleStatusUpdate(detail.id, opt.value)}
                    disabled={updating || detail.status === opt.value}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition-colors disabled:opacity-40 ${
                      detail.status === opt.value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
