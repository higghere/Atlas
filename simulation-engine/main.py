"""
Human Atlas — Pathophysiology & Trauma Simulation Engine (v12)
Master Entry Point & Production Verification Suite Runner.
"""
import unittest
import os
import sys

def run_all_tests():
    print("=" * 70)
    print("HUMAN ATLAS — PATHOPHYSIOLOGY & TRAUMA SIMULATION ENGINE (v12)")
    print("Executing Master Verification Suite across all 12 Phases...")
    print("=" * 70)

    loader = unittest.TestLoader()
    suite = loader.discover(start_dir='tests', pattern='test_*.py')
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)

    print("\n" + "=" * 70)
    if result.wasSuccessful():
        print("ALL VERIFICATION SUITES PASSED! Simulation Engine v12 is 100% Operational.")
    else:
        print(f"VERIFICATION FAILURE: {len(result.failures)} failures, {len(result.errors)} errors.")
    print("=" * 70)

    return result.wasSuccessful()

if __name__ == '__main__':
    success = run_all_tests()
    sys.exit(0 if success else 1)
