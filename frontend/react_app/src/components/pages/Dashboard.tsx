import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Zap, DollarSign, Database, Award, Lightbulb } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { formatCurrency, formatPercentage, cn, getSavingsColor } from '../../lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface DashboardProps {
  prices: any[]
  arbitrageOpportunities: any[]
}

export function Dashboard({ prices, arbitrageOpportunities }: DashboardProps) {
  const [metrics, setMetrics] = useState({
    avgPrice: 0,
    maxSavings: 0,
    cheapestProvider: '',
    mostExpensiveProvider: '',
    gpusTracked: 0,
    providersActive: 0
  })

  // Smart Insight Generation
  const smartInsight = useMemo(() => {
    const highSavingsCount = arbitrageOpportunities.filter(a => a.percentage_savings >= 80).length
    const mediumSavingsCount = arbitrageOpportunities.filter(a => a.percentage_savings >= 50 && a.percentage_savings < 80).length
    
    if (highSavingsCount > 0) {
      return {
        message: `${highSavingsCount} GPU${highSavingsCount > 1 ? 's show' : ' shows'} >80% arbitrage opportunity under current market conditions`,
        type: 'success' as const
      }
    } else if (mediumSavingsCount > 0) {
      return {
        message: `${mediumSavingsCount} GPU${mediumSavingsCount > 1 ? 's show' : ' shows'} >50% cost optimization potential`,
        type: 'info' as const
      }
    } else if (arbitrageOpportunities.length > 0) {
      return {
        message: `${arbitrageOpportunities.length} arbitrage opportunit${arbitrageOpportunities.length > 1 ? 'ies' : 'y'} detected across providers`,
        type: 'info' as const
      }
    } else {
      return {
        message: 'Market prices are currently balanced across providers',
        type: 'neutral' as const
      }
    }
  }, [arbitrageOpportunities])

  useEffect(() => {
    if (prices.length > 0) {
      const avg = prices.reduce((sum, p) => sum + p.price_per_hour, 0) / prices.length
      const providers = [...new Set(prices.map(p => p.provider))]
      const gpuModels = [...new Set(prices.map(p => p.gpu_model))]
      
      // Find cheapest and most expensive
      const sortedByPrice = [...prices].sort((a, b) => a.price_per_hour - b.price_per_hour)
      const cheapest = sortedByPrice[0]
      const mostExpensive = sortedByPrice[sortedByPrice.length - 1]

      const maxSavings = arbitrageOpportunities.length > 0
        ? Math.max(...arbitrageOpportunities.map(a => a.percentage_savings))
        : 0

      setMetrics({
        avgPrice: avg,
        maxSavings,
        cheapestProvider: cheapest?.provider || 'N/A',
        mostExpensiveProvider: mostExpensive?.provider || 'N/A',
        gpusTracked: gpuModels.length,
        providersActive: providers.length
      })
    }
  }, [prices, arbitrageOpportunities])

  const kpiCards = [
    {
      title: 'Avg GPU Price',
      value: formatCurrency(metrics.avgPrice),
      change: -12.3,
      icon: DollarSign,
      description: 'Across all providers',
      color: 'text-blue-500'
    },
    {
      title: 'Max Arbitrage',
      value: formatPercentage(metrics.maxSavings),
      change: +8.2,
      icon: TrendingDown,
      description: 'Highest savings found',
      color: 'text-green-500'
    },
    {
      title: 'Cheapest Provider',
      value: metrics.cheapestProvider,
      change: 0,
      icon: Award,
      description: 'Best average pricing',
      color: 'text-emerald-500'
    },
    {
      title: 'GPUs Tracked',
      value: metrics.gpusTracked.toString(),
      change: 0,
      icon: Zap,
      description: 'Unique GPU models',
      color: 'text-violet-500'
    },
    {
      title: 'Providers Active',
      value: metrics.providersActive.toString(),
      change: 0,
      icon: Database,
      description: 'Cloud platforms',
      color: 'text-cyan-500'
    },
    {
      title: 'Most Expensive',
      value: metrics.mostExpensiveProvider,
      change: 0,
      icon: TrendingUp,
      description: 'Highest average cost',
      color: 'text-red-500'
    }
  ]

  // Prepare chart data - top arbitrage opportunities
  const chartData = arbitrageOpportunities
    .slice(0, 8)
    .map(arb => ({
      name: arb.gpu_model,
      savings: arb.percentage_savings,
      value: arb.price_difference_usd_per_hour
    }))

  const getBarColor = (value: number) => {
    if (value >= 30) return '#10b981' // green
    if (value >= 15) return '#f59e0b' // yellow
    return '#ef4444' // red
  }

  return (
    <div className="space-y-6">
      {/* Smart Insight Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "p-4 rounded-lg border-2 flex items-start gap-3",
          smartInsight.type === 'success' && "bg-emerald-500/10 border-emerald-500/30",
          smartInsight.type === 'info' && "bg-blue-500/10 border-blue-500/30",
          smartInsight.type === 'neutral' && "bg-muted/50 border-border"
        )}
      >
        <Lightbulb className={cn(
          "w-5 h-5 mt-0.5 flex-shrink-0",
          smartInsight.type === 'success' && "text-emerald-500",
          smartInsight.type === 'info' && "text-blue-500",
          smartInsight.type === 'neutral' && "text-muted-foreground"
        )} />
        <div>
          <div className="font-semibold text-sm mb-1">System Insight</div>
          <div className="text-sm text-muted-foreground">{smartInsight.message}</div>
        </div>
      </motion.div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow border-muted">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <kpi.icon className={cn("w-4 h-4", kpi.color)} />
              </CardHeader>
              
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold font-mono">{kpi.value}</div>
                  {kpi.change !== 0 && (
                    <Badge variant={kpi.change > 0 ? 'success' : 'destructive'} className="gap-1">
                      {kpi.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(kpi.change)}%
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{kpi.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Arbitrage Opportunities Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Top Arbitrage Opportunities</CardTitle>
            <CardDescription>
              Savings potential by GPU model (%) • Higher is better
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    label={{ value: 'Savings %', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Bar dataKey="savings" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.savings)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Opportunities Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Wins</CardTitle>
            <CardDescription>Top 5 arbitrage opportunities right now</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {arbitrageOpportunities.slice(0, 5).map((arb, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold text-sm">
                      {arb.gpu_model.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-medium">{arb.gpu_model}</div>
                      <div className="text-xs text-muted-foreground">
                        {arb.cheapest_provider.provider} vs {arb.most_expensive_provider.provider}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="success" className={cn("text-base font-bold", getSavingsColor(arb.percentage_savings))}>
                      {formatPercentage(arb.percentage_savings)}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      ${arb.price_difference_usd_per_hour.toFixed(2)}/hr
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
