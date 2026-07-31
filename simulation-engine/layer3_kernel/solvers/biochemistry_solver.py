"""
Biochemistry Solver Implementation (v12)
Evaluates metabolic resource exchange, ADME drug clearance, and waste production.
"""
from layer3_kernel.solvers.base_solver import SolverContract
from layer3_kernel.transaction_manager import StateTransaction
from models.enums import TimeDomain, LODLevel
from models.types import VariableHandle

class BiochemistrySolver(SolverContract):
    def __init__(self, v_glucose: VariableHandle, v_insulin: VariableHandle, v_creatinine: VariableHandle, v_gfr: VariableHandle):
        self._v_glucose = v_glucose
        self._v_insulin = v_insulin
        self._v_creatinine = v_creatinine
        self._v_gfr = v_gfr

    @property
    def name(self) -> str: return "BiochemistrySolver"
    @property
    def execution_domain(self) -> TimeDomain: return TimeDomain.HORMONAL
    @property
    def priority(self) -> int: return 30 # Biochemistry stage
    @property
    def required_lod(self) -> LODLevel: return LODLevel.LOD0_ORGAN
    @property
    def deterministic(self) -> bool: return True
    @property
    def reads(self) -> set: return {self._v_glucose, self._v_insulin, self._v_gfr}
    @property
    def writes(self) -> set: return {self._v_glucose, self._v_creatinine}

    def preconditions(self, store) -> bool: return True

    def execute(self, store, tx: StateTransaction) -> bool:
        glucose = tx.get(self._v_glucose)
        insulin = tx.get(self._v_insulin)
        gfr = tx.get(self._v_gfr)

        # Glucose uptake driven by insulin
        if glucose > 100.0 and insulin > 0.0:
            tx.set(self._v_glucose, max(70.0, glucose - (insulin * 2.0)))

        # Creatinine clearance inversely proportional to GFR (mL/min)
        # Normal GFR ~120 mL/min -> Creatinine ~0.8 mg/dL
        if gfr > 0.0:
            new_creat = 0.8 * (120.0 / max(10.0, gfr))
            tx.set(self._v_creatinine, new_creat)

        return True

    def postconditions(self, tx: StateTransaction) -> bool: return True
    def rollback(self, tx: StateTransaction): pass
