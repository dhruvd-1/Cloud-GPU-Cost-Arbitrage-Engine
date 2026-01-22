import { useEffect, useState, useMemo } from 'react'
import { TrendingDown, DollarSign, Award, Zap } from 'lucide-react'
import { Card, CardContent } from '../ui/card'
import { formatCurrency, formatPercentage } from '../../lib/utils'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface DashboardProps {
  prices: any[]
  arbitrageOpportunities: any[]
}

export function Dashboard({ prices, arbitrageOpportunities }: DashboardProps) {
  const [metrics, setMetrics] = useState({
    avgPrice: 0,
    maxSavings: 0,
    cheapestProvider: '',
    gpusTracked: 0,
  })

  // Smart Insight
  const insight = useMemo(() => {
    const highSavingsCount = arbitrageOpportunities.filter(a => a.percentage_savings >= 50).length
    if (highSavingsCount > 0) {
      return `Market inefficiencies detected across GPU providers. ${highSavingsCount} model${highSavingsCount > 1 ? 's show' : ' shows'} >50% savings potential.`
    }
    return 'Market prices are currently balanced across providers.'
  }, [arbitrageOpportunities])

  useEffect(() => {
    if (prices.length > 0) {
      const avg = prices.reduce((sum, p) => sum + p.price_per_hour, 0) / prices.length
      const gpuModels = [...new Set(prices.map(p => p.gpu_model))]
      const sortedByPrice = [...prices].sort((a, b) => a.price_per_hour - b.price_per_hour)
      const cheapest = sortedByPrice[0]
      const maxSavings = arbitrageOpportunities.length > 0
        ? Math.max(...arbitrageOpportunities.map(a => a.percentage_savings))
        : 0

      setMetrics({
        avgPrice: avg,
        maxSavings,
        cheapestProvider: cheapest?.provider || 'N/A',
        gpusTracked: gpuModels.length,
      })
    }
  }, [prices, arbitrageOpportunities])

  const kpiCards = [
    { title: 'Average GPU Price', value: formatCurrency(metrics.avgPrice), icon: DollarSign, desc: 'Across all providers' },
    { title: 'Max Arbitrage', value: formatPercentage(metrics.maxSavings), icon: TrendingDown, desc: 'Highest savings found' },
    { title: 'Cheapest Provider', value: metrics.cheapestProvider, icon: Award, desc: 'Best average pricing' },
    { title: 'GPUs Tracked', value: metrics.gpusTracked.toString(), icon: Zap, desc: 'Unique models' },
  ]

  // Chart data
  const chartData = arbitrageOpportunities
    .slice(0, 6)
    .map(arb => ({
      name: arb.gpu_model.length > 12 ? arb.gpu_model.slice(0, 12) + '...' : arb.gpu_model,
      savings: arb.percentage_savings,
    }))

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      {/* Insight */}
      <div className="text-sm text-muted-foreground max-w-3xl">
        {insight}
      </div>

      {/* KPI Cards - Clean Grid */}
      <div className="grid grid-cols-4 gap-6">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} className="border-border/40">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">{kpi.title}</span>
                <kpi.icon className="w-4 h-4 text-muted-foreground/40" />
              </div>
              <div className="text-2xl font-medium font-mono mb-1">{kpi.value}</div>
              <div className="text-xs text-muted-foreground">{kpi.desc}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Simple Chart */}
      <Card className="border-border/40">
        <CardContent className="pt-6">
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-1">Arbitrage Opportunities</h3>
            <p className="text-xs text-muted-foreground">Savings potential by GPU model</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`${value.toFixed(1)}%`, 'Savings']}
                />
                <Bar dataKey="savings" radius={[4, 4, 0, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill="hsl(var(--primary))" opacity={0.9} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
