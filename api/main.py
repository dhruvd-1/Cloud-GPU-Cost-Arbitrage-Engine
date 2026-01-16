"""
FastAPI Backend for GPU Cost Arbitrage Engine

Provides REST API endpoints for accessing GPU pricing data,
arbitrage opportunities, and analytics.

Production deployment:
- AWS: API Gateway + Lambda (serverless)
- GCP: Cloud Run or App Engine
- Azure: Azure Functions + API Management
- Containerize with Docker for portability
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
from datetime import datetime

from data_collection.scheduler import PricingScheduler
from storage.db import Database
from storage.cache import get_cache
from normalization.normalize import normalize_prices, rank_by_cost_performance
from normalization.cost_score import calculate_cost_scores, compare_providers_by_gpu
from analytics.arbitrage import ArbitrageDetector, print_arbitrage_report
from analytics.reliability import analyze_provider_reliability

# Initialize FastAPI app
app = FastAPI(
    title="GPU Cost Arbitrage Engine API",
    description="API for comparing GPU prices across cloud providers and detecting arbitrage opportunities",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to specific domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global instances
scheduler = PricingScheduler()
cache = get_cache(ttl_seconds=300)
db = Database("gpu_prices.db")


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "name": "GPU Cost Arbitrage Engine API",
        "version": "1.0.0",
        "status": "operational",
        "timestamp": datetime.utcnow().isoformat() + 'Z',
        "endpoints": {
            "prices": "/prices/latest",
            "arbitrage": "/arbitrage/best",
            "analytics": "/analytics/trends",
            "providers": "/providers/list",
            "docs": "/docs",
        }
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + 'Z',
    }


@app.get("/prices/latest")
async def get_latest_prices(
    gpu_model: Optional[str] = Query(None, description="Filter by GPU model (e.g., 'A100')"),
    provider: Optional[str] = Query(None, description="Filter by provider (e.g., 'AWS')"),
    limit: int = Query(100, description="Maximum number of results"),
):
    """
    Get latest GPU prices from all providers.

    Uses cache for sub-second response times.
    """
    cache_key = f"latest_prices:{gpu_model}:{provider}:{limit}"

    # Try cache first
    cached = cache.get(cache_key)
    if cached:
        return {
            "source": "cache",
            "count": len(cached),
            "prices": cached,
        }

    # Fetch fresh data
    result = scheduler.fetch_all_prices(parallel=True)
    prices = result['prices']

    # Apply filters
    if gpu_model:
        prices = [p for p in prices if p.get('gpu_model') == gpu_model]
    if provider:
        prices = [p for p in prices if p.get('provider') == provider]

    # Limit results
    prices = prices[:limit]

    # Cache the results
    cache.set(cache_key, prices)

    return {
        "source": "live",
        "count": len(prices),
        "fetch_time": result['elapsed_seconds'],
        "providers_queried": result['providers_successful'],
        "prices": prices,
    }


@app.get("/prices/history")
async def get_price_history(
    gpu_model: str = Query(..., description="GPU model (e.g., 'A100')"),
    hours: int = Query(24, description="Hours of history to retrieve"),
):
    """Get historical prices for a GPU model."""
    prices = db.get_prices_by_gpu(gpu_model, hours=hours)

    if not prices:
        raise HTTPException(status_code=404, detail=f"No price history found for {gpu_model}")

    return {
        "gpu_model": gpu_model,
        "hours": hours,
        "count": len(prices),
        "prices": prices,
    }


@app.get("/arbitrage/best")
async def get_best_arbitrage(
    min_savings_percent: float = Query(10.0, description="Minimum savings percentage"),
):
    """
    Get the best arbitrage opportunities across all GPUs.

    Returns opportunities sorted by potential savings.
    """
    cache_key = f"arbitrage:best:{min_savings_percent}"

    # Try cache
    cached = cache.get(cache_key)
    if cached:
        return {"source": "cache", **cached}

    # Fetch and analyze
    result = scheduler.fetch_all_prices(parallel=True)
    prices = result['prices']

    detector = ArbitrageDetector(
        min_percentage_savings=min_savings_percent,
        min_providers=2,
    )

    opportunities = detector.detect_opportunities(prices, precision="fp32")

    # Convert to dict format
    opps_data = [opp.to_dict() for opp in opportunities]

    response = {
        "source": "live",
        "count": len(opps_data),
        "opportunities": opps_data,
    }

    # Cache results
    cache.set(cache_key, response)

    return response


@app.get("/arbitrage/gpu/{gpu_model}")
async def get_arbitrage_for_gpu(
    gpu_model: str,
):
    """Get arbitrage opportunity for a specific GPU model."""
    result = scheduler.fetch_all_prices(parallel=True)
    prices = result['prices']

    detector = ArbitrageDetector(min_percentage_savings=5.0)
    opportunity = detector.get_arbitrage_by_gpu(prices, gpu_model, precision="fp32")

    if not opportunity:
        raise HTTPException(
            status_code=404,
            detail=f"No arbitrage opportunity found for {gpu_model}"
        )

    return {
        "gpu_model": gpu_model,
        "opportunity": opportunity.to_dict(),
    }


@app.get("/analytics/trends")
async def get_price_trends(
    gpu_model: Optional[str] = Query(None, description="Filter by GPU model"),
):
    """Get price trends and analytics."""
    result = scheduler.fetch_all_prices(parallel=True)
    prices = result['prices']

    if gpu_model:
        prices = [p for p in prices if p.get('gpu_model') == gpu_model]

    # Normalize and rank
    normalized = normalize_prices(prices, precision="fp32")
    ranked = rank_by_cost_performance(prices, gpu_model=gpu_model, precision="fp32")

    return {
        "total_prices": len(prices),
        "gpu_model": gpu_model,
        "top_values": ranked[:10] if ranked else [],
        "stats": {
            "avg_price": sum(p['price_per_hour'] for p in prices) / len(prices) if prices else 0,
            "min_price": min((p['price_per_hour'] for p in prices), default=0),
            "max_price": max((p['price_per_hour'] for p in prices), default=0),
        }
    }


@app.get("/analytics/comparison")
async def compare_gpu_providers(
    gpu_model: str = Query(..., description="GPU model to compare"),
):
    """Compare all providers offering a specific GPU."""
    result = scheduler.fetch_all_prices(parallel=True)
    prices = result['prices']

    comparison = compare_providers_by_gpu(prices, gpu_model, precision="fp32")

    if 'error' in comparison:
        raise HTTPException(status_code=404, detail=comparison['error'])

    return comparison


@app.get("/providers/list")
async def list_providers():
    """List all available providers."""
    return {
        "providers": [
            {"name": "AWS", "description": "Amazon Web Services EC2 GPU instances"},
            {"name": "GCP", "description": "Google Cloud Platform GPU instances"},
            {"name": "Azure", "description": "Microsoft Azure GPU instances"},
            {"name": "RunPod", "description": "RunPod GPU cloud"},
            {"name": "Vast.ai", "description": "Vast.ai GPU marketplace"},
            {"name": "Lambda Labs", "description": "Lambda Labs GPU cloud"},
        ]
    }


@app.get("/providers/reliability")
async def get_provider_reliability():
    """Get provider reliability scores based on availability."""
    result = scheduler.fetch_all_prices(parallel=True)
    prices = result['prices']

    reliability = analyze_provider_reliability(prices)

    return {
        "count": len(reliability),
        "reliability_scores": reliability,
    }


@app.get("/gpu/models")
async def list_gpu_models():
    """List all available GPU models with specifications."""
    from normalization.gpu_specs import GPU_SPECS

    models = []
    for model, specs in GPU_SPECS.items():
        models.append({
            "model": model,
            "tflops_fp32": specs["tflops_fp32"],
            "memory_gb": specs["memory_gb"],
            "architecture": specs["architecture"],
        })

    return {
        "count": len(models),
        "models": models,
    }


@app.post("/prices/refresh")
async def refresh_prices():
    """Manually trigger a price refresh and clear cache."""
    # Clear cache
    cache.clear()

    # Fetch fresh prices
    result = scheduler.fetch_all_prices(parallel=True)

    # Store in database
    count = db.insert_prices_bulk(result['prices'])

    return {
        "status": "success",
        "prices_fetched": result['total_prices'],
        "prices_stored": count,
        "providers_queried": result['providers_successful'],
        "elapsed_seconds": result['elapsed_seconds'],
    }


@app.get("/stats")
async def get_database_stats():
    """Get database statistics."""
    stats = db.get_price_stats()
    cache_stats = cache.stats()

    return {
        "database": stats,
        "cache": cache_stats,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
