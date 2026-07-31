"""
Bayesian Differential Diagnosis Engine (v12)
Computes probability, confidence scores, and evidence weighting for candidate diagnoses.
"""
from dataclasses import dataclass

@dataclass
class DiagnosticHypothesis:
    diagnosis_id: str
    name: str
    probability: float
    confidence: float
    supporting_evidence: list[str]

class BayesianDiagnosisEngine:
    def __init__(self):
        self.hypotheses: list[dict] = []

    def register_hypothesis(self, diag_id: str, name: str, prior: float, evidence_map: dict):
        self.hypotheses.append({
            "id": diag_id,
            "name": name,
            "prior": prior,
            "evidence_map": evidence_map # var_symbol -> likelihood_ratio
        })

    def evaluate(self, active_variables: dict[str, float]) -> list[DiagnosticHypothesis]:
        results = []
        for h in self.hypotheses:
            prior = h["prior"]
            odds = prior / (1.0 - prior + 1e-6)
            evidence = []

            for var_sym, lr in h["evidence_map"].items():
                if var_sym in active_variables:
                    val = active_variables[var_sym]
                    if val > 0.5: # Positive evidence
                        odds *= lr
                        evidence.append(f"{var_sym} present (LR {lr})")

            post_prob = odds / (1.0 + odds)
            results.append(DiagnosticHypothesis(
                diagnosis_id=h["id"],
                name=h["name"],
                probability=float(post_prob),
                confidence=min(1.0, len(evidence) * 0.3 + 0.1),
                supporting_evidence=evidence
            ))

        return sorted(results, key=lambda res: res.probability, reverse=True)
