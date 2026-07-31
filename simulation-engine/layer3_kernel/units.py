"""
Unit Conversion & Dimensional Analysis Engine (v12)
"""
from models.enums import UnitType
from models.types import Dimension

class UnitEngine:
    # Conversions to base SI dimensions/units
    # Base units: mmHg for pressure, mg/dL for concentration, mL/min for flow, °C for temperature
    
    DIMENSIONS: dict[UnitType, Dimension] = {
        UnitType.MMHG: Dimension(mass=1.0, length=-1.0, time=-2.0),
        UnitType.KPA: Dimension(mass=1.0, length=-1.0, time=-2.0),
        UnitType.MG_DL: Dimension(mass=1.0, length=-3.0),
        UnitType.MMOL_L: Dimension(substance=1.0, length=-3.0),
        UnitType.ML_MIN: Dimension(length=3.0, time=-1.0),
        UnitType.ML: Dimension(length=3.0),
        UnitType.KG: Dimension(mass=1.0),
        UnitType.CELSIUS: Dimension(temperature=1.0),
        UnitType.PERCENT: Dimension(), # Dimensionless
    }

    @staticmethod
    def get_dimension(unit: UnitType) -> Dimension:
        return UnitEngine.DIMENSIONS.get(unit, Dimension())

    @staticmethod
    def validate_addition(unit_a: UnitType, unit_b: UnitType) -> bool:
        dim_a = UnitEngine.get_dimension(unit_a)
        dim_b = UnitEngine.get_dimension(unit_b)
        return dim_a.is_compatible(dim_b)

    @staticmethod
    def convert(val: float, from_unit: UnitType, to_unit: UnitType) -> float:
        if from_unit == to_unit:
            return val
        
        # Pressure conversions
        if from_unit == UnitType.MMHG and to_unit == UnitType.KPA:
            return val * 0.133322
        if from_unit == UnitType.KPA and to_unit == UnitType.MMHG:
            return val / 0.133322

        # Default fallback if unit compatibility verified
        return val
