export default function ChartTooltip({ active, payload, label, suffix, valueName }) {
  if (!active || !payload?.length) return null

  const title = label || payload[0]?.name

  return (
    <div className="rounded-xl bg-slate-900/95 px-3.5 py-2.5 text-white shadow-xl border border-white/10 min-w-[120px]">
      {title && <div className="text-xs text-slate-300 mb-1.5">{title}</div>}
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2 text-sm font-semibold">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: p.color || p.payload?.fill || '#3b82f6' }}
            />
            <span>{valueName || p.name}</span>
            <span className="ml-auto pl-3">{p.value}</span>
            {suffix && <span className="text-xs font-normal text-slate-400">{suffix}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
