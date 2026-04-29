import ReactECharts from 'echarts-for-react'
import SectionCard from './SectionCard'

function buildAllPolePoints(frames) {
  return frames.flatMap((frame) =>
    (frame.rootLocusPoles || frame.poles || []).map((pole) => ({
      value: [pole.real, pole.imag],
      parameterValue: frame.parameterValue,
    }))
  )
}

function sortPoles(poles) {
  return [...(poles || [])].sort((a, b) => {
    if (a.real !== b.real) return a.real - b.real
    return a.imag - b.imag
  })
}

function distance(a, b) {
  return Math.hypot(a.real - b.real, a.imag - b.imag)
}

function buildPoleBranches(frames) {
  if (!frames.length) return []

  const initialPoles = sortPoles(frames[0].rootLocusPoles || frames[0].poles)
  const branches = initialPoles.map((pole) => [
    {
      value: [pole.real, pole.imag],
      parameterValue: frames[0].parameterValue,
    },
  ])

  for (let frameIndex = 1; frameIndex < frames.length; frameIndex += 1) {
    const frame = frames[frameIndex]
    const candidates = sortPoles(frame.rootLocusPoles || frame.poles).map((pole) => ({ ...pole }))
    const assigned = new Set()

    branches.forEach((branch) => {
      const previousPoint = branch[branch.length - 1]
      const previousPole = {
        real: previousPoint.value[0],
        imag: previousPoint.value[1],
      }

      let bestIndex = -1
      let bestDistance = Number.POSITIVE_INFINITY
      candidates.forEach((candidate, candidateIndex) => {
        if (assigned.has(candidateIndex)) return

        const candidateDistance = distance(previousPole, candidate)
        if (candidateDistance < bestDistance) {
          bestDistance = candidateDistance
          bestIndex = candidateIndex
        }
      })

      if (bestIndex >= 0) {
        assigned.add(bestIndex)
        const pole = candidates[bestIndex]
        branch.push({
          value: [pole.real, pole.imag],
          parameterValue: frame.parameterValue,
        })
      }
    })
  }

  return branches
}

function buildCurrentPolePoints(frame) {
  if (!frame) return []

  return (frame.rootLocusPoles || frame.poles || []).map((pole) => ({
    value: [pole.real, pole.imag],
    parameterValue: frame.parameterValue,
  }))
}

export default function RootLocusChart({
  frames = [],
  currentFrame = null,
  currentIndex = 0,
  scanParameter = '',
}) {
  const allPoints = buildAllPolePoints(frames)
  const currentPoints = buildCurrentPolePoints(currentFrame)
  const branches = buildPoleBranches(frames)
  const historyBranches = branches.map((branch) => branch.slice(0, currentIndex + 1))

  const lineSeries = branches.flatMap((branch, index) => [
    {
      name: `完整轨迹 ${index + 1}`,
      type: 'line',
      data: branch,
      showSymbol: false,
      lineStyle: {
        width: 1,
        opacity: 0.25,
      },
    },
    {
      name: `历史轨迹 ${index + 1}`,
      type: 'line',
      data: historyBranches[index],
      showSymbol: false,
      lineStyle: {
        width: 3,
      },
    },
  ])

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const [real, imag] = params.data.value
        const parameterText = scanParameter
          ? `<br/>${scanParameter}: ${params.data.parameterValue}`
          : ''
        return `实部: ${real}<br/>虚部: ${imag}${parameterText}`
      },
    },
    xAxis: {
      type: 'value',
      name: 'Real',
      scale: true,
      splitLine: { show: true },
    },
    yAxis: {
      type: 'value',
      name: 'Imag',
      scale: true,
      splitLine: { show: true },
    },
    series: [
      ...lineSeries,
      {
        name: '极点采样',
        type: 'scatter',
        data: allPoints,
        symbolSize: 5,
        itemStyle: {
          opacity: 0.25,
        },
      },
      {
        name: '当前极点',
        type: 'scatter',
        data: currentPoints,
        symbol: 'diamond',
        symbolSize: 14,
      },
    ],
    grid: {
      left: 55,
      right: 25,
      top: 35,
      bottom: 45,
    },
  }

  return (
    <SectionCard title="单位负反馈根轨迹图">
      {allPoints.length ? (
        <ReactECharts option={option} style={{ height: '360px' }} />
      ) : (
        <div className="mode-hint">
          生成响应后，这里会显示 D(s)+N(s)=0 的闭环极点轨迹。
        </div>
      )}
    </SectionCard>
  )
}
