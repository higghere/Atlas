"""
Pluggable Numerical Integrator Engine (v12)
Provides Explicit Euler, Semi-Implicit Euler, RK2, and RK4 numerical integrators.
"""
from typing import Callable

class Integrators:
    @staticmethod
    def explicit_euler(
        y: float,
        dt: float,
        derivative_fn: Callable[[float], float]
    ) -> float:
        """y_{n+1} = y_n + dt * f(y_n)"""
        return y + dt * derivative_fn(y)

    @staticmethod
    def semi_implicit_euler(
        pos: float,
        vel: float,
        dt: float,
        accel_fn: Callable[[float, float], float]
    ) -> tuple[float, float]:
        """Updates velocity first, then position using new velocity"""
        new_vel = vel + dt * accel_fn(pos, vel)
        new_pos = pos + dt * new_vel
        return new_pos, new_vel

    @staticmethod
    def rk2_midpoint(
        y: float,
        dt: float,
        derivative_fn: Callable[[float], float]
    ) -> float:
        """2nd-order Runge-Kutta (Midpoint method)"""
        k1 = derivative_fn(y)
        k2 = derivative_fn(y + 0.5 * dt * k1)
        return y + dt * k2

    @staticmethod
    def rk4(
        y: float,
        dt: float,
        derivative_fn: Callable[[float], float]
    ) -> float:
        """Classical 4th-order Runge-Kutta integration"""
        k1 = derivative_fn(y)
        k2 = derivative_fn(y + 0.5 * dt * k1)
        k3 = derivative_fn(y + 0.5 * dt * k2)
        k4 = derivative_fn(y + dt * k3)
        return y + (dt / 6.0) * (k1 + 2.0 * k2 + 2.0 * k3 + k4)
