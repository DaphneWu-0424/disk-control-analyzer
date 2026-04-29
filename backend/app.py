from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas.simulate_schemas import (
    DetectParametersRequest,
    DetectParametersResponse,
    SimulateRequest,
    SimulateResponse,
)
from services import simulator as simulator_service
import os

app = FastAPI(
    title="Transfer Function Analyzer API",
    version="1.0.0",
)

frontend_origin = os.getenv("FRONTEND_ORIGIN")

allowed_origins = {
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
}
if frontend_origin:
    allowed_origins.add(frontend_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=sorted(allowed_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "transfer-function-analyzer",
    }

@app.get("/")
def root():
    return {"message": "Transfer Function Analyzer API is running"}


@app.post("/api/detect-parameters", response_model=DetectParametersResponse)
def detect_parameters(payload: DetectParametersRequest):
    try:
        return simulator_service.detect_transfer_parameters(payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parameter detection failed: {e}")

@app.post("/api/simulate", response_model=SimulateResponse)
def simulate(payload: SimulateRequest):
    try:
        return simulator_service.simulate_case(payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {e}")