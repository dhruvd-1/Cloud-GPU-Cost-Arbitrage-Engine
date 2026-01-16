import React, { useState } from 'react';

function PriceTable({ prices }) {
  const [sortBy, setSortBy] = useState('price_per_hour');
  const [filterGPU, setFilterGPU] = useState('');

  const uniqueGPUs = [...new Set(prices.map(p => p.gpu_model))];

  const filteredPrices = prices
    .filter(p => !filterGPU || p.gpu_model === filterGPU)
    .sort((a, b) => {
      if (sortBy === 'price_per_hour') return a.price_per_hour - b.price_per_hour;
      if (sortBy === 'availability') return b.availability - a.availability;
      return 0;
    });

  return (
    <div className="price-table-container">
      <div className="controls">
        <label>
          Filter by GPU:
          <select value={filterGPU} onChange={(e) => setFilterGPU(e.target.value)}>
            <option value="">All GPUs</option>
            {uniqueGPUs.map(gpu => (
              <option key={gpu} value={gpu}>{gpu}</option>
            ))}
          </select>
        </label>

        <label>
          Sort by:
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="price_per_hour">Price (Low to High)</option>
            <option value="availability">Availability (High to Low)</option>
          </select>
        </label>
      </div>

      <table className="price-table">
        <thead>
          <tr>
            <th>Provider</th>
            <th>Region</th>
            <th>GPU Model</th>
            <th>Price/Hour</th>
            <th>Availability</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {filteredPrices.map((price, idx) => (
            <tr key={idx}>
              <td className="provider">{price.provider}</td>
              <td>{price.region}</td>
              <td className="gpu-model">{price.gpu_model}</td>
              <td className="price">${price.price_per_hour.toFixed(2)}/hr</td>
              <td>
                <div className="availability-bar">
                  <div
                    className="availability-fill"
                    style={{ width: `${price.availability * 100}%` }}
                  />
                  <span>{(price.availability * 100).toFixed(0)}%</span>
                </div>
              </td>
              <td>{price.cost_performance_score?.toFixed(2) || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredPrices.length === 0 && (
        <div className="no-data">No prices available</div>
      )}
    </div>
  );
}

export default PriceTable;
