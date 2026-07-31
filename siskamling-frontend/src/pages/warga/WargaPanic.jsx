import { useEffect, useState } from 'react'
import { Card, Badge, LoadingSpinner } from '../../components'
import { useToast } from '../../components/Toast'
import { triggerPanic, getPanicHistory } from '../../api/panic'
import { Siren, MapPin, CheckCircle2, PhoneCall } from 'lucide-react'

const STATUS_META = {
  terkirim: { label: 'Terkirim', color: 'danger' },
  direspon: { label: 'Direspon', color: 'warning' },
  selesai: { label: 'Selesai', color: 'success' },
}

export default function WargaPanic() {
  const toast = useToast()
  const [sending, setSending] = useState(false)
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  const loadHistory = () => {
    getPanicHistory({ per_page: 10 })
      .then((res) => setHistory(res.data || []))
      .catch(() => {})
  }

  useEffect(() => {
    loadHistory()
    setLoadingHistory(false)
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
            loadHistory()
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

  const now = new Date()

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-red-950 to-slate-950 p-6 md:p-8 text-white animate-fade-up">
        <div className="absolute -top-12 -right-10 w-64 h-64 rounded-full bg-red-500/25 blur-3xl animate-floaty" />
        <div className="relative flex items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-red-200">
              <Siren size={16} />
              Sinyal Darurat
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">Panic Button</h1>
            <p className="text-red-100/80 mt-1.5 text-sm">
              {now.toLocaleDateString('id-ID', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })}
            </p>
          </div>
          <button
            onClick={handlePanic}
            disabled={sending}
            className="w-28 h-28 shrink-0 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white text-2xl font-black tracking-wider shadow-xl shadow-red-500/40 transition-transform duration-200 hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed animate-sos-ring flex items-center justify-center"
          >
            {sending ? (
              <svg className="animate-spin h-10 w-10" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              'SOS'
            )}
          </button>
        </div>
        <p className="relative text-xs text-red-200/70 mt-4 flex items-center gap-1.5">
          <MapPin size={13} />
          Lokasi GPS akan otomatis terkirim ke Polsek saat tombol ditekan
        </p>
      </div>

      <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
        <Card title="Riwayat Panic Alert">
          {loadingHistory ? (
            <LoadingSpinner className="py-8" />
          ) : history.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                <Siren size={26} />
              </div>
              <p className="text-sm text-gray-400">Belum ada riwayat panic alert</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((h) => {
                const meta = STATUS_META[h.status] || { label: h.status, color: 'neutral' }
                return (
                  <div
                    key={h.id}
                    className="flex items-start gap-4 py-3 px-4 rounded-xl bg-gray-50 hover:bg-red-50/60 transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        h.status === 'selesai'
                          ? 'bg-emerald-100 text-emerald-600'
                          : h.status === 'direspon'
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {h.status === 'selesai' ? (
                        <CheckCircle2 size={20} />
                      ) : h.status === 'direspon' ? (
                        <PhoneCall size={20} />
                      ) : (
                        <Siren size={20} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {h.created_at
                            ? new Date(h.created_at).toLocaleString('id-ID', {
                                day: 'numeric', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })
                            : '-'}
                        </span>
                        <Badge color={meta.color}>{meta.label}</Badge>
                      </div>
                      {h.lokasi_text && (
                        <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <MapPin size={12} className="text-gray-400" />
                          {h.lokasi_text}
                        </div>
                      )}
                      {h.responded_at && (
                        <div className="text-xs text-amber-600 mt-0.5">
                          Direspon {new Date(h.responded_at).toLocaleString('id-ID', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                          })}
                          {h.responded_by?.nama ? ` oleh ${h.responded_by.nama}` : ''}
                        </div>
                      )}
                      {h.completed_at && (
                        <div className="text-xs text-emerald-600 mt-0.5">
                          Selesai {new Date(h.completed_at).toLocaleString('id-ID', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
