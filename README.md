# Transfer Function Analyzer

A frontend + backend tool for visualizing step responses of parameterized transfer functions.

The app supports transfer functions up to fourth order. Users fill numerator and denominator coefficient boxes from `s^4` to the constant term, use symbolic parameters such as `K1`, `K2`, `zeta`, or `wn`, and let the backend detect those parameters automatically. One parameter can then be selected as the slider/animation parameter while the others stay fixed.

## Features

- Fourth-order coefficient form for numerator and denominator input
- Automatic parameter detection from coefficient expressions
- Single-parameter scan with slider and playback animation
- Step-response curve rendering with ECharts
- Basic time-domain metrics: rise time, settling time, overshoot, peak, final value

## Tech Stack

- Frontend: React, Vite, ECharts
- Backend: FastAPI, python-control, NumPy, SymPy

## Run

Start the backend:

```shell
cd backend
poetry install
poetry run uvicorn app:app --reload --port 8001
```

Start the frontend:

```shell
cd frontend
npm install
npm run dev
```

The frontend calls the backend at `http://127.0.0.1:8001/api`.

## Input Rules

- Coefficient boxes accept numbers and simple parameter expressions, for example `K1`, `K2`, `2*zeta*wn`, or `wn^2`.
- Use explicit multiplication, such as `2*K1`, not `2K1`.
- Parameter names must start with a letter or underscore and then contain letters, numbers, or underscores.
- The Laplace variable `s` is reserved and should not be entered as a parameter inside coefficient boxes.
- The first version supports one scan parameter at a time.
