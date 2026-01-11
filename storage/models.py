"""
Database models for GPU pricing storage.

Production mapping:
- AWS: RDS (PostgreSQL/MySQL) or DynamoDB
- GCP: Cloud SQL or Firestore
- Azure: Azure SQL Database or Cosmos DB

For this project: SQLite for simplicity
"""

from datetime import datetime
from typing import Dict, Any


class Provider:
    """Provider model."""

    def __init__(self, id: int, name: str, api_endpoint: str = None):
        self.id = id
        self.name = name
        self.api_endpoint = api_endpoint
        self.created_at = datetime.utcnow()

    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'name': self.name,
            'api_endpoint': self.api_endpoint,
            'created_at': self.created_at.isoformat(),
        }


class Region:
    """Region model."""

    def __init__(self, id: int, provider_id: int, name: str, location: str = None):
        self.id = id
        self.provider_id = provider_id
        self.name = name
        self.location = location

    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'provider_id': self.provider_id,
            'name': self.name,
            'location': self.location,
        }


class GPUPrice:
    """GPU pricing entry model."""

    def __init__(
        self,
        id: int = None,
        provider: str = None,
        region: str = None,
        gpu_model: str = None,
        price_per_hour: float = None,
        availability: float = None,
        instance_type: str = None,
        gpu_count: int = 1,
        memory_gb: int = None,
        timestamp: str = None,
    ):
        self.id = id
        self.provider = provider
        self.region = region
        self.gpu_model = gpu_model
        self.price_per_hour = price_per_hour
        self.availability = availability
        self.instance_type = instance_type
        self.gpu_count = gpu_count
        self.memory_gb = memory_gb
        self.timestamp = timestamp or datetime.utcnow().isoformat() + 'Z'

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'GPUPrice':
        """Create GPUPrice from dictionary."""
        return cls(
            id=data.get('id'),
            provider=data.get('provider'),
            region=data.get('region'),
            gpu_model=data.get('gpu_model'),
            price_per_hour=data.get('price_per_hour'),
            availability=data.get('availability'),
            instance_type=data.get('instance_type'),
            gpu_count=data.get('gpu_count', 1),
            memory_gb=data.get('memory_gb'),
            timestamp=data.get('timestamp'),
        )

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            'id': self.id,
            'provider': self.provider,
            'region': self.region,
            'gpu_model': self.gpu_model,
            'price_per_hour': self.price_per_hour,
            'availability': self.availability,
            'instance_type': self.instance_type,
            'gpu_count': self.gpu_count,
            'memory_gb': self.memory_gb,
            'timestamp': self.timestamp,
        }
