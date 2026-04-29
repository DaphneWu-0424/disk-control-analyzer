import { useEffect, useMemo, useState } from 'react'
import SectionCard from '../components/SectionCard'
import LineChartCard from '../components/LineChartCard'
import RootLocusChart from '../components/RootLocusChart'
import MetricsPanel from '../components/MetricsPanel'
import ErrorMessage from '../components/ErrorMessage'
import Loading from '../components/Loading'
import { detectParameters, simulateSystem } from '../services/api'

const POWERS = [4, 3, 2, 1, 0]

const defaultNumerator = ['', '', '', 'K1', 'K2']
const defaultDenominator = ['', '', '1', 'K3', '5']
const defaultTime = {
  start: 0,
  end: 10,
  points: 1000,
}

const emptyResult = {
  scanParameter: '',
  frames: [],
}

function coefficientLabel(power) {
  if (power === 0) return '常数项'
  if (power === 1) return 's'
  return `s^${power}`
}

function buildParameterConfig(parameters, previousConfig = {}, preferredScanParameter = '') {
  const nextScanParameter = parameters.includes(preferredScanParameter)
    ? preferredScanParameter
    : parameters[0] || ''

  return parameters.reduce((acc, name, index) => {
    const previous = previousConfig[name] || {}
    acc[name] = {
      mode: name === nextScanParameter || (!nextScanParameter && index === 0) ? 'scan' : 'fixed',
      value: previous.value ?? 1,
      min: previous.min ?? 0.1,
      max: previous.max ?? 10,
      step: previous.step ?? 0.1,
    }
    return acc
  }, {})
}

function normalizeMetrics(metrics = {}) {
  return {
    riseTime: metrics.riseTime ?? '--',
    settlingTime: metrics.settlingTime ?? '--',
    overshoot: metrics.overshoot ?? '--',
    peak: metrics.peak ?? '--',
    finalValue: metrics.finalValue ?? '--',
  }
}

export default function SingleDesignPage() {
  const [numerator, setNumerator] = useState(defaultNumerator)
  const [denominator, setDenominator] = useState(defaultDenominator)
  const [detectedParams, setDetectedParams] = useState([])
  const [paramConfig, setParamConfig] = useState({})
  const [scanParameter, setScanParameter] = useState('')
  const [timeConfig, setTimeConfig] = useState(defaultTime)
  const [result, setResult] = useState(emptyResult)
  const [frameIndex, setFrameIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const currentFrame = result.frames[frameIndex] || null
  const currentResponse = currentFrame?.response || { time: [], output: [] }
  const currentMetrics = normalizeMetrics(currentFrame?.metrics)

  const previewText = useMemo(() => {
    const renderSide = (values) =>
      values
        .map((value, index) => {
          const text = value.trim() || '0'
          const power = POWERS[index]
          if (text === '0') return null
          if (power === 0) return text
          if (power === 1) return `${text}·s`
          return `${text}·s^${power}`
        })
        .filter(Boolean)
        .join(' + ') || '0'

    return `G(s) = (${renderSide(numerator)}) / (${renderSide(denominator)})`
  }, [numerator, denominator])

  useEffect(() => {
    if (!playing || result.frames.length <= 1) return undefined

    const timer = window.setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % result.frames.length)
    }, 450)

    return () => window.clearInterval(timer)
  }, [playing, result.frames.length])

  const handleCoefficientChange = (side, index, value) => {
    const updater = side === 'numerator' ? setNumerator : setDenominator
    updater((prev) => prev.map((item, itemIndex) => (itemIndex === index ? value : item)))
  }

  const handleDetectParameters = async () => {
    setLoading(true)
    setError('')
    setResult(emptyResult)
    setFrameIndex(0)
    setPlaying(false)

    try {
      const data = await detectParameters({ numerator, denominator })
      const parameters = data?.parameters || []
      setDetectedParams(parameters)
      const nextConfig = buildParameterConfig(parameters, paramConfig, scanParameter)
      setParamConfig(nextConfig)
      setScanParameter(parameters.includes(scanParameter) ? scanParameter : parameters[0] || '')
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        '参数解析失败，请检查系数表达式'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleParamChange = (name, key, value) => {
    setParamConfig((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        [key]: value,
      },
    }))
  }

  const handleScanParameterChange = (name) => {
    setScanParameter(name)
    setParamConfig((prev) => {
      const next = {}
      Object.keys(prev).forEach((key) => {
        next[key] = {
          ...prev[key],
          mode: key === name ? 'scan' : 'fixed',
        }
      })
      return next
    })
  }

  const validateBeforeRun = (parameters, configMap, activeScanParameter) => {
    if (!parameters.length) return '至少需要一个可扫描参数'
    if (!activeScanParameter) return '请选择一个扫描参数'
    if (timeConfig.start >= timeConfig.end) return '时间起点必须小于终点'
    if (timeConfig.points < 2) return '采样点数至少为 2'

    const config = configMap[activeScanParameter]
    if (!config) return '扫描参数配置不存在'
    if (config.min > config.max) return '扫描参数最小值不能大于最大值'
    if (config.step <= 0) return '扫描参数步长必须大于 0'
    return ''
  }

  const handleRun = async () => {
    setLoading(true)
    setError('')
    setPlaying(false)

    try {
      const detectedData = await detectParameters({ numerator, denominator })
      const parameters = detectedData?.parameters || []
      const activeScanParameter = parameters.includes(scanParameter)
        ? scanParameter
        : parameters[0] || ''
      const nextConfig = buildParameterConfig(parameters, paramConfig, activeScanParameter)
      const validationError = validateBeforeRun(parameters, nextConfig, activeScanParameter)
      if (validationError) {
        throw new Error(validationError)
      }

      setDetectedParams(parameters)
      setParamConfig(nextConfig)
      setScanParameter(activeScanParameter)

      const payload = {
        numerator,
        denominator,
        parameters: nextConfig,
        scanParameter: activeScanParameter,
        time: timeConfig,
      }
      const data = await simulateSystem(payload)
      if (!data?.frames?.length) {
        throw new Error('后端没有返回响应帧，请检查扫描范围和步长')
      }

      setResult(data)
      setFrameIndex(0)
    } catch (err) {
      const message =
        err?.response?.data?.detail ||
        err?.message ||
        '阶跃响应生成失败，请确认后端已启动并重新生成'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setNumerator(defaultNumerator)
    setDenominator(defaultDenominator)
    setDetectedParams([])
    setParamConfig({})
    setScanParameter('')
    setTimeConfig(defaultTime)
    setResult(emptyResult)
    setFrameIndex(0)
    setPlaying(false)
    setError('')
  }

  return (
    <div className="page-grid transfer-page">
      <div className="left-panel">
        <SectionCard title="传递函数系数填空">
          <div className="mode-hint">{previewText}</div>
          <div className="coefficient-editor">
            <div className="coefficient-title">分子</div>
            {POWERS.map((power, index) => (
              <label className="form-field" key={`num-${power}`}>
                <span>{coefficientLabel(power)}</span>
                <input
                  type="text"
                  value={numerator[index]}
                  placeholder="空白表示 0"
                  onChange={(event) =>
                    handleCoefficientChange('numerator', index, event.target.value)
                  }
                />
              </label>
            ))}

            <div className="coefficient-title">分母</div>
            {POWERS.map((power, index) => (
              <label className="form-field" key={`den-${power}`}>
                <span>{coefficientLabel(power)}</span>
                <input
                  type="text"
                  value={denominator[index]}
                  placeholder="空白表示 0"
                  onChange={(event) =>
                    handleCoefficientChange('denominator', index, event.target.value)
                  }
                />
              </label>
            ))}
          </div>

          <div className="button-row button-row-inline">
            <button onClick={handleDetectParameters} disabled={loading}>
              解析参数
            </button>
            <button className="secondary-button" onClick={handleReset} disabled={loading}>
              恢复默认
            </button>
          </div>
        </SectionCard>

        <SectionCard title="参数配置">
          {detectedParams.length === 0 ? (
            <div className="mode-hint">解析后会自动显示 K1、K2 等参数配置。</div>
          ) : (
            <div className="parameter-list">
              <label className="form-field">
                <span>扫描参数</span>
                <select
                  value={scanParameter}
                  onChange={(event) => handleScanParameterChange(event.target.value)}
                >
                  {detectedParams.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>

              {detectedParams.map((name) => {
                const config = paramConfig[name] || {}
                const isScan = name === scanParameter

                return (
                  <div className="parameter-card" key={name}>
                    <div className="parameter-card-title">
                      {name} {isScan ? '（滑块参数）' : '（固定参数）'}
                    </div>
                    <label className="form-field">
                      <span>固定值</span>
                      <input
                        type="number"
                        value={config.value ?? 1}
                        step="any"
                        onChange={(event) =>
                          handleParamChange(name, 'value', Number(event.target.value))
                        }
                      />
                    </label>
                    {isScan ? (
                      <div className="scan-config-grid">
                        <label className="form-field">
                          <span>最小值</span>
                          <input
                            type="number"
                            value={config.min ?? 0.1}
                            step="any"
                            onChange={(event) =>
                              handleParamChange(name, 'min', Number(event.target.value))
                            }
                          />
                        </label>
                        <label className="form-field">
                          <span>最大值</span>
                          <input
                            type="number"
                            value={config.max ?? 10}
                            step="any"
                            onChange={(event) =>
                              handleParamChange(name, 'max', Number(event.target.value))
                            }
                          />
                        </label>
                        <label className="form-field">
                          <span>步长</span>
                          <input
                            type="number"
                            value={config.step ?? 0.1}
                            step="any"
                            onChange={(event) =>
                              handleParamChange(name, 'step', Number(event.target.value))
                            }
                          />
                        </label>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard title="仿真时间">
          <div className="scan-config-grid">
            <label className="form-field">
              <span>起点</span>
              <input
                type="number"
                value={timeConfig.start}
                step="any"
                onChange={(event) =>
                  setTimeConfig((prev) => ({ ...prev, start: Number(event.target.value) }))
                }
              />
            </label>
            <label className="form-field">
              <span>终点</span>
              <input
                type="number"
                value={timeConfig.end}
                step="any"
                onChange={(event) =>
                  setTimeConfig((prev) => ({ ...prev, end: Number(event.target.value) }))
                }
              />
            </label>
            <label className="form-field">
              <span>采样点数</span>
              <input
                type="number"
                value={timeConfig.points}
                min="2"
                step="1"
                onChange={(event) =>
                  setTimeConfig((prev) => ({ ...prev, points: Number(event.target.value) }))
                }
              />
            </label>
          </div>

          <div className="button-row">
            <button onClick={handleRun} disabled={loading}>
              {loading ? '计算中...' : '生成阶跃响应'}
            </button>
          </div>

          <ErrorMessage message={error} />
        </SectionCard>
      </div>

      <div className="right-panel">
        {loading ? <Loading text="正在计算参数扫描响应..." /> : null}

        <SectionCard title="滑块动画">
          {currentFrame ? (
            <div className="slider-panel">
              <div className="mode-hint">
                当前 {result.scanParameter} = {currentFrame.parameterValue}
              </div>
              <div className="mode-hint">
                阶跃响应点数：{currentResponse.output.length}
                {currentFrame.stable ? '' : '，当前传递函数极点不稳定，响应可能发散'}
              </div>
              <input
                className="frame-slider"
                type="range"
                min="0"
                max={Math.max(result.frames.length - 1, 0)}
                value={frameIndex}
                onChange={(event) => setFrameIndex(Number(event.target.value))}
              />
              <div className="button-row-inline">
                <button
                  type="button"
                  onClick={() => setPlaying((prev) => !prev)}
                  disabled={result.frames.length <= 1}
                >
                  {playing ? '暂停' : '播放'}
                </button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setPlaying(false)
                    setFrameIndex(0)
                  }}
                >
                  重置动画
                </button>
              </div>
              <div className="transfer-text">{currentFrame.transferFunction}</div>
            </div>
          ) : (
            <div className="mode-hint">生成响应后，可用滑块查看参数变化下的阶跃响应。</div>
          )}
        </SectionCard>

        <LineChartCard
          title="单位阶跃响应"
          xData={currentResponse.time}
          yData={currentResponse.output}
        />

        <RootLocusChart
          frames={result.frames}
          currentFrame={currentFrame}
          currentIndex={frameIndex}
          scanParameter={result.scanParameter}
        />

        <MetricsPanel metrics={currentMetrics} title="当前帧时域指标" />
      </div>
    </div>
  )
}
