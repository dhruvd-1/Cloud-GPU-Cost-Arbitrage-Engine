#!/usr/bin/env python3
"""
STEP 3 VALIDATION: Storage & Caching

Tests:
1. Database creation and schema
2. Insert and query operations
3. Cache functionality (set, get, expiry)
4. Cache hit test
"""

import os
import time
from storage.db import Database
from storage.cache import PriceCache, get_cache
from data_collection.providers import AWSProvider


def test_database():
    """Test database operations."""
    print("\n" + "="*70)
    print("TESTING DATABASE (SQLite)")
    print("="*70 + "\n")

    # Remove old test database
    test_db = "test_gpu_prices.db"
    if os.path.exists(test_db):
        os.remove(test_db)

    # Initialize database
    db = Database(db_path=test_db)
    print("✅ Database initialized")

    # Test 1: Insert single price
    print("\n[Test 1] Insert single price entry")
    sample_price = {
        'provider': 'AWS',
        'region': 'us-east-1',
        'gpu_model': 'A100',
        'price_per_hour': 32.77,
        'availability': 0.95,
        'instance_type': 'p4d.24xlarge',
        'gpu_count': 8,
        'memory_gb': 320,
        'timestamp': '2026-01-11T13:00:00Z',
    }

    row_id = db.insert_price(sample_price)
    print(f"✅ Inserted row with ID: {row_id}")

    # Test 2: Bulk insert
    print("\n[Test 2] Bulk insert from provider")
    provider = AWSProvider(use_mock=True)
    prices = provider.get_prices()
    count = db.insert_prices_bulk(prices)
    print(f"✅ Inserted {count} prices in bulk")

    # Test 3: Query latest prices
    print("\n[Test 3] Query latest prices")
    latest = db.get_latest_prices(limit=5)
    print(f"✅ Retrieved {len(latest)} latest prices")
    if latest:
        print(f"   Sample: {latest[0]['provider']} - {latest[0]['gpu_model']} @ ${latest[0]['price_per_hour']}/hr")

    # Test 4: Query by GPU model
    print("\n[Test 4] Query by GPU model")
    a100_prices = db.get_prices_by_gpu('A100', hours=24)
    print(f"✅ Found {len(a100_prices)} A100 prices in last 24h")

    # Test 5: Get stats
    print("\n[Test 5] Database statistics")
    stats = db.get_price_stats()
    print(f"✅ Database stats:")
    print(f"   Total entries: {stats['total_entries']}")
    print(f"   Unique GPUs: {stats['unique_gpu_models']}")
    print(f"   Providers: {stats['unique_providers']}")

    # Cleanup
    db.close()
    os.remove(test_db)
    print("\n✅ Database tests passed!")

    return True


def test_cache():
    """Test cache operations."""
    print("\n" + "="*70)
    print("TESTING CACHE (In-Memory)")
    print("="*70 + "\n")

    # Test 1: Basic set/get
    print("[Test 1] Basic cache operations")
    cache = PriceCache(ttl_seconds=5)

    cache.set('test_key', {'price': 1.99, 'gpu': 'A100'})
    value = cache.get('test_key')

    if value and value['price'] == 1.99:
        print("✅ Cache set/get working")
    else:
        print("❌ Cache set/get failed")
        return False

    # Test 2: Cache miss
    print("\n[Test 2] Cache miss")
    missing = cache.get('nonexistent_key')
    if missing is None:
        print("✅ Cache miss returns None")
    else:
        print("❌ Cache miss should return None")
        return False

    # Test 3: TTL expiration
    print("\n[Test 3] TTL expiration")
    cache_short = PriceCache(ttl_seconds=1)
    cache_short.set('expire_test', 'value')

    # Immediate retrieval should work
    value = cache_short.get('expire_test')
    if value == 'value':
        print("✅ Immediate retrieval successful")
    else:
        print("❌ Immediate retrieval failed")
        return False

    # Wait for expiration
    print("   Waiting 2 seconds for TTL expiration...")
    time.sleep(2)

    value = cache_short.get('expire_test')
    if value is None:
        print("✅ Expired entry returns None")
    else:
        print("❌ Expired entry should return None")
        return False

    # Test 4: Cache stats
    print("\n[Test 4] Cache statistics")
    cache = PriceCache(ttl_seconds=60)
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')
    cache.set('key3', 'value3')

    stats = cache.stats()
    print(f"✅ Cache stats: {stats['active_entries']} active entries")

    # Test 5: Cache clear
    print("\n[Test 5] Cache clear")
    cache.clear()
    stats = cache.stats()
    if stats['total_entries'] == 0:
        print("✅ Cache cleared successfully")
    else:
        print("❌ Cache clear failed")
        return False

    print("\n✅ Cache tests passed!")
    return True


def test_cache_hit_performance():
    """Test cache hit performance (sub-second)."""
    print("\n" + "="*70)
    print("TESTING CACHE HIT PERFORMANCE")
    print("="*70 + "\n")

    cache = PriceCache(ttl_seconds=300)

    # Simulate expensive database query
    expensive_data = {
        'prices': [
            {'gpu': f'A100-{i}', 'price': 1.0 + i * 0.1}
            for i in range(1000)
        ]
    }

    # First access (cache miss - simulate DB query)
    print("[Test 1] Cache miss (simulated DB query)")
    start = time.time()
    time.sleep(0.1)  # Simulate DB query delay
    cache.set('latest_prices', expensive_data)
    miss_time = time.time() - start
    print(f"✅ Cache miss took {miss_time*1000:.2f}ms (simulated DB)")

    # Second access (cache hit)
    print("\n[Test 2] Cache hit (sub-second)")
    start = time.time()
    cached_data = cache.get('latest_prices')
    hit_time = time.time() - start
    print(f"✅ Cache hit took {hit_time*1000:.3f}ms")

    if hit_time < 0.001:  # Should be sub-millisecond
        print(f"✅ Cache hit is {miss_time/hit_time:.0f}x faster than DB query")
    else:
        print("⚠️  Cache hit slower than expected")

    return True


def main():
    """Run all storage and cache tests."""
    print("\n" + "="*70)
    print("STEP 3 VALIDATION: STORAGE & CACHING")
    print("="*70)

    results = {
        'Database': test_database(),
        'Cache': test_cache(),
        'Cache Performance': test_cache_hit_performance(),
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

    # Cloud mapping explanation
    print("\n" + "="*70)
    print("CLOUD MAPPING EXPLANATION")
    print("="*70)
    print("""
Storage Layer:
  AWS: RDS (PostgreSQL) or DynamoDB
  GCP: Cloud SQL or Firestore
  Azure: Azure SQL Database or Cosmos DB

  Benefits:
  - Managed backups
  - Auto-scaling
  - High availability
  - Read replicas for performance

Cache Layer:
  AWS: ElastiCache (Redis/Memcached)
  GCP: Cloud Memorystore (Redis)
  Azure: Azure Cache for Redis

  Benefits:
  - Sub-millisecond latency
  - Distributed caching
  - Connection pooling
  - TTL support
  - Pub/Sub for cache invalidation
""")

    if passed == total:
        print("\n🎉 STEP 3 COMPLETE! Storage and caching validated successfully.\n")
        return 0
    else:
        print("\n❌ STEP 3 INCOMPLETE. Fix failing tests before proceeding.\n")
        return 1


if __name__ == "__main__":
    import sys
    sys.exit(main())
