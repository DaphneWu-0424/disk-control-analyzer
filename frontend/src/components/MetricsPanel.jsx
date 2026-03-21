import SectionCard from './SectionCard'

const metricItems = [
  { key: 'riseTime', label: '上升时间' },
  { key: 'settlingTime', label: '调节时间' },
  { key: 'overshoot', label: '超调量' },
  { key: 'peak', label: '峰值' },
  { key: 'finalValue', label: '稳态值' },
  { key: 'disturbancePeak', label: '扰动峰值' },
  { key: 'disturbanceSettlingTime', label: '扰动调节时间' },
]

export default function MetricsPanel({ metrics = {} }) {
  return (
    <SectionCard title="时域指标">
      <div className="metrics-grid">
        {metricItems.map((item) => (
          <div key={item.key} className="metric-card">
            <div className="metric-label">{item.label}</div>
            <div className="metric-value">
              {metrics[item.key] ?? '--'}
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}