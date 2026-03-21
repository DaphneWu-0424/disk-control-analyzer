import ReactECharts from 'echarts-for-react' // 将 ECharts 图表作为 React 组件使用
import SectionCard from './SectionCard'

export default function LineChartCard({ title, xData = [], yData = [], yName = '输出'}) {
    const option = {
        tooltip: { trigger: 'axis' },
        xAxis: {
        type: 'category',
        name: 't/s',
        data: xData,
        },
        yAxis: {
        type: 'value',
        name: yName,
        scale: true,
        },
        series: [
        {
            type: 'line',
            data: yData,
            smooth: false,
            showSymbol: false,
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
          <ReactECharts option={option} style={{ height: '320px' }} />
        </SectionCard>
      )
}