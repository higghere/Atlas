"""
Counterfactual Comparison Engine (v23.2)
Compares baseline untreated simulation vs counterfactual intervention simulation ("What if blood was given at 3 minutes?").
"""
from dataclasses import dataclass

@dataclass
class CounterfactualDelta:
    parameter: str
    baseline_value: float
    counterfactual_value: float
    delta: float
    outcome_impact: str

class CounterfactualEngine:
    def compare_simulations(self, baseline_res: dict, counterfactual_res: dict) -> list[CounterfactualDelta]:
        deltas = []
        base_map = baseline_res.get("predicted_vitals", {}).get("blood_pressure_map", 93.33)
        counter_map = counterfactual_res.get("predicted_vitals", {}).get("blood_pressure_map", 93.33)

        deltas.append(CounterfactualDelta(
            parameter="MAP (Mean Arterial Pressure)",
            baseline_value=base_map,
            counterfactual_value=counter_map,
            delta=round(counter_map - base_map, 1),
            outcome_impact="Improved Perfusion" if counter_map > base_map else "No Significant Change"
        ))

        base_hr = baseline_res.get("predicted_vitals", {}).get("heart_rate", 72.0)
        counter_hr = counterfactual_res.get("predicted_vitals", {}).get("heart_rate", 72.0)

        deltas.append(CounterfactualDelta(
            parameter="Heart Rate",
            baseline_value=base_hr,
            counterfactual_value=counter_hr,
            delta=round(counter_hr - base_hr, 1),
            outcome_impact="Reduced Tachycardic Stress" if counter_hr < base_hr else "Baseline Flow"
        ))

        return deltas
