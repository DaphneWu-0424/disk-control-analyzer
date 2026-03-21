import SectionCard from './SectionCard'

export default function SelectedPointPanel({ point }) {
  return (
    <SectionCard title="当前选中参数点">
      {!point ? (
        <div>点击热图中的点查看详情</div>
      ) : (
        <div className="selected-point-panel">
          <p><strong>Ka：</strong>{point.Ka}</p>
          <p><strong>K1：</strong>{point.K1}</p>
          <p><strong>上升时间：</strong>{point.riseTime}</p>
          <p><strong>调节时间：</strong>{point.settlingTime}</p>
          <p><strong>超调量：</strong>{point.overshoot}</p>
          <p><strong>扰动峰值：</strong>{point.disturbancePeak}</p>
          <p><strong>扰动调节时间：</strong>{point.disturbanceSettlingTime}</p>
          <p><strong>综合评分：</strong>{point.score}</p>
        </div>
      )}
    </SectionCard>
  )
}