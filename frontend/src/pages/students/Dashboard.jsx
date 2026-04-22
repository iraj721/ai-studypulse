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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
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
    const socket = io("http://localhost:5000");
    socket.emit("joinUserRoom", user._id);
    socket.on("newNotification", (data) => {
      setNotifications((prev) => [data, ...prev]);
      toast.info(data.message);
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
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
        data: stats?.weeklyGraph || [],
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
          stats?.difficultyAnalysis.easy,
          stats?.difficultyAnalysis.medium,
          stats?.difficultyAnalysis.hard,
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
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#e5e7eb" },
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#e5e7eb" },
      },
    },
  };

  return (
    <div className="dashboard-page min-vh-100">
      {/* HERO */}
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

      {/* CONTENT */}
      <div className="container mt-4">
        {/* Summary Cards */}
        <div className="summary-cards-grid mb-4">
          <div className="card summary-card shadow-sm border-0 text-center hover-card bg-white">
            <div className="fs-3 mb-2">⏰</div>
            <h6>Total Study Hours</h6>
            {stats &&
              (() => {
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

          <div className="card summary-card shadow-sm border-0 text-center hover-card bg-white">
            <div className="fs-3 mb-2">🤖</div>
            <h6>AI Assistant</h6>
            <p className="text-muted small">
              Chat with your AI assistant in real-time. Ask questions, get
              explanations & study help.
            </p>
            <Link to="/chat" className="btn btn-outline-success w-100 mt-2">
              Open AI Assistant Chat
            </Link>
          </div>

          <div className="card summary-card shadow-sm border-0 text-center hover-card bg-white">
            <div className="fs-3 mb-2">📝</div>
            <h6>Quizes</h6>
            <p className="text-muted small mb-2">
              Create a quiz for any topic you want and View your previous
              quizzes
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

          <div className="card summary-card shadow-sm border-0 text-center hover-card bg-white">
            <div className="fs-3 mb-2">📓</div>
            <h6>Notes</h6>
            <p className="text-muted small mb-2">
              Create notes for any topic you want and View your previous notes
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
          {/* My Classes Card */}
          <div className="card summary-card shadow-sm border-0 text-center hover-card bg-white">
            <div className="fs-3 mb-2">🎓</div>
            <h6>My Classes</h6>
            <p className="text-muted small mb-2">
              View all your classes here and stay up-to-date with announcements,
              assignments, and materials.
            </p>
            <Link
              to="/classes"
              className="btn btn-sm btn-outline-primary mt-2 w-100"
            >
              View Classes
            </Link>
          </div>

          {/* Join New Class Card */}
          <div className="card summary-card shadow-sm border-0 text-center hover-card bg-white">
            <div className="fs-3 mb-2">➕</div>
            <h6>Join New Class</h6>
            <p className="text-muted small mb-2">
              Enter a class code to join new courses and stay up-to-date with
              lessons.
            </p>
            <Link
              to="/classes/join"
              className="btn btn-sm btn-outline-success mt-2 w-100"
            >
              Join Class
            </Link>
          </div>
        </div>

        {/* Charts & Activities */}
        <div className="row g-3">
          <div className="col-md-8">
            <div className="card shadow-sm mb-3 p-3 hover-card bg-white">
              <h5>Weekly Study (Hours)</h5>
              <div className="chart-wrapper">
                <Line data={lineData} options={lineOptions} />
              </div>
            </div>

            <div className="card shadow-sm mb-3 p-3 hover-card bg-white">
              <h5>Difficulty Analysis</h5>
              <div className="chart-wrapper">
                <Bar data={barData} options={barOptions} />
              </div>
            </div>

            <div className="card shadow-sm mb-3 p-3 hover-card bg-white">
              <h5 className="section-title">Recent Activities</h5>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
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
                    {activities.length ? (
                      activities.map((a) => (
                        <tr key={a._id}>
                          <td data-label="Subject">{a.subject}</td>
                          <td data-label="Topic">{a.topic}</td>
                          <td data-label="Duration">{a.durationMinutes} min</td>
                          <td data-label="Difficulty">
                            {a.difficulty === "easy"
                              ? "🟢 Easy"
                              : a.difficulty === "medium"
                              ? "🟡 Medium"
                              : "🔴 Hard"}
                          </td>
                          <td data-label="Insights">
                            {(a.insights || []).length > 0 ? (
                              <button
                                className="btn btn-sm btn-outline-info"
                                onClick={() => openInsightsModal(a)}
                              >
                                View
                              </button>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td data-label="When">
                            {new Date(a.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center text-muted">
                          No recent activities
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <Link
                  to="/activities"
                  className="btn btn-sm btn-outline-primary mt-2"
                >
                  View All Activities
                </Link>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="col-md-4">
            <div className="card summary-card shadow-sm hover-card bg-white p-3">
              <h5 className="text-success mb-3">Suggestions</h5>
              <ul className="list-unstyled">
                {weakTopics.suggestions?.length ? (
                  weakTopics.suggestions.map((s, i) => (
                    <li
                      key={i}
                      className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded"
                    >
                      <span>• {s}</span>
                      <button
                        className="btn btn-sm btn-outline-primary w-100 w-md-auto"
                        onClick={() =>
                          generateQuiz(weakTopics.weakTopics[i] || s, 5)
                        }
                      >
                        Generate Quiz
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="text-muted">No suggestions yet</li>
                )}
              </ul>

              <hr />
            </div>
          </div>
        </div>
      </div>

      <ActivityInsightsModal
        show={showModal}
        onClose={() => setShowModal(false)}
        activity={selectedActivity}
      />

      <style>{`
      .dashboard-page {
  background-color: #5a77a3ff;
}
.text-muted {
  color: #6b7280 !important;
}
  .hero-section {
  background: linear-gradient(
    180deg,
    #080e18ff 0%,
    #122138ff 25%,
    #1e3652ff 50%,
    #28507eff 75%,
    #5a77a3ff 100%
  );
  min-height: 85vh;
  display: flex;
  align-items: center;
  padding: 0 60px;
  margin-bottom: 40px;
}

.hero-section .container {
  width: 100%;
}

.hero-img {
  max-height: 350px;
}

/* ============Actvity card============= */

.add-activity-card {
  transition: transform 0.25s ease, box-shadow 0.25s ease,
    background-color 0.25s ease;
  cursor: pointer;
  background: linear-gradient(145deg, #ebf1f4ff, rgb(219, 234, 247));
}

.add-activity-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
  background-color: #e6f4ea;
}

/* ================= SUMMARY CARDS ================= */
.summary-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.summary-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
  border-radius: 14px;
  padding: 20px;
  min-height: 250px;
  transition: transform 0.2s ease;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  background: linear-gradient(145deg, #ebf1f4ff, rgb(219, 234, 247));
}

.summary-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

.summary-card h6 {
  font-weight: 600;
  margin-bottom: 5px;
}

.summary-card h3 {
  font-weight: 700;
  margin: 0;
}

.summary-card .btn {
  font-size: 0.8rem;
  margin-top: auto;
}

/* ================= SUGGESTIONS ================= */
.col-md-4 .summary-card {
  padding: 20px;
  border-radius: 14px;
  min-height: auto;
}

.summary-card ul {
  padding-left: 0;
  margin: 0;
}

.summary-card ul li {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: 0.2s;
  flex-wrap: wrap;
  gap: 8px;
}

.summary-card ul li + li {
  margin-top: 8px;
}

.summary-card ul li span {
  width: 100%;
  text-align: left;
}

.summary-card ul li button {
  flex-shrink: 0;
  min-width: 120px;
}

.summary-card ul li:hover {
  background-color: #f8f9fa;
  transform: translateY(-2px);
}

.section-title {
  color: #1e3a8a;
  font-weight: 700;
  letter-spacing: 0.3px;
}

/* ================= CHARTS ================= */
.chart-wrapper {
  width: 100%;
  height: 350px;
}

.chart-wrapper canvas {
  max-height: 100% !important;
}

/* ================= EXACT MEDIA QUERIES ================= */

/* navbar mobile */
@media (max-width: 991px) {
  .custom-navbar .navbar-nav {
    background: #080e18ff;
    padding: 18px;
    border-radius: 16px;
    margin-top: 12px;
  }
}

/* hero breakpoints */
@media (max-width: 1200px) {
  .hero-section {
    min-height: 80vh;
    padding: 0 40px;
  }
  .hero-img {
    max-height: 300px;
  }
}

@media (max-width: 992px) {
  .hero-section {
    min-height: 75vh;
    padding: 0 30px;
    text-align: center;
  }
  .hero-img {
    max-height: 260px;
    margin-top: 20px;
  }
  .hero-section h1 {
    font-size: 2rem;
  }
  .hero-section p {
    font-size: 1rem;
  }
}

@media (max-width: 768px) {
  .hero-section {
    min-height: 70vh;
    padding: 0 20px;
  }
  .hero-section h1 {
    font-size: 1.8rem;
  }
  .hero-section p {
    font-size: 0.95rem;
  }
  .hero-img {
    max-height: 220px;
  }
}

@media (max-width: 576px) {
  .hero-section {
    min-height: 65vh;
    padding: 0 15px;
  }
  .hero-section h1 {
    font-size: 1.6rem;
  }
  .hero-section p {
    font-size: 0.9rem;
  }
  .hero-img {
    max-height: 180px;
  }
}

/* summary grid */
@media (max-width: 992px) {
  .summary-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 576px) {
  .summary-cards-grid {
    grid-template-columns: 1fr;
  }
}

/* suggestions mobile */
@media (max-width: 768px) {
  .summary-card ul li {
    flex-direction: column;
    align-items: stretch;
    text-align: left;
    gap: 6px;
  }

  .summary-card ul li button {
    width: 100%;
    margin-top: 4px;
  }
}

@media (max-width: 576px) {
  .summary-card {
    padding: 12px;
    min-height: auto;
  }

  .summary-card ul li {
    padding: 8px 10px;
    gap: 4px;
  }

  .summary-card ul li button {
    font-size: 0.85rem;
  }
}

/* tables */
@media (max-width: 768px) {
  .table thead {
    display: none;
  }

  .table tbody tr {
    display: block;
    margin-bottom: 1rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 10px;
  }

  .table tbody tr td {
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    flex-wrap: wrap;
  }

  .table tbody tr td::before {
    content: attr(data-label);
    font-weight: 600;
    width: 50%;
  }
}

@media (max-width: 768px) {
  .chart-wrapper {
    height: 250px;
  }
}

      `}</style>
    </div>
  );
}
