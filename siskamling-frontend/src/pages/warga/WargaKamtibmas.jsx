import { useEffect, useState, useCallback } from 'react'
import { getKamtibmas, createKamtibmas } from '../../api/kamtibmas'
import { Card, Table, Badge, Modal, LoadingSpinner } from '../../components'

const KATEGORI = [
  { key: 'pencurian', label: 'Pencurian', icon: '🔍', color: 'border-red-300 bg-red-50 hover:bg-red-100' },
  { key: 'kdrt', label: 'KDRT', icon: '⚠️', color: 'border-orange-300 bg-orange-50 hover:bg-orange-100' },
  { key: 'narkoba', label: 'Narkoba', icon: '🚫', color: 'border-purple-300 bg-purple-50 hover:bg-purple-100' },
  { key: 'tawuran', label: 'Tawuran', icon: '👥', color: 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100' },
  { key: 'pembunuhan', label: 'Pembunuhan', icon: '🚨', color: 'border-red-400 bg-red-50 hover:bg-red-100' },
  { key: 'begal', label: 'Begal', icon: '🏍️', color: 'border-amber-300 bg-amber-50 hover:bg-amber-100' },
]

export default function WargaKamtibmas() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)

  const [formOpen, setFormOpen] = useState(false)
  const [selectedKategori, setSelectedKategori] = useState('')
  const [lokasiText, setLokasiText] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [kronologi, setKronologi] = useState('')
  const [fotoFiles, setFotoFiles] = useState([])
  const [videoFiles, setVideoFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [locating, setLocating] = useState(false)

  const fetchData = useCallback((p = 1) => {
    setLoading(true)
    getKamtibmas({ page: p, per_page: 10 })
      .then((res) => {
        setData(res.data || [])
        setMeta(res.meta || null)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchData(page) }, [page, fetchData])

  const handleUseLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation tidak didukung')
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6))
        setLongitude(pos.coords.longitude.toFixed(6))
        setLocating(false)
      },
      () => {
        alert('Gagal mendapatkan lokasi')
        setLocating(false)
      }
    )
  }

  const handleMapClick = (e) => {
    setLatitude(e.latlng.lat.toFixed(6))
    setLongitude(e.latlng.lng.toFixed(6))
  }

  const resetForm = () => {
    setSelectedKategori('')
    setLokasiText('')
    setLatitude('')
    setLongitude('')
    setKronologi('')
    setFotoFiles([])
    setVideoFiles([])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedKategori) return alert('Pilih kategori laporan')
    if (kronologi.length < 10) return alert('Kronologi minimal 10 karakter')

    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append('kategori', selectedKategori)
      fd.append('kronologi', kronologi)
      if (lokasiText) fd.append('lokasi_text', lokasiText)
      if (latitude) fd.append('latitude', latitude)
      if (longitude) fd.append('longitude', longitude)
      for (const f of fotoFiles) fd.append('foto[]', f)
      for (const f of videoFiles) fd.append('video[]', f)

      await createKamtibmas(fd)
      alert('Laporan berhasil dikirim!')
      setFormOpen(false)
      resetForm()
      fetchData(1)
      setPage(1)
    } catch (err) {
      const msg = err.response?.data?.message || err.message
      const errors = err.response?.data?.errors
      if (errors) {
        const first = Object.values(errors)[0]
        alert('Validasi gagal: ' + (Array.isArray(first) ? first[0] : first))
      } else {
        alert('Gagal: ' + msg)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const statusColor = (s) => {
    if (s === 'baru') return 'danger'
    if (s === 'diproses') return 'warning'
    return 'success'
  }

  const columns = [
    { key: 'kategori_label', label: 'Kategori' },
    { key: 'lokasi_text', label: 'Lokasi', render: (r) => r.lokasi_text || '-' },
    { key: 'created_at', label: 'Waktu', render: (r) => new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) },
    { key: 'status_label', label: 'Status', render: (r) => <Badge color={statusColor(r.status)}>{r.status_label}</Badge> },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Laporan Kamtibmas</h1>
        <button
          onClick={() => setFormOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + Buat Laporan
        </button>
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

      <Modal isOpen={formOpen} onClose={() => { if (!submitting) { setFormOpen(false); resetForm(); } }} title="Buat Laporan Kamtibmas" size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kategori Kejadian *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {KATEGORI.map((k) => (
                <button
                  key={k.key}
                  type="button"
                  onClick={() => setSelectedKategori(k.key)}
                  className={`border-2 rounded-xl p-3 text-center transition-all ${k.color} ${
                    selectedKategori === k.key ? 'ring-2 ring-blue-500 border-blue-500' : ''
                  }`}
                >
                  <div className="text-2xl mb-1">{k.icon}</div>
                  <div className="text-sm font-medium text-gray-800">{k.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Lokasi</label>
            <input
              type="text"
              value={lokasiText}
              onChange={(e) => setLokasiText(e.target.value)}
              placeholder="Contoh: Depan Masjid Al-Ikhlas"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Koordinat Lokasi</label>
              <button
                type="button"
                onClick={handleUseLocation}
                disabled={locating}
                className="text-xs text-blue-600 hover:underline disabled:opacity-50"
              >
                {locating ? 'Mencari lokasi...' : '📍 Gunakan lokasi saya'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="Latitude"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="Longitude"
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mt-2 h-48 rounded-lg overflow-hidden border border-gray-200 relative">
              <MapPicker latitude={latitude} longitude={longitude} onMapClick={handleMapClick} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kronologi Kejadian *</label>
            <textarea
              value={kronologi}
              onChange={(e) => setKronologi(e.target.value)}
              placeholder="Jelaskan kronologi kejadian secara detail..."
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="text-xs text-gray-400 mt-1">{kronologi.length} / 5000 karakter {kronologi.length < 10 && kronologi.length > 0 && '(minimal 10)'}</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Foto (maks. 5)</label>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                multiple
                onChange={(e) => setFotoFiles(Array.from(e.target.files).slice(0, 5))}
                className="w-full text-sm text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
              />
              {fotoFiles.length > 0 && <div className="text-xs text-gray-400 mt-1">{fotoFiles.length} file dipilih</div>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Video (maks. 2)</label>
              <input
                type="file"
                accept="video/mp4,video/quicktime"
                multiple
                onChange={(e) => setVideoFiles(Array.from(e.target.files).slice(0, 2))}
                className="w-full text-sm text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
              />
              {videoFiles.length > 0 && <div className="text-xs text-gray-400 mt-1">{videoFiles.length} file dipilih</div>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => { setFormOpen(false); resetForm(); }}
              disabled={submitting}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedKategori || kronologi.length < 10}
              className="px-5 py-2 text-sm rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Mengirim...' : 'Kirim Laporan'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function MapPicker({ latitude, longitude, onMapClick }) {
  const [MapContainer, setMapContainer] = useState(null)
  const [TileLayer, setTileLayer] = useState(null)
  const [Marker, setMarker] = useState(null)
  const [useMapEvents, setUseMapEvents] = useState(null)

  useEffect(() => {
    Promise.all([
      import('react-leaflet'),
      import('leaflet/dist/leaflet.css'),
    ]).then(([rl]) => {
      setMapContainer(() => rl.MapContainer)
      setTileLayer(() => rl.TileLayer)
      setMarker(() => rl.Marker)
      setUseMapEvents(() => rl.useMapEvents)
    })
  }, [])

  if (!MapContainer) {
    return <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">Memuat peta...</div>
  }

  const center = latitude && longitude ? [parseFloat(latitude), parseFloat(longitude)] : [5.1850, 96.6900]

  return (
    <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
      <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapClickHandler useMapEvents={useMapEvents} onClick={onMapClick} />
      {latitude && longitude && Marker && (
        <Marker position={[parseFloat(latitude), parseFloat(longitude)]} />
      )}
    </MapContainer>
  )
}

function MapClickHandler({ useMapEvents, onClick }) {
  useMapEvents({
    click: onClick,
  })
  return null
}
