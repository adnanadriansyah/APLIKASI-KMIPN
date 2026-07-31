import { useState, useEffect } from 'react'
import { ArrowUp, ArrowDown } from 'lucide-react'

function useCountUp(target, duration = 850) {
  const [display, setDisplay] = useState(typeof target === 'number' ? 0 : target)

  useEffect(() => {
    const numeric = Number(target)
    if (target === '' || target == null || !isFinite(numeric)) {
      setDisplay(target)
      return
    }
    let raf
    const start = performance.now()
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration)
      setDisplay(Math.round(numeric * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])

  return display
}

const colorMap = {
  blue: { icon: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/30', accent: 'from-blue-500 to-indigo-500' },
  amber: { icon: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/30', accent: 'from-amber-500 to-orange-500' },
  emerald: { icon: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/30', accent: 'from-emerald-500 to-teal-500' },
  red: { icon: 'from-red-500 to-rose-600', shadow: 'shadow-red-500/30', accent: 'from-red-500 to-rose-500' },
  purple: { icon: 'from-purple-500 to-violet-600', shadow: 'shadow-purple-500/30', accent: 'from-purple-500 to-violet-500' },
  gray: { icon: 'from-gray-500 to-slate-600', shadow: 'shadow-gray-500/30', accent: 'from-gray-500 to-slate-500' },
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  changePercent,
  changeLabel,
  color = 'blue',
  suffix = '',
  delay = 0,
}) {
  const palette = colorMap[color] || colorMap.blue
  const animatedValue = useCountUp(value)
  const hasChange = changePercent != null && changePercent !== ''

  return (
    <div
      className="relative overflow-hidden bg-white rounded-2xl border border-gray-100/80 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/70 animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${palette.accent}`} />
      <div className="flex items-start justify-between">
        {Icon && (
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${palette.icon} text-white flex items-center justify-center shadow-lg ${palette.shadow}`}
          >
            <Icon size={22} strokeWidth={2} />
          </div>
        )}
        {hasChange && (
          <span
            className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
              changePercent >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
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
        <div className="text-3xl font-bold text-gray-800">
          {animatedValue}
          {suffix}
        </div>
        <div className="text-sm text-gray-500 mt-1">{label}</div>
      </div>
      {hasChange && changeLabel && (
        <div className="text-xs text-gray-400 mt-2">{changeLabel}</div>
      )}
    </div>
  )
}
