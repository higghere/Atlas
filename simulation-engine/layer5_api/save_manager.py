"""
Save File Manager (v12)
Packages simulation manifest, checksums, binary state snapshot, and event log into container format.
"""
import json
import zipfile
import os
from layer2_body.state_store import UnifiedStateStore
from layer1_knowledge.manifest import SimulationManifest

class SaveFileManager:
    @staticmethod
    def save_simulation(filepath: str, store: UnifiedStateStore, manifest: SimulationManifest, current_tick: int):
        manifest_data = {
            "manifest_version": manifest.manifest_version,
            "simulation_version": manifest.simulation_version,
            "current_tick": current_tick,
            "master_seed": manifest.master_seed
        }
        
        values = store.get_raw_array()

        with zipfile.ZipFile(filepath, 'w', zipfile.ZIP_DEFLATED) as zipf:
            zipf.writestr("MANIFEST.json", json.dumps(manifest_data, indent=2))
            zipf.writestr("STATE_VALUES.json", json.dumps(values))

    @staticmethod
    def load_simulation(filepath: str, store: UnifiedStateStore) -> dict:
        with zipfile.ZipFile(filepath, 'r') as zipf:
            manifest_bytes = zipf.read("MANIFEST.json")
            state_bytes = zipf.read("STATE_VALUES.json")

            manifest_data = json.loads(manifest_bytes.decode('utf-8'))
            state_values = json.loads(state_bytes.decode('utf-8'))

            for idx, val in enumerate(state_values):
                store._values[idx] = val

            return manifest_data
