"""
Neurological Failure & Brain Death Engine (v21)
Tracks Cerebral Perfusion Pressure (CPP = MAP - ICP), Brain Oxygenation, and Brain Death criteria.
"""
from enum import Enum
from dataclasses import dataclass

class BrainDeathState(Enum):
    NORMAL                = "normal"
    HYPOPERFUSION         = "hypoperfusion"
    REVERSIBLE_DYSFUNCTION= "reversible_dysfunction"
    SEVERE_INJURY         = "severe_injury"
    BRAIN_DEATH           = "brain_death"

class NeurologicalFailureEngine:
    def __init__(self):
        self.state = BrainDeathState.NORMAL
        self.brain_ischemia_duration_seconds: float = 0.0

    def evaluate_cpp(self, map_val: float, icp_val: float = 10.0, dt_seconds: float = 1.0) -> BrainDeathState:
        # If brain death is already reached, it is 100% irreversible
        if self.state == BrainDeathState.BRAIN_DEATH:
            return BrainDeathState.BRAIN_DEATH

        cpp = map_val - icp_val

        if cpp < 30.0 or map_val < 35.0:
            self.brain_ischemia_duration_seconds += dt_seconds
            if self.brain_ischemia_duration_seconds > 300.0: # 5 minutes of severe ischemia
                self.state = BrainDeathState.BRAIN_DEATH
            elif self.brain_ischemia_duration_seconds > 180.0:
                self.state = BrainDeathState.SEVERE_INJURY
            elif self.brain_ischemia_duration_seconds > 60.0:
                self.state = BrainDeathState.REVERSIBLE_DYSFUNCTION
            else:
                self.state = BrainDeathState.HYPOPERFUSION
        else:
            # Reperfusion recovery if not severely injured
            if self.state in (BrainDeathState.HYPOPERFUSION, BrainDeathState.REVERSIBLE_DYSFUNCTION):
                self.brain_ischemia_duration_seconds = max(0.0, self.brain_ischemia_duration_seconds - dt_seconds * 2.0)
                if self.brain_ischemia_duration_seconds == 0.0:
                    self.state = BrainDeathState.NORMAL

        return self.state
