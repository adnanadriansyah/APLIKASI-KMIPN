import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion } from 'framer-motion'
import { Mail, Lock, Shield } from 'lucide-react'
import bgImage from '../assets/images/screen.png'
import logoImage from '../assets/images/icon.png'

const tabs = [
  {
    key: 'warga',
    label: 'Warga',
    hint: 'koordinator1@gampong.test',
  },
  {
    key: 'aparatur_desa',
    label: 'Admin Desa',
    hint: 'keuchik@gampong.test',
  },
  {
    key: 'polsek',
    label: 'Polsek',
    hint: 'kapolsek@polsek.test',
  },
]

const DASHBOARD_MAP = {
  warga: '/warga/dashboard',
  aparatur_desa: '/desa/dashboard',
  polsek: '/polsek/dashboard',
}

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('warga')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleTabChange = (key) => {
    setActiveTab(key)
    setError(null)
    setEmail('')
    setPassword('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const user = await login(email, password)
      navigate(DASHBOARD_MAP[user.role] || '/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Periksa email dan password.')
    } finally {
      setSubmitting(false)
    }
  }

  const activeTabData = tabs.find((t) => t.key === activeTab)

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ── SISI KIRI: Foto + Overlay ── */}
      <div className="hidden md:flex relative w-[55%]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        />

        {/* Gradient overlay dari bawah */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Konten di atas foto */}
        <div className="relative z-10 flex flex-col justify-end p-12 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-white/80 text-xs font-medium mb-4 w-fit backdrop-blur-sm">
            <Shield className="w-3.5 h-3.5" />
            <span>SISTEM KEAMANAN TERPADU</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-[1.15] max-w-lg">
            Menjaga Gampong Jadi Lebih Mudah dan Digital.
          </h2>

          <p className="mt-4 text-sm text-gray-300 leading-relaxed max-w-md">
            Menghubungkan warga, aparat gampong, dan Polsek dalam satu platform
            untuk ronda, pelaporan kamtibmas, dan tanggap darurat real-time.
          </p>
        </div>
      </div>

      {/* ── SISI KANAN: Form Login ── */}
      <div className="w-full md:w-[45%] flex items-center justify-center bg-white px-6 py-12 md:px-12 md:py-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 mb-8">
            <img src={logoImage} alt="SiKamling Digital" className="w-8 h-8 object-contain" />
            <span className="text-xl font-extrabold text-gray-900 tracking-tight">
              SiKamling<span className="text-blue-600"> Digital</span>
            </span>
          </Link>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Selamat Datang Kembali</h1>
          <p className="text-sm text-gray-500 mb-6">Masuk untuk memantau keamanan gampong Anda.</p>

          {/* Tabs */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex-1 py-2.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-[#0f172a] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab description */}
          <p className="text-xs text-gray-400 mb-5">
            Contoh email: <span className="font-mono text-gray-500">{activeTabData.hint}</span>
          </p>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="nama@gampong.test"
                  autoComplete="email"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-[#0f172a] text-white rounded-lg text-sm font-medium hover:bg-blue-900 shadow-md hover:shadow-lg disabled:opacity-50 transition-all"
            >
              {submitting ? 'Masuk...' : 'Masuk Sekarang'}
            </button>
          </form>

          {/* Back link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            <Link to="/" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors">
              &larr; Kembali ke beranda
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
