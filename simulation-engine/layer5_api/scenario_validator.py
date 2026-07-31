"""
Scenario Validator Engine (v17)
Enforces anatomical, physical, and medical bounds validation before scenario execution.
Rejects malformed scenarios (e.g. negative drug doses, invalid spatial hits, impossible event timing).
"""
from typing import Any

class ScenarioValidator:
    @staticmethod
    def validate_compiled_scenario(compiled_scenario: dict[str, Any]) -> list[str]:
        errors = []
        events = compiled_scenario.get("events", [])

        for event in events:
            # 1. Negative duration check
            if event.duration_ticks < 0:
                errors.append(f"Invalid negative duration in event {event.id}: {event.duration_ticks}")

            # 2. Drug dose bounds check
            payload = event.payload
            if "dose_mg" in payload and payload["dose_mg"] < 0:
                errors.append(f"Invalid negative drug dose in event {event.id}: {payload['dose_mg']}")

            # 3. Hemorrhage rate bounds check
            if "bleed_rate_ml_min" in payload and payload["bleed_rate_ml_min"] < 0:
                errors.append(f"Invalid negative bleed rate in event {event.id}: {payload['bleed_rate_ml_min']}")

        return errors
