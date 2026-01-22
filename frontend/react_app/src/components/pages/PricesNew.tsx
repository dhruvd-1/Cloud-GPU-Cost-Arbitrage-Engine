import { useState, useMemo } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '../ui/button'
import { formatCurrency } from '../../lib/utils'

interface PricesProps {
  prices: any[]
}

type SortColumn = 'provider' | 'gpu_model' | 'region' | 'price_per_hour' | 'availability'

export function Prices({ prices }: PricesProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('price_per_hour')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [filterProvider, setFilterProvider] = useState<string | null>(null)
  const [filterGPU, setFilterGPU] = useState<string | null>(null)
  const [filterRegion, setFilterRegion] = useState<string | null>(null)
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')

  const providers = useMemo(() => [...new Set(prices.map(p => p.provider))].sort(), [prices])
  const gpuModels = useMemo(() => [...new Set(prices.map(p => p.gpu_model))].sort(), [prices])
  const regions = useMemo(() => [...new Set(prices.map(p => p.region))].sort(), [prices])

  const sortedPrices = useMemo(() => {
    let filtered = prices

    // Apply filters in order
    if (filterProvider) filtered = filtered.filter(p => p.provider === filterProvider)
    if (filterGPU) filtered = filtered.filter(p => p.gpu_model === filterGPU)
    if (filterRegion) filtered = filtered.filter(p => p.region === filterRegion)
    
    // Price range filter
    if (minPrice !== '') {
      const min = parseFloat(minPrice)
      if (!isNaN(min)) filtered = filtered.filter(p => p.price_per_hour >= min)
    }
    if (maxPrice !== '') {
      const max = parseFloat(maxPrice)
      if (!isNaN(max)) filtered = filtered.filter(p => p.price_per_hour <= max)
    }

    return [...filtered].sort((a, b) => {
      const aVal = a[sortColumn]
      const bVal = b[sortColumn]
      
      if (typeof aVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
    })
  }, [prices, sortColumn, sortDirection, filterProvider, filterGPU, filterRegion, minPrice, maxPrice])

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ column }: { column: SortColumn }) => {
    if (sortColumn !== column) return <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3.5 h-3.5" />
      : <ArrowDown className="w-3.5 h-3.5" />
  }

  return (
    <div className="h-full flex flex-col">
      {/* Compact Toolbar */}
      <div className="px-8 py-4 border-b border-border/40 bg-card/50">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Provider Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Provider</span>
            <select
              value={filterProvider || ''}
              onChange={(e) => setFilterProvider(e.target.value || null)}
              className="h-8 px-2 text-xs border border-border/40 rounded bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
            >
              <option value="">All</option>
              {providers.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* GPU Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">GPU</span>
            <select
              value={filterGPU || ''}
              onChange={(e) => setFilterGPU(e.target.value || null)}
              className="h-8 px-2 text-xs border border-border/40 rounded bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
            >
              <option value="">All</option>
              {gpuModels.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Region Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Region</span>
            <select
              value={filterRegion || ''}
              onChange={(e) => setFilterRegion(e.target.value || null)}
              className="h-8 px-2 text-xs border border-border/40 rounded bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
            >
              <option value="">All</option>
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Price/Hour</span>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                step="0.01"
                min="0"
                className="w-20 h-8 px-2 text-xs border border-border/40 rounded bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
              />
              <span className="text-xs text-muted-foreground">–</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                step="0.01"
                min="0"
                className="w-20 h-8 px-2 text-xs border border-border/40 rounded bg-background focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {(filterProvider || filterGPU || filterRegion || minPrice || maxPrice) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFilterProvider(null)
                setFilterGPU(null)
                setFilterRegion(null)
                setMinPrice('')
                setMaxPrice('')
              }}
              className="h-8 text-xs"
            >
              Clear filters
            </Button>
          )}

          {/* Results Count & Info */}
          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {sortedPrices.length} {sortedPrices.length === 1 ? 'result' : 'results'}
            </span>
            <span className="text-xs text-muted-foreground/60">
              Filters apply in real time
            </span>
          </div>
        </div>
      </div>

      {/* Full-Width Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-muted/50 backdrop-blur-sm border-b border-border/40">
            <tr>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <button
                  onClick={() => handleSort('provider')}
                  className="flex items-center gap-2 hover:text-foreground transition-colors"
                >
                  Provider
                  <SortIcon column="provider" />
                </button>
              </th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <button
                  onClick={() => handleSort('gpu_model')}
                  className="flex items-center gap-2 hover:text-foreground transition-colors"
                >
                  GPU Model
                  <SortIcon column="gpu_model" />
                </button>
              </th>
              <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <button
                  onClick={() => handleSort('region')}
                  className="flex items-center gap-2 hover:text-foreground transition-colors"
                >
                  Region
                  <SortIcon column="region" />
                </button>
              </th>
              <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <button
                  onClick={() => handleSort('price_per_hour')}
                  className="flex items-center gap-2 ml-auto hover:text-foreground transition-colors"
                >
                  Price/Hour
                  <SortIcon column="price_per_hour" />
                </button>
              </th>
              <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <button
                  onClick={() => handleSort('availability')}
                  className="flex items-center gap-2 ml-auto hover:text-foreground transition-colors"
                >
                  Availability
                  <SortIcon column="availability" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPrices.map((price, index) => (
              <tr
                key={`${price.provider}-${price.gpu_model}-${price.region}-${index}`}
                className="border-b border-border/30 hover:bg-muted/30 transition-colors"
              >
                <td className="p-3 text-sm font-medium">{price.provider}</td>
                <td className="p-3 text-sm">{price.gpu_model}</td>
                <td className="p-3 text-sm text-muted-foreground">{price.region}</td>
                <td className="p-3 text-sm font-mono text-right">{formatCurrency(price.price_per_hour)}</td>
                <td className="p-3 text-sm text-right">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                    price.availability >= 0.8 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : price.availability >= 0.5
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {(price.availability * 100).toFixed(0)}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
