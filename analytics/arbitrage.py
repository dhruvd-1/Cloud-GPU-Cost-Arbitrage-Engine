"""
GPU Cost Arbitrage Detection Engine

Identifies cost arbitrage opportunities across cloud GPU providers.

Arbitrage opportunity:
When the same GPU (or equivalent performance) is available at
significantly different prices across providers.
"""

from typing import List, Dict, Any, Optional
from collections import defaultdict
from normalization.normalize import normalize_prices


class ArbitrageOpportunity:
    """Represents a single arbitrage opportunity."""

    def __init__(
        self,
        gpu_model: str,
        cheapest_provider: Dict[str, Any],
        most_expensive_provider: Dict[str, Any],
        price_difference: float,
        percentage_savings: float,
        all_providers: List[Dict[str, Any]],
    ):
        self.gpu_model = gpu_model
        self.cheapest = cheapest_provider
        self.most_expensive = most_expensive_provider
        self.price_difference = price_difference
        self.percentage_savings = percentage_savings
        self.all_providers = all_providers

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            'gpu_model': self.gpu_model,
            'cheapest_provider': {
                'provider': self.cheapest['provider'],
                'region': self.cheapest['region'],
                'price_per_hour': self.cheapest['price_per_hour'],
                'availability': self.cheapest['availability'],
            },
            'most_expensive_provider': {
                'provider': self.most_expensive['provider'],
                'region': self.most_expensive['region'],
                'price_per_hour': self.most_expensive['price_per_hour'],
                'availability': self.most_expensive['availability'],
            },
            'price_difference_usd_per_hour': round(self.price_difference, 2),
            'percentage_savings': round(self.percentage_savings, 2),
            'annual_savings_usd': round(self.price_difference * 24 * 365, 2),
            'providers_offering': len(self.all_providers),
        }

    def __repr__(self) -> str:
        return (
            f"ArbitrageOpportunity({self.gpu_model}: "
            f"{self.cheapest['provider']} ${self.cheapest['price_per_hour']:.2f} vs "
            f"{self.most_expensive['provider']} ${self.most_expensive['price_per_hour']:.2f}, "
            f"save {self.percentage_savings:.1f}%)"
        )


class ArbitrageDetector:
    """Detects cost arbitrage opportunities across GPU providers."""

    def __init__(
        self,
        min_price_difference: float = 0.50,
        min_percentage_savings: float = 10.0,
        min_providers: int = 2,
    ):
        """
        Initialize arbitrage detector.

        Args:
            min_price_difference: Minimum price difference in USD/hour
            min_percentage_savings: Minimum percentage savings to consider
            min_providers: Minimum number of providers offering the GPU
        """
        self.min_price_difference = min_price_difference
        self.min_percentage_savings = min_percentage_savings
        self.min_providers = min_providers

    def detect_opportunities(
        self,
        prices: List[Dict[str, Any]],
        precision: str = "fp32",
    ) -> List[ArbitrageOpportunity]:
        """
        Detect all arbitrage opportunities in the given prices.

        Args:
            prices: List of price dictionaries
            precision: Precision to use for normalization

        Returns:
            List of arbitrage opportunities, sorted by savings
        """
        # Normalize prices
        normalized = normalize_prices(prices, precision=precision)

        # Group by GPU model
        by_gpu = defaultdict(list)
        for price in normalized:
            gpu_model = price.get('gpu_model')
            if gpu_model and price.get('normalized'):
                by_gpu[gpu_model].append(price)

        # Find arbitrage opportunities
        opportunities = []

        for gpu_model, gpu_prices in by_gpu.items():
            # Need at least min_providers to have an opportunity
            if len(gpu_prices) < self.min_providers:
                continue

            # Sort by price
            sorted_prices = sorted(gpu_prices, key=lambda x: x['price_per_hour'])

            cheapest = sorted_prices[0]
            most_expensive = sorted_prices[-1]

            price_diff = most_expensive['price_per_hour'] - cheapest['price_per_hour']
            percentage_savings = (price_diff / most_expensive['price_per_hour']) * 100

            # Check if it meets thresholds
            if (
                price_diff >= self.min_price_difference and
                percentage_savings >= self.min_percentage_savings
            ):
                opportunity = ArbitrageOpportunity(
                    gpu_model=gpu_model,
                    cheapest_provider=cheapest,
                    most_expensive_provider=most_expensive,
                    price_difference=price_diff,
                    percentage_savings=percentage_savings,
                    all_providers=sorted_prices,
                )
                opportunities.append(opportunity)

        # Sort by percentage savings (descending)
        opportunities.sort(key=lambda x: x.percentage_savings, reverse=True)

        return opportunities

    def get_best_arbitrage(
        self,
        prices: List[Dict[str, Any]],
        precision: str = "fp32",
    ) -> Optional[ArbitrageOpportunity]:
        """
        Get the single best arbitrage opportunity.

        Args:
            prices: List of price dictionaries
            precision: Precision to use for normalization

        Returns:
            Best opportunity or None
        """
        opportunities = self.detect_opportunities(prices, precision)
        return opportunities[0] if opportunities else None

    def get_arbitrage_by_gpu(
        self,
        prices: List[Dict[str, Any]],
        gpu_model: str,
        precision: str = "fp32",
    ) -> Optional[ArbitrageOpportunity]:
        """
        Get arbitrage opportunity for a specific GPU model.

        Args:
            prices: List of price dictionaries
            gpu_model: GPU model to analyze
            precision: Precision to use for normalization

        Returns:
            Arbitrage opportunity or None
        """
        opportunities = self.detect_opportunities(prices, precision)

        for opp in opportunities:
            if opp.gpu_model == gpu_model:
                return opp

        return None


def find_cross_region_arbitrage(
    prices: List[Dict[str, Any]],
    provider: str,
    gpu_model: str,
) -> Optional[Dict[str, Any]]:
    """
    Find arbitrage opportunities across regions for the same provider.

    Useful for identifying when moving to a different region could save money.

    Args:
        prices: List of price dictionaries
        provider: Provider name (e.g., "AWS")
        gpu_model: GPU model to analyze

    Returns:
        Cross-region arbitrage info or None
    """
    # Filter to specific provider and GPU
    filtered = [
        p for p in prices
        if p.get('provider') == provider and p.get('gpu_model') == gpu_model
    ]

    if len(filtered) < 2:
        return None

    # Sort by price
    sorted_prices = sorted(filtered, key=lambda x: x['price_per_hour'])

    cheapest = sorted_prices[0]
    most_expensive = sorted_prices[-1]

    price_diff = most_expensive['price_per_hour'] - cheapest['price_per_hour']

    if price_diff > 0:
        percentage_savings = (price_diff / most_expensive['price_per_hour']) * 100

        return {
            'provider': provider,
            'gpu_model': gpu_model,
            'cheapest_region': cheapest['region'],
            'cheapest_price': cheapest['price_per_hour'],
            'most_expensive_region': most_expensive['region'],
            'most_expensive_price': most_expensive['price_per_hour'],
            'price_difference': round(price_diff, 2),
            'percentage_savings': round(percentage_savings, 2),
        }

    return None


def calculate_monthly_savings(opportunity: ArbitrageOpportunity) -> Dict[str, float]:
    """
    Calculate monthly and annual savings for an arbitrage opportunity.

    Assumes 24/7 usage (730 hours/month average).

    Args:
        opportunity: ArbitrageOpportunity instance

    Returns:
        Dictionary with savings calculations
    """
    hourly_savings = opportunity.price_difference
    monthly_hours = 730  # Average hours per month
    annual_hours = 24 * 365

    return {
        'hourly_savings': round(hourly_savings, 2),
        'monthly_savings': round(hourly_savings * monthly_hours, 2),
        'annual_savings': round(hourly_savings * annual_hours, 2),
        'percentage_savings': round(opportunity.percentage_savings, 2),
    }


def print_arbitrage_report(opportunities: List[ArbitrageOpportunity]) -> None:
    """
    Print a formatted arbitrage report.

    Args:
        opportunities: List of arbitrage opportunities
    """
    if not opportunities:
        print("\n❌ No arbitrage opportunities found.\n")
        return

    print(f"\n{'='*70}")
    print(f"ARBITRAGE OPPORTUNITIES DETECTED: {len(opportunities)}")
    print(f"{'='*70}\n")

    for idx, opp in enumerate(opportunities, 1):
        print(f"#{idx} - {opp.gpu_model}")
        print(f"{'─'*70}")

        print(f"🏆 CHEAPEST:  {opp.cheapest['provider']:15} ({opp.cheapest['region']:15})")
        print(f"              ${opp.cheapest['price_per_hour']:7.2f}/hour  |  {opp.cheapest['availability']:5.0%} availability")

        print(f"\n💸 EXPENSIVE: {opp.most_expensive['provider']:15} ({opp.most_expensive['region']:15})")
        print(f"              ${opp.most_expensive['price_per_hour']:7.2f}/hour  |  {opp.most_expensive['availability']:5.0%} availability")

        savings = calculate_monthly_savings(opp)
        print(f"\n💰 SAVINGS:   {opp.percentage_savings:.1f}% cheaper")
        print(f"              ${savings['hourly_savings']:.2f}/hour")
        print(f"              ${savings['monthly_savings']:,.2f}/month (24/7 usage)")
        print(f"              ${savings['annual_savings']:,.2f}/year")

        print(f"\n📊 PROVIDERS: {len(opp.all_providers)} offering this GPU")
        print(f"{'='*70}\n")
