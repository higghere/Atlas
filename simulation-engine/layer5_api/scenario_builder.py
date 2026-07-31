"""
Guided Scenario Builder Engine (v17 Refactored)
Converts structured user inputs into valid SimulationEvent objects using typed Handles.
"""
from models.types import SimulationEvent, Handle, OrganHandle, VesselHandle
from models.enums import EventPriority, TraumaType

class ScenarioBuilder:
    @staticmethod
    def create_penetrating_trauma_event(
        location: str,
        depth_cm: float,
        weapon: str,
        target_organ_handle: OrganHandle
    ) -> SimulationEvent:
        return SimulationEvent(
            id=f"EV_BUILDER_PENETRATING_{location}",
            priority=EventPriority.TRAUMA_IMPACT,
            tick_created=0,
            duration_ticks=1,
            payload={
                "trauma_type": TraumaType.PENETRATING.value,
                "location": location,
                "depth_cm": depth_cm,
                "weapon": weapon
            },
            target_handle=target_organ_handle
        )

    @staticmethod
    def create_hemorrhage_event(
        bleed_rate_ml_min: float,
        duration_ticks: int,
        target_vessel_handle: VesselHandle,
        start_tick: int = 0
    ) -> SimulationEvent:
        return SimulationEvent(
            id="EV_BUILDER_HEMORRHAGE",
            priority=EventPriority.HEMORRHAGE,
            tick_created=start_tick,
            duration_ticks=duration_ticks,
            payload={"bleed_rate_ml_min": bleed_rate_ml_min},
            target_handle=target_vessel_handle
        )
