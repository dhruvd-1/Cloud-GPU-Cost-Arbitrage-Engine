"""
Lambda Labs GPU pricing provider.

In production: Would use Lambda Labs Cloud API
For this project: Uses mock data with clear documentation of API mapping
"""

from typing import List, Dict, Any
from .base import BaseProvider


class LambdaProvider(BaseProvider):
    """
    Lambda Labs GPU cloud pricing provider.

    Production mapping:
        - Use Lambda Labs Cloud API
        - Endpoint: https://cloud.lambdalabs.com/api/v1/instance-types
        - Requires API key in headers
        - Known for low availability but competitive pricing

    GPU types:
        - A100 (SXM4)
        - A10
        - RTX 6000 Ada
        - H100 (limited availability)
    """

    def __init__(self, use_mock: bool = True, api_key: str = None):
        """
        Initialize Lambda Labs provider.

        Args:
            use_mock: Use mock data (default True)
            api_key: Lambda Labs API key (for production)
        """
        super().__init__(use_mock=use_mock)
        self.api_key = api_key

    def fetch_prices(self) -> List[Dict[str, Any]]:
        """
        Fetch GPU prices from Lambda Labs.

        Returns:
            List of standardized pricing dictionaries
        """
        if self.use_mock:
            print(f"📦 Using mock data for Lambda Labs (no real API call)")
            return self._load_mock_data()

        # Production implementation would go here:
        # import requests
        # headers = {"Authorization": f"Bearer {self.api_key}"}
        # response = requests.get(
        #     "https://cloud.lambdalabs.com/api/v1/instance-types",
        #     headers=headers
        # )
        # return self._parse_lambda_response(response.json())

        raise NotImplementedError("Real Lambda Labs API not implemented (college project)")

    def _parse_lambda_response(self, response: Dict) -> List[Dict[str, Any]]:
        """Parse Lambda Labs API response into standardized format."""
        # Placeholder for production parsing logic
        pass


# Standalone test function
def test_lambda_provider():
    """Test Lambda Labs provider independently."""
    print("\n" + "="*60)
    print("TESTING LAMBDA LABS PROVIDER")
    print("="*60 + "\n")

    provider = LambdaProvider(use_mock=True)
    prices = provider.get_prices()

    print(f"✅ Fetched {len(prices)} price entries from Lambda Labs\n")

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

    print("\n✅ Lambda Labs Provider validation passed!\n")
    return prices


if __name__ == "__main__":
    test_lambda_provider()
