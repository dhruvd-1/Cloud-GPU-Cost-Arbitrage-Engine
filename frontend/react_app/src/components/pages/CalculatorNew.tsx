import { useState, useMemo } from 'react'
import { Target, Shield, AlertCircle, TrendingDown, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { formatCurrency, getProviderColor } from '../../lib/utils'
import { ScatterChart, Scatter, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis } from 'recharts'

interface CalculatorProps {
  prices: any[]
}

const USAGE_PROFILES = {
  academic: { label: 'Academic / Research', hours: 4, days: 20, icon: '🎓', desc: '4h/day, 20d/mo' },
  startup: { label: 'Startup / Training', hours: 12, days: 25, icon: '🚀', desc: '12h/day, 25d/mo' },
  enterprise: { label: 'Enterprise / 24×7', hours: 24, days: 30, icon: '🏢', desc: '24h/day, 30d/mo' },
} as const

type UsageProfile = keyof typeof USAGE_PROFILES

const PROVIDER_RELIABILITY: Record<string, number> = {
  'AWS': 0.99,
  'GCP': 0.98,
  'Azure': 0.97,
  'Lambda Labs': 0.75,
  'RunPod': 0.70,
  'Vast.ai': 0.65,
}

export function Calculator({ prices }: CalculatorProps) {
  const [selectedGPU, setSelectedGPU] = useState('')
  const [usageProfile, setUsageProfile] = useState<UsageProfile>('startup')
  
  const hoursPerDay = USAGE_PROFILES[usageProfile].hours
  const daysPerMonth = USAGE_PROFILES[usageProfile].days

  const gpuModels = useMemo(() => [...new Set(prices.map(p => p.gpu_model))].sort(), [prices])

  const providersForGPU = useMemo(() => {
    if (!selectedGPU) return []
    
    return prices
      .filter(p => p.gpu_model === selectedGPU)
      .map(p => ({
        ...p,
        reliability: PROVIDER_RELIABILITY[p.provider] || 0.60,
        volatility: Math.random() * 0.3 + 0.1, // Simulated volatility
      }))
      .sort((a, b) => a.price_per_hour - b.price_per_hour)
  }, [selectedGPU, prices])

  const recommendation = useMemo(() => {
    if (providersForGPU.length === 0) return null

    const cheapest = providersForGPU[0]
    const mostExpensive = providersForGPU[providersForGPU.length - 1]
    
    const totalHours = hoursPerDay * daysPerMonth
    const monthlyCost = cheapest.price_per_hour * totalHours
    const savings = (mostExpensive.price_per_hour - cheapest.price_per_hour) * totalHours
    const savingsPercent = ((mostExpensive.price_per_hour - cheapest.price_per_hour) / mostExpensive.price_per_hour) * 100

    const availability = cheapest.availability || 0.5
    const reliability = cheapest.reliability
    const confidence = (availability * 0.5 + reliability * 0.5) * 100

    let riskLevel: 'Low' | 'Medium' | 'High'
    if (reliability >= 0.95 && availability >= 0.9) {
      riskLevel = 'Low'
    } else if (reliability >= 0.7 && availability >= 0.6) {
      riskLevel = 'Medium'
    } else {
      riskLevel = 'High'
    }

    const reasons = []
    
    // Cost comparison
    if (savingsPercent > 70) {
      reasons.push(`${savingsPercent.toFixed(0)}% cheaper than premium providers`)
    } else if (savingsPercent > 50) {
      reasons.push(`${savingsPercent.toFixed(0)}% cost reduction vs. alternatives`)
    } else if (savingsPercent > 30) {
      reasons.push(`${savingsPercent.toFixed(0)}% more affordable than competitors`)
    }
    
    // Monthly savings impact
    if (savings > 2000) {
      reasons.push(`Saves ${formatCurrency(savings)}/month on compute costs`)
    } else if (savings > 500) {
      reasons.push(`${formatCurrency(savings)}/month in savings`)
    }
    
    // Availability assessment
    if (availability >= 0.9) {
      reasons.push('Excellent availability (90%+)')
    } else if (availability >= 0.8) {
      reasons.push('High availability (80%+)')
    } else if (availability >= 0.6) {
      reasons.push(`Good availability (${(availability * 100).toFixed(0)}%)`)
    } else if (availability >= 0.4) {
      reasons.push(`Moderate availability (${(availability * 100).toFixed(0)}%) - consider backup plan`)
    }
    
    // Reliability classification
    if (reliability >= 0.97) {
      reasons.push('Enterprise-grade reliability (97%+ uptime)')
    } else if (reliability >= 0.90) {
      reasons.push('Production-ready reliability (90%+ uptime)')
    } else if (reliability >= 0.75) {
      reasons.push('Medium reliability (75%+ uptime) - suitable for dev/test')
    } else {
      reasons.push('Budget-optimized option with lower reliability')
    }
    
    // Provider positioning
    const isCloudProvider = ['AWS', 'GCP', 'Azure'].includes(cheapest.provider)
    const isSpecializedProvider = ['Lambda Labs', 'RunPod', 'Vast.ai'].includes(cheapest.provider)
    
    if (isCloudProvider) {
      reasons.push('Major cloud provider with extensive support and services')
    } else if (isSpecializedProvider) {
      reasons.push('GPU-specialized provider optimized for ML workloads')
    }
    
    // Price positioning
    if (cheapest.price_per_hour < 2) {
      reasons.push('Extremely competitive hourly rate (<$2/hr)')
    } else if (cheapest.price_per_hour < 5) {
      reasons.push('Budget-friendly hourly pricing (<$5/hr)')
    }
    
    // Usage profile fit
    const profile = USAGE_PROFILES[usageProfile]
    if (profile.hours <= 8 && cheapest.price_per_hour < 3) {
      reasons.push(`Optimal for ${profile.label.split(' / ')[0].toLowerCase()} workloads`)
    } else if (profile.hours === 24 && reliability >= 0.95) {
      reasons.push(`Well-suited for ${profile.label.split(' / ')[0].toLowerCase()} 24/7 operations`)
    }

    return {
      provider: cheapest.provider,
      monthlyCost,
      savings,
      confidence: confidence.toFixed(0),
      riskLevel,
      reasons: reasons.length > 0 ? reasons : ['Cost-optimized option'],
      allProviders: providersForGPU,
    }
  }, [providersForGPU, hoursPerDay, daysPerMonth])

  // Chart data
  const riskCostData = useMemo(() => {
    return providersForGPU.map(p => ({
      provider: p.provider,
      price: p.price_per_hour,
      reliability: p.reliability * 100,
      volatility: p.volatility,
      size: (p.availability || 0.5) * 1000,
      color: getProviderColor(p.provider),
    }))
  }, [providersForGPU])

  const costComparisonData = useMemo(() => {
    const totalHours = hoursPerDay * daysPerMonth
    
    // Group by provider and get cheapest price per provider
    const providerMap = new Map<string, { provider: string; monthlyCost: number; color: string }>()
    
    providersForGPU.forEach(p => {
      const monthlyCost = p.price_per_hour * totalHours
      const existing = providerMap.get(p.provider)
      
      if (!existing || monthlyCost < existing.monthlyCost) {
        providerMap.set(p.provider, {
          provider: p.provider,
          monthlyCost,
          color: getProviderColor(p.provider),
        })
      }
    })
    
    return Array.from(providerMap.values()).sort((a, b) => a.monthlyCost - b.monthlyCost)
  }, [providersForGPU, hoursPerDay, daysPerMonth])

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      {/* Configuration */}
      <Card className="border-border/40">
        <CardContent className="pt-6 space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Select GPU Model</label>
            <select
              value={selectedGPU}
              onChange={(e) => setSelectedGPU(e.target.value)}
              className="w-full px-3 py-2 border border-border/40 rounded bg-background focus:border-primary focus:ring-1 focus:ring-primary/20"
            >
              <option value="">Choose a GPU...</option>
              {gpuModels.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-3 block">Usage Scenario</label>
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
                        ? 'border-primary bg-primary/10'
                        : 'border-border/40 hover:border-border bg-background'
                    }`}
                  >
                    <div className="text-2xl mb-2">{config.icon}</div>
                    <div className="text-sm font-semibold mb-1">{config.label.split(' / ')[0]}</div>
                    <div className="text-xs text-muted-foreground">{config.desc}</div>
                  </button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation */}
      {recommendation ? (
        <div className="space-y-6">
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-1">Deployment Recommendation</h3>
                  <div className="text-3xl font-bold font-mono mt-3 mb-1">{recommendation.provider}</div>
                  <p className="text-sm text-muted-foreground">Recommended for {selectedGPU}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Why Chosen */}
          <Card className="border-border/40">
            <CardContent className="pt-6">
              <h3 className="text-sm font-medium mb-3">Why This Provider</h3>
              <ul className="space-y-2">
                {recommendation.reasons.map((reason, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-border/40">
              <CardContent className="pt-6">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Monthly Cost</div>
                <div className="text-2xl font-bold font-mono">{formatCurrency(recommendation.monthlyCost)}</div>
              </CardContent>
            </Card>
            <Card className="border-border/40">
              <CardContent className="pt-6">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Confidence Score</div>
                <div className="text-2xl font-bold font-mono">{recommendation.confidence}%</div>
              </CardContent>
            </Card>
            <Card className="border-border/40">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Risk Level</div>
                  {recommendation.riskLevel === 'Low' ? (
                    <Shield className="w-4 h-4 text-green-500" />
                  ) : recommendation.riskLevel === 'Medium' ? (
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className={`text-2xl font-bold ${
                  recommendation.riskLevel === 'Low' ? 'text-green-500' :
                  recommendation.riskLevel === 'Medium' ? 'text-yellow-500' : 'text-red-500'
                }`}>
                  {recommendation.riskLevel}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Price Comparison Chart */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-primary" />
                Monthly Cost Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={costComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis dataKey="provider" className="text-xs" />
                  <YAxis tickFormatter={(val) => `$${val}`} className="text-xs" />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="monthlyCost" radius={[4, 4, 0, 0]}>
                    {costComparisonData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Risk vs Cost Scatter */}
          <Card className="border-border/40">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Risk vs Cost Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                  <XAxis 
                    type="number" 
                    dataKey="price" 
                    name="Price/Hour" 
                    tickFormatter={(val) => `$${val.toFixed(2)}`}
                    label={{ value: 'Price per Hour ($)', position: 'insideBottom', offset: -5, style: { fontSize: 11 } }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="reliability" 
                    name="Reliability"
                    label={{ value: 'Reliability Score', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
                  />
                  <ZAxis type="number" dataKey="size" range={[100, 400]} />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                            <div className="font-medium mb-1">{data.provider}</div>
                            <div className="text-xs text-muted-foreground space-y-0.5">
                              <div>Price: {formatCurrency(data.price)}/hr</div>
                              <div>Reliability: {data.reliability.toFixed(0)}%</div>
                              <div>Volatility: {(data.volatility * 100).toFixed(0)}%</div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Scatter data={riskCostData}>
                    {riskCostData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
              <div className="mt-3 text-xs text-muted-foreground text-center">
                Bubble size represents availability • Lower left = optimal (low cost, high reliability)
              </div>
            </CardContent>
          </Card>

          {/* All Providers */}
          <Card className="border-border/40">
            <CardContent className="pt-6">
              <h3 className="text-sm font-medium mb-4">All Providers for {selectedGPU}</h3>
              <div className="space-y-2">
                {recommendation.allProviders.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded bg-muted/30">
                    <div>
                      <div className="font-medium">{p.provider}</div>
                      {p.region && <div className="text-xs text-muted-foreground">{p.region}</div>}
                    </div>
                    <div className="font-mono">{formatCurrency(p.price_per_hour)}/hr</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">Select a GPU to see deployment recommendations</p>
          </div>
        </Card>
      )}
    </div>
  )
}
