"""
In-memory caching for GPU pricing data.

Production mapping:
- AWS: ElastiCache (Redis/Memcached)
- GCP: Cloud Memorystore (Redis)
- Azure: Azure Cache for Redis

For this project: Simple in-memory cache with TTL
"""

import time
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import threading


class PriceCache:
    """
    Simple in-memory cache for GPU prices with TTL support.

    In production, this would be replaced with Redis:
    - redis-py client
    - Connection pooling
    - Distributed caching across instances
    - Pub/Sub for cache invalidation
    """

    def __init__(self, ttl_seconds: int = 300):
        """
        Initialize cache.

        Args:
            ttl_seconds: Time-to-live for cache entries (default 5 minutes)
        """
        self.ttl_seconds = ttl_seconds
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.Lock()

    def _is_expired(self, entry: Dict[str, Any]) -> bool:
        """Check if a cache entry is expired."""
        expires_at = entry['expires_at']
        return datetime.utcnow() > expires_at

    def set(self, key: str, value: Any) -> None:
        """
        Set a cache entry.

        Args:
            key: Cache key
            value: Value to cache
        """
        with self._lock:
            self._cache[key] = {
                'value': value,
                'expires_at': datetime.utcnow() + timedelta(seconds=self.ttl_seconds),
                'created_at': datetime.utcnow(),
            }

    def get(self, key: str) -> Optional[Any]:
        """
        Get a cache entry.

        Args:
            key: Cache key

        Returns:
            Cached value or None if not found/expired
        """
        with self._lock:
            if key not in self._cache:
                return None

            entry = self._cache[key]

            if self._is_expired(entry):
                del self._cache[key]
                return None

            return entry['value']

    def delete(self, key: str) -> bool:
        """
        Delete a cache entry.

        Args:
            key: Cache key

        Returns:
            True if deleted, False if not found
        """
        with self._lock:
            if key in self._cache:
                del self._cache[key]
                return True
            return False

    def clear(self) -> None:
        """Clear all cache entries."""
        with self._lock:
            self._cache.clear()

    def cleanup_expired(self) -> int:
        """
        Remove all expired entries.

        Returns:
            Number of entries removed
        """
        with self._lock:
            expired_keys = [
                key for key, entry in self._cache.items()
                if self._is_expired(entry)
            ]

            for key in expired_keys:
                del self._cache[key]

            return len(expired_keys)

    def stats(self) -> Dict[str, Any]:
        """
        Get cache statistics.

        Returns:
            Dictionary with cache stats
        """
        with self._lock:
            total = len(self._cache)
            expired = sum(1 for entry in self._cache.values() if self._is_expired(entry))

            return {
                'total_entries': total,
                'active_entries': total - expired,
                'expired_entries': expired,
                'ttl_seconds': self.ttl_seconds,
            }

    def __repr__(self) -> str:
        stats = self.stats()
        return f"PriceCache(entries={stats['active_entries']}, ttl={self.ttl_seconds}s)"


# Global cache instance
_global_cache = None


def get_cache(ttl_seconds: int = 300) -> PriceCache:
    """
    Get global cache instance (singleton).

    Args:
        ttl_seconds: TTL for cache entries

    Returns:
        Global PriceCache instance
    """
    global _global_cache
    if _global_cache is None:
        _global_cache = PriceCache(ttl_seconds=ttl_seconds)
    return _global_cache
