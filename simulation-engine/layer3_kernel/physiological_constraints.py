"""
Physiological Constraints & Failure Threshold System (v22)
Enforces physiological limits (Normal, Critical, Failure) and numerical health checks (NaN, Inf, negative value rejection).
Emits typed failure events (e.g. EV_VENTRICULAR_FIBRILLATION, EV_CIRCULATORY_COLLAPSE) rather than silent numeric clamping.
"""
import math
from dataclasses import dataclass
from layer2_body.state_store import UnifiedStateStore
from layer1_knowledge.symbol_table import SymbolTable
from models.types import SimulationEvent, Handle
from models.enums import EventPriority

@dataclass
class ConstraintLimits:
    normal_min: float
    normal_max: float
    critical_min: float
    critical_max: float
    failure_min: float | None = None
    failure_max: float | None = None

class PhysiologicalConstraintEngine:
    def __init__(self):
        self.constraints = {
            "heart.rate": ConstraintLimits(60, 100, 20, 220, 0, 300),
            "blood.pressure.map": ConstraintLimits(70, 105, 20, 180, 15, None),
            "blood.spo2": ConstraintLimits(95, 100, 50, 100, 30, None),
            "respiratory.rate": ConstraintLimits(12, 20, 4, 60, 0, None),
            "cardiac.output": ConstraintLimits(4.0, 8.0, 1.0, 15.0, 0.5, None),
            "blood.ph": ConstraintLimits(7.35, 7.45, 6.80, 7.80, 6.70, 7.90),
            "core.temperature": ConstraintLimits(36.5, 37.5, 30.0, 42.0, 25.0, 44.0)
        }

    def enforce_constraints(self, store: UnifiedStateStore, symbol_table: SymbolTable, tick: int) -> list[SimulationEvent]:
        events = []
        target_handle = symbol_table.get_handle("ORG_KIDNEY_L") or Handle(index=1, generation=1, type_id=1)

        # 1. Heart Rate Failure Checks (HR > 600 or HR < 30)
        h_hr = symbol_table.get_handle("heart.rate")
        if h_hr and h_hr.index < len(store._values):
            hr = store.get_variable(h_hr)
            if math.isnan(hr) or math.isinf(hr) or hr < 0:
                events.append(SimulationEvent("EV_NUMERICAL_DIAGNOSTIC_WARNING", EventPriority.STRUCTURAL_DECAY, tick, 0, {"var": "heart.rate"}, target_handle))
            elif hr > 600.0 or hr > 300.0:
                events.append(SimulationEvent("EV_VENTRICULAR_FIBRILLATION", EventPriority.STRUCTURAL_DECAY, tick, 0, {}, target_handle))
            elif hr < 30.0 and hr > 0.0:
                events.append(SimulationEvent("EV_SEVERE_BRADYCARDIA", EventPriority.STRUCTURAL_DECAY, tick, 0, {}, target_handle))
            elif hr == 0.0:
                events.append(SimulationEvent("EV_ASYSTOLE", EventPriority.STRUCTURAL_DECAY, tick, 0, {}, target_handle))

        # 2. Blood Pressure / MAP Failure Checks (BP > 300 or MAP < 70 / MAP < 15)
        h_map = symbol_table.get_handle("blood.pressure.map")
        if h_map and h_map.index < len(store._values):
            map_val = store.get_variable(h_map)
            if math.isnan(map_val) or math.isinf(map_val) or map_val < 0:
                events.append(SimulationEvent("EV_NUMERICAL_DIAGNOSTIC_WARNING", EventPriority.STRUCTURAL_DECAY, tick, 0, {"var": "blood.pressure.map"}, target_handle))
            elif map_val > 200.0: # BP > 300 mmHg equivalent
                events.append(SimulationEvent("EV_HYPERTENSIVE_CRISIS", EventPriority.STRUCTURAL_DECAY, tick, 0, {}, target_handle))
            elif map_val < 70.0 and map_val >= 15.0: # BP < 90/60 mmHg equivalent
                events.append(SimulationEvent("EV_CRITICAL_HYPOTENSION", EventPriority.STRUCTURAL_DECAY, tick, 0, {}, target_handle))
            elif map_val < 15.0:
                events.append(SimulationEvent("EV_CIRCULATORY_COLLAPSE", EventPriority.STRUCTURAL_DECAY, tick, 0, {}, target_handle))

        # 3. SpO2 Failure Checks (SpO2 < 60)
        h_spo2 = symbol_table.get_handle("blood.spo2")
        if h_spo2 and h_spo2.index < len(store._values):
            spo2 = store.get_variable(h_spo2)
            if spo2 < 60.0:
                events.append(SimulationEvent("EV_CRITICAL_HYPOXIA", EventPriority.STRUCTURAL_DECAY, tick, 0, {}, target_handle))
            if spo2 < 30.0:
                events.append(SimulationEvent("EV_GLOBAL_HYPOXIA", EventPriority.STRUCTURAL_DECAY, tick, 0, {}, target_handle))

        # 4. Temperature Failure Checks (Temp > 45 or Temp < 10)
        h_temp = symbol_table.get_handle("core.temperature")
        if h_temp and h_temp.index < len(store._values):
            temp_val = store.get_variable(h_temp)
            if temp_val > 45.0:
                events.append(SimulationEvent("EV_EXTREME_THERMAL_FAILURE", EventPriority.STRUCTURAL_DECAY, tick, 0, {}, target_handle))
            elif temp_val < 10.0:
                events.append(SimulationEvent("EV_SEVERE_HYPOTHERMIA", EventPriority.STRUCTURAL_DECAY, tick, 0, {}, target_handle))

        # 5. pH Metabolic Failure Checks
        h_ph = symbol_table.get_handle("blood.ph")
        if h_ph and h_ph.index < len(store._values):
            ph_val = store.get_variable(h_ph)
            if ph_val < 6.70 or ph_val > 7.90:
                events.append(SimulationEvent("EV_IRREVERSIBLE_METABOLIC_FAILURE", EventPriority.STRUCTURAL_DECAY, tick, 0, {}, target_handle))

        return events
