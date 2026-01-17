import { motion, AnimatePresence } from 'framer-motion'
import { X, Layers, Database, TrendingDown, Zap, Shield, BarChart3 } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'

interface MethodologyModalProps {
  isOpen: boolean
  onClose: () => void
}

export function MethodologyModal({ isOpen, onClose }: MethodologyModalProps) {
  const layers = [
    {
      icon: Database,
      title: 'Data Collection Layer',
      description: 'Scheduled fetching from multiple cloud providers',
      details: ['REST API integration', 'Mock data simulation', 'Rate limiting & retry logic']
    },
    {
      icon: Layers,
      title: 'Normalization Layer',
      description: 'Standardizes pricing data across providers',
      details: ['GPU model mapping', 'TFLOP calculation', 'Region/availability normalization']
    },
    {
      icon: TrendingDown,
      title: 'Analytics Layer',
      description: 'Arbitrage detection and trend analysis',
      details: ['Price difference calculation', 'Savings percentage', 'Historical trends']
    },
    {
      icon: BarChart3,
      title: 'Presentation Layer',
      description: 'Interactive dashboard with real-time updates',
      details: ['Live price tables', 'Savings calculator', 'Export functionality']
    }
  ]

  const methodology = [
    {
      icon: Zap,
      title: 'TFLOP Normalization',
      description: 'Cost per teraflop (TFLOP) provides a performance-normalized metric for comparing GPU value across different architectures.'
    },
    {
      icon: Shield,
      title: 'Reliability Scoring',
      description: 'Availability metrics are factored into effective cost calculations, accounting for potential downtime and SLA differences.'
    },
    {
      icon: TrendingDown,
      title: 'Arbitrage Detection',
      description: 'Identifies price discrepancies exceeding configurable thresholds, highlighting opportunities for cost optimization.'
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold">Architecture & Methodology</h2>
                <p className="text-sm text-muted-foreground mt-1">How the Cloud GPU Cost Arbitrage Engine works</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* Architecture Layers */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  System Architecture
                </h3>
                <div className="space-y-3">
                  {layers.map((layer, index) => (
                    <Card key={index} className="border-l-4" style={{ borderLeftColor: `hsl(${index * 60}, 70%, 50%)` }}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <layer.icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold">{layer.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">{layer.description}</p>
                            <ul className="mt-2 space-y-1">
                              {layer.details.map((detail, i) => (
                                <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                                  <div className="w-1 h-1 rounded-full bg-primary" />
                                  {detail}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Methodology */}
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Analytical Methodology
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {methodology.map((method, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-3">
                          <method.icon className="w-6 h-6 text-primary" />
                        </div>
                        <h4 className="font-bold mb-2">{method.title}</h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">{method.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Academic Disclaimer */}
              <Card className="bg-muted/50 border-dashed">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    <strong>Academic Research Project:</strong> This system demonstrates multi-cloud cost optimization techniques 
                    using simulated pricing data. Real-world implementations require integration with official provider APIs, 
                    authentication mechanisms, and comprehensive error handling. The arbitrage opportunities shown are for 
                    educational purposes and may not reflect actual market conditions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
