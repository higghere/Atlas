"""
Pharmacology Engine (v12)
Solves ADME (Absorption, Distribution, Metabolism, Excretion) pharmacokinetics & receptor binding dynamics.
"""
from layer3_kernel.transaction_manager import StateTransaction
from layer2_body.state_store import UnifiedStateStore
from layer3_kernel.solvers.integrators import Integrators
from models.types import VariableHandle, DrugHandle

class PharmacologyEngine:
    def __init__(
        self,
        v_drug_conc: VariableHandle,
        v_hepatic_func: VariableHandle,
        v_gfr: VariableHandle,
        half_life_hrs: float = 6.0
    ):
        self._v_drug_conc = v_drug_conc
        self._v_hepatic_func = v_hepatic_func
        self._v_gfr = v_gfr
        self.half_life_hrs = half_life_hrs

    def step_adme(self, store: UnifiedStateStore, tx: StateTransaction, dt: float):
        conc = tx.get(self._v_drug_conc)
        hep = store.get_variable(self._v_hepatic_func)
        gfr = store.get_variable(self._v_gfr)

        if conc <= 0.0:
            return

        clearance_factor = (hep / 100.0) * (gfr / 120.0)
        k_elim = (0.693 / (self.half_life_hrs * 3600.0)) * clearance_factor

        # Multi-substep integration for large dt
        steps = max(1, int(dt / 60.0))
        sub_dt = dt / steps
        curr_c = conc
        for _ in range(steps):
            curr_c = Integrators.rk4(curr_c, sub_dt, lambda c: -k_elim * c)

        tx.set(self._v_drug_conc, max(0.0, curr_c))
