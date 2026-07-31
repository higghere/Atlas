"""
Phase 11 Verification Test Suite
Tests Bayesian Differential Diagnosis Engine and Clinical Metrics Engine (Shock Index & SOFA).
"""
import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from layer4_clinical.bayesian_diagnosis import BayesianDiagnosisEngine
from layer4_clinical.metrics_engine import ClinicalMetricsEngine

class TestPhase11Clinical(unittest.TestCase):
    def test_bayesian_differential_diagnosis(self):
        engine = BayesianDiagnosisEngine()
        engine.register_hypothesis(
            diag_id="DX_AKI",
            name="Acute Kidney Injury",
            prior=0.05,
            evidence_map={"SYM_OLIGURIA": 10.0, "SYM_ELEVATED_CREATININE": 15.0}
        )

        # Active evidence
        evidence = {
            "SYM_OLIGURIA": 1.0,
            "SYM_ELEVATED_CREATININE": 1.0
        }

        hypotheses = engine.evaluate(evidence)
        self.assertEqual(len(hypotheses), 1)
        self.assertGreater(hypotheses[0].probability, 0.8) # Post probability boosted by evidence

    def test_clinical_metrics(self):
        # Shock Index = HR 120 / SBP 80 = 1.5 (Severe Shock)
        si = ClinicalMetricsEngine.compute_shock_index(hr=120.0, sbp=80.0)
        self.assertEqual(si, 1.5)

        # SOFA score with Creatinine 3.8 mg/dL and MAP 65 mmHg -> Score 3 + 1 = 4
        sofa = ClinicalMetricsEngine.compute_sofa_score(creatinine=3.8, map_val=65.0, wbc=12.0)
        self.assertEqual(sofa, 4)

if __name__ == '__main__':
    unittest.main()
