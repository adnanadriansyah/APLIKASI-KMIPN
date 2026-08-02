import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getKamtibmas, getKamtibmasDetail, updateKamtibmasStatus, deleteKamtibmas } from '../../api/kamtibmas'
import { Play, MapPin, Printer, Trash2, CheckCircle2, Search } from 'lucide-react'
import { Card, Table, Badge, Modal, LoadingSpinner } from '../../components'
import { useToast } from '../../components/Toast'

const STATUS_OPTIONS = [
  { value: 'baru', label: 'Baru', color: 'danger' },
  { value: 'diproses', label: 'Diproses', color: 'warning' },
  { value: 'selesai', label: 'Selesai', color: 'success' },
]

const URGENCY_COLOR = { rendah: 'success', sedang: 'warning', tinggi: 'danger' }

export default function ManajemenLaporan() {
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  const [detailOpen, setDetailOpen] = useState(false)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetchData = useCallback((p = 1, status = '', q = '') => {
    setLoading(true)
    const params = { page: p, per_page: 10 }
    if (status) params.status = status
    if (q) params.search = q
    getKamtibmas(params)
      .then((res) => {
        setData(res.data || [])
        setMeta(res.meta || null)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchData(page, statusFilter, search) }, [page, statusFilter, search, fetchData])

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setSearch(q)
      setPage(1)
    }
  }, [searchParams])

  const openDetail = async (id) => {
    setDetailOpen(true)
    setDetailLoading(true)
    try {
      const res = await getKamtibmasDetail(id)
      setDetail(res.data)
    } catch (e) {
      toast.error('Gagal memuat detail: ' + (e.response?.data?.message || e.message))
      setDetailOpen(false)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleStatusUpdate = async (id, newStatus) => {
    setUpdating(true)
    try {
      await updateKamtibmasStatus(id, newStatus)
      const statusLabel = STATUS_OPTIONS.find((s) => s.value === newStatus)?.label || newStatus
      setDetail((prev) => prev ? { ...prev, status: newStatus, status_label: statusLabel } : prev)
      fetchData(page, statusFilter, search)
      toast.success(newStatus === 'selesai' ? 'Laporan selesai ditangani' : 'Laporan sedang diproses')
      setTimeout(() => setDetailOpen(false), 700)
    } catch (e) {
      toast.error('Gagal update status: ' + (e.response?.data?.message || e.message))
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Yakin ingin menghapus laporan ini?')) return
    setDeleting(true)
    try {
      await deleteKamtibmas(detail.id)
      toast.success('Laporan berhasil dihapus')
      setDetailOpen(false)
      fetchData(page, statusFilter, search)
    } catch (e) {
      toast.error('Gagal menghapus: ' + (e.response?.data?.message || e.message))
    } finally {
      setDeleting(false)
    }
  }

  const handlePrint = () => {
    if (!detail) return
    const w = window.open('', '_blank', 'width=800,height=600')
    if (!w) return
    const mediaHtml = (detail.media || []).length
      ? `<div style="margin-top:12px;color:#475569;font-size:13px"><strong style="display:block;margin-bottom:6px">Media (${detail.media.length} file)</strong>${detail.media.map((m) => `<a href="${m.file_url}" target="_blank" style="display:inline-block;margin-right:8px;padding:4px 10px;border:1px solid #cbd5e1;border-radius:8px;text-decoration:none;color:#2563eb">${m.type}</a>`).join('')}</div>`
      : ''
    w.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Laporan Kamtibmas</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; color: #0f172a; padding: 40px; }
    .header { border-bottom: 2px solid #1e40af; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { font-size: 22px; color: #1e40af; }
    .header p { font-size: 13px; color: #64748b; margin-top: 4px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 24px; margin-bottom: 20px; }
    .field { margin-bottom: 14px; }
    .field .label { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #94a3b8; margin-bottom: 3px; }
    .field .value { font-size: 14px; color: #0f172a; }
    .section { border-top: 1px solid #e2e8f0; padding-top: 14px; margin-top: 14px; }
    .section .title { font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 6px; }
    .section p { font-size: 13px; line-height: 1.6; color: #475569; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Laporan Kamtibmas</h1>
    <p>Dicetak ${new Date().toLocaleString('id-ID')} &middot; Siskamling Digital &middot; Gampong Kandang, Lhokseumawe</p>
  </div>
  <div class="grid">
    <div class="field"><div class="label">Nomor / ID</div><div class="value">#${detail.id}</div></div>
    <div class="field"><div class="label">Status</div><div class="value"><span class="badge" style="background:#eff6ff;color:#1d4ed8">${detail.status_label || detail.status}</span></div></div>
    <div class="field"><div class="label">Pelapor</div><div class="value">${detail.user?.nama || '-'}</div></div>
    <div class="field"><div class="label">Kontak Pelapor</div><div class="value">${detail.user?.phone || '-'}</div></div>
    <div class="field"><div class="label">Lingkungan</div><div class="value">${detail.dusun?.nama || '-'}</div></div>
    <div class="field"><div class="label">Kategori</div><div class="value">${detail.kategori_label || '-'}</div></div>
    <div class="field"><div class="label">Lokasi</div><div class="value">${detail.lokasi_text || '-'}</div></div>
    <div class="field"><div class="label">Tanggal Lapor</div><div class="value">${detail.created_at ? new Date(detail.created_at).toLocaleString('id-ID') : '-'}</div></div>
  </div>
  ${detail.kronologi ? `<div class="section"><div class="title">Kronologi</div><p>${detail.kronologi}</p></div>` : ''}
  ${detail.ai_summary ? `<div class="section"><div class="title">Ringkasan AI</div><p>${detail.ai_summary}</p></div>` : ''}
  ${mediaHtml}
</body>
</html>`)
    w.document.close()
    w.focus()
    w.print()
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Laporan Kamtibmas</h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Cari kronologi, pelapor, lokasi..."
              className="pl-9 pr-4 py-2 text-sm bg-gray-100/80 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white focus:border-blue-200 transition-all"
            />
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
                {detail.user?.phone && <div className="text-xs text-blue-600">{detail.user.phone}</div>}
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
                {detail.latitude && detail.longitude && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${detail.latitude},${detail.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    <MapPin size={13} /> Lihat di Google Maps
                  </a>
                )}
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
                <div className="flex flex-wrap gap-3">
                  {detail.media.map((m) => (
                    <a
                      key={m.id}
                      href={m.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                    >
                      {m.type === 'foto' ? (
                        <img
                          src={m.file_url}
                          alt="Bukti laporan"
                          className="h-24 w-32 object-cover rounded-lg border border-gray-200 group-hover:opacity-80 transition-opacity"
                        />
                      ) : (
                        <span className="inline-flex h-24 w-32 items-center justify-center gap-1.5 bg-gray-100 rounded-lg border border-gray-200 text-xs text-gray-500 group-hover:bg-gray-200 transition-colors">
                          <Play size={14} />
                          Video
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-400 mb-2">Tindak Lanjut</div>
              <div className="flex flex-wrap gap-2">
                {detail.status === 'baru' && (
                  <button
                    onClick={() => handleStatusUpdate(detail.id, 'diproses')}
                    disabled={updating}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40 transition-colors"
                  >
                    Proses Laporan
                  </button>
                )}
                {detail.status === 'diproses' && (
                  <button
                    onClick={() => handleStatusUpdate(detail.id, 'selesai')}
                    disabled={updating}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors"
                  >
                    Tandai Selesai
                  </button>
                )}
                {detail.status === 'selesai' && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 size={16} /> Laporan selesai ditangani
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Printer size={14} /> Cetak
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 disabled:opacity-40 transition-colors"
              >
                <Trash2 size={14} /> {deleting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
