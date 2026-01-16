"""
Base provider class for GPU pricing data collection.
All provider implementations should inherit from this class.
"""

from abc import ABC, abstractmethod
from datetime import datetime
from typing import List, Dict, Any
import json
import os


class BaseProvider(ABC):
    """Base class for all GPU pricing providers."""

    def __init__(self, use_mock: bool = True):
        """
        Initialize the provider.

        Args:
            use_mock: Whether to use mock data (default True for college project)
        """
        self.use_mock = use_mock
        self.provider_name = self.__class__.__name__.replace('Provider', '')
        self.mock_data_path = os.path.join(
            os.path.dirname(__file__),
            '../../mock_data/pricing_samples.json'
        )

    @abstractmethod
    def fetch_prices(self) -> List[Dict[str, Any]]:
        """
        Fetch GPU prices from the provider.

        Returns:
            List of standardized pricing dictionaries
        """
        pass

    def _load_mock_data(self) -> List[Dict[str, Any]]:
        """Load mock pricing data from JSON file."""
        try:
            with open(self.mock_data_path, 'r') as f:
                all_data = json.load(f)
                provider_key = self.provider_name.lower()
                return all_data.get(provider_key, [])
        except FileNotFoundError:
            print(f"⚠️  Mock data file not found: {self.mock_data_path}")
            return []
        except json.JSONDecodeError as e:
            print(f"⚠️  Error parsing mock data: {e}")
            return []

    def _add_timestamp(self, prices: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Add ISO8601 timestamp to each price entry."""
        timestamp = datetime.utcnow().isoformat() + 'Z'
        for price in prices:
            price['timestamp'] = timestamp
        return prices

    def _standardize_output(self, prices: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Ensure all prices follow the standardized schema:
        {
            "provider": str,
            "region": str,
            "gpu_model": str,
            "price_per_hour": float,
            "availability": float,
            "timestamp": str (ISO8601)
        }
        """
        standardized = []
        required_fields = ['provider', 'region', 'gpu_model', 'price_per_hour', 'availability']

        for price in prices:
            # Check for required fields
            if all(field in price for field in required_fields):
                standardized.append(price)
            else:
                missing = [f for f in required_fields if f not in price]
                print(f"⚠️  Skipping invalid price entry (missing: {missing})")

        return standardized

    def get_prices(self) -> List[Dict[str, Any]]:
        """
        Main method to get GPU prices (with mock fallback).

        Returns:
            List of standardized, timestamped pricing dictionaries
        """
        try:
            prices = self.fetch_prices()
            prices = self._add_timestamp(prices)
            prices = self._standardize_output(prices)
            return prices
        except Exception as e:
            print(f"❌ Error fetching prices from {self.provider_name}: {e}")
            if self.use_mock:
                print(f"📦 Falling back to mock data for {self.provider_name}")
                prices = self._load_mock_data()
                prices = self._add_timestamp(prices)
                return prices
            return []
