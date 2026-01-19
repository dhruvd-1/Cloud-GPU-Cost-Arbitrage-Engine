import { motion } from 'framer-motion'
import { BookOpen, Cpu, TrendingUp, Database, Activity, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'

export function Methodology() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-2 border-border/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">System Methodology</CardTitle>
                <CardDescription>Academic framework for cloud GPU cost arbitrage detection</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Abstract */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Abstract</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              This system implements a <strong>simulation-based decision support framework</strong> for analyzing 
              GPU pricing arbitrage opportunities across heterogeneous cloud providers. The architecture demonstrates 
              principles of <strong>multi-cloud cost optimization</strong>, <strong>data normalization</strong>, 
              and <strong>risk-adjusted recommendation algorithms</strong> using educational mock data.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Data Collection & Normalization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-violet-500" />
              <CardTitle>1. Data Collection & Normalization</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Data Sources</h4>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                The system simulates pricing data from six cloud providers: AWS, GCP, Azure (enterprise-grade), 
                and Lambda Labs, RunPod, Vast.ai (GPU-specialized). All data is mock and derived from publicly 
                available pricing pages as of the project date.
              </p>
              
              <div className="bg-muted/30 p-4 rounded-lg border border-border/50 font-mono text-xs">
                <div className="text-muted-foreground mb-2">// Raw data structure</div>
                <div>{"{"}</div>
                <div className="ml-4">gpu_model: string,</div>
                <div className="ml-4">provider: string,</div>
                <div className="ml-4">price_per_hour: number,</div>
                <div className="ml-4">region?: string,</div>
                <div className="ml-4">availability?: number  // 0..1</div>
                <div>{"}"}</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Normalization Process</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="text-emerald-500 mt-1">→</div>
                  <div className="text-muted-foreground">
                    <strong>GPU Specification Mapping:</strong> Each GPU model is mapped to performance metrics 
                    (TFLOPs FP32, memory, architecture) from NVIDIA/AMD official specifications
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-emerald-500 mt-1">→</div>
                  <div className="text-muted-foreground">
                    <strong>Price Standardization:</strong> All prices converted to USD per hour
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="text-emerald-500 mt-1">→</div>
                  <div className="text-muted-foreground">
                    <strong>Availability Scoring:</strong> Provider uptime and GPU availability simulated (0.5-0.99 range)
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cost-Performance Scoring */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-blue-500" />
              <CardTitle>2. Cost-Performance Scoring Algorithm</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Primary Metric</h4>
              <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                <div className="text-center font-mono text-lg mb-2">
                  Score = (TFLOPs / Price) × Availability
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  Higher score indicates better value per dollar
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Component Breakdown</h4>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-background border border-border/50">
                  <div className="font-semibold text-sm mb-1">TFLOPs (Throughput)</div>
                  <div className="text-xs text-muted-foreground">
                    Trillion floating-point operations per second. Measures raw compute capacity 
                    for AI/ML workloads (FP32 precision).
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-background border border-border/50">
                  <div className="font-semibold text-sm mb-1">Price (Hourly Cost)</div>
                  <div className="text-xs text-muted-foreground">
                    USD per hour of GPU usage. Does not include network, storage, or management costs.
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-background border border-border/50">
                  <div className="font-semibold text-sm mb-1">Availability (Uptime)</div>
                  <div className="text-xs text-muted-foreground">
                    Probability that GPU will be available when requested (0-1 scale). 
                    Simulated based on provider tier.
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Arbitrage Detection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <CardTitle>3. Arbitrage Detection Logic</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Definition</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                An arbitrage opportunity exists when the <strong>same GPU model</strong> is offered by multiple 
                providers at significantly different prices, enabling cost savings through provider switching.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Detection Algorithm</h4>
              <div className="bg-muted/30 p-4 rounded-lg border border-border/50 font-mono text-xs space-y-1">
                <div className="text-muted-foreground">// Pseudocode</div>
                <div>for each gpu_model:</div>
                <div className="ml-4">providers = find_all_providers(gpu_model)</div>
                <div className="ml-4">cheapest = min(providers.price)</div>
                <div className="ml-4">for each provider in providers:</div>
                <div className="ml-8">savings = provider.price - cheapest.price</div>
                <div className="ml-8">percentage = (savings / provider.price) * 100</div>
                <div className="ml-8">if percentage {">"} threshold:</div>
                <div className="ml-12">emit_opportunity(gpu_model, provider, savings)</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Filtering Criteria</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <div className="text-muted-foreground">
                    <strong>Minimum Savings Threshold:</strong> 10% price difference (configurable)
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <div className="text-muted-foreground">
                    <strong>Availability Filter:</strong> Both providers must have availability data
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <div className="text-muted-foreground">
                    <strong>Regional Compatibility:</strong> Same GPU model, comparable performance tier
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recommendation Engine */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-yellow-500" />
              <CardTitle>4. Decision Support & Recommendation Engine</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Confidence Score Calculation</h4>
              <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
                <div className="text-center font-mono text-sm mb-2">
                  Confidence = (0.4 × Availability) + (0.4 × Reliability) + (0.2 × Provider_Density)
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  Scale: 0.0 (low confidence) to 1.0 (high confidence)
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Risk Classification</h4>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-green-500">Low Risk</span>
                    <span className="text-xs font-mono text-muted-foreground">Reliability ≥ 95%, Availability ≥ 90%</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Enterprise-safe. Suitable for production ML training and inference.
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-yellow-500">Medium Risk</span>
                    <span className="text-xs font-mono text-muted-foreground">Reliability ≥ 70%, Availability ≥ 60%</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Cost-optimized. Acceptable for development, experimentation, non-critical workloads.
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-red-500">High Risk</span>
                    <span className="text-xs font-mono text-muted-foreground">Reliability {"<"} 70% or Availability {"<"} 60%</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Maximum savings potential. Higher volatility, suitable for fault-tolerant workloads.
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Volatility Indicators</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Provider price volatility is simulated based on historical patterns and provider business models:
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-background border border-border/50 text-center">
                  <div className="text-2xl mb-1">🟢</div>
                  <div className="font-semibold text-xs text-green-500 mb-1">Low Volatility</div>
                  <div className="text-xs text-muted-foreground">Enterprise clouds with stable pricing</div>
                </div>
                <div className="p-3 rounded-lg bg-background border border-border/50 text-center">
                  <div className="text-2xl mb-1">🟡</div>
                  <div className="font-semibold text-xs text-yellow-500 mb-1">Medium Volatility</div>
                  <div className="text-xs text-muted-foreground">Specialized providers with dynamic pricing</div>
                </div>
                <div className="p-3 rounded-lg bg-background border border-border/50 text-center">
                  <div className="text-2xl mb-1">🔴</div>
                  <div className="font-semibold text-xs text-red-500 mb-1">High Volatility</div>
                  <div className="text-xs text-muted-foreground">Spot/marketplace models with fluctuating prices</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Limitations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="border-2 border-yellow-500/30 bg-yellow-500/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <CardTitle className="text-yellow-500">Limitations & Assumptions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="text-yellow-500 mt-1">⚠</div>
                <div className="text-muted-foreground">
                  <strong>Mock Data:</strong> All pricing, availability, and reliability metrics are simulated 
                  and do not reflect real-time cloud provider data
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-yellow-500 mt-1">⚠</div>
                <div className="text-muted-foreground">
                  <strong>Simplified Cost Model:</strong> Does not account for network egress, storage, 
                  management overhead, or commitment discounts
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-yellow-500 mt-1">⚠</div>
                <div className="text-muted-foreground">
                  <strong>Regional Variations:</strong> Pricing varies by region; this system uses average values
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-yellow-500 mt-1">⚠</div>
                <div className="text-muted-foreground">
                  <strong>Performance Parity Assumption:</strong> Assumes identical GPU models perform identically 
                  across providers (may vary due to CPU, memory, network)
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-yellow-500 mt-1">⚠</div>
                <div className="text-muted-foreground">
                  <strong>Static Analysis:</strong> Does not account for spot pricing, auctions, or real-time availability
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Future Work */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Future Enhancements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="text-emerald-500 mt-1">→</div>
                <div>Integration with real cloud provider APIs (AWS Pricing API, GCP Billing API, etc.)</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-emerald-500 mt-1">→</div>
                <div>Historical trend analysis and price prediction using time-series models</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-emerald-500 mt-1">→</div>
                <div>Multi-GPU and cluster-level cost optimization</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-emerald-500 mt-1">→</div>
                <div>Workload-specific recommendations (training vs. inference vs. fine-tuning)</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-emerald-500 mt-1">→</div>
                <div>Automated migration suggestions with cost-benefit analysis</div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-emerald-500 mt-1">→</div>
                <div>Carbon footprint analysis and green cloud optimization</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
