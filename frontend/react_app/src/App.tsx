import { useState, useEffect } from 'react'
import { Layout } from './components/Layout'
import { Dashboard } from './components/pages/Dashboard'
import { Arbitrage } from './components/pages/Arbitrage'
import { Prices } from './components/pages/Prices'
import { Calculator } from './components/pages/Calculator'
import { Methodology } from './components/pages/Methodology'
import './index.css'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [prices, setPrices] = useState([])
  const [arbitrage, setArbitrage] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch latest prices
      const pricesRes = await fetch('http://localhost:8000/prices/latest?limit=100')
      const pricesData = await pricesRes.json()
      setPrices(pricesData.prices || [])

      // Fetch arbitrage opportunities
      const arbRes = await fetch('http://localhost:8000/arbitrage/best?min_savings_percent=10')
      const arbData = await arbRes.json()
      setArbitrage(arbData.opportunities || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 300000)
    return () => clearInterval(interval)
  }, [])

  const renderPage = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading GPU pricing data...</p>
          </div>
        </div>
      )
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard prices={prices} arbitrageOpportunities={arbitrage} />
      case 'arbitrage':
        return <Arbitrage opportunities={arbitrage} />
      case 'prices':
        return <Prices prices={prices} />
      case 'calculator':
        return <Calculator prices={prices} />
      case 'methodology':
        return <Methodology />
      default:
        return <Dashboard prices={prices} arbitrageOpportunities={arbitrage} />
    }
  }

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  )
}

export default App
