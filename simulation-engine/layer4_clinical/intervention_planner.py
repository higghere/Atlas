"""
Intervention Planner (v23.1 - Renamed from PredictionCompiler)
Translates compiled knowledge objects into executable simulation events without direct state mutation.
"""
import uuid
import hashlib
from layer4_clinical.prediction_manifest import PredictionManifest, DrugIntervention, ProcedureIntervention, TypedHandle
from layer1_knowledge.knowledge_registry import KnowledgeRegistry

class InterventionPlanner:
    def __init__(self, registry: KnowledgeRegistry = None):
        self.registry = registry or KnowledgeRegistry()

    def plan(
        self,
        patient_id: str,
        medications: list[dict] = None,
        procedures: list[dict] = None,
        checkpoints: list[int] = None
    ) -> PredictionManifest:
        meds_planned = []
        if medications:
            for m in medications:
                drug_query = m.get("drug", "")
                resolved = self.registry.resolve_alias(drug_query)
                if resolved:
                    handle = TypedHandle(resolved["id"], resolved["aliases"][0], resolved["category"])
                else:
                    handle = TypedHandle(f"DRUG_{drug_query.upper()}", drug_query.capitalize(), "Analgesic")
                meds_planned.append(DrugIntervention(handle, m.get("dose_mg", 500.0), m.get("route", "oral")))

        procs_planned = []
        if procedures:
            for p in procedures:
                proc_query = p.get("procedure", "")
                resolved = self.registry.resolve_alias(proc_query)
                if resolved:
                    handle = TypedHandle(resolved["id"], resolved["aliases"][0], resolved["category"])
                else:
                    handle = TypedHandle(f"PROC_{proc_query.upper()}", proc_query.capitalize(), "Cosmetic")
                procs_planned.append(ProcedureIntervention(handle, p.get("depth_cm", 1.0)))

        checkpoints_final = checkpoints or [30, 120, 360, 1440]
        patient_hash = hashlib.sha256(patient_id.encode('utf-8')).hexdigest()[:12]

        return PredictionManifest(
            prediction_id=str(uuid.uuid4())[:8],
            patient_hash=patient_hash,
            knowledge_hash=self.registry.db.manifest_hash or "KNOWLEDGE_HASH_V23_1",
            checkpoints=checkpoints_final,
            medications=meds_planned,
            procedures=procs_planned
        )
