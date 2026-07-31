import { useState } from 'react'
import Card from './Card'

const PERIODS = [
  { key: 'bulanan', label: 'Bulanan' },
  { key: 'kuartalan', label: 'Kuartalan' },
  { key: 'tahunan', label: 'Tahunan' },
]

export default function ChartCard({
  title,
  subtitle,
  children,
  className = '',
  activePeriod: controlledPeriod,
  onPeriodChange,
  periods,
}) {
  const [internalPeriod, setInternalPeriod] = useState('bulanan')
  const activePeriod = controlledPeriod ?? internalPeriod

  const handlePeriod = (key) => {
    if (onPeriodChange) onPeriodChange(key)
    else setInternalPeriod(key)
  }

  const tabs = periods || PERIODS
  const showTabs = !Array.isArray(periods) || periods.length > 0

  return (
    <Card
      title={title}
      subtitle={subtitle}
      className={className}
      actions={
        showTabs && (
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => !tab.disabled && handlePeriod(tab.key)}
              disabled={tab.disabled}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                activePeriod === tab.key
                  ? 'bg-white shadow-sm text-gray-800'
                  : tab.disabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        )
      }
    >
      <div className="w-full" style={{ minHeight: 280 }}>
        {children}
      </div>
    </Card>
  )
}
