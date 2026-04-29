from typing import Dict, List, Optional
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


class DetectParametersRequest(BaseModel):
    numerator: List[str] = Field(..., min_length=5, max_length=5)
    denominator: List[str] = Field(..., min_length=5, max_length=5)


class DetectParametersResponse(BaseModel):
    parameters: List[str]


class ParameterConfig(BaseModel):
    mode: str = Field(default="fixed", pattern="^(fixed|scan)$")
    value: Optional[float] = None
    min: Optional[float] = None
    max: Optional[float] = None
    step: Optional[float] = None


class TimeConfig(BaseModel):
    start: float = Field(default=0)
    end: float = Field(..., gt=0)
    points: int = Field(..., ge=2, le=5000)


class SimulateRequest(BaseModel):
    numerator: List[str] = Field(..., min_length=5, max_length=5)
    denominator: List[str] = Field(..., min_length=5, max_length=5)
    parameters: Dict[str, ParameterConfig] = Field(default_factory=dict)
    scanParameter: str
    time: TimeConfig


class StepFrame(BaseModel):
    parameterValue: float
    numeratorCoeffs: List[float]
    denominatorCoeffs: List[float]
    transferFunction: str
    stable: bool
    response: TimeSeries
    metrics: Metrics


class SimulateResponse(BaseModel):
    scanParameter: str
    frames: List[StepFrame]