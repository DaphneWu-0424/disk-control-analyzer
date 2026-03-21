import { useState } from 'react'
import NumberInput from '../components/NumberInput'
import SectionCard from '../components/SectionCard'
import HeatmapChart from '../components/HeatmapChart'
import SelectedPointPanel from '../components/SelectedPointPanel'

export default function ScanPage() {
  const [config, setConfig] = useState({
    KaMin: 20,
    KaMax: 120,
    KaStep: 20,
    K1Min: 0,
    K1Max: 0.1,
    K1Step: 0.02,
    tEnd: 1,
    dt: 0.01,
  })

  const [selectedPoint, setSelectedPoint] = useState(null)

  const xLabels = [20, 40, 60, 80, 100, 120]
  const yLabels = [0, 0.02, 0.04, 0.06, 0.08, 0.1]

  const heatmapData = [
    [0, 0, 15],
    [1, 0, 12],
    [2, 0, 10],
    [3, 0, 9],
    [4, 0, 8],
    [5, 0, 7],
    [0, 1, 10],
    [1, 1, 8],
    [2, 1, 6],
    [3, 1, 5],
    [4, 1, 4],
    [5, 1, 4],
    [0, 2, 7],
    [1, 2, 6],
    [2, 2, 5],
    [3, 2, 4],
    [4, 2, 3],
    [5, 2, 3],
  ]

  const mockCells = [
    { Ka: 100, K1: 0.04, riseTime: 0.13, settlingTime: 0.26, overshoot: 3.0, disturbancePeak: 0.0021, disturbanceSettlingTime: 0.20, score: 0.22 },
    { Ka: 120, K1: 0.04, riseTime: 0.11, settlingTime: 0.24, overshoot: 3.2, disturbancePeak: 0.0019, disturbanceSettlingTime: 0.18, score: 0.20 },
  ]

  const handleChange = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const handleScan = () => {
    console.log('开始扫描：', config)
  }

  const handlePointClick = (params) => {
    const [xIndex, yIndex] = params.data
    const Ka = xLabels[xIndex]
    const K1 = yLabels[yIndex]

    const found =
      mockCells.find((item) => item.Ka === Ka && item.K1 === K1) ||
      { Ka, K1, riseTime: '--', settlingTime: '--', overshoot: params.data[2], disturbancePeak: '--', disturbanceSettlingTime: '--', score: '--' }

    setSelectedPoint(found)
  }

  return (
    <div className="page-grid scan-page">
      <div className="left-panel">
        <SectionCard title="参数扫描设置">
          <div className="form-grid">
            <NumberInput label="Ka 最小值" value={config.KaMin} onChange={(v) => handleChange('KaMin', v)} />
            <NumberInput label="Ka 最大值" value={config.KaMax} onChange={(v) => handleChange('KaMax', v)} />
            <NumberInput label="Ka 步长" value={config.KaStep} onChange={(v) => handleChange('KaStep', v)} />
            <NumberInput label="K1 最小值" value={config.K1Min} onChange={(v) => handleChange('K1Min', v)} step="0.01" />
            <NumberInput label="K1 最大值" value={config.K1Max} onChange={(v) => handleChange('K1Max', v)} step="0.01" />
            <NumberInput label="K1 步长" value={config.K1Step} onChange={(v) => handleChange('K1Step', v)} step="0.01" />
          </div>

          <div className="button-row">
            <button onClick={handleScan}>开始扫描</button>
          </div>
        </SectionCard>

        <SelectedPointPanel point={selectedPoint} />
      </div>

      <div className="right-panel">
        <HeatmapChart
          title="超调量热图"
          xLabels={xLabels}
          yLabels={yLabels}
          data={heatmapData}
          onPointClick={handlePointClick}
        />
      </div>
    </div>
  )
}