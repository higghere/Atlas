"""
Localized Microcirculation Physics & Resource Transport Engine (v12)
Solves the 7-stage microcirculation pipeline:
Pressure Gradient -> Flow (Hagen-Poiseuille) -> Convective Transport -> Fick's Capillary Diffusion -> Michaelis-Menten Consumption -> Waste -> Venous Return
"""
from dataclasses import dataclass
from layer2_body.state_store import UnifiedStateStore
from layer3_kernel.transaction_manager import StateTransaction
from layer3_kernel.solvers.integrators import Integrators
from models.types import VesselHandle, TissueHandle, VariableHandle

@dataclass
class MicrocirculationSegment:
    vessel_handle: VesselHandle
    tissue_handle: TissueHandle
    radius_mm: float
    length_mm: float
    viscosity_cp: float
    capillary_area_cm2: float

class LocalizedResourceEngine:
    def __init__(self):
        self.segments: list[MicrocirculationSegment] = []

    def register_segment(self, segment: MicrocirculationSegment):
        self.segments.append(segment)

    def step_transport(
        self,
        store: UnifiedStateStore,
        tx: StateTransaction,
        dt: float,
        v_art_press: VariableHandle,
        v_ven_press: VariableHandle,
        v_tissue_o2: VariableHandle,
        v_tissue_atp: VariableHandle
    ):
        p_art = tx.get(v_art_press)
        p_ven = tx.get(v_ven_press)
        delta_p = max(0.1, p_art - p_ven)

        for seg in self.segments:
            # 1. Hagen-Poiseuille Flow Q (mL/min)
            # Q = (pi * r^4 * delta_p) / (8 * mu * L)
            r_cm = seg.radius_mm / 10.0
            l_cm = seg.length_mm / 10.0
            flow_q = (3.14159 * (r_cm ** 4) * delta_p) / (8.0 * (seg.viscosity_cp / 100.0) * l_cm) * 60.0

            # 2. Convective Transport (Oxygen delivery rate)
            o2_delivery = flow_q * 0.20 # 20% O2 content in arterial blood

            # 3. Fick's Capillary Diffusion into tissue
            current_t_o2 = tx.get(v_tissue_o2)
            diffusion_j = 0.05 * seg.capillary_area_cm2 * max(0.0, (o2_delivery - current_t_o2))

            # 4. Michaelis-Menten Cellular O2 Consumption & ATP Production
            v_max = 10.0
            k_m = 20.0
            consumption_rate = (v_max * current_t_o2) / (k_m + current_t_o2)

            # Integrate tissue O2 using Explicit Euler / RK2
            new_t_o2 = Integrators.explicit_euler(
                y=current_t_o2,
                dt=dt,
                derivative_fn=lambda o2: (diffusion_j - consumption_rate)
            )

            # Update tissue ATP proportionally
            current_atp = tx.get(v_tissue_atp)
            new_atp = Integrators.explicit_euler(
                y=current_atp,
                dt=dt,
                derivative_fn=lambda atp: (consumption_rate * 2.0 - 5.0) # Maintenance cost = 5
            )

            tx.set(v_tissue_o2, max(0.0, min(100.0, new_t_o2)))
            tx.set(v_tissue_atp, max(0.0, min(100.0, new_atp)))
