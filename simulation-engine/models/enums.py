"""
Core Enums for Pathophysiology & Trauma Simulation Engine (v12)
Strict typed enums for time domains, LOD levels, unit types, cell death types, trauma types, etc.
"""
from enum import Enum, auto

class TimeDomain(Enum):
    ELECTRICAL  = "electrical"   # 0.001s (1ms)
    CARDIAC     = "cardiac"      # 0.01s (10ms)
    RESPIRATORY = "respiratory"  # 0.1s (100ms)
    CIRCULATION = "circulation"  # 1.0s
    HORMONAL    = "hormonal"     # 10.0s
    RENAL       = "renal"        # 60.0s (1min)
    INFLAMMATION= "inflammation" # 3600.0s (1hr)
    HEALING     = "healing"      # 86400.0s (1day)
    CHRONIC     = "chronic"      # 604800.0s (1wk)

class LODLevel(Enum):
    LOD0_ORGAN        = 0  # Whole organ level
    LOD1_TISSUE       = 1  # Tissue layer level (cortex, medulla)
    LOD2_FUNCTIONAL   = 2  # Functional units (nephron, alveolus)
    LOD3_POPULATION   = 3  # Statistical cell populations
    LOD4_CELLULAR     = 4  # Individual cells
    LOD5_SUBCELLULAR   = 5  # Organelle / molecular level

class UnitType(Enum):
    MMHG        = "mmHg"
    KPA         = "kPa"
    MG_DL       = "mg/dL"
    MMOL_L      = "mmol/L"
    ML_MIN      = "mL/min"
    ML          = "mL"
    KG          = "kg"
    CELSIUS     = "°C"
    PERCENT     = "%"
    G_DL        = "g/dL"
    MEQ_L       = "mEq/L"
    UIU_ML      = "uIU/mL"
    PG_ML       = "pg/mL"
    MCG_DL      = "mcg/dL"

class CellDeathType(Enum):
    NONE        = "none"
    NECROSIS    = "necrosis"
    APOPTOSIS   = "apoptosis"
    AUTOPHAGY   = "autophagy"
    FIBROSIS    = "fibrosis"
    CALCIFICATION = "calcification"
    REGENERATION  = "regeneration"

class TraumaType(Enum):
    PENETRATING = "penetrating"
    BLUNT       = "blunt"
    THERMAL     = "thermal"
    ELECTRICAL  = "electrical"
    RADIATION   = "radiation"
    CHEMICAL    = "chemical"
    BLAST       = "blast"
    COMPRESSION = "compression"

class EventPriority(Enum):
    EXTERNAL_INPUT    = 0
    TRAUMA_IMPACT     = 1
    STRUCTURAL_DECAY  = 2
    HEMORRHAGE        = 3
    PHYSIOLOGY_UPDATE = 4
    HORMONAL_DECAY    = 5
    SYMPTOM_DERIVATION= 6
    RECORD_SNAPSHOT   = 7

class DiagnosticMode(Enum):
    MINIMAL     = 0  # Errors only
    PERFORMANCE = 1  # Profiling & RAM
    MEDICAL     = 2  # Clinical warnings & lab status
    DEVELOPER   = 3  # Full variable transactions & event logs
    DEPENDENCY  = 4  # Full causal chain tracing ("Why did Creatinine rise?")

class AdminRoute(Enum):
    ORAL        = "oral"
    IV          = "iv"
    IM          = "im"
    SUBCUT      = "subcut"
    INHALED     = "inhaled"
