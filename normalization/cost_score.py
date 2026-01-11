"""
Cost-performance scoring and analysis.

Provides detailed cost-performance metrics and comparisons.
"""

from typing import Dict, Any, List
from normalization.normalize import normalize_prices


def calculate_cost_scores(
    prices: List[Dict[str, Any]],
    precision: str = "fp32",
) -> List[Dict[str, Any]]:
    """
    Calculate comprehensive cost scores for all prices.

    Returns prices with added score metrics:
    - cost_per_tflop: Cost per TFLOPs (lower is better)
    - cost_performance_score: Overall value score (higher is better)
    - value_rank: Ranking among all options
    - savings_vs_worst: Percentage savings vs worst option

    Args:
        prices: List of price dictionaries
        precision: Precision to use for scoring

    Returns:
        List of prices with cost scores
    """
    # Normalize prices
    normalized = normalize_prices(prices, precision=precision)

    if not normalized:
        return []

    # Filter out prices without scores
    scored = [p for p in normalized if p.get('cost_performance_score') is not None]

    if not scored:
        return normalized

    # Sort by cost-performance score (descending)
    scored = sorted(
        scored,
        key=lambda x: x['cost_performance_score'],
        reverse=True
    )

    # Calculate additional metrics
    best_score = scored[0]['cost_performance_score']
    worst_score = scored[-1]['cost_performance_score']

    for idx, price in enumerate(scored):
        # Value rank (1 is best)
        price['value_rank'] = idx + 1

        # Savings vs worst option
        if worst_score > 0:
            savings = ((price['cost_performance_score'] - worst_score) / worst_score) * 100
            price['savings_vs_worst_percent'] = round(savings, 2)
        else:
            price['savings_vs_worst_percent'] = 0

        # Relative value score (0-100 scale)
        if best_score > 0:
            relative_value = (price['cost_performance_score'] / best_score) * 100
            price['relative_value_score'] = round(relative_value, 2)
        else:
            price['relative_value_score'] = 0

    return scored


def compare_providers_by_gpu(
    prices: List[Dict[str, Any]],
    gpu_model: str,
    precision: str = "fp32",
) -> Dict[str, Any]:
    """
    Compare all providers offering a specific GPU model.

    Args:
        prices: List of price dictionaries
        gpu_model: GPU model to compare
        precision: Precision to use for comparison

    Returns:
        Comparison report
    """
    # Filter to specific GPU
    gpu_prices = [p for p in prices if p.get('gpu_model') == gpu_model]

    if not gpu_prices:
        return {
            'gpu_model': gpu_model,
            'error': 'No prices found for this GPU model',
        }

    # Calculate scores
    scored = calculate_cost_scores(gpu_prices, precision=precision)

    if not scored:
        return {
            'gpu_model': gpu_model,
            'error': 'Unable to calculate scores',
        }

    best = scored[0]
    worst = scored[-1]

    price_difference = worst['price_per_hour'] - best['price_per_hour']
    price_difference_percent = (price_difference / worst['price_per_hour']) * 100 if worst['price_per_hour'] > 0 else 0

    return {
        'gpu_model': gpu_model,
        'tflops': best.get('tflops'),
        'providers_compared': len(scored),
        'best_option': {
            'provider': best['provider'],
            'region': best['region'],
            'price_per_hour': best['price_per_hour'],
            'availability': best['availability'],
            'cost_performance_score': best['cost_performance_score'],
        },
        'worst_option': {
            'provider': worst['provider'],
            'region': worst['region'],
            'price_per_hour': worst['price_per_hour'],
            'availability': worst['availability'],
            'cost_performance_score': worst['cost_performance_score'],
        },
        'price_difference_usd': round(price_difference, 2),
        'price_difference_percent': round(price_difference_percent, 2),
        'all_options': scored,
    }


def get_top_values(
    prices: List[Dict[str, Any]],
    top_n: int = 10,
    precision: str = "fp32",
) -> List[Dict[str, Any]]:
    """
    Get top N best value GPUs across all providers.

    Args:
        prices: List of price dictionaries
        top_n: Number of top values to return
        precision: Precision to use for scoring

    Returns:
        List of top value options
    """
    scored = calculate_cost_scores(prices, precision=precision)
    return scored[:top_n]


def print_cost_comparison(comparison: Dict[str, Any]) -> None:
    """
    Print a formatted cost comparison report.

    Args:
        comparison: Comparison dictionary from compare_providers_by_gpu
    """
    if 'error' in comparison:
        print(f"❌ {comparison['error']}")
        return

    print(f"\n{'='*70}")
    print(f"COST COMPARISON: {comparison['gpu_model']}")
    print(f"{'='*70}\n")

    print(f"Performance: {comparison['tflops']} TFLOPs")
    print(f"Providers compared: {comparison['providers_compared']}\n")

    best = comparison['best_option']
    worst = comparison['worst_option']

    print(f"🏆 BEST VALUE:")
    print(f"   {best['provider']} ({best['region']})")
    print(f"   ${best['price_per_hour']:.2f}/hour")
    print(f"   Availability: {best['availability']:.0%}")
    print(f"   Score: {best['cost_performance_score']:.4f}\n")

    print(f"📉 WORST VALUE:")
    print(f"   {worst['provider']} ({worst['region']})")
    print(f"   ${worst['price_per_hour']:.2f}/hour")
    print(f"   Availability: {worst['availability']:.0%}")
    print(f"   Score: {worst['cost_performance_score']:.4f}\n")

    print(f"💰 POTENTIAL SAVINGS:")
    print(f"   ${comparison['price_difference_usd']:.2f}/hour")
    print(f"   {comparison['price_difference_percent']:.1f}% cheaper")
    print(f"{'='*70}\n")
