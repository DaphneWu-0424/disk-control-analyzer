import numpy as np
import control as ct

from services.metrics import compute_input_metrics
from services.transfer_function import (
    build_transfer_function,
    detect_parameters,
    evaluate_coefficients,
    format_transfer_function,
)


def _round_list(arr, ndigits=6):
    return [round(float(x), ndigits) for x in arr]


def _build_scan_values(start, end, step):
    if step <= 0:
        raise ValueError("Scan step must be greater than 0")
    if start > end:
        raise ValueError("Scan min cannot be greater than scan max")

    values = np.arange(start, end + step * 0.5, step)
    if len(values) > 300:
        raise ValueError("Scan range produces too many frames; reduce the range or increase the step")
    return [round(float(value), 10) for value in values]


def detect_transfer_parameters(payload):
    return {"parameters": detect_parameters(payload.numerator, payload.denominator)}


def _collect_fixed_values(payload, scan_value):
    parameter_values = {}

    for name, config in payload.parameters.items():
        if name == payload.scanParameter:
            parameter_values[name] = scan_value
            continue

        if config.value is None:
            raise ValueError(f"Fixed parameter '{name}' requires a value")
        parameter_values[name] = float(config.value)

    return parameter_values


def simulate_case(payload):
    if payload.time.start >= payload.time.end:
        raise ValueError("time.start must be smaller than time.end")

    detected_parameters = set(detect_parameters(payload.numerator, payload.denominator))
    provided_parameters = set(payload.parameters.keys())
    missing_parameters = sorted(detected_parameters - provided_parameters)
    if missing_parameters:
        raise ValueError(f"Missing configuration for parameter(s): {', '.join(missing_parameters)}")

    if payload.scanParameter not in detected_parameters:
        raise ValueError("scanParameter must be one of the detected transfer-function parameters")

    scan_configs = [name for name, config in payload.parameters.items() if config.mode == "scan"]
    if scan_configs != [payload.scanParameter]:
        raise ValueError("Exactly one parameter must be configured as the scan parameter")

    scan_config = payload.parameters[payload.scanParameter]
    if scan_config.min is None or scan_config.max is None or scan_config.step is None:
        raise ValueError("Scan parameter requires min, max, and step")

    scan_values = _build_scan_values(scan_config.min, scan_config.max, scan_config.step)
    t = np.linspace(payload.time.start, payload.time.end, payload.time.points)
    frames = []

    for scan_value in scan_values:
        parameter_values = _collect_fixed_values(payload, scan_value)
        numerator = evaluate_coefficients(payload.numerator, parameter_values)
        denominator = evaluate_coefficients(payload.denominator, parameter_values)
        system, trimmed_num, trimmed_den = build_transfer_function(numerator, denominator)

        poles = ct.poles(system)
        stable = bool(np.all(np.real(poles) < 0))
        if stable:
            t_out, y_out = ct.step_response(system, T=t)
            y_out = np.asarray(y_out).squeeze()
            response = {
                "time": _round_list(t_out),
                "output": _round_list(y_out),
            }
            metrics = compute_input_metrics(t_out, y_out)
        else:
            response = {"time": _round_list(t), "output": []}
            metrics = {}

        frames.append(
            {
                "parameterValue": round(float(scan_value), 6),
                "numeratorCoeffs": _round_list(trimmed_num),
                "denominatorCoeffs": _round_list(trimmed_den),
                "transferFunction": format_transfer_function(trimmed_num, trimmed_den),
                "stable": stable,
                "response": response,
                "metrics": metrics,
            }
        )

    return {
        "scanParameter": payload.scanParameter,
        "frames": frames,
    }