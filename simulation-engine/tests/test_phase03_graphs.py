"""
Phase 3 Verification Test Suite
Tests Immutable Anatomy, Vascular, Neural, and Lymphatic Graph loading.
"""
import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from layer1_knowledge.compiler import KnowledgeCompiler

class TestPhase03Graphs(unittest.TestCase):
    def test_immutable_graph_loading(self):
        compiler = KnowledgeCompiler()
        knowledge_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../layer1_knowledge/v1'))
        
        assets = compiler.compile(knowledge_dir)
        
        # Verify SymbolTable assigned Handles to all nodes
        self.assertIsNotNone(assets.symbol_table.get_handle("VES_AORTA"))
        self.assertIsNotNone(assets.symbol_table.get_handle("NRV_BRAIN"))
        self.assertIsNotNone(assets.symbol_table.get_handle("LMY_THORACIC_DUCT"))
        self.assertIsNotNone(assets.symbol_table.get_handle("SYS_CARDIOVASCULAR"))

if __name__ == '__main__':
    unittest.main()
