import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingDown, Percent, Info, ChevronDown, Download, Zap, Shield, AlertTriangle } from 'lucide-react'
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
  const [showCostPerTFLOP, setShowCostPerTFLOP] = useState(false)

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

                {/* Savings Breakdown */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
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
