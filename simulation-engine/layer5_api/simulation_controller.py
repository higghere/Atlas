"""
Simulation Runtime Controller Facade (v19)
Controls play/pause and execution speeds (0.25x to 1000x) without modifying solver algorithms.
"""
from enum import Enum
from layer5_api.simulation_api import SimulationAPI

class SimulationSpeed(Enum):
    SPEED_0_25X = 0.25
    SPEED_0_5X  = 0.5
    SPEED_1X    = 1.0
    SPEED_2X    = 2.0
    SPEED_5X    = 5.0
    SPEED_10X   = 10.0
    SPEED_100X  = 100.0
    SPEED_1000X = 1000.0

class SimulationController:
    def __init__(self, api: SimulationAPI):
        self.api = api
        self.is_running = False
        self.speed = SimulationSpeed.SPEED_1X

    def play(self):
        self.is_running = True

    def pause(self):
        self.is_running = False

    def resume(self):
        self.is_running = True

    def set_speed(self, speed: SimulationSpeed):
        self.speed = speed

    def step_tick(self):
        self.api.step(1)

    def reset(self):
        self.api.current_tick = 0
        self.is_running = False

    def stop(self):
        self.is_running = False
