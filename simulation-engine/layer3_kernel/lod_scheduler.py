"""
Dynamic LOD Scheduler (v12)
Adjusts detail levels automatically based on patient state acuity.
"""
from models.enums import LODLevel

class LODScheduler:
    @staticmethod
    def compute_active_lod(patient_acuity_score: float) -> LODLevel:
        """
        0.0 = Stable healthy patient -> LOD0 (Organ level)
        1.0 = Critical shock -> LOD3/LOD4 (Cellular level)
        """
        if patient_acuity_score > 0.8:
            return LODLevel.LOD3_POPULATION
        elif patient_acuity_score > 0.4:
            return LODLevel.LOD2_FUNCTIONAL
        elif patient_acuity_score > 0.1:
            return LODLevel.LOD1_TISSUE
        return LODLevel.LOD0_ORGAN
