import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getPolsekSummary } from '../../api/dashboard'
import { respondPanic, completePanic, getActivePanics } from '../../api/panic'
import { usePanicAlerts } from '../../firebase/usePanicAlerts'
import { Card, ChartCard, ProgressBar, Badge, Table, LoadingSpinner, ChartTooltip } from '../../components'
import { useToast } from '../../components/Toast'
import { aggregateTrend } from '../../utils/trend'
import { GoogleMap, InfoWindow, useJsApiLoader, Circle } from '@react-google-maps/api'
import { AlertTriangle, FileText, Shield, TrendingUp, Radio, CalendarDays, ArrowRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const GMAPS_LIBRARIES = ['places']
const GMAP_CONTAINER_STYLE = { height: '100%', width: '100%' }
const GMAP_OPTIONS = { disableDefaultUI: true, zoomControl: true, scrollwheel: false }

const KATEGORI_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#60a5fa', '#0ea5e9', '#a5b4fc']
const STATUS_BAR_CLASS = { baru: 'bg-red-500', diproses: 'bg-amber-500', selesai: 'bg-emerald-500' }

const METRIC_COLORS = {
  red: { icon: 'from-red-500 to-rose-600', shadow: 'shadow-red-500/30' },
  amber: { icon: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/30' },
  emerald: { icon: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/30' },
  blue: { icon: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/30' },
}

function MetricCard({ icon: Icon, label, value, color = 'blue', link, delay = 0 }) {
  const palette = METRIC_COLORS[color] || METRIC_COLORS.blue
  return (
    <div
      className="relative overflow-hidden bg-white rounded-2xl border border-gray-100/80 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-200/70 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`mx-auto w-10 h-10 rounded-xl bg-gradient-to-br ${palette.icon} text-white flex items-center justify-center shadow-lg ${palette.shadow}`}>
        <Icon size={18} strokeWidth={2} />
      </div>
      <div className="text-2xl font-bold text-gray-800 mt-3 text-center">{value}</div>
      <div className="text-sm text-gray-500 mt-0.5 text-center">{label}</div>
      {link && (
        <div className="mt-2.5 text-center">
          <Link
            to={link.to}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            {link.label}
            <ArrowRight size={12} />
          </Link>
        </div>
      )}
    </div>
  )
}

function heatColor(count) {
  if (count >= 6) return { main: '#dc2626', mid: '#ef4444', soft: '#fecaca' }
  if (count >= 3) return { main: '#d97706', mid: '#f59e0b', soft: '#fde68a' }
  return { main: '#2563eb', mid: '#3b82f6', soft: '#bfdbfe' }
}

function dusunLatLng(d) {
  return {
    lat: parseFloat(d.laporan_kamtibmas_avg_latitude || d.latitude || d.lat || 5.185),
    lng: parseFloat(d.laporan_kamtibmas_avg_longitude || d.longitude || d.lng || 96.69),
  }
}

export default function PolsekDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [restAlerts, setRestAlerts] = useState([])
  const [selectedHeatmap, setSelectedHeatmap] = useState(null)
  const [trendPeriod, setTrendPeriod] = useState('bulanan')

  const { isLoaded: gmapsLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries: GMAPS_LIBRARIES,
  })

  const { alerts } = usePanicAlerts(user?.polsek_id)

  useEffect(() => {
    getPolsekSummary()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    getActivePanics()
      .then((res) => setRestAlerts(res.data || []))
      .catch(() => {})
  }, [])

  const toast = useToast()

  const handleRespondPanic = async (id) => {
    try {
      await respondPanic(id)
      setRestAlerts((prev) => prev.map((a) => a.id === id ? { ...a, status: 'direspon' } : a))
      toast.success('Panic alert berhasil direspon')
    } catch (e) {
      toast.error('Gagal merespon: ' + (e.response?.data?.message || e.message))
    }
  }

  const handleCompletePanic = async (id) => {
    try {
      await completePanic(id)
      setRestAlerts((prev) => prev.filter((a) => a.id !== id))
      toast.success('Panic alert selesai')
    } catch (e) {
      toast.error('Gagal selesaikan: ' + (e.response?.data?.message || e.message))
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
  const statusBars = Object.entries(data.kamtibmas_status || {}).map(([key, val]) => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    value: val,
    barClass: STATUS_BAR_CLASS[key] || 'bg-blue-500',
  }))

  const laporanTerbaru = (data.laporan_terbaru || []).slice(0, 5)

  const panicAlerts = (alerts && alerts.length > 0) ? alerts : restAlerts

  const laporanColumns = [
    {
      key: 'created_at',
      label: 'Tanggal',
      render: (r) => (
        <span className="text-sm">
          {r.created_at ? new Date(r.created_at).toLocaleDateString('id-ID') : '-'}
        </span>
      ),
    },
    { key: 'kategori', label: 'Kategori' },
    { key: 'kronologi', label: 'Kronologi', render: (r) => (
      <span className="truncate max-w-[200px] block">{r.kronologi || r.deskripsi || '-'}</span>
    )},
    { key: 'dusun', label: 'Dusun', render: (r) => r.dusun?.nama || r.nama_dusun || '-' },
    {
      key: 'status',
      label: 'Status',
      render: (r) => {
        const map = { baru: 'danger', diproses: 'warning', selesai: 'success' }
        return <Badge color={map[r.status] || 'neutral'}>{r.status || '-'}</Badge>
      },
    },
  ]

  const heatmapPoints = (data.heatmap_kamtibmas || [])
    .filter((d) => d.laporan_kamtibmas_count > 0)

  const now = new Date()

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-red-950 to-slate-950 px-6 py-4 text-white animate-fade-up">
        <div className="absolute -top-12 -right-8 w-44 h-44 rounded-full bg-red-500/20 blur-3xl animate-floaty" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -inset-y-10 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
        </div>
        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold leading-tight animate-fade-in">Dashboard {data.polsek?.nama}</h1>
            <p className="text-xs text-red-200/80 mt-0.5">{user?.jabatan} &middot; Polsek</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-red-100">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse-soft" />
              Pemantauan aktif
            </span>
            <span className="flex items-center gap-1.5 text-sm text-red-100/90">
              <CalendarDays size={15} />
              {now.toLocaleDateString('id-ID', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard icon={AlertTriangle} label="Alert Darurat Aktif" value={s.panic_aktif || 0} color="red" delay={80} />
        <MetricCard icon={FileText} label="Laporan Bulan Ini" value={s.laporan_bulan_ini || 0} color="amber" delay={160} />
        <MetricCard
          icon={Shield}
          label="Total Anggota Linmas"
          value={s.total_linmas || 0}
          color="emerald"
          delay={240}
          link={{ to: '/polsek/manajemen-linmas', label: 'Lihat detail personel' }}
        />
        <MetricCard icon={TrendingUp} label="Skor Keamanan Gampong" value={s.skor_keamanan || '-'} color="blue" delay={320} />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="lg:col-span-8 animate-fade-up" style={{ animationDelay: '200ms' }}>
          <Card title="Heatmap Kriminalitas per Lingkungan">
            <div className="h-[320px] rounded-lg overflow-hidden relative">
              <GoogleMap
                mapContainerStyle={GMAP_CONTAINER_STYLE}
                center={{ lat: 5.185, lng: 96.69 }}
                zoom={13}
                options={GMAP_OPTIONS}
              >
                {heatmapPoints.map((d) => {
                  const count = d.laporan_kamtibmas_count || 0
                  const { main, soft } = heatColor(count)
                  const baseRadius = Math.min(12000 + count * 3500, 30000)
                  const { lat, lng } = dusunLatLng(d)
                  return (
                    <Circle
                      key={d.id}
                      center={{ lat, lng }}
                      radius={baseRadius}
                      options={{
                        fillColor: soft,
                        fillOpacity: 0.3,
                        strokeColor: main,
                        strokeOpacity: 0.9,
                        strokeWeight: 2,
                        clickable: true,
                      }}
                      onClick={() => setSelectedHeatmap(d.id === selectedHeatmap ? null : d.id)}
                    />
                  )
                })}
                {heatmapPoints.map((d) => {
                  const count = d.laporan_kamtibmas_count || 0
                  const { mid, main } = heatColor(count)
                  const { lat, lng } = dusunLatLng(d)
                  return (
                    <Circle
                      key={`core-${d.id}`}
                      center={{ lat, lng }}
                      radius={Math.min(4000 + count * 1000, 12000)}
                      options={{
                        fillColor: main,
                        fillOpacity: 0.55,
                        strokeColor: mid,
                        strokeOpacity: 0.9,
                        strokeWeight: 1.5,
                        clickable: true,
                      }}
                      onClick={() => setSelectedHeatmap(d.id === selectedHeatmap ? null : d.id)}
                    />
                  )
                })}
                {heatmapPoints.filter((d) => d.id === selectedHeatmap).map((d) => (
                  <InfoWindow
                    key={`info-${d.id}`}
                    position={dusunLatLng(d)}
                    onCloseClick={() => setSelectedHeatmap(null)}
                  >
                    <div className="text-sm">
                      <strong>{d.nama}</strong><br />
                      {d.laporan_kamtibmas_count || 0} laporan kamtibmas
                    </div>
                  </InfoWindow>
                ))}
              </GoogleMap>
              {!gmapsLoaded && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center text-sm text-gray-400">
                  Memuat peta...
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 animate-fade-up" style={{ animationDelay: '280ms' }}>
          <Card
            title="Live Panic Feed"
            subtitle="Real-time panic alert"
            actions={
              <span className="flex items-center gap-1.5 text-xs text-red-500 font-medium">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-soft" />
                LIVE
              </span>
            }
          >
            <div className="max-h-[320px] overflow-y-auto space-y-2">
              {!panicAlerts || panicAlerts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">Tidak ada panic alert aktif</p>
              ) : (
                panicAlerts.slice(0, 10).map((alert) => (
                  <div key={alert.firebaseKey || alert.id} className="flex items-center justify-between py-2 px-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-100 animate-fade-in">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Radio size={14} className="text-red-400 shrink-0" />
                        <span className="font-medium text-sm text-gray-900">{alert.user?.nama}</span>
                        <Badge color={alert.status === 'terkirim' ? 'danger' : alert.status === 'direspon' ? 'warning' : 'success'}>
                          {alert.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 ml-6">
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
                    {alert.status === 'direspon' && (
                      <button
                        onClick={() => handleCompletePanic(alert.id)}
                        className="ml-3 text-xs px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors font-medium shrink-0"
                      >
                        Selesai
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="lg:col-span-6 animate-fade-up" style={{ animationDelay: '360ms' }}>
          {trend.length > 0 ? (
            <ChartCard
              title="Tren Kamtibmas 12 Bulan"
              activePeriod={trendPeriod}
              onPeriodChange={setTrendPeriod}
            >
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={aggregateTrend(trend, trendPeriod)}>
                  <defs>
                    <linearGradient id="polsekTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="label"
                    interval={0}
                    angle={-30}
                    textAnchor="end"
                    tickMargin={12}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(100,116,139,0.08)' }}
                    content={<ChartTooltip suffix="laporan" valueName="Total" />}
                  />
                  <Bar dataKey="total" fill="url(#polsekTrend)" radius={[8, 8, 0, 0]} maxBarSize={34} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          ) : (
            <Card title="Tren Kamtibmas 12 Bulan">
              <p className="text-sm text-gray-400 text-center py-10">Belum ada data laporan</p>
            </Card>
          )}
        </div>

        <div className="lg:col-span-6 animate-fade-up" style={{ animationDelay: '440ms' }}>
          {kategori.length > 0 ? (
            <ChartCard title="Kategori Kamtibmas" periods={[]}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={kategori}>
                  <defs>
                    <linearGradient id="polsekKategori" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    width={32}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(100,116,139,0.08)' }}
                    content={<ChartTooltip suffix="laporan" valueName="Total" />}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={34}>
                    {kategori.map((_, i) => (
                      <Cell key={i} fill={KATEGORI_COLORS[i % KATEGORI_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          ) : (
            <Card title="Kategori Kamtibmas">
              <p className="text-sm text-gray-400 text-center py-10">Belum ada data laporan</p>
            </Card>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="lg:col-span-4 animate-fade-up" style={{ animationDelay: '520ms' }}>
          <Card title="Status Laporan">
            {statusBars.length > 0 ? (
              <div className="pt-2">
                <ProgressBar items={statusBars} />
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-10">Belum ada laporan</p>
            )}
          </Card>
        </div>

        <div className="lg:col-span-8 animate-fade-up" style={{ animationDelay: '600ms' }}>
          <Card
            title="Laporan Kamtibmas Terbaru"
            actions={
              <Link
                to="/polsek/manajemen-laporan"
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                Lihat semua
                <ArrowRight size={12} />
              </Link>
            }
          >
            <Table columns={laporanColumns} data={laporanTerbaru} emptyText="Belum ada laporan terbaru" />
          </Card>
        </div>
      </div>
    </div>
  )
}
