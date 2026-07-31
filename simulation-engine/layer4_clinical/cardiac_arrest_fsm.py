"""
Cardiac Rhythm & Rescue Window State Machine (v22 Refactored)
Includes explicit PRE_TERMINAL rescue window and duration-based time integral transitions.
"""
from enum import Enum

class CardiacRhythmState(Enum):
    NORMAL_SINUS       = "normal_sinus"
    COMPENSATED_SHOCK  = "compensated_shock"
    DECOMPENSATED_SHOCK= "decompensated_shock"
    PRE_TERMINAL       = "pre_terminal"          # Explicit Rescue Window
    PULSELESS          = "pulseless"
    CARDIAC_ARREST     = "cardiac_arrest"
    ROSC               = "rosc"
    ASYSTOLE_DEATH     = "asystole_death"

class CardiacArrestFSM:
    def __init__(self):
        self.state = CardiacRhythmState.NORMAL_SINUS
        self.arrest_duration_seconds: float = 0.0
        self.pre_terminal_duration_seconds: float = 0.0

    def update_rhythm(self, map_val: float, heart_rate: float, cpr_active: bool = False, dt_seconds: float = 1.0) -> CardiacRhythmState:
        if self.state == CardiacRhythmState.ASYSTOLE_DEATH:
            return CardiacRhythmState.ASYSTOLE_DEATH

        # ROSC check when coming from arrest/pulseless/pre-terminal
        if self.state in (CardiacRhythmState.CARDIAC_ARREST, CardiacRhythmState.PULSELESS, CardiacRhythmState.PRE_TERMINAL) and (cpr_active or map_val >= 60.0):
            self.state = CardiacRhythmState.ROSC
            return self.state

        # Duration-based integral tracking
        if map_val < 30.0 or heart_rate < 20.0:
            self.arrest_duration_seconds += dt_seconds
            if self.arrest_duration_seconds > 600.0:
                self.state = CardiacRhythmState.ASYSTOLE_DEATH
            elif self.arrest_duration_seconds > 30.0:
                self.state = CardiacRhythmState.CARDIAC_ARREST
            else:
                self.state = CardiacRhythmState.PULSELESS
        elif map_val < 45.0:
            self.pre_terminal_duration_seconds += dt_seconds
            if self.pre_terminal_duration_seconds > 120.0:
                self.state = CardiacRhythmState.PRE_TERMINAL
            else:
                self.state = CardiacRhythmState.DECOMPENSATED_SHOCK
        elif map_val < 65.0:
            self.state = CardiacRhythmState.DECOMPENSATED_SHOCK
            self.pre_terminal_duration_seconds = max(0.0, self.pre_terminal_duration_seconds - dt_seconds)
        elif map_val < 80.0:
            self.state = CardiacRhythmState.COMPENSATED_SHOCK
            self.pre_terminal_duration_seconds = 0.0
        else:
            self.state = CardiacRhythmState.NORMAL_SINUS

        return self.state
