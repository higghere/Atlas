"""
Milestone Detector (v23.2)
Automatically detects key teaching milestones chronologically during simulation runs.
"""
from dataclasses import dataclass

@dataclass
class MilestoneEvent:
    timestamp_tick: int
    time_str: str
    milestone_name: str
    description: str

class MilestoneDetector:
    def __init__(self):
        self.milestones: list[MilestoneEvent] = []

    def evaluate_tick(self, tick: int, map_val: float, spo2_val: float, blood_vol: float, is_deceased: bool = False):
        m_str = f"{tick // 60:02d}:{tick % 60:02d}"

        if blood_vol < 4000 and not any(m.milestone_name == "Compensatory Shock" for m in self.milestones):
            self.milestones.append(MilestoneEvent(tick, m_str, "Compensatory Shock", "Tachycardia and vasoconstriction activated."))

        if map_val < 60 and not any(m.milestone_name == "Decompensated Shock" for m in self.milestones):
            self.milestones.append(MilestoneEvent(tick, m_str, "Decompensated Shock", "MAP below critical perfusion threshold."))

        if spo2_val < 70 and not any(m.milestone_name == "Cerebral Hypoxia" for m in self.milestones):
            self.milestones.append(MilestoneEvent(tick, m_str, "Cerebral Hypoxia", "Brain oxygenation severely compromised."))

        if map_val < 45 and not any(m.milestone_name == "Renal Failure Begins" for m in self.milestones):
            self.milestones.append(MilestoneEvent(tick, m_str, "Renal Failure Begins", "GFR drops to near zero."))

        if is_deceased and not any(m.milestone_name == "Clinical Death" for m in self.milestones):
            self.milestones.append(MilestoneEvent(tick, m_str, "Clinical Death", "Irreversible organ collapse."))

        return self.milestones
