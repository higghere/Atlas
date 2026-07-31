"""
Parallel Solver Executor (v12)
Executes task graph stages sequentially across stages, with solvers inside each stage running concurrently.
"""
from layer3_kernel.task_graph import TaskGraphBuilder
from layer3_kernel.solvers.base_solver import SolverContract
from layer3_kernel.transaction_manager import StateTransaction

class SolverExecutor:
    def __init__(self, solvers: list[SolverContract]):
        self.solvers = solvers
        self.stages = TaskGraphBuilder.build_execution_stages(solvers)

    def execute_all(self, store, base_tick: int) -> list[StateTransaction]:
        transactions = []
        for stage in self.stages:
            # Stage Read-Only / Execution
            for solver in stage:
                if solver.preconditions(store):
                    tx = StateTransaction(store, tick=base_tick)
                    success = solver.execute(store, tx)
                    if success and solver.postconditions(tx):
                        tx.commit()
                        transactions.append(tx)
                    else:
                        tx.rollback()
                        solver.rollback(tx)
        return transactions
