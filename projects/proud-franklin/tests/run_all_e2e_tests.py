#!/usr/bin/env python3
"""
Master E2E Test Suite Runner for Arcana Antiqua
Executes all 4-tier test suites (Tiers 1-4) covering Features 1-14.
Returns exit code 0 on full success, 1 on failure.
"""

import os
import sys
import time
import unittest

WORKSPACE_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
TESTS_ROOT = os.path.join(WORKSPACE_ROOT, "tests")

if WORKSPACE_ROOT not in sys.path:
    sys.path.insert(0, WORKSPACE_ROOT)

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

TIERS = [
    ("Tier 1: Feature Coverage (F01-F14)", os.path.join(TESTS_ROOT, "tier1_feature_coverage")),
    ("Tier 2: Boundary & Corner Cases", os.path.join(TESTS_ROOT, "tier2_boundary_corner")),
    ("Tier 3: Cross-Feature Pairwise Integration", os.path.join(TESTS_ROOT, "tier3_cross_feature")),
    ("Tier 4: Real-World System Workload", os.path.join(TESTS_ROOT, "tier4_real_world")),
]

def run_all_tiers():
    start_time = time.time()
    loader = unittest.TestLoader()
    
    print("=" * 80)
    print("  ARCANA ANTIQUA — MASTER E2E TEST SUITE RUNNER")
    print("  4-Tier Architecture Verification (Tiers 1-4, Features 1-14)")
    print("=" * 80)
    print(f"Workspace: {WORKSPACE_ROOT}")
    print(f"Tests Dir: {TESTS_ROOT}\n")

    tier_results = []
    grand_total_tests = 0
    grand_total_failures = 0
    grand_total_errors = 0

    for tier_name, tier_dir in TIERS:
        print(f"\n▶ Executing {tier_name}...")
        print("-" * 80)
        
        if not os.path.exists(tier_dir):
            print(f"  [ERROR] Directory not found: {tier_dir}")
            tier_results.append((tier_name, 0, 0, 1, 0.0))
            grand_total_errors += 1
            continue

        suite = loader.discover(tier_dir, pattern="test_*.py")
        num_tests = suite.countTestCases()
        
        t0 = time.time()
        runner = unittest.TextTestRunner(verbosity=2)
        res = runner.run(suite)
        elapsed = time.time() - t0

        failures = len(res.failures)
        errors = len(res.errors)
        passed = num_tests - failures - errors

        tier_results.append((tier_name, num_tests, passed, failures + errors, elapsed))
        grand_total_tests += num_tests
        grand_total_failures += failures
        grand_total_errors += errors

    total_elapsed = time.time() - start_time

    # Summary Report
    print("\n" + "=" * 80)
    print("  E2E TEST EXECUTION SUMMARY REPORT")
    print("=" * 80)
    print(f"{'Tier Name':<48} | {'Total':<6} | {'Pass':<6} | {'Fail':<6} | {'Time (s)':<8}")
    print("-" * 80)

    for name, total, passed, failed, elapsed in tier_results:
        status_flag = "✓" if failed == 0 else "✗"
        print(f"{status_flag} {name:<46} | {total:<6} | {passed:<6} | {failed:<6} | {elapsed:.2f}s")

    print("-" * 80)
    grand_passed = grand_total_tests - grand_total_failures - grand_total_errors
    print(f"  TOTALS: {grand_total_tests} Tests Run | {grand_passed} Passed | {grand_total_failures + grand_total_errors} Failed | {total_elapsed:.2f}s Total")
    print("=" * 80)

    if grand_total_failures + grand_total_errors == 0 and grand_total_tests > 0:
        print("\n🎉 ALL E2E TEST SUITES PASSED FLAWLESSLY! (Exit 0)\n")
        return 0
    else:
        print(f"\n❌ TEST SUITE FAILURES DETECTED: {grand_total_failures} failures, {grand_total_errors} errors. (Exit 1)\n")
        return 1

if __name__ == "__main__":
    exit_code = run_all_tiers()
    sys.exit(exit_code)
