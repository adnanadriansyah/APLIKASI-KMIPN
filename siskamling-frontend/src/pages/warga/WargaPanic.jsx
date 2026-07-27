import { Card } from '../../components'
import { triggerPanic } from '../../api/panic'

export default function WargaPanic() {
  const handlePanic = () => {
    if (!navigator.geolocation) return alert('Geolocation tidak didukung')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        triggerPanic({ latitude, longitude })
          .then(() => alert('Panic button berhasil dikirim!'))
          .catch((e) => alert('Gagal: ' + (e.response?.data?.message || e.message)))
      },
      () => alert('Gagal mendapatkan lokasi')
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Panic Button</h1>
      <Card className="text-center py-12">
        <p className="text-gray-500 mb-6">Tekan tombol di bawah untuk mengirim sinyal darurat ke Polsek</p>
        <button
          onClick={handlePanic}
          className="w-32 h-32 rounded-full bg-red-600 hover:bg-red-700 text-white text-xl font-bold shadow-lg transition-colors"
        >
          SOS
        </button>
        <p className="text-xs text-gray-400 mt-4">Lokasi GPS akan otomatis terkirim</p>
      </Card>
    </div>
  )
}
