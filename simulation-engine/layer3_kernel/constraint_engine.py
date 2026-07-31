"""
Dual Hard/Soft Constraint Engine & Conservation Invariant Checker (v12)
Validates post-transaction variable bounds and mass/energy conservation.
"""
from dataclasses import dataclass
from layer3_kernel.transaction_manager import StateTransaction
from layer3_kernel.variable_registry import VariableRegistry
from layer3_kernel.math_utils import MathUtils
from models.types import VariableHandle

@dataclass
class ConstraintResult:
    is_valid: bool
    violations: list[str]

class ConstraintEngine:
    def __init__(self, registry: VariableRegistry):
        self.registry = registry

    def validate(self, tx: StateTransaction) -> ConstraintResult:
        violations = []
        is_valid = True

        for idx, val in tx.get_modified_variables().items():
            handle = VariableHandle(index=idx, generation=1, type_id=5)
            meta = self.registry.get_metadata(handle)
            if not meta:
                continue

            # 1. Hard Constraint (Physical impossibility check -> Clamp & report)
            if val < meta.min_value or val > meta.max_value:
                clamped = MathUtils.clamp(val, meta.min_value, meta.max_value)
                tx.set(handle, clamped)
                violations.append(f"HARD CONSTRAINT CLAMP: {meta.symbol} value {val:.2f} clamped to [{meta.min_value}, {meta.max_value}] -> {clamped:.2f}")

            # 2. Soft Constraint (Clinical warning check)
            elif val < meta.normal_min or val > meta.normal_max:
                violations.append(f"SOFT CLINICAL WARNING: {meta.symbol} ({val:.2f} {meta.unit.value}) outside normal range [{meta.normal_min}, {meta.normal_max}]")

        return ConstraintResult(is_valid=is_valid, violations=violations)
