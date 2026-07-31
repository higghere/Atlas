"""
Task Graph & DAG Topological Sorter (v12)
Builds execution stages grouping non-conflicting solvers into parallel stages based on read/write declarations.
"""
from layer3_kernel.solvers.base_solver import SolverContract

class TaskGraphBuilder:
    @staticmethod
    def build_execution_stages(solvers: list[SolverContract]) -> list[list[SolverContract]]:
        """
        Topologically sorts solvers and groups non-conflicting solvers into execution stages.
        Two solvers can execute in the same parallel stage if they have no read/write conflicts:
        (WritesA ∩ ReadsB = ∅, ReadsA ∩ WritesB = ∅, WritesA ∩ WritesB = ∅)
        """
        if not solvers:
            return []

        # Sort by priority first
        sorted_solvers = sorted(solvers, key=lambda s: s.priority)

        stages: list[list[SolverContract]] = []

        for solver in sorted_solvers:
            placed = False
            for stage in stages:
                # Check for conflict with all solvers currently in this stage
                conflict = False
                for existing in stage:
                    if (solver.writes & existing.reads) or (solver.reads & existing.writes) or (solver.writes & existing.writes):
                        conflict = True
                        break
                
                if not conflict:
                    stage.append(solver)
                    placed = True
                    break

            if not placed:
                stages.append([solver])

        return stages
