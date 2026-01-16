"""
GPU pricing normalization and comparison utilities.

Normalizes prices across providers for fair comparison by factoring in:
- Performance (TFLOPs)
- Availability
- Memory
"""

from typing import Dict, Any, List, Optional
from normalization.gpu_specs import get_gpu_specs, get_tflops


def normalize_price(
    price: Dict[str, Any],
    precision: str = "fp32",
    include_availability: bool = True,
) -> Optional[Dict[str, Any]]:
    """
    Normalize a price entry with performance metrics.

    Args:
        price: Price dictionary with required fields
        precision: Precision to use for performance ("fp32", "fp16", "tensor")
        include_availability: Whether to factor availability into score

    Returns:
        Normalized price dictionary with added metrics
    """
    gpu_model = price.get('gpu_model')
    if not gpu_model:
        return None

    specs = get_gpu_specs(gpu_model)
    if not specs:
        # Unknown GPU, return original price without normalization
        price['normalized'] = False
        price['tflops'] = None
        price['cost_per_tflop'] = None
        price['cost_performance_score'] = None
        return price

    tflops = get_tflops(gpu_model, precision)
    if not tflops or tflops == 0:
        price['normalized'] = False
        return price

    price_per_hour = price.get('price_per_hour', 0)
    availability = price.get('availability', 1.0)

    # Calculate cost per TFLOPs (lower is better)
    cost_per_tflop = price_per_hour / tflops

    # Calculate cost-performance score
    # Score = (TFLOPs / price) * availability
    # Higher score = better value
    if include_availability:
        cost_performance_score = (tflops / price_per_hour) * availability if price_per_hour > 0 else 0
    else:
        cost_performance_score = (tflops / price_per_hour) if price_per_hour > 0 else 0

    # Add normalized fields
    price['normalized'] = True
    price['tflops'] = round(tflops, 2)
    price['cost_per_tflop'] = round(cost_per_tflop, 4)
    price['cost_performance_score'] = round(cost_performance_score, 4)
    price['precision'] = precision

    return price


def normalize_prices(
    prices: List[Dict[str, Any]],
    precision: str = "fp32",
    include_availability: bool = True,
) -> List[Dict[str, Any]]:
    """
    Normalize a list of prices.

    Args:
        prices: List of price dictionaries
        precision: Precision to use for performance
        include_availability: Whether to factor availability into score

    Returns:
        List of normalized price dictionaries
    """
    normalized = []
    for price in prices:
        norm_price = normalize_price(price, precision, include_availability)
        if norm_price:
            normalized.append(norm_price)
    return normalized


def rank_by_cost_performance(
    prices: List[Dict[str, Any]],
    gpu_model: Optional[str] = None,
    precision: str = "fp32",
) -> List[Dict[str, Any]]:
    """
    Rank prices by cost-performance score.

    Args:
        prices: List of price dictionaries
        gpu_model: Optional GPU model to filter by
        precision: Precision to use for ranking

    Returns:
        Sorted list (best value first)
    """
    # Normalize prices
    normalized = normalize_prices(prices, precision=precision)

    # Filter by GPU model if specified
    if gpu_model:
        normalized = [p for p in normalized if p['gpu_model'] == gpu_model]

    # Filter out prices that couldn't be normalized
    normalized = [p for p in normalized if p.get('cost_performance_score') is not None]

    # Sort by cost-performance score (descending - higher is better)
    ranked = sorted(
        normalized,
        key=lambda x: x['cost_performance_score'],
        reverse=True
    )

    return ranked


def find_best_value(
    prices: List[Dict[str, Any]],
    gpu_model: Optional[str] = None,
    min_availability: float = 0.0,
    precision: str = "fp32",
) -> Optional[Dict[str, Any]]:
    """
    Find the best value GPU across all providers.

    Args:
        prices: List of price dictionaries
        gpu_model: Optional GPU model to filter by
        min_availability: Minimum availability threshold
        precision: Precision to use for comparison

    Returns:
        Best value price entry or None
    """
    # Rank by cost-performance
    ranked = rank_by_cost_performance(prices, gpu_model, precision)

    # Filter by minimum availability
    ranked = [p for p in ranked if p.get('availability', 0) >= min_availability]

    # Return best
    return ranked[0] if ranked else None


def get_performance_tiers(
    prices: List[Dict[str, Any]],
    precision: str = "fp32",
) -> Dict[str, List[Dict[str, Any]]]:
    """
    Group GPUs into performance tiers.

    Tiers:
    - High-end: >= 50 TFLOPs (H100, RTX 4090, etc.)
    - Mid-range: 15-50 TFLOPs (A100, V100, RTX 3090, etc.)
    - Entry: < 15 TFLOPs (T4, etc.)

    Args:
        prices: List of price dictionaries
        precision: Precision to use for tiering

    Returns:
        Dictionary of tiered prices
    """
    normalized = normalize_prices(prices, precision=precision)

    tiers = {
        'high_end': [],
        'mid_range': [],
        'entry': [],
        'unknown': [],
    }

    for price in normalized:
        tflops = price.get('tflops')

        if tflops is None:
            tiers['unknown'].append(price)
        elif tflops >= 50:
            tiers['high_end'].append(price)
        elif tflops >= 15:
            tiers['mid_range'].append(price)
        else:
            tiers['entry'].append(price)

    return tiers
