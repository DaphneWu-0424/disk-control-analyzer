import { useMemo, useState } from 'react'
import NumberInput from '../components/NumberInput'
import SectionCard from '../components/SectionCard'
import HeatmapChart from '../components/HeatmapChart'
import SelectedPointPanel from '../components/SelectedPointPanel'
import ErrorMessage from '../components/ErrorMessage'
import Loading from '../components/Loading'
import { scanSystem } from '../services/api'
import { buildHeatmapData, findCell } from '../utils/heatmap'

const defaultConfig = {
  KaMin: 20,
  KaMax: 120,
  KaStep: 20,
  K1Min: 0,
  K1Max: 0.1,
  K1Step: 0.02,
  tEnd: 1,
  dt: 0.01,
  weights: {
    settlingTime: 0.4,
    overshoot: 0.4,
    disturbancePeak: 0.2,
  },
}

const metricTabs = [
  { key: 'overshoot', label: '超调量热图' },
  { key: 'settlingTime', label: '调节时间热图' },
  { key: 'riseTime', label: '上升时间热图' },
  { key: 'disturbancePeak', label: '扰动峰值热图' },
  { key: 'disturbanceSettlingTime', label: '扰动调节时间热图' },
  { key: 'score', label: '综合评分热图' },
]

export default function ScanPage() {
  const [config, setConfig] = useState(defaultConfig)
  const [scanResult, setScanResult] = useState(null)
  const [selectedPoint, setSelectedPoint] = useState({
    Ka: null,
    K1: null,
    positionOnly: null,
    positionVelocity: null,
  })
  const [activeMetric, setActiveMetric] = useState('overshoot')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const handleWeightChange = (key, value) => {
    setConfig((prev) => ({
      ...prev,
      weights: {
        ...prev.weights,
        [key]: value,
      },
    }))
  }

  const validateConfig = () => {
    if (config.KaMin <= 0 || config.KaMax <= 0) return 'Ka 范围必须大于 0'
    if (config.KaMin > config.KaMax) return 'Ka 最小值不能大于最大值'
    if (config.KaStep <= 0) return 'Ka 步长必须大于 0'

    if (config.K1Min < 0 || config.K1Max < 0) return 'K1 不能小于 0'
    if (config.K1Min > config.K1Max) return 'K1 最小值不能大于最大值'
    if (config.K1Step <= 0) return 'K1 步长必须大于 0'

    if (config.tEnd <= 0) return '仿真时长必须大于 0'
    if (config.dt <= 0) return '时间步长必须大于 0'
    if (config.dt >= config.tEnd) return '时间步长 dt 必须小于仿真时长 tEnd'

    return ''
  }

  const handleScan = async () => {
    const validationError = validateConfig()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError('')
    setSelectedPoint({
      Ka: null,
      K1: null,
      positionOnly: null,
      positionVelocity: null,
    })

    try {
      const data = await scanSystem(config)
      setScanResult(data)

      const preferredPoint =
        data?.comparison?.positionVelocity?.bestPoint ||
        data?.comparison?.positionOnly?.bestPoint

      if (preferredPoint) {
        syncSelectedPoint(data, preferredPoint.Ka, preferredPoint.K1)
      }
    } catch (err) {
      console.error('scan failed:', err)
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        '参数扫描失败，请检查后端服务'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const positionOnlyHeatmapData = useMemo(() => {
    if (!scanResult) return []
    return buildHeatmapData(
      scanResult?.comparison?.positionOnly?.cells || [],
      scanResult.kaValues,
      scanResult.k1Values,
      activeMetric
    )
  }, [scanResult, activeMetric])

  const positionVelocityHeatmapData = useMemo(() => {
    if (!scanResult) return []
    return buildHeatmapData(
      scanResult?.comparison?.positionVelocity?.cells || [],
      scanResult.kaValues,
      scanResult.k1Values,
      activeMetric
    )
  }, [scanResult, activeMetric])

  const syncSelectedPoint = (data, Ka, K1) => {
    const positionOnly = findCell(data?.comparison?.positionOnly?.cells || [], Ka, K1)
    const positionVelocity = findCell(data?.comparison?.positionVelocity?.cells || [], Ka, K1)

    setSelectedPoint({
      Ka,
      K1,
      positionOnly: positionOnly || null,
      positionVelocity: positionVelocity || null,
    })
  }

  const handlePointClick = (params) => {
    if (!scanResult || !params?.data) return

    const [xIndex, yIndex] = params.data
    const Ka = scanResult?.kaValues?.[xIndex]
    const K1 = scanResult?.k1Values?.[yIndex]
    if (Ka === undefined || K1 === undefined) return

    syncSelectedPoint(scanResult, Ka, K1)
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

            <NumberInput label="仿真时长 tEnd" value={config.tEnd} onChange={(v) => handleChange('tEnd', v)} step="0.1" />
            <NumberInput label="时间步长 dt" value={config.dt} onChange={(v) => handleChange('dt', v)} step="0.001" />
          </div>

          <div className="section-divider" />

          <div className="form-grid">
            <NumberInput
              label="调节时间权重"
              value={config.weights.settlingTime}
              onChange={(v) => handleWeightChange('settlingTime', v)}
              step="0.1"
            />
            <NumberInput
              label="超调量权重"
              value={config.weights.overshoot}
              onChange={(v) => handleWeightChange('overshoot', v)}
              step="0.1"
            />
            <NumberInput
              label="扰动峰值权重"
              value={config.weights.disturbancePeak}
              onChange={(v) => handleWeightChange('disturbancePeak', v)}
              step="0.1"
            />
          </div>

          <div className="button-row button-row-inline">
            <button onClick={handleScan} disabled={loading}>
              {loading ? '扫描中...' : '开始扫描'}
            </button>
          </div>

          <ErrorMessage message={error} />
        </SectionCard>

        <SectionCard title="当前选中参数">
          {selectedPoint.Ka === null ? (
            <div>点击热图中的点查看两种模型在同一参数点下的对比结果</div>
          ) : (
            <div>
              <p><strong>Ka：</strong>{selectedPoint.Ka}</p>
              <p><strong>K1：</strong>{selectedPoint.K1}</p>
            </div>
          )}
        </SectionCard>

        <SelectedPointPanel
          title="仅位置反馈（例3-19）"
          point={selectedPoint.positionOnly}
        />
        <SelectedPointPanel
          title="位置+速度反馈（例3-20）"
          point={selectedPoint.positionVelocity}
        />
      </div>

      <div className="right-panel">
        {loading ? <Loading text="正在进行参数扫描，请稍候..." /> : null}

        <SectionCard title="指标切换">
          <div className="tab-row">
            {metricTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={activeMetric === tab.key ? 'tab-button active' : 'tab-button'}
                onClick={() => setActiveMetric(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </SectionCard>

        <div className="compare-heatmaps">
          <HeatmapChart
            title={`仅位置反馈（例3-19） - ${metricTabs.find((tab) => tab.key === activeMetric)?.label || '热图'}`}
            xLabels={scanResult?.kaValues || []}
            yLabels={scanResult?.k1Values || []}
            data={positionOnlyHeatmapData}
            onPointClick={handlePointClick}
          />
          <HeatmapChart
            title={`位置+速度反馈（例3-20） - ${metricTabs.find((tab) => tab.key === activeMetric)?.label || '热图'}`}
            xLabels={scanResult?.kaValues || []}
            yLabels={scanResult?.k1Values || []}
            data={positionVelocityHeatmapData}
            onPointClick={handlePointClick}
          />
        </div>
      </div>
    </div>
  )
}