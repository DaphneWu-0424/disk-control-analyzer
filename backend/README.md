# Backend

FastAPI service for the transfer-function analyzer.

## Main Endpoints

- `GET /api/health`: backend health check.
- `POST /api/detect-parameters`: detect symbolic parameters from numerator and denominator coefficient expressions.
- `POST /api/simulate`: generate step-response frames for one scan parameter.

## Run

```shell
poetry install
poetry run uvicorn app:app --reload --port 8001
```
