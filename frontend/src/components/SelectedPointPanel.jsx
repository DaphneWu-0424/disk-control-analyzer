import SectionCard from './SectionCard'

function displayValue(value) {
  if (value === null || value === undefined) return '--'
  return value
}

export default function SelectedPointPanel({ point, title = '当前选中参数点' }) {
  return (
    <SectionCard title={title}>
      {!point ? (
        <div>点击热图中的点查看详情</div>
      ) : (
        <div className="selected-point-panel">
          <p><strong>Ka：</strong>{displayValue(point.Ka)}</p>
          <p><strong>K1：</strong>{displayValue(point.K1)}</p>
          <p><strong>稳定性：</strong>{point.stable ? '稳定' : '不稳定'}</p>
          <p><strong>上升时间：</strong>{displayValue(point.riseTime)}</p>
          <p><strong>调节时间：</strong>{displayValue(point.settlingTime)}</p>
          <p><strong>超调量：</strong>{displayValue(point.overshoot)}</p>
          <p><strong>峰值：</strong>{displayValue(point.peak)}</p>
          <p><strong>稳态值：</strong>{displayValue(point.finalValue)}</p>
          <p><strong>扰动峰值：</strong>{displayValue(point.disturbancePeak)}</p>
          <p><strong>扰动调节时间：</strong>{displayValue(point.disturbanceSettlingTime)}</p>
          <p><strong>综合评分：</strong>{displayValue(point.score)}</p>
        </div>
      )}
    </SectionCard>
  )
}