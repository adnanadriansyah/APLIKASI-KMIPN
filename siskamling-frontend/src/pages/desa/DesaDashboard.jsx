import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getDesaSummary, getAiInsight, generateAiInsight } from '../../api/dashboard'
import { Card, ChartCard, StatCard, ProgressBar, LoadingSpinner } from '../../components'
import { Users, Home, ShieldCheck, AlertTriangle } from 'lucide-react'
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
      alert('Insight sedang digenerate. Coba beberapa saat lagi.')
    } catch (e) {
      alert('Gagal: ' + (e.response?.data?.message || e.message))
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard {data.desa?.nama}</h1>
        <p className="text-gray-500">{user?.jabatan} &middot; Aparatur Gampong</p>
      </div>

      {/* StatCards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Jumlah Warga" value={s.total_warga || 0} color="blue" />
        <StatCard icon={Home} label="Rumah Kosong Aktif" value={s.rumah_kosong_aktif || 0} color="amber" />
        <StatCard icon={ShieldCheck} label="Patroli Bulan Ini" value={s.ronda_bulan_ini || 0} color="emerald" />
        <StatCard icon={AlertTriangle} label="Panic Aktif" value={s.panic_aktif || 0} color="red" />
      </div>

      {/* Trend + Kategori */}
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
          <ChartCard title="Breakdown Kategori">
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>

      {/* Status + AI Insight + Laporan per Dusun */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {status.length > 0 && (
          <ChartCard title="Status Laporan">
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        <Card title="AI Insight">
          {aiLoading ? (
            <LoadingSpinner size="sm" className="py-6" />
          ) : aiInsight?.insight ? (
            <div className="space-y-3">
              <div className="text-xs text-gray-400">
                Periode: {aiInsight.periode?.start} s/d {aiInsight.periode?.end}
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {aiInsight.insight}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400 mb-4">Belum ada insight tersedia</p>
              <button
                onClick={handleGenerateInsight}
                disabled={aiGenerating}
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {aiGenerating ? 'Generating...' : 'Generate Insight'}
              </button>
            </div>
          )}
        </Card>

        {laporanPerDusun.length > 0 && (
          <Card title="Laporan per Dusun">
            <ProgressBar items={laporanPerDusun} />
          </Card>
        )}
      </div>
    </div>
  )
}
