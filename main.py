#!/usr/bin/env python3
"""
GPU Cost Arbitrage Engine - Main Entry Point

This is the main entry point for running the complete system locally.

Usage:
    python main.py              # Run full pipeline and start API server
    python main.py --fetch-only # Only fetch and display prices
    python main.py --api-only   # Only start API server
"""

import argparse
import sys
from data_collection.scheduler import PricingScheduler
from storage.db import Database
from analytics.arbitrage import ArbitrageDetector, print_arbitrage_report
from normalization.cost_score import print_cost_comparison, compare_providers_by_gpu


def fetch_and_analyze():
    """Fetch prices and perform arbitrage analysis."""
    print("\n" + "="*70)
    print("GPU COST ARBITRAGE ENGINE")
    print("="*70 + "\n")

    # Initialize components
    scheduler = PricingScheduler()
    db = Database("gpu_prices.db")

    # Fetch prices
    print("Fetching GPU prices from all providers...\n")
    result = scheduler.fetch_all_prices(parallel=True)

    print(f"✅ Fetched {result['total_prices']} prices from {result['providers_successful']}/{result['providers_queried']} providers")
    print(f"   Elapsed time: {result['elapsed_seconds']}s\n")

    # Store in database
    count = db.insert_prices_bulk(result['prices'])
    print(f"✅ Stored {count} prices in database\n")

    # Detect arbitrage opportunities
    print("Analyzing arbitrage opportunities...\n")
    detector = ArbitrageDetector(min_percentage_savings=10.0)
    opportunities = detector.detect_opportunities(result['prices'], precision="fp32")

    # Print report
    print_arbitrage_report(opportunities)

    # Show A100 comparison
    if any(p.get('gpu_model') == 'A100' for p in result['prices']):
        comparison = compare_providers_by_gpu(result['prices'], 'A100', precision="fp32")
        print_cost_comparison(comparison)

    print("\n" + "="*70)
    print("NEXT STEPS")
    print("="*70)
    print("\n1. Start the API server:")
    print("   python main.py --api-only")
    print("\n2. Or use uvicorn directly:")
    print("   uvicorn api.main:app --reload")
    print("\n3. View API documentation:")
    print("   http://localhost:8000/docs")
    print("\n4. Build and run the React frontend:")
    print("   cd frontend/react_app")
    print("   npm install && npm start")
    print()


def start_api():
    """Start the FastAPI server."""
    import uvicorn
    from api.main import app

    print("\n" + "="*70)
    print("STARTING API SERVER")
    print("="*70 + "\n")
    print("API Documentation: http://localhost:8000/docs")
    print("API Root: http://localhost:8000")
    print("\nPress Ctrl+C to stop\n")

    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description="GPU Cost Arbitrage Engine")
    parser.add_argument(
        "--fetch-only",
        action="store_true",
        help="Only fetch and analyze prices (no API server)"
    )
    parser.add_argument(
        "--api-only",
        action="store_true",
        help="Only start API server (no fetch)"
    )

    args = parser.parse_args()

    if args.api_only:
        start_api()
    elif args.fetch_only:
        fetch_and_analyze()
    else:
        # Default: fetch and analyze, then offer to start API
        fetch_and_analyze()

        response = input("\nStart API server? (y/n): ").strip().lower()
        if response == 'y':
            start_api()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nShutting down gracefully...")
        sys.exit(0)
