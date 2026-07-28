export default function ProgressBar({ items = [], className = '' }) {
  const total = items.reduce((sum, item) => sum + (item.value || 0), 0)

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item) => {
        const pct = total > 0 ? Math.round((item.value / total) * 100) : 0
        return (
          <div key={item.key || item.label} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 shrink-0">
              {item.icon ? (
                <item.icon size={14} strokeWidth={2} />
              ) : (
                <span>{item.label?.charAt(0) || '?'}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700 truncate">{item.label}</span>
                <span className="text-sm font-medium text-gray-900 shrink-0 ml-2">{item.value}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        )
      })}
      {total === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">Tidak ada data</p>
      )}
    </div>
  )
}
