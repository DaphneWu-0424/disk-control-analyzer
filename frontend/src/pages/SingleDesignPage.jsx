/* data字段传输的数据结构如下：
{
  "inputResponse": {
    "time": [0, 0.1, 0.2],
    "output": [0, 0.4, 0.8]
  },
  "disturbanceResponse": {
    "time": [0, 0.1, 0.2],
    "output": [0, -0.001, -0.002]
  },
  "metrics": {
    "riseTime": 0.12,
    "settlingTime": 0.26,
    "overshoot": 2.3,
    "peak": 1.023,
    "finalValue": 1.0,
    "disturbancePeak": 0.002,
    "disturbanceSettlingTime": 0.24
  }
}
*/
import { useState } from 'react'
import NumberInput from '../components/NumberInput'
import SectionCard from '../components/SectionCard'
import LineChartCard from '../components/LineChartCard'
import MetricsPanel from '../components/MetricsPanel'
import ErrorMessage from '../components/ErrorMessage'
import Loading from '../components/Loading'
import { simulateSystem } from '../services/api'

const defaultParams = {
  Ka: 100,
  K1: 0.05,
  tEnd: 1,
  dt: 0.01,
}

const emptyResult = {
  inputResponse: {
    time: [],
    output: [],
  },
  disturbanceResponse: {
    time: [],
    output: [],
  },
  metrics: {},
}

function normalizeSimulationResult(data) {
  return {
    inputResponse: {
      time: data?.inputResponse?.time || [],
      output: data?.inputResponse?.output || [],
    },
    disturbanceResponse: {
      time: data?.disturbanceResponse?.time || [],
      output: data?.disturbanceResponse?.output || [],
    },
    metrics: {
      riseTime: data?.metrics?.riseTime ?? '--',
      settlingTime: data?.metrics?.settlingTime ?? '--',
      overshoot: data?.metrics?.overshoot ?? '--',
      peak: data?.metrics?.peak ?? '--',
      finalValue: data?.metrics?.finalValue ?? '--',
      disturbancePeak: data?.metrics?.disturbancePeak ?? '--',
      disturbanceSettlingTime: data?.metrics?.disturbanceSettlingTime ?? '--',
    },
  }
}

export default function SingleDesignPage() {
  const [params, setParams] = useState(defaultParams)
  const [result, setResult] = useState(emptyResult)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (key, value) => {
    setParams((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const validateParams = () => {
    if (params.Ka <= 0) return 'Ka 必须大于 0'
    if (params.K1 < 0) return 'K1 不能小于 0'
    if (params.tEnd <= 0) return '仿真时长 tEnd 必须大于 0'
    if (params.dt <= 0) return '时间步长 dt 必须大于 0'
    if (params.dt >= params.tEnd) return '时间步长 dt 必须小于仿真时长 tEnd'
    return ''
  }

  const handleRun = async () => {
    const validationError = validateParams()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError('')

    try {
      const data = await simulateSystem({
        Ka: params.Ka,
        K1: params.K1,
        tEnd: params.tEnd,
        dt: params.dt,
      })

      setResult(normalizeSimulationResult(data))
    } catch (err) {
      console.error('simulate failed:', err)

      const message =
        err?.response?.data?.detail ||
        err?.message ||
        '仿真失败，请检查后端服务是否启动'

      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setParams(defaultParams)
    setResult(emptyResult)
    setError('')
  }

  return (
    <div className="page-grid single-page">
      <div className="left-panel">
        <SectionCard title="单参数设计">
          <div className="form-grid">
            <NumberInput
              label="Ka"
              value={params.Ka}
              onChange={(v) => handleChange('Ka', v)}
            />
            <NumberInput
              label="K1"
              value={params.K1}
              onChange={(v) => handleChange('K1', v)}
              step="0.01"
            />
            <NumberInput
              label="仿真时长 tEnd"
              value={params.tEnd}
              onChange={(v) => handleChange('tEnd', v)}
              step="0.1"
            />
            <NumberInput
              label="时间步长 dt"
              value={params.dt}
              onChange={(v) => handleChange('dt', v)}
              step="0.001"
            />
          </div>

          <div className="button-row button-row-inline">
            <button onClick={handleRun} disabled={loading}>
              {loading ? '仿真中...' : '运行仿真'}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={handleReset}
              disabled={loading}
            >
              恢复默认
            </button>
          </div>

          <ErrorMessage message={error} />
        </SectionCard>
      </div>

      <div className="right-panel">
        {loading ? <Loading text="正在请求后端并计算响应..." /> : null}

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