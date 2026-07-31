"""
Organ Functional Reserve Accumulator (v22)
Models continuous organ capacity degradation (100% -> 0%) under sustained physiological stress.
Asymptomatic buffering zone (>= 50%), Symptomatic zone (25-50%), Organ Failure zone (< 10%).
"""
from dataclasses import dataclass

@dataclass
class OrganFunctionalReserve:
    organ_id: str
    reserve_pct: float = 100.0          # 100% = Full Capacity
    is_compensating: bool = True
    failure_stage: str = "NORMAL"       # NORMAL, SYMPTOMATIC, FAILURE

class OrganReserveAccumulator:
    def __init__(self):
        self.reserves: dict[str, OrganFunctionalReserve] = {
            "ORG_KIDNEY": OrganFunctionalReserve("ORG_KIDNEY"),
            "ORG_HEART": OrganFunctionalReserve("ORG_HEART"),
            "ORG_LIVER": OrganFunctionalReserve("ORG_LIVER"),
            "ORG_LUNG": OrganFunctionalReserve("ORG_LUNG"),
            "ORG_BRAIN": OrganFunctionalReserve("ORG_BRAIN")
        }

    def update_reserves(self, map_val: float, ph_val: float, dt_seconds: float) -> dict[str, OrganFunctionalReserve]:
        # Duration-based integral degradation
        if map_val < 50.0 or ph_val < 7.20:
            stress_factor = (50.0 - min(50.0, map_val)) / 50.0 + (7.20 - min(7.20, ph_val))
            decline_rate = 2.0 * stress_factor * dt_seconds

            for res in self.reserves.values():
                res.reserve_pct = max(0.0, res.reserve_pct - decline_rate)
                if res.reserve_pct < 10.0:
                    res.failure_stage = "FAILURE"
                    res.is_compensating = False
                elif res.reserve_pct < 50.0:
                    res.failure_stage = "SYMPTOMATIC"
                    res.is_compensating = True
                else:
                    res.failure_stage = "NORMAL"
        else:
            # Slow recovery if stress resolved and reserve > 10%
            for res in self.reserves.values():
                if 10.0 < res.reserve_pct < 100.0:
                    res.reserve_pct = min(100.0, res.reserve_pct + 0.1 * dt_seconds)

        return self.reserves
