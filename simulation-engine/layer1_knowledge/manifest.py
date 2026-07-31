"""
Simulation Manifest & Schema Versioning (v12)
"""
from dataclasses import dataclass, field
import json
import os

@dataclass
class SimulationManifest:
    manifest_version: str = "1.0.0"
    simulation_version: str = "1.0.0"
    master_seed: int = 42
    default_lod: int = 1
    schemas: dict[str, str] = field(default_factory=lambda: {
        "anatomy_schema_version": "1.2.0",
        "disease_schema_version": "1.0.0",
        "drug_schema_version": "1.1.0",
        "equation_schema_version": "2.0.0",
        "clinical_rule_schema_version": "1.0.0"
    })

    @staticmethod
    def load_from_file(filepath: str) -> 'SimulationManifest':
        if not os.path.exists(filepath):
            return SimulationManifest()
        with open(filepath, 'r') as f:
            data = json.load(f)
        return SimulationManifest(
            manifest_version=data.get("manifest_version", "1.0.0"),
            simulation_version=data.get("simulation_version", "1.0.0"),
            master_seed=data.get("master_seed", 42),
            default_lod=data.get("default_lod", 1),
            schemas=data.get("schemas", {})
        )
