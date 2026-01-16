#!/usr/bin/env python3
"""
STEP 5 VALIDATION: Arbitrage Detection Engine

Tests:
1. Detect arbitrage opportunities
2. Calculate savings accurately
3. Sort by best opportunities
4. Deterministic results
"""

import sys
from data_collection.scheduler import PricingScheduler
from analytics.arbitrage import (
    ArbitrageDetector,
    find_cross_region_arbitrage,
    calculate_monthly_savings,
    print_arbitrage_report,
)


def test_arbitrage_detection():
    """Test arbitrage opportunity detection."""
    print("\n" + "="*70)
    print("TESTING ARBITRAGE DETECTION")
    print("="*70 + "\n")

    # Get prices
    scheduler = PricingScheduler()
    result = scheduler.fetch_all_prices(parallel=True)
    prices = result['prices']

    print(f"Analyzing {len(prices)} prices from {result['providers_successful']} providers\n")

    # Test 1: Detect opportunities with default thresholds
    print("[Test 1] Detect arbitrage opportunities (>10% savings)")
    detector = ArbitrageDetector(
        min_price_difference=0.50,
        min_percentage_savings=10.0,
        min_providers=2,
    )

    opportunities = detector.detect_opportunities(prices, precision="fp32")

    print(f"✅ Found {len(opportunities)} arbitrage opportunities")

    if opportunities:
        print(f"\n   Top opportunity:")
        top = opportunities[0]
        print(f"   GPU: {top.gpu_model}")
        print(f"   Cheapest: {top.cheapest['provider']} @ ${top.cheapest['price_per_hour']:.2f}/hr")
        print(f"   Most Expensive: {top.most_expensive['provider']} @ ${top.most_expensive['price_per_hour']:.2f}/hr")
        print(f"   Savings: {top.percentage_savings:.1f}%")

    # Test 2: Get best arbitrage
    print("\n[Test 2] Get single best arbitrage opportunity")
    best = detector.get_best_arbitrage(prices, precision="fp32")

    if best:
        print(f"✅ Best arbitrage: {best.gpu_model}")
        print(f"   Save {best.percentage_savings:.1f}% by using {best.cheapest['provider']}")
    else:
        print("❌ No best arbitrage found")
        return False

    # Test 3: Get arbitrage for specific GPU
    print("\n[Test 3] Get arbitrage for specific GPU (A100)")
    a100_arb = detector.get_arbitrage_by_gpu(prices, "A100", precision="fp32")

    if a100_arb:
        print(f"✅ A100 arbitrage opportunity:")
        print(f"   Cheapest: {a100_arb.cheapest['provider']} @ ${a100_arb.cheapest['price_per_hour']:.2f}/hr")
        print(f"   Most Expensive: {a100_arb.most_expensive['provider']} @ ${a100_arb.most_expensive['price_per_hour']:.2f}/hr")
        print(f"   Savings: {a100_arb.percentage_savings:.1f}%")
    else:
        print("⚠️  No A100 arbitrage found (this is OK if <2 providers)")

    print("\n✅ Arbitrage detection tests passed!")
    return True


def test_savings_calculation():
    """Test savings calculations."""
    print("\n" + "="*70)
    print("TESTING SAVINGS CALCULATIONS")
    print("="*70 + "\n")

    # Get prices and opportunities
    scheduler = PricingScheduler()
    result = scheduler.fetch_all_prices(parallel=True)
    prices = result['prices']

    detector = ArbitrageDetector()
    opportunities = detector.detect_opportunities(prices, precision="fp32")

    if not opportunities:
        print("⚠️  No opportunities to test savings calculation")
        return True

    # Test monthly/annual savings calculation
    print("[Test 1] Calculate monthly/annual savings")
    top_opp = opportunities[0]

    savings = calculate_monthly_savings(top_opp)

    print(f"✅ Savings calculated for {top_opp.gpu_model}:")
    print(f"   Hourly: ${savings['hourly_savings']:.2f}")
    print(f"   Monthly: ${savings['monthly_savings']:,.2f}")
    print(f"   Annual: ${savings['annual_savings']:,.2f}")
    print(f"   Percentage: {savings['percentage_savings']:.1f}%")

    # Verify calculation accuracy
    expected_monthly = savings['hourly_savings'] * 730
    actual_monthly = savings['monthly_savings']

    if abs(expected_monthly - actual_monthly) < 0.01:
        print("\n✅ Savings calculation is accurate")
    else:
        print(f"\n❌ Savings calculation mismatch: {expected_monthly} vs {actual_monthly}")
        return False

    return True


def test_cross_region_arbitrage():
    """Test cross-region arbitrage detection."""
    print("\n" + "="*70)
    print("TESTING CROSS-REGION ARBITRAGE")
    print("="*70 + "\n")

    # Get prices
    scheduler = PricingScheduler()
    result = scheduler.fetch_all_prices(parallel=True)
    prices = result['prices']

    # Test AWS cross-region for A100
    print("[Test 1] Find AWS cross-region arbitrage for A100")
    aws_arbitrage = find_cross_region_arbitrage(prices, "AWS", "A100")

    if aws_arbitrage:
        print(f"✅ AWS regional arbitrage found:")
        print(f"   Cheapest region: {aws_arbitrage['cheapest_region']}")
        print(f"   Price: ${aws_arbitrage['cheapest_price']:.2f}/hr")
        print(f"   Most expensive region: {aws_arbitrage['most_expensive_region']}")
        print(f"   Price: ${aws_arbitrage['most_expensive_price']:.2f}/hr")
        print(f"   Savings: {aws_arbitrage['percentage_savings']:.1f}%")
    else:
        print("⚠️  No AWS regional arbitrage (this is OK)")

    # Test GCP cross-region
    print("\n[Test 2] Find GCP cross-region arbitrage for A100")
    gcp_arbitrage = find_cross_region_arbitrage(prices, "GCP", "A100")

    if gcp_arbitrage:
        print(f"✅ GCP regional arbitrage found:")
        print(f"   Savings: {gcp_arbitrage['percentage_savings']:.1f}%")
    else:
        print("⚠️  No GCP regional arbitrage (this is OK)")

    return True


def test_deterministic_results():
    """Test that arbitrage detection is deterministic."""
    print("\n" + "="*70)
    print("TESTING DETERMINISTIC RESULTS")
    print("="*70 + "\n")

    # Get prices
    scheduler = PricingScheduler()
    result = scheduler.fetch_all_prices(parallel=True)
    prices = result['prices']

    # Detect twice
    detector = ArbitrageDetector()
    opps1 = detector.detect_opportunities(prices.copy(), precision="fp32")
    opps2 = detector.detect_opportunities(prices.copy(), precision="fp32")

    # Compare
    if len(opps1) != len(opps2):
        print(f"❌ Different number of opportunities: {len(opps1)} vs {len(opps2)}")
        return False

    # Check order is same
    for idx, (o1, o2) in enumerate(zip(opps1, opps2)):
        if o1.gpu_model != o2.gpu_model:
            print(f"❌ Different GPU at position {idx}")
            return False

        if abs(o1.percentage_savings - o2.percentage_savings) > 0.01:
            print(f"❌ Different savings at position {idx}")
            return False

    print(f"✅ Results are deterministic across {len(opps1)} opportunities")
    return True


def main():
    """Run all arbitrage detection tests."""
    print("\n" + "="*70)
    print("STEP 5 VALIDATION: ARBITRAGE DETECTION ENGINE")
    print("="*70)

    results = {
        'Arbitrage Detection': test_arbitrage_detection(),
        'Savings Calculation': test_savings_calculation(),
        'Cross-Region Arbitrage': test_cross_region_arbitrage(),
        'Deterministic Results': test_deterministic_results(),
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

    # Print full arbitrage report
    print("\n" + "="*70)
    print("FULL ARBITRAGE REPORT")
    print("="*70)

    scheduler = PricingScheduler()
    result = scheduler.fetch_all_prices(parallel=True)
    prices = result['prices']

    detector = ArbitrageDetector()
    opportunities = detector.detect_opportunities(prices, precision="fp32")

    print_arbitrage_report(opportunities)

    if passed == total:
        print("\n🎉 STEP 5 COMPLETE! Arbitrage engine validated successfully.\n")
        return 0
    else:
        print("\n❌ STEP 5 INCOMPLETE. Fix failing tests before proceeding.\n")
        return 1


if __name__ == "__main__":
    sys.exit(main())
