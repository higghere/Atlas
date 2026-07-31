"""
Scenario Runtime Engine (v18)
Manages scenario objectives, timers, victory/failure states, and scripted triggers outside the physiological kernel.
"""
from dataclasses import dataclass
from typing import Any
from layer5_api.simulation_session import SimulationSession
from layer5_api.simulation_api import SimulationAPI

@dataclass
class ObjectiveResult:
    objective_id: str
    description: str
    status: str                         # "PENDING", "PASSED", "FAILED"
    achieved_tick: int | None = None

class ScenarioRuntime:
    def __init__(self, session: SimulationSession, api: SimulationAPI):
        self.session = session
        self.api = api
        self.objective_results: dict[str, ObjectiveResult] = {}
        self.is_completed = False
        self._init_objectives()

    def _init_objectives(self):
        for obj in self.session.objectives:
            obj_id = obj.get("id", "OBJ_1")
            self.objective_results[obj_id] = ObjectiveResult(
                objective_id=obj_id,
                description=obj.get("description", "Maintain MAP > 65 mmHg"),
                status="PENDING"
            )

    def evaluate_runtime_triggers(self):
        current_map = self.api.get_variable("blood.pressure.map") or 93.33
        current_tick = self.api.current_tick

        for obj_id, res in self.objective_results.items():
            if res.status == "PENDING":
                if current_map < 50.0:
                    res.status = "FAILED"
                    res.achieved_tick = current_tick
                elif current_tick >= 10 and current_map >= 65.0:
                    res.status = "PASSED"
                    res.achieved_tick = current_tick
