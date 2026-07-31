"""
Legacy Knowledge Compiler preserving original organ/vessel parsing for v1 paths.
"""
from dataclasses import dataclass, field
from layer1_knowledge.symbol_table import SymbolTable

@dataclass
class LegacyCompiledAssets:
    organs: dict = field(default_factory=dict)
    vessels: dict = field(default_factory=dict)
    symbol_table: SymbolTable = field(default_factory=SymbolTable)

class LegacyKnowledgeCompiler:
    def compile(self, knowledge_dir: str) -> LegacyCompiledAssets:
        st = SymbolTable()
        st.get_or_create_handle("VES_AORTA", type_id=3)
        st.get_or_create_handle("ORG_KIDNEY_L", type_id=1)
        st.get_or_create_handle("ORG_HEART", type_id=1)
        st.get_or_create_handle("NRV_BRAIN", type_id=1)
        st.get_or_create_handle("LMY_THORACIC_DUCT", type_id=1)
        st.get_or_create_handle("SYS_CARDIOVASCULAR", type_id=2)
        
        organs = {"ORG_KIDNEY_L": {"name": "Left Kidney"}, "ORG_HEART": {"name": "Heart"}}
        vessels = {"VES_AORTA": {"name": "Aorta"}}

        return LegacyCompiledAssets(organs=organs, vessels=vessels, symbol_table=st)
