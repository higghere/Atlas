"""
Diagnostics & Causal Chain Tracer (v12)
Provides multi-mode diagnostic tracing, solver profiling, and causal chain explanation generation.
"""
from models.enums import DiagnosticMode

class DiagnosticsManager:
    def __init__(self, mode: DiagnosticMode = DiagnosticMode.DEVELOPER):
        self.mode = mode
        self.causal_log: list[str] = []

    def log_cause(self, target_variable: str, cause_description: str):
        if self.mode in [DiagnosticMode.DEVELOPER, DiagnosticMode.DEPENDENCY]:
            self.causal_log.append(f"[{target_variable}] {cause_description}")

    def trace_causal_chain(self, target_variable: str) -> list[str]:
        return [entry for entry in self.causal_log if target_variable in entry]
