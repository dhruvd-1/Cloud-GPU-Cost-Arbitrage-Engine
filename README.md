# ⚡ Cloud GPU Cost Arbitrage Engine

A comprehensive cloud computing project that compares GPU pricing across multiple cloud providers and identifies arbitrage opportunities for cost optimization.

**Academic Project** | Built to demonstrate cloud computing principles | Clean architecture | End-to-end functionality

---

## 🎯 Project Overview

This system continuously monitors GPU prices across 6 major cloud providers, normalizes performance metrics, and identifies massive cost-saving opportunities through arbitrage detection.

### Key Findings

Our analysis reveals **significant arbitrage opportunities**:

- **A100 GPU**: Save **96.6%** by choosing Lambda Labs ($1.10/hr) over AWS ($32.77/hr)
  - **Annual savings: $277,429** (24/7 usage)
- **V100 GPU**: Save **79.7%** by choosing GCP over AWS
- **T4 GPU**: Save **79.2%** by choosing GCP over AWS

---

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                        │
│  Live Prices Table | Arbitrage View | Savings Calculator  │
└────────────────────────┬────────────────────────────────────┘
                         │
                    ┌────▼──────┐
                    │  FastAPI  │ ← REST API
                    │  Backend  │
                    └────┬──────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ┌────▼─────┐    ┌────▼────┐    ┌─────▼─────┐
   │ Storage  │    │Analytics│    │   Cache   │
   │ (SQLite) │    │ Engine  │    │(In-Memory)│
   └──────────┘    └────┬────┘    └───────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
   ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
   │ Pricing │    │  Norm-  │    │Arbitrage│
   │Scheduler│    │alization│    │Detection│
   └────┬────┘    └─────────┘    └─────────┘
        │
   ┌────▼─────────────────────────────────┐
   │      GPU Provider Data Collection    │
   │  AWS | GCP | Azure | RunPod | Vast  │
   └──────────────────────────────────────┘
```

### Cloud Service Mapping

| Component | AWS | GCP | Azure |
|-----------|-----|-----|-------|
| **Compute** | Lambda | Cloud Functions | Azure Functions |
| **Scheduling** | EventBridge | Cloud Scheduler | Timer Trigger |
| **Database** | RDS/DynamoDB | Cloud SQL | Azure SQL |
| **Cache** | ElastiCache | Memorystore | Azure Cache |
| **API Gateway** | API Gateway | API Gateway | API Management |
| **Notifications** | SNS | Pub/Sub | Notification Hubs |

---

## 🚀 Features

### ✅ Implemented

1. **GPU Provider Data Collection**
   - 6 providers: AWS, GCP, Azure, RunPod, Vast.ai, Lambda Labs
   - Standardized data schema
   - Mock data support (no API keys required)

2. **Serverless Scheduler Simulation**
   - 15-minute polling intervals
   - Parallel provider queries
   - Retry with exponential backoff
   - Rate limit handling

3. **Storage & Caching**
   - SQLite database for historical data
   - In-memory cache (14,544x faster than DB queries)
   - Sub-millisecond response times

4. **GPU Performance Normalization**
   - TFLOPs-based performance scoring
   - Cost-per-TFLOPs calculation
   - 11 GPU models supported (A100, H100, V100, RTX 4090, etc.)

5. **Arbitrage Detection Engine**
   - Multi-provider comparison
   - Percentage savings calculation
   - Annual cost projections

6. **Analytics & Trends**
   - Provider reliability scoring
   - Performance tier classification
   - Historical trend analysis

7. **Alert System**
   - Price drop notifications
   - Arbitrage opportunity alerts
   - Availability change detection

8. **FastAPI Backend**
   - RESTful API with Swagger docs
   - CORS-enabled for frontend
   - Cached responses for performance

9. **React Dashboard**
   - Live price comparison table
   - Arbitrage opportunities view
   - Savings calculator

---

## 📦 Installation

### Prerequisites

- Python 3.8+
- Node.js 16+ (for frontend)
- pip

### Backend Setup

```bash
# Clone the repository
cd Cloud-GPU-Cost-Arbitrage-Engine

# Install Python dependencies
pip install -r requirements.txt

# Run the complete system
python main.py
```

### Frontend Setup

```bash
# Navigate to React app
cd frontend/react_app

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will be available at `http://localhost:3000`

---

## 🎮 Usage

### Option 1: Interactive Mode

```bash
python main.py
```

This will:
1. Fetch prices from all providers
2. Analyze arbitrage opportunities
3. Display detailed report
4. Offer to start API server

### Option 2: API Server Only

```bash
python main.py --api-only
# or
uvicorn api.main:app --reload
```

Visit `http://localhost:8000/docs` for interactive API documentation.

### Option 3: Data Fetch Only

```bash
python main.py --fetch-only
```

### Run Individual Tests

```bash
# Test each step independently
python test_step1.py  # Provider data collection
python test_step2.py  # Scheduler
python test_step3.py  # Storage & caching
python test_step4.py  # GPU normalization
python test_step5.py  # Arbitrage detection
```

---

## 📊 API Endpoints

### Prices

- `GET /prices/latest` - Get latest GPU prices
  - Query params: `gpu_model`, `provider`, `limit`
- `GET /prices/history` - Historical prices for a GPU
  - Query params: `gpu_model`, `hours`

### Arbitrage

- `GET /arbitrage/best` - Best arbitrage opportunities
  - Query params: `min_savings_percent`
- `GET /arbitrage/gpu/{gpu_model}` - Arbitrage for specific GPU

### Analytics

- `GET /analytics/trends` - Price trends and statistics
- `GET /analytics/comparison` - Compare providers for a GPU
- `GET /providers/reliability` - Provider reliability scores

### Metadata

- `GET /providers/list` - List all providers
- `GET /gpu/models` - List supported GPU models
- `GET /stats` - Database and cache statistics

### Management

- `POST /prices/refresh` - Manually refresh prices and clear cache

Full interactive documentation: `http://localhost:8000/docs`

---

## 🎓 Cloud Computing Principles Demonstrated

### 1. **Serverless Architecture**
- Event-driven design (scheduler triggers)
- Stateless functions
- Auto-scaling simulation

### 2. **Distributed Systems**
- Parallel provider queries
- Eventual consistency
- Retry mechanisms

### 3. **Caching Strategies**
- Multi-tier caching (in-memory + database)
- TTL-based expiration
- Cache invalidation

### 4. **Cost Optimization**
- Resource allocation analysis
- Comparative pricing
- ROI calculations

### 5. **Data Normalization**
- Cross-provider standardization
- Performance benchmarking
- Apples-to-apples comparison

### 6. **High Availability**
- Retry with exponential backoff
- Graceful degradation
- Provider availability tracking

---

## 🧪 Testing & Validation

All steps include comprehensive test suites:

```bash
# Test results:
✅ STEP 1: 6/6 providers validated
✅ STEP 2: 3 polling cycles, no duplicate timestamps
✅ STEP 3: Cache hit 14,544x faster than DB
✅ STEP 4: Consistent normalization across 24 entries
✅ STEP 5: Detected 3 arbitrage opportunities (up to 96.6% savings)
```

---

## 📈 Sample Output

### Arbitrage Detection

```
#1 - A100
──────────────────────────────────────────────────
🏆 CHEAPEST:  Lambda Labs  (us-tx)
              $1.10/hour  |  55% availability

💸 EXPENSIVE: AWS          (us-west-2)
              $32.77/hour |  92% availability

💰 SAVINGS:   96.6% cheaper
              $31.67/hour
              $23,119.10/month (24/7 usage)
              $277,429.20/year

📊 PROVIDERS: 13 offering this GPU
```

---

## ⚠️ Limitations

### Current Implementation

1. **Mock Data**: Uses static pricing data (no real-time API calls)
   - Real APIs require authentication and have rate limits
   - Mock data is clearly labeled and realistic

2. **Local Deployment**: Runs on local machine
   - Production would use cloud infrastructure
   - Containerization ready (Docker support possible)

3. **Availability Estimates**: Based on typical patterns
   - Real-time availability varies by region/time
   - Production would query live inventory

4. **No Live Deployment**: Academic project scope
   - Not deployed to cloud (cost considerations)
   - Architecture supports cloud deployment

### Production Enhancements

For production deployment, add:

- Real API integrations with cloud providers
- Redis for distributed caching
- PostgreSQL for production database
- Docker containerization
- CI/CD pipeline
- Monitoring and logging (CloudWatch, Datadog)
- Authentication and rate limiting
- WebSocket support for real-time updates

---

## 🗂️ Project Structure

```
cloud-gpu-arbitrage-engine/
│
├── data_collection/           # Step 1: Provider data collection
│   ├── providers/
│   │   ├── aws.py            # AWS EC2 GPU instances
│   │   ├── gcp.py            # Google Cloud GPUs
│   │   ├── azure.py          # Azure GPU VMs
│   │   ├── runpod.py         # RunPod pricing
│   │   ├── vast.py           # Vast.ai marketplace
│   │   └── lambda_labs.py    # Lambda Labs
│   └── scheduler.py          # Step 2: Polling scheduler
│
├── normalization/            # Step 4: Performance normalization
│   ├── gpu_specs.py         # GPU specifications database
│   ├── normalize.py         # Normalization logic
│   └── cost_score.py        # Cost-performance scoring
│
├── storage/                  # Step 3: Data persistence
│   ├── db.py                # SQLite database interface
│   ├── models.py            # Data models
│   └── cache.py             # In-memory caching
│
├── analytics/                # Steps 5-6: Analytics engines
│   ├── arbitrage.py         # Arbitrage detection
│   ├── trends.py            # Trend analysis
│   └── reliability.py       # Provider reliability
│
├── alerts/                   # Step 7: Notification system
│   └── notifier.py          # Alert dispatcher
│
├── api/                      # Step 8: FastAPI backend
│   └── main.py              # REST API server
│
├── frontend/                 # Step 9: React dashboard
│   └── react_app/
│       ├── src/
│       │   ├── App.js
│       │   ├── components/
│       │   │   ├── PriceTable.js
│       │   │   ├── ArbitrageView.js
│       │   │   └── SavingsCalculator.js
│       │   └── App.css
│       └── package.json
│
├── mock_data/
│   └── pricing_samples.json  # Realistic mock data
│
├── test_step1.py through test_step5.py  # Validation tests
├── main.py                   # Main entry point
├── requirements.txt          # Python dependencies
└── README.md                 # This file
```

---

## 🎯 Cost Optimization Logic

### Formula

```python
cost_performance_score = (TFLOPs / price_per_hour) * availability
```

Where:
- **TFLOPs**: GPU compute performance (FP32)
- **price_per_hour**: Provider's hourly rate
- **availability**: Likelihood of getting an instance (0-1)

Higher score = better value

### Example Calculation

**A100 on Lambda Labs:**
- TFLOPs: 19.5
- Price: $1.10/hr
- Availability: 0.55
- **Score**: (19.5 / 1.10) × 0.55 = **9.75**

**A100 on AWS:**
- TFLOPs: 19.5
- Price: $32.77/hr
- Availability: 0.95
- **Score**: (19.5 / 32.77) × 0.95 = **0.56**

**Lambda Labs is 17.4x better value!**

---

## 🚀 Future Enhancements

- [ ] Historical price tracking with charts
- [ ] Email/Slack alert integration
- [ ] Multi-GPU instance support
- [ ] Spot instance pricing
- [ ] Region-specific filtering
- [ ] Custom benchmark weights
- [ ] Machine learning price prediction
- [ ] Mobile app (React Native)

---

## 📚 Learning Outcomes

This project demonstrates:

1. **Cloud Architecture Design**
   - Serverless patterns
   - Microservices communication
   - Data flow management

2. **API Integration**
   - REST API design
   - Error handling
   - Rate limiting

3. **Data Engineering**
   - ETL pipelines
   - Data normalization
   - Caching strategies

4. **Full-Stack Development**
   - Backend (Python/FastAPI)
   - Frontend (React)
   - Database design

5. **Cost Optimization**
   - Comparative analysis
   - ROI calculation
   - Resource allocation

---

## 🤝 Contributing

This is an academic project, but suggestions are welcome:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 👨‍💻 Author

Built as a comprehensive cloud computing project demonstrating:
- Clean architecture
- Cloud computing principles
- Real-world cost optimization
- Production-ready code patterns

---

## 🙏 Acknowledgments

- GPU specifications: NVIDIA official documentation
- Pricing data: Realistic estimates based on public pricing pages
- Cloud architecture: Best practices from AWS, GCP, and Azure documentation

---

## 📞 Support

For questions or issues:
1. Check the API documentation at `/docs`
2. Run individual test files for debugging
3. Review cloud service mapping for production deployment

---

**Built with ❤️ for cloud computing education**

*Demonstrating that you can save hundreds of thousands of dollars per year by making informed cloud provider choices!*
