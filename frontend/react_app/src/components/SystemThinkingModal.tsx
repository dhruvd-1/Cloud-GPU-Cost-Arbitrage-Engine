import { X, Brain, Layers, Zap, Database, TrendingUp, Shield, Activity } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface SystemThinkingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SystemThinkingModal({ isOpen, onClose }: SystemThinkingModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          className="bg-card border-2 border-border rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">How This System Thinks</h2>
                  <p className="text-sm text-white/80 mt-1">Understanding the decision-support architecture</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] space-y-6">
            {/* Architecture Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Layers className="w-5 h-5 text-blue-500" />
                  <CardTitle>Multi-Layer Architecture</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">1. Data Collection Layer</span>
                      <span className="text-xs font-mono text-muted-foreground">Python + Async</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Simulates parallel queries to 6 cloud providers (AWS, GCP, Azure, Lambda Labs, RunPod, Vast.ai). 
                      Uses provider abstraction pattern for extensibility.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">2. Normalization Engine</span>
                      <span className="text-xs font-mono text-muted-foreground">Data Transformation</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Standardizes heterogeneous pricing data. Maps 30+ GPU models to performance metrics (TFLOPs, memory). 
                      Calculates cost-performance scores using weighted formulas.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">3. Storage & Caching</span>
                      <span className="text-xs font-mono text-muted-foreground">SQLite + In-Memory</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Two-tier persistence: In-memory cache (300s TTL) for fast reads, SQLite for historical analysis. 
                      Indexed queries for sub-millisecond lookups.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm">4. Analytics & Decision Logic</span>
                      <span className="text-xs font-mono text-muted-foreground">Business Rules</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Arbitrage detection algorithm identifies same-GPU price differences ≥10%. Risk classification 
                      based on reliability and availability matrices. Confidence scoring using multi-factor weighting.
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm text-emerald-500">5. REST API Layer</span>
                      <span className="text-xs font-mono text-muted-foreground">FastAPI</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      15+ RESTful endpoints. CORS-enabled for frontend. OpenAPI/Swagger documentation. 
                      Response caching and rate limiting ready for production.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Arbitrage Detection Logic */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  <CardTitle>Arbitrage Detection Algorithm</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="bg-muted/30 p-4 rounded-lg border border-border font-mono text-xs">
                    <div className="text-muted-foreground mb-2">// Core Logic</div>
                    <div className="space-y-1">
                      <div><span className="text-violet-400">function</span> <span className="text-blue-400">detectArbitrage</span>(gpu_model):</div>
                      <div className="ml-4">providers = <span className="text-emerald-400">fetchAllProviders</span>(gpu_model)</div>
                      <div className="ml-4">cheapest = <span className="text-yellow-400">min</span>(providers, by: price)</div>
                      <div className="ml-4"></div>
                      <div className="ml-4"><span className="text-violet-400">for</span> provider <span className="text-violet-400">in</span> providers:</div>
                      <div className="ml-8">savings = provider.price - cheapest.price</div>
                      <div className="ml-8">percentage = (savings / provider.price) * 100</div>
                      <div className="ml-8"></div>
                      <div className="ml-8"><span className="text-violet-400">if</span> percentage {">"} <span className="text-emerald-400">THRESHOLD</span>:</div>
                      <div className="ml-12">confidence = <span className="text-blue-400">calculateConfidence</span>(provider)</div>
                      <div className="ml-12">risk = <span className="text-blue-400">assessRisk</span>(provider)</div>
                      <div className="ml-12"><span className="text-violet-400">yield</span> Opportunity(savings, confidence, risk)</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-background border border-border text-center">
                      <div className="text-2xl mb-1">≥10%</div>
                      <div className="text-xs text-muted-foreground">Minimum savings threshold</div>
                    </div>
                    <div className="p-3 rounded-lg bg-background border border-border text-center">
                      <div className="text-2xl mb-1">0.0-1.0</div>
                      <div className="text-xs text-muted-foreground">Confidence score range</div>
                    </div>
                    <div className="p-3 rounded-lg bg-background border border-border text-center">
                      <div className="text-2xl mb-1">3 Tiers</div>
                      <div className="text-xs text-muted-foreground">Risk classification</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Decision Support Model */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-yellow-500" />
                  <CardTitle>Intelligent Decision Support</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-semibold text-sm mb-3">Multi-Factor Confidence Scoring</div>
                  <div className="bg-muted/30 p-4 rounded-lg border border-border">
                    <div className="text-center font-mono text-sm mb-3">
                      Confidence = (0.4 × Availability) + (0.4 × Reliability) + (0.2 × Provider_Density)
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="text-center">
                        <div className="font-semibold mb-1">Availability</div>
                        <div className="text-muted-foreground">GPU uptime probability</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold mb-1">Reliability</div>
                        <div className="text-muted-foreground">Provider stability score</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold mb-1">Density</div>
                        <div className="text-muted-foreground">Market competition</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="font-semibold text-sm mb-3">Risk-Adjusted Recommendations</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <div className="flex-1">
                        <div className="font-semibold text-xs text-green-500">Low Risk (Enterprise-Safe)</div>
                        <div className="text-xs text-muted-foreground">Reliability ≥95%, Availability ≥90%. AWS/GCP/Azure tier.</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      <div className="flex-1">
                        <div className="font-semibold text-xs text-yellow-500">Medium Risk (Balanced)</div>
                        <div className="text-xs text-muted-foreground">Reliability 70-95%, Availability 60-90%. Recommended for most workloads.</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <div className="flex-1">
                        <div className="font-semibold text-xs text-red-500">High Risk (Cost-Optimized)</div>
                        <div className="text-xs text-muted-foreground">Reliability {"<"}70% or Availability {"<"}60%. Maximum savings potential.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Simulation */}
            <Card className="border-2 border-blue-500/30 bg-blue-500/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-blue-500" />
                  <CardTitle className="text-blue-500">Simulation-Based Intelligence</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground leading-relaxed">
                  This system uses <strong>simulated data as a feature</strong>, not a limitation. All metrics are derived 
                  from realistic patterns observed in cloud pricing markets:
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-background border border-border">
                    <div className="font-semibold text-xs mb-2">Price Volatility</div>
                    <div className="text-xs text-muted-foreground">
                      Enterprise clouds (AWS/GCP/Azure) = Low<br/>
                      Specialized providers = Medium/High
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-background border border-border">
                    <div className="font-semibold text-xs mb-2">Reliability Scores</div>
                    <div className="text-xs text-muted-foreground">
                      Based on provider SLAs and<br/>
                      infrastructure maturity
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-background border border-border">
                    <div className="font-semibold text-xs mb-2">Availability Patterns</div>
                    <div className="text-xs text-muted-foreground">
                      Spot/marketplace = 50-70%<br/>
                      On-demand = 85-99%
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-background border border-border">
                    <div className="font-semibold text-xs mb-2">Performance Metrics</div>
                    <div className="text-xs text-muted-foreground">
                      From official NVIDIA/AMD<br/>
                      specifications (TFLOPs, memory)
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-xs">
                  <strong className="text-yellow-500">Academic Advantage:</strong>
                  <span className="text-muted-foreground ml-1">
                    Simulation enables repeatable experiments, sensitivity analysis, and "what-if" scenarios 
                    impossible with live API rate limits and costs.
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Technology Stack */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-violet-500" />
                  <CardTitle>Technology Stack</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="font-semibold text-xs mb-2 text-muted-foreground">BACKEND</div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span>Framework</span>
                        <span className="font-mono text-violet-500">FastAPI</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>Database</span>
                        <span className="font-mono text-violet-500">SQLite</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>Cache</span>
                        <span className="font-mono text-violet-500">In-Memory</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>Async</span>
                        <span className="font-mono text-violet-500">httpx + aiohttp</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-xs mb-2 text-muted-foreground">FRONTEND</div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span>Framework</span>
                        <span className="font-mono text-emerald-500">React 19 + TS</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>Build</span>
                        <span className="font-mono text-emerald-500">Vite</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>Styling</span>
                        <span className="font-mono text-emerald-500">Tailwind + shadcn</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>Charts</span>
                        <span className="font-mono text-emerald-500">Recharts</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Production Readiness */}
            <Card className="border-2 border-emerald-500/30 bg-emerald-500/5">
              <CardHeader>
                <CardTitle className="text-emerald-500">Production Evolution Path</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2">
                    <Zap className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div className="text-muted-foreground">
                      <strong>Phase 1:</strong> Replace mock providers with real cloud APIs (AWS Pricing API, GCP Cloud Billing API)
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Zap className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div className="text-muted-foreground">
                      <strong>Phase 2:</strong> Deploy to cloud (AWS Lambda/ECS, GCP Cloud Run, or Azure Functions)
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Zap className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div className="text-muted-foreground">
                      <strong>Phase 3:</strong> Add authentication (OAuth2/JWT), rate limiting, monitoring (Datadog/New Relic)
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Zap className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div className="text-muted-foreground">
                      <strong>Phase 4:</strong> Implement ML prediction models for price forecasting and demand planning
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
