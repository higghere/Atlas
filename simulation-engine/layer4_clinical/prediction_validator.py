"""
Prediction Validator (v23.0)
Validates PredictionManifest against resource bounds and sanity rules before runtime execution.
Rejects negative doses, invalid routes, excessive checkpoints, and resource limit breaches.
"""
from layer4_clinical.prediction_manifest import PredictionManifest

class ValidationException(Exception):
    pass

class PredictionValidator:
    MAX_MEDICATIONS = 10
    MAX_PROCEDURES = 5
    MAX_CHECKPOINTS = 20
    MAX_DURATION_TICKS = 43200 # 30 Days

    def validate(self, manifest: PredictionManifest) -> bool:
        if len(manifest.medications) > self.MAX_MEDICATIONS:
            raise ValidationException(f"Medication limit exceeded: max {self.MAX_MEDICATIONS}")

        if len(manifest.procedures) > self.MAX_PROCEDURES:
            raise ValidationException(f"Procedure limit exceeded: max {self.MAX_PROCEDURES}")

        if len(manifest.checkpoints) > self.MAX_CHECKPOINTS:
            raise ValidationException(f"Checkpoint limit exceeded: max {self.MAX_CHECKPOINTS}")

        for med in manifest.medications:
            if med.dose_mg <= 0:
                raise ValidationException(f"Invalid negative or zero dose: {med.dose_mg} mg for {med.drug.symbol}")
            if med.route.lower() not in ["oral", "iv", "im", "sc"]:
                raise ValidationException(f"Invalid administration route: {med.route}")

        for proc in manifest.procedures:
            if proc.depth_cm < 0:
                raise ValidationException(f"Invalid negative procedure depth: {proc.depth_cm} cm")

        for cp in manifest.checkpoints:
            if cp <= 0 or cp > self.MAX_DURATION_TICKS:
                raise ValidationException(f"Invalid checkpoint tick bounds: {cp}")

        return True
