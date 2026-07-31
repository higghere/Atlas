"""
Simulation Facade API (v12)
Public facade API providing thread-safe simulation controls.
"""
from layer2_body.state_store import UnifiedStateStore
from layer1_knowledge.compiler import KnowledgeCompiler
from layer1_knowledge.manifest import SimulationManifest
from layer3_kernel.transaction_manager import StateTransaction
from layer3_kernel.scheduler import Scheduler
from layer5_api.save_manager import SaveFileManager

class SimulationAPI:
    def __init__(self, knowledge_dir: str):
        self.compiler = KnowledgeCompiler()
        self.assets = self.compiler.compile(knowledge_dir)
        self.store = UnifiedStateStore(initial_capacity=1000)
        self.manifest = SimulationManifest()
        self.scheduler = Scheduler(fixed_dt=0.001)
        self.current_tick = 0

    def step(self, num_ticks: int = 1):
        for _ in range(num_ticks):
            self.current_tick += 1
            self.scheduler.advance()

    def get_variable(self, uuid_str: str) -> float | None:
        handle = self.assets.symbol_table.get_handle(uuid_str)
        if not handle:
            return None
        return self.store.get_variable(handle)

    def set_variable(self, uuid_str: str, value: float) -> bool:
        handle = self.assets.symbol_table.get_handle(uuid_str)
        if not handle:
            return False
        self.store.set_variable(handle, value)
        return True

    def save_checkpoint(self, filepath: str):
        SaveFileManager.save_simulation(filepath, self.store, self.manifest, self.current_tick)

    def load_checkpoint(self, filepath: str):
        manifest_data = SaveFileManager.load_simulation(filepath, self.store)
        self.current_tick = manifest_data.get("current_tick", 0)
