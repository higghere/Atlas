"""
Baseline Generator Engine (v17 Refactored)
Strictly maps PatientProfile attributes (age, sex, weight, height, smoking status) to input variables in UnifiedStateStore.
DOES NOT calculate blood volume, GFR, or cardiac output directly — these are computed by Layer 3 Physiology Solvers during warm-up initialization.
"""
from layer2_body.state_store import UnifiedStateStore
from layer1_knowledge.symbol_table import SymbolTable

class BaselineGenerator:
    def map_profile_to_inputs(self, patient_profile: dict, store: UnifiedStateStore, symbol_table: SymbolTable):
        # Raw physical & demographical inputs only
        input_map = {
            "patient.age": float(patient_profile.get("age", 30)),
            "patient.weight_kg": float(patient_profile.get("weight_kg", 70.0)),
            "patient.height_cm": float(patient_profile.get("height_cm", 175.0)),
            "patient.is_male": 1.0 if patient_profile.get("sex", "male").lower() == "male" else 0.0,
            "patient.smoking_status": 1.0 if patient_profile.get("smoking", False) else 0.0
        }

        for symbol, val in input_map.items():
            handle = symbol_table.get_handle(symbol)
            if not handle:
                handle = symbol_table.get_or_create_handle(symbol, type_id=5)
            store.set_variable(handle, val)
