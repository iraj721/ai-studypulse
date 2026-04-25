import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";
// import Stars from "../../components/Stars";
// import BackButton from "../../components/BackButton";
import Toast from "../../components/Toast";
import { 
  FaBook, FaClipboardList, FaBrain, FaVideo, FaBookmark, 
  FaUsers, FaComments, FaLayerGroup, FaChartLine, FaCalendarAlt,
  FaStar, FaRegStar, FaEye, FaTrash
} from "react-icons/fa";

export default function AdminStudentFullDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [toast, setToast] = useState({ message: "", type: "success" });
  
  // Data states
  const [activities, setActivities] = useState([]);
  const [notes, setNotes] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [videos, setVideos] = useState([]);
  const [groups, setGroups] = useState([]);
  const [chats, setChats] = useState([]);
  const [chatSessions, setChatSessions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, [id]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Get user info
      const userRes = await apiAdmin.get(`/admin/users/${id}`);
      setUser(userRes.data.user);
      
      // Fetch all data in parallel
      const [
        activitiesRes, notesRes, quizzesRes, flashcardsRes,
        bookmarksRes, videosRes, groupsRes, chatsRes, 
        chatSessionsRes, classesRes, submissionsRes
      ] = await Promise.all([
        apiAdmin.get(`/admin/users/${id}`).then(res => res.data.activities || []),
        apiAdmin.get(`/admin/users/${id}`).then(res => res.data.notes || []),
        apiAdmin.get(`/admin/users/${id}`).then(res => res.data.quizzes || []),
        apiAdmin.get(`/admin/students/${id}/flashcards`).catch(() => []),
        apiAdmin.get(`/admin/students/${id}/bookmarks`).catch(() => []),
        apiAdmin.get(`/admin/students/${id}/videos`).catch(() => []),
        apiAdmin.get(`/admin/students/${id}/groups`).catch(() => []),
        apiAdmin.get(`/admin/students/${id}/chats`).catch(() => []),
        apiAdmin.get(`/admin/students/${id}/chat-sessions`).catch(() => []),
        apiAdmin.get(`/admin/students/${id}/classes`).catch(() => ({ data: { classes: [] } })),
        apiAdmin.get(`/admin/students/${id}/submissions`).catch(() => ({ data: { submissions: [] } }))
      ]);
      
      setActivities(activitiesRes);
      setNotes(notesRes);
      setQuizzes(quizzesRes);
      setFlashcards(flashcardsRes);
      setBookmarks(bookmarksRes);
      setVideos(videosRes);
      setGroups(groupsRes);
      setChats(chatsRes);
      setChatSessions(chatSessionsRes);
      setClasses(classesRes?.data?.classes || classesRes || []);
      setSubmissions(submissionsRes?.data?.submissions || submissionsRes || []);
      
    } catch (err) {
      console.error("Error fetching student data:", err);
      setToast({ message: "Failed to load student data", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "overview", label: "📊 Overview", icon: <FaChartLine /> },
    { id: "activities", label: "📘 Activities", icon: <FaClipboardList />, count: activities.length },
    { id: "notes", label: "📓 Notes", icon: <FaBook />, count: notes.length },
    { id: "quizzes", label: "📝 Quizzes", icon: <FaBrain />, count: quizzes.length },
    { id: "flashcards", label: "🃏 Flashcards", icon: <FaLayerGroup />, count: flashcards.length },
    { id: "videos", label: "🎥 Videos", icon: <FaVideo />, count: videos.length },
    { id: "bookmarks", label: "🔖 Bookmarks", icon: <FaBookmark />, count: bookmarks.length },
    { id: "groups", label: "👥 Groups", icon: <FaUsers />, count: groups.length },
    { id: "chat", label: "💬 Chat", icon: <FaComments />, count: chatSessions.length },
    { id: "classes", label: "🏫 Classes", icon: <FaCalendarAlt />, count: classes.length }
  ];

  const StatCard = ({ title, value, icon, color }) => (
    <div className="stat-card-admin">
      <div className="stat-icon" style={{ background: color }}>{icon}</div>
      <div className="stat-info">
        <div className="stat-value">{value}</div>
        <div className="stat-title">{title}</div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="admin-student-page min-vh-100 py-5">
        <Stars />
        <div className="container text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="text-white mt-3">Loading student data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-student-page min-vh-100 py-5 position-relative">
      <Stars />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className="container">
        <BackButton to="/admin/dashboard" label="← Back to Dashboard" />

        {/* Student Profile Header */}
        <div className="student-profile-header">
          <div className="profile-avatar">
            <div className="avatar-initials">{user?.name?.charAt(0) || "S"}</div>
          </div>
          <div className="profile-info">
            <h2>{user?.name}</h2>
            <p className="profile-email">{user?.email}</p>
            <div className="profile-meta">
              <span className="profile-role">🎓 Student</span>
              <span className="profile-joined">Joined: {new Date(user?.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="stats-overview-grid">
          <StatCard title="Activities" value={activities.length} icon={<FaClipboardList />} color="#4f46e5" />
          <StatCard title="Notes" value={notes.length} icon={<FaBook />} color="#10b981" />
          <StatCard title="Quizzes" value={quizzes.length} icon={<FaBrain />} color="#f59e0b" />
          <StatCard title="Flashcards" value={flashcards.length} icon={<FaLayerGroup />} color="#8b5cf6" />
          <StatCard title="Videos" value={videos.length} icon={<FaVideo />} color="#ef4444" />
          <StatCard title="Bookmarks" value={bookmarks.length} icon={<FaBookmark />} color="#ec4899" />
          <StatCard title="Groups" value={groups.length} icon={<FaUsers />} color="#06b6d4" />
          <StatCard title="Chats" value={chatSessions.length} icon={<FaComments />} color="#14b8a6" />
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
              {tab.count > 0 && <span className="tab-count">{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="overview-grid">
              <div className="overview-card">
                <h4>📊 Study Summary</h4>
                <div className="summary-stats">
                  <div className="summary-item">
                    <strong>Total Study Time:</strong>
                    <span>{Math.floor(activities.reduce((sum, a) => sum + (a.durationMinutes || 0), 0) / 60)} hours</span>
                  </div>
                  <div className="summary-item">
                    <strong>Completed Quizzes:</strong>
                    <span>{quizzes.filter(q => q.score !== null).length}</span>
                  </div>
                  <div className="summary-item">
                    <strong>Average Quiz Score:</strong>
                    <span>{Math.round(quizzes.filter(q => q.score !== null).reduce((sum, q) => sum + (q.score || 0), 0) / (quizzes.filter(q => q.score !== null).length || 1))}%</span>
                  </div>
                </div>
              </div>
              <div className="overview-card">
                <h4>📚 Learning Progress</h4>
                <div className="progress-bars">
                  <div className="progress-item">
                    <span>Notes Created</span>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${Math.min(100, (notes.length / 50) * 100)}%` }}></div>
                    </div>
                    <span>{notes.length}/50</span>
                  </div>
                  <div className="progress-item">
                    <span>Quizzes Taken</span>
                    <div className="progress-bar-container">
                      <div className="progress-bar-fill" style={{ width: `${Math.min(100, (quizzes.filter(q => q.score !== null).length / 30) * 100)}%` }}></div>
                    </div>
                    <span>{quizzes.filter(q => q.score !== null).length}/30</span>
                  </div>
                </div>
              </div>
              <div className="overview-card">
                <h4>⭐ Recent Activity</h4>
                {activities.slice(0, 5).map((a, i) => (
                  <div key={i} className="recent-item">
                    <span className="recent-icon">📖</span>
                    <div>
                      <div className="recent-title">{a.subject} - {a.topic}</div>
                      <div className="recent-date">{new Date(a.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activities Tab */}
          {activeTab === "activities" && (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr><th>Subject</th><th>Topic</th><th>Duration</th><th>Difficulty</th><th>Date</th><th>Insights</th></tr>
                </thead>
                <tbody>
                  {activities.map(a => (
                    <tr key={a._id}>
                      <td>{a.subject}</td><td>{a.topic}</td><td>{a.durationMinutes} min</td>
                      <td><span className={`difficulty-badge ${a.difficulty}`}>{a.difficulty}</span></td>
                      <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                      <td>{a.insights?.length > 0 ? "✅" : "❌"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === "notes" && (
            <div className="notes-grid">
              {notes.map(note => (
                <div key={note._id} className="note-card-admin">
                  <h5>{note.subject} - {note.topic}</h5>
                  <p className="note-preview">{note.content?.substring(0, 150)}...</p>
                  <small>{new Date(note.createdAt).toLocaleDateString()}</small>
                </div>
              ))}
            </div>
          )}

          {/* Quizzes Tab */}
          {activeTab === "quizzes" && (
            <div className="data-table-container">
              <table className="data-table">
                <thead><tr><th>Topic</th><th>Questions</th><th>Score</th><th>Date</th></tr></thead>
                <tbody>
                  {quizzes.map(q => (
                    <tr key={q._id}>
                      <td>{q.topic}</td><td>{q.questions?.length || 0}</td>
                      <td>{q.score !== null ? `${Math.round(q.score)}%` : "Not taken"}</td>
                      <td>{new Date(q.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Flashcards Tab */}
          {activeTab === "flashcards" && (
            <div className="flashcards-grid">
              {flashcards.map(card => (
                <div key={card._id} className="flashcard-card">
                  <div className="flashcard-front-admin">{card.front}</div>
                  <div className="flashcard-back-admin">{card.back}</div>
                </div>
              ))}
            </div>
          )}

          {/* Videos Tab */}
          {activeTab === "videos" && (
            <div className="videos-grid">
              {videos.map(v => (
                <div key={v._id} className="video-card">
                  <h5>{v.title}</h5>
                  <p className="video-meta">{v.author} • {new Date(v.savedAt).toLocaleDateString()}</p>
                  <div className="video-summary-preview">{v.summary?.substring(0, 100)}...</div>
                </div>
              ))}
            </div>
          )}

          {/* Bookmarks Tab */}
          {activeTab === "bookmarks" && (
            <div className="bookmarks-grid-admin">
              {bookmarks.map(b => (
                <div key={b._id} className="bookmark-card-admin">
                  <div className="bookmark-type">{b.type}</div>
                  <div className="bookmark-title">{b.title}</div>
                  <div className="bookmark-collection">{b.collectionName}</div>
                </div>
              ))}
            </div>
          )}

          {/* Groups Tab */}
          {activeTab === "groups" && (
            <div className="groups-grid">
              {groups.map(g => (
                <div key={g._id} className="group-card">
                  <h5>{g.name}</h5>
                  <p>{g.description}</p>
                  <small>Members: {g.members?.length || 0}</small>
                </div>
              ))}
            </div>
          )}

          {/* Chat Tab */}
          {activeTab === "chat" && (
            <div className="chat-sessions-grid">
              {chatSessions.map(s => (
                <div key={s._id} className="chat-session-card">
                  <div className="session-title">{s.title}</div>
                  <div className="session-meta">
                    Messages: {s.messages?.length || 0} • {new Date(s.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="session-preview">
                    {s.messages?.[s.messages.length - 1]?.text?.substring(0, 100)}...
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Classes Tab */}
          {activeTab === "classes" && (
            <div className="classes-grid">
              {classes.map(c => (
                <div key={c._id} className="class-card">
                  <h5>{c.name}</h5>
                  <p>{c.subject}</p>
                  <small>Teacher: {c.teacher?.name}</small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .admin-student-page {
          background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #1a2a3d 100%);
        }
        
        /* Student Profile Header */
        .student-profile-header {
          display: flex;
          align-items: center;
          gap: 24px;
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 24px;
          padding: 24px;
          margin-bottom: 30px;
        }
        .avatar-initials {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: bold;
          color: white;
        }
        .profile-info h2 { color: white; margin-bottom: 5px; }
        .profile-email { color: #94a3b8; margin-bottom: 8px; }
        .profile-meta { display: flex; gap: 15px; }
        .profile-role { background: rgba(79,70,229,0.3); padding: 4px 12px; border-radius: 20px; color: #a5b4fc; font-size: 12px; }
        .profile-joined { color: #94a3b8; font-size: 12px; }
        
        /* Stats Grid */
        .stats-overview-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 30px;
        }
        .stat-card-admin {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: transform 0.2s;
        }
        .stat-card-admin:hover { transform: translateY(-3px); }
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
        }
        .stat-value { font-size: 24px; font-weight: bold; color: white; }
        .stat-title { font-size: 12px; color: #94a3b8; }
        
        /* Tabs */
        .admin-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 24px;
          background: rgba(255,255,255,0.05);
          border-radius: 16px;
          padding: 8px;
        }
        .tab-btn {
          background: transparent;
          border: none;
          padding: 10px 20px;
          border-radius: 12px;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          font-size: 14px;
        }
        .tab-btn.active {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
        }
        .tab-count {
          background: rgba(255,255,255,0.2);
          border-radius: 20px;
          padding: 2px 8px;
          font-size: 11px;
        }
        
        /* Tables */
        .data-table-container {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          overflow-x: auto;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          color: white;
        }
        .data-table th, .data-table td {
          padding: 12px 16px;
          text-align: left;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .data-table th { color: #a5b4fc; font-weight: 600; }
        .difficulty-badge.easy { color: #22c55e; }
        .difficulty-badge.medium { color: #f59e0b; }
        .difficulty-badge.hard { color: #ef4444; }
        
        /* Notes Grid */
        .notes-grid, .flashcards-grid, .videos-grid, .bookmarks-grid-admin, .groups-grid, .chat-sessions-grid, .classes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }
        .note-card-admin, .flashcard-card, .video-card, .bookmark-card-admin, .group-card, .chat-session-card, .class-card {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 16px;
          color: white;
        }
        .flashcard-card { border-left: 3px solid #4f46e5; }
        .flashcard-front-admin { font-weight: 600; margin-bottom: 8px; }
        .flashcard-back-admin { font-size: 13px; color: #94a3b8; }
        .video-summary-preview { font-size: 12px; color: #94a3b8; margin-top: 8px; }
        .bookmark-type { font-size: 10px; text-transform: uppercase; color: #a5b4fc; margin-bottom: 8px; }
        
        /* Overview Grid */
        .overview-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
        .overview-card { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 16px; padding: 20px; color: white; }
        .summary-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .progress-item { margin-bottom: 15px; }
        .progress-bar-container { background: #334155; border-radius: 10px; height: 8px; margin: 8px 0; }
        .progress-bar-fill { background: linear-gradient(90deg, #4f46e5, #6366f1); height: 100%; border-radius: 10px; }
        .recent-item { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .recent-icon { font-size: 20px; }
        
        @media (max-width: 768px) {
          .student-profile-header { flex-direction: column; text-align: center; }
          .stats-overview-grid { grid-template-columns: repeat(2, 1fr); }
          .admin-tabs { overflow-x: auto; flex-wrap: nowrap; }
          .overview-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}