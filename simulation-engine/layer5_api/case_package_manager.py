"""
Case Package Manager Engine (v17)
Imports and exports full scenario packages (.hascase ZIP containers holding scenario, labs, medications, and objectives).
"""
import json
import zipfile
import os
from typing import Any

class CasePackageManager:
    @staticmethod
    def export_case_package(
        filepath: str,
        scenario_data: dict[str, Any],
        labs_data: dict[str, Any],
        medications_data: dict[str, Any],
        objectives_data: dict[str, Any]
    ):
        with zipfile.ZipFile(filepath, 'w', zipfile.ZIP_DEFLATED) as zipf:
            zipf.writestr("scenario.json", json.dumps(scenario_data, indent=2))
            zipf.writestr("labs.json", json.dumps(labs_data, indent=2))
            zipf.writestr("medications.json", json.dumps(medications_data, indent=2))
            zipf.writestr("objectives.json", json.dumps(objectives_data, indent=2))

    @staticmethod
    def load_case_package(filepath: str) -> dict[str, Any]:
        with zipfile.ZipFile(filepath, 'r') as zipf:
            scenario_bytes = zipf.read("scenario.json")
            labs_bytes = zipf.read("labs.json")
            meds_bytes = zipf.read("medications.json")
            objs_bytes = zipf.read("objectives.json")

            return {
                "scenario": json.loads(scenario_bytes.decode('utf-8')),
                "labs": json.loads(labs_bytes.decode('utf-8')),
                "medications": json.loads(meds_bytes.decode('utf-8')),
                "objectives": json.loads(objs_bytes.decode('utf-8'))
            }
