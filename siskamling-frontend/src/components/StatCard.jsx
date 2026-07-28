import { ArrowUp, ArrowDown } from 'lucide-react'

export default function StatCard({
  icon: Icon,
  label,
  value,
  changePercent,
  changeLabel,
  color = 'blue',
}) {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    amber: 'bg-amber-100 text-amber-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    gray: 'bg-gray-100 text-gray-600',
  }

  const hasChange = changePercent != null && changePercent !== ''

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color] || colorMap.blue}`}>
            <Icon size={22} strokeWidth={2} />
          </div>
        )}
        {hasChange && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
              changePercent >= 0
                ? 'bg-green-50 text-green-600'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {changePercent >= 0 ? (
              <ArrowUp size={12} strokeWidth={2.5} />
            ) : (
              <ArrowDown size={12} strokeWidth={2.5} />
            )}
            {Math.abs(changePercent)}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold text-gray-800">{value}</div>
        <div className="text-sm text-gray-500 mt-1">{label}</div>
      </div>
      {hasChange && changeLabel && (
        <div className="text-xs text-gray-400 mt-2">{changeLabel}</div>
      )}
    </div>
  )
}
