import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getWargaSummary } from '../../api/dashboard'
import { getJadwalRonda } from '../../api/ronda'
import { triggerPanic } from '../../api/panic'
import { Card, ChartCard, LoadingSpinner, Badge } from '../../components'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const PIE_COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899']

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
          .then(() => {
            alert('Panic button berhasil dikirim! Bantuan segera datang.')
          })
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
  const kategori = (stats.kamtibmas_kategori || []).map((k) => ({
    name: k.kategori,
    value: k.total,
  }))
  const riwayatKehadiran = stats.riwayat_kehadiran_ronda || []

  const shiftLabel = (shift) => {
    if (shift === 'malam') return 'Malam (20:00 - 02:00)'
    if (shift === 'subuh') return 'Subuh (02:00 - 06:00)'
    return shift
  }

  const statusColor = (s) => {
    if (s === 'berlangsung') return 'warning'
    if (s === 'selesai') return 'success'
    return 'info'
  }

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="text-center">
          <div className="text-3xl font-bold text-blue-600">{s.total_laporan_kamtibmas || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Laporan Kamtibmas</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-amber-500">{s.total_laporan_rumah_kosong || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Rumah Kosong</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-red-600">{s.total_panic_button || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Panic Button</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-emerald-600">{s.total_jadwal_ronda || 0}</div>
          <div className="text-sm text-gray-500 mt-1">Jadwal Ronda</div>
        </Card>
        <Card className="text-center">
          <div className="text-3xl font-bold text-purple-600">{s.persentase_kehadiran_ronda || 0}%</div>
          <div className="text-sm text-gray-500 mt-1">Kehadiran Ronda</div>
        </Card>
      </div>

      <Card title="Jadwal Ronda Terdekat" actions={
        <button onClick={() => navigate('/warga/ronda')} className="text-sm text-blue-600 hover:underline">
          Lihat Semua
        </button>
      }>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {riwayatKehadiran.length > 0 && (
          <ChartCard title="Kehadiran Ronda">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={riwayatKehadiran}>
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="total" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {kategori.length > 0 && (
          <ChartCard title="Kategori Kamtibmas">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={kategori}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {kategori.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {trend.length > 0 && (
        <ChartCard title="Trend Kamtibmas 12 Bulan">
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
    </div>
  )
}
