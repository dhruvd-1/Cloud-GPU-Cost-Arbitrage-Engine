"""
Vast.ai GPU pricing provider.

In production: Would use Vast.ai REST API
For this project: Uses mock data with clear documentation of API mapping
"""

from typing import List, Dict, Any
from .base import BaseProvider


class VastProvider(BaseProvider):
    """
    Vast.ai GPU marketplace pricing provider.

    Production mapping:
        - Use Vast.ai REST API
        - Endpoint: https://console.vast.ai/api/v0/bundles/
        - Query params: q='{"verified": {"eq": true}}'
        - Requires API key in headers
        - Real-time spot pricing marketplace

    GPU types:
        - A100 (PCIe and SXM variants)
        - RTX 4090
        - RTX 3090
        - RTX 3080
        - Various consumer/datacenter GPUs
    """

    def __init__(self, use_mock: bool = True, api_key: str = None):
        """
        Initialize Vast.ai provider.

        Args:
            use_mock: Use mock data (default True)
            api_key: Vast.ai API key (for production)
        """
        super().__init__(use_mock=use_mock)
        self.api_key = api_key

    def fetch_prices(self) -> List[Dict[str, Any]]:
        """
        Fetch GPU prices from Vast.ai.

        Returns:
            List of standardized pricing dictionaries
        """
        if self.use_mock:
            print(f"📦 Using mock data for Vast.ai (no real API call)")
            return self._load_mock_data()

        # Production implementation would go here:
        # import requests
        # headers = {"Authorization": f"Bearer {self.api_key}"}
        # response = requests.get(
        #     "https://console.vast.ai/api/v0/bundles/",
        #     headers=headers
        # )
        # return self._parse_vast_response(response.json())

        raise NotImplementedError("Real Vast.ai API not implemented (college project)")

    def _parse_vast_response(self, response: Dict) -> List[Dict[str, Any]]:
        """Parse Vast.ai API response into standardized format."""
        # Placeholder for production parsing logic
        pass


# Standalone test function
def test_vast_provider():
    """Test Vast.ai provider independently."""
    print("\n" + "="*60)
    print("TESTING VAST.AI PROVIDER")
    print("="*60 + "\n")

    provider = VastProvider(use_mock=True)
    prices = provider.get_prices()

    print(f"✅ Fetched {len(prices)} price entries from Vast.ai\n")

    if prices:
        print("Sample output (first 2 entries):")
        print("-" * 60)
        for price in prices[:2]:
            print(f"Provider:    {price['provider']}")
            print(f"Region:      {price['region']}")
            print(f"GPU Model:   {price['gpu_model']}")
            print(f"Price/hour:  ${price['price_per_hour']:.2f}")
            print(f"Availability: {price['availability']:.0%}")
            print(f"Timestamp:   {price['timestamp']}")
            print("-" * 60)

    # Validate schema
    required_fields = ['provider', 'region', 'gpu_model', 'price_per_hour', 'availability', 'timestamp']
    for price in prices:
        assert all(field in price for field in required_fields), f"Missing fields in: {price}"

    print("\n✅ Vast.ai Provider validation passed!\n")
    return prices


if __name__ == "__main__":
    test_vast_provider()
