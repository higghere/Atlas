"""
Global Cellular Energy Failure Engine (v21)
Tracks tissue ATP availability, oxygen delivery, metabolic demand, cell swelling, and permanent necrosis.
"""
from dataclasses import dataclass

@dataclass
class TissueEnergyState:
    atp_availability_pct: float = 100.0
    oxygen_delivery_ml_min: float = 250.0
    metabolic_demand_ml_min: float = 250.0
    permanent_necrosis_pct: float = 0.0
    cell_swelling_index: float = 0.0

class EnergyFailureEngine:
    def __init__(self):
        self.state = TissueEnergyState()
        self.ischemia_duration_seconds: float = 0.0

    def update_energy_balance(self, dt_seconds: float, po2: float, map_val: float) -> TissueEnergyState:
        # Evaluate hypoxia & hypoperfusion conditions
        is_hypoxic = po2 < 60.0 or map_val < 50.0
        
        if is_hypoxic:
            self.ischemia_duration_seconds += dt_seconds
            # ATP depletes exponentially during hypoxia
            depletion_rate = 0.5 * (1.0 + (50.0 - min(50.0, map_val)) / 50.0)
            self.state.atp_availability_pct = max(0.0, self.state.atp_availability_pct - depletion_rate * dt_seconds)
            self.state.cell_swelling_index = min(100.0, self.state.cell_swelling_index + 0.2 * dt_seconds)
        else:
            # Reperfusion recovery if ATP > 0
            if self.state.atp_availability_pct > 0.0:
                self.state.atp_availability_pct = min(100.0, self.state.atp_availability_pct + 1.0 * dt_seconds)
                self.state.cell_swelling_index = max(0.0, self.state.cell_swelling_index - 0.5 * dt_seconds)
                self.ischemia_duration_seconds = max(0.0, self.ischemia_duration_seconds - dt_seconds)

        # Irreversible necrosis accumulation if ATP remains < 10% for > 120 seconds
        if self.state.atp_availability_pct < 10.0 and self.ischemia_duration_seconds > 120.0:
            necrosis_rate = 0.1 * dt_seconds
            self.state.permanent_necrosis_pct = min(100.0, self.state.permanent_necrosis_pct + necrosis_rate)

        return self.state
