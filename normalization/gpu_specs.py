"""
GPU specifications database.

Contains performance metrics for different GPU models to enable
fair cost-performance comparisons across providers.

Metrics:
- TFLOPs (FP32): Single-precision floating-point performance
- Memory (GB): GPU memory capacity
- Architecture: GPU generation/architecture
- Release year: For reference

Sources:
- NVIDIA official specifications
- TechPowerUp GPU Database
- Academic benchmarks
"""

from typing import Dict, Any, Optional


# GPU Specifications Database
GPU_SPECS = {
    # NVIDIA Data Center GPUs
    "H100": {
        "tflops_fp32": 51.2,
        "tflops_fp16": 989,
        "tflops_tensor": 1979,  # With sparsity
        "memory_gb": 80,
        "architecture": "Hopper",
        "release_year": 2022,
        "tdp_watts": 700,
    },
    "A100": {
        "tflops_fp32": 19.5,
        "tflops_fp16": 312,
        "tflops_tensor": 624,  # With sparsity
        "memory_gb": 80,  # SXM variant
        "architecture": "Ampere",
        "release_year": 2020,
        "tdp_watts": 400,
    },
    "A100-40GB": {
        "tflops_fp32": 19.5,
        "tflops_fp16": 312,
        "tflops_tensor": 624,
        "memory_gb": 40,  # PCIe variant
        "architecture": "Ampere",
        "release_year": 2020,
        "tdp_watts": 250,
    },
    "V100": {
        "tflops_fp32": 15.7,
        "tflops_fp16": 125,
        "tflops_tensor": 125,
        "memory_gb": 32,  # SXM variant
        "architecture": "Volta",
        "release_year": 2017,
        "tdp_watts": 300,
    },
    "A10": {
        "tflops_fp32": 31.2,
        "tflops_fp16": 125,
        "tflops_tensor": 250,
        "memory_gb": 24,
        "architecture": "Ampere",
        "release_year": 2021,
        "tdp_watts": 150,
    },
    "T4": {
        "tflops_fp32": 8.1,
        "tflops_fp16": 65,
        "tflops_tensor": 130,
        "memory_gb": 16,
        "architecture": "Turing",
        "release_year": 2018,
        "tdp_watts": 70,
    },
    "L40": {
        "tflops_fp32": 90.5,
        "tflops_fp16": 181,
        "tflops_tensor": 362,
        "memory_gb": 48,
        "architecture": "Ada Lovelace",
        "release_year": 2022,
        "tdp_watts": 300,
    },

    # NVIDIA Consumer/Gaming GPUs
    "RTX 4090": {
        "tflops_fp32": 82.6,
        "tflops_fp16": 165.2,
        "tflops_tensor": 661,  # With sparsity
        "memory_gb": 24,
        "architecture": "Ada Lovelace",
        "release_year": 2022,
        "tdp_watts": 450,
    },
    "RTX 3090": {
        "tflops_fp32": 35.6,
        "tflops_fp16": 71,
        "tflops_tensor": 142,
        "memory_gb": 24,
        "architecture": "Ampere",
        "release_year": 2020,
        "tdp_watts": 350,
    },
    "RTX 3080": {
        "tflops_fp32": 29.8,
        "tflops_fp16": 59.5,
        "tflops_tensor": 119,
        "memory_gb": 10,
        "architecture": "Ampere",
        "release_year": 2020,
        "tdp_watts": 320,
    },
    "RTX 6000 Ada": {
        "tflops_fp32": 91.1,
        "tflops_fp16": 182,
        "tflops_tensor": 728,
        "memory_gb": 48,
        "architecture": "Ada Lovelace",
        "release_year": 2022,
        "tdp_watts": 300,
    },
}


def get_gpu_specs(gpu_model: str) -> Optional[Dict[str, Any]]:
    """
    Get specifications for a GPU model.

    Args:
        gpu_model: GPU model name (e.g., "A100", "RTX 4090")

    Returns:
        Dictionary of GPU specs or None if not found
    """
    # Normalize model name
    normalized = gpu_model.upper().strip()

    # Direct lookup
    if normalized in GPU_SPECS:
        return GPU_SPECS[normalized]

    # Try partial matching (e.g., "A100 80GB" -> "A100")
    for spec_name in GPU_SPECS:
        if spec_name in normalized:
            return GPU_SPECS[spec_name]

    # Not found
    return None


def get_all_gpu_models() -> list:
    """Get list of all supported GPU models."""
    return list(GPU_SPECS.keys())


def get_tflops(gpu_model: str, precision: str = "fp32") -> Optional[float]:
    """
    Get TFLOPs for a GPU model.

    Args:
        gpu_model: GPU model name
        precision: Precision type ("fp32", "fp16", "tensor")

    Returns:
        TFLOPs value or None if not found
    """
    specs = get_gpu_specs(gpu_model)
    if not specs:
        return None

    key = f"tflops_{precision.lower()}"
    return specs.get(key)


def compare_gpus(gpu1: str, gpu2: str, precision: str = "fp32") -> Dict[str, Any]:
    """
    Compare two GPU models.

    Args:
        gpu1: First GPU model
        gpu2: Second GPU model
        precision: Precision type to compare

    Returns:
        Comparison dictionary
    """
    specs1 = get_gpu_specs(gpu1)
    specs2 = get_gpu_specs(gpu2)

    if not specs1 or not specs2:
        return {"error": "One or both GPU models not found"}

    tflops1 = get_tflops(gpu1, precision) or 0
    tflops2 = get_tflops(gpu2, precision) or 0

    faster_gpu = gpu1 if tflops1 > tflops2 else gpu2
    performance_diff = abs(tflops1 - tflops2)
    percentage_diff = (performance_diff / min(tflops1, tflops2)) * 100 if min(tflops1, tflops2) > 0 else 0

    return {
        "gpu1": {
            "model": gpu1,
            "tflops": tflops1,
            "memory_gb": specs1["memory_gb"],
        },
        "gpu2": {
            "model": gpu2,
            "tflops": tflops2,
            "memory_gb": specs2["memory_gb"],
        },
        "faster": faster_gpu,
        "performance_difference_tflops": round(performance_diff, 2),
        "performance_difference_percent": round(percentage_diff, 2),
    }
