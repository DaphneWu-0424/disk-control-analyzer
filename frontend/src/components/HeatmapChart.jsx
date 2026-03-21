import ReactECharts from 'echarts-for-react'
import SectionCard from './SectionCard'

export default function HeatmapChart({
  title,
  xLabels = [],
  yLabels = [],
  data = [],
  onPointClick,
}) {
  const validValues = data
    .map((item) => item[2])
    .filter((v) => typeof v === 'number' && !Number.isNaN(v))

  const minValue = validValues.length ? Math.min(...validValues) : 0
  const maxValue = validValues.length ? Math.max(...validValues) : 1

  const option = {
    tooltip: {
      position: 'top',
      formatter: (params) => {
        const [xIndex, yIndex, value] = params.data
        const ka = xLabels[xIndex]
        const k1 = yLabels[yIndex]

        if (value === null || value === undefined || value === '-') {
          return `Ka: ${ka}<br/>K1: ${k1}<br/>无稳定结果`
        }

        return `Ka: ${ka}<br/>K1: ${k1}<br/>值: ${value}`
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
      min: minValue,
      max: maxValue,
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