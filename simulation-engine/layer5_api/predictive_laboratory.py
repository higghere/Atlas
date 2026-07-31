"""
Predictive Laboratory Public Façade API (v23.0)
Public entrypoint exposing compile, predict, and batch_predict methods with PredictionCache integration.
"""
from layer1_knowledge.knowledge_registry import KnowledgeRegistry
from layer4_clinical.intervention_planner import InterventionPlanner
from layer4_clinical.prediction_validator import PredictionValidator
from layer4_clinical.prediction_cache import PredictionCache
from layer4_clinical.prediction_manifest import PredictionManifest
from layer4_clinical.prediction_session import PredictionSession
from layer4_clinical.prediction_result import PredictionResult

class PredictiveLaboratory:
    def __init__(self, registry: KnowledgeRegistry = None):
        self.registry = registry or KnowledgeRegistry()
        self.planner = InterventionPlanner(self.registry)
        self.validator = PredictionValidator()
        self.cache = PredictionCache()

    def compile(
        self,
        patient_id: str,
        medications: list[dict] = None,
        procedures: list[dict] = None,
        checkpoints: list[int] = None
    ) -> PredictionManifest:
        return self.planner.plan(patient_id, medications, procedures, checkpoints)

    def predict(
        self,
        manifest: PredictionManifest,
        progress_callback=None,
        use_cache: bool = True
    ) -> PredictionResult:
        # 1. Validate manifest limits & sanity
        self.validator.validate(manifest)

        # 2. Check PredictionCache for hit
        if use_cache:
            cached = self.cache.get(manifest)
            if cached:
                return cached

        # 3. Create isolated sandbox session
        session = PredictionSession(manifest)
        result = session.execute_sandbox(progress_callback=progress_callback)

        # 4. Cache result for instant lookup
        if use_cache:
            self.cache.put(manifest, result)

        return result

    def batch_predict(
        self,
        manifests: list[PredictionManifest],
        progress_callback=None
    ) -> list[PredictionResult]:
        results = []
        for m in manifests:
            results.append(self.predict(m, progress_callback=progress_callback))
        return results
