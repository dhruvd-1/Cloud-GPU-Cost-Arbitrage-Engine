import { type ReactNode, useState, useEffect } from 'react'
import { LayoutDashboard, TrendingDown, DollarSign, Calculator, Moon, Sun, Database, Activity, Brain } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { cn } from '../lib/utils'
import { SystemThinkingModal } from './SystemThinkingModal'

interface LayoutProps {
  children: ReactNode
  currentPage: string
  onNavigate: (page: string) => void
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const [darkMode, setDarkMode] = useState(true)
  const [countdown, setCountdown] = useState(300)
  const [showSystemThinking, setShowSystemThinking] = useState(false)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 300
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'arbitrage', label: 'Arbitrage', icon: TrendingDown },
    { id: 'prices', label: 'Live Prices', icon: DollarSign },
    { id: 'calculator', label: 'Calculator', icon: Calculator },
  ]

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold">GPU Arbitrage</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Cloud Cost Intelligence</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                currentPage === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">System Status</span>
            <Badge variant="success" className="gap-1">
              <Database className="w-3 h-3" />
              Operational
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            <p>Academic Project</p>
            <p className="text-[10px] mt-1">Mock data for demonstration</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-lg font-semibold">
                {navItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
              </h2>
              <p className="text-xs text-muted-foreground">
                Real-time GPU pricing across 6 providers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Mock Data</span>
            </div>
            
            <div className="text-xs text-muted-foreground">
              Auto-refresh: <span className="font-mono font-medium text-foreground">{formatTime(countdown)}</span>
            </div>

            <Button 
              variant="default" 
              size="sm" 
              onClick={() => setShowSystemThinking(true)}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 border-0"
            >
              <Brain className="w-4 h-4 mr-2" />
              How This System Thinks
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>

      <SystemThinkingModal isOpen={showSystemThinking} onClose={() => setShowSystemThinking(false)} />
    </div>
  )
}
