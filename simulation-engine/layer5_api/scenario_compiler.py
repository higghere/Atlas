"""
Scenario Compiler Engine (v17)
Compiles raw JSON scenarios or AI drafts into validated simulation objects with numeric handles.
Resolves string UUIDs to integer Handles via SymbolTable.
"""
from typing import Any
from layer1_knowledge.symbol_table import SymbolTable
from models.types import SimulationEvent, Handle
from models.enums import EventPriority

class ScenarioCompiler:
    def __init__(self, symbol_table: SymbolTable):
        self.symbol_table = symbol_table

    def compile_scenario(self, raw_scenario: dict[str, Any]) -> dict[str, Any]:
        compiled_events = []
        for raw_e in raw_scenario.get("initial_events", []):
            target_uuid = raw_e.get("target_uuid", "ORG_KIDNEY_L")
            target_handle = self.symbol_table.get_handle(target_uuid) or Handle(index=1, generation=1, type_id=1)
            
            p_name = raw_e.get("priority", "PHYSIOLOGY_UPDATE")
            priority_enum = EventPriority[p_name] if p_name in EventPriority.__members__ else EventPriority.PHYSIOLOGY_UPDATE

            event = SimulationEvent(
                id=raw_e.get("id", "EV_COMPILED"),
                priority=priority_enum,
                tick_created=raw_e.get("tick_created", 0),
                duration_ticks=raw_e.get("duration_ticks", 1),
                payload=raw_e.get("payload", {}),
                target_handle=target_handle
            )
            compiled_events.append(event)

        return {
            "scenario_id": raw_scenario.get("scenario_id", "SCN_CUSTOM"),
            "name": raw_scenario.get("name", "Custom Scenario"),
            "description": raw_scenario.get("description", ""),
            "difficulty": raw_scenario.get("difficulty", "Intermediate"),
            "recommended_lod": raw_scenario.get("recommended_lod", "LOD1_TISSUE"),
            "objectives": raw_scenario.get("objectives", []),
            "events": compiled_events
        }
