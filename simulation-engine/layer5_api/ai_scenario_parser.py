"""
AI Scenario Parser & Draft Engine (v16)
Parses natural language prompts into a structured ScenarioDraft containing editable SimulationEvents.
Never mutates the engine state directly; requires explicit user confirmation.
"""
from dataclasses import dataclass, field
from models.types import SimulationEvent, Handle
from models.enums import EventPriority, TraumaType
from layer1_knowledge.symbol_table import SymbolTable

@dataclass
class ScenarioDraft:
    raw_prompt: str
    proposed_events: list[SimulationEvent] = field(default_factory=list)
    estimated_severity: str = "Moderate"
    confidence: float = 0.90
    predicted_vitals: dict[str, float] = field(default_factory=dict)

class AIScenarioParser:
    def parse_prompt(self, prompt_text: str, symbol_table: SymbolTable) -> ScenarioDraft:
        prompt_lower = prompt_text.lower()
        events = []
        severity = "Moderate"
        
        target_handle = symbol_table.get_handle("ORG_KIDNEY_L") or Handle(index=1, generation=1, type_id=1)
        vessel_handle = symbol_table.get_handle("VES_AORTA") or Handle(index=2, generation=1, type_id=3)

        # Keyword rules matching simulation entities
        if "stab" in prompt_lower or "knife" in prompt_lower or "laceration" in prompt_lower:
            events.append(SimulationEvent(
                id="EV_AI_STAB",
                priority=EventPriority.TRAUMA_IMPACT,
                tick_created=0,
                duration_ticks=1,
                payload={"trauma_type": TraumaType.PENETRATING.value, "depth_cm": 5.0},
                target_handle=target_handle
            ))

        if "bleed" in prompt_lower or "bleeding" in prompt_lower or "hemorrhage" in prompt_lower:
            events.append(SimulationEvent(
                id="EV_AI_HEMORRHAGE",
                priority=EventPriority.HEMORRHAGE,
                tick_created=0,
                duration_ticks=30,
                payload={"bleed_rate_ml_min": 200.0},
                target_handle=vessel_handle
            ))
            severity = "Critical"

        predicted = {
            "heart_rate": 118.0 if severity == "Critical" else 88.0,
            "blood_pressure_sys": 95.0 if severity == "Critical" else 115.0,
            "spo2": 89.0 if severity == "Critical" else 97.0
        }

        return ScenarioDraft(
            raw_prompt=prompt_text,
            proposed_events=events,
            estimated_severity=severity,
            confidence=0.92,
            predicted_vitals=predicted
        )
