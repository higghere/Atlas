"""
Prediction Cache (v23.0)
Stores and retrieves PredictionResult objects using SHA-256 manifest hashes for instantaneous lookup (<1ms).
"""
from layer4_clinical.prediction_manifest import PredictionManifest
from layer4_clinical.prediction_result import PredictionResult

class PredictionCache:
    def __init__(self):
        self._cache: dict[str, PredictionResult] = {}

    def get(self, manifest: PredictionManifest) -> PredictionResult | None:
        m_hash = manifest.compute_hash()
        return self._cache.get(m_hash)

    def put(self, manifest: PredictionManifest, result: PredictionResult) -> None:
        m_hash = manifest.compute_hash()
        self._cache[m_hash] = result

    def clear(self) -> None:
        self._cache.clear()
