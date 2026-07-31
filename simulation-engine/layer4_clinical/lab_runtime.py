"""
Delayed Laboratory Request Runtime (v19)
Processes clinical lab orders with realistic simulated delays (ABG: 2 min, CBC: 30 min, CT: 20 min).
"""
from dataclasses import dataclass
from layer5_api.simulation_api import SimulationAPI

@dataclass
class LabRequest:
    request_id: str
    panel_type: str
    tick_ordered: int
    completion_tick: int
    result: dict | None = None

class LabRuntime:
    # Delays in ticks (1 tick = 1s)
    PANEL_DELAYS: dict[str, int] = {
        "ABG": 120,        # 2 minutes
        "CBC": 1800,       # 30 minutes
        "BMP": 1800,       # 30 minutes
        "Lactate": 300     # 5 minutes
    }

    def __init__(self, api: SimulationAPI):
        self.api = api
        self.pending_requests: list[LabRequest] = []
        self.completed_reports: list[LabRequest] = []

    def order_panel(self, panel_type: str) -> LabRequest:
        delay = LabRuntime.PANEL_DELAYS.get(panel_type, 600)
        req = LabRequest(
            request_id=f"LAB_{panel_type}_{len(self.pending_requests)+1}",
            panel_type=panel_type,
            tick_ordered=self.api.current_tick,
            completion_tick=self.api.current_tick + delay
        )
        self.pending_requests.append(req)
        return req

    def process_due_labs(self):
        curr_tick = self.api.current_tick
        due = [r for r in self.pending_requests if r.completion_tick <= curr_tick]
        for req in due:
            req.result = {"panel": req.panel_type, "status": "COMPLETED", "ph": self.api.get_variable("blood.ph") or 7.40}
            self.completed_reports.append(req)
            self.pending_requests.remove(req)
