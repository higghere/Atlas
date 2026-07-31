"""
Live Medical Intervention Engine (v19)
Converts clinical actions (IV, CPR, Defibrillation, Tourniquet, Drug Admin) into valid SimulationEvents.
"""
from layer5_api.simulation_api import SimulationAPI
from models.types import SimulationEvent, Handle
from models.enums import EventPriority

class InterventionEngine:
    def __init__(self, api: SimulationAPI):
        self.api = api

    def apply_tourniquet(self, limb_handle: Handle) -> SimulationEvent:
        ev = SimulationEvent(
            id="EV_INTERVENTION_TOURNIQUET",
            priority=EventPriority.EXTERNAL_INPUT,
            tick_created=self.api.current_tick,
            duration_ticks=0,
            payload={"pressure_mmHg": 300.0},
            target_handle=limb_handle
        )
        return ev

    def administer_drug(self, drug_id: str, dose_mg: float, route: str) -> SimulationEvent:
        target = self.api.assets.symbol_table.get_handle("VES_AORTA") or Handle(index=1, generation=1, type_id=3)
        ev = SimulationEvent(
            id=f"EV_INTERVENTION_DRUG_{drug_id}",
            priority=EventPriority.EXTERNAL_INPUT,
            tick_created=self.api.current_tick,
            duration_ticks=0,
            payload={"drug_id": drug_id, "dose_mg": dose_mg, "route": route},
            target_handle=target
        )
        return ev
