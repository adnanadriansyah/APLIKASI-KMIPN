import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Shield, Eye, EyeOff } from 'lucide-react'
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

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
}

const itemFade = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
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
      <motion.div
        className="hidden md:flex relative w-[55%]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        <motion.div
          className="relative z-10 flex flex-col justify-end p-12 w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-white/80 text-xs font-medium mb-4 w-fit backdrop-blur-sm"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>SISTEM KEAMANAN TERPADU</span>
          </motion.div>

          <motion.h2
            className="text-3xl lg:text-4xl font-extrabold text-white leading-[1.15] max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Menjaga Gampong Jadi Lebih Mudah dan Digital.
          </motion.h2>

          <motion.p
            className="mt-4 text-sm text-gray-300 leading-relaxed max-w-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Menghubungkan warga, aparat gampong, dan Polsek dalam satu platform
            untuk ronda, pelaporan kamtibmas, dan tanggap darurat real-time.
          </motion.p>
        </motion.div>
      </motion.div>

      {/* ── SISI KANAN: Form Login ── */}
      <div className="w-full md:w-[45%] flex items-center justify-center bg-white px-6 py-12 md:px-12 md:py-0">
        <motion.div
          className="w-full max-w-md"
          variants={container}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemFade}>
            <Link to="/" className="inline-flex items-center gap-2 mb-8 group">
              <motion.img
                src={logoImage}
                alt="SiKamling Digital"
                className="w-8 h-8 object-contain"
                whileHover={{ rotate: 10, scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              />
              <span className="text-xl font-extrabold text-gray-900 tracking-tight">
                SiKamling<span className="text-blue-600"> Digital</span>
              </span>
            </Link>
          </motion.div>

          <motion.h1 variants={itemFade} className="text-2xl font-bold text-gray-900 mb-1">
            Selamat Datang Kembali
          </motion.h1>
          <motion.p variants={itemFade} className="text-sm text-gray-500 mb-6">
            Masuk untuk memantau keamanan gampong Anda.
          </motion.p>

          {/* Tabs */}
          <motion.div variants={itemFade} className="flex rounded-lg bg-gray-100 p-1 mb-5">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex-1 py-2.5 rounded-md text-xs font-medium transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'bg-[#0f172a] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </motion.div>

          <motion.p variants={itemFade} className="text-xs text-gray-400 mb-5">
            Contoh email: <span className="font-mono text-gray-500">{activeTabData.hint}</span>
          </motion.p>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.form variants={itemFade} onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
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
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                />
              </div>
            </div>
            <motion.button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-[#0f172a] text-white rounded-lg text-sm font-medium hover:bg-blue-900 shadow-md hover:shadow-lg disabled:opacity-50 transition-all duration-300"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Memproses...
                </span>
              ) : (
                'Masuk Sekarang'
              )}
            </motion.button>
          </motion.form>

          <motion.p variants={itemFade} className="text-center text-sm text-gray-500 mt-6">
            <Link to="/" className="text-blue-600 hover:text-blue-700 hover:underline transition-colors">
              &larr; Kembali ke beranda
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  )
}
