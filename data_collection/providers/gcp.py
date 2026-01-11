"""
GCP GPU pricing provider.

In production: Would use Google Cloud Billing API
For this project: Uses mock data with clear documentation of API mapping
"""

from typing import List, Dict, Any
from .base import BaseProvider


class GCPProvider(BaseProvider):
    """
    Google Cloud Platform GPU instance pricing provider.

    Production mapping:
        - Use Google Cloud Billing API
        - Service: cloudbilling.googleapis.com
        - Endpoint: /v1/services/compute.googleapis.com/skus
        - Filter by: GPU accelerator types

    Instance families:
        - a2-highgpu-1g: 1x A100 (40GB)
        - n1-standard-8 + nvidia-tesla-v100: V100
        - n1-standard-4 + nvidia-tesla-t4: T4
    """

    def __init__(self, use_mock: bool = True, credentials_path: str = None):
        """
        Initialize GCP provider.

        Args:
            use_mock: Use mock data (default True)
            credentials_path: Path to GCP service account JSON (for production)
        """
        super().__init__(use_mock=use_mock)
        self.credentials_path = credentials_path

    def fetch_prices(self) -> List[Dict[str, Any]]:
        """
        Fetch GPU prices from GCP.

        Returns:
            List of standardized pricing dictionaries
        """
        if self.use_mock:
            print(f"📦 Using mock data for GCP (no real API call)")
            return self._load_mock_data()

        # Production implementation would go here:
        # from google.cloud import billing_v1
        # client = billing_v1.CloudCatalogClient()
        # service_name = "services/95FF-2EF5-5EA1"  # Compute Engine
        # skus = client.list_skus(parent=service_name)
        # return self._parse_gcp_response(skus)

        raise NotImplementedError("Real GCP API not implemented (college project)")

    def _parse_gcp_response(self, skus) -> List[Dict[str, Any]]:
        """Parse GCP Billing API response into standardized format."""
        # Placeholder for production parsing logic
        pass


# Standalone test function
def test_gcp_provider():
    """Test GCP provider independently."""
    print("\n" + "="*60)
    print("TESTING GCP PROVIDER")
    print("="*60 + "\n")

    provider = GCPProvider(use_mock=True)
    prices = provider.get_prices()

    print(f"✅ Fetched {len(prices)} price entries from GCP\n")

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

    print("\n✅ GCP Provider validation passed!\n")
    return prices


if __name__ == "__main__":
    test_gcp_provider()
