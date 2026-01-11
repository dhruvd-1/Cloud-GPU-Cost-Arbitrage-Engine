"""
Provider reliability and availability analysis.
"""

from typing import List, Dict, Any
from collections import defaultdict
import statistics


def analyze_provider_reliability(
    prices: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """
    Analyze provider reliability based on availability metrics.

    Args:
        prices: List of price dictionaries with availability data

    Returns:
        List of provider reliability scores
    """
    # Group by provider
    by_provider = defaultdict(list)
    for price in prices:
        provider = price.get('provider')
        availability = price.get('availability')
        if provider and availability is not None:
            by_provider[provider].append(availability)

    # Calculate reliability metrics
    reliability = []
    for provider, availabilities in by_provider.items():
        reliability.append({
            'provider': provider,
            'avg_availability': round(statistics.mean(availabilities), 4),
            'min_availability': round(min(availabilities), 4),
            'max_availability': round(max(availabilities), 4),
            'consistency': round(1 - statistics.stdev(availabilities), 4) if len(availabilities) > 1 else 1.0,
            'sample_count': len(availabilities),
        })

    # Sort by average availability (descending)
    reliability.sort(key=lambda x: x['avg_availability'], reverse=True)

    return reliability


def calculate_value_score(
    price: Dict[str, Any],
    weight_price: float = 0.6,
    weight_availability: float = 0.4,
) -> float:
    """
    Calculate overall value score combining price and availability.

    Args:
        price: Price dictionary
        weight_price: Weight for price component
        weight_availability: Weight for availability component

    Returns:
        Value score (higher is better)
    """
    # Normalize components (0-1 scale, higher is better)
    # For price: lower is better, so invert
    # For availability: higher is better

    price_score = 1.0 / (price['price_per_hour'] + 0.01)  # Avoid division by zero
    availability_score = price.get('availability', 0.5)

    value_score = (weight_price * price_score) + (weight_availability * availability_score)

    return value_score
