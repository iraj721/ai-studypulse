// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import { Line, Bar } from "react-chartjs-2";
import Spinner from "../../components/Spinner";
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
  Filler,
} from "chart.js";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import ActivityInsightsModal from "../../components/ActivityInsightsModal";
import ToastComponent from "../../components/Toast";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({
    totalStudyHours: 0,
    completionRate: 0,
    weeklyGraph: Array(7).fill(0),
    difficultyAnalysis: { easy: 0, medium: 0, hard: 0 },
    lastNote: null,
    lastClass: null,
    classesCount: 0,
  });
  const [weakTopics, setWeakTopics] = useState({
    weakTopics: [],
    suggestions: [],
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [toastMsg, setToastMsg] = useState({ message: "", type: "success" });
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [studyHistory, setStudyHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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
      reconnectionAttempts: 5,
    });
    socket.emit("joinUserRoom", user._id);
    socket.on("newNotification", (data) => {
      setNotifications((prev) => [data, ...prev]);
      toast.info(data.message);
      setToastMsg({ message: data.message, type: "info" });
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
    let statsData = {};
    let classData = {};

    try {
      const res = await api.get("/activities/stats");
      statsData = res.data;
    } catch (err) {
      console.error("Activities stats fetch error:", err);
      statsData = {
        totalStudyHours: 0,
        completionRate: 0,
        weeklyGraph: Array(7).fill(0),
        difficultyAnalysis: { easy: 0, medium: 0, hard: 0 },
        lastNote: null,
        lastClass: null,
      };
    }

    try {
      const resClass = await api.get("/student/classes/count");
      classData = resClass.data;
    } catch (err) {
      console.error("Classes count fetch error:", err);
      classData = { count: 0, lastClass: null };
    }

    setStats({
      totalStudyHours: statsData.totalStudyHours || 0,
      completionRate: statsData.completionRate || 0,
      weeklyGraph:
        statsData.weeklyGraph?.length === 7
          ? statsData.weeklyGraph
          : Array(7).fill(0),
      difficultyAnalysis: statsData.difficultyAnalysis || {
        easy: 0,
        medium: 0,
        hard: 0,
      },
      lastNote: statsData.lastNote || null,
      lastClass: classData.lastClass || statsData.lastClass || null,
      classesCount: classData.count || 0,
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
    } catch (err) {
      console.error(err);
      setToastMsg({ message: "Failed to load study history", type: "error" });
    } finally {
      setHistoryLoading(false);
    }
  };

  const generateQuiz = async (topic) => {
    if (!topic) return;
    setGenerating(true);
    try {
      const res = await api.post("/quizzes/generate", { topic });
      navigate(`/quizzes/${res.data._id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate quiz");
      setToastMsg({ message: "Failed to generate quiz", type: "error" });
    } finally {
      setGenerating(false);
    }
  };

  const openInsightsModal = (activity) => {
    setSelectedActivity(activity);
    setShowModal(true);
  };

  if (loading) return <Spinner message="Loading dashboard..." />;

  const lineData = {
    labels: ["-6d", "-5d", "-4d", "-3d", "-2d", "-1d", "Today"],
    datasets: [
      {
        data:
          stats?.weeklyGraph && Array.isArray(stats.weeklyGraph)
            ? stats.weeklyGraph
            : Array(7).fill(0),
        fill: true,
        backgroundColor: "rgba(13,110,253,0.15)",
        borderColor: "#0d6efd",
        tension: 0.4,
      },
    ],
  };

  const barData = {
    labels: ["Easy", "Medium", "Hard"],
    datasets: [
      {
        data: [
          stats?.difficultyAnalysis?.easy || 0,
          stats?.difficultyAnalysis?.medium || 0,
          stats?.difficultyAnalysis?.hard || 0,
        ],
        backgroundColor: ["#22c55e", "#facc15", "#ef4444"],
        borderRadius: 8,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { grid: { display: false } },
      y: { beginAtZero: true, grid: { color: "#e5e7eb" } },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, grid: { color: "#e5e7eb" } } },
  };

  return (
    <div className="dashboard-page min-vh-100">
      <ToastComponent
        message={toastMsg.message}
        type={toastMsg.type}
        onClose={() => setToastMsg({ message: "", type: "success" })}
      />

      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 text-white">
              <h1 className="fw-bold display-6">Study Smarter with AI 🚀</h1>
              <p className="lead">
                Notes, quizzes, tracking & AI assistant in one dashboard
              </p>
              <Link to="/activities/add" className="btn btn-light btn-lg mt-3">
                Start Studying
              </Link>
            </div>
            <div className="col-md-6 text-center">
              <img
                src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                className="img-fluid hero-img"
                alt="study"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ADD ACTIVITY CARD */}
      <div className="container mb-4">
        <div className="card add-activity-card shadow-sm p-4 hover-card bg-white text-center">
          <h4 className="text-success mb-2">📚 Add a New Activity</h4>
          <p className="text-muted mb-3">
            Add a new study activity quickly and keep track of your progress
          </p>
          <Link to="/activities/add" className="btn btn-success btn-lg">
            Add Activity
          </Link>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="container mt-4">
        {/* SUMMARY CARDS GRID */}
        <div className="summary-cards-grid mb-4">
          {/* Total Study Hours */}
          <div className="card summary-card shadow-sm border-0 text-center hover-card bg-white">
            <div className="fs-3 mb-2">⏰</div>
            <h6>Total Study Hours</h6>
            {(() => {
              const hours = Math.floor(stats.totalStudyHours / 60);
              const minutes = Math.round(stats.totalStudyHours % 60);
              return (
                <h3>
                  {hours}h {minutes}min
                </h3>
              );
            })()}
            <p className="text-muted small mt-2">
              You studied {stats?.totalStudyHours || 0} minutes this week
            </p>
          </div>

          {/* AI Assistant */}
          <div className="card summary-card shadow-sm border-0 text-center hover-card bg-white">
            <div className="fs-3 mb-2">🤖</div>
            <h6>AI Assistant</h6>
            <p className="text-muted small">
              Chat with your AI assistant in real-time.
            </p>
            <Link to="/chat" className="btn btn-outline-success w-100 mt-2">
              Open AI Assistant
            </Link>
          </div>

          {/* Quizzes */}
          <div className="card summary-card shadow-sm border-0 text-center hover-card bg-white">
            <div className="fs-3 mb-2">📝</div>
            <h6>Quizzes</h6>
            <p className="text-muted small mb-2">
              Create and practice with AI-powered quizzes
            </p>
            <div className="d-grid gap-2 w-100">
              <Link
                to="/quizzes/generate"
                className="btn btn-sm btn-success w-100"
              >
                Generate Quiz
              </Link>
              <Link
                to="/quizzes"
                className="btn btn-sm btn-outline-primary w-100"
              >
                View My Quizzes
              </Link>
            </div>
          </div>

          {/* Notes */}
          <div className="card summary-card shadow-sm border-0 text-center hover-card bg-white">
            <div className="fs-3 mb-2">📓</div>
            <h6>Notes</h6>
            <p className="text-muted small mb-2">
              Create and manage AI-generated notes
            </p>
            <div className="d-grid gap-2 w-100">
              <Link to="/notes" className="btn btn-sm btn-success w-100">
                View Notes
              </Link>
              <Link
                to="/notes/create"
                className="btn btn-sm btn-outline-primary w-100"
              >
                Create Notes
              </Link>
            </div>
          </div>

          {/* My Classes */}
          <div className="card summary-card shadow-sm border-0 text-center hover-card bg-white">
            <div className="fs-3 mb-2">🎓</div>
            <h6>My Classes</h6>
            <p className="text-muted small mb-2">
              View all your enrolled classes
            </p>
            <Link
              to="/classes"
              className="btn btn-sm btn-outline-primary mt-2 w-100"
            >
              View Classes
            </Link>
          </div>

          {/* Join Class */}
          <div className="card summary-card shadow-sm border-0 text-center hover-card bg-white">
            <div className="fs-3 mb-2">➕</div>
            <h6>Join Class</h6>
            <p className="text-muted small mb-2">
              Enter a code to join a new class
            </p>
            <Link
              to="/classes/join"
              className="btn btn-sm btn-outline-success mt-2 w-100"
            >
              Join Class
            </Link>
          </div>

          {/* Study Timer */}
          <div className="card summary-card shadow-sm border-0 text-center hover-card bg-white">
            <div className="fs-3 mb-2">⏱️</div>
            <h6>Study Timer</h6>
            <p className="text-muted small mb-2">
              Pomodoro timer to boost productivity
            </p>
            <Link
              to="/timer"
              className="btn btn-sm btn-outline-primary mt-2 w-100"
            >
              Open Timer
            </Link>
          </div>

          {/* Flashcards */}
          <div className="card summary-card shadow-sm border-0 text-center hover-card bg-white">
            <div className="fs-3 mb-2">🃏</div>
            <h6>Flashcards</h6>
            <p className="text-muted small mb-2">
              Generate AI flashcards from your notes
            </p>
            <Link
              to="/flashcards"
              className="btn btn-sm btn-outline-primary mt-2 w-100"
            >
              View Flashcards
            </Link>
          </div>

          {/* Study Groups */}
          <div className="card summary-card shadow-sm border-0 text-center hover-card bg-white">
            <div className="fs-3 mb-2">👥</div>
            <h6>Study Groups</h6>
            <p className="text-muted small mb-2">
              Create or join groups to collaborate
            </p>
            <Link
              to="/study-groups"
              className="btn btn-sm btn-outline-primary mt-2 w-100"
            >
              View Groups
            </Link>
          </div>

          {/* YouTube Summarizer */}
          <div className="card summary-card shadow-sm border-0 text-center hover-card bg-white">
            <div className="fs-3 mb-2">🎥</div>
            <h6>YouTube Summarizer</h6>
            <p className="text-muted small mb-2">Get AI notes from any video</p>
            <Link
              to="/video-summarizer"
              className="btn btn-sm btn-outline-primary mt-2 w-100"
            >
              Summarize Video
            </Link>
          </div>

          {/* Bookmarks */}
          <div className="card summary-card shadow-sm border-0 text-center hover-card bg-white">
            <div className="fs-3 mb-2">🔖</div>
            <h6>Bookmarks</h6>
            <p className="text-muted small mb-2">
              Save important notes and quizzes
            </p>
            <Link
              to="/bookmarks"
              className="btn btn-sm btn-outline-primary mt-2 w-100"
            >
              View Bookmarks
            </Link>
          </div>

          {/* AI Suggestions Card */}
          <div className="card summary-card shadow-sm border-0 text-center hover-card bg-white">
            <div className="fs-3 mb-2">💡</div>
            <h6>AI Suggestions</h6>
            <p className="text-muted small mb-2">
              Personalized study recommendations
            </p>
            <div className="mt-2">
              {weakTopics.suggestions?.length > 0 ? (
                <div className="small text-start">
                  {weakTopics.suggestions.slice(0, 2).map((s, i) => (
                    <div key={i} className="mb-1">
                      • {s.substring(0, 40)}...
                    </div>
                  ))}
                </div>
              ) : (
                <span className="text-muted small">No suggestions yet</span>
              )}
            </div>
            <Link
              to="/quizzes/generate"
              className="btn btn-sm btn-outline-primary mt-2 w-100"
            >
              View Suggestions
            </Link>
          </div>
        </div>

        {/* CHARTS & RECENT ACTIVITIES */}
        <div className="row g-3">
          <div className="col-md-8">
            {/* Weekly Study Chart */}
            <div
              className="card shadow-sm mb-3 p-3 hover-card bg-white"
              style={{ cursor: "pointer" }}
              onClick={fetchStudyHistory}
            >
              <h5>Weekly Study (Hours) - Click to view all</h5>
              <div className="chart-wrapper">
                <Line data={lineData} options={lineOptions} />
              </div>
            </div>

            {/* Difficulty Analysis Chart */}
            <div className="card shadow-sm mb-3 p-3 hover-card bg-white">
              <h5>Difficulty Analysis</h5>
              <div className="chart-wrapper">
                <Bar data={barData} options={barOptions} />
              </div>
            </div>

            {/* Recent Activities - Fully Responsive */}
            <div className="card shadow-sm mb-3 p-3 hover-card bg-white recent-activities-card">
              <h5 className="section-title">📋 Recent Activities</h5>

              {activities.length > 0 ? (
                <>
                  <div className="table-responsive">
                    <table className="activities-table">
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Topic</th>
                          <th>Duration</th>
                          <th>Difficulty</th>
                          <th>Insights</th>
                          <th>When</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activities.map((a) => (
                          <tr key={a._id}>
                            <td data-label="Subject">
                              <strong>{a.subject}</strong>
                            </td>
                            <td data-label="Topic">{a.topic}</td>
                            <td data-label="Duration">
                              <span className="fw-medium">
                                {a.durationMinutes} min
                              </span>
                            </td>
                            <td data-label="Difficulty">
                              <span
                                className={`difficulty-badge ${a.difficulty}`}
                              >
                                {a.difficulty === "easy" && "🟢 Easy"}
                                {a.difficulty === "medium" && "🟡 Medium"}
                                {a.difficulty === "hard" && "🔴 Hard"}
                              </span>
                            </td>
                            <td data-label="Insights">
                              {(a.insights || []).length > 0 ? (
                                <button
                                  className="insight-btn"
                                  onClick={() => openInsightsModal(a)}
                                >
                                  View Insights
                                </button>
                              ) : (
                                <span className="text-muted">—</span>
                              )}
                            </td>
                            <td data-label="When">
                              <span className="text-muted small">
                                {new Date(a.createdAt).toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {activities.length > 0 && (
                    <div className="text-center mt-3">
                      <Link to="/activities" className="view-all-btn">
                        View All Activities →
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <div className="empty-activities">
                  <div className="empty-icon">📭</div>
                  <h6>No Recent Activities</h6>
                  <p>Start your study journey by adding your first activity!</p>
                  <Link to="/activities/add" className="btn btn-sm btn-primary">
                    + Add Activity
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ActivityInsightsModal
        show={showModal}
        onClose={() => setShowModal(false)}
        activity={selectedActivity}
      />

      {/* Study History Modal */}
      {showHistoryModal && (
        <div
          className="history-modal-overlay"
          onClick={() => setShowHistoryModal(false)}
        >
          <div
            className="history-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="history-modal-header">
              <h4>📊 Complete Study History</h4>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="history-modal-close"
              >
                ×
              </button>
            </div>
            <div className="history-modal-body">
              {historyLoading ? (
                <div className="text-center py-4">Loading...</div>
              ) : studyHistory.length === 0 ? (
                <div className="text-center py-4">
                  No study activities yet. Start studying!
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Subject</th>
                          <th>Topic</th>
                          <th>Duration</th>
                          <th>Difficulty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studyHistory.map((activity, idx) => (
                          <tr key={idx}>
                            <td>
                              {new Date(
                                activity.createdAt,
                              ).toLocaleDateString()}
                            </td>
                            <td>{activity.subject}</td>
                            <td>{activity.topic}</td>
                            <td>{activity.durationMinutes} min</td>
                            <td>
                              <span
                                className={`badge ${activity.difficulty === "easy" ? "bg-success" : activity.difficulty === "medium" ? "bg-warning" : "bg-danger"}`}
                              >
                                {activity.difficulty}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="history-summary mt-3">
                    <strong>Total Study Time: </strong>
                    {Math.floor(
                      studyHistory.reduce(
                        (sum, a) => sum + (a.durationMinutes || 0),
                        0,
                      ) / 60,
                    )}{" "}
                    hours{" "}
                    {studyHistory.reduce(
                      (sum, a) => sum + (a.durationMinutes || 0),
                      0,
                    ) % 60}{" "}
                    minutes
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STYLES */}
      <style>{`
        .dashboard-page { background-color: #5a77a3ff; }
        .hero-section {
          background: linear-gradient(180deg, #080e18ff 0%, #122138ff 25%, #1e3652ff 50%, #28507eff 75%, #5a77a3ff 100%);
          min-height: 85vh;
          display: flex;
          align-items: center;
          padding: 0 60px;
          margin-bottom: 40px;
        }
        .hero-img { max-height: 350px; }
        .add-activity-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          cursor: pointer;
          background: linear-gradient(145deg, #ebf1f4ff, rgb(219, 234, 247));
        }
        .add-activity-card:hover { transform: translateY(-5px) scale(1.02); box-shadow: 0 15px 35px rgba(0,0,0,0.15); }
        
        .summary-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        .summary-card {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-radius: 14px;
          padding: 20px;
          min-height: 200px;
          transition: transform 0.2s ease;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          background: linear-gradient(145deg, #ebf1f4ff, rgb(219, 234, 247));
        }
        .summary-card:hover { transform: translateY(-5px); box-shadow: 0 20px 40px rgba(0,0,0,0.12); }
        .summary-card h6 { font-weight: 600; margin-bottom: 5px; }
        .summary-card h3 { font-weight: 700; margin: 0; font-size: 1.5rem; }
        .summary-card .btn { font-size: 0.75rem; margin-top: auto; }
        
        .chart-wrapper { width: 100%; height: 350px; }
        .section-title { color: #1e3a8a; font-weight: 700; }
        
        .empty-activities, .empty-suggestions {
          text-align: center;
          padding: 40px 20px;
          background: #f8f9fa;
          border-radius: 16px;
          margin: 10px 0;
        }
        .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
        
        .history-modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1100;
        }
        .history-modal-content {
          background: white; border-radius: 20px; width: 90%; max-width: 800px; max-height: 80vh; overflow: hidden;
          animation: modalFadeIn 0.3s ease;
        }
        @keyframes modalFadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .history-modal-header {
          display: flex; justify-content: space-between; align-items: center; padding: 16px 20px;
          background: linear-gradient(135deg, #4f46e5, #6366f1); color: white;
        }
        .history-modal-close { background: none; border: none; font-size: 24px; cursor: pointer; color: white; }
        .history-modal-body { padding: 20px; max-height: 60vh; overflow-y: auto; }
        .history-summary { padding: 12px; background: #f3f4f6; border-radius: 8px; text-align: center; }
        
        /* Recent Activities Table - Fully Responsive */
        .recent-activities-card {
          overflow-x: auto;
        }
        .activities-table {
          width: 100%;
          border-collapse: collapse;
        }
        .activities-table thead tr {
          background: #f8fafc;
          border-bottom: 2px solid #e2e8f0;
        }
        .activities-table th {
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          color: #1e293b;
          font-size: 13px;
        }
        .activities-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #e2e8f0;
          vertical-align: middle;
        }
        .difficulty-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 500;
        }
        .difficulty-badge.easy {
          background: #dcfce7;
          color: #166534;
        }
        .difficulty-badge.medium {
          background: #fef3c7;
          color: #92400e;
        }
        .difficulty-badge.hard {
          background: #fee2e2;
          color: #991b1b;
        }
        .insight-btn {
          background: none;
          border: 1px solid #3b82f6;
          color: #3b82f6;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .insight-btn:hover {
          background: #3b82f6;
          color: white;
        }
        .view-all-btn {
          display: inline-block;
          margin-top: 16px;
          color: #3b82f6;
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
        }
        .view-all-btn:hover {
          text-decoration: underline;
        }
        
        /* Mobile View for Activities Table */
        @media (max-width: 768px) {
          .activities-table thead {
            display: none;
          }
          .activities-table tbody tr {
            display: block;
            margin-bottom: 16px;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 12px;
            background: white;
          }
          .activities-table td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border: none;
            gap: 10px;
          }
          .activities-table td::before {
            content: attr(data-label);
            font-weight: 600;
            color: #64748b;
            font-size: 12px;
            min-width: 90px;
          }
          .difficulty-badge {
            display: inline-block;
          }
        }
        
        /* Small Mobile */
        @media (max-width: 480px) {
          .activities-table td {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
          .activities-table td::before {
            margin-bottom: 4px;
          }
        }
        
        /* Responsive Breakpoints */
        @media (max-width: 992px) {
          .hero-section { min-height: 75vh; padding: 0 30px; text-align: center; }
          .hero-img { max-height: 260px; margin-top: 20px; }
          .summary-cards-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .hero-section { min-height: 70vh; padding: 0 20px; }
          .hero-section h1 { font-size: 1.8rem; }
          .summary-cards-grid { grid-template-columns: 1fr; }
          .chart-wrapper { height: 250px; }
        }
        @media (max-width: 576px) {
          .hero-section { min-height: 65vh; padding: 0 15px; }
          .hero-section h1 { font-size: 1.6rem; }
          .hero-img { max-height: 180px; }
          .summary-card { padding: 12px; min-height: auto; }
          .summary-card h3 { font-size: 1.2rem; }
          .chart-wrapper { height: 200px; }
        }
        
        /* Insights Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          backdrop-filter: blur(4px);
        }
        .insights-modal {
          background: white;
          border-radius: 24px;
          width: 90%;
          max-width: 550px;
          max-height: 80vh;
          overflow: hidden;
          animation: modalSlideIn 0.3s ease;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
        }
        @keyframes modalSlideIn {
          from { opacity: 0; transform: scale(0.95) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .insights-modal-header {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          padding: 20px 24px;
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .insights-modal-header h3 { margin: 0; font-size: 1.35rem; font-weight: 600; }
        .insights-modal-close {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          font-size: 24px;
          cursor: pointer;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .insights-modal-close:hover { background: rgba(255,255,255,0.3); transform: scale(1.1); }
        .insights-modal-body { padding: 24px; max-height: 60vh; overflow-y: auto; }
        .activity-info-card {
          background: #f8fafc;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 20px;
          border-left: 4px solid #4f46e5;
        }
        .activity-info-title {
          font-size: 14px;
          font-weight: 600;
          color: #4f46e5;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 12px;
        }
        .activity-info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .activity-info-item {
          text-align: center;
          padding: 8px;
          background: white;
          border-radius: 12px;
        }
        .activity-info-label { font-size: 11px; color: #64748b; margin-bottom: 4px; }
        .activity-info-value { font-size: 16px; font-weight: 700; color: #1e293b; }
        .insights-list { display: flex; flex-direction: column; gap: 12px; }
        .insight-item {
          background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%);
          border-radius: 14px;
          padding: 16px;
          border-left: 4px solid #f59e0b;
          transition: all 0.2s;
        }
        .insight-item:hover { transform: translateX(4px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .insight-bullet { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; }
        .bullet-point { color: #f59e0b; font-weight: bold; font-size: 16px; }
        .bullet-text { flex: 1; color: #92400e; line-height: 1.5; font-size: 14px; }
        .insights-empty { text-align: center; padding: 40px 20px; }
        .insights-empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
        .insights-modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: flex-end;
          background: #f8fafc;
        }
        .insights-modal-footer .btn-close-modal {
          background: #e2e8f0;
          border: none;
          padding: 8px 20px;
          border-radius: 40px;
          font-size: 14px;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s;
        }
        .insights-modal-footer .btn-close-modal:hover { background: #cbd5e1; }
        .insights-modal-body::-webkit-scrollbar { width: 6px; }
        .insights-modal-body::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .insights-modal-body::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        @media (max-width: 640px) {
          .activity-info-grid { grid-template-columns: 1fr; gap: 8px; }
          .insights-modal { width: 95%; }
          .insights-modal-header h3 { font-size: 1.1rem; }
        }
      `}</style>
    </div>
  );
}
