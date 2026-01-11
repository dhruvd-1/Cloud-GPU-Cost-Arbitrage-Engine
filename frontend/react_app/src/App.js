import React, { useState, useEffect } from 'react';
import './App.css';
import PriceTable from './components/PriceTable';
import ArbitrageView from './components/ArbitrageView';
import SavingsCalculator from './components/SavingsCalculator';

function App() {
  const [activeTab, setActiveTab] = useState('prices');
  const [prices, setPrices] = useState([]);
  const [arbitrage, setArbitrage] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch latest prices
      const pricesRes = await fetch('/prices/latest?limit=50');
      const pricesData = await pricesRes.json();
      setPrices(pricesData.prices || []);

      // Fetch arbitrage opportunities
      const arbRes = await fetch('/arbitrage/best?min_savings_percent=10');
      const arbData = await arbRes.json();
      setArbitrage(arbData.opportunities || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>⚡ GPU Cost Arbitrage Engine</h1>
        <p>Real-time GPU price comparison across cloud providers</p>
      </header>

      <nav className="tabs">
        <button
          className={activeTab === 'prices' ? 'active' : ''}
          onClick={() => setActiveTab('prices')}
        >
          📊 Live Prices
        </button>
        <button
          className={activeTab === 'arbitrage' ? 'active' : ''}
          onClick={() => setActiveTab('arbitrage')}
        >
          💰 Arbitrage Opportunities
        </button>
        <button
          className={activeTab === 'calculator' ? 'active' : ''}
          onClick={() => setActiveTab('calculator')}
        >
          🧮 Savings Calculator
        </button>
      </nav>

      <main className="content">
        {loading && <div className="loading">Loading...</div>}

        {!loading && activeTab === 'prices' && (
          <PriceTable prices={prices} />
        )}

        {!loading && activeTab === 'arbitrage' && (
          <ArbitrageView opportunities={arbitrage} />
        )}

        {!loading && activeTab === 'calculator' && (
          <SavingsCalculator prices={prices} />
        )}
      </main>

      <footer className="footer">
        <p>Last updated: {new Date().toLocaleString()}</p>
        <button onClick={fetchData} className="refresh-btn">🔄 Refresh</button>
      </footer>
    </div>
  );
}

export default App;
