from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas.simulate_schemas import SimulateRequest, SimulateResponse
from services.simulator import simulate_case
from schemas.scan_schema import ScanRequest, ScanResponse
from services.scanner import scan_cases
import os

app = FastAPI(
    # 初始化FastAPI实例，设置API标题和版本
    title="Disk Control Analyzer API",
    version="0.2.0",
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
    return {"status": "ok"}

@app.get("/")
def root():
    return {"message": "Disk Control Analyzer API is running"}

@app.post("/api/simulate", response_model=SimulateResponse)
def simulate(payload: SimulateRequest):
    try:
        return simulate_case(payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {e}")


@app.post("/api/scan", response_model=ScanResponse)
def scan(payload: ScanRequest):
    try:
        return scan_cases(payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scan failed: {e}")