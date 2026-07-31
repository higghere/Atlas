"""
Centralized Knowledge Registry & KnowledgeGraph Query Engine (v23.1)
Loads compiled binary database (knowledge.bin) and provides relational queries.
"""
import os
import json
from layer1_knowledge.compiler.compiler import CompiledKnowledgeDatabase, KnowledgeCompilerPipeline

class KnowledgeRegistry:
    def __init__(self, db_path: str = "knowledge.bin", assets_dir: str = None):
        self.db = CompiledKnowledgeDatabase()
        if assets_dir or not os.path.exists(db_path):
            base_dir = assets_dir or os.path.join(os.path.dirname(__file__), "assets")
            pipeline = KnowledgeCompilerPipeline(base_dir)
            self.db = pipeline.compile_all(db_path)
        else:
            with open(db_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.db.version = data.get("version", "23.1")
                self.db.manifest_hash = data.get("manifest_hash", "")
                self.db.assets = data.get("assets", {})
                self.db.aliases = data.get("aliases", {})

    def resolve_alias(self, query: str) -> dict | None:
        q_clean = query.lower().strip()
        asset_id = self.db.aliases.get(q_clean)
        if asset_id and asset_id in self.db.assets:
            return self.db.assets[asset_id]
        # Check direct ID
        return self.db.assets.get(query.upper())

    def get_asset(self, asset_id: str) -> dict | None:
        return self.db.assets.get(asset_id)
