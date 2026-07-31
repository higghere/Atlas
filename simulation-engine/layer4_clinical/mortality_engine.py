"""
Clinical State Machine & Observer (v22 Refactored)
Renamed from Mortality Engine. Acts purely as an observer and state transition manager.
Observes variable dynamics, energy failure, and organ reserve to transition states.
"""
from layer2_body.state_store import UnifiedStateStore
from layer1_knowledge.symbol_table import SymbolTable
from layer2_body.organ_reserve import OrganReserveAccumulator
from layer3_kernel.energy_failure import EnergyFailureEngine
from layer4_clinical.neurological_failure import NeurologicalFailureEngine, BrainDeathState
from layer4_clinical.cardiac_arrest_fsm import CardiacArrestFSM, CardiacRhythmState
from models.types import SimulationEvent, Handle
from models.enums import EventPriority

class ClinicalStateMachine:
    def __init__(self):
        self.organ_reserve = OrganReserveAccumulator()
        self.energy_engine = EnergyFailureEngine()
        self.neuro_engine = NeurologicalFailureEngine()
        self.cardiac_fsm = CardiacArrestFSM()

    def observe_and_update(self, store: UnifiedStateStore, symbol_table: SymbolTable, tick: int) -> list[SimulationEvent]:
        events = []
        target_handle = symbol_table.get_handle("ORG_KIDNEY_L") or Handle(index=1, generation=1, type_id=1)

        h_map = symbol_table.get_handle("blood.pressure.map")
        h_po2 = symbol_table.get_handle("blood.po2")
        h_ph = symbol_table.get_handle("blood.ph")
        h_hr = symbol_table.get_handle("heart.rate")

        map_val = store.get_variable(h_map) if h_map and h_map.index < len(store._values) else 93.33
        po2_val = store.get_variable(h_po2) if h_po2 and h_po2.index < len(store._values) else 95.0
        ph_val = store.get_variable(h_ph) if h_ph and h_ph.index < len(store._values) else 7.40
        hr_val = store.get_variable(h_hr) if h_hr and h_hr.index < len(store._values) else 72.0

        # Update organ functional reserves & failure engines
        reserves = self.organ_reserve.update_reserves(map_val, ph_val, dt_seconds=1.0)
        energy_state = self.energy_engine.update_energy_balance(1.0, po2_val, map_val)
        brain_state = self.neuro_engine.evaluate_cpp(map_val, icp_val=10.0, dt_seconds=1.0)
        rhythm_state = self.cardiac_fsm.update_rhythm(map_val, hr_val, cpr_active=False, dt_seconds=1.0)

        # Emit events when clinical states or fixed thresholds are satisfied
        # Simple fixed threshold check (v23.2)
        is_threshold_death = hr_val > 600.0 or hr_val < 30.0 or map_val > 200.0 or map_val < 45.0 or po2_val < 60.0 or ph_val < 6.8
        is_pathology_death = rhythm_state == CardiacRhythmState.ASYSTOLE_DEATH or brain_state == BrainDeathState.BRAIN_DEATH or energy_state.permanent_necrosis_pct > 80.0

        if rhythm_state in (CardiacRhythmState.DECOMPENSATED_SHOCK, CardiacRhythmState.PRE_TERMINAL):
            events.append(SimulationEvent("EV_DECOMPENSATED_SHOCK", EventPriority.STRUCTURAL_DECAY, tick, 0, {}, target_handle))

        if rhythm_state == CardiacRhythmState.PRE_TERMINAL:
            events.append(SimulationEvent("EV_PRE_TERMINAL_RESCUE_WINDOW", EventPriority.STRUCTURAL_DECAY, tick, 0, {}, target_handle))

        if rhythm_state == CardiacRhythmState.CARDIAC_ARREST:
            events.append(SimulationEvent("EV_CARDIAC_ARREST", EventPriority.STRUCTURAL_DECAY, tick, 0, {}, target_handle))

        if brain_state == BrainDeathState.BRAIN_DEATH:
            events.append(SimulationEvent("EV_BRAIN_DEATH", EventPriority.STRUCTURAL_DECAY, tick, 0, {}, target_handle))

        if is_threshold_death or is_pathology_death:
            cause_str = "Parameter Threshold Exceeded" if is_threshold_death else "Physiological Collapse"
            events.append(SimulationEvent("EV_CLINICAL_DEATH", EventPriority.STRUCTURAL_DECAY, tick, 0, {"cause": cause_str}, target_handle))

        return events

# Alias for backward compatibility
MortalityEngine = ClinicalStateMachine
