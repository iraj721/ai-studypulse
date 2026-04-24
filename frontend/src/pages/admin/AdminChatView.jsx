import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";
import Stars from "../../components/Stars";
import BackButton from "../../components/BackButton";

export default function AdminChatView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedSession, setExpandedSession] = useState(null);

  useEffect(() => {
    fetchChatSessions();
  }, []);

  const fetchChatSessions = async () => {
    try {
      const res = await apiAdmin.get(`/admin/students/${id}/chat-sessions`);
      setSessions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-light min-vh-100 py-4">
        <div className="container text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3">Loading chat sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-4">
      <div className="container">
        <BackButton to={`/admin/users/${id}`} label="← Back to User Details" />
        
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="fw-bold">💬 Student Chat Sessions</h3>
          <span className="badge bg-primary fs-6">{sessions.length} Sessions</span>
        </div>

        {sessions.length === 0 ? (
          <div className="alert alert-info text-center py-5">
            <div className="fs-1 mb-3">💬</div>
            <h5>No Chat Sessions Found</h5>
            <p>This student hasn't used the AI chat yet.</p>
          </div>
        ) : (
          <div className="chat-sessions-grid">
            {sessions.map((session) => (
              <div key={session._id} className="chat-session-card">
                <div className="session-header" onClick={() => setExpandedSession(expandedSession === session._id ? null : session._id)}>
                  <div className="session-icon">💬</div>
                  <div className="session-info">
                    <div className="session-title">{session.title}</div>
                    <div className="session-meta">
                      Messages: {session.messages?.length || 0} • {new Date(session.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="session-expand">{expandedSession === session._id ? "▲" : "▼"}</div>
                </div>
                {expandedSession === session._id && (
                  <div className="session-messages">
                    {session.messages?.map((msg, idx) => (
                      <div key={idx} className={`message-bubble ${msg.role === 'user' ? 'user' : 'ai'}`}>
                        <strong>{msg.role === 'user' ? '👤 Student' : '🤖 AI'}:</strong>
                        <p className="mb-0 mt-1">{msg.text}</p>
                        <small>{new Date(msg.createdAt).toLocaleTimeString()}</small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .chat-sessions-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .chat-session-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          transition: all 0.3s;
        }
        .chat-session-card:hover {
          box-shadow: 0 8px 20px rgba(0,0,0,0.12);
        }
        .session-header {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 16px 20px;
          cursor: pointer;
          background: white;
        }
        .session-icon {
          font-size: 28px;
        }
        .session-info {
          flex: 1;
        }
        .session-title {
          font-weight: 600;
          font-size: 16px;
          color: #1e293b;
          margin-bottom: 4px;
        }
        .session-meta {
          font-size: 11px;
          color: #64748b;
        }
        .session-expand {
          font-size: 16px;
          color: #94a3b8;
        }
        .session-messages {
          padding: 20px;
          background: #f8f9fa;
          border-top: 1px solid #e2e8f0;
          max-height: 400px;
          overflow-y: auto;
        }
        .message-bubble {
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 12px;
          background: white;
        }
        .message-bubble.user {
          background: #e0e7ff;
          border-left: 3px solid #4f46e5;
        }
        .message-bubble.ai {
          background: #f1f5f9;
          border-left: 3px solid #10b981;
        }
        .message-bubble small {
          font-size: 10px;
          color: #94a3b8;
          display: block;
          margin-top: 6px;
        }
      `}</style>
    </div>
  );
}