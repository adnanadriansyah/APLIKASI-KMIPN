import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import TopBar from '../components/TopBar'
import { Home, Moon, AlertOctagon, House, Siren } from 'lucide-react'

const navGroups = [
  {
    label: 'Menu Utama',
    items: [
      { to: '/warga/dashboard', label: 'Dashboard', icon: Home },
      { to: '/warga/ronda', label: 'Jadwal Ronda', icon: Moon },
      { to: '/warga/kamtibmas', label: 'Laporan Kamtibmas', icon: AlertOctagon },
      { to: '/warga/rumah-kosong', label: 'Rumah Kosong', icon: House },
    ],
  },
  {
    label: 'Lainnya',
    items: [
      { to: '/warga/panic', label: 'Panic Button', icon: Siren },
    ],
  },
]

export default function WargaLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold text-blue-600">Siskamling</h1>
          <p className="text-xs text-gray-400 mt-1">Portal Warga</p>
        </div>

        <nav className="flex-1 p-4 space-y-5 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider px-3 mb-2">
                {group.label}
              </div>
              <div className="space-y-1">
                {group.items.map((item) => (
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
                    <item.icon size={18} strokeWidth={2} />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="text-sm font-medium text-gray-900">{user?.nama}</div>
          <div className="text-xs text-gray-400">{user?.jabatan || 'Warga'}</div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar user={user} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
