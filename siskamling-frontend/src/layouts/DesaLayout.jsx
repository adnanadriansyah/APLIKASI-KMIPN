import { Outlet } from 'react-router-dom'
import TopBar from '../components/TopBar'
import Sidebar from '../components/Sidebar'
import { LayoutDashboard, CalendarClock, ScanLine, Home, ShieldAlert, Users } from 'lucide-react'

const navGroups = [
  {
    label: 'Menu Utama',
    items: [
      { to: '/desa/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/desa/penjadwalan-ronda', label: 'Penjadwalan Ronda', icon: CalendarClock },
      { to: '/desa/scan-qr', label: 'Scanner Presensi', icon: ScanLine },
    ],
  },
  {
    label: 'Lainnya',
    items: [
      { to: '/desa/rekap-rumah-kosong', label: 'Rekap Rumah Kosong', icon: Home },
      { to: '/desa/kamtibmas', label: 'Kamtibmas', icon: ShieldAlert },
      { to: '/desa/manajemen-warga', label: 'Manajemen Warga', icon: Users },
    ],
  },
]

export default function DesaLayout() {
  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar title="Portal Aparatur Gampong" navGroups={navGroups} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
