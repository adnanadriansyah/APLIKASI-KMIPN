import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getWargaSummary } from '../../api/dashboard'
import { getJadwalRonda } from '../../api/ronda'
import { triggerPanic } from '../../api/panic'
import { Card, ChartCard, StatCard, LoadingSpinner, Badge, ChartTooltip } from '../../components'
import { useToast } from '../../components/Toast'
import { aggregateTrend } from '../../utils/trend'
import { FileText, CalendarCheck, Home, Siren, CalendarDays, Moon, ShieldCheck } from 'lucide-react'
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
  const [trendPeriod, setTrendPeriod] = useState('bulanan')
  const toast = useToast()

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
    if (!navigator.geolocation) return toast.error('Geolocation tidak didukung')
    setPanicLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        triggerPanic({ latitude, longitude })
          .then(() => toast.success('Panic button berhasil dikirim! Bantuan segera datang.'))
          .catch((e) => toast.error('Gagal: ' + (e.response?.data?.message || e.message)))
          .finally(() => setPanicLoading(false))
      },
      () => {
        toast.error('Gagal mendapatkan lokasi GPS')
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

  const now = new Date()
  const hadirCount = (j) => (j.petugas || []).filter((p) => p.status_hadir === 'hadir').length

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 md:p-8 text-white animate-fade-up">
        <div className="absolute -top-12 -right-10 w-64 h-64 rounded-full bg-blue-500/25 blur-3xl animate-floaty" />
        <div className="absolute -bottom-20 right-44 w-52 h-52 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-blue-300">Selamat datang kembali</div>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">Halo, {user?.nama}</h1>
            <p className="text-blue-200/80 mt-1.5 text-sm">
              {user?.jabatan || 'Warga'} &middot; Portal Siskamling Digital
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="hidden md:flex items-center gap-2 text-blue-200/90 text-sm">
              <CalendarDays size={16} />
              {now.toLocaleDateString('id-ID', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })}
            </div>
            <button
              onClick={handlePanic}
              disabled={panicLoading}
              className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white font-black tracking-wider shadow-xl shadow-red-500/40 transition-transform duration-200 hover:scale-105 active:scale-95 disabled:opacity-60 animate-sos-ring flex items-center justify-center text-sm"
            >
              {panicLoading ? '...' : 'SOS'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={FileText} label="Laporan Kamtibmas" value={s.total_laporan_kamtibmas || 0} color="blue" delay={80} />
        <StatCard icon={CalendarCheck} label="Kehadiran Ronda" value={s.persentase_kehadiran_ronda || 0} suffix="%" color="emerald" delay={160} />
        <StatCard icon={Home} label="Rumah Kosong Dilaporkan" value={s.total_laporan_rumah_kosong || 0} color="amber" delay={240} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trend.length > 0 && (
          <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
            <ChartCard
              title="Tren Laporan Saya 12 Bulan"
              activePeriod={trendPeriod}
              onPeriodChange={setTrendPeriod}
            >
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={aggregateTrend(trend, trendPeriod)}>
                  <defs>
                    <linearGradient id="wargaTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
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
                    cursor={{ stroke: '#cbd5e1', strokeDasharray: '4 4' }}
                    content={<ChartTooltip suffix="laporan" valueName="Total" />}
                  />
                  <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2.5} fill="url(#wargaTrend)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}

        {kategori.length > 0 && (
          <div className="animate-fade-up" style={{ animationDelay: '280ms' }}>
            <ChartCard title="Kategori Laporan" periods={[]}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={kategori} layout="vertical">
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(100,116,139,0.08)' }}
                    content={<ChartTooltip suffix="laporan" valueName="Total" />}
                  />
                  <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={18}>
                    {kategori.map((_, i) => (
                      <Cell key={i} fill={KATEGORI_COLORS[i % KATEGORI_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}
      </div>

      <div className="animate-fade-up" style={{ animationDelay: '360ms' }}>
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
            <div className="space-y-2">
              {jadwal.map((j) => {
                const total = j.petugas?.length || 0
                return (
                  <div key={j.id} className="flex items-center gap-4 py-3 px-4 rounded-xl bg-gray-50 hover:bg-blue-50/70 transition-colors">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
                      <Moon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm">
                        {j.tanggal} &middot; {shiftLabel(j.shift)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {j.dusun?.nama} &middot; {total} petugas
                        {total > 0 && ` · ${hadirCount(j)} hadir`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {j.status === 'selesai' && (
                        <ShieldCheck size={16} className="text-emerald-500" />
                      )}
                      <Badge color={statusColor(j.status)}>{j.status}</Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      <div className="animate-fade-up" style={{ animationDelay: '440ms' }}>
        <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
              <Siren size={24} />
            </div>
            <div>
              <div className="font-semibold">Butuh bantuan darurat?</div>
              <div className="text-sm text-emerald-100 mt-0.5">
                Gunakan tombol SOS untuk mengirim sinyal darurat ke petugas.
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/warga/panic')}
            className="shrink-0 px-4 py-2 rounded-xl bg-white text-emerald-700 text-sm font-semibold hover:bg-emerald-50 transition-colors"
          >
            Buka Panic Button
          </button>
        </div>
      </div>
    </div>
  )
}
