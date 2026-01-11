"""
Azure GPU pricing provider.

In production: Would use Azure Retail Pricing API
For this project: Uses mock data with clear documentation of API mapping
"""

from typing import List, Dict, Any
from .base import BaseProvider


class AzureProvider(BaseProvider):
    """
    Microsoft Azure GPU instance pricing provider.

    Production mapping:
        - Use Azure Retail Prices API
        - Endpoint: https://prices.azure.com/api/retail/prices
        - Filter: serviceName eq 'Virtual Machines' and armSkuName contains 'NC'
        - No authentication required (public API)

    Instance families:
        - Standard_ND96asr_v4: 8x A100 (80GB)
        - Standard_NC6s_v3: 1x V100 (16GB)
        - Standard_NC4as_T4_v3: 1x T4 (16GB)
    """

    def __init__(self, use_mock: bool = True):
        """
        Initialize Azure provider.

        Args:
            use_mock: Use mock data (default True)
        """
        super().__init__(use_mock=use_mock)

    def fetch_prices(self) -> List[Dict[str, Any]]:
        """
        Fetch GPU prices from Azure.

        Returns:
            List of standardized pricing dictionaries
        """
        if self.use_mock:
            print(f"📦 Using mock data for Azure (no real API call)")
            return self._load_mock_data()

        # Production implementation would go here:
        # import requests
        # url = "https://prices.azure.com/api/retail/prices"
        # params = {
        #     "$filter": "serviceName eq 'Virtual Machines' and priceType eq 'Consumption'"
        # }
        # response = requests.get(url, params=params)
        # return self._parse_azure_response(response.json())

        raise NotImplementedError("Real Azure API not implemented (college project)")

    def _parse_azure_response(self, response: Dict) -> List[Dict[str, Any]]:
        """Parse Azure Retail Pricing API response into standardized format."""
        # Placeholder for production parsing logic
        pass


# Standalone test function
def test_azure_provider():
    """Test Azure provider independently."""
    print("\n" + "="*60)
    print("TESTING AZURE PROVIDER")
    print("="*60 + "\n")

    provider = AzureProvider(use_mock=True)
    prices = provider.get_prices()

    print(f"✅ Fetched {len(prices)} price entries from Azure\n")

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

    print("\n✅ Azure Provider validation passed!\n")
    return prices


if __name__ == "__main__":
    test_azure_provider()
