import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/desa/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/desa/penjadwalan-ronda', label: 'Penjadwalan Ronda', icon: '🌙' },
  { to: '/desa/rekap-rumah-kosong', label: 'Rekap Rumah Kosong', icon: '🏡' },
  { to: '/desa/kamtibmas', label: 'Kamtibmas', icon: '🚨' },
  { to: '/desa/manajemen-warga', label: 'Manajemen Warga', icon: '👥' },
  { to: '/desa/scan-qr', label: 'Scan QR Presensi', icon: '📷' },
]

export default function DesaLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-blue-600">Siskamling</h1>
          <p className="text-xs text-gray-400 mt-1">Portal Aparatur Gampong</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="text-sm font-medium text-gray-900">{user?.nama}</div>
          <div className="text-xs text-gray-400">{user?.jabatan || 'Aparatur Gampong'}</div>
          <button onClick={handleLogout} className="mt-3 w-full text-sm text-red-600 hover:text-red-700 py-2">
            Keluar
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
