import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip as ChartTooltip, Legend } from 'chart.js';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, ChartTooltip, Legend);

const API_BASE = 'http://localhost:3000';

function StockPage() {
  const [ticker, setTicker] = React.useState("NVDA");
  const [minutes, setMinutes] = React.useState(50);
  const [data, setData] = React.useState(null);

  // Fetch stock data for the selected ticker and time range
  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stocks/${ticker}?minutes=${minutes}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [ticker, minutes]); // Fetch data when ticker or minutes change

  const chartData = data ? {
    labels: data.priceHistory.map(p => new Date(p.lastUpdatedAt).toLocaleTimeString()),
    datasets: [
      {
        label: 'Price',
        data: data.priceHistory.map(p => p.price),
        borderColor: 'blue',
        tension: 0.3,
      },
      {
        label: 'Average Price',
        data: data.priceHistory.map(() => data.averageStockPrice),
        borderColor: 'red',
        borderDash: [5, 5],
        pointRadius: 0,
      },
    ],
  } : null;

  return (
    <div>
      <h1>Stock Chart</h1>

      <div>
        <label>
          Stock:
          <select value={ticker} onChange={(e) => setTicker(e.target.value)}>
            {['NVDA', 'PYPL', 'AAPL', 'MSFT', 'GOOGL'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>

        <label>
          Minutes:
          <select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
            {[15, 30, 50, 90].map(m => <option key={m} value={m}>{m} min</option>)}
          </select>
        </label>
      </div>

      {chartData ? <Line data={chartData} /> : <p>Loading...</p>}
    </div>
  );
}

function CorrelationHeatmap() {
  const [minutes, setMinutes] = React.useState(50);
  const [correlations, setCorrelations] = React.useState([]);
  const [tickers] = React.useState(["NVDA", "PYPL", "AAPL", "MSFT", "GOOGL"]);

  // Fetch correlation data between stocks for the selected time range
  const fetchData = async () => {
    const results = [];
    for (let i = 0; i < tickers.length; i++) {
      for (let j = 0; j < tickers.length; j++) {
        if (i !== j) {
          try {
            const res = await axios.get(`${API_BASE}/stockcorrelation?minutes=${minutes}&ticker=${tickers[i]}&ticker=${tickers[j]}`);
            results.push({
              from: tickers[i],
              to: tickers[j],
              correlation: res.data.correlation.toFixed(3),
              stddev: {
                [tickers[i]]: stdDev(res.data.stocks[tickers[i]].priceHistory),
                [tickers[j]]: stdDev(res.data.stocks[tickers[j]].priceHistory)
              },
              avg: {
                [tickers[i]]: res.data.stocks[tickers[i]].averagePrice.toFixed(2),
                [tickers[j]]: res.data.stocks[tickers[j]].averagePrice.toFixed(2)
              }
            });
          } catch (err) {
            console.error(err);
          }
        }
      }
    }
    setCorrelations(results);
  };

  const stdDev = (arr) => {
    const prices = arr.map(p => p.price);
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    return Math.sqrt(prices.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / prices.length).toFixed(2);
  };

  React.useEffect(() => {
    fetchData();
  }, [minutes]);

  return (
    <div>
      <h1>Correlation Heatmap</h1>
      <label>
        Minutes:
        <select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
          {[15, 30, 50, 90].map(m => <option key={m} value={m}>{m} min</option>)}
        </select>
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${tickers.length}, 1fr)` }}>
        {tickers.map((t1, i) => (
          tickers.map((t2, j) => {
            if (i === j) return <div key={`${i}-${j}`} style={{ height: 40 }} />;
            const match = correlations.find(c => c.from === t1 && c.to === t2);
            const bg = match ? getColor(match.correlation) : '#eee';
            return (
              <div key={`${i}-${j}`} style={{ height: 40, backgroundColor: bg, textAlign: 'center', lineHeight: '40px' }}>
                {match ? match.correlation : '-'}
              </div>
            );
          })
        ))}
      </div>
    </div>
  );
}

function getColor(value) {
  const v = parseFloat(value);
  if (v >= 0.7) return '#2ecc71';       // strong positive
  if (v >= 0.3) return '#f1c40f';       // weak positive
  if (v >= -0.3) return '#ecf0f1';      // neutral
  if (v >= -0.7) return '#f39c12';      // weak negative
  return '#e74c3c';                     // strong negative
}

function App() {
  return (
    <Router>
      <div style={{ backgroundColor: '#333', color: '#fff', padding: '10px' }}>
        <h2>Stock Insight App</h2>
        <Link to="/" style={{ color: '#fff', marginRight: '10px' }}>Stock Chart</Link>
        <Link to="/heatmap" style={{ color: '#fff' }}>Correlation Heatmap</Link>
      </div>

      <Routes>
        <Route path="/" element={<StockPage />} />
        <Route path="/heatmap" element={<CorrelationHeatmap />} />
      </Routes>
    </Router>
  );
}

export default App;
