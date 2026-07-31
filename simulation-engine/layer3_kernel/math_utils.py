"""
Deterministic Math Utilities for Simulation Engine (v12)
Provides Kahan stable summation, tolerance comparisons, clamping, and interpolation.
"""

class MathUtils:
    TOLERANCE = 1e-7

    @staticmethod
    def clamp(val: float, min_val: float, max_val: float) -> float:
        return max(min_val, min(val, max_val))

    @staticmethod
    def equals(a: float, b: float, tol: float = TOLERANCE) -> bool:
        return abs(a - b) < tol

    @staticmethod
    def stable_sum(values: list[float]) -> float:
        """Kahan summation algorithm to prevent floating-point accumulation drift"""
        sum_val = 0.0
        c = 0.0
        for v in values:
            y = v - c
            t = sum_val + y
            c = (t - sum_val) - y
            sum_val = t
        return sum_val

    @staticmethod
    def lerp(start: float, end: float, factor: float) -> float:
        f = MathUtils.clamp(factor, 0.0, 1.0)
        return start + f * (end - start)
