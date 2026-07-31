import { Outlet } from 'react-router-dom'
import TopBar from '../components/TopBar'
import Sidebar from '../components/Sidebar'
import { LayoutDashboard, FileText, Shield, AlertTriangle } from 'lucide-react'

const navGroups = [
  {
    label: 'Menu Utama',
    items: [
      { to: '/polsek/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/polsek/manajemen-laporan', label: 'Manajemen Laporan', icon: FileText },
    ],
  },
  {
    label: 'Lainnya',
    items: [
      { to: '/polsek/manajemen-linmas', label: 'Manajemen Linmas', icon: Shield },
      { to: '/polsek/riwayat-panic', label: 'Riwayat Panic Alert', icon: AlertTriangle },
    ],
  },
]

export default function PolsekLayout() {
  return (
    <div className="flex h-screen bg-slate-100">
      <Sidebar title="Portal Polsek" navGroups={navGroups} />
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
