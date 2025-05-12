import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Container, Box, MenuItem, Select, InputLabel, FormControl, Tooltip } from "@mui/material";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip as ChartTooltip, Legend } from 'chart.js';
import axios from 'axios';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, ChartTooltip, Legend);

const API_BASE = 'http://localhost:3000';

function StockPage() {
  const [ticker, setTicker] = React.useState("NVDA");
  const [minutes, setMinutes] = React.useState(50);
  const [data, setData] = React.useState(null);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stocks/${ticker}?minutes=${minutes}&aggregation=average`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [ticker, minutes]);

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
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Stock Chart</Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl>
          <InputLabel>Stock</InputLabel>
          <Select value={ticker} label="Stock" onChange={(e) => setTicker(e.target.value)}>
            {['NVDA', 'PYPL', 'AAPL', 'MSFT', 'GOOGL'].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel>Minutes</InputLabel>
          <Select value={minutes} label="Minutes" onChange={(e) => setMinutes(Number(e.target.value))}>
            {[15, 30, 50, 90].map(m => <MenuItem key={m} value={m}>{m} min</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {chartData ? <Line data={chartData} /> : <Typography>Loading...</Typography>}
    </Container>
  );
}

function CorrelationHeatmap() {
  const [minutes, setMinutes] = React.useState(50);
  const [correlations, setCorrelations] = React.useState([]);
  const [tickers] = React.useState(["NVDA", "PYPL", "AAPL", "MSFT", "GOOGL"]);

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
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Correlation Heatmap</Typography>
      <FormControl sx={{ mb: 2 }}>
        <InputLabel>Minutes</InputLabel>
        <Select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
          {[15, 30, 50, 90].map(m => <MenuItem key={m} value={m}>{m} min</MenuItem>)}
        </Select>
      </FormControl>

      <Box sx={{ display: 'grid', gridTemplateColumns: `repeat(${tickers.length}, 1fr)`, gap: 1 }}>
        {tickers.map((t1, i) => (
          tickers.map((t2, j) => {
            if (i === j) return <Box key={`${i}-${j}`} sx={{ height: 40 }} />;
            const match = correlations.find(c => c.from === t1 && c.to === t2);
            const bg = match ? getColor(match.correlation) : '#eee';
            return (
              <Tooltip
                key={`${i}-${j}`}
                title={match ? `${t1}-${t2}: ${match.correlation}\n${t1} Avg: ${match.avg[t1]}, SD: ${match.stddev[t1]}\n${t2} Avg: ${match.avg[t2]}, SD: ${match.stddev[t2]}` : ''}
              >
                <Box sx={{ height: 40, backgroundColor: bg, textAlign: 'center', lineHeight: '40px' }}>
                  {match ? match.correlation : '-'}
                </Box>
              </Tooltip>
            );
          })
        ))}
      </Box>
    </Container>
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
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Stock Insight App
          </Typography>
          <Button color="inherit" component={Link} to="/">
            Stock Chart
          </Button>
          <Button color="inherit" component={Link} to="/heatmap">
            Correlation Heatmap
          </Button>
        </Toolbar>
      </AppBar>
      <Routes>
        <Route path="/" element={<StockPage />} />
        <Route path="/heatmap" element={<CorrelationHeatmap />} />
      </Routes>
    </Router>
  );
}

export default App;
