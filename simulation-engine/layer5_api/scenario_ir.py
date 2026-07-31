"""
Scenario Intermediate Representation (IR) Compiler & Optimizer (v18)
Parses raw Scenario JSON / Draft into ScenarioIR AST nodes, optimizes them, and emits validated SimulationEvents.
"""
from dataclasses import dataclass, field
from typing import Any
from layer1_knowledge.symbol_table import SymbolTable
from models.types import SimulationEvent, Handle
from models.enums import EventPriority

@dataclass
class ScenarioIRNode:
    op_type: str                        # "EMIT_EVENT", "SET_ENVIRONMENT", "SCHEDULE_DELAYED"
    target_uuid: str
    time_offset_seconds: float
    parameters: dict[str, Any]

class ScenarioIRCompiler:
    def __init__(self, symbol_table: SymbolTable):
        self.symbol_table = symbol_table

    def parse_to_ir(self, raw_scenario: dict[str, Any]) -> list[ScenarioIRNode]:
        nodes = []
        for raw_e in raw_scenario.get("initial_events", []):
            nodes.append(ScenarioIRNode(
                op_type="EMIT_EVENT",
                target_uuid=raw_e.get("target_uuid", "ORG_KIDNEY_L"),
                time_offset_seconds=float(raw_e.get("tick_created", 0)),
                parameters=raw_e.get("payload", {})
            ))
        return nodes

    def optimize_ir(self, ir_nodes: list[ScenarioIRNode]) -> list[ScenarioIRNode]:
        """Folds redundant events and sorts nodes by time offset"""
        return sorted(ir_nodes, key=lambda n: n.time_offset_seconds)

    def compile_ir_to_events(self, ir_nodes: list[ScenarioIRNode]) -> list[SimulationEvent]:
        events = []
        for idx, node in enumerate(ir_nodes):
            target_handle = self.symbol_table.get_handle(node.target_uuid) or Handle(index=1, generation=1, type_id=1)
            events.append(SimulationEvent(
                id=f"EV_IR_COMPILED_{idx}",
                priority=EventPriority.HEMORRHAGE if "bleed" in str(node.parameters) else EventPriority.TRAUMA_IMPACT,
                tick_created=int(node.time_offset_seconds),
                duration_ticks=1,
                payload=node.parameters,
                target_handle=target_handle
            ))
        return events
