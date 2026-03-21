from typing import List, Optional
from pydantic import BaseModel, Field


class ScanWeights(BaseModel):
    settlingTime: float = Field(default=0.4, ge=0)
    overshoot: float = Field(default=0.4, ge=0)
    disturbancePeak: float = Field(default=0.2, ge=0)


class ScanRequest(BaseModel):
    KaMin: float = Field(..., gt=0)
    KaMax: float = Field(..., gt=0)
    KaStep: float = Field(..., gt=0)

    K1Min: float = Field(..., ge=0)
    K1Max: float = Field(..., ge=0)
    K1Step: float = Field(..., gt=0)

    tEnd: float = Field(..., gt=0)
    dt: float = Field(..., gt=0)

    weights: ScanWeights = ScanWeights()


class ScanCell(BaseModel):
    Ka: float
    K1: float
    stable: bool

    riseTime: Optional[float] = None
    settlingTime: Optional[float] = None
    overshoot: Optional[float] = None
    peak: Optional[float] = None
    finalValue: Optional[float] = None
    disturbancePeak: Optional[float] = None
    disturbanceSettlingTime: Optional[float] = None
    score: Optional[float] = None


class ScanResponse(BaseModel):
    kaValues: List[float]
    k1Values: List[float]
    cells: List[ScanCell]
    bestPoint: Optional[ScanCell] = None