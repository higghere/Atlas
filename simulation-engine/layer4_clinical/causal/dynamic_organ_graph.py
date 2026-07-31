"""
Dynamic Organ Dependency Graph (v23.2)
Derives inter-organ failure cascades dynamically from runtime state parameters.
"""
from dataclasses import dataclass, field

@dataclass
class OrganCascadeNode:
    organ_id: str
    health_pct: float
    is_failing: bool
    dependent_organs_affected: list[str] = field(default_factory=list)

class DynamicOrganDependencyGraph:
    def update_graph(self, map_val: float, spo2_val: float, k_val: float) -> dict[str, OrganCascadeNode]:
        nodes = {}

        # Heart Node
        heart_health = 100.0 if map_val >= 70 else (30.0 if map_val < 45 else 60.0)
        heart_failing = map_val < 45 or k_val > 6.0
        heart_deps = ["Kidneys", "Brain"] if heart_failing else []
        nodes["Heart"] = OrganCascadeNode("Heart", heart_health, heart_failing, heart_deps)

        # Kidney Node (Heart -> MAP -> Kidney)
        kidney_health = 100.0 if map_val >= 75 else (20.0 if map_val < 45 else 55.0)
        kidney_failing = kidney_health < 30.0
        kidney_deps = ["Heart (Hyperkalemia)"] if kidney_failing else []
        nodes["Kidneys"] = OrganCascadeNode("Kidneys", kidney_health, kidney_failing, kidney_deps)

        # Brain Node (SpO2 & MAP -> Brain)
        brain_health = 100.0 if spo2_val >= 90 else (25.0 if spo2_val < 60 else 50.0)
        brain_failing = brain_health < 30.0
        nodes["Brain"] = OrganCascadeNode("Brain", brain_health, brain_failing, [])

        return nodes
