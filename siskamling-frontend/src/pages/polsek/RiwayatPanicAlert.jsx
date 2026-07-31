import { useEffect, useState, useCallback } from 'react'
import { getPanicHistory, respondPanic, completePanic } from '../../api/panic'
import { MapPin, Printer, CheckCircle2 } from 'lucide-react'
import { Card, Table, Badge, Modal, LoadingSpinner } from '../../components'
import { useToast } from '../../components/Toast'

export default function RiwayatPanicAlert() {
  const toast = useToast()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(null)

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
      toast.success('Panic berhasil direspons')
      setSelected(null)
      fetchData(page, statusFilter)
    } catch (e) {
      toast.error('Gagal merespon: ' + (e.response?.data?.message || e.message))
    }
  }

  const handleComplete = async (id) => {
    try {
      await completePanic(id)
      toast.success('Panic selesai')
      setSelected(null)
      fetchData(page, statusFilter)
    } catch (e) {
      toast.error('Gagal selesaikan: ' + (e.response?.data?.message || e.message))
    }
  }

  const handlePrint = () => {
    if (!selected) return
    const w = window.open('', '_blank', 'width=800,height=600')
    if (!w) return
    const fmt = (d) => d ? new Date(d).toLocaleString('id-ID') : '-'
    w.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Riwayat Panic Alert</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; color: #0f172a; padding: 40px; }
    .header { border-bottom: 2px solid #b91c1c; padding-bottom: 16px; margin-bottom: 24px; }
    .header h1 { font-size: 22px; color: #b91c1c; }
    .header p { font-size: 13px; color: #64748b; margin-top: 4px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 24px; margin-bottom: 20px; }
    .field .label { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #94a3b8; margin-bottom: 3px; }
    .field .value { font-size: 14px; color: #0f172a; }
    .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Panic Alert</h1>
    <p>Dicetak ${new Date().toLocaleString('id-ID')} &middot; Siskamling Digital &middot; Gampong Kandang, Lhokseumawe</p>
  </div>
  <div class="grid">
    <div class="field"><div class="label">Nomor / ID</div><div class="value">#${selected.id}</div></div>
    <div class="field"><div class="label">Status</div><div class="value"><span class="badge" style="background:#fef2f2;color:#b91c1c">${statusLabel(selected.status)}</span></div></div>
    <div class="field"><div class="label">Pelapor</div><div class="value">${selected.user?.nama || '-'}</div></div>
    <div class="field"><div class="label">Kontak Pelapor</div><div class="value">${selected.user?.phone || '-'}</div></div>
    <div class="field"><div class="label">Lokasi</div><div class="value">${selected.latitude && selected.longitude ? selected.latitude + ', ' + selected.longitude : '-'}</div></div>
    <div class="field"><div class="label">Waktu Kejadian</div><div class="value">${fmt(selected.created_at)}</div></div>
    <div class="field"><div class="label">Direspon Oleh</div><div class="value">${selected.responded_by?.nama || '-'}</div></div>
    <div class="field"><div class="label">Waktu Respon</div><div class="value">${fmt(selected.responded_at)}</div></div>
    <div class="field"><div class="label">Diselesaikan Oleh</div><div class="value">${selected.completed_by?.nama || '-'}</div></div>
    <div class="field"><div class="label">Waktu Selesai</div><div class="value">${fmt(selected.completed_at)}</div></div>
  </div>
</body>
</html>`)
    w.document.close()
    w.focus()
    w.print()
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
      ) : <span className="text-gray-400">Belum direspons</span>,
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
      ) : <span className="text-gray-400">Belum diselesaikan</span>,
    },
    {
      key: 'aksi', label: 'Aksi',
      render: (r) => (
        <div className="flex gap-1">
          {r.status === 'terkirim' && (
            <button onClick={() => handleRespond(r.id)}
              className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded hover:bg-amber-200">
              Respon Panic
            </button>
          )}
          {r.status === 'direspon' && (
            <button onClick={() => handleComplete(r.id)}
              className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200">
              Tandai Selesai
            </button>
          )}
          <button onClick={() => setSelected(r)}
            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
            Detail
          </button>
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

      {/* Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Detail Panic Alert" size="lg">
        {selected && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Pelapor</div>
                <div className="text-sm font-medium text-gray-900">{selected.user?.nama}</div>
                {selected.user?.jabatan && <div className="text-xs text-gray-500">{selected.user.jabatan}</div>}
                {selected.user?.phone && <div className="text-xs text-blue-600">{selected.user.phone}</div>}
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Status</div>
                <Badge color={statusColor(selected.status)}>{statusLabel(selected.status)}</Badge>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Lokasi</div>
                <div className="text-sm text-gray-900">
                  {selected.latitude && selected.longitude ? `${selected.latitude}, ${selected.longitude}` : '-'}
                </div>
                {selected.latitude && selected.longitude && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${selected.latitude},${selected.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-blue-600 hover:text-blue-700"
                  >
                    <MapPin size={13} /> Lihat di Google Maps
                  </a>
                )}
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Waktu Kejadian</div>
                <div className="text-sm text-gray-900">
                  {selected.created_at ? new Date(selected.created_at).toLocaleString('id-ID') : '-'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Direspon Oleh</div>
                {selected.responded_by ? (
                  <>
                    <div className="text-sm text-gray-900">{selected.responded_by.nama}</div>
                    {selected.responded_at && (
                      <div className="text-xs text-gray-500">
                        {new Date(selected.responded_at).toLocaleString('id-ID')}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-gray-400 italic">Belum direspons</div>
                )}
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-0.5">Diselesaikan Oleh</div>
                {selected.completed_by ? (
                  <>
                    <div className="text-sm text-gray-900">{selected.completed_by.nama}</div>
                    {selected.completed_at && (
                      <div className="text-xs text-gray-500">
                        {new Date(selected.completed_at).toLocaleString('id-ID')}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-gray-400 italic">Belum diselesaikan</div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-400 mb-2">Tindak Lanjut</div>
              <div className="flex flex-wrap gap-2">
                {selected.status === 'terkirim' && (
                  <button
                    onClick={() => handleRespond(selected.id)}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                  >
                    Respon Panic
                  </button>
                )}
                {selected.status === 'direspon' && (
                  <button
                    onClick={() => handleComplete(selected.id)}
                    className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    Tandai Selesai
                  </button>
                )}
                {selected.status === 'selesai' && (
                  <span className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 size={16} /> Panic telah diselesaikan
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
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
