# Disk Control Analyzer

A visual tool for disk control analysis.

This project provides a simple frontend + backend demo for simulating and visualizing the response of a disk control system. You can adjust system parameters, run simulations, and observe both reference-input and disturbance responses.

---

## Overview

The transfer functions used in this demo project are:

$$
G_1(s) = \frac{5000}{s+1000}, \quad G_2(s)= \frac{1}{s(s+20)}
$$
When the disturbance $N(s)$ is zero, the closed loop transfer function is:
$$
\phi(s) = \frac{K_aG_1(s)G_2(s)}{1+K_aG_1(s)G_2(s)} = \frac{5000K_a}{s(s+20)(s+1000)+5000K_a}
$$

When the input $R(s)$ is zero, the closed loop transfer function is:
$$
\phi(s) = \frac{C(s)}{N(s)} = \frac{-G_2(s)}{1+K_aG_1(s)G_2(s)}
$$

This project is mainly intended as a **visual analysis demo**.  
If you want to adapt it to another control system, just update:

- the transfer functions
- the related parameters
- the corresponding frontend/backend calculation logic if needed

---
## Project Structure

```text
disk-control-analyzer/
├─ frontend/   # React frontend
├─ backend/    # FastAPI backend
└─ README.md
```

---
## Operation steps 
### 1. start frontend
```shell
cd frontend
npm run dev
```

### 2. start backend
```shell
cd backend
uvicorn app:app --reload --port 8001
```

---
## Notes
- Make sure the frontend and backend are both running before using the demo.
- The frontend port in this project is 5174, if If Vite starts on a different port, please update the corresponding setting in `backend/app.py`.
- The backend default port in this project is 8001.
- If you change the backend port or API path, remember to update the frontend request configuration as well.