import { Outlet } from 'react-router-dom'
import TopBar from '../components/TopBar'
import Sidebar from '../components/Sidebar'
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
  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar title="Portal Warga" navGroups={navGroups} />
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
