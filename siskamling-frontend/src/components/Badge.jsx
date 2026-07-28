const colorMap = {
  success: 'bg-emerald-50 text-emerald-700',
  danger: 'bg-red-50 text-red-700',
  warning: 'bg-amber-50 text-amber-700',
  info: 'bg-sky-50 text-sky-700',
  neutral: 'bg-gray-100 text-gray-600',
  purple: 'bg-purple-50 text-purple-700',
}

export default function Badge({ children, color = 'neutral', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[color] || colorMap.neutral} ${className}`}>
      {children}
    </span>
  )
}
