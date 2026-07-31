import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShieldCheck } from 'lucide-react'

export default function Sidebar({ title, navGroups }) {
  const { user } = useAuth()

  const initials = (user?.nama || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <aside className="w-64 shrink-0 flex flex-col bg-gradient-to-b from-slate-900 via-[#0c1d3f] to-slate-950 text-white">
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/40">
            <ShieldCheck size={22} className="text-white" />
          </div>
          <div>
            <div className="text-lg font-bold leading-tight">Siskamling</div>
            <div className="text-[11px] text-blue-300/80 mt-0.5">{title}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-6 overflow-y-auto">
        {navGroups.map((group, gi) => (
          <div key={group.label}>
            <div className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-blue-300/50">
              {group.label}
            </div>
            <div className="space-y-1">
              {group.items.map((item, i) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  style={{ animationDelay: `${120 + (gi * 2 + i) * 70}ms` }}
                  className={({ isActive }) =>
                    `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 animate-slide-left ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-600/30'
                        : 'text-blue-100/70 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-white" />
                      )}
                      <item.icon
                        size={18}
                        strokeWidth={2}
                        className="shrink-0 transition-transform duration-200 group-hover:scale-110"
                      />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate">{user?.nama}</div>
            <div className="text-[11px] text-blue-300/70 truncate">{user?.jabatan || 'Anggota'}</div>
          </div>
        </div>
      </div>
    </aside>
  )
}
