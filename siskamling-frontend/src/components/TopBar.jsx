import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, Bell, ChevronDown, LogOut, User, Shield, Mail, Smartphone, BellOff,
  ShieldAlert, Home, CalendarClock, Siren, Loader2, CornerDownLeft,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from './Toast'
import { searchGlobal } from '../api/search'

const TYPE_META = {
  warga: { label: 'Warga', icon: User, className: 'text-blue-500 bg-blue-50' },
  laporan: { label: 'Laporan Kamtibmas', icon: ShieldAlert, className: 'text-amber-500 bg-amber-50' },
  rumah_kosong: { label: 'Rumah Kosong', icon: Home, className: 'text-violet-500 bg-violet-50' },
  ronda: { label: 'Ronda', icon: CalendarClock, className: 'text-emerald-500 bg-emerald-50' },
  linmas: { label: 'Linmas', icon: Shield, className: 'text-indigo-500 bg-indigo-50' },
  panic: { label: 'Panic', icon: Siren, className: 'text-red-500 bg-red-50' },
}

export default function TopBar() {
  const { user, logout } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [searching, setSearching] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const dropdownRef = useRef(null)
  const notifRef = useRef(null)
  const searchRef = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const q = searchQuery.trim()
    if (q.length < 2) {
      setSearchResults(null)
      setSearchOpen(false)
      setSearching(false)
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(() => {
      setSearching(true)
      setSearchOpen(true)
      searchGlobal(q, controller.signal)
        .then((data) => setSearchResults(data))
        .catch((err) => {
          if (err.name !== 'CanceledError' && !controller.signal.aborted) setSearchResults([])
        })
        .finally(() => setSearching(false))
    }, 300)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [searchQuery])

  const goToResult = (item, q) => {
    navigate(`${item.target}?q=${encodeURIComponent(q)}`)
    setSearchQuery('')
    setSearchResults(null)
    setSearchOpen(false)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (q.length < 2) return
    if (searchResults?.length) {
      goToResult(searchResults[0], q)
    } else {
      toast.info(`Tidak ada hasil untuk "${q}"`)
    }
  }

  const handleLogout = async () => {
    setDropdownOpen(false)
    await logout()
    navigate('/login')
  }

  const initials = (user?.nama || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-xl border-b border-gray-100/80 shadow-sm shadow-gray-100/40">
      <div className="flex items-center justify-between gap-4 px-6 py-3.5">
        <div className="relative flex-1 max-w-md" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="group">
            <Search
              size={16}
              className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                searchOpen ? 'text-blue-500' : 'text-gray-400 group-focus-within:text-blue-500'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim().length >= 2 && setSearchOpen(true)}
              onKeyDown={(e) => e.key === 'Escape' && setSearchOpen(false)}
              placeholder="Cari warga, laporan, rumah kosong ..."
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-100/80 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white focus:border-blue-200 transition-all"
            />
            {searching && (
              <Loader2 size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-400 animate-spin" />
            )}
          </form>

          {searchOpen && (
            <div className="absolute left-0 right-0 top-full mt-3 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/60 py-2 z-50 overflow-hidden animate-scale-in max-h-96 overflow-y-auto">
              {searching && !searchResults && (
                <div className="px-6 py-8 flex flex-col items-center gap-2 text-gray-400">
                  <Loader2 size={20} className="animate-spin" />
                  <p className="text-sm">Mencari ...</p>
                </div>
              )}

              {!searching && searchResults && searchResults.length === 0 && (
                <div className="px-6 py-8 text-center">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 mb-3">
                    <Search size={22} />
                  </div>
                  <p className="text-sm text-gray-400">
                    Tidak ada hasil untuk "<span className="text-gray-600 font-medium">{searchQuery.trim()}</span>"
                  </p>
                </div>
              )}

              {searchResults && searchResults.length > 0 && (
                <>
                  <div className="px-5 pb-1 pt-2 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                      Hasil pencarian
                    </span>
                    <span className="text-[10px] text-gray-400">{searchResults.length} item</span>
                  </div>
                  <div className="py-1">
                    {searchResults.map((item, i) => {
                      const meta = TYPE_META[item.type] || TYPE_META.laporan
                      const Icon = meta.icon
                      return (
                        <button
                          key={`${item.type}-${item.id}`}
                          onClick={() => goToResult(item, searchQuery.trim())}
                          className="w-full flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 transition-colors text-left"
                        >
                          <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${meta.className}`}>
                            <Icon size={15} strokeWidth={2} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-gray-800 font-medium truncate">{item.title}</div>
                            <div className="text-xs text-gray-400 truncate">{item.subtitle}</div>
                          </div>
                          {i === 0 && (
                            <span className="text-[10px] text-gray-300 shrink-0 flex items-center gap-0.5">
                              Enter <CornerDownLeft size={11} />
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                  <div className="mx-5 my-1 border-t border-gray-50" />
                  <div className="px-5 py-2 flex items-center justify-between text-[11px] text-gray-400">
                    <span className="flex items-center gap-1.5"><CornerDownLeft size={12} /> Enter</span>
                    <span>Buka hasil pertama · <span className="text-blue-500 font-medium">Esc</span> tutup</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className={`relative p-2.5 rounded-xl transition-all ${
                notifOpen
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Bell size={20} strokeWidth={1.5} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse-soft" />
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-3 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/60 py-2 z-50 overflow-hidden animate-scale-in">
                <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Notifikasi
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-500 font-medium">
                    Baru
                  </span>
                </div>
                <div className="px-6 py-8 text-center">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 mb-3">
                    <BellOff size={22} />
                  </div>
                  <p className="text-sm text-gray-400">Belum ada notifikasi</p>
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-gray-200/80 mx-1 hidden sm:block" />

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`flex items-center gap-3 pl-2 pr-2 py-1.5 rounded-xl transition-all ${
                dropdownOpen ? 'bg-gray-100' : 'hover:bg-gray-100'
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-md shadow-blue-500/25 ring-2 ring-white">
                {initials}
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-sm font-semibold text-gray-900 leading-tight">{user?.nama}</div>
                <div className="text-xs text-gray-400 leading-tight">{user?.jabatan || '-'}</div>
              </div>
              <ChevronDown
                size={14}
                className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-3 w-60 bg-white border border-gray-100 rounded-2xl shadow-xl shadow-gray-200/60 py-2 z-50 overflow-hidden animate-scale-in">
                <div className="px-5 py-3 border-b border-gray-50">
                  <div className="text-sm font-semibold text-gray-900">{user?.nama}</div>
                  <div className="text-xs text-gray-400">{user?.email}</div>
                </div>
                <div className="px-5 py-2 space-y-1.5">
                  <div className="flex items-center gap-2.5 text-xs text-gray-500">
                    <Shield size={13} className="text-gray-400" /><span>{user?.role || '-'}</span>
                  </div>
                  {user?.jabatan && (
                    <div className="flex items-center gap-2.5 text-xs text-gray-500">
                      <User size={13} className="text-gray-400" /><span>{user.jabatan}</span>
                    </div>
                  )}
                  {user?.no_hp && (
                    <div className="flex items-center gap-2.5 text-xs text-gray-500">
                      <Smartphone size={13} className="text-gray-400" /><span>{user.no_hp}</span>
                    </div>
                  )}
                </div>
                <div className="my-1 border-t border-gray-50" />
                <button
                  onClick={() => navigate('/login')}
                  className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Mail size={16} strokeWidth={1.5} className="text-gray-400" />
                  Ubah Akun
                </button>
                <div className="my-1 border-t border-gray-50" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} strokeWidth={1.5} />
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
    </header>
  )
}
