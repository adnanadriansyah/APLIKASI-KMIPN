const colorMap = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
  neutral: 'bg-gray-50 text-gray-600 border-gray-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
}

export default function Badge({ children, color = 'neutral', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorMap[color] || colorMap.neutral} ${className}`}>
      {children}
    </span>
  )
}
