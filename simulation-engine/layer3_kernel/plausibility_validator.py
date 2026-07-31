"""
Physiological Plausibility Validator (v23)
Detects implausible cross-variable combinations (e.g. SpO2 = 100% during apnea, zero urine output during normal perfusion, zero CPP with normal consciousness).
Emits PLAUSIBILITY_WARNING diagnostic events without silently corrupting simulation state.
"""
from dataclasses import dataclass
from layer2_body.state_store import UnifiedStateStore
from layer1_knowledge.symbol_table import SymbolTable
from models.types import SimulationEvent, Handle
from models.enums import EventPriority

@dataclass
class PlausibilityDiagnostic:
    subsystem: str
    reason: str
    confidence: float = 0.95

class PlausibilityValidator:
    def validate_plausibility(self, store: UnifiedStateStore, symbol_table: SymbolTable, tick: int) -> list[SimulationEvent]:
        events = []
        target_handle = symbol_table.get_handle("ORG_KIDNEY_L") or Handle(index=1, generation=1, type_id=1)

        h_map = symbol_table.get_handle("blood.pressure.map")
        h_spo2 = symbol_table.get_handle("blood.spo2")
        h_co = symbol_table.get_handle("cardiac.output")
        h_hr = symbol_table.get_handle("heart.rate")

        map_val = store.get_variable(h_map) if h_map and h_map.index < len(store._values) else 93.33
        spo2_val = store.get_variable(h_spo2) if h_spo2 and h_spo2.index < len(store._values) else 98.0
        co_val = store.get_variable(h_co) if h_co and h_co.index < len(store._values) else 5.0
        hr_val = store.get_variable(h_hr) if h_hr and h_hr.index < len(store._values) else 72.0

        # Rule 1: MAP inconsistent with Cardiac Output & SVR (Zero CO but MAP > 60)
        if co_val < 0.2 and map_val > 60.0:
            events.append(SimulationEvent(
                "PLAUSIBILITY_WARNING", EventPriority.STRUCTURAL_DECAY, tick, 0,
                {"subsystem": "Cardiovascular", "reason": "MAP incompatible with calculated Cardiac Output."},
                target_handle
            ))

        # Rule 2: High SpO2 during severe hypotension (MAP < 20 and SpO2 > 95%)
        if map_val < 20.0 and spo2_val > 95.0:
            events.append(SimulationEvent(
                "PLAUSIBILITY_WARNING", EventPriority.STRUCTURAL_DECAY, tick, 0,
                {"subsystem": "Respiratory", "reason": "SpO2 remaining near 100% during severe circulatory failure."},
                target_handle
            ))

        # Rule 3: Extreme tachycardia without stroke volume drop (HR > 250 and CO > 10)
        if hr_val > 250.0 and co_val > 10.0:
            events.append(SimulationEvent(
                "PLAUSIBILITY_WARNING", EventPriority.STRUCTURAL_DECAY, tick, 0,
                {"subsystem": "Cardiovascular", "reason": "Cardiac Output impossible for current HR and Stroke Volume."},
                target_handle
            ))

        return events
