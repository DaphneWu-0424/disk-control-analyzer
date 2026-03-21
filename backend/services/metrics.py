import numpy as np


def _to_float(value):
    if value is None:
        return None
    return float(value)


def compute_rise_time(t, y):
    y = np.asarray(y, dtype=float)
    t = np.asarray(t, dtype=float)

    if len(y) == 0:
        return None

    final_value = y[-1]
    if abs(final_value) < 1e-12:
        return None

    y10 = 0.1 * final_value
    y90 = 0.9 * final_value

    idx10 = np.where(y >= y10)[0]
    idx90 = np.where(y >= y90)[0]

    if len(idx10) == 0 or len(idx90) == 0:
        return None

    return _to_float(t[idx90[0]] - t[idx10[0]])


def compute_settling_time(t, y, tol=0.02):
    y = np.asarray(y, dtype=float)
    t = np.asarray(t, dtype=float)

    if len(y) == 0:
        return None

    final_value = y[-1]
    amplitude_ref = max(np.max(np.abs(y)), abs(final_value), 1e-8)
    band = tol * amplitude_ref

    out_of_band = np.where(np.abs(y - final_value) > band)[0]
    if len(out_of_band) == 0:
        return 0.0

    last_out = out_of_band[-1]
    if last_out >= len(t) - 1:
        return _to_float(t[-1])

    return _to_float(t[last_out + 1])


def compute_overshoot(y):
    y = np.asarray(y, dtype=float)
    if len(y) == 0:
        return None

    final_value = y[-1]
    if abs(final_value) < 1e-12:
        return None

    peak = np.max(y)
    overshoot = max(0.0, (peak - final_value) / abs(final_value) * 100.0)
    return _to_float(overshoot)


def compute_peak(y):
    y = np.asarray(y, dtype=float)
    if len(y) == 0:
        return None
    return _to_float(np.max(y))


def compute_final_value(y):
    y = np.asarray(y, dtype=float)
    if len(y) == 0:
        return None
    return _to_float(y[-1])


def compute_disturbance_peak(y):
    y = np.asarray(y, dtype=float)
    if len(y) == 0:
        return None
    return _to_float(np.max(np.abs(y)))


def compute_input_metrics(t, y):
    return {
        "riseTime": compute_rise_time(t, y),
        "settlingTime": compute_settling_time(t, y),
        "overshoot": compute_overshoot(y),
        "peak": compute_peak(y),
        "finalValue": compute_final_value(y),
    }


def compute_disturbance_metrics(t, y):
    return {
        "disturbancePeak": compute_disturbance_peak(y),
        "disturbanceSettlingTime": compute_settling_time(t, y),
    }