import React, { useEffect, useState } from "react";
import apiAdmin from "../../services/apiAdmin";
import BackButton from "../../components/BackButton";
import { Line, Bar } from "react-chartjs-2";
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
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchAnalytics();
    fetchHourlyData();
    fetchUsers();
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

  const fetchUsers = async () => {
    try {
      const res = await apiAdmin.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserAnalytics = async () => {
    if (!selectedUserId) return;
    try {
      const res = await apiAdmin.get(`/admin/analytics/user/${selectedUserId}`);
      setUserAnalytics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedUserId) {
      fetchUserAnalytics();
    }
  }, [selectedUserId]);

  if (loading) {
    return (
      <div className="admin-analytics-page min-vh-100 py-5">
        <div className="container text-center">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="text-white mt-3">Loading analytics...</p>
        </div>
      </div>
    );
  }

  // Chart Data
  const featureChartData = {
    labels: analytics?.usageByFeature?.map(f => f.feature?.toUpperCase()) || [],
    datasets: [
      {
        label: 'Requests',
        data: analytics?.usageByFeature?.map(f => f.requests) || [],
        backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
        borderRadius: 8,
      }
    ]
  };

  const dailyChartData = {
    labels: analytics?.dailyUsage?.map(d => d.date?.slice(5)) || [],
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
      legend: { position: 'bottom', labels: { color: '#fff' } },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } },
      x: { ticks: { color: '#fff' }, grid: { color: 'rgba(255,255,255,0.1)' } }
    }
  };

  return (
    <div className="admin-analytics-page min-vh-100 py-5">
      <div className="container">
        <BackButton to="/admin/dashboard" label="← Back to Dashboard" />
        
        <h2 className="text-white fw-bold mb-4">🤖 AI Usage Analytics</h2>

        {/* Token Usage Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="stats-card">
              <div className="stats-icon">📊</div>
              <div className="stats-info">
                <div className="stats-value">{analytics?.overallTotal || 0}</div>
                <div className="stats-label">Total Tokens Used (All Time)</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stats-card">
              <div className="stats-icon">📅</div>
              <div className="stats-info">
                <div className="stats-value">{analytics?.todayUsage?.totalTokens || 0}</div>
                <div className="stats-label">Today's Tokens Used</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stats-card">
              <div className="stats-icon">📆</div>
              <div className="stats-info">
                <div className="stats-value">{analytics?.monthlyUsage?.totalTokens || 0}</div>
                <div className="stats-label">This Month's Tokens</div>
              </div>
            </div>
          </div>
        </div>

        {/* Remaining Tokens Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-6">
            <div className="usage-card">
              <h5>📈 Daily Tokens Remaining</h5>
              <div className="progress-container">
                <div className="progress-label">
                  <span>Used: {analytics?.remaining?.daily?.used || 0}</span>
                  <span>Remaining: {analytics?.remaining?.daily?.remaining || 0}</span>
                  <span>Limit: {analytics?.remaining?.daily?.limit || 14400}</span>
                </div>
                <div className="progress-bar-custom">
                  <div 
                    className={`progress-fill ${(analytics?.remaining?.daily?.percentUsed || 0) > 80 ? 'warning' : ''}`}
                    style={{ width: `${Math.min(100, analytics?.remaining?.daily?.percentUsed || 0)}%` }}
                  ></div>
                </div>
                <div className="progress-percent mt-2">{analytics?.remaining?.daily?.percentUsed || 0}% used</div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="usage-card">
              <h5>📆 Monthly Tokens Remaining</h5>
              <div className="progress-container">
                <div className="progress-label">
                  <span>Used: {analytics?.remaining?.monthly?.used || 0}</span>
                  <span>Remaining: {analytics?.remaining?.monthly?.remaining || 0}</span>
                  <span>Limit: {analytics?.remaining?.monthly?.limit || 30000}</span>
                </div>
                <div className="progress-bar-custom">
                  <div 
                    className={`progress-fill ${(analytics?.remaining?.monthly?.percentUsed || 0) > 80 ? 'warning' : ''}`}
                    style={{ width: `${Math.min(100, analytics?.remaining?.monthly?.percentUsed || 0)}%` }}
                  ></div>
                </div>
                <div className="progress-percent mt-2">{analytics?.remaining?.monthly?.percentUsed || 0}% used</div>
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

        {/* User Specific Analytics */}
        <div className="table-card mb-4">
          <h5>🔍 Specific User Analytics</h5>
          <div className="row g-3">
            <div className="col-md-6">
              <select 
                className="form-select user-select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">Select a user...</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>{user.name} ({user.email})</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <button className="btn btn-primary" onClick={fetchUserAnalytics}>
                View Usage
              </button>
            </div>
          </div>
          
          {userAnalytics && (
            <div className="user-analytics mt-4">
              <h6>📊 {userAnalytics.user?.name}'s Usage</h6>
              <div className="row g-3 mt-2">
                <div className="col-md-4">
                  <div className="user-stat-card">
                    <div className="user-stat-value">{userAnalytics.totalTokensUsed || 0}</div>
                    <div className="user-stat-label">Total Tokens Used</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="user-stat-card">
                    <div className="user-stat-value">{userAnalytics.todayUsage?.totalTokens || 0}</div>
                    <div className="user-stat-label">Today's Tokens</div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="user-stat-card">
                    <div className="user-stat-value">{userAnalytics.todayUsage?.totalRequests || 0}</div>
                    <div className="user-stat-label">Today's Requests</div>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <strong>Usage by Feature:</strong>
                <div className="user-feature-badges mt-2">
                  {userAnalytics.usageByFeature?.map((f, idx) => (
                    <span key={idx} className="feature-badge">
                      {f.feature}: {f.requests} req ({f.tokens} tokens)
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Top Users Table */}
        <div className="table-card">
          <h5>👥 Top Users by Tokens</h5>
          <div className="table-responsive">
            <table className="analytics-table">
              <thead>
                <tr><th>#</th><th>User</th><th>Email</th><th>Requests</th><th>Tokens Used</th></tr>
              </thead>
              <tbody>
                {analytics?.userWiseUsage?.map((u, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
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
          min-height: 100vh;
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
        .progress-percent {
          font-size: 11px;
          text-align: right;
          opacity: 0.7;
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
        .user-select {
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: white;
          border-radius: 12px;
          padding: 10px;
        }
        .user-select option {
          background: #1e293b;
        }
        .user-stat-card {
          background: rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 15px;
          text-align: center;
        }
        .user-stat-value {
          font-size: 24px;
          font-weight: bold;
          color: #a5b4fc;
        }
        .user-stat-label {
          font-size: 11px;
          opacity: 0.7;
          margin-top: 5px;
        }
        .user-feature-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .feature-badge {
          background: rgba(79, 70, 229, 0.3);
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 12px;
        }
        .btn-primary {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          border: none;
          border-radius: 12px;
          padding: 10px 20px;
        }
        @media (max-width: 768px) {
          .stats-value { font-size: 24px; }
          .stats-icon { font-size: 30px; }
        }
      `}</style>
    </div>
  );
}