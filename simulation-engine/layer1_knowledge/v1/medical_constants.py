"""
Medical Constants Package (v16)
Immutable clinical reference baselines and physiological constants.
"""

class MedicalConstants:
    # Hemodynamics & Cardiovascular
    NORMAL_MAP_MMHG         = 93.33   # mmHg (120/80 MAP)
    NORMAL_HEART_RATE_BPM   = 72.0    # bpm
    NORMAL_STROKE_VOL_ML    = 70.0    # mL
    NORMAL_CARDIAC_OUTPUT   = 5040.0  # mL/min
    NORMAL_BLOOD_VOL_MALE   = 5000.0  # mL
    NORMAL_BLOOD_VOL_FEMALE = 4500.0  # mL

    # Blood Gas & Acid-Base
    NORMAL_PH               = 7.40
    NORMAL_PCO2_MMHG        = 40.0    # mmHg
    NORMAL_PO2_MMHG         = 95.0    # mmHg
    NORMAL_HCO3_MEQ_L       = 24.0    # mEq/L
    NORMAL_HEMOGLOBIN_G_DL  = 15.0    # g/dL

    # Renal & Metabolic
    NORMAL_GFR_ML_MIN       = 120.0   # mL/min
    NORMAL_CREATININE_MG_DL = 0.90    # mg/dL
    NORMAL_BUN_MG_DL        = 14.0    # mg/dL
    NORMAL_GLUCOSE_MG_DL    = 85.0    # mg/dL
    NORMAL_SODIUM_MEQ_L     = 140.0   # mEq/L
    NORMAL_POTASSIUM_MEQ_L  = 4.2     # mEq/L
    NORMAL_CORE_TEMP_C      = 37.0    # °C
