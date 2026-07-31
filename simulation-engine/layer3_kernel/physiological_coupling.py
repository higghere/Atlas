"""
Whole-Body Physiological Coupling Engine (v23)
Models the human body as an interconnected physiological network.
Executes after physiology solvers and before the Constraint Engine.
Computes derived organ functional statuses dynamically from shared systemic variables.
"""
from dataclasses import dataclass
from layer2_body.state_store import UnifiedStateStore
from layer1_knowledge.symbol_table import SymbolTable

@dataclass
class SystemicCouplingState:
    brain_status_pct: float = 100.0
    heart_status_pct: float = 100.0
    kidney_status_pct: float = 100.0
    liver_status_pct: float = 100.0
    lung_status_pct: float = 100.0
    arrhythmia_risk_score: float = 0.0
    coagulopathy_factor: float = 1.0

class PhysiologicalCouplingEngine:
    def __init__(self):
        self.state = SystemicCouplingState()

    def update_coupling(self, store: UnifiedStateStore, symbol_table: SymbolTable) -> SystemicCouplingState:
        # Retrieve shared systemic physiological variables
        h_map = symbol_table.get_handle("blood.pressure.map")
        h_po2 = symbol_table.get_handle("blood.po2")
        h_spo2 = symbol_table.get_handle("blood.spo2")
        h_ph = symbol_table.get_handle("blood.ph")
        h_k = symbol_table.get_handle("blood.potassium")

        map_val = store.get_variable(h_map) if h_map and h_map.index < len(store._values) else 93.33
        po2_val = store.get_variable(h_po2) if h_po2 and h_po2.index < len(store._values) else 95.0
        spo2_val = store.get_variable(h_spo2) if h_spo2 and h_spo2.index < len(store._values) else 98.0
        ph_val = store.get_variable(h_ph) if h_ph and h_ph.index < len(store._values) else 7.40
        k_val = store.get_variable(h_k) if h_k and h_k.index < len(store._values) else 4.2

        # 1. Hemorrhage / Perfusion Cascade on Brain & Organs
        perfusion_factor = max(0.0, min(1.0, map_val / 90.0))
        oxygenation_factor = max(0.0, min(1.0, spo2_val / 98.0))
        acidosis_factor = max(0.0, min(1.0, (ph_val - 6.5) / 0.9))

        # Dynamically derive organ functional percentages from systemic parameters
        self.state.brain_status_pct = max(0.0, min(100.0, 100.0 * perfusion_factor * oxygenation_factor))
        self.state.heart_status_pct = max(0.0, min(100.0, 100.0 * perfusion_factor * acidosis_factor))
        self.state.kidney_status_pct = max(0.0, min(100.0, 100.0 * (map_val / 80.0) if map_val < 80 else 100.0))
        self.state.liver_status_pct = max(0.0, min(100.0, 100.0 * perfusion_factor))
        self.state.lung_status_pct = max(0.0, min(100.0, 100.0 * oxygenation_factor))

        # 2. Renal -> Electrolyte -> Arrhythmia Cascade
        if k_val > 5.5 or k_val < 3.0:
            self.state.arrhythmia_risk_score = min(1.0, abs(k_val - 4.2) / 3.0)
        else:
            self.state.arrhythmia_risk_score = 0.0

        # 3. Hepatic -> Coagulopathy Cascade
        if self.state.liver_status_pct < 40.0:
            self.state.coagulopathy_factor = 1.0 + (40.0 - self.state.liver_status_pct) / 20.0
        else:
            self.state.coagulopathy_factor = 1.0

        return self.state
