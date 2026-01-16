"""
AWS GPU pricing provider.

In production: Would use AWS Pricing API or boto3
For this project: Uses mock data with clear documentation of API mapping
"""

from typing import List, Dict, Any
from .base import BaseProvider


class AWSProvider(BaseProvider):
    """
    AWS EC2 GPU instance pricing provider.

    Production mapping:
        - Use boto3 with AWS Pricing API
        - Endpoint: pricing.us-east-1.amazonaws.com
        - Service: AmazonEC2
        - Filter by: GPU instance families (p3, p4, g4, etc.)

    Instance families:
        - p4d.24xlarge: 8x A100 (40GB)
        - p3.8xlarge: 4x V100 (16GB)
        - g4dn.xlarge: 1x T4 (16GB)
    """

    def __init__(self, use_mock: bool = True, api_key: str = None):
        """
        Initialize AWS provider.

        Args:
            use_mock: Use mock data (default True)
            api_key: AWS API credentials (for production use)
        """
        super().__init__(use_mock=use_mock)
        self.api_key = api_key

    def fetch_prices(self) -> List[Dict[str, Any]]:
        """
        Fetch GPU prices from AWS.

        Returns:
            List of standardized pricing dictionaries
        """
        if self.use_mock:
            print(f"📦 Using mock data for AWS (no real API call)")
            return self._load_mock_data()

        # Production implementation would go here:
        # import boto3
        # pricing_client = boto3.client('pricing', region_name='us-east-1')
        # response = pricing_client.get_products(
        #     ServiceCode='AmazonEC2',
        #     Filters=[
        #         {'Type': 'TERM_MATCH', 'Field': 'instanceType', 'Value': 'p4d.24xlarge'}
        #     ]
        # )
        # return self._parse_aws_response(response)

        raise NotImplementedError("Real AWS API not implemented (college project)")

    def _parse_aws_response(self, response: Dict) -> List[Dict[str, Any]]:
        """Parse AWS Pricing API response into standardized format."""
        # Placeholder for production parsing logic
        pass


# Standalone test function
def test_aws_provider():
    """Test AWS provider independently."""
    print("\n" + "="*60)
    print("TESTING AWS PROVIDER")
    print("="*60 + "\n")

    provider = AWSProvider(use_mock=True)
    prices = provider.get_prices()

    print(f"✅ Fetched {len(prices)} price entries from AWS\n")

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

    print("\n✅ AWS Provider validation passed!\n")
    return prices


if __name__ == "__main__":
    test_aws_provider()
