import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpDown, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { formatCurrency, getProviderColor, getAvailabilityColor } from '../../lib/utils'

interface PricesProps {
  prices: any[]
}

export function Prices({ prices }: PricesProps) {
  const [sortColumn, setSortColumn] = useState<string>('price_per_hour')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [filterProvider, setFilterProvider] = useState<string | null>(null)
  const [filterGPU, setFilterGPU] = useState<string | null>(null)

  const providers = useMemo(() => [...new Set(prices.map(p => p.provider))], [prices])
  const gpuModels = useMemo(() => [...new Set(prices.map(p => p.gpu_model))], [prices])

  const sortedAndFilteredPrices = useMemo(() => {
    let filtered = prices

    if (filterProvider) {
      filtered = filtered.filter(p => p.provider === filterProvider)
    }

    if (filterGPU) {
      filtered = filtered.filter(p => p.gpu_model === filterGPU)
    }

    return [...filtered].sort((a, b) => {
      const aVal = a[sortColumn]
      const bVal = b[sortColumn]
      
      if (typeof aVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }
      
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
    })
  }, [prices, sortColumn, sortDirection, filterProvider, filterGPU])

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Filter by provider or GPU model</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterProvider(null)
                setFilterGPU(null)
              }}
            >
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium mb-2">Provider</div>
            <div className="flex flex-wrap gap-2">
              {providers.map(provider => (
                <Button
                  key={provider}
                  variant={filterProvider === provider ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterProvider(filterProvider === provider ? null : provider)}
                >
                  {provider}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">GPU Model</div>
            <div className="flex flex-wrap gap-2">
              {gpuModels.map(gpu => (
                <Button
                  key={gpu}
                  variant={filterGPU === gpu ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterGPU(filterGPU === gpu ? null : gpu)}
                >
                  {gpu}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Live GPU Prices</CardTitle>
          <CardDescription>
            {sortedAndFilteredPrices.length} prices • Updated in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    <button
                      className="flex items-center gap-2 hover:text-foreground"
                      onClick={() => handleSort('provider')}
                    >
                      Provider
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    <button
                      className="flex items-center gap-2 hover:text-foreground"
                      onClick={() => handleSort('gpu_model')}
                    >
                      GPU Model
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    <button
                      className="flex items-center gap-2 hover:text-foreground"
                      onClick={() => handleSort('region')}
                    >
                      Region
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-right p-3 text-sm font-medium text-muted-foreground">
                    <button
                      className="flex items-center gap-2 hover:text-foreground ml-auto"
                      onClick={() => handleSort('price_per_hour')}
                    >
                      Price/Hour
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-center p-3 text-sm font-medium text-muted-foreground">
                    <button
                      className="flex items-center gap-2 hover:text-foreground mx-auto"
                      onClick={() => handleSort('availability')}
                    >
                      Availability
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left p-3 text-sm font-medium text-muted-foreground">
                    Instance
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedAndFilteredPrices.map((price, index) => (
                  <motion.tr
                    key={`${price.provider}-${price.region}-${price.gpu_model}-${index}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.01 }}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getProviderColor(price.provider) }}
                        />
                        <span className="font-medium">{price.provider}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="secondary" className="font-mono">
                        {price.gpu_model}
                      </Badge>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {price.region}
                    </td>
                    <td className="p-3 text-right">
                      <div className="font-bold font-mono text-lg">
                        {formatCurrency(price.price_per_hour)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(price.price_per_hour * 730)}/mo
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-full max-w-[100px] h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full ${price.availability >= 0.95 ? 'bg-green-500' : price.availability >= 0.85 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${price.availability * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${getAvailabilityColor(price.availability)}`}>
                          {(price.availability * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {price.instance_type || 'N/A'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {sortedAndFilteredPrices.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Filter className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No prices match your filters</p>
              <p className="text-sm mt-2">Try adjusting your filter criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
