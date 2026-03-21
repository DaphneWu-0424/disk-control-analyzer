import numpy as np
import control as ct

from services.control_model import build_systems
from services.metrics import compute_input_metrics, compute_disturbance_metrics


def _round_list(arr, ndigits=6):
    return [round(float(x), ndigits) for x in arr]


def simulate_case(payload):
    Ka = float(payload.Ka)
    K1 = float(payload.K1)
    t_end = float(payload.tEnd)
    dt = float(payload.dt)

    if dt >= t_end:
        raise ValueError("dt must be smaller than tEnd")

    t = np.arange(0, t_end + dt, dt)

    sys_input, sys_disturbance = build_systems(Ka, K1)

    t_in, y_in = ct.step_response(sys_input, T=t)
    t_dis, y_dis = ct.step_response(sys_disturbance, T=t)

    y_in = np.asarray(y_in).squeeze()
    y_dis = np.asarray(y_dis).squeeze()

    metrics = {}
    metrics.update(compute_input_metrics(t_in, y_in))
    metrics.update(compute_disturbance_metrics(t_dis, y_dis))

    return {
        "inputResponse": {
            "time": _round_list(t_in),
            "output": _round_list(y_in),
        },
        "disturbanceResponse": {
            "time": _round_list(t_dis),
            "output": _round_list(y_dis),
        },
        "metrics": metrics,
    }