import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, ChevronDown, LogOut, User, Shield, Mail, Smartphone } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from './Toast'

export default function TopBar() {
  const { user, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef(null)
  const notifRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    setDropdownOpen(false)
    await logout()
    navigate('/login')
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    toast.info(`Mencari: "${searchQuery.trim()}"`)
    setSearchQuery('')
  }

  const initials = (user?.nama || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="bg-white border-b border-gray-100 px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari laporan, warga ..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
          />
        </form>

        <div className="flex items-center gap-4">
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Bell size={20} strokeWidth={1.5} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-100 rounded-xl shadow-lg py-2 z-50">
                <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Notifikasi</div>
                <div className="px-4 py-6 text-sm text-gray-400 text-center">Belum ada notifikasi</div>
              </div>
            )}
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                {initials}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-sm font-medium text-gray-900 leading-tight">{user?.nama}</div>
                <div className="text-xs text-gray-400 leading-tight">{user?.jabatan || '-'}</div>
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-50">
                  <div className="text-sm font-semibold text-gray-900">{user?.nama}</div>
                  <div className="text-xs text-gray-400">{user?.email}</div>
                </div>
                <div className="px-4 py-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Shield size={12} /><span>{user?.role || '-'}</span>
                  </div>
                  {user?.jabatan && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <User size={12} /><span>{user.jabatan}</span>
                    </div>
                  )}
                  {user?.no_hp && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Smartphone size={12} /><span>{user.no_hp}</span>
                    </div>
                  )}
                </div>
                <hr className="border-gray-100 my-1" />
                <button
                  onClick={() => navigate('/login')}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Mail size={16} strokeWidth={1.5} />
                  Ubah Akun
                </button>
                <hr className="border-gray-100 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} strokeWidth={1.5} />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
