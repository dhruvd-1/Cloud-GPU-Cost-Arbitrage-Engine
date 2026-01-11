import React from 'react';

function ArbitrageView({ opportunities }) {
  return (
    <div className="arbitrage-container">
      <h2>💰 Arbitrage Opportunities</h2>
      <p className="subtitle">
        Save money by choosing the best provider for each GPU model
      </p>

      {opportunities.length === 0 && (
        <div className="no-data">No arbitrage opportunities found</div>
      )}

      <div className="opportunities-grid">
        {opportunities.map((opp, idx) => (
          <div key={idx} className="opportunity-card">
            <div className="card-header">
              <h3>{opp.gpu_model}</h3>
              <span className="savings-badge">
                Save {opp.percentage_savings.toFixed(1)}%
              </span>
            </div>

            <div className="comparison">
              <div className="option best">
                <div className="label">🏆 Best Option</div>
                <div className="provider-name">{opp.cheapest_provider.provider}</div>
                <div className="region">{opp.cheapest_provider.region}</div>
                <div className="price">${opp.cheapest_provider.price_per_hour.toFixed(2)}/hr</div>
                <div className="availability">
                  {(opp.cheapest_provider.availability * 100).toFixed(0)}% available
                </div>
              </div>

              <div className="vs">VS</div>

              <div className="option worst">
                <div className="label">💸 Most Expensive</div>
                <div className="provider-name">{opp.most_expensive_provider.provider}</div>
                <div className="region">{opp.most_expensive_provider.region}</div>
                <div className="price">${opp.most_expensive_provider.price_per_hour.toFixed(2)}/hr</div>
                <div className="availability">
                  {(opp.most_expensive_provider.availability * 100).toFixed(0)}% available
                </div>
              </div>
            </div>

            <div className="savings-details">
              <div className="savings-row">
                <span>Hourly Savings:</span>
                <strong>${opp.price_difference_usd_per_hour.toFixed(2)}</strong>
              </div>
              <div className="savings-row">
                <span>Monthly Savings (24/7):</span>
                <strong>${(opp.price_difference_usd_per_hour * 730).toFixed(2)}</strong>
              </div>
              <div className="savings-row highlight">
                <span>Annual Savings (24/7):</span>
                <strong>${opp.annual_savings_usd.toLocaleString()}</strong>
              </div>
              <div className="savings-row">
                <span>Providers offering this GPU:</span>
                <strong>{opp.providers_offering}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ArbitrageView;
