import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const tabs = [
  {
    key: 'warga',
    label: 'Warga',
    icon: '👤',
    hint: 'koordinator1@gampong.test',
  },
  {
    key: 'aparatur_desa',
    label: 'Admin Desa',
    icon: '🏛️',
    hint: 'keuchik@gampong.test',
  },
  {
    key: 'polsek',
    label: 'Polsek',
    icon: '👮',
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <span className="text-2xl font-extrabold text-white tracking-tight">
              SiKamling<span className="text-blue-400"> Digital</span>
            </span>
          </Link>
          <p className="text-gray-400 text-sm mt-1">Gampong Kandang, Kecamatan Muara Dua</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {/* Tabs */}
          <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === tab.key
                    ? 'bg-white text-[#0f172a] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab description */}
          <p className="text-xs text-gray-400 text-center mb-5">
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
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="nama@gampong.test"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan password"
                autoComplete="current-password"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? 'Masuk...' : 'Masuk'}
            </button>
          </form>
        </div>

        {/* Back link */}
        <p className="text-center text-sm text-gray-500 mt-5">
          <Link to="/" className="text-blue-400 hover:text-blue-300 hover:underline transition-colors">
            &larr; Kembali ke beranda
          </Link>
        </p>
      </div>
    </div>
  )
}
