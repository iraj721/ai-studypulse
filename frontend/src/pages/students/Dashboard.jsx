import React, { useEffect, useState, useRef } from "react";
import api from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import { Line, Bar } from "react-chartjs-2";
import Spinner from "../../components/Spinner";
import Navbar from "../../components/Navbar";
import MiniTimer from "../../components/MiniTimer"
import FloatingTimer from "../../components/FloatingTimer"
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler,
} from "chart.js";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import ActivityInsightsModal from "../../components/ActivityInsightsModal";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler);

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({
    totalStudyHours: 0,
    weeklyGraph: Array(7).fill(0),
    difficultyAnalysis: { easy: 0, medium: 0, hard: 0 },
    lastNote: null,
    lastClass: null,
    classesCount: 0
  });
  const [weakTopics, setWeakTopics] = useState({ weakTopics: [], suggestions: [] });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [toastMsg, setToastMsg] = useState({ message: "", type: "success" });
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [studyHistory, setStudyHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const toastTimer = useRef(null);

  const showToastMsg = (message, type = "success") => {
    setToastMsg({ message, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg({ message: "", type: "success" }), 5000);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch {
        localStorage.removeItem("token");
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      transports: ["polling", "websocket"],
      reconnection: true,
      reconnectionAttempts: 5
    });
    socket.emit("joinUserRoom", user._id);
    socket.on("newNotification", (data) => {
      toast.info(data.message);
      showToastMsg(data.message, "info");
    });
    return () => socket.disconnect();
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchActivities();
      fetchWeakTopics();
    }
  }, [user]);

  const fetchStats = async () => {
    let statsData = {}, classData = {};
    try {
      const res = await api.get("/activities/stats");
      statsData = res.data;
    } catch {
      statsData = {
        totalStudyHours: 0,
        weeklyGraph: Array(7).fill(0),
        difficultyAnalysis: { easy: 0, medium: 0, hard: 0 },
        lastNote: null,
        lastClass: null
      };
    }
    try {
      const res = await api.get("/student/classes/count");
      classData = res.data;
    } catch {
      classData = { count: 0, lastClass: null };
    }
    setStats({
      totalStudyHours: statsData.totalStudyHours || 0,
      weeklyGraph: statsData.weeklyGraph?.length === 7 ? statsData.weeklyGraph : Array(7).fill(0),
      difficultyAnalysis: statsData.difficultyAnalysis || { easy: 0, medium: 0, hard: 0 },
      lastNote: statsData.lastNote || null,
      lastClass: classData.lastClass || statsData.lastClass || null,
      classesCount: classData.count || 0
    });
  };

  const fetchActivities = async () => {
    try {
      const res = await api.get("/activities");
      setActivities(res.data?.slice(-5).reverse() || []);
    } catch {
      setActivities([]);
    }
  };

  const fetchWeakTopics = async () => {
    try {
      const res = await api.get("/quizzes/weak-topics");
      setWeakTopics(res.data || { weakTopics: [], suggestions: [] });
    } catch {
      setWeakTopics({ weakTopics: [], suggestions: [] });
    }
  };

  const fetchStudyHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get("/activities");
      setStudyHistory(res.data);
      setShowHistoryModal(true);
    } catch {
      showToastMsg("Failed to load study history", "error");
    } finally {
      setHistoryLoading(false);
    }
  };

  if (loading) return <Spinner message="Loading dashboard..." />;

  const lineData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{
      label: "Study Hours",
      data: stats?.weeklyGraph || Array(7).fill(0),
      fill: true,
      backgroundColor: "rgba(88,130,255,0.08)",
      borderColor: "#5882ff",
      borderWidth: 2,
      tension: 0.4,
      pointBackgroundColor: "#5882ff",
      pointBorderColor: "#0a0c12",
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6
    }],
  };

  const barData = {
    labels: ["Easy", "Medium", "Hard"],
    datasets: [{
      label: "Questions",
      data: [
        stats?.difficultyAnalysis?.easy || 0,
        stats?.difficultyAnalysis?.medium || 0,
        stats?.difficultyAnalysis?.hard || 0
      ],
      backgroundColor: ["rgba(16,185,129,0.7)", "rgba(245,158,11,0.7)", "rgba(239,68,68,0.7)"],
      borderRadius: 8,
      barPercentage: 0.6,
      categoryPercentage: 0.7
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1a1d2e",
        titleColor: "#edf2ff",
        bodyColor: "#8e9cc4",
        padding: 10,
        cornerRadius: 10,
        borderColor: "rgba(88,130,255,0.2)",
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#49587a", font: { size: 11 } },
        border: { display: false }
      },
      y: {
        beginAtZero: true,
        grid: { color: "rgba(88,130,255,0.06)" },
        ticks: { color: "#49587a", font: { size: 11 }, stepSize: 1 },
        border: { display: false }
      }
    },
  };

  const featureCards = [
    { icon: "📚", title: "My Classes", path: "/classes" },
    { icon: "➕", title: "Join Class", path: "/classes/join" },
    { icon: "📝", title: "Quizzes", path: "/quizzes" },
    { icon: "✨", title: "Generate Quiz", path: "/quizzes/generate" },
    { icon: "📓", title: "Notes", path: "/notes" },
    { icon: "✏️", title: "Create Note", path: "/notes/create" },
    { icon: "🃏", title: "Flashcards", path: "/flashcards" },
    { icon: "👥", title: "Study Groups", path: "/study-groups" },
    { icon: "🎥", title: "YT Summarizer", path: "/video-summarizer" },
    { icon: "🔖", title: "Bookmarks", path: "/bookmarks" },
    { icon: "🤖", title: "AI Chat", path: "/chat" },
    { icon: "⏱️", title: "Study Timer", path: "/timer" },
    { icon: "📈", title: "All Activities", path: "/activities" },
    { icon: "➕", title: "Add Activity", path: "/activities/add" },
  ];

  const statCards = [
    {
      icon: "⏰",
      label: "Total Study Hours",
      value: `${Math.floor(stats.totalStudyHours / 60)}h ${Math.round(stats.totalStudyHours % 60)}m`,
      trend: "This week",
      color: "db-ic-blue"
    },
    {
      icon: "📊",
      label: "Classes Enrolled",
      value: stats.classesCount || 0,
      trend: "Active",
      color: "db-ic-teal"
    },
    {
      icon: "🎯",
      label: "Activities",
      value: activities.length,
      trend: "Logged",
      color: "db-ic-vio"
    },
    {
      icon: "💡",
      label: "AI Suggestions",
      value: weakTopics.suggestions?.length || 0,
      trend: "Personalized",
      color: "db-ic-grn"
    },
  ];

  return (
    <div className="db-root">
      <div className="db-grid-bg" />
      <div className="db-orb db-orb-a" />
      <div className="db-orb db-orb-b" />
      <div className="db-orb db-orb-c" />

      <Navbar user={user} onLogout={handleLogout} />

      {toastMsg.message && (
        <div className={`db-toast db-toast-${toastMsg.type}`}>
          <span className="db-toast-icon">
            {toastMsg.type === "success" ? "✓" : toastMsg.type === "info" ? "ℹ" : "✕"}
          </span>
          {toastMsg.message}
        </div>
      )}

      <main className="db-main">
        <div className="db-inner">
          {/* Welcome Section */}
          <div className="db-welcome-row">
            <div>
              <div className="db-eyebrow">Dashboard</div>
              <h1 className="db-welcome-title">
                Welcome back, <span className="db-grad">{user?.name?.split(" ")[0] || "Student"}!</span>
              </h1>
              <p className="db-welcome-sub">Ready to continue your learning journey?</p>
            </div>
            <div className="db-welcome-actions">
              <Link to="/activities/add" className="db-btn-ghost">Add Activity</Link>
              <Link to="/quizzes/generate" className="db-btn-primary">
                Generate Quiz
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="db-stats-grid">
            {statCards.map((card, index) => (
              <div key={index} className="db-stat-card">
                <div className={`db-stat-icon ${card.color}`}>{card.icon}</div>
                <div className="db-stat-info">
                  <div className="db-stat-label">{card.label}</div>
                  <div className="db-stat-value">{card.value}</div>
                  <div className="db-stat-trend">{card.trend}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="db-charts-row">
            <div className="db-card db-chart-card" onClick={fetchStudyHistory} style={{ cursor: "pointer" }}>
              <div className="db-card-header">
                <h3 className="db-card-title">Weekly Study Hours</h3>
                <span className="db-card-badge">Click to expand</span>
              </div>
              <div className="db-chart-wrap">
                <Line data={lineData} options={chartOptions} />
              </div>
            </div>
            <div className="db-card db-chart-card">
              <div className="db-card-header">
                <h3 className="db-card-title">Difficulty Analysis</h3>
              </div>
              <div className="db-chart-wrap">
                <Bar data={barData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Quick Access Tools */}
          <div className="db-card db-full-card">
            <div className="db-card-header">
              <h3 className="db-card-title">Quick Access</h3>
              <span className="db-card-badge">{featureCards.length} tools</span>
            </div>
            <div className="db-feat-grid">
              {featureCards.map((tool, index) => (
                <Link to={tool.path} key={index} className="db-feat-item">
                  <div className="db-feat-emoji">{tool.icon}</div>
                  <div className="db-feat-label">{tool.title}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom Section */}
          <div className="db-bottom-row">
            <div className="db-card">
              <div className="db-card-header">
                <h3 className="db-card-title">💡 AI Suggestions</h3>
                <span className="db-card-badge">Personalized</span>
              </div>
              <div className="db-suggestions-list">
                {weakTopics.suggestions?.length > 0 ? (
                  weakTopics.suggestions.slice(0, 4).map((suggestion, index) => (
                    <div key={index} className="db-suggestion-item">
                      <div className="db-sug-dot" />
                      <span className="db-sug-text">{suggestion}</span>
                    </div>
                  ))
                ) : (
                  <div className="db-empty-state">
                    <div className="db-empty-icon">📭</div>
                    <p>Complete more activities for personalized suggestions!</p>
                    <Link to="/activities/add" className="db-btn-primary db-btn-sm">Add Activity</Link>
                  </div>
                )}
              </div>
            </div>

            <div className="db-card">
              <div className="db-card-header">
                <h3 className="db-card-title">📋 Recent Activities</h3>
                <Link to="/activities" className="db-view-all">View all →</Link>
              </div>
              {activities.length > 0 ? (
                <div className="db-activities-list">
                  {activities.map((activity) => (
                    <div key={activity._id} className="db-activity-row">
                      <div className={`db-act-dot db-act-${activity.difficulty}`} />
                      <div className="db-act-info">
                        <div className="db-act-title">{activity.subject} — {activity.topic}</div>
                        <div className="db-act-meta">
                          <span>{activity.durationMinutes} min</span>
                          <span>{new Date(activity.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className={`db-diff-badge db-diff-${activity.difficulty}`}>
                        {activity.difficulty}
                      </span>
                      {(activity.insights || []).length > 0 && (
                        <button
                          className="db-insight-btn"
                          onClick={() => {
                            setSelectedActivity(activity);
                            setShowModal(true);
                          }}
                        >
                          Insights
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="db-empty-state">
                  <div className="db-empty-icon">📭</div>
                  <p>No recent activities yet</p>
                  <Link to="/activities/add" className="db-btn-primary db-btn-sm">Add First Activity</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <ActivityInsightsModal
        show={showModal}
        onClose={() => setShowModal(false)}
        activity={selectedActivity}
      />

      {showHistoryModal && (
        <div className="db-modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="db-modal" onClick={(e) => e.stopPropagation()}>
            <div className="db-modal-head">
              <h4>📊 Complete Study History</h4>
              <button className="db-modal-close" onClick={() => setShowHistoryModal(false)}>✕</button>
            </div>
            <div className="db-modal-body">
              {historyLoading ? (
                <div className="db-modal-loading">Loading...</div>
              ) : studyHistory.length === 0 ? (
                <div className="db-modal-empty">No study activities yet. Start studying!</div>
              ) : (
                <>
                  <div className="db-history-table">
                    <div className="db-history-head">
                      <span>Date</span>
                      <span>Subject</span>
                      <span className="db-col-hide-sm">Topic</span>
                      <span>Duration</span>
                      <span className="db-col-hide-sm">Difficulty</span>
                    </div>
                    {studyHistory.map((activity, index) => (
                      <div key={index} className="db-history-row">
                        <span>{new Date(activity.createdAt).toLocaleDateString()}</span>
                        <span>{activity.subject}</span>
                        <span className="db-col-hide-sm">{activity.topic}</span>
                        <span>{activity.durationMinutes} min</span>
                        <span className="db-col-hide-sm">
                          <span className={`db-diff-badge db-diff-${activity.difficulty}`}>
                            {activity.difficulty}
                          </span>
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="db-history-total">
                    Total: <strong>
                      {Math.floor(studyHistory.reduce((sum, a) => sum + (a.durationMinutes || 0), 0) / 60)}h{" "}
                      {studyHistory.reduce((sum, a) => sum + (a.durationMinutes || 0), 0) % 60}m
                    </strong>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        *, *::before, *::after {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* KEY FIX: prevent horizontal overflow at root level */
        html, body {
          overflow-x: hidden;
          max-width: 100%;
        }

        :root {
          --bg: #0a0c12;
          --s1: #111318;
          --s2: #181b24;
          --acc: #5882ff;
          --acc2: #20e6d0;
          --vio: #9b7aff;
          --tx: #edf2ff;
          --mu: #8e9cc4;
          --fa: #49587a;
          --bd: rgba(88, 130, 255, 0.1);
          --bdh: rgba(88, 130, 255, 0.25);
          --fd: 'Syne', sans-serif;
          --fb: 'Inter', sans-serif;
        }

        body {
          font-family: var(--fb);
          background: var(--bg);
          color: var(--tx);
          -webkit-font-smoothing: antialiased;
        }

        .db-grad {
          background: linear-gradient(135deg, var(--acc), var(--acc2), var(--vio));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* KEY FIX: db-root must not overflow */
        .db-root {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          width: 100%;
        }

        .db-grid-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          background-image: 
            linear-gradient(rgba(88, 130, 255, 0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(88, 130, 255, 0.025) 1px, transparent 1px);
          background-size: 48px 48px;
          -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent);
          mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent);
        }

        .db-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          z-index: 0;
        }

        .db-orb-a {
          width: 600px;
          height: 350px;
          top: -120px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(88, 130, 255, 0.07);
          animation: dbOrb 12s ease-in-out infinite;
        }

        .db-orb-b {
          width: 250px;
          height: 250px;
          bottom: 5%;
          right: -60px;
          background: rgba(32, 230, 208, 0.04);
          animation: dbOrb2 10s ease-in-out infinite;
        }

        .db-orb-c {
          width: 200px;
          height: 200px;
          top: 40%;
          left: -60px;
          background: rgba(155, 122, 255, 0.04);
          animation: dbOrb2 14s 2s ease-in-out infinite;
        }

        @keyframes dbOrb {
          0%, 100% { transform: translateX(-50%) scale(1); }
          50% { transform: translateX(-50%) scale(1.06); }
        }

        @keyframes dbOrb2 {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .db-toast {
          position: fixed;
          top: 82px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 400;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 22px;
          border-radius: 40px;
          font-size: 13px;
          background: var(--s1);
          backdrop-filter: blur(12px);
          animation: dbToastIn 0.3s ease;
          white-space: nowrap;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          max-width: calc(100vw - 32px);
          white-space: normal;
          text-align: center;
        }

        .db-toast-success { border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; }
        .db-toast-error { border: 1px solid rgba(239, 68, 68, 0.4); color: #f87171; }
        .db-toast-info { border: 1px solid rgba(88, 130, 255, 0.4); color: var(--acc); }

        @keyframes dbToastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        .db-main {
          position: relative;
          z-index: 10;
          padding-top: 82px;
          padding-bottom: 3rem;
          /* KEY FIX */
          overflow-x: hidden;
          width: 100%;
        }

        .db-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          /* KEY FIX */
          width: 100%;
          min-width: 0;
        }

        /* Welcome Section */
        .db-welcome-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .db-eyebrow {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--acc);
          margin-bottom: 6px;
        }

        .db-welcome-title {
          font-family: var(--fd);
          font-size: clamp(1.4rem, 4vw, 2.2rem);
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.2;
          margin-bottom: 6px;
          /* KEY FIX: prevent long names from overflowing */
          word-break: break-word;
        }

        .db-welcome-sub {
          font-size: 14px;
          color: var(--mu);
        }

        .db-welcome-actions {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-shrink: 0;
          flex-wrap: wrap;
        }

        /* Buttons */
        .db-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          border-radius: 40px;
          background: linear-gradient(135deg, var(--acc), #3a61e0);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(88, 130, 255, 0.3);
          white-space: nowrap;
        }

        .db-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(88, 130, 255, 0.45);
        }

        .db-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          border-radius: 40px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: var(--mu);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .db-btn-ghost:hover {
          background: rgba(255, 255, 255, 0.04);
          color: var(--tx);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .db-btn-sm {
          padding: 7px 18px;
          font-size: 12px;
          margin-top: 12px;
        }

        /* Stats Grid */
        .db-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr)); /* KEY FIX: minmax(0,1fr) */
          gap: 1px;
          background: var(--bd);
          border: 1px solid var(--bd);
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 1.75rem;
          width: 100%; /* KEY FIX */
        }

        .db-stat-card {
          background: var(--s1);
          padding: 20px 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: background 0.2s;
          min-width: 0; /* KEY FIX */
        }

        .db-stat-card:hover {
          background: rgba(88, 130, 255, 0.06);
        }

        .db-stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          flex-shrink: 0;
        }

        .db-ic-blue { background: rgba(88, 130, 255, 0.12); border: 1px solid rgba(88, 130, 255, 0.2); }
        .db-ic-teal { background: rgba(32, 230, 208, 0.1); border: 1px solid rgba(32, 230, 208, 0.2); }
        .db-ic-vio { background: rgba(155, 122, 255, 0.1); border: 1px solid rgba(155, 122, 255, 0.2); }
        .db-ic-grn { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); }

        .db-stat-info {
          flex: 1;
          min-width: 0; /* KEY FIX */
          overflow: hidden;
        }

        .db-stat-label {
          font-size: 11px;
          color: var(--mu);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .db-stat-value {
          font-family: var(--fd);
          font-size: clamp(1.1rem, 2.5vw, 1.5rem); /* KEY FIX: clamp instead of fixed */
          font-weight: 800;
          letter-spacing: -0.02em;
          line-height: 1.2;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .db-stat-trend {
          font-size: 11px;
          color: var(--fa);
          margin-top: 4px;
        }

        /* Cards */
        .db-card {
          background: var(--s1);
          border: 1px solid var(--bd);
          border-radius: 20px;
          padding: 20px;
          backdrop-filter: blur(12px);
          transition: border-color 0.2s;
          min-width: 0; /* KEY FIX */
          width: 100%;
        }

        .db-card:hover {
          border-color: var(--bdh);
        }

        .db-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
          flex-wrap: wrap;
          gap: 8px;
          min-width: 0;
        }

        .db-card-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--tx);
          min-width: 0;
        }

        .db-card-badge {
          font-size: 11px;
          color: var(--mu);
          background: rgba(88, 130, 255, 0.08);
          border: 1px solid var(--bd);
          padding: 3px 10px;
          border-radius: 20px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* Charts */
        .db-charts-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr)); /* KEY FIX */
          gap: 20px;
          margin-bottom: 1.75rem;
          width: 100%;
        }

        .db-chart-wrap {
          height: 200px;
          position: relative;
          width: 100%; /* KEY FIX */
          min-width: 0;
        }

        /* Feature Grid */
        .db-full-card {
          margin-bottom: 1.75rem;
        }

        .db-feat-grid {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr)); /* KEY FIX */
          gap: 12px;
          width: 100%;
        }

        .db-feat-item {
          background: rgba(88, 130, 255, 0.04);
          border: 1px solid var(--bd);
          border-radius: 14px;
          padding: 16px 8px; /* KEY FIX: reduced horizontal padding */
          text-align: center;
          text-decoration: none;
          transition: all 0.2s;
          cursor: pointer;
          min-width: 0;
        }

        .db-feat-item:hover {
          border-color: var(--acc);
          background: rgba(88, 130, 255, 0.1);
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(88, 130, 255, 0.15);
        }

        .db-feat-emoji {
          font-size: 24px;
          margin-bottom: 8px;
        }

        .db-feat-label {
          font-size: 11px;
          font-weight: 500;
          color: var(--mu);
          line-height: 1.3;
          word-break: break-word;
        }

        .db-feat-item:hover .db-feat-label {
          color: var(--tx);
        }

        /* Bottom Row */
        .db-bottom-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr)); /* KEY FIX */
          gap: 20px;
          width: 100%;
        }

        /* Suggestions */
        .db-suggestions-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .db-suggestion-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          background: rgba(88, 130, 255, 0.04);
          border: 1px solid transparent;
          border-radius: 12px;
          transition: border-color 0.2s;
        }

        .db-suggestion-item:hover {
          border-color: var(--bdh);
        }

        .db-sug-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--acc);
          margin-top: 7px;
          flex-shrink: 0;
        }

        .db-sug-text {
          font-size: 13px;
          color: var(--mu);
          line-height: 1.5;
          word-break: break-word;
        }

        /* Activities */
        .db-activities-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .db-activity-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 12px;
          transition: background 0.2s;
          cursor: default;
          flex-wrap: wrap;
          min-width: 0;
        }

        .db-activity-row:hover {
          background: rgba(88, 130, 255, 0.05);
        }

        .db-act-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .db-act-easy { background: #10b981; }
        .db-act-medium { background: #f59e0b; }
        .db-act-hard { background: #ef4444; }

        .db-act-info {
          flex: 1;
          min-width: 0;
        }

        .db-act-title {
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .db-act-meta {
          font-size: 11px;
          color: var(--fa);
          display: flex;
          gap: 10px;
          margin-top: 2px;
          flex-wrap: wrap;
        }

        .db-diff-badge {
          font-size: 11px;
          font-weight: 500;
          padding: 3px 10px;
          border-radius: 20px;
          flex-shrink: 0;
          white-space: nowrap;
        }

        .db-diff-easy { background: rgba(16, 185, 129, 0.15); color: #34d399; }
        .db-diff-medium { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
        .db-diff-hard { background: rgba(239, 68, 68, 0.15); color: #f87171; }

        .db-insight-btn {
          background: transparent;
          border: 1px solid var(--bd);
          color: var(--acc);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .db-insight-btn:hover {
          background: rgba(88, 130, 255, 0.1);
          border-color: var(--acc);
        }

        .db-view-all {
          font-size: 12px;
          color: var(--acc);
          text-decoration: none;
          flex-shrink: 0;
        }

        .db-view-all:hover {
          text-decoration: underline;
        }

        /* Empty State */
        .db-empty-state {
          text-align: center;
          padding: 2rem 1rem;
          color: var(--mu);
          font-size: 13px;
        }

        .db-empty-icon {
          font-size: 2.5rem;
          margin-bottom: 10px;
          opacity: 0.5;
        }

        /* Modal */
        .db-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 500;
          padding: 1rem;
        }

        .db-modal {
          background: var(--s1);
          border: 1px solid var(--bdh);
          border-radius: 24px;
          width: 100%;
          max-width: 900px;
          max-height: 85vh;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.5);
        }

        .db-modal-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 18px 24px;
          background: rgba(88, 130, 255, 0.06);
          border-bottom: 1px solid var(--bd);
        }

        .db-modal-head h4 {
          font-size: 15px;
          font-weight: 700;
        }

        .db-modal-close {
          background: none;
          border: none;
          color: var(--mu);
          font-size: 18px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .db-modal-close:hover {
          color: var(--tx);
          background: rgba(255, 255, 255, 0.06);
        }

        .db-modal-body {
          padding: 20px 24px;
          max-height: calc(85vh - 70px);
          overflow-y: auto;
          overflow-x: hidden; /* KEY FIX */
        }

        .db-modal-loading,
        .db-modal-empty {
          text-align: center;
          padding: 3rem;
          color: var(--mu);
        }

        /* History Table */
        .db-history-table {
          width: 100%;
          overflow-x: auto; /* KEY FIX: scroll on table itself */
        }

        .db-history-head,
        .db-history-row {
          display: grid;
          grid-template-columns: 95px 120px 1fr 80px 90px;
          gap: 10px;
          padding: 10px 8px;
          font-size: 12px;
          min-width: 0;
        }

        .db-history-head {
          font-weight: 600;
          color: var(--mu);
          border-bottom: 1px solid var(--bd);
          margin-bottom: 8px;
        }

        .db-history-row {
          border-bottom: 1px solid rgba(255, 255, 255, 0.03);
          transition: background 0.15s;
        }

        .db-history-row:hover {
          background: rgba(88, 130, 255, 0.04);
          border-radius: 8px;
        }

        .db-history-row span,
        .db-history-head span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          min-width: 0;
        }

        .db-history-total {
          margin-top: 20px;
          padding: 12px 16px;
          background: rgba(88, 130, 255, 0.06);
          border-radius: 12px;
          text-align: center;
          font-size: 13px;
          color: var(--mu);
        }

        .db-history-total strong {
          color: var(--tx);
        }

        /* ========== RESPONSIVE ========== */

        @media (max-width: 1200px) {
          .db-feat-grid {
            grid-template-columns: repeat(5, minmax(0, 1fr));
          }
        }

        @media (max-width: 992px) {
          .db-inner {
            padding: 1.5rem;
          }
          .db-feat-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 10px;
          }
        }

        @media (max-width: 768px) {
          .db-inner {
            padding: 1rem;
          }
          .db-welcome-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          .db-welcome-actions {
            width: 100%;
          }
          .db-btn-primary,
          .db-btn-ghost {
            width: 100%;
            justify-content: center;
          }
          /* KEY FIX: 2-column stats on tablet */
          .db-stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            border-radius: 16px;
          }
          .db-stat-value {
            font-size: 1.2rem;
          }
          /* Charts stack on mobile */
          .db-charts-row {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .db-chart-wrap {
            height: 180px;
          }
          /* Feature grid 3 cols on tablet */
          .db-feat-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 8px;
          }
          .db-feat-item {
            padding: 12px 6px;
          }
          .db-feat-emoji {
            font-size: 22px;
          }
          /* Bottom row stacks */
          .db-bottom-row {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          /* History table simplified */
          .db-history-head,
          .db-history-row {
            grid-template-columns: 85px 1fr 70px;
          }
          .db-col-hide-sm {
            display: none;
          }
        }

        @media (max-width: 576px) {
          .db-inner {
            padding: 0.75rem;
          }
          /* Stats go 1 col on small mobile */
          .db-stats-grid {
            grid-template-columns: 1fr;
          }
          .db-stat-card {
            flex-direction: row;
            gap: 12px;
          }
          /* Feature grid 2 cols on small mobile */
          .db-feat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px;
          }
          .db-feat-item {
            padding: 14px 8px;
          }
          .db-feat-emoji {
            font-size: 22px;
          }
          .db-feat-label {
            font-size: 11px;
          }
          .db-card {
            padding: 14px;
          }
          .db-modal-body {
            padding: 14px;
          }
          .db-modal-head {
            padding: 12px 16px;
          }
          /* History table even simpler */
          .db-history-head,
          .db-history-row {
            grid-template-columns: 75px 1fr 60px;
            font-size: 11px;
            gap: 6px;
          }
        }

        @media (max-width: 400px) {
          .db-feat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 6px;
          }
          .db-stat-value {
            font-size: 1rem;
          }
          .db-card-title {
            font-size: 13px;
          }
          .db-card-badge {
            font-size: 10px;
            padding: 2px 8px;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .db-card,
        .db-stat-card,
        .db-feat-item {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}