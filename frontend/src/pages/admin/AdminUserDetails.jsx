import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";

export default function AdminUserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [redirected, setRedirected] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Extra data states
  const [flashcards, setFlashcards] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [videos, setVideos] = useState([]);
  const [groups, setGroups] = useState([]);
  const [chatSessions, setChatSessions] = useState([]);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await apiAdmin.get(`/admin/users/${id}`);

      if (res.data.user.role === "teacher") {
        setRedirected(true);
        navigate(`/admin/teacher/${id}`, { replace: true });
        return;
      }

      setData(res.data);

      if (res.data.user.role === "student") {
        // Fetch joined classes
        const classRes = await apiAdmin.get(`/admin/students/${id}/classes`);
        setClasses(classRes.data.classes || []);
        
        // Fetch extra data in parallel
        const [flashRes, bookmarkRes, videoRes, groupRes, chatRes] = await Promise.all([
          apiAdmin.get(`/admin/students/${id}/flashcards`).catch(() => ({ data: [] })),
          apiAdmin.get(`/admin/students/${id}/bookmarks`).catch(() => ({ data: [] })),
          apiAdmin.get(`/admin/students/${id}/videos`).catch(() => ({ data: [] })),
          apiAdmin.get(`/admin/students/${id}/groups`).catch(() => ({ data: [] })),
          apiAdmin.get(`/admin/students/${id}/chat-sessions`).catch(() => ({ data: [] }))
        ]);
        
        setFlashcards(flashRes.data || []);
        setBookmarks(bookmarkRes.data || []);
        setVideos(videoRes.data || []);
        setGroups(groupRes.data || []);
        setChatSessions(chatRes.data || []);
      }
    } catch (err) {
      console.error(err);
      alert("Access denied");
      navigate("/admin/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (redirected) return null;

  if (loading) {
    return <div className="text-center mt-5 fs-5">Loading user details...</div>;
  }

  if (!data) return null;

  const { user, activities = [], quizzes = [], notes = [] } = data;
  const isStudent = user.role === "student";

  const roleLabel = user.role === "admin" ? "🛡️ Admin" : user.role === "teacher" ? "👨‍🏫 Teacher" : "🎓 Student";
  const roleColor = user.role === "admin" ? "danger" : user.role === "teacher" ? "warning" : "primary";

  // Card component
  const InfoCard = ({ title, icon, count, onClick, color = "primary" }) => (
    <div className="col-md-4 col-lg-3">
      <div className="card shadow-sm border-0 hover-card h-100" onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
        <div className="card-body text-center">
          <div className="fs-1 mb-2">{icon}</div>
          <h6 className="fw-bold">{title}</h6>
          <p className={`fs-4 fw-bold text-${color}`}>{count}</p>
          {onClick && (
            <button className={`btn btn-sm btn-outline-${color} w-100`}>
              View {title}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h3 className="fw-bold mb-1">👤 User Details</h3>
            <p className="text-muted mb-0">
              {isStudent ? "Complete academic overview" : "User profile overview"}
            </p>
          </div>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate("/admin/dashboard")}>
            ← Back to Dashboard
          </button>
        </div>

        {/* USER PROFILE */}
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1 fw-bold">{user.name}</h5>
              <p className="mb-1 text-muted">{user.email}</p>
              <span className={`badge bg-${roleColor}`}>{roleLabel}</span>
            </div>
            <div className="text-end text-muted small">
              Joined on <br />
              <strong>{new Date(user.createdAt).toLocaleDateString()}</strong>
            </div>
          </div>
        </div>

        {/* STUDENT SECTIONS - ALL CARDS */}
        {isStudent && (
          <>
            {/* Row 1: Main Activities */}
            <div className="row g-3 mb-4">
              <InfoCard 
                title="Activities" 
                icon="📘" 
                count={activities.length} 
                onClick={() => navigate(`/admin/users/${id}/activities`)}
                color="primary"
              />
              <InfoCard 
                title="Quizzes" 
                icon="📝" 
                count={quizzes.length} 
                onClick={() => navigate(`/admin/users/${id}/quizzes`)}
                color="success"
              />
              <InfoCard 
                title="Notes" 
                icon="📒" 
                count={notes.length} 
                onClick={() => navigate(`/admin/users/${id}/notes`)}
                color="warning"
              />
              <InfoCard 
                title="Flashcards" 
                icon="🃏" 
                count={flashcards.length} 
                onClick={() => navigate(`/admin/users/${id}/flashcards`)}
                color="info"
              />
            </div>

            {/* Row 2: Extra Features */}
            <div className="row g-3 mb-4">
              <InfoCard 
                title="Bookmarks" 
                icon="🔖" 
                count={bookmarks.length} 
                onClick={() => navigate(`/admin/users/${id}/bookmarks`)}
                color="danger"
              />
              <InfoCard 
                title="Video Summaries" 
                icon="🎥" 
                count={videos.length} 
                onClick={() => navigate(`/admin/users/${id}/videos`)}
                color="secondary"
              />
              <InfoCard 
                title="Study Groups" 
                icon="👥" 
                count={groups.length} 
                onClick={() => navigate(`/admin/users/${id}/groups`)}
                color="info"
              />
              <InfoCard 
                title="Chat Sessions" 
                icon="💬" 
                count={chatSessions.length} 
                onClick={() => navigate(`/admin/users/${id}/chat`)}
                color="success"
              />
            </div>

            {/* JOINED CLASSES */}
            <div className="mt-4">
              <h5 className="fw-bold mb-3">🏫 Joined Classes</h5>
              {classes.length === 0 ? (
                <div className="text-muted">Student has not joined any class yet.</div>
              ) : (
                <div className="row g-3">
                  {classes.map((cls) => (
                    <div className="col-md-4" key={cls._id}>
                      <div className="card shadow-sm border-0 hover-card h-100">
                        <div className="card-body text-center">
                          <div className="fs-1 mb-2">🏫</div>
                          <h6 className="fw-bold">{cls.name}</h6>
                          <p className="text-muted mb-1">{cls.subject}</p>
                          <small className="text-muted">Teacher: {cls.teacher?.name}</small>
                          <button
                            className="btn btn-outline-primary btn-sm w-100 mt-3"
                            onClick={() => navigate(`/admin/student/class/${cls._id}`)}
                          >
                            View Class
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <style>{`
        .hover-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          cursor: pointer;
        }
        .hover-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.12);
        }
        .text-primary { color: #4f46e5 !important; }
        .text-success { color: #10b981 !important; }
        .text-warning { color: #f59e0b !important; }
        .text-info { color: #06b6d4 !important; }
        .text-danger { color: #ef4444 !important; }
        .text-secondary { color: #64748b !important; }
      `}</style>
    </div>
  );
}