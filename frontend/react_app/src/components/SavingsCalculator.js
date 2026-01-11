import React, { useState } from 'react';

function SavingsCalculator({ prices }) {
  const [selectedGPU, setSelectedGPU] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState(24);
  const [daysPerMonth, setDaysPerMonth] = useState(30);

  const uniqueGPUs = [...new Set(prices.map(p => p.gpu_model))];

  const gpuPrices = prices.filter(p => p.gpu_model === selectedGPU);
  const cheapest = gpuPrices.length > 0
    ? gpuPrices.reduce((min, p) => p.price_per_hour < min.price_per_hour ? p : min)
    : null;
  const mostExpensive = gpuPrices.length > 0
    ? gpuPrices.reduce((max, p) => p.price_per_hour > max.price_per_hour ? p : max)
    : null;

  const calculateSavings = () => {
    if (!cheapest || !mostExpensive) return null;

    const hourlyDiff = mostExpensive.price_per_hour - cheapest.price_per_hour;
    const totalHours = hoursPerDay * daysPerMonth;
    const monthlySavings = hourlyDiff * totalHours;
    const annualSavings = monthlySavings * 12;

    return {
      hourly: hourlyDiff,
      monthly: monthlySavings,
      annual: annualSavings,
      totalHours,
    };
  };

  const savings = calculateSavings();

  return (
    <div className="calculator-container">
      <h2>🧮 Savings Calculator</h2>
      <p className="subtitle">Calculate potential savings based on your usage</p>

      <div className="calculator-form">
        <div className="form-group">
          <label>GPU Model:</label>
          <select value={selectedGPU} onChange={(e) => setSelectedGPU(e.target.value)}>
            <option value="">Select a GPU</option>
            {uniqueGPUs.map(gpu => (
              <option key={gpu} value={gpu}>{gpu}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Hours per day:</label>
          <input
            type="number"
            min="1"
            max="24"
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(parseInt(e.target.value) || 1)}
          />
        </div>

        <div className="form-group">
          <label>Days per month:</label>
          <input
            type="number"
            min="1"
            max="31"
            value={daysPerMonth}
            onChange={(e) => setDaysPerMonth(parseInt(e.target.value) || 1)}
          />
        </div>
      </div>

      {selectedGPU && cheapest && mostExpensive && (
        <div className="results">
          <div className="comparison-row">
            <div className="comparison-item">
              <h4>🏆 Cheapest Option</h4>
              <p className="provider-name">{cheapest.provider}</p>
              <p className="price">${cheapest.price_per_hour.toFixed(2)}/hr</p>
              <p className="region">{cheapest.region}</p>
            </div>

            <div className="comparison-item">
              <h4>💸 Most Expensive</h4>
              <p className="provider-name">{mostExpensive.provider}</p>
              <p className="price">${mostExpensive.price_per_hour.toFixed(2)}/hr</p>
              <p className="region">{mostExpensive.region}</p>
            </div>
          </div>

          {savings && (
            <div className="savings-summary">
              <h3>💰 Your Potential Savings</h3>
              <div className="usage-info">
                Usage: {hoursPerDay} hours/day × {daysPerMonth} days/month = {savings.totalHours} hours/month
              </div>

              <div className="savings-grid">
                <div className="savings-card">
                  <div className="amount">${savings.hourly.toFixed(2)}</div>
                  <div className="label">Per Hour</div>
                </div>

                <div className="savings-card">
                  <div className="amount">${savings.monthly.toFixed(2)}</div>
                  <div className="label">Per Month</div>
                </div>

                <div className="savings-card highlight">
                  <div className="amount">${savings.annual.toLocaleString()}</div>
                  <div className="label">Per Year</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedGPU && (
        <div className="no-data">Please select a GPU model to calculate savings</div>
      )}
    </div>
  );
}

export default SavingsCalculator;
