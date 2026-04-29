import math
import re
from typing import Dict, Iterable, List

import control as ct
import sympy as sp


PARAMETER_PATTERN = re.compile(r"\b[A-Za-z_][A-Za-z0-9_]*\b")
ALLOWED_EXPRESSION_PATTERN = re.compile(r"^[A-Za-z0-9_+\-*/().\s^]*$")
RESERVED_NAMES = {"s"}


def normalize_expression(expr: str) -> str:
    value = (expr or "").strip()
    if value == "":
        return "0"
    return value.replace("^", "**")


def _extract_names(expr: str) -> List[str]:
    return sorted(set(PARAMETER_PATTERN.findall(expr)))


def validate_parameter_name(name: str) -> None:
    if not PARAMETER_PATTERN.fullmatch(name):
        raise ValueError(f"Invalid parameter name: {name}")
    if name in RESERVED_NAMES:
        raise ValueError("'s' is reserved for the Laplace variable and cannot be a parameter")


def parse_coefficient(expr: str) -> sp.Expr:
    normalized = normalize_expression(expr)
    if not ALLOWED_EXPRESSION_PATTERN.fullmatch(normalized):
        raise ValueError(f"Unsupported characters in coefficient expression: {expr}")

    names = _extract_names(normalized)
    for name in names:
        validate_parameter_name(name)
        if re.search(rf"\b{name}\s*\(", normalized):
            raise ValueError(f"Functions are not supported in coefficient expressions: {expr}")

    local_dict = {name: sp.Symbol(name) for name in names}
    try:
        return sp.sympify(normalized, locals=local_dict)
    except Exception as exc:
        raise ValueError(f"Invalid coefficient expression '{expr}': {exc}") from exc


def parse_coefficients(coef_exprs: Iterable[str]) -> List[sp.Expr]:
    return [parse_coefficient(expr) for expr in coef_exprs]


def detect_parameters(numerator: List[str], denominator: List[str]) -> List[str]:
    expressions = parse_coefficients([*numerator, *denominator])
    names = set()
    for expr in expressions:
        names.update(str(symbol) for symbol in expr.free_symbols)
    return sorted(names)


def evaluate_coefficients(coef_exprs: List[str], parameter_values: Dict[str, float]) -> List[float]:
    expressions = parse_coefficients(coef_exprs)
    substitutions = {sp.Symbol(name): value for name, value in parameter_values.items()}
    coefficients = []

    for expr in expressions:
        missing_symbols = sorted(str(symbol) for symbol in expr.free_symbols if symbol not in substitutions)
        if missing_symbols:
            raise ValueError(f"Missing value for parameter(s): {', '.join(missing_symbols)}")

        value = float(expr.evalf(subs=substitutions))
        if not math.isfinite(value):
            raise ValueError("Coefficient evaluation produced a non-finite value")
        coefficients.append(value)

    return coefficients


def trim_leading_zeros(coefficients: List[float]) -> List[float]:
    for index, value in enumerate(coefficients):
        if abs(value) > 1e-12:
            return coefficients[index:]
    return [0.0]


def build_transfer_function(numerator: List[float], denominator: List[float]):
    num = trim_leading_zeros(numerator)
    den = trim_leading_zeros(denominator)

    if den == [0.0]:
        raise ValueError("Denominator cannot be all zeros")
    if num == [0.0]:
        raise ValueError("Numerator cannot be all zeros")
    if len(num) > len(den):
        raise ValueError("Numerator degree cannot be higher than denominator degree")

    return ct.TransferFunction(num, den), num, den


def format_polynomial(coefficients: List[float]) -> str:
    degree = len(coefficients) - 1
    terms = []

    for index, coefficient in enumerate(coefficients):
        power = degree - index
        if abs(coefficient) < 1e-12:
            continue

        coefficient_text = f"{coefficient:.6g}"
        if power == 0:
            term = coefficient_text
        elif power == 1:
            term = f"{coefficient_text}*s"
        else:
            term = f"{coefficient_text}*s^{power}"
        terms.append(term)

    return " + ".join(terms) if terms else "0"


def format_transfer_function(numerator: List[float], denominator: List[float]) -> str:
    return f"({format_polynomial(numerator)}) / ({format_polynomial(denominator)})"
