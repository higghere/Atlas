"""
Knowledge Compiler Orchestrator (v12)
Parses JSON definitions, assigns integer handles, performs pre-flight validation, and packages CompiledAssets.
"""
import os
import json
from layer1_knowledge.symbol_table import SymbolTable
from layer1_knowledge.compiled_assets import CompiledAssets
from layer1_knowledge.optimizer import CompilerOptimizer

# Type IDs
TYPE_ORGAN = 1
TYPE_TISSUE = 2
TYPE_VESSEL = 3
TYPE_NERVE = 4
TYPE_VARIABLE = 5

class KnowledgeCompiler:
    def __init__(self):
        self.symbol_table = SymbolTable()

    def compile(self, knowledge_dir: str) -> CompiledAssets:
        raw_data = {
            "organs": {},
            "tissues": {},
            "vessels": {},
            "nerves": {},
            "variables": {},
            "systems": {},
            "vascular_graph": {"nodes": [], "edges": []},
            "neural_graph": {"nodes": [], "edges": []},
            "lymphatic_graph": {"nodes": [], "edges": []}
        }

        # 1. Load JSON files if directory exists
        if os.path.exists(knowledge_dir):
            for root, _, files in os.walk(knowledge_dir):
                for f in files:
                    if f.endswith('.json'):
                        fp = os.path.join(root, f)
                        with open(fp, 'r') as fh:
                            content = json.load(fh)
                            for category in ["organs", "tissues", "vessels", "nerves", "variables", "systems"]:
                                if category in content:
                                    raw_data[category].update(content[category])
                            for graph_cat in ["vascular_graph", "neural_graph", "lymphatic_graph"]:
                                if graph_cat in content:
                                    raw_data[graph_cat]["nodes"].extend(content[graph_cat].get("nodes", []))
                                    raw_data[graph_cat]["edges"].extend(content[graph_cat].get("edges", []))

        # 2. Run Pre-flight Validation
        errors = CompilerOptimizer.validate_preflight(raw_data, self.symbol_table)
        if errors:
            raise ValueError(f"Knowledge Compilation Validation Failed: {errors}")

        # 3. Build Compiled Assets using integer handles
        compiled_organs = {}
        compiled_tissues = {}
        compiled_vessels = {}
        compiled_nerves = {}

        for uuid_str, data in raw_data["organs"].items():
            handle = self.symbol_table.get_or_create_handle(uuid_str, TYPE_ORGAN)
            compiled_organs[handle] = data

        for uuid_str, data in raw_data["tissues"].items():
            handle = self.symbol_table.get_or_create_handle(uuid_str, TYPE_TISSUE)
            compiled_tissues[handle] = data

        for uuid_str, data in raw_data["vessels"].items():
            handle = self.symbol_table.get_or_create_handle(uuid_str, TYPE_VESSEL)
            compiled_vessels[handle] = data

        for uuid_str, data in raw_data["nerves"].items():
            handle = self.symbol_table.get_or_create_handle(uuid_str, TYPE_NERVE)
            compiled_nerves[handle] = data

        for uuid_str in raw_data["systems"].keys():
            self.symbol_table.get_or_create_handle(uuid_str, type_id=6)

        for graph_cat in ["vascular_graph", "neural_graph", "lymphatic_graph"]:
            for node in raw_data[graph_cat]["nodes"]:
                self.symbol_table.get_or_create_handle(node["id"], type_id=7)

        return CompiledAssets(
            organs=compiled_organs,
            tissues=compiled_tissues,
            vessels=compiled_vessels,
            nerves=compiled_nerves,
            equations={},
            symbol_table=self.symbol_table
        )
