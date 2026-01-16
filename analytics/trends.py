"""
Price trend analysis for GPU pricing data.

Analyzes historical pricing data to identify trends and patterns.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from collections import defaultdict
import statistics


def analyze_price_trends(
    prices: List[Dict[str, Any]],
    gpu_model: Optional[str] = None,
    provider: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Analyze price trends over time.

    Args:
        prices: List of historical price dictionaries
        gpu_model: Optional GPU model filter
        provider: Optional provider filter

    Returns:
        Trend analysis dictionary
    """
    # Filter prices
    filtered = prices
    if gpu_model:
        filtered = [p for p in filtered if p.get('gpu_model') == gpu_model]
    if provider:
        filtered = [p for p in filtered if p.get('provider') == provider]

    if not filtered:
        return {'error': 'No data available for analysis'}

    # Extract prices
    price_values = [p['price_per_hour'] for p in filtered if 'price_per_hour' in p]

    if not price_values:
        return {'error': 'No price data available'}

    # Calculate statistics
    avg_price = statistics.mean(price_values)
    min_price = min(price_values)
    max_price = max(price_values)
    std_dev = statistics.stdev(price_values) if len(price_values) > 1 else 0

    # Calculate volatility (coefficient of variation)
    volatility = (std_dev / avg_price * 100) if avg_price > 0 else 0

    return {
        'gpu_model': gpu_model or 'all',
        'provider': provider or 'all',
        'sample_count': len(price_values),
        'avg_price': round(avg_price, 4),
        'min_price': round(min_price, 4),
        'max_price': round(max_price, 4),
        'std_deviation': round(std_dev, 4),
        'volatility_percent': round(volatility, 2),
        'price_range': round(max_price - min_price, 4),
    }


def compare_regions(
    prices: List[Dict[str, Any]],
    gpu_model: str,
) -> List[Dict[str, Any]]:
    """
    Compare pricing across regions for a GPU model.

    Args:
        prices: List of price dictionaries
        gpu_model: GPU model to analyze

    Returns:
        List of region comparisons
    """
    # Filter to specific GPU
    gpu_prices = [p for p in prices if p.get('gpu_model') == gpu_model]

    # Group by region
    by_region = defaultdict(list)
    for price in gpu_prices:
        region = f"{price['provider']} - {price['region']}"
        by_region[region].append(price['price_per_hour'])

    # Calculate stats for each region
    comparisons = []
    for region, region_prices in by_region.items():
        comparisons.append({
            'region': region,
            'avg_price': round(statistics.mean(region_prices), 2),
            'min_price': round(min(region_prices), 2),
            'max_price': round(max(region_prices), 2),
            'sample_count': len(region_prices),
        })

    # Sort by average price
    comparisons.sort(key=lambda x: x['avg_price'])

    return comparisons


def detect_price_anomalies(
    prices: List[Dict[str, Any]],
    threshold_std_devs: float = 2.0,
) -> List[Dict[str, Any]]:
    """
    Detect price anomalies (outliers).

    Uses standard deviation to identify prices that are
    significantly different from the mean.

    Args:
        prices: List of price dictionaries
        threshold_std_devs: Number of standard deviations for outlier detection

    Returns:
        List of anomalous prices
    """
    if len(prices) < 3:
        return []

    price_values = [p['price_per_hour'] for p in prices]
    mean_price = statistics.mean(price_values)
    std_dev = statistics.stdev(price_values)

    anomalies = []
    for price in prices:
        deviation = abs(price['price_per_hour'] - mean_price) / std_dev if std_dev > 0 else 0

        if deviation > threshold_std_devs:
            price_copy = price.copy()
            price_copy['deviation_std_devs'] = round(deviation, 2)
            price_copy['deviation_from_mean'] = round(price['price_per_hour'] - mean_price, 2)
            anomalies.append(price_copy)

    return anomalies
