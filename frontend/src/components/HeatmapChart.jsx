import ReactECharts from 'echarts-for-react'
import SectionCard from './SectionCard'

export default function HeatmapChart({
  title,
  xLabels = [],
  yLabels = [],
  data = [],
  onPointClick,
}) {
  const option = {
    tooltip: {
      position: 'top',
      formatter: (params) => {
        const [xIndex, yIndex, value] = params.data
        return `Ka: ${xLabels[xIndex]}<br/>K1: ${yLabels[yIndex]}<br/>值: ${value}`
      },
    },
    grid: {
      height: '70%',
      top: '10%',
    },
    xAxis: {
      type: 'category',
      data: xLabels,
      name: 'Ka',
      splitArea: { show: true },
    },
    yAxis: {
      type: 'category',
      data: yLabels,
      name: 'K1',
      splitArea: { show: true },
    },
    visualMap: {
      min: Math.min(...data.map(item => item[2])),
      max: Math.max(...data.map(item => item[2])),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
    },
    series: [
      {
        name: title,
        type: 'heatmap',
        data,
        label: { show: false },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
          },
        },
      },
    ],
  }

  return (
    <SectionCard title={title}>
      <ReactECharts
        option={option}
        style={{ height: '420px' }}
        onEvents={{
          click: (params) => {
            if (onPointClick) onPointClick(params)
          },
        }}
      />
    </SectionCard>
  )
}