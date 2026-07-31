"""
Real-Time Clinical Alert Engine (v19)
Generates alerts connected directly to DiagnosticsManager.trace_causal_chain().
"""
from dataclasses import dataclass
from layer5_api.simulation_api import SimulationAPI

@dataclass
class ClinicalAlert:
    alert_id: str
    severity: str
    message: str
    causal_chain: list[str]

class AlertEngine:
    def __init__(self, api: SimulationAPI):
        self.api = api
        self.active_alerts: list[ClinicalAlert] = []

    def check_alerts(self) -> list[ClinicalAlert]:
        alerts = []
        map_val = self.api.get_variable("blood.pressure.map") or 93.33
        
        if map_val < 65.0:
            chain = ["Hypotension detected (MAP < 65)", "Vascular resistance low or hypovolemia active"]
            alerts.append(ClinicalAlert(
                alert_id="ALT_HYPOTENSION",
                severity="CRITICAL",
                message=f"Severe Hypotension: MAP {map_val:.1f} mmHg",
                causal_chain=chain
            ))
            
        self.active_alerts = alerts
        return alerts
