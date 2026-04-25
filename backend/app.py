from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from schemas.simulate_schemas import SimulateRequest, SimulateResponse
from schemas.scan_schema import ScanRequest, ScanResponse
from services import control_model
from services import scanner as scanner_service
from services import simulator as simulator_service
import importlib
import inspect
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
    return {
        "status": "ok",
        "buildSystemsSignature": str(inspect.signature(control_model.build_systems)),
    }

@app.get("/")
def root():
    return {"message": "Disk Control Analyzer API is running"}

@app.post("/api/simulate", response_model=SimulateResponse)
def simulate(payload: SimulateRequest):
    try:
        return simulator_service.simulate_case(payload)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {e}")


@app.post("/api/scan", response_model=ScanResponse)
def scan(payload: ScanRequest):
    try:
        return scanner_service.scan_cases(payload)
    except TypeError as e:
        # 防御式兜底：当旧函数签名残留在进程中时，自动热重载并重试一次。
        if "build_systems() missing 1 required positional argument: 'model_type'" in str(e):
            importlib.reload(control_model)
            importlib.reload(scanner_service)
            return scanner_service.scan_cases(payload)
        raise HTTPException(status_code=500, detail=f"Scan failed: {e}")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Scan failed: {e}")