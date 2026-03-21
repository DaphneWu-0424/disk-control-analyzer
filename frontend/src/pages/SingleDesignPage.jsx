/* eslint-disable no-unused-vars */
import { useState } from 'react'
import NumberInput from '../components/NumberInput'
import SectionCard from '../components/SectionCard'
import LineChartCard from '../components/LineChartCard'
import MetricsPanel from '../components/MetricsPanel'
import ErrorMessage from '../components/ErrorMessage'

export default function SingleDesignPage() {
  const [params, setParams] = useState({
    Ka: 100,
    K1: 0.05,
    tEnd: 1,
    dt: 0.01,
  })

  const [result] = useState({
    inputResponse: {
      time: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
      output: [0, 0.35, 0.72, 0.93, 0.99, 1.0],
    },
    disturbanceResponse: {
      time: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
      output: [0, -0.001, -0.0018, -0.002, -0.002, -0.002],
    },
    metrics: {
      riseTime: 0.12,
      settlingTime: 0.26,
      overshoot: 2.3,
      peak: 1.023,
      finalValue: 1.0,
      disturbancePeak: 0.002,
      disturbanceSettlingTime: 0.24,
    },
  })

  const [error, setError] = useState('')

  const handleChange = (key, value) => {
    setParams((prev) => ({ ...prev, [key]: value }))
  }

  const handleRun = async () => {
    setError('')
    try {
      // 这里先不接后端，后面接
      console.log('运行参数：', params)
    } catch (err) {
      setError('仿真失败，请检查输入参数或后端服务')
    }
  }

  return (
    <div className="page-grid single-page">
      <div className="left-panel">
        <SectionCard title="单参数设计">
          <div className="form-grid">
            <NumberInput label="Ka" value={params.Ka} onChange={(v) => handleChange('Ka', v)} />
            <NumberInput label="K1" value={params.K1} onChange={(v) => handleChange('K1', v)} step="0.01" />
            <NumberInput label="仿真时长 tEnd" value={params.tEnd} onChange={(v) => handleChange('tEnd', v)} step="0.1" />
            <NumberInput label="时间步长 dt" value={params.dt} onChange={(v) => handleChange('dt', v)} step="0.001" />
          </div>

          <div className="button-row">
            <button onClick={handleRun}>运行仿真</button>
          </div>

          <ErrorMessage message={error} />
        </SectionCard>
      </div>

      <div className="right-panel">
        <LineChartCard
          title="单位阶跃输入响应"
          xData={result.inputResponse.time}
          yData={result.inputResponse.output}
        />
        <LineChartCard
          title="单位阶跃扰动响应"
          xData={result.disturbanceResponse.time}
          yData={result.disturbanceResponse.output}
        />
        <MetricsPanel metrics={result.metrics} />
      </div>
    </div>
  )
}