"""
Simulation Session Builder Engine (v17)
Implements the 9-stage Warm-Up Session Construction Pipeline:
Patient Profile -> Baseline Variables -> Scenario Compiler -> Scenario Validator -> Initialize Engine -> Warm-up Ticks (t_minus5 to t_0) -> Snapshot -> Preview -> Launch.
"""
from typing import Any
from layer5_api.simulation_api import SimulationAPI
from layer3_kernel.baseline_generator import BaselineGenerator
from layer5_api.scenario_compiler import ScenarioCompiler
from layer5_api.scenario_validator import ScenarioValidator

class SimulationSessionBuilder:
    def __init__(self, knowledge_dir: str):
        self.api = SimulationAPI(knowledge_dir)
        self.baseline_gen = BaselineGenerator()
        self.compiler = ScenarioCompiler(self.api.assets.symbol_table)
        self.validator = ScenarioValidator()
        self.session_data: dict[str, Any] | None = None

    def build_session(
        self,
        patient_profile: dict[str, Any],
        raw_scenario: dict[str, Any],
        warmup_ticks: int = 5
    ) -> dict[str, Any]:
        # 1. Map PatientProfile -> baseline input variables (Zero equations)
        self.baseline_gen.map_profile_to_inputs(
            patient_profile=patient_profile,
            store=self.api.store,
            symbol_table=self.api.assets.symbol_table
        )

        # 2. Compile Scenario (UUIDs -> Handles)
        compiled_scenario = self.compiler.compile_scenario(raw_scenario)

        # 3. Validate Scenario (Fail fast on invalid limits/anatomy)
        errors = self.validator.validate_compiled_scenario(compiled_scenario)
        if errors:
            raise ValueError(f"Scenario Validation Failed: {errors}")

        # 4. Enqueue initial events into EventDispatcher
        for event in compiled_scenario["events"]:
            self.api.kernel.event_bus.emit(event)

        # 5. Run Warm-Up Initialization Ticks (t_minus5 to t_0) to let physiology solvers settle
        for _ in range(warmup_ticks):
            self.api.step(1)

        # Reset current tick counter back to 0 for user simulation start
        self.api.current_tick = 0

        # 6. Snapshot & Build Preview
        hr = self.api.get_variable("heart.rate") or 72.0
        map_p = self.api.get_variable("blood.pressure.map") or 93.33

        self.session_data = {
            "patient_summary": {
                "age": patient_profile.get("age", 30),
                "sex": patient_profile.get("sex", "male"),
                "weight_kg": patient_profile.get("weight_kg", 70.0)
            },
            "scenario": compiled_scenario,
            "preview_vitals": {
                "heart_rate": hr,
                "map_pressure": map_p,
                "status": "Physiology Stabilized (Warm-Up Complete)"
            }
        }

        return self.session_data

    def launch(self) -> SimulationAPI:
        """Launches simulation at tick 0 and returns active SimulationAPI instance"""
        return self.api
