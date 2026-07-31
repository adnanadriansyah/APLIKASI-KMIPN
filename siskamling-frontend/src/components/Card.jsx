export default function Card({ title, subtitle, children, className = '', actions }) {
  return (
    <div
      className={`rounded-2xl bg-white border border-gray-100/80 shadow-sm p-6 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/70 ${className}`}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
