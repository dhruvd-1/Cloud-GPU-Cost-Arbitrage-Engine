import { useState, useEffect, useMemo } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { Calculator as CalcIcon, Zap, AlertCircle, TrendingDown, Shield, ChevronDown, ChevronUp, Target, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { formatCurrency, getProviderColor } from '../../lib/utils'
import { ScatterChart, Scatter, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis } from 'recharts'
import { normalizePrices, unique, type NormalizedPrice } from '../../lib/data'

// Usage profile constants
const USAGE_PROFILES = {
  academic: { label: 'Academic / Research', hours: 4, days: 20, icon: '🎓' },
  startup: { label: 'Startup / Training', hours: 12, days: 25, icon: '🚀' },
  enterprise: { label: 'Enterprise / 24×7', hours: 24, days: 30, icon: '🏢' },
} as const

type UsageProfile = keyof typeof USAGE_PROFILES

// Provider reliability simulation (for decision confidence)
const PROVIDER_RELIABILITY: Record<string, number> = {
  'AWS': 0.99,
  'GCP': 0.98,
  'Azure': 0.97,
  'Lambda Labs': 0.75,
  'RunPod': 0.70,
  'Vast.ai': 0.65,
}

interface CalculatorProps {
  prices: any[]
  loading?: boolean
}

export function Calculator({ prices, loading = false }: CalculatorProps) {
  const [selectedGPU, setSelectedGPU] = useState('')
  const [usageProfile, setUsageProfile] = useState<UsageProfile>('startup')
  const [showDetails, setShowDetails] = useState(false)

  const norm: NormalizedPrice[] = useMemo(() => normalizePrices(prices as any), [prices])
  const gpuModels = useMemo(() => unique(norm.map((p) => p.gpu)), [norm])

  // Get all providers for selected GPU with enriched data
  const providersForGPU = useMemo(() => {
    if (!selectedGPU) return []
    
    return norm
      .filter((p) => p.gpu === selectedGPU)
      .map((p) => ({
        ...p,
        reliability: PROVIDER_RELIABILITY[p.provider] || 0.60,
        volatility: calculateVolatility(p.provider),
      }))
      .sort((a, b) => a.price - b.price) // Sort by price ascending
  }, [norm, selectedGPU])

  // Calculate recommendation
  const recommendation = useMemo(() => {
    if (providersForGPU.length === 0) return null

    const cheapest = providersForGPU[0]
    const mostExpensive = providersForGPU[providersForGPU.length - 1]
    const profile = USAGE_PROFILES[usageProfile]
    
    const hourlySavings = mostExpensive.price - cheapest.price
    const monthlySavings = hourlySavings * profile.hours * profile.days
    const annualSavings = monthlySavings * 12

    // Calculate confidence score
    const availability = cheapest.availability || 0.5
    const reliability = cheapest.reliability
    const providerDensity = Math.min(providersForGPU.length / 6, 1) // Normalize to 0-1
    const confidence = (availability * 0.4 + reliability * 0.4 + providerDensity * 0.2)

    // Determine risk level
    let riskLevel: 'Low' | 'Medium' | 'High'
    let riskColor: string
    if (reliability >= 0.95 && availability >= 0.9) {
      riskLevel = 'Low'
      riskColor = 'text-green-500'
    } else if (reliability >= 0.7 && availability >= 0.6) {
      riskLevel = 'Medium'
      riskColor = 'text-yellow-500'
    } else {
      riskLevel = 'High'
      riskColor = 'text-red-500'
    }

    // Determine recommendation reason
    let reasons: string[] = []
    const savingsPercentage = ((mostExpensive.price - cheapest.price) / mostExpensive.price) * 100
    
    if (savingsPercentage > 50) {
      reasons.push(`${savingsPercentage.toFixed(0)}% cheaper than premium clouds`)
    }
    if (availability >= 0.8) {
      reasons.push('High availability')
    } else if (availability >= 0.5) {
      reasons.push(`Acceptable availability (${(availability * 100).toFixed(0)}%)`)
    } else {
      reasons.push(`Lower availability (${(availability * 100).toFixed(0)}%)`)
    }
    if (reliability >= 0.95) {
      reasons.push('Enterprise-grade reliability')
    } else if (reliability >= 0.7) {
      reasons.push('Medium reliability (simulated)')
    } else {
      reasons.push('Lower reliability (cost-optimized)')
    }

    return {
      provider: cheapest,
      compareProvider: mostExpensive,
      hourlySavings,
      monthlySavings,
      annualSavings,
      confidence,
      riskLevel,
      riskColor,
      reasons,
      savingsPercentage,
    }
  }, [providersForGPU, usageProfile])

  // Animated numbers using springs
  const hourlySpring = useSpring(0, { stiffness: 90, damping: 20 })
  const monthlySpring = useSpring(0, { stiffness: 90, damping: 20 })
  const annualSpring = useSpring(0, { stiffness: 90, damping: 20 })

  const hourlyDisplay = useTransform(hourlySpring, (v) => formatCurrency(v))
  const monthlyDisplay = useTransform(monthlySpring, (v) => formatCurrency(v))
  const annualDisplay = useTransform(annualSpring, (v) => formatCurrency(v))

  useEffect(() => {
    if (recommendation) {
      hourlySpring.set(Math.max(0, recommendation.hourlySavings))
      monthlySpring.set(Math.max(0, recommendation.monthlySavings))
      annualSpring.set(Math.max(0, recommendation.annualSavings))
    } else {
      hourlySpring.set(0)
      monthlySpring.set(0)
      annualSpring.set(0)
    }
  }, [recommendation, hourlySpring, monthlySpring, annualSpring])

  // Risk vs Cost matrix data
  const riskCostData = useMemo(() => {
    return providersForGPU.map((p) => ({
      provider: p.provider,
      price: p.price,
      reliability: p.reliability * 100,
      volatility: p.volatility,
      size: (p.availability || 0.5) * 1000,
      color: getProviderColor(p.provider),
    }))
  }, [providersForGPU])

  return (
    <div className="space-y-6">
      {loading && (
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-1/3 bg-muted rounded" />
            <div className="h-24 w-full bg-muted rounded" />
          </div>
        </Card>
      )}
      
      {/* Input Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-2 border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <CalcIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle>Decision Support Calculator</CardTitle>
                  <CardDescription>AI-powered cost optimization recommendations</CardDescription>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-semibold">
                INTELLIGENT
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* GPU Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">GPU Model</label>
              <select
                value={selectedGPU}
                onChange={(e) => setSelectedGPU(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                <option value="">Select GPU model to analyze...</option>
                {gpuModels.map(gpu => (
                  <option key={gpu} value={gpu}>{gpu}</option>
                ))}
              </select>
            </div>

            {/* Usage Profile Selection */}
            <div>
              <label className="text-sm font-medium mb-3 block">Usage Profile</label>
              <div className="grid grid-cols-3 gap-3">
                {(Object.keys(USAGE_PROFILES) as UsageProfile[]).map((profile) => {
                  const config = USAGE_PROFILES[profile]
                  const isSelected = usageProfile === profile
                  return (
                    <button
                      key={profile}
                      onClick={() => setUsageProfile(profile)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-border hover:border-border/80 bg-background'
                      }`}
                    >
                      <div className="text-2xl mb-2">{config.icon}</div>
                      <div className="text-sm font-semibold mb-1">{config.label.split(' / ')[0]}</div>
                      <div className="text-xs text-muted-foreground">
                        {config.hours}h/day, {config.days}d/mo
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Academic Disclaimer */}
            <div className="flex items-start gap-2 p-3 rounded-lg border border-blue-500/30 bg-blue-500/10">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-semibold text-blue-500 mb-1">Simulation-Based Decision Model</div>
                <div className="text-muted-foreground">
                  This is a simulated decision-support model for educational purposes. Reliability and volatility metrics are derived from simulated data patterns.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recommendation Card */}
      {recommendation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-green-500/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <CardTitle className="text-emerald-500">System Recommendation</CardTitle>
                    <CardDescription>Optimal cost-performance balance</CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Confidence Score</div>
                  <div className="text-2xl font-bold font-mono text-emerald-500">
                    {recommendation.confidence.toFixed(2)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recommended Provider */}
              <div>
                <div className="text-sm text-muted-foreground mb-2">Recommended Provider</div>
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getProviderColor(recommendation.provider.provider) }}
                  />
                  <div className="text-2xl font-bold">{recommendation.provider.provider}</div>
                  <div className="px-2 py-1 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-500">
                    BEST VALUE
                  </div>
                </div>
                
                {/* Reasons */}
                <div className="space-y-2">
                  <div className="text-sm font-medium">Analysis:</div>
                  {recommendation.reasons.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <div className="text-emerald-500 mt-0.5">✓</div>
                      <div className="text-muted-foreground">{reason}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Savings Summary */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Hourly Savings</div>
                  <motion.div className="text-xl font-bold font-mono text-emerald-500">
                    {hourlyDisplay as any}
                  </motion.div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Monthly Savings</div>
                  <motion.div className="text-xl font-bold font-mono text-emerald-500">
                    {monthlyDisplay as any}
                  </motion.div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Annual Savings</div>
                  <motion.div className="text-xl font-bold font-mono text-emerald-500">
                    {annualDisplay as any}
                  </motion.div>
                </div>
              </div>

              {/* Risk Assessment */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
                <div className="flex items-center gap-2">
                  <Shield className={`w-5 h-5 ${recommendation.riskColor}`} />
                  <div>
                    <div className="text-sm font-semibold">Risk Level: <span className={recommendation.riskColor}>{recommendation.riskLevel}</span></div>
                    <div className="text-xs text-muted-foreground">
                      {recommendation.riskLevel === 'Low' && 'Enterprise-safe choice with high reliability'}
                      {recommendation.riskLevel === 'Medium' && 'Cost-optimized with acceptable reliability'}
                      {recommendation.riskLevel === 'High' && 'Maximum savings with higher volatility'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted/50 transition-colors flex items-center gap-2 text-sm"
                >
                  {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  Details
                </button>
              </div>

              {/* Detailed Breakdown (Collapsible) */}
              {showDetails && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 pt-4 border-t border-border/50"
                >
                  <div className="text-sm font-semibold mb-2">Calculation Breakdown</div>
                  
                  <div className="space-y-2 font-mono text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cheapest Option:</span>
                      <span>{recommendation.provider.provider} @ {formatCurrency(recommendation.provider.price)}/hr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Most Expensive:</span>
                      <span>{recommendation.compareProvider.provider} @ {formatCurrency(recommendation.compareProvider.price)}/hr</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border/30">
                      <span className="text-muted-foreground">Hourly Difference:</span>
                      <span className="text-emerald-500">{formatCurrency(recommendation.hourlySavings)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Usage Pattern:</span>
                      <span>{USAGE_PROFILES[usageProfile].hours}h/day × {USAGE_PROFILES[usageProfile].days} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Impact:</span>
                      <span className="text-emerald-500">{formatCurrency(recommendation.monthlySavings)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t border-border/30">
                      <span>Annual Savings:</span>
                      <span className="text-emerald-500">{formatCurrency(recommendation.annualSavings)}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground">
                    <strong>Formula:</strong> (Most Expensive - Cheapest) × Hours/Day × Days/Month × 12
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Risk vs Cost Matrix */}
      {providersForGPU.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-violet-500" />
                <div>
                  <CardTitle>Risk vs Cost Analysis</CardTitle>
                  <CardDescription>Multi-dimensional provider comparison for {selectedGPU}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      type="number" 
                      dataKey="price" 
                      name="Price" 
                      unit="/hr"
                      stroke="hsl(var(--muted-foreground))"
                      label={{ value: 'Price per Hour ($)', position: 'bottom', fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="reliability" 
                      name="Reliability" 
                      unit="%"
                      stroke="hsl(var(--muted-foreground))"
                      label={{ value: 'Reliability Score (%)', angle: -90, position: 'left', fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <ZAxis type="number" dataKey="size" range={[100, 800]} />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="bg-card border border-border rounded-lg p-3 shadow-xl">
                              <div className="font-semibold mb-2" style={{ color: data.color }}>
                                {data.provider}
                              </div>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between gap-4">
                                  <span className="text-muted-foreground">Price:</span>
                                  <span className="font-mono">{formatCurrency(data.price)}/hr</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-muted-foreground">Reliability:</span>
                                  <span className="font-mono">{data.reliability.toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-muted-foreground">Volatility:</span>
                                  <span className={`font-semibold ${
                                    data.volatility === 'Low' ? 'text-green-500' :
                                    data.volatility === 'Medium' ? 'text-yellow-500' :
                                    'text-red-500'
                                  }`}>{data.volatility}</span>
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Scatter name="Providers" data={riskCostData}>
                      {riskCostData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              
              {/* Quadrant Legend */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border/50">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5" />
                  <div>
                    <div className="text-sm font-semibold">High Cost, Low Reliability</div>
                    <div className="text-xs text-muted-foreground">Avoid this quadrant</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                  <div>
                    <div className="text-sm font-semibold">High Cost, High Reliability</div>
                    <div className="text-xs text-muted-foreground">Enterprise clouds (AWS/GCP/Azure)</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5" />
                  <div>
                    <div className="text-sm font-semibold">Low Cost, Low Reliability</div>
                    <div className="text-xs text-muted-foreground">Maximum savings, higher risk</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5" />
                  <div>
                    <div className="text-sm font-semibold">Low Cost, High Reliability ⭐</div>
                    <div className="text-xs text-muted-foreground">Optimal balance (recommended)</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Provider Comparison Table */}
      {providersForGPU.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>All Providers for {selectedGPU}</CardTitle>
              <CardDescription>Comprehensive comparison with volatility indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-sm font-semibold">Provider</th>
                      <th className="text-right py-3 px-2 text-sm font-semibold">Price/Hour</th>
                      <th className="text-right py-3 px-2 text-sm font-semibold">Availability</th>
                      <th className="text-right py-3 px-2 text-sm font-semibold">Reliability</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold">Volatility</th>
                      <th className="text-right py-3 px-2 text-sm font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providersForGPU.map((provider, idx) => {
                      const isRecommended = recommendation && provider.provider === recommendation.provider.provider
                      return (
                        <tr 
                          key={provider.provider} 
                          className={`border-b border-border/50 ${isRecommended ? 'bg-emerald-500/5' : ''}`}
                        >
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: getProviderColor(provider.provider) }}
                              />
                              <span className="font-medium">{provider.provider}</span>
                              {idx === 0 && (
                                <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-500">
                                  CHEAPEST
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-2 text-right font-mono text-sm">
                            {formatCurrency(provider.price)}
                          </td>
                          <td className="py-3 px-2 text-right font-mono text-sm">
                            {((provider.availability || 0.5) * 100).toFixed(0)}%
                          </td>
                          <td className="py-3 px-2 text-right font-mono text-sm">
                            {(provider.reliability * 100).toFixed(0)}%
                          </td>
                          <td className="py-3 px-2 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              provider.volatility === 'Low' ? 'bg-green-500/20 text-green-500' :
                              provider.volatility === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' :
                              'bg-red-500/20 text-red-500'
                            }`}>
                              {provider.volatility}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            {provider.reliability >= 0.95 && (provider.availability || 0) >= 0.9 ? (
                              <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-500/20 text-blue-500">
                                Enterprise-Safe
                              </span>
                            ) : isRecommended ? (
                              <span className="px-2 py-1 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-500">
                                Balanced ⭐
                              </span>
                            ) : idx === 0 ? (
                              <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-500/20 text-yellow-500">
                                High Savings
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}

// Helper function to calculate volatility based on provider
function calculateVolatility(provider: string): 'Low' | 'Medium' | 'High' {
  const volatilityMap: Record<string, 'Low' | 'Medium' | 'High'> = {
    'AWS': 'Low',
    'GCP': 'Low',
    'Azure': 'Low',
    'Lambda Labs': 'Medium',
    'RunPod': 'Medium',
    'Vast.ai': 'High',
  }
  return volatilityMap[provider] || 'Medium'
}
