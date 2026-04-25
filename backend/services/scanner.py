import numpy as np
import control as ct

from services.control_model import build_systems
from services.metrics import compute_input_metrics, compute_disturbance_metrics


def _round_float(x, ndigits=6):
    return round(float(x), ndigits)


def _round_list(arr, ndigits=6):
    return [_round_float(x, ndigits) for x in arr]


def _build_axis(start, end, step):
    values = np.arange(start, end + step * 0.5, step)
    return _round_list(values)


def _normalize(values):
    arr = np.asarray(values, dtype=float)
    vmin = np.min(arr)
    vmax = np.max(arr)
    if abs(vmax - vmin) < 1e-12:
        return np.zeros_like(arr)
    return (arr - vmin) / (vmax - vmin)


def _scan_single_model(ka_values, k1_values, t, weights, model_type: str):
    cells = []

    for k1 in k1_values:
        for ka in ka_values:
            effective_k1 = 0.0 if model_type == "positionOnly" else k1
            sys_input, sys_disturbance = build_systems(ka, effective_k1, model_type)

            poles = ct.poles(sys_input)
            stable = bool(np.all(np.real(poles) < 0))

            cell = {
                "Ka": ka,
                "K1": k1,
                "stable": stable,
                "riseTime": None,
                "settlingTime": None,
                "overshoot": None,
                "peak": None,
                "finalValue": None,
                "disturbancePeak": None,
                "disturbanceSettlingTime": None,
                "score": None,
            }

            if stable:
                t_in, y_in = ct.step_response(sys_input, T=t)
                t_dis, y_dis = ct.step_response(sys_disturbance, T=t)

                y_in = np.asarray(y_in).squeeze()
                y_dis = np.asarray(y_dis).squeeze()

                cell.update(compute_input_metrics(t_in, y_in))
                cell.update(compute_disturbance_metrics(t_dis, y_dis))

            cells.append(cell)

    stable_cells = [c for c in cells if c["stable"]]

    if stable_cells:
        settling_list = [c["settlingTime"] for c in stable_cells]
        overshoot_list = [c["overshoot"] for c in stable_cells]
        disturbance_peak_list = [c["disturbancePeak"] for c in stable_cells]

        settling_norm = _normalize(settling_list)
        overshoot_norm = _normalize(overshoot_list)
        disturbance_peak_norm = _normalize(disturbance_peak_list)

        w1 = weights.settlingTime
        w2 = weights.overshoot
        w3 = weights.disturbancePeak
        weight_sum = w1 + w2 + w3 if (w1 + w2 + w3) > 0 else 1.0

        for i, cell in enumerate(stable_cells):
            score = (
                w1 * settling_norm[i]
                + w2 * overshoot_norm[i]
                + w3 * disturbance_peak_norm[i]
            ) / weight_sum
            cell["score"] = _round_float(score)

        best_point = min(stable_cells, key=lambda x: x["score"])
    else:
        best_point = None

    return {
        "modelType": model_type,
        "cells": cells,
        "bestPoint": best_point,
    }


def scan_cases(payload):
    if payload.dt >= payload.tEnd:
        raise ValueError("dt must be smaller than tEnd")

    ka_values = _build_axis(payload.KaMin, payload.KaMax, payload.KaStep)
    k1_values = _build_axis(payload.K1Min, payload.K1Max, payload.K1Step)
    t = np.arange(0, payload.tEnd + payload.dt, payload.dt)

    return {
        "kaValues": ka_values,
        "k1Values": k1_values,
        "comparison": {
            "positionOnly": _scan_single_model(
                ka_values, k1_values, t, payload.weights, "positionOnly"
            ),
            "positionVelocity": _scan_single_model(
                ka_values, k1_values, t, payload.weights, "positionVelocity"
            ),
        },
    }