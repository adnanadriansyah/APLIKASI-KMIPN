import { useEffect, useState, useRef, useCallback } from 'react'
import { getJadwalRonda, generateQrCode } from '../../api/ronda'
import { Card, Table, Badge, Modal, LoadingSpinner } from '../../components'

export default function WargaRonda() {
  const [jadwal, setJadwal] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)

  const [qrOpen, setQrOpen] = useState(false)
  const [qrData, setQrData] = useState(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [qrError, setQrError] = useState(null)
  const [countdown, setCountdown] = useState(0)
  const timerRef = useRef(null)

  const fetchJadwal = useCallback((p = 1) => {
    setLoading(true)
    getJadwalRonda({ page: p, per_page: 10 })
      .then((res) => {
        setJadwal(res.data || [])
        setMeta(res.meta || null)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchJadwal(page) }, [page, fetchJadwal])

  useEffect(() => {
    if (!qrData?.expired_at) return
    const tick = () => {
      const diff = Math.max(0, Math.floor((new Date(qrData.expired_at).getTime() - Date.now()) / 1000))
      setCountdown(diff)
      if (diff <= 0) clearInterval(timerRef.current)
    }
    tick()
    timerRef.current = setInterval(tick, 1000)
    return () => clearInterval(timerRef.current)
  }, [qrData])

  const handleGenerateQR = async (jadwalRondaPetugasId) => {
    setQrLoading(true)
    setQrError(null)
    setQrData(null)
    setQrOpen(true)
    try {
      const res = await generateQrCode(jadwalRondaPetugasId)
      setQrData(res.data)
    } catch (e) {
      const status = e.response?.status
      const responseData = e.response?.data

      if (status === 409 && responseData?.data?.code) {
        setQrData(responseData.data)
      } else if (status === 409) {
        setQrError(responseData?.message || 'QR code sudah digunakan atau kedaluwarsa.')
      } else {
        setQrError(responseData?.message || 'Gagal generate QR Code. Silakan coba lagi.')
      }
    } finally {
      setQrLoading(false)
    }
  }

  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const shiftLabel = (shift) => {
    if (shift === 'malam') return 'Malam (20:00–02:00)'
    if (shift === 'subuh') return 'Subuh (02:00–06:00)'
    return shift
  }

  const statusColor = (s) => {
    if (s === 'berlangsung') return 'warning'
    if (s === 'selesai') return 'success'
    return 'info'
  }

  const columns = [
    { key: 'tanggal', label: 'Tanggal' },
    { key: 'shift', label: 'Shift', render: (r) => shiftLabel(r.shift) },
    { key: 'dusun', label: 'Lingkungan', render: (r) => r.dusun?.nama },
    { key: 'petugas', label: 'Petugas', render: (r) => `${r.petugas?.length || 0} orang` },
    {
      key: 'status', label: 'Status',
      render: (r) => <Badge color={statusColor(r.status)}>{r.status}</Badge>,
    },
    {
      key: 'aksi', label: 'Aksi',
      render: (r) => {
        const petugasId = r.petugas?.[0]?.id
        if (!petugasId) return <span className="text-xs text-gray-400">-</span>
        return (
          <button
            onClick={() => handleGenerateQR(petugasId)}
            disabled={qrLoading}
            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            Generate QR
          </button>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Jadwal Ronda</h1>

      <Card>
        {loading ? (
          <LoadingSpinner className="py-12" />
        ) : (
          <Table columns={columns} data={jadwal} emptyText="Belum ada jadwal ronda" />
        )}
      </Card>

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
          >
            Sebelumnya
          </button>
          <span className="text-sm text-gray-500">Halaman {meta.current_page} / {meta.last_page}</span>
          <button
            onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
            disabled={page >= meta.last_page}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
          >
            Berikutnya
          </button>
        </div>
      )}

      <Modal isOpen={qrOpen} onClose={() => { setQrOpen(false); setQrData(null); setQrError(null); }} title="QR Code Presensi Ronda" size="sm">
        {qrLoading ? (
          <LoadingSpinner className="py-8" />
        ) : qrError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 text-center">
            {qrError}
          </div>
        ) : qrData?.qrcode_svg ? (
          <div className="flex flex-col items-center gap-4">
            <div
              dangerouslySetInnerHTML={{ __html: qrData.qrcode_svg }}
              className="w-48 h-48 bg-white rounded-xl p-2 border border-gray-200 [&_svg]:w-full [&_svg]:h-full"
            />

            {countdown > 0 ? (
              <div className="text-center">
                <div className="text-3xl font-mono font-bold text-blue-600">{formatCountdown(countdown)}</div>
                <div className="text-xs text-gray-500 mt-1">Tersisa hingga QR expired</div>
              </div>
            ) : (
              <div className="text-sm text-red-500 font-medium">QR sudah expired atau sudah dipakai</div>
            )}

            <div className="text-xs text-gray-400 text-center">
              Tunjukkan QR ini kepada petugas ronda untuk presensi kehadiran.
            </div>
          </div>
        ) : qrData ? (
          <div className="text-center py-8">
            <p className="text-sm text-red-500">Gagal memuat QR Code</p>
            <p className="text-xs text-gray-400 mt-1">Data QR tidak ditemukan dalam response</p>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
