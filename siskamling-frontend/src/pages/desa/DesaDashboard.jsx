import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getDesaSummary, getAiInsight, generateAiInsight } from '../../api/dashboard'
import { Card, ChartCard, StatCard, ProgressBar, LoadingSpinner, ChartTooltip } from '../../components'
import { useToast } from '../../components/Toast'
import { aggregateTrend } from '../../utils/trend'
import { Users, Home, ShieldCheck, AlertTriangle, Sparkles, CalendarDays } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

const PIE_COLORS = ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899']
const STATUS_COLORS = { baru: '#ef4444', diproses: '#f59e0b', selesai: '#10b981' }

export default function DesaDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [aiInsight, setAiInsight] = useState(null)
  const [aiLoading, setAiLoading] = useState(true)
  const [aiGenerating, setAiGenerating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [trendPeriod, setTrendPeriod] = useState('bulanan')
  const toast = useToast()

  useEffect(() => {
    getDesaSummary()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))

    getAiInsight()
      .then(setAiInsight)
      .catch(console.error)
      .finally(() => setAiLoading(false))
  }, [])

  const handleGenerateInsight = async () => {
    setAiGenerating(true)
    try {
      await generateAiInsight()
      toast.success('Insight sedang digenerate. Coba beberapa saat lagi.')
    } catch (e) {
      toast.error('Gagal: ' + (e.response?.data?.message || e.message))
    } finally {
      setAiGenerating(false)
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
  const status = Object.entries(data.kamtibmas_status || {}).map(([key, val]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: val,
  }))

  const laporanPerDusun = (data.laporan_per_dusun || []).map((d) => ({
    key: d.nama,
    label: d.nama,
    value: d.total || d.count || 0,
  }))

  const now = new Date()

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 md:p-8 text-white animate-fade-up">
        <div className="absolute -top-12 -right-10 w-64 h-64 rounded-full bg-blue-500/25 blur-3xl animate-floaty" />
        <div className="absolute -bottom-20 right-44 w-52 h-52 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-blue-300">
              Selamat datang kembali, {user?.nama}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">Dashboard {data.desa?.nama}</h1>
            <p className="text-blue-200/80 mt-1.5 text-sm">
              {user?.jabatan} &middot; Aparatur Gampong
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 text-blue-200/90 text-sm">
              <CalendarDays size={16} />
              {now.toLocaleDateString('id-ID', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
              })}
            </div>
            <div className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-blue-100">
              Lingkungan di bawah pengawasan
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Jumlah Warga" value={s.total_warga || 0} color="blue" delay={80} />
        <StatCard icon={Home} label="Rumah Kosong Aktif" value={s.rumah_kosong_aktif || 0} color="amber" delay={160} />
        <StatCard icon={ShieldCheck} label="Patroli Bulan Ini" value={s.ronda_bulan_ini || 0} color="emerald" delay={240} />
        <StatCard icon={AlertTriangle} label="Panic Aktif" value={s.panic_aktif || 0} color="red" delay={320} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trend.length > 0 && (
          <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
            <ChartCard
              title="Tren Kamtibmas 12 Bulan"
              activePeriod={trendPeriod}
              onPeriodChange={setTrendPeriod}
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={aggregateTrend(trend, trendPeriod)}>
                  <defs>
                    <linearGradient id="desaTrend" x1="0" y1="0" x2="0" y2="1">
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
                  <Bar dataKey="total" fill="url(#desaTrend)" radius={[8, 8, 0, 0]} maxBarSize={34} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}

        {kategori.length > 0 && (
          <div className="animate-fade-up" style={{ animationDelay: '280ms' }}>
            <ChartCard title="Breakdown Kategori" periods={[]}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={kategori} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}>
                    {kategori.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {status.length > 0 && (
          <div className="animate-fade-up" style={{ animationDelay: '360ms' }}>
            <ChartCard title="Status Laporan" periods={[]}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={status} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}>
                    {status.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name.toLowerCase()] || '#6b7280'} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}

        <div className="animate-fade-up" style={{ animationDelay: '440ms' }}>
          <Card title="Insight Keamanan">
            {aiLoading ? (
              <LoadingSpinner size="sm" className="py-6" />
            ) : aiInsight?.insight ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Sparkles size={14} className="text-purple-500" />
                  Periode: {aiInsight.periode?.start} s/d {aiInsight.periode?.end}
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {aiInsight.insight
                    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}]/gu, '')
                    .replace(/\*\*(.*?)\*\*/g, '$1')
                    .replace(/^[\d]+\.\s*/gm, '')
                    .replace(/^[-•]\s*/gm, '')
                    .replace(/\n{3,}/g, '\n\n')
                    .trim()}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/30 mb-3">
                  <Sparkles size={22} />
                </div>
                <p className="text-sm text-gray-400 mb-4">Belum ada insight tersedia</p>
                <button
                  onClick={handleGenerateInsight}
                  disabled={aiGenerating}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity shadow-lg shadow-blue-600/25"
                >
                  {aiGenerating ? 'Memproses...' : 'Muat Insight'}
                </button>
              </div>
            )}
          </Card>
        </div>

        {laporanPerDusun.length > 0 && (
          <div className="animate-fade-up" style={{ animationDelay: '520ms' }}>
            <Card title="Laporan per Dusun">
              <ProgressBar items={laporanPerDusun} />
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
