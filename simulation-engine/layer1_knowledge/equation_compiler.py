"""
Equation Compiler Engine (v12)
Compiles string math expressions into deterministic Expression DAG callables.
Replaces custom bytecode VM with python AST compiled expression DAGs.
"""
import ast
import math
from typing import Callable, Any

class EquationCompiler:
    SAFE_FUNCS = {
        'abs': abs,
        'min': min,
        'max': max,
        'exp': math.exp,
        'log': math.log,
        'sqrt': math.sqrt,
        'pow': pow
    }

    @staticmethod
    def compile_expression(
        expr_str: str,
        symbol_map: dict[str, Any]
    ) -> Callable[[dict[Any, float]], float]:
        """
        Compiles string equation into an optimized lambda/callable.
        Expression references string symbols mapped via symbol_map to handles.
        """
        parsed = ast.parse(expr_str, mode='eval')
        code_obj = compile(parsed, filename='<equation>', mode='eval')

        def evaluator(variable_store: dict[Any, float]) -> float:
            # Build local namespace mapping symbols -> current variable values from store
            local_vars = {}
            for sym, handle in symbol_map.items():
                local_vars[sym] = variable_store.get(handle, 0.0)
            
            return float(eval(code_obj, {"__builtins__": None, **EquationCompiler.SAFE_FUNCS}, local_vars))

        return evaluator
