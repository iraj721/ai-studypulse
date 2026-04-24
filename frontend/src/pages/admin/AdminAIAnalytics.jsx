import React, { useEffect, useState } from "react";
import apiAdmin from "../../services/apiAdmin";
import Stars from "../../components/Stars";
import BackButton from "../../components/BackButton";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

export default function AdminAIAnalytics() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [hourlyData, setHourlyData] = useState([]);

  useEffect(() => {
    fetchAnalytics();
    fetchHourlyData();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await apiAdmin.get("/admin/analytics/overall");
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHourlyData = async () => {
    try {
      const res = await apiAdmin.get("/admin/analytics/hourly");
      setHourlyData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="bg-dark min-vh-100 py-5">
        <div className="container text-center">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="text-white mt-3">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Chart Data
  const featureChartData = {
    labels: analytics?.usageByFeature?.map(f => f.feature) || [],
    datasets: [
      {
        label: 'Requests',
        data: analytics?.usageByFeature?.map(f => f.requests) || [],
        backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
        borderRadius: 8,
      }
    ]
  };

  const dailyChartData = {
    labels: analytics?.dailyUsage?.map(d => d.date.slice(5)) || [],
    datasets: [
      {
        label: 'Requests',
        data: analytics?.dailyUsage?.map(d => d.requests) || [],
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const hourlyChartData = {
    labels: hourlyData?.map(h => `${h._id}:00`) || [],
    datasets: [
      {
        label: 'Requests',
        data: hourlyData?.map(h => h.totalRequests) || [],
        backgroundColor: '#10b981',
        borderRadius: 8,
      }
    ]
  };

  const tokenChartData = {
    labels: analytics?.userWiseUsage?.slice(0, 5).map(u => u.user?.name?.slice(0, 15)) || [],
    datasets: [
      {
        label: 'Tokens Used',
        data: analytics?.userWiseUsage?.slice(0, 5).map(u => u.totalTokens) || [],
        backgroundColor: '#f59e0b',
        borderRadius: 8,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: { mode: 'index', intersect: false }
    }
  };

  return (
    <div className="admin-analytics-page min-vh-100 py-5">
      <Stars />
      <div className="container">
        <BackButton to="/admin/dashboard" label="← Back to Dashboard" />
        
        <h2 className="text-white fw-bold mb-4">🤖 AI Usage Analytics</h2>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="stats-card">
              <div className="stats-icon">📊</div>
              <div className="stats-info">
                <div className="stats-value">{analytics?.todayUsage?.totalRequests || 0}</div>
                <div className="stats-label">Today's Requests</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stats-card">
              <div className="stats-icon">📅</div>
              <div className="stats-info">
                <div className="stats-value">{analytics?.monthlyUsage?.totalRequests || 0}</div>
                <div className="stats-label">This Month</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stats-card">
              <div className="stats-icon">🎯</div>
              <div className="stats-info">
                <div className="stats-value">{analytics?.limits?.groq?.daily || 14400}</div>
                <div className="stats-label">Daily Limit (Groq)</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="stats-card">
              <div className="stats-icon">⚡</div>
              <div className="stats-info">
                <div className="stats-value">{analytics?.limits?.groq?.perMinute || 30}</div>
                <div className="stats-label">Per Minute Limit</div>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Remaining */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="usage-card">
              <h5>📈 Daily Usage Remaining</h5>
              <div className="progress-container">
                <div className="progress-label">
                  <span>Used: {analytics?.todayUsage?.totalRequests || 0}</span>
                  <span>Left: {Math.max(0, (analytics?.limits?.groq?.daily || 14400) - (analytics?.todayUsage?.totalRequests || 0))}</span>
                </div>
                <div className="progress-bar-custom">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${Math.min(100, ((analytics?.todayUsage?.totalRequests || 0) / (analytics?.limits?.groq?.daily || 14400)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="usage-card">
              <h5>⏱️ Per Minute Usage</h5>
              <div className="progress-container">
                <div className="progress-label">
                  <span>Current: {analytics?.hourlyRequests || 0}/min</span>
                  <span>Limit: {analytics?.limits?.groq?.perMinute || 30}/min</span>
                </div>
                <div className="progress-bar-custom">
                  <div 
                    className="progress-fill warning" 
                    style={{ width: `${Math.min(100, ((analytics?.hourlyRequests || 0) / (analytics?.limits?.groq?.perMinute || 30)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div className="chart-card">
              <h5>📊 Requests by Feature</h5>
              <div className="chart-container" style={{ height: '300px' }}>
                <Bar data={featureChartData} options={chartOptions} />
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="chart-card">
              <h5>📅 Daily Requests (Last 30 Days)</h5>
              <div className="chart-container" style={{ height: '300px' }}>
                <Line data={dailyChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div className="chart-card">
              <h5>⏰ Hourly Requests (Today)</h5>
              <div className="chart-container" style={{ height: '300px' }}>
                <Bar data={hourlyChartData} options={chartOptions} />
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="chart-card">
              <h5>🔑 Top Users by Tokens</h5>
              <div className="chart-container" style={{ height: '300px' }}>
                <Bar data={tokenChartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>

        {/* Top Users Table */}
        <div className="table-card">
          <h5>👥 Top Users by Usage</h5>
          <div className="table-responsive">
            <table className="analytics-table">
              <thead>
                <tr><th>User</th><th>Email</th><th>Requests</th><th>Tokens Used</th></tr>
              </thead>
              <tbody>
                {analytics?.userWiseUsage?.map((u, idx) => (
                  <tr key={idx}>
                    <td>{u.user?.name || "Unknown"}</td>
                    <td>{u.user?.email || "unknown"}</td>
                    <td><strong>{u.totalRequests}</strong></td>
                    <td><strong>{u.totalTokens}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        .admin-analytics-page {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        }
        .stats-card, .usage-card, .chart-card, .table-card {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 20px;
          color: white;
        }
        .stats-card {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .stats-icon {
          font-size: 40px;
        }
        .stats-value {
          font-size: 32px;
          font-weight: bold;
        }
        .stats-label {
          font-size: 12px;
          opacity: 0.7;
        }
        .progress-container {
          margin-top: 10px;
        }
        .progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-bottom: 8px;
        }
        .progress-bar-custom {
          background: rgba(255,255,255,0.2);
          border-radius: 10px;
          height: 8px;
          overflow: hidden;
        }
        .progress-fill {
          background: linear-gradient(90deg, #4f46e5, #6366f1);
          height: 100%;
          border-radius: 10px;
          transition: width 0.3s;
        }
        .progress-fill.warning {
          background: linear-gradient(90deg, #f59e0b, #ef4444);
        }
        .chart-container {
          margin-top: 15px;
        }
        .analytics-table {
          width: 100%;
          color: white;
          border-collapse: collapse;
        }
        .analytics-table th, .analytics-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .analytics-table th {
          color: #a5b4fc;
          font-weight: 600;
        }
        @media (max-width: 768px) {
          .stats-value { font-size: 24px; }
          .stats-icon { font-size: 30px; }
        }
      `}</style>
    </div>
  );
}