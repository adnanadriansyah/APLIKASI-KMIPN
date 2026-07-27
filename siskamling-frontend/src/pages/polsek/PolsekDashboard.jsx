import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getPolsekSummary } from '../../api/dashboard'
import { respondPanic } from '../../api/panic'
import { usePanicAlerts } from '../../firebase/usePanicAlerts'
import { Card, ChartCard, Badge, LoadingSpinner } from '../../components'
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import 'leaflet/dist/leaflet.css'

function FitBounds({ points }) {
  const map = useMap()
  useEffect(() => {
    if (points.length > 0) {
      const bounds = points.map((p) => [p.latitude, p.longitude])
      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }, [map, points])
  return null
}

export default function PolsekDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const { alerts, error: panicError } = usePanicAlerts(user?.polsek_id)

  useEffect(() => {
    getPolsekSummary()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleRespondPanic = async (id) => {
    try {
      await respondPanic(id)
    } catch (e) {
      alert('Gagal merespon: ' + (e.response?.data?.message || e.message))
    }
  }

  if (loading) return <LoadingSpinner className="py-20" />
  if (!data) return <div className="text-center py-20 text-gray-400">Gagal memuat data</div>

  const s = data.stats || {}
  const trend = data.kamtibmas_trend_12_bulan || []
  const kategori = Object.entries(data.kamtibmas_kategori || {}).map(([key, val]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: val,
  }))
  const statusData = Object.entries(data.kamtibmas_status || {}).map(([key, val]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: val,
  }))

  const heatmapPoints = (data.heatmap_kamtibmas || [])
    .filter((d) => d.laporan_kamtibmas_count > 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard {data.polsek?.nama}</h1>
        <p className="text-gray-500">{user?.jabatan} &middot; Polsek</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">{s.total_laporan_kamtibmas || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Total Laporan</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-amber-500">{s.laporan_bulan_ini || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Laporan Bulan Ini</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-red-600">{s.panic_aktif || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Panic Aktif</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-emerald-600">{s.total_linmas || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Anggota Linmas</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trend.length > 0 && (
          <ChartCard title="Tren Kamtibmas 12 Bulan">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={trend}>
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {kategori.length > 0 && (
          <ChartCard title="Kategori Kamtibmas">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={kategori}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {statusData.length > 0 && (
        <ChartCard title="Status Laporan">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={statusData} layout="vertical">
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Heatmap Kriminalitas per Lingkungan">
          <div className="h-[320px] rounded-lg overflow-hidden">
            <MapContainer center={[5.1850, 96.6900]} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
              <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {heatmapPoints.length > 0 && <FitBounds points={heatmapPoints.map(() => ({ latitude: 5.185, longitude: 96.69 }))} />}
              {data.heatmap_kamtibmas?.map((d) => {
                const count = d.laporan_kamtibmas_count || 0
                const radius = Math.min(8 + count * 3, 30)
                const color = count >= 5 ? '#ef4444' : count >= 2 ? '#f59e0b' : '#3b82f6'
                return (
                  <CircleMarker
                    key={d.id}
                    center={[5.185 + (d.id * 0.003), 96.69 + (d.id * 0.002)]}
                    radius={radius}
                    fillColor={color}
                    color={color}
                    fillOpacity={0.5}
                  >
                    <Popup>
                      <strong>{d.nama}</strong><br />
                      {count} laporan kamtibmas
                    </Popup>
                  </CircleMarker>
                )
              })}
            </MapContainer>
          </div>
        </Card>

        <Card
          title="Live Panic Feed"
          subtitle={panicError ? 'Firebase error' : 'Real-time dari Firebase'}
        >
          <div className="max-h-[320px] overflow-y-auto space-y-2">
            {!alerts || alerts.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Tidak ada panic alert aktif</p>
            ) : (
              alerts.slice(0, 10).map((alert) => (
                <div key={alert.firebaseKey || alert.id} className="flex items-center justify-between py-2 px-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-900">{alert.user?.nama}</span>
                      <Badge color={alert.status === 'terkirim' ? 'danger' : alert.status === 'direspon' ? 'warning' : 'success'}>
                        {alert.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {alert.user?.phone && `${alert.user.phone} · `}
                      {alert.created_at && new Date(alert.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                  {alert.status === 'terkirim' && (
                    <button
                      onClick={() => handleRespondPanic(alert.id)}
                      className="ml-3 text-xs px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors font-medium shrink-0"
                    >
                      Respon
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {data.anggota_linmas?.length > 0 && (
        <Card title="Anggota Linmas" subtitle="Wilayah tugas">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {data.anggota_linmas.map((l) => (
              <div key={l.id} className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-sm text-gray-900">{l.nama}</div>
                <div className="text-xs text-gray-500">{l.jabatan || '-'}</div>
                <div className="text-xs text-blue-600 mt-1">{l.wilayah_tugas || '-'}</div>
                {l.no_hp && <div className="text-xs text-gray-400 mt-0.5">{l.no_hp}</div>}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
