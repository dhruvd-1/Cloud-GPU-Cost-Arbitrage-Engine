import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingDown, Percent, Info, ChevronDown, Download, Zap, Shield, AlertTriangle, Clock, CheckCircle, XCircle, BarChart3, Users, Calendar, Activity, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { formatCurrency, getProviderColor, getSavingsColor } from '../../lib/utils'

interface ArbitrageProps {
  opportunities: any[]
}

export function Arbitrage({ opportunities }: ArbitrageProps) {
  const [selectedGPU, setSelectedGPU] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'savings' | 'difference'>('savings')
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [expandedDecision, setExpandedDecision] = useState<string | null>(null)
  const [showCostPerTFLOP, setShowCostPerTFLOP] = useState(false)
  
  // Cluster configuration state
  const [gpuCount, setGpuCount] = useState(1)
  const [durationDays, setDurationDays] = useState(30)

  const sortedOpportunities = [...opportunities].sort((a, b) => {
    if (sortBy === 'savings') {
      return b.percentage_savings - a.percentage_savings
    }
    return b.price_difference_usd_per_hour - a.price_difference_usd_per_hour
  })

  const filteredOpportunities = selectedGPU
    ? sortedOpportunities.filter(opp => opp.gpu_model === selectedGPU)
    : sortedOpportunities

  const gpuModels = [...new Set(opportunities.map(opp => opp.gpu_model))]

  const exportToCSV = () => {
    const headers = ['GPU Model', 'Cheapest Provider', 'Price', 'Most Expensive Provider', 'Price', 'Savings %', 'Annual Savings']
    const rows = filteredOpportunities.map(opp => [
      opp.gpu_model,
      opp.cheapest_provider.provider,
      opp.cheapest_provider.price_per_hour.toFixed(4),
      opp.most_expensive_provider.provider,
      opp.most_expensive_provider.price_per_hour.toFixed(4),
      opp.percentage_savings.toFixed(1),
      opp.annual_savings_usd.toFixed(2)
    ])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `arbitrage-opportunities-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getReliabilityBadge = (availability: number) => {
    if (availability >= 0.8) return { label: 'High Uptime', color: 'bg-green-500', icon: Shield }
    if (availability >= 0.5) return { label: 'Medium', color: 'bg-yellow-500', icon: AlertTriangle }
    return { label: 'Low Uptime', color: 'bg-red-500', icon: AlertTriangle }
  }

  const getArbitrageReason = (opp: any) => {
    const priceDiff = opp.percentage_savings
    const availDiff = Math.abs(opp.cheapest_provider.availability - opp.most_expensive_provider.availability)
    
    if (priceDiff > 50) return 'Major pricing discrepancy due to regional demand differences and provider cost structures.'
    if (availDiff > 0.3) return 'Price reflects availability trade-off: cheaper provider may have lower uptime guarantees.'
    if (opp.cheapest_provider.region !== opp.most_expensive_provider.region) return 'Regional pricing varies based on datacenter operational costs and local market conditions.'
    return 'Market inefficiency detected: providers haven\'t aligned pricing for this GPU model yet.'
  }

  const getStabilityColor = (stability: string) => {
    switch (stability) {
      case 'High Stability':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'Moderate Stability':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'Low Stability':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }
  
  const getLifecycleStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'Declining':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'Expired':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }
  
  const getDecayRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'text-green-600'
      case 'Medium':
        return 'text-amber-600'
      case 'High':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }
  
  const getOpportunityCostColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'Medium':
        return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'High':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getConstraintsFromOpportunities = () => {
    if (opportunities.length === 0) return null
    const firstOpp = opportunities[0]
    return firstOpp.constraints_applied || null
  }

  const constraints = getConstraintsFromOpportunities()

  return (
    <div className="space-y-6">
      {/* Header with Export */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Arbitrage Opportunities</h1>
          <p className="text-muted-foreground mt-1">Identify cost-saving opportunities across providers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCostPerTFLOP(!showCostPerTFLOP)}>
            <Zap className="w-4 h-4 mr-2" />
            {showCostPerTFLOP ? 'Cost per TFLOP' : 'Raw Cost'}
          </Button>
          <Button onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedGPU === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedGPU(null)}
          >
            All GPUs
          </Button>
          {gpuModels.map(gpu => (
            <Button
              key={gpu}
              variant={selectedGPU === gpu ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedGPU(gpu)}
            >
              {gpu}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant={sortBy === 'savings' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('savings')}
          >
            <Percent className="w-4 h-4 mr-2" />
            By Savings %
          </Button>
          <Button
            variant={sortBy === 'difference' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('difference')}
          >
            <TrendingDown className="w-4 h-4 mr-2" />
            By Cost Diff
          </Button>
        </div>
      </div>

      {/* Constraints Applied Card */}
      {constraints && (
        <Card className="border-muted bg-muted/30">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-sm mb-2 text-foreground">Constraints Applied</h3>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline" className="bg-background">
                    <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                    Availability ≥ {(constraints.min_availability * 100).toFixed(0)}%
                  </Badge>
                  <Badge variant="outline" className="bg-background">
                    <CheckCircle className="w-3 h-3 mr-1 text-green-600" />
                    Reliability ≥ {constraints.min_reliability.toFixed(2)}
                  </Badge>
                  {opportunities[0]?.excluded_providers && opportunities[0].excluded_providers.length > 0 && (
                    <Badge variant="outline" className="bg-background">
                      <XCircle className="w-3 h-3 mr-1 text-red-600" />
                      {opportunities[0].excluded_providers.length} provider{opportunities[0].excluded_providers.length !== 1 ? 's' : ''} excluded
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Cluster Configuration Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-primary mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-3 text-foreground">Cluster Configuration</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Number of GPUs
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={gpuCount}
                      onChange={(e) => setGpuCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                      className="w-20 px-3 py-1.5 text-sm border border-input rounded-md bg-background"
                    />
                    <span className="text-xs text-muted-foreground">
                      {gpuCount === 1 ? 'Single GPU' : `${gpuCount}x GPUs`}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Duration (days)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={durationDays}
                      onChange={(e) => setDurationDays(Math.max(1, Math.min(365, parseInt(e.target.value) || 30)))}
                      className="w-20 px-3 py-1.5 text-sm border border-input rounded-md bg-background"
                    />
                    <span className="text-xs text-muted-foreground">
                      {durationDays < 30 ? `${durationDays} days` : durationDays === 30 ? '1 month' : `~${Math.round(durationDays / 30)} months`}
                    </span>
                  </div>
                </div>
              </div>
              {(gpuCount > 1 || durationDays !== 30) && (
                <div className="mt-3 p-2 bg-background rounded-md border border-border">
                  <p className="text-xs text-muted-foreground">
                    <Info className="w-3 h-3 inline mr-1" />
                    Cluster analysis will show total costs and amplified risks for {gpuCount}x GPU{gpuCount !== 1 ? 's' : ''} over {durationDays} day{durationDays !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Opportunities List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredOpportunities.map((opp, index) => (
          <motion.div
            key={`${opp.gpu_model}-${index}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-all border-muted">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{opp.gpu_model}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {opp.providers_offering} providers offering this GPU
                    </p>
                  </div>
                  <Badge 
                    variant="success" 
                    className={`text-lg px-3 py-1 ${getSavingsColor(opp.percentage_savings)}`}
                  >
                    {opp.percentage_savings >= 0 ? '+' : ''}{opp.percentage_savings.toFixed(1)}%
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Provider Comparison */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Cheapest */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      CHEAPEST
                    </div>
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="font-bold text-lg" style={{ color: getProviderColor(opp.cheapest_provider.provider) }}>
                        {opp.cheapest_provider.provider}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {opp.cheapest_provider.region}
                      </div>
                      <div className="text-2xl font-bold mt-2 font-mono">
                        {formatCurrency(opp.cheapest_provider.price_per_hour)}
                        <span className="text-sm text-muted-foreground font-normal">/hr</span>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500"
                            style={{ width: `${opp.cheapest_provider.availability * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {(opp.cheapest_provider.availability * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Most Expensive */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      MOST EXPENSIVE
                    </div>
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <div className="font-bold text-lg" style={{ color: getProviderColor(opp.most_expensive_provider.provider) }}>
                        {opp.most_expensive_provider.provider}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {opp.most_expensive_provider.region}
                      </div>
                      <div className="text-2xl font-bold mt-2 font-mono">
                        {formatCurrency(opp.most_expensive_provider.price_per_hour)}
                        <span className="text-sm text-muted-foreground font-normal">/hr</span>
                      </div>
                      <div className="flex items-center gap-1 mt-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-red-500"
                            style={{ width: `${opp.most_expensive_provider.availability * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {(opp.most_expensive_provider.availability * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Savings Breakdown with Confidence Intervals */}
                <div className="space-y-3 pt-3 border-t border-border">
                  {/* Cost Stability Label */}
                  {opp.cost_stability && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Cost Stability</span>
                      <Badge className={`text-xs border ${getStabilityColor(opp.cost_stability)}`}>
                        {opp.cost_stability}
                      </Badge>
                    </div>
                  )}

                  {/* Confidence Intervals */}
                  {opp.cost_estimate ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Estimated Monthly Cost</span>
                        <span className="font-mono font-medium">
                          {formatCurrency(opp.cost_estimate.monthly[0])} – {formatCurrency(opp.cost_estimate.monthly[1])}
                        </span>
                      </div>
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="absolute h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                          style={{ 
                            left: '0%',
                            right: `${Math.max(0, 100 - (opp.cost_estimate.volatility_factor * 100))}%`
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground text-right">
                        Volatility: {(opp.cost_estimate.volatility_factor * 100).toFixed(1)}%
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Hourly</div>
                        <div className="font-bold text-sm">
                          {formatCurrency(opp.price_difference_usd_per_hour)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Monthly</div>
                        <div className="font-bold text-sm">
                          {formatCurrency(opp.price_difference_usd_per_hour * 730)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Annual</div>
                        <div className="font-bold text-sm text-green-500">
                          {formatCurrency(opp.annual_savings_usd)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Break-Even Analysis */}
                  {opp.break_even && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
                      <Clock className="w-4 h-4" />
                      <span>{opp.break_even.interpretation}</span>
                    </div>
                  )}
                </div>

                {/* NEW FEATURE 1: Arbitrage Lifecycle */}
                {opp.arbitrage_lifecycle && (
                  <div className="space-y-2 pt-3 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5" />
                        Arbitrage Status
                      </span>
                      <Badge className={`text-xs border ${getLifecycleStatusColor(opp.arbitrage_lifecycle.status)}`}>
                        {opp.arbitrage_lifecycle.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Estimated Lifetime</span>
                      <span className="font-semibold">
                        ~{Math.round(opp.arbitrage_lifecycle.estimated_lifetime_days / 30)} month{Math.round(opp.arbitrage_lifecycle.estimated_lifetime_days / 30) !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Decay Risk</span>
                      <span className={`font-semibold ${getDecayRiskColor(opp.arbitrage_lifecycle.decay_risk)}`}>
                        {opp.arbitrage_lifecycle.decay_risk}
                      </span>
                    </div>
                  </div>
                )}

                {/* NEW FEATURE 2: Deployment Strategy */}
                {opp.deployment_strategy && (
                  <Card className="mt-3 border-primary/30 bg-primary/5">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <Target className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1 space-y-1">
                          <h4 className="text-xs font-semibold text-foreground">Recommended Deployment Strategy</h4>
                          <div className="text-sm font-bold text-primary">
                            {opp.deployment_strategy.recommended}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {opp.deployment_strategy.reason}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* NEW FEATURE 3: Opportunity Cost */}
                {opp.opportunity_cost && (
                  <div className="mt-3 p-3 rounded-lg border border-border bg-background">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-muted-foreground">Opportunity Cost Risk</span>
                      <Badge className={`text-xs border ${getOpportunityCostColor(opp.opportunity_cost.risk_level)}`}>
                        {opp.opportunity_cost.risk_level}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {opp.opportunity_cost.explanation}
                    </p>
                  </div>
                )}

                {/* NEW FEATURE 4: Cluster Analysis */}
                {opp.cluster_analysis && (
                  <Card className="mt-3 border-green-500/30 bg-green-500/5">
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <h4 className="text-xs font-semibold text-foreground">Cluster Impact</h4>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Configuration</span>
                              <div className="font-semibold">{opp.cluster_analysis.gpu_count} GPUs × {opp.cluster_analysis.duration_days} days</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total Cost</span>
                              <div className="font-bold text-green-600">{formatCurrency(opp.cluster_analysis.total_cost)}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Total Savings</span>
                              <div className="font-bold text-green-600">{formatCurrency(opp.cluster_analysis.total_savings)}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Cluster Risk</span>
                              <Badge className={`text-xs ${opp.cluster_analysis.cluster_risk === 'Low' ? 'bg-green-100 text-green-700' : opp.cluster_analysis.cluster_risk === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                {opp.cluster_analysis.cluster_risk}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Reliability Badges */}
                <div className="flex gap-2 pt-2">
                  {(() => {
                    const cheapBadge = getReliabilityBadge(opp.cheapest_provider.availability)
                    return (
                      <>
                        <Badge className={`${cheapBadge.color} text-white border-0`}>
                          <cheapBadge.icon className="w-3 h-3 mr-1" />
                          {cheapBadge.label}
                        </Badge>
                        {opp.cheapest_provider.availability < 0.7 && (
                          <Badge variant="outline" className="text-xs">
                            ⚡ Effective cost may vary
                          </Badge>
                        )}
                      </>
                    )
                  })()}
                </div>

                {/* Decision Trace Button */}
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => setExpandedDecision(expandedDecision === `${opp.gpu_model}-decision` ? null : `${opp.gpu_model}-decision`)}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Explain Decision
                  <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${expandedDecision === `${opp.gpu_model}-decision` ? 'rotate-180' : ''}`} />
                </Button>

                {/* Decision Trace Panel */}
                <AnimatePresence>
                  {expandedDecision === `${opp.gpu_model}-decision` && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
                        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-primary" />
                          Decision Trace
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-primary">1</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-muted-foreground">
                                Evaluated <span className="font-semibold text-foreground">{opp.providers_offering}</span> providers offering {opp.gpu_model}
                              </p>
                            </div>
                          </div>
                          {opp.excluded_providers && opp.excluded_providers.length > 0 && (
                            <div className="flex items-start gap-2">
                              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-red-700">2</span>
                              </div>
                              <div className="flex-1">
                                <p className="text-muted-foreground">
                                  Excluded <span className="font-semibold text-foreground">{opp.excluded_providers.length}</span> provider{opp.excluded_providers.length !== 1 ? 's' : ''} (low availability/reliability)
                                </p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-amber-700">{opp.excluded_providers?.length > 0 ? '3' : '2'}</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-muted-foreground">
                                Ranked remaining by cost-performance score
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-bold text-green-700">{opp.excluded_providers?.length > 0 ? '4' : '3'}</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-muted-foreground">
                                Selected <span className="font-semibold text-foreground">{opp.cheapest_provider.provider}</span> as lowest risk option with <span className="font-semibold text-foreground">{opp.percentage_savings.toFixed(1)}%</span> savings
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Accordion Button */}
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => setExpandedCard(expandedCard === opp.gpu_model ? null : opp.gpu_model)}
                >
                  <Info className="w-4 h-4 mr-2" />
                  Why this arbitrage exists?
                  <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${expandedCard === opp.gpu_model ? 'rotate-180' : ''}`} />
                </Button>

                {/* Accordion Content */}
                <AnimatePresence>
                  {expandedCard === opp.gpu_model && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 rounded-lg bg-muted/50 border border-border mt-2">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Info className="w-4 h-4 text-primary" />
                          Market Analysis
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {getArbitrageReason(opp)}
                        </p>
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="text-xs font-semibold text-muted-foreground mb-2">KEY FACTORS</div>
                          <ul className="text-xs space-y-1 text-muted-foreground">
                            <li>• Regional demand and datacenter costs</li>
                            <li>• Provider-specific pricing strategies</li>
                            <li>• Availability and SLA guarantees</li>
                            <li>• Spot vs on-demand pricing models</li>
                          </ul>
                        </div>
                        <p className="text-xs text-muted-foreground mt-3 italic">
                          💡 This analysis uses simulated data for academic research purposes.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredOpportunities.length === 0 && (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <TrendingDown className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No arbitrage opportunities found</p>
            <p className="text-sm mt-2">Try adjusting your filters</p>
          </div>
        </Card>
      )}
    </div>
  )
}
