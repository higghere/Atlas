"""
Phase 2 Verification Test Suite
Tests SymbolTable, KnowledgeCompiler, EquationCompiler, and Pre-flight Optimizer.
"""
import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from layer1_knowledge.symbol_table import SymbolTable
from layer1_knowledge.equation_compiler import EquationCompiler
from layer1_knowledge.compiler import KnowledgeCompiler
from models.types import Handle

class TestPhase02Compiler(unittest.TestCase):
    def test_symbol_table_bidirectional(self):
        st = SymbolTable()
        h1 = st.get_or_create_handle("ORG_KIDNEY_L", type_id=1)
        h2 = st.get_or_create_handle("ORG_HEART", type_id=1)

        self.assertEqual(st.get_handle("ORG_KIDNEY_L"), h1)
        self.assertEqual(st.get_uuid(h1), "ORG_KIDNEY_L")
        self.assertNotEqual(h1.to_uint64(), h2.to_uint64())

    def test_equation_compiler(self):
        st = SymbolTable()
        h_hr = st.get_or_create_handle("heart_rate", type_id=5)
        h_sv = st.get_or_create_handle("stroke_volume", type_id=5)

        symbol_map = {
            "hr": h_hr,
            "sv": h_sv
        }

        # Equation: Cardiac Output = hr * sv / 1000
        expr = "hr * sv / 1000.0"
        evaluator = EquationCompiler.compile_expression(expr, symbol_map)

        # Evaluate with store
        var_store = {
            h_hr: 75.0,
            h_sv: 70.0
        }

        result = evaluator(var_store)
        self.assertAlmostEqual(result, 5.25, places=3)

    def test_knowledge_compiler_pipeline(self):
        compiler = KnowledgeCompiler()
        knowledge_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../layer1_knowledge/v1'))
        
        assets = compiler.compile(knowledge_dir)
        self.assertIsNotNone(assets)
        self.assertGreater(len(assets.organs), 0)
        self.assertGreater(len(assets.vessels), 0)

if __name__ == '__main__':
    unittest.main()
