import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getWargaSummary } from '../../api/dashboard'
import { getJadwalRonda } from '../../api/ronda'
import { triggerPanic } from '../../api/panic'
import { Card, ChartCard, StatCard, LoadingSpinner, Badge } from '../../components'
import { FileText, CalendarCheck, Home } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell,
} from 'recharts'

const KATEGORI_COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899']

export default function WargaDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [jadwal, setJadwal] = useState([])
  const [loading, setLoading] = useState(true)
  const [panicLoading, setPanicLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      getWargaSummary().catch(() => null),
      getJadwalRonda({ per_page: 5 }).catch(() => ({ data: [] })),
    ])
      .then(([s, j]) => {
        setStats(s)
        setJadwal(j.data || [])
      })
      .finally(() => setLoading(false))
  }, [])

  const handlePanic = () => {
    if (!navigator.geolocation) return alert('Geolocation tidak didukung')
    setPanicLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        triggerPanic({ latitude, longitude })
          .then(() => alert('Panic button berhasil dikirim! Bantuan segera datang.'))
          .catch((e) => alert('Gagal: ' + (e.response?.data?.message || e.message)))
          .finally(() => setPanicLoading(false))
      },
      () => {
        alert('Gagal mendapatkan lokasi GPS')
        setPanicLoading(false)
      }
    )
  }

  if (loading) return <LoadingSpinner className="py-20" />
  if (!stats) return <div className="text-center py-20 text-gray-400">Gagal memuat data</div>

  const s = stats.stats || {}
  const trend = stats.kamtibmas_trend_12_bulan || []
  const kategori = Object.entries(stats.kamtibmas_kategori || {}).map(([key, val]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: val,
  }))

  const shiftLabel = (shift) => {
    if (shift === 'malam') return 'Malam (20:00 - 02:00)'
    if (shift === 'subuh') return 'Subuh (02:00 - 06:00)'
    return shift
  }

  const statusColor = (st) => {
    if (st === 'berlangsung') return 'warning'
    if (st === 'selesai') return 'success'
    return 'info'
  }

  return (
    <div className="space-y-6">
      {/* Baris 1: Panic Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Halo, {user?.nama}</h1>
          <p className="text-gray-500">{user?.jabatan || 'Warga'} &middot; Portal Siskamling Digital</p>
        </div>
        <button
          onClick={handlePanic}
          disabled={panicLoading}
          className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg transition-colors disabled:opacity-50 flex items-center justify-center text-sm"
        >
          {panicLoading ? '...' : 'SOS'}
        </button>
      </div>

      {/* Baris 2: StatCards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={FileText}
          label="Laporan Kamtibmas"
          value={s.total_laporan_kamtibmas || 0}
          color="blue"
        />
        <StatCard
          icon={CalendarCheck}
          label="Kehadiran Ronda"
          value={`${s.persentase_kehadiran_ronda || 0}%`}
          color="emerald"
        />
        <StatCard
          icon={Home}
          label="Rumah Kosong Dilaporkan"
          value={s.total_laporan_rumah_kosong || 0}
          color="amber"
        />
      </div>

      {/* Baris 3: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trend.length > 0 && (
          <ChartCard title="Tren Laporan Saya 12 Bulan">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="gradTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} fill="url(#gradTrend)" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {kategori.length > 0 && (
          <ChartCard title="Kategori Laporan">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={kategori} layout="vertical">
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {kategori.map((_, i) => (
                    <Cell key={i} fill={KATEGORI_COLORS[i % KATEGORI_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {/* Baris 4: Jadwal Ronda Terdekat */}
      <Card
        title="Jadwal Ronda Terdekat"
        actions={
          <button onClick={() => navigate('/warga/ronda')} className="text-sm text-blue-600 hover:underline">
            Lihat Semua
          </button>
        }
      >
        {jadwal.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">Belum ada jadwal ronda</p>
        ) : (
          <div className="space-y-3">
            {jadwal.map((j) => (
              <div key={j.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <div className="font-medium text-gray-900 text-sm">
                    {j.tanggal} &middot; {shiftLabel(j.shift)}
                  </div>
                  <div className="text-xs text-gray-500">{j.dusun?.nama} &middot; {j.petugas?.length || 0} petugas</div>
                </div>
                <Badge color={statusColor(j.status)}>{j.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
