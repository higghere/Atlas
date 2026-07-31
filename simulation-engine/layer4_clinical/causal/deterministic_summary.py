"""
Rich Deterministic Prediction Summary (v23.2)
Structured output containing critical events, organ failure order, compensation timelines, and confidence breakdowns.
"""
from dataclasses import dataclass, field

@dataclass
class RichPredictionSummary:
    overall_risk: str # "STABLE", "COMPENSATING", "CRITICAL", "FAILURE"
    critical_events: list[dict] = field(default_factory=list)
    organ_failure_order: list[str] = field(default_factory=list)
    time_to_compensation_failure_seconds: float | None = None
    time_to_irreversibility_seconds: float | None = None
    survival_probability_pct: float = 100.0
    recommended_interventions: list[str] = field(default_factory=list)
    confidence_breakdown: dict[str, float] = field(default_factory=dict)
