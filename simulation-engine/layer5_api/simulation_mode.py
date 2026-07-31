"""
Simulation Mode Orchestrator Facade (v17 Refactored)
Delegates session construction to SimulationSessionBuilder.
"""
from typing import Any
from layer5_api.session_builder import SimulationSessionBuilder
from layer5_api.ai_scenario_parser import AIScenarioParser
from layer5_api.simulation_api import SimulationAPI

class SimulationMode:
    def __init__(self, knowledge_dir: str):
        self.session_builder = SimulationSessionBuilder(knowledge_dir)
        self.ai_parser = AIScenarioParser()

    def create_session(self, patient_profile: dict[str, Any], raw_scenario: dict[str, Any]) -> dict[str, Any]:
        return self.session_builder.build_session(patient_profile, raw_scenario)

    def launch(self) -> SimulationAPI:
        return self.session_builder.launch()
