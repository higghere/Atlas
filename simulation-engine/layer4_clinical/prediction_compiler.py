"""
Prediction Compiler (v23.0)
Resolves text string aliases (Paracetamol, Acetaminophen, PCM) to typed handles and produces PredictionManifest.
"""
import uuid
import hashlib
from layer4_clinical.prediction_manifest import PredictionManifest, DrugIntervention, ProcedureIntervention, TypedHandle

class PredictionCompiler:
    DRUG_ALIASES = {
        "paracetamol": ("DRUG_PARACETAMOL", "Paracetamol", "Analgesic"),
        "acetaminophen": ("DRUG_PARACETAMOL", "Paracetamol", "Analgesic"),
        "pcm": ("DRUG_PARACETAMOL", "Paracetamol", "Analgesic"),
        "ibuprofen": ("DRUG_IBUPROFEN", "Ibuprofen", "NSAID"),
        "metformin": ("DRUG_METFORMIN", "Metformin", "Antidiabetic")
    }

    PROCEDURE_ALIASES = {
        "rhinoplasty": ("PROC_RHINOPLASTY", "Rhinoplasty", "Cosmetic"),
        "botox": ("PROC_BOTOX", "Botox Injection", "Cosmetic"),
        "laceration_repair": ("PROC_LACERATION", "Laceration Repair", "Surgical")
    }

    def compile(
        self,
        patient_id: str,
        medications: list[dict] = None,
        procedures: list[dict] = None,
        checkpoints: list[int] = None
    ) -> PredictionManifest:
        meds_compiled = []
        if medications:
            for m in medications:
                drug_str = m.get("drug", "").lower().strip()
                match = self.DRUG_ALIASES.get(drug_str, (f"DRUG_{drug_str.upper()}", drug_str.capitalize(), "General"))
                handle = TypedHandle(match[0], match[1], match[2])
                meds_compiled.append(DrugIntervention(handle, m.get("dose_mg", 500.0), m.get("route", "oral")))

        procs_compiled = []
        if procedures:
            for p in procedures:
                proc_str = p.get("procedure", "").lower().strip()
                match = self.PROCEDURE_ALIASES.get(proc_str, (f"PROC_{proc_str.upper()}", proc_str.capitalize(), "General"))
                handle = TypedHandle(match[0], match[1], match[2])
                procs_compiled.append(ProcedureIntervention(handle, p.get("depth_cm", 1.0)))

        checkpoints_final = checkpoints or [30, 120, 360, 1440]
        patient_hash = hashlib.sha256(patient_id.encode('utf-8')).hexdigest()[:12]

        return PredictionManifest(
            prediction_id=str(uuid.uuid4())[:8],
            patient_hash=patient_hash,
            knowledge_hash="KNOWLEDGE_V23_HASH_9A8B",
            checkpoints=checkpoints_final,
            medications=meds_compiled,
            procedures=procs_compiled
        )
