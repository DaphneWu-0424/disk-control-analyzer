export function buildHeatmapData(cells = [], kaValues = [], k1Values = [], metricKey) {
    const kaIndexMap = new Map(kaValues.map((v, i) => [Number(v), i]))
    const k1IndexMap = new Map(k1Values.map((v, i) => [Number(v), i]))
  
    return cells.map((cell) => {
      const xIndex = kaIndexMap.get(Number(cell.Ka))
      const yIndex = k1IndexMap.get(Number(cell.K1))
      const value = cell[metricKey]
  
      return [xIndex, yIndex, value ?? null]
    })
  }
  
  export function findCell(cells = [], Ka, K1) {
    return cells.find(
      (cell) => Number(cell.Ka) === Number(Ka) && Number(cell.K1) === Number(K1)
    )
  }