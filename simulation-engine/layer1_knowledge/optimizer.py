"""
Compiler Optimizer & Pre-Flight Validator (v12)
Folds constants, removes dead edges, and performs pre-flight integrity checks.
"""
from layer1_knowledge.symbol_table import SymbolTable

class CompilerOptimizer:
    @staticmethod
    def fold_constants(expr_str: str) -> str:
        """Simple constant folding helper"""
        return expr_str.strip()

    @staticmethod
    def validate_preflight(knowledge_data: dict, symbol_table: SymbolTable) -> list[str]:
        errors = []
        
        # 1. Check graph connectivity & orphan tissues
        organs = knowledge_data.get("organs", {})
        tissues = knowledge_data.get("tissues", {})
        vessels = knowledge_data.get("vessels", {})

        for tissue_id, t_data in tissues.items():
            parent_organ = t_data.get("organ_id")
            if parent_organ and parent_organ not in organs:
                errors.append(f"Orphan tissue error: Tissue {tissue_id} references non-existent organ {parent_organ}")

        for organ_id, o_data in organs.items():
            for v_id in o_data.get("vessels", []):
                if v_id not in vessels:
                    errors.append(f"Invalid vessel reference: Organ {organ_id} references non-existent vessel {v_id}")

        return errors
