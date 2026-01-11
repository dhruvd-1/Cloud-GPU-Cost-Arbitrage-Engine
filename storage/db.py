"""
Database interface for GPU pricing storage.

Production mapping:
- AWS: RDS with connection pooling (psycopg2/SQLAlchemy)
- GCP: Cloud SQL with connection pooling
- Azure: Azure SQL Database

For this project: SQLite with simple interface
"""

import sqlite3
import os
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from storage.models import GPUPrice


class Database:
    """SQLite database interface for GPU pricing."""

    def __init__(self, db_path: str = "gpu_prices.db"):
        """
        Initialize database connection.

        Args:
            db_path: Path to SQLite database file
        """
        self.db_path = db_path
        self.conn = None
        self._init_db()

    def _init_db(self):
        """Initialize database schema."""
        self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row  # Return rows as dictionaries

        cursor = self.conn.cursor()

        # Create providers table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS providers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT UNIQUE NOT NULL,
                api_endpoint TEXT,
                created_at TEXT NOT NULL
            )
        """)

        # Create regions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS regions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                provider_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                location TEXT,
                FOREIGN KEY (provider_id) REFERENCES providers(id),
                UNIQUE(provider_id, name)
            )
        """)

        # Create gpu_prices table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS gpu_prices (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                provider TEXT NOT NULL,
                region TEXT NOT NULL,
                gpu_model TEXT NOT NULL,
                price_per_hour REAL NOT NULL,
                availability REAL NOT NULL,
                instance_type TEXT,
                gpu_count INTEGER DEFAULT 1,
                memory_gb INTEGER,
                timestamp TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)

        # Create indexes for common queries
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_gpu_prices_timestamp
            ON gpu_prices(timestamp)
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_gpu_prices_gpu_model
            ON gpu_prices(gpu_model)
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_gpu_prices_provider
            ON gpu_prices(provider)
        """)

        self.conn.commit()

    def insert_price(self, price: Dict[str, Any]) -> int:
        """
        Insert a single price entry.

        Args:
            price: Price dictionary

        Returns:
            ID of inserted row
        """
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO gpu_prices (
                provider, region, gpu_model, price_per_hour, availability,
                instance_type, gpu_count, memory_gb, timestamp, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            price['provider'],
            price['region'],
            price['gpu_model'],
            price['price_per_hour'],
            price['availability'],
            price.get('instance_type'),
            price.get('gpu_count', 1),
            price.get('memory_gb'),
            price['timestamp'],
            datetime.utcnow().isoformat() + 'Z',
        ))
        self.conn.commit()
        return cursor.lastrowid

    def insert_prices_bulk(self, prices: List[Dict[str, Any]]) -> int:
        """
        Insert multiple price entries in bulk.

        Args:
            prices: List of price dictionaries

        Returns:
            Number of rows inserted
        """
        cursor = self.conn.cursor()
        created_at = datetime.utcnow().isoformat() + 'Z'

        rows = [
            (
                p['provider'],
                p['region'],
                p['gpu_model'],
                p['price_per_hour'],
                p['availability'],
                p.get('instance_type'),
                p.get('gpu_count', 1),
                p.get('memory_gb'),
                p['timestamp'],
                created_at,
            )
            for p in prices
        ]

        cursor.executemany("""
            INSERT INTO gpu_prices (
                provider, region, gpu_model, price_per_hour, availability,
                instance_type, gpu_count, memory_gb, timestamp, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, rows)

        self.conn.commit()
        return len(rows)

    def get_latest_prices(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get the most recent price entries.

        Args:
            limit: Maximum number of entries to return

        Returns:
            List of price dictionaries
        """
        cursor = self.conn.cursor()
        cursor.execute("""
            SELECT * FROM gpu_prices
            ORDER BY timestamp DESC
            LIMIT ?
        """, (limit,))

        return [dict(row) for row in cursor.fetchall()]

    def get_prices_by_gpu(self, gpu_model: str, hours: int = 24) -> List[Dict[str, Any]]:
        """
        Get prices for a specific GPU model within time range.

        Args:
            gpu_model: GPU model name (e.g., "A100")
            hours: Hours of history to retrieve

        Returns:
            List of price dictionaries
        """
        cursor = self.conn.cursor()
        cutoff_time = (datetime.utcnow() - timedelta(hours=hours)).isoformat() + 'Z'

        cursor.execute("""
            SELECT * FROM gpu_prices
            WHERE gpu_model = ? AND timestamp >= ?
            ORDER BY timestamp DESC
        """, (gpu_model, cutoff_time))

        return [dict(row) for row in cursor.fetchall()]

    def get_prices_by_provider(self, provider: str, hours: int = 24) -> List[Dict[str, Any]]:
        """
        Get prices for a specific provider within time range.

        Args:
            provider: Provider name
            hours: Hours of history to retrieve

        Returns:
            List of price dictionaries
        """
        cursor = self.conn.cursor()
        cutoff_time = (datetime.utcnow() - timedelta(hours=hours)).isoformat() + 'Z'

        cursor.execute("""
            SELECT * FROM gpu_prices
            WHERE provider = ? AND timestamp >= ?
            ORDER BY timestamp DESC
        """, (provider, cutoff_time))

        return [dict(row) for row in cursor.fetchall()]

    def get_price_stats(self) -> Dict[str, Any]:
        """Get database statistics."""
        cursor = self.conn.cursor()

        cursor.execute("SELECT COUNT(*) as total FROM gpu_prices")
        total = cursor.fetchone()['total']

        cursor.execute("SELECT COUNT(DISTINCT gpu_model) as models FROM gpu_prices")
        models = cursor.fetchone()['models']

        cursor.execute("SELECT COUNT(DISTINCT provider) as providers FROM gpu_prices")
        providers = cursor.fetchone()['providers']

        cursor.execute("SELECT MIN(timestamp) as oldest, MAX(timestamp) as newest FROM gpu_prices")
        row = cursor.fetchone()

        return {
            'total_entries': total,
            'unique_gpu_models': models,
            'unique_providers': providers,
            'oldest_entry': row['oldest'],
            'newest_entry': row['newest'],
        }

    def clear_old_data(self, days: int = 30) -> int:
        """
        Clear price data older than specified days.

        Args:
            days: Number of days to retain

        Returns:
            Number of rows deleted
        """
        cursor = self.conn.cursor()
        cutoff_time = (datetime.utcnow() - timedelta(days=days)).isoformat() + 'Z'

        cursor.execute("""
            DELETE FROM gpu_prices
            WHERE timestamp < ?
        """, (cutoff_time,))

        self.conn.commit()
        return cursor.rowcount

    def close(self):
        """Close database connection."""
        if self.conn:
            self.conn.close()

    def __enter__(self):
        """Context manager entry."""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.close()
