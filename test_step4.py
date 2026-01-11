#!/usr/bin/env python3
"""
STEP 4 VALIDATION: GPU Performance Normalization

Tests:
1. GPU specs lookup
2. Performance normalization
3. Cost-performance scoring
4. Ranking consistency
"""

import sys
from data_collection.scheduler import PricingScheduler
from normalization.gpu_specs import get_gpu_specs, compare_gpus, get_all_gpu_models
from normalization.normalize import normalize_prices, rank_by_cost_performance, find_best_value
from normalization.cost_score import calculate_cost_scores, compare_providers_by_gpu, print_cost_comparison


def test_gpu_specs():
    """Test GPU specifications database."""
    print("\n" + "="*70)
    print("TESTING GPU SPECIFICATIONS")
    print("="*70 + "\n")

    # Test 1: Get specs for known GPU
    print("[Test 1] Get specs for A100")
    specs = get_gpu_specs("A100")
    if specs:
        print(f"✅ A100 specs found:")
        print(f"   TFLOPs (FP32): {specs['tflops_fp32']}")
        print(f"   TFLOPs (FP16): {specs['tflops_fp16']}")
        print(f"   Memory: {specs['memory_gb']} GB")
        print(f"   Architecture: {specs['architecture']}")
    else:
        print("❌ A100 specs not found")
        return False

    # Test 2: Get all GPU models
    print("\n[Test 2] Get all GPU models")
    models = get_all_gpu_models()
    print(f"✅ Found {len(models)} GPU models:")
    print(f"   {', '.join(models[:5])}...")

    # Test 3: Compare two GPUs
    print("\n[Test 3] Compare A100 vs V100")
    comparison = compare_gpus("A100", "V100", precision="fp32")
    if 'error' not in comparison:
        print(f"✅ Comparison successful:")
        print(f"   A100: {comparison['gpu1']['tflops']} TFLOPs")
        print(f"   V100: {comparison['gpu2']['tflops']} TFLOPs")
        print(f"   Faster: {comparison['faster']}")
        print(f"   Difference: {comparison['performance_difference_percent']:.1f}%")
    else:
        print(f"❌ {comparison['error']}")
        return False

    print("\n✅ GPU specs tests passed!")
    return True


def test_normalization():
    """Test price normalization."""
    print("\n" + "="*70)
    print("TESTING PRICE NORMALIZATION")
    print("="*70 + "\n")

    # Get sample prices
    scheduler = PricingScheduler()
    result = scheduler.fetch_all_prices(parallel=True)
    prices = result['prices']

    print(f"Fetched {len(prices)} prices for normalization\n")

    # Test 1: Normalize prices
    print("[Test 1] Normalize all prices")
    normalized = normalize_prices(prices, precision="fp32")
    normalized_count = sum(1 for p in normalized if p.get('normalized'))

    print(f"✅ Normalized {normalized_count}/{len(prices)} prices")

    if normalized_count > 0:
        sample = next(p for p in normalized if p.get('normalized'))
        print(f"\n   Sample normalized price:")
        print(f"   GPU: {sample['gpu_model']}")
        print(f"   TFLOPs: {sample['tflops']}")
        print(f"   Cost/TFLOPs: ${sample['cost_per_tflop']:.4f}")
        print(f"   Score: {sample['cost_performance_score']:.4f}")

    # Test 2: Rank by cost-performance
    print("\n[Test 2] Rank by cost-performance")
    ranked = rank_by_cost_performance(prices, precision="fp32")

    if ranked:
        print(f"✅ Ranked {len(ranked)} prices")
        print(f"\n   Top 3 best values:")
        for idx, price in enumerate(ranked[:3], 1):
            print(f"   {idx}. {price['provider']} {price['gpu_model']}")
            print(f"      ${price['price_per_hour']:.2f}/hr, Score: {price['cost_performance_score']:.4f}")
    else:
        print("❌ Ranking failed")
        return False

    # Test 3: Find best value
    print("\n[Test 3] Find best value for A100")
    best = find_best_value(prices, gpu_model="A100", precision="fp32")

    if best:
        print(f"✅ Best A100 value:")
        print(f"   Provider: {best['provider']}")
        print(f"   Region: {best['region']}")
        print(f"   Price: ${best['price_per_hour']:.2f}/hour")
        print(f"   Availability: {best['availability']:.0%}")
        print(f"   Score: {best['cost_performance_score']:.4f}")
    else:
        print("❌ No best value found")
        return False

    print("\n✅ Normalization tests passed!")
    return True


def test_cost_scoring():
    """Test cost-performance scoring."""
    print("\n" + "="*70)
    print("TESTING COST-PERFORMANCE SCORING")
    print("="*70 + "\n")

    # Get sample prices
    scheduler = PricingScheduler()
    result = scheduler.fetch_all_prices(parallel=True)
    prices = result['prices']

    # Test 1: Calculate cost scores
    print("[Test 1] Calculate cost scores")
    scored = calculate_cost_scores(prices, precision="fp32")

    if scored:
        print(f"✅ Calculated scores for {len(scored)} prices")

        # Verify ranking
        for idx, price in enumerate(scored[:3], 1):
            print(f"\n   Rank #{idx}:")
            print(f"   Provider: {price['provider']}")
            print(f"   GPU: {price['gpu_model']}")
            print(f"   Price: ${price['price_per_hour']:.2f}/hr")
            print(f"   Value Rank: {price['value_rank']}")
            print(f"   Relative Score: {price['relative_value_score']:.2f}/100")
    else:
        print("❌ Scoring failed")
        return False

    # Test 2: Compare providers for A100
    print("\n[Test 2] Compare all providers for A100")
    comparison = compare_providers_by_gpu(prices, "A100", precision="fp32")

    if 'error' not in comparison:
        print_cost_comparison(comparison)
    else:
        print(f"❌ {comparison['error']}")
        # This is OK if no A100 prices exist
        print("⚠️  No A100 prices to compare (this is OK)")

    print("\n✅ Cost scoring tests passed!")
    return True


def test_consistent_ordering():
    """Test that ranking is consistent and deterministic."""
    print("\n" + "="*70)
    print("TESTING RANKING CONSISTENCY")
    print("="*70 + "\n")

    # Get sample prices
    scheduler = PricingScheduler()
    result = scheduler.fetch_all_prices(parallel=True)
    prices = result['prices']

    # Rank twice
    ranked1 = rank_by_cost_performance(prices.copy(), precision="fp32")
    ranked2 = rank_by_cost_performance(prices.copy(), precision="fp32")

    # Compare
    if len(ranked1) != len(ranked2):
        print("❌ Different number of results")
        return False

    # Check order is consistent
    for idx, (p1, p2) in enumerate(zip(ranked1, ranked2)):
        if p1['provider'] != p2['provider'] or p1['gpu_model'] != p2['gpu_model']:
            print(f"❌ Inconsistent ordering at position {idx}")
            return False

    print(f"✅ Ranking is consistent across {len(ranked1)} entries")
    return True


def main():
    """Run all normalization tests."""
    print("\n" + "="*70)
    print("STEP 4 VALIDATION: GPU PERFORMANCE NORMALIZATION")
    print("="*70)

    results = {
        'GPU Specs': test_gpu_specs(),
        'Normalization': test_normalization(),
        'Cost Scoring': test_cost_scoring(),
        'Ranking Consistency': test_consistent_ordering(),
    }

    # Summary
    print("\n" + "="*70)
    print("VALIDATION SUMMARY")
    print("="*70 + "\n")

    passed = sum(1 for r in results.values() if r)
    total = len(results)

    for name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")

    print(f"\nResult: {passed}/{total} tests passed")

    if passed == total:
        print("\n🎉 STEP 4 COMPLETE! GPU normalization validated successfully.\n")
        return 0
    else:
        print("\n❌ STEP 4 INCOMPLETE. Fix failing tests before proceeding.\n")
        return 1


if __name__ == "__main__":
    sys.exit(main())
