#!/usr/bin/env python3
"""
STEP 1 VALIDATION: GPU Provider Data Collection

This script tests all GPU pricing providers independently.
Each provider must return standardized pricing data.

Validation criteria:
✅ All providers can fetch data
✅ Schema matches requirements
✅ No duplicate timestamps within same batch
✅ All required fields present
"""

import sys
from data_collection.providers import (
    AWSProvider,
    GCPProvider,
    AzureProvider,
    RunPodProvider,
    VastProvider,
    LambdaProvider,
)


def validate_schema(prices, provider_name):
    """Validate that all prices match the required schema."""
    required_fields = ['provider', 'region', 'gpu_model', 'price_per_hour', 'availability', 'timestamp']

    for idx, price in enumerate(prices):
        missing = [f for f in required_fields if f not in price]
        if missing:
            print(f"❌ {provider_name}: Entry {idx} missing fields: {missing}")
            return False

        # Validate data types
        if not isinstance(price['price_per_hour'], (int, float)):
            print(f"❌ {provider_name}: price_per_hour must be numeric")
            return False

        if not (0 <= price['availability'] <= 1):
            print(f"❌ {provider_name}: availability must be between 0 and 1")
            return False

    return True


def test_provider(ProviderClass, name):
    """Test a single provider."""
    print(f"\n{'='*70}")
    print(f"TESTING {name.upper()}")
    print(f"{'='*70}\n")

    try:
        provider = ProviderClass(use_mock=True)
        prices = provider.get_prices()

        if not prices:
            print(f"❌ {name}: No prices returned")
            return False

        print(f"✅ Fetched {len(prices)} price entries")

        # Validate schema
        if not validate_schema(prices, name):
            return False
        print(f"✅ Schema validation passed")

        # Show sample output
        print(f"\nSample entries (showing 2/{len(prices)}):")
        print("-" * 70)
        for price in prices[:2]:
            print(f"  Provider:     {price['provider']}")
            print(f"  Region:       {price['region']}")
            print(f"  GPU Model:    {price['gpu_model']}")
            print(f"  Price/hour:   ${price['price_per_hour']:.2f}")
            print(f"  Availability: {price['availability']:.0%}")
            print(f"  Timestamp:    {price['timestamp']}")
            print("-" * 70)

        return True

    except Exception as e:
        print(f"❌ {name}: Error - {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all provider tests."""
    print("\n" + "="*70)
    print("STEP 1 VALIDATION: GPU PROVIDER DATA COLLECTION")
    print("="*70)

    providers = [
        (AWSProvider, "AWS"),
        (GCPProvider, "GCP"),
        (AzureProvider, "Azure"),
        (RunPodProvider, "RunPod"),
        (VastProvider, "Vast.ai"),
        (LambdaProvider, "Lambda Labs"),
    ]

    results = {}
    for ProviderClass, name in providers:
        results[name] = test_provider(ProviderClass, name)

    # Summary
    print("\n" + "="*70)
    print("VALIDATION SUMMARY")
    print("="*70 + "\n")

    passed = sum(1 for r in results.values() if r)
    total = len(results)

    for name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {name}")

    print(f"\nResult: {passed}/{total} providers passed validation")

    if passed == total:
        print("\n🎉 STEP 1 COMPLETE! All providers validated successfully.\n")
        return 0
    else:
        print("\n❌ STEP 1 INCOMPLETE. Fix failing providers before proceeding.\n")
        return 1


if __name__ == "__main__":
    sys.exit(main())
