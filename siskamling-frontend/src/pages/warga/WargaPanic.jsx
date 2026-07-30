import { useEffect, useState } from 'react'
import { Card, Badge, LoadingSpinner } from '../../components'
import { useToast } from '../../components/Toast'
import { triggerPanic, getPanicHistory } from '../../api/panic'

export default function WargaPanic() {
  const toast = useToast()
  const [sending, setSending] = useState(false)
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    getPanicHistory({ per_page: 10 })
      .then((res) => setHistory(res.data || []))
      .catch(() => {})
      .finally(() => setLoadingHistory(false))
  }, [])

  const handlePanic = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation tidak didukung di perangkat ini')
      return
    }
    setSending(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        triggerPanic({ latitude, longitude })
          .then(() => {
            toast.success('Sinyal darurat berhasil dikirim! Bantuan segera datang.')
            getPanicHistory({ per_page: 10 })
              .then((res) => setHistory(res.data || []))
              .catch(() => {})
          })
          .catch((e) => toast.error('Gagal: ' + (e.response?.data?.message || e.message)))
          .finally(() => setSending(false))
      },
      () => {
        toast.error('Gagal mendapatkan lokasi GPS. Pastikan GPS aktif.')
        setSending(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const statusColor = (s) => {
    if (s === 'terkirim') return 'danger'
    if (s === 'direspon') return 'warning'
    if (s === 'selesai') return 'success'
    return 'neutral'
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Panic Button</h1>

      <Card className="text-center py-12">
        <p className="text-gray-500 mb-6">
          Tekan tombol di bawah untuk mengirim sinyal darurat ke Polsek
        </p>
        <button
          onClick={handlePanic}
          disabled={sending}
          className="w-32 h-32 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
        >
          {sending ? (
            <svg className="animate-spin h-8 w-8 mx-auto" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            'SOS'
          )}
        </button>
        <p className="text-xs text-gray-400 mt-4">Lokasi GPS akan otomatis terkirim</p>
      </Card>

      <Card title="Riwayat Panic Alert">
        {loadingHistory ? (
          <LoadingSpinner className="py-8" />
        ) : history.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Belum ada riwayat panic alert</p>
        ) : (
          <div className="space-y-2">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {h.created_at ? new Date(h.created_at).toLocaleString('id-ID') : '-'}
                  </div>
                  {h.lokasi_text && (
                    <div className="text-xs text-gray-500">{h.lokasi_text}</div>
                  )}
                </div>
                <Badge color={statusColor(h.status)}>{h.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
