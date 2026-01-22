import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Calendar, Users } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import { formatCurrency } from '../../lib/utils'

interface ArbitrageProps {
  opportunities: any[]
}

type SortMode = 'savings' | 'difference' | 'raw-cost'

export function Arbitrage({ opportunities }: ArbitrageProps) {
  const [sortBy, setSortBy] = useState<SortMode>('savings')
  const [gpuCount, setGpuCount] = useState(1)
  const [durationDays, setDurationDays] = useState(30)

  const totalHours = useMemo(() => gpuCount * durationDays * 24, [gpuCount, durationDays])

  const sortedOpportunities = useMemo(() => {
    return [...opportunities].sort((a, b) => {
      if (sortBy === 'savings') return b.percentage_savings - a.percentage_savings
      if (sortBy === 'difference') return b.price_difference_usd_per_hour - a.price_difference_usd_per_hour
      return a.cheapest_provider.price_per_hour - b.cheapest_provider.price_per_hour
    })
  }, [opportunities, sortBy])

  const calculateClusterCost = (hourlyPrice: number) => hourlyPrice * totalHours
  const calculateSavings = (cheapPrice: number, expensivePrice: number) => (expensivePrice - cheapPrice) * totalHours

  const exportToCSV = () => {
    const headers = ['GPU Model', 'Cheapest Provider', 'Price/hr', 'Most Expensive', 'Price/hr', 'Savings %', 'Total Savings']
    const rows = sortedOpportunities.map(opp => [
      opp.gpu_model,
      opp.cheapest_provider.provider,
      opp.cheapest_provider.price_per_hour.toFixed(4),
      opp.most_expensive_provider.provider,
      opp.most_expensive_provider.price_per_hour.toFixed(4),
      opp.percentage_savings.toFixed(1),
      calculateSavings(opp.cheapest_provider.price_per_hour, opp.most_expensive_provider.price_per_hour).toFixed(2)
    ])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `arbitrage-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-6">
      {/* Context Bar - Scenario Assumptions */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium mb-1">Scenario Assumptions</h3>
              <p className="text-xs text-muted-foreground">All results below reflect this configuration</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  GPUs
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={gpuCount}
                  onChange={(e) => setGpuCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 px-2 py-1 text-sm border border-primary/30 rounded bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Days
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={durationDays}
                  onChange={(e) => setDurationDays(Math.max(1, parseInt(e.target.value) || 30))}
                  className="w-16 px-2 py-1 text-sm border border-primary/30 rounded bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                = <span className="font-mono font-medium text-foreground">{totalHours.toLocaleString()}</span> hours
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Sort by</span>
          <Button
            variant={sortBy === 'savings' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('savings')}
            className="h-8 text-xs"
          >
            Savings %
          </Button>
          <Button
            variant={sortBy === 'difference' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('difference')}
            className="h-8 text-xs"
          >
            Cost Diff
          </Button>
          <Button
            variant={sortBy === 'raw-cost' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSortBy('raw-cost')}
            className="h-8 text-xs"
          >
            Raw Cost
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={exportToCSV} className="h-8 text-xs">
          <Download className="w-3.5 h-3.5 mr-1.5" />
          Export
        </Button>
      </div>

      {/* Vertical List - Decision Memo Style */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {sortedOpportunities.map((opp, index) => {
            const clusterCostCheap = calculateClusterCost(opp.cheapest_provider.price_per_hour)
            const totalSavings = calculateSavings(opp.cheapest_provider.price_per_hour, opp.most_expensive_provider.price_per_hour)

            return (
              <motion.div
                key={opp.gpu_model}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.02 }}
              >
                <Card className="border-border/40 hover:border-border transition-colors">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      {/* Left: GPU Info */}
                      <div className="flex-1">
                        <h3 className="font-medium mb-2">{opp.gpu_model}</h3>
                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Cheapest</span>
                            <div className="font-medium mt-0.5">{opp.cheapest_provider.provider}</div>
                            <div className="text-xs text-muted-foreground">{opp.cheapest_provider.region}</div>
                          </div>
                          <div className="text-muted-foreground">→</div>
                          <div>
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Most Expensive</span>
                            <div className="font-medium mt-0.5">{opp.most_expensive_provider.provider}</div>
                            <div className="text-xs text-muted-foreground">{opp.most_expensive_provider.region}</div>
                          </div>
                        </div>
                      </div>

                      {/* Center: Pricing */}
                      <div className="flex items-center gap-8 px-8">
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground mb-1">Price/hr</div>
                          <div className="text-lg font-mono font-medium">
                            {formatCurrency(opp.cheapest_provider.price_per_hour)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground mb-1">Total Cost</div>
                          <motion.div 
                            key={`cost-${clusterCostCheap}`}
                            initial={{ scale: 1.05, color: 'hsl(var(--primary))' }}
                            animate={{ scale: 1, color: 'inherit' }}
                            className="text-lg font-mono font-medium"
                          >
                            {formatCurrency(clusterCostCheap)}
                          </motion.div>
                        </div>
                      </div>

                      {/* Right: Savings */}
                      <div className="text-right">
                        <div className="inline-flex items-baseline gap-2 px-3 py-1.5 rounded-md bg-primary/10">
                          <span className="text-2xl font-bold font-mono text-primary">
                            {opp.percentage_savings.toFixed(0)}%
                          </span>
                        </div>
                        <motion.div 
                          key={`savings-${totalSavings}`}
                          initial={{ scale: 1.05 }}
                          animate={{ scale: 1 }}
                          className="text-xs text-muted-foreground mt-2"
                        >
                          Save {formatCurrency(totalSavings)}
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {sortedOpportunities.length === 0 && (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">No arbitrage opportunities found</p>
          </div>
        </Card>
      )}
    </div>
  )
}
