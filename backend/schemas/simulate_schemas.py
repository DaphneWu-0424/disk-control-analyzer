'''
schemas格式：
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
'''


from typing import List, Optional
from pydantic import BaseModel, Field


class TimeSeries(BaseModel):
    time: List[float]
    output: List[float]


class Metrics(BaseModel):
    riseTime: Optional[float] = None
    settlingTime: Optional[float] = None
    overshoot: Optional[float] = None
    peak: Optional[float] = None
    finalValue: Optional[float] = None
    disturbancePeak: Optional[float] = None
    disturbanceSettlingTime: Optional[float] = None


class SimulateRequest(BaseModel):
    Ka: float = Field(..., gt=0, description="Amplifier gain")
    K1: float = Field(..., ge=0, description="Velocity feedback coefficient")
    tEnd: float = Field(..., gt=0, description="Simulation end time")
    dt: float = Field(..., gt=0, description="Time step")


class SimulateResponse(BaseModel):
    inputResponse: TimeSeries
    disturbanceResponse: TimeSeries
    metrics: Metrics