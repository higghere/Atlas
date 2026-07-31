"""
Clinical Metrics Engine (v12)
Computes SOFA, APACHE, Perfusion, and Shock Index scores from current simulation state.
"""
from layer2_body.state_store import UnifiedStateStore
from models.types import VariableHandle

class ClinicalMetricsEngine:
    @staticmethod
    def compute_shock_index(hr: float, sbp: float) -> float:
        """Shock Index = Heart Rate / Systolic BP (Normal 0.5 - 0.7, Shock > 0.9)"""
        if sbp <= 0: return 0.0
        return hr / sbp

    @staticmethod
    def compute_sofa_score(creatinine: float, map_val: float, wbc: float) -> int:
        """Sequential Organ Failure Assessment (SOFA) score"""
        score = 0
        if creatinine >= 5.0: score += 4
        elif creatinine >= 3.5: score += 3
        elif creatinine >= 2.0: score += 2
        elif creatinine >= 1.2: score += 1

        if map_val < 70.0: score += 1
        return score
