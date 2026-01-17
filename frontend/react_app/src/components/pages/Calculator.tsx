import { useState, useEffect, useMemo } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { Calculator as CalcIcon, Zap, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { formatCurrency, getProviderColor } from '../../lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { normalizePrices, unique, type NormalizedPrice } from '../../lib/data'

interface CalculatorProps {
  prices: any[]
  loading?: boolean
}

export function Calculator({ prices, loading = false }: CalculatorProps) {
  const [selectedGPU, setSelectedGPU] = useState('')
  const [providerA, setProviderA] = useState('')
  const [providerB, setProviderB] = useState('')
  const [hoursPerDay, setHoursPerDay] = useState(24)
  const [daysPerMonth, setDaysPerMonth] = useState(30)
  const [error, setError] = useState<string | null>(null)

  const norm: NormalizedPrice[] = useMemo(() => normalizePrices(prices as any), [prices])
  const gpuModels = useMemo(() => unique(norm.map((p) => p.gpu)), [norm])
  const providersForGPU = useMemo(() => {
    return norm.filter((p) => p.gpu === selectedGPU).map((p) => p.provider)
  }, [norm, selectedGPU])

  const priceA = useMemo(() => norm.find((p) => p.gpu === selectedGPU && p.provider === providerA) || null, [norm, selectedGPU, providerA])
  const priceB = useMemo(() => norm.find((p) => p.gpu === selectedGPU && p.provider === providerB) || null, [norm, selectedGPU, providerB])

  // Animated numbers using springs
  const hourlySpring = useSpring(0, { stiffness: 90, damping: 20 })
  const monthlySpring = useSpring(0, { stiffness: 90, damping: 20 })
  const annualSpring = useSpring(0, { stiffness: 90, damping: 20 })

  const hourlyDisplay = useTransform(hourlySpring, (v) => formatCurrency(v))
  const monthlyDisplay = useTransform(monthlySpring, (v) => formatCurrency(v))
  const annualDisplay = useTransform(annualSpring, (v) => formatCurrency(v))

  useEffect(() => {
    setError(null)
    if (!selectedGPU) return
    if (!providerA || !providerB) return
    if (providerA === providerB) {
      setError('Please select two different providers.')
      return
    }
    if (!priceA || !priceB) {
      setError('Price data unavailable for selected combination.')
      return
    }
    const hourlySavings = priceB.price - priceA.price
    const monthlySavings = hourlySavings * hoursPerDay * daysPerMonth
    const annualSavings = monthlySavings * 12

    if (hourlySavings <= 0) {
      setError('Selected provider is already the cheapest option.')
    }

    hourlySpring.set(Math.max(0, hourlySavings))
    monthlySpring.set(Math.max(0, monthlySavings))
    annualSpring.set(Math.max(0, annualSavings))
  }, [selectedGPU, providerA, providerB, hoursPerDay, daysPerMonth, priceA, priceB, hourlySpring, monthlySpring, annualSpring])

  const chartData = priceA && priceB ? [
    {
      name: providerA,
      hourly: priceA.price,
      monthly: priceA.price * hoursPerDay * daysPerMonth,
      annual: priceA.price * hoursPerDay * daysPerMonth * 12,
      color: getProviderColor(providerA)
    },
    {
      name: providerB,
      hourly: priceB.price,
      monthly: priceB.price * hoursPerDay * daysPerMonth,
      annual: priceB.price * hoursPerDay * daysPerMonth * 12,
      color: getProviderColor(providerB)
    }
  ] : []

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
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <CalcIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle>Savings Calculator</CardTitle>
                <CardDescription>Compare costs between providers</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* GPU Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">GPU Model</label>
              <select
                value={selectedGPU}
                onChange={(e) => {
                  setProviderA('')
                  setProviderB('')
                  setSelectedGPU(e.target.value)
                }}
                className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select GPU...</option>
                {gpuModels.map(gpu => (
                  <option key={gpu} value={gpu}>{gpu}</option>
                ))}
              </select>
            </div>

            {/* Provider Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Provider A</label>
                <select
                  value={providerA}
                  onChange={(e) => setProviderA(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={!selectedGPU}
                >
                  <option value="">Select...</option>
                  {unique(providersForGPU).map(provider => (
                    <option key={provider} value={provider}>{provider}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Provider B</label>
                <select
                  value={providerB}
                  onChange={(e) => setProviderB(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={!selectedGPU || !providerA}
                >
                  <option value="">Select...</option>
                  {unique(providersForGPU)
                    .filter(p => p !== providerA)
                    .map(provider => (
                      <option key={provider} value={provider}>{provider}</option>
                    ))}
                </select>
              </div>
            </div>

            {/* Usage Pattern */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Hours per Day: {hoursPerDay}
                </label>
                <input
                  type="range"
                  min="1"
                  max="24"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Days per Month: {daysPerMonth}
                </label>
                <input
                  type="range"
                  min="1"
                  max="31"
                  value={daysPerMonth}
                  onChange={(e) => setDaysPerMonth(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg border border-destructive/30 bg-destructive/10">
                <AlertCircle className="w-5 h-5 text-destructive" />
                <div className="text-sm">
                  <div className="font-semibold text-destructive">Calculation Notice</div>
                  <div className="text-muted-foreground">{error}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Results */}
      {priceA && priceB && (
        <>
          {/* Savings Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <Card className="gradient-border">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground mb-1">Hourly Difference</div>
                <motion.div className="text-3xl font-bold font-mono text-green-500">
                  {hourlyDisplay as any}
                </motion.div>
                <div className="text-xs text-muted-foreground mt-1">per hour</div>
              </CardContent>
            </Card>

            <Card className="gradient-border">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground mb-1">Monthly Savings</div>
                <motion.div className="text-3xl font-bold font-mono text-green-500">
                  {monthlyDisplay as any}
                </motion.div>
                <div className="text-xs text-muted-foreground mt-1">
                  at {hoursPerDay}h/day × {daysPerMonth} days
                </div>
              </CardContent>
            </Card>

            <Card className="gradient-border">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground mb-1">Annual Savings</div>
                <motion.div className="text-3xl font-bold font-mono text-green-500">
                  {annualDisplay as any}
                </motion.div>
                <div className="text-xs text-muted-foreground mt-1">projected for 12 months</div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Comparison Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Cost Comparison</CardTitle>
                <CardDescription>Visual breakdown across timeframes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="annual" radius={[8, 8, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Insight Card */}
          {priceA && priceB && priceA.price !== priceB.price && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">Academic Insight</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        By switching from <strong>{priceA.price > priceB.price ? providerA : providerB}</strong> to{' '}
                        <strong>{priceA.price > priceB.price ? providerB : providerA}</strong>, 
                        an organization could save <strong>{annualDisplay as any}</strong> annually on a single {selectedGPU} instance.
                        This demonstrates how multi-cloud cost optimization strategies can yield significant savings
                        in production ML/AI workloads.
                      </p>
                      <p className="text-xs text-muted-foreground mt-3">
                        💡 This calculation uses simulated pricing data for academic demonstration purposes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
