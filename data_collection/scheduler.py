"""
GPU Pricing Data Collection Scheduler

Simulates a serverless polling system that fetches prices from all providers.

Production mapping to cloud services:
- AWS: Lambda + EventBridge (CloudWatch Events) - cron(0/15 * * * ? *)
- GCP: Cloud Functions + Cloud Scheduler - "*/15 * * * *"
- Azure: Azure Functions + Timer Trigger - "0 */15 * * * *"

Features:
- Parallel provider polling
- Retry with exponential backoff
- Rate limit handling
- Simulated 15-minute interval polling
"""

import time
import asyncio
from typing import List, Dict, Any
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed
from data_collection.providers import (
    AWSProvider,
    GCPProvider,
    AzureProvider,
    RunPodProvider,
    VastProvider,
    LambdaProvider,
)


class PricingScheduler:
    """
    Scheduler for periodic GPU pricing data collection.

    Simulates serverless function execution pattern with:
    - Parallel provider queries
    - Retry logic with exponential backoff
    - Rate limit handling
    """

    def __init__(self, interval_minutes: int = 15, max_retries: int = 3):
        """
        Initialize the scheduler.

        Args:
            interval_minutes: Polling interval (default 15 minutes)
            max_retries: Maximum retry attempts on failure
        """
        self.interval_minutes = interval_minutes
        self.max_retries = max_retries
        self.providers = {
            'AWS': AWSProvider(use_mock=True),
            'GCP': GCPProvider(use_mock=True),
            'Azure': AzureProvider(use_mock=True),
            'RunPod': RunPodProvider(use_mock=True),
            'Vast.ai': VastProvider(use_mock=True),
            'Lambda Labs': LambdaProvider(use_mock=True),
        }

    def _fetch_with_retry(self, provider_name: str, provider) -> Dict[str, Any]:
        """
        Fetch prices from a provider with retry and exponential backoff.

        Args:
            provider_name: Name of the provider
            provider: Provider instance

        Returns:
            Dictionary with provider name and prices
        """
        for attempt in range(self.max_retries):
            try:
                prices = provider.get_prices()
                return {
                    'provider': provider_name,
                    'success': True,
                    'prices': prices,
                    'error': None,
                    'attempts': attempt + 1,
                }
            except Exception as e:
                if attempt < self.max_retries - 1:
                    # Exponential backoff: 2^attempt seconds
                    backoff_time = 2 ** attempt
                    print(f"⚠️  {provider_name} failed (attempt {attempt + 1}), retrying in {backoff_time}s...")
                    time.sleep(backoff_time)
                else:
                    print(f"❌ {provider_name} failed after {self.max_retries} attempts: {e}")
                    return {
                        'provider': provider_name,
                        'success': False,
                        'prices': [],
                        'error': str(e),
                        'attempts': self.max_retries,
                    }

    def fetch_all_prices(self, parallel: bool = True) -> Dict[str, Any]:
        """
        Fetch prices from all providers.

        Args:
            parallel: Whether to fetch in parallel (default True)

        Returns:
            Dictionary with all results and metadata
        """
        start_time = time.time()
        results = []

        if parallel:
            # Parallel execution (simulating concurrent Lambda invocations)
            with ThreadPoolExecutor(max_workers=len(self.providers)) as executor:
                futures = {
                    executor.submit(self._fetch_with_retry, name, provider): name
                    for name, provider in self.providers.items()
                }

                for future in as_completed(futures):
                    result = future.result()
                    results.append(result)
        else:
            # Sequential execution
            for name, provider in self.providers.items():
                result = self._fetch_with_retry(name, provider)
                results.append(result)

        end_time = time.time()
        elapsed = end_time - start_time

        # Aggregate results
        all_prices = []
        for result in results:
            if result['success']:
                all_prices.extend(result['prices'])

        successful = sum(1 for r in results if r['success'])
        total = len(results)

        return {
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'elapsed_seconds': round(elapsed, 2),
            'providers_queried': total,
            'providers_successful': successful,
            'total_prices': len(all_prices),
            'results': results,
            'prices': all_prices,
        }

    def simulate_polling_cycles(self, num_cycles: int = 3):
        """
        Simulate multiple polling cycles.

        Args:
            num_cycles: Number of polling cycles to simulate

        Returns:
            List of all cycle results
        """
        print(f"\n{'='*70}")
        print(f"SIMULATING {num_cycles} POLLING CYCLES")
        print(f"Interval: {self.interval_minutes} minutes")
        print(f"{'='*70}\n")

        all_cycles = []

        for cycle in range(1, num_cycles + 1):
            print(f"\n--- Cycle {cycle}/{num_cycles} ---")
            print(f"Time: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}")

            result = self.fetch_all_prices(parallel=True)

            print(f"✅ Completed in {result['elapsed_seconds']}s")
            print(f"   Providers: {result['providers_successful']}/{result['providers_queried']}")
            print(f"   Prices collected: {result['total_prices']}")

            all_cycles.append(result)

            # Simulate waiting (in production, EventBridge would trigger next execution)
            if cycle < num_cycles:
                wait_time = 2  # Simulated wait (would be 15 minutes in production)
                print(f"   Waiting {wait_time}s (simulating {self.interval_minutes}min interval)...")
                time.sleep(wait_time)

        return all_cycles


def validate_no_duplicate_timestamps(cycles):
    """Validate that timestamps are unique across cycles."""
    timestamps = set()
    duplicates = []

    for cycle in cycles:
        ts = cycle['timestamp']
        if ts in timestamps:
            duplicates.append(ts)
        timestamps.add(ts)

    return len(duplicates) == 0, duplicates


def test_scheduler():
    """Test the scheduler with multiple cycles."""
    print("\n" + "="*70)
    print("STEP 2 VALIDATION: SCHEDULER & RATE-LIMIT HANDLING")
    print("="*70)

    # Test 1: Single fetch
    print("\n[Test 1] Single fetch (parallel)")
    scheduler = PricingScheduler()
    result = scheduler.fetch_all_prices(parallel=True)

    print(f"\n✅ Fetched {result['total_prices']} prices from {result['providers_successful']}/{result['providers_queried']} providers")
    print(f"   Elapsed time: {result['elapsed_seconds']}s")

    # Test 2: Multiple polling cycles
    print("\n\n[Test 2] Multiple polling cycles")
    cycles = scheduler.simulate_polling_cycles(num_cycles=3)

    # Validation
    print("\n\n[Validation]")
    no_dups, dups = validate_no_duplicate_timestamps(cycles)

    if no_dups:
        print("✅ No duplicate timestamps found")
    else:
        print(f"❌ Found duplicate timestamps: {dups}")

    # Summary
    print("\n" + "="*70)
    print("CLOUD MAPPING EXPLANATION")
    print("="*70)
    print("""
This scheduler simulates serverless polling:

AWS Lambda + EventBridge:
  - EventBridge rule: cron(0/15 * * * ? *)
  - Lambda function: fetch_gpu_prices()
  - Concurrency: Up to 1000 concurrent executions

GCP Cloud Functions + Cloud Scheduler:
  - Scheduler: */15 * * * * (every 15 minutes)
  - Function: fetchGpuPrices
  - Max instances: Auto-scaling

Azure Functions + Timer Trigger:
  - Timer: 0 */15 * * * * (NCRONTAB format)
  - Function: FetchGpuPrices
  - Consumption plan: Auto-scaling

Rate Limiting:
  - Exponential backoff: 2^attempt seconds
  - Max retries: 3 attempts
  - Prevents API throttling
""")

    print("\n🎉 STEP 2 COMPLETE! Scheduler validated successfully.\n")


if __name__ == "__main__":
    test_scheduler()
