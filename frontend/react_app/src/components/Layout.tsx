import { type ReactNode, useState, useEffect } from 'react'
import { LayoutDashboard, TrendingDown, DollarSign, Target, Moon, Sun } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '../lib/utils'

interface LayoutProps {
  children: ReactNode
  currentPage: string
  onNavigate: (page: string) => void
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved === 'true' ? true : false
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', darkMode.toString())
  }, [darkMode])

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'arbitrage', label: 'Arbitrage', icon: TrendingDown },
    { id: 'prices', label: 'Live Prices', icon: DollarSign },
    { id: 'calculator', label: 'Decision Engine', icon: Target },
  ]

  return (
    <div className="flex h-screen bg-background">
      {/* Minimal Sidebar */}
      <aside className="w-56 border-r border-border/40 bg-card/30 backdrop-blur-sm flex flex-col">
        <div className="p-5 border-b border-border/40">
          <h1 className="text-base font-medium text-foreground">GPU Arbitrage</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Cost Intelligence</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = currentPage === item.id
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-normal transition-all relative",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 w-0.5 h-4 bg-primary rounded-r-full" />
                )}
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border/40">
          <div className="text-[11px] text-muted-foreground space-y-1">
            <p className="font-medium text-foreground/80">Academic Project</p>
            <p>Simulated data for demonstration</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Minimal Header */}
        <header className="h-14 border-b border-border/40 bg-card/50 backdrop-blur-sm px-6 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium text-foreground">
              {navItems.find(item => item.id === currentPage)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDarkMode(!darkMode)}
              className="h-8 w-8 p-0"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
