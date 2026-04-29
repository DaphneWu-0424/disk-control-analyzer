import ReactECharts from 'echarts-for-react' // 将 ECharts 图表作为 React 组件使用
import SectionCard from './SectionCard'

export default function LineChartCard({ title, xData = [], yData = [], yName = '输出'}) {
    const pairedData = xData
      .map((x, index) => [Number(x), Number(yData[index])])
      .filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y))

    const option = {
        tooltip: { trigger: 'axis' },
        xAxis: {
        type: 'value',
        name: 't/s',
        scale: false,
        },
        yAxis: {
        type: 'value',
        name: yName,
        scale: true,
        },
        series: [
        {
            type: 'line',
            data: pairedData,
            smooth: false,
            showSymbol: false,
            lineStyle: {
              width: 2,
            },
        },
        ],
        grid: {
        left: 50,
        right: 20,
        top: 30,
        bottom: 40,
        },
    }

    return (
        <SectionCard title={title}>
          {pairedData.length ? (
            <ReactECharts option={option} notMerge style={{ height: '320px' }} />
          ) : (
            <div className="mode-hint">暂无阶跃响应数据，请重新生成或检查当前参数是否导致计算发散。</div>
          )}
        </SectionCard>
      )
}