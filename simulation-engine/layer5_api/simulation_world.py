"""
Multi-Casualty Simulation World Container (v19)
Owns multiple isolated SimulationAPI instances representing individual patients (e.g. ER, Mass Casualty).
"""
from layer5_api.simulation_api import SimulationAPI

class SimulationWorld:
    def __init__(self, knowledge_dir: str):
        self.knowledge_dir = knowledge_dir
        self.patients: dict[str, SimulationAPI] = {}

    def spawn_patient(self, patient_id: str) -> SimulationAPI:
        api = SimulationAPI(self.knowledge_dir)
        self.patients[patient_id] = api
        return api

    def step_world(self, num_ticks: int = 1):
        for api in self.patients.values():
            api.step(num_ticks)
