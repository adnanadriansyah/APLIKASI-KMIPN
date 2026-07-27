import Card from './Card'

export default function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <Card title={title} subtitle={subtitle} className={className}>
      <div className="w-full" style={{ minHeight: 280 }}>
        {children}
      </div>
    </Card>
  )
}
