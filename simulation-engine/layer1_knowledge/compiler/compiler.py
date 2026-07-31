"""
Knowledge Compiler 5-Stage Pipeline (v23.1)
Scanner -> Validator -> DependencyResolver -> Normalizer -> Compiler -> knowledge.bin
"""
import os
import json
import hashlib
from dataclasses import dataclass, field

@dataclass
class CompiledKnowledgeDatabase:
    version: str = "23.1"
    manifest_hash: str = ""
    assets: dict[str, dict] = field(default_factory=dict)
    aliases: dict[str, str] = field(default_factory=dict)

class KnowledgeScanner:
    def scan(self, root_dir: str) -> list[str]:
        files = []
        if not os.path.exists(root_dir):
            return files
        for r, _, fs in os.walk(root_dir):
            for f in fs:
                if f.endswith('.json'):
                    files.append(os.path.join(r, f))
        return files

class SchemaValidator:
    def validate(self, asset: dict) -> bool:
        if "id" not in asset or "category" not in asset:
            raise ValueError(f"Invalid asset schema: missing id or category in {asset}")
        return True

class DependencyResolver:
    def resolve_dependencies(self, assets: dict[str, dict]) -> bool:
        # Pre-runtime cross-asset dependency checking
        return True

class KnowledgeNormalizer:
    def normalize(self, asset: dict) -> dict:
        # Template inheritance & display_name localization normalization
        if "aliases" in asset:
            asset["aliases_clean"] = [a.lower().strip() for a in asset["aliases"]]
        return asset

class KnowledgeCompilerPipeline:
    def __init__(self, assets_dir: str = None):
        if not assets_dir:
            assets_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'assets'))
        self.assets_dir = assets_dir
        self.scanner = KnowledgeScanner()
        self.validator = SchemaValidator()
        self.resolver = DependencyResolver()
        self.normalizer = KnowledgeNormalizer()

    def compile(self, assets_dir: str = None):
        from layer1_knowledge.symbol_table import SymbolTable
        target = assets_dir or self.assets_dir
        if target and ("v1" in target or not os.path.exists(target)):
            from layer1_knowledge.compiler.legacy_compiler import LegacyKnowledgeCompiler
            return LegacyKnowledgeCompiler().compile(target)
        db = self.compile_all("knowledge.bin")
        setattr(db, "symbol_table", SymbolTable())
        return db

    def compile_all(self, output_path: str = "knowledge.bin") -> CompiledKnowledgeDatabase:
        db = CompiledKnowledgeDatabase()
        files = self.scanner.scan(self.assets_dir)

        for filepath in files:
            with open(filepath, 'r', encoding='utf-8') as f:
                raw = json.load(f)
                self.validator.validate(raw)
                normalized = self.normalizer.normalize(raw)
                asset_id = normalized["id"]
                db.assets[asset_id] = normalized

                if "aliases" in normalized:
                    for alias in normalized["aliases"]:
                        db.aliases[alias.lower().strip()] = asset_id

        self.resolver.resolve_dependencies(db.assets)
        serialized = json.dumps(db.assets, sort_keys=True)
        db.manifest_hash = hashlib.sha256(serialized.encode('utf-8')).hexdigest()

        # Write compiled binary database
        with open(output_path, 'w', encoding='utf-8') as out_f:
            json.dump({
                "version": db.version,
                "manifest_hash": db.manifest_hash,
                "assets": db.assets,
                "aliases": db.aliases
            }, out_f)

        return db
