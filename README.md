# ⚡ Cloud GPU Cost Arbitrage Engine

**Academic Cloud Computing Project** | Demonstrates cloud architecture principles and cost optimization strategies

---

## 🎓 Project Overview

This is an **educational project** built to demonstrate cloud computing concepts, distributed systems principles, and cost optimization strategies in multi-cloud environments. The system simulates a GPU pricing comparison engine that would help organizations make informed decisions about cloud resource allocation.

### Educational Purpose

This project demonstrates:
- Serverless architecture patterns
- Multi-cloud integration strategies
- Data normalization across providers
- Caching and storage optimization
- RESTful API design
- Full-stack application development

### Important Academic Note

⚠️ **All pricing data in this project is simulated for educational purposes.** Real cloud provider APIs require:
- Authentication credentials (API keys, service accounts)
- Billing accounts and payment methods
- Rate limiting and quota management
- Legal agreements and terms of service

For this academic project:
- ✅ Mock data is used to demonstrate functionality
- ✅ All simulated data is clearly labeled
- ✅ System architecture mirrors real-world patterns
- ✅ All code is designed to be extended with real APIs

---

## 🏗️ System Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                         │
│              React Dashboard (Frontend)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                    ┌────▼──────┐
                    │  FastAPI  │ ← REST API Layer
                    │  Backend  │
                    └────┬──────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
   ┌────▼─────┐    ┌────▼────┐    ┌─────▼─────┐
   │ Storage  │    │Analytics│    │   Cache   │
   │  Layer   │    │  Layer  │    │   Layer   │
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
   │      Data Collection Layer           │
   │  Multiple Provider Connectors        │
   └──────────────────────────────────────┘
```

### Cloud Service Mapping (Educational)

This project demonstrates patterns used in production cloud deployments:

| Component | AWS Example | GCP Example | Azure Example | Purpose |
|-----------|-------------|-------------|---------------|---------|
| **Compute** | Lambda | Cloud Functions | Azure Functions | Serverless execution |
| **Scheduling** | EventBridge | Cloud Scheduler | Timer Trigger | Periodic tasks |
| **Database** | RDS/DynamoDB | Cloud SQL/Firestore | Azure SQL/Cosmos DB | Data persistence |
| **Cache** | ElastiCache | Memorystore | Azure Cache | Performance optimization |
| **API** | API Gateway | API Gateway | API Management | REST endpoints |
| **Notifications** | SNS | Pub/Sub | Notification Hubs | Event distribution |

---

## 📚 Learning Objectives

### Cloud Computing Concepts Demonstrated

1. **Serverless Architecture**
   - Event-driven design patterns
   - Stateless function execution
   - Automatic scaling simulation
   - Cost-per-execution model

2. **Distributed Systems Principles**
   - Parallel data collection
   - Retry mechanisms with exponential backoff
   - Graceful degradation
   - Fault tolerance strategies

3. **Multi-Cloud Strategy**
   - Provider abstraction layers
   - Standardized data schemas
   - Cross-provider comparison methodology
   - Vendor lock-in mitigation

4. **Performance Optimization**
   - Multi-tier caching strategies
   - Database query optimization
   - Response time improvement techniques
   - Resource utilization patterns

5. **Data Engineering**
   - ETL pipeline design
   - Data normalization techniques
   - Time-series data management
   - Analytics processing

6. **API Design**
   - RESTful architecture
   - OpenAPI/Swagger documentation
   - CORS and security considerations
   - Versioning strategies

---

## 🔬 Simulated Data & Methodology

### Data Sources

This project uses **simulated pricing data** based on:
- Publicly available pricing pages (as of project date)
- Typical cloud provider pricing patterns
- Realistic availability estimates
- Standard GPU performance benchmarks

### Why Simulated Data?

Real-time cloud pricing APIs face several challenges for academic projects:

**Technical Barriers:**
- Require cloud accounts with billing enabled
- Need API authentication credentials
- Subject to rate limits and quotas
- May incur costs for API calls

**Academic Context:**
- Demonstrates concepts without infrastructure costs
- Allows reproducible results for grading
- Focuses on architecture over data acquisition
- Suitable for offline demonstration

### Data Realism

The mock data includes:
- 6 major cloud providers (AWS, GCP, Azure, RunPod, Vast.ai, Lambda Labs)
- 25+ GPU pricing entries
- Multiple regions per provider
- Realistic price ranges and availability metrics
- Timestamp-based historical simulation

---

## 📊 Educational Findings

### Simulated Cost Analysis

The system demonstrates cost variance across providers using simulated data:

**Example: A100 GPU Comparison (Simulated)**
- Provider A: $1.10/hour (simulated)
- Provider B: $32.77/hour (simulated)
- Theoretical savings: 96.6%
- Annual impact (24/7 usage): ~$277K (hypothetical calculation)

**Note:** These are educational examples demonstrating the *methodology* for cost comparison, not actual current prices.

### Performance Metrics Demonstrated

The project illustrates various optimization techniques:

- **Caching effectiveness**: In-memory cache vs. database queries
- **Parallel execution**: Multiple provider queries simultaneously
- **Data normalization**: TFLOPs-based performance scoring
- **Query optimization**: Indexed database lookups

---

## 🛠️ Technical Implementation

### Technologies Used

**Backend:**
- Python 3.8+
- FastAPI (REST framework)
- SQLite (local database)
- In-memory caching

**Frontend:**
- React 18
- Modern JavaScript (ES6+)
- CSS3 with responsive design

**Architecture:**
- RESTful API design
- Component-based UI
- Modular Python packages
- Separation of concerns

### Key Components

1. **Provider Connectors** (6 implementations)
   - Base class with common interface
   - Mock data integration
   - Error handling patterns
   - Extension points for real APIs

2. **Scheduler System**
   - Simulates periodic polling
   - Parallel execution pattern
   - Retry logic with exponential backoff
   - Rate limiting awareness

3. **Storage Layer**
   - SQLite for data persistence
   - Optimized indexes for queries
   - In-memory cache for performance
   - TTL-based cache expiration

4. **Normalization Engine**
   - GPU performance database (11 models)
   - TFLOPs-based scoring
   - Cost-per-performance calculation
   - Availability weighting

5. **Arbitrage Detector**
   - Multi-provider comparison
   - Statistical analysis
   - Savings calculation
   - Ranking algorithms

6. **REST API**
   - 15+ endpoints
   - OpenAPI documentation
   - Request validation
   - Response caching

7. **React Dashboard**
   - Three main views
   - Interactive filtering
   - Real-time calculations
   - Responsive layout

---

## 📦 Installation & Setup

### Prerequisites

- Python 3.8 or higher
- Node.js 16+ (for frontend)
- pip package manager
- Basic command line knowledge

### Backend Setup

```bash
# Navigate to project directory
cd Cloud-GPU-Cost-Arbitrage-Engine

# Install Python dependencies
pip install -r requirements.txt

# Run the system
python main.py
```

### Frontend Setup

```bash
# Navigate to React application
cd frontend/react_app

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will be available at `http://localhost:3000`

---

## 🎮 Usage Examples

### Option 1: Complete Demonstration

```bash
python main.py
```

This will:
1. Load simulated prices from all providers
2. Perform arbitrage analysis
3. Display detailed comparison report
4. Optionally start the API server

### Option 2: API Server Mode

```bash
python main.py --api-only
```

Visit `http://localhost:8000/docs` for interactive API documentation.

### Option 3: Data Analysis Only

```bash
python main.py --fetch-only
```

### Running Tests

```bash
# Test individual components
python test_step1.py  # Provider data collection
python test_step2.py  # Scheduler system
python test_step3.py  # Storage and caching
python test_step4.py  # Performance normalization
python test_step5.py  # Arbitrage detection
```

---

## 📍 API Endpoints

### Price Information

- `GET /prices/latest` - Retrieve latest GPU prices
  - Query parameters: `gpu_model`, `provider`, `limit`
- `GET /prices/history` - Historical price data
  - Query parameters: `gpu_model`, `hours`

### Arbitrage Analysis

- `GET /arbitrage/best` - Best arbitrage opportunities
  - Query parameters: `min_savings_percent`
- `GET /arbitrage/gpu/{gpu_model}` - GPU-specific opportunities

### Analytics

- `GET /analytics/trends` - Price trend analysis
- `GET /analytics/comparison` - Provider comparison
- `GET /providers/reliability` - Reliability scoring

### Metadata

- `GET /providers/list` - Available providers
- `GET /gpu/models` - Supported GPU models
- `GET /stats` - System statistics

Full interactive documentation: `http://localhost:8000/docs`

---

## 🎯 Cost Optimization Methodology

### Performance Normalization Formula

```
cost_performance_score = (TFLOPs / price_per_hour) × availability
```

Where:
- **TFLOPs**: GPU compute performance (single-precision)
- **price_per_hour**: Provider's hourly rate
- **availability**: Instance availability (0-1 scale)

Higher score indicates better value proposition.

### Example Calculation (Educational)

**Scenario: Comparing two providers for A100 GPU**

Provider A:
- TFLOPs: 19.5
- Price: $1.10/hr
- Availability: 0.55
- Score: (19.5 / 1.10) × 0.55 = 9.75

Provider B:
- TFLOPs: 19.5
- Price: $32.77/hr
- Availability: 0.95
- Score: (19.5 / 32.77) × 0.95 = 0.56

This demonstrates how the methodology would identify Provider A as offering better value.

---

## 🗂️ Project Structure

```
cloud-gpu-arbitrage-engine/
│
├── data_collection/           # Provider integration layer
│   ├── providers/
│   │   ├── aws.py            # AWS connector
│   │   ├── gcp.py            # GCP connector
│   │   ├── azure.py          # Azure connector
│   │   ├── runpod.py         # RunPod connector
│   │   ├── vast.py           # Vast.ai connector
│   │   └── lambda_labs.py    # Lambda Labs connector
│   └── scheduler.py          # Polling scheduler
│
├── normalization/            # Performance scoring
│   ├── gpu_specs.py         # GPU specifications database
│   ├── normalize.py         # Normalization logic
│   └── cost_score.py        # Scoring algorithms
│
├── storage/                  # Data persistence
│   ├── db.py                # Database interface
│   ├── models.py            # Data models
│   └── cache.py             # Caching layer
│
├── analytics/                # Analysis engines
│   ├── arbitrage.py         # Arbitrage detection
│   ├── trends.py            # Trend analysis
│   └── reliability.py       # Reliability scoring
│
├── alerts/                   # Notification system
│   └── notifier.py          # Alert dispatcher
│
├── api/                      # REST API
│   └── main.py              # FastAPI application
│
├── frontend/                 # User interface
│   └── react_app/
│       ├── src/
│       │   ├── App.js
│       │   └── components/
│       └── package.json
│
├── mock_data/
│   └── pricing_samples.json  # Simulated pricing data
│
├── test_step1-5.py           # Component tests
├── main.py                   # Application entry point
├── requirements.txt          # Python dependencies
├── README.md                 # This file
└── QUICKSTART.md            # Quick start guide
```

---

## 🔍 Testing & Validation

### Test Coverage

Each major component includes validation tests:

**Step 1 - Provider Integration:**
- Schema validation
- Data format consistency
- Mock data loading
- Error handling

**Step 2 - Scheduler:**
- Parallel execution
- Timestamp uniqueness
- Retry mechanism
- Error recovery

**Step 3 - Storage:**
- Database operations (CRUD)
- Cache functionality
- Performance comparison
- Data persistence

**Step 4 - Normalization:**
- GPU specifications lookup
- Score calculation
- Ranking consistency
- Data integrity

**Step 5 - Arbitrage Detection:**
- Opportunity identification
- Savings calculation
- Provider comparison
- Result determinism

---

## ⚠️ Limitations & Scope

### Current Implementation

1. **Simulated Data**
   - All pricing data is mock/simulated
   - Based on publicly available information
   - Not real-time or dynamically updated
   - Suitable for educational demonstration

2. **Local Execution**
   - Runs on local machine
   - Not deployed to cloud infrastructure
   - No external dependencies required
   - Suitable for academic environment

3. **Academic Scope**
   - Built for learning and demonstration
   - Not intended for production use
   - Focuses on architecture over scale
   - Emphasizes principles over implementation

### Extension Opportunities

For real-world application, would require:

- Integration with actual cloud provider APIs
- Authentication and authorization
- Distributed caching (Redis/Memcached)
- Production database (PostgreSQL)
- Containerization (Docker)
- Monitoring and logging
- CI/CD pipeline
- Security hardening

---

## 🎓 Educational Outcomes

### Skills Demonstrated

**Cloud Computing:**
- Multi-cloud architecture understanding
- Serverless design patterns
- Cost optimization strategies
- Service selection criteria

**Software Engineering:**
- RESTful API design
- Database schema design
- Caching strategies
- Error handling patterns

**Full-Stack Development:**
- Backend: Python/FastAPI
- Frontend: React
- API integration
- State management

**Data Engineering:**
- Data normalization
- ETL processes
- Time-series analysis
- Performance metrics

---

## 📝 Academic Honesty Statement

This project is designed for educational purposes to demonstrate:
- Understanding of cloud computing architectures
- Ability to design multi-tier systems
- Knowledge of performance optimization techniques
- Full-stack development capabilities

All simulated data is clearly marked and documented. The architecture and methodology are suitable for extension to real-world scenarios with appropriate API integrations and cloud deployments.

---

## 🤝 Contributing

This is an academic project. Suggestions for improvements are welcome:

1. Fork the repository
2. Create a feature branch
3. Submit a pull request with clear description

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

- GPU specifications: NVIDIA official documentation
- Architecture patterns: AWS, GCP, Azure best practices
- Educational framework: Cloud computing course materials
- Mock data: Based on publicly available pricing information

---

## 📞 Support & Questions

For technical questions:
1. Review API documentation at `/docs`
2. Check test files for usage examples
3. Consult QUICKSTART.md for setup guidance

---

**Built for educational purposes** | Demonstrates cloud computing principles and cost optimization strategies
