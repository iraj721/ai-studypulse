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

  const toggleSession = (sessionId) => {
    setExpandedSession(expandedSession === sessionId ? null : sessionId);
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
        <h3 className="mb-4 fw-bold">💬 Student Chat Sessions</h3>
        <p className="text-muted mb-4">Total: {sessions.length} chat sessions</p>
        
        {sessions.length === 0 ? (
          <div className="alert alert-info text-center">No chat sessions found for this student.</div>
        ) : (
          <div className="chat-sessions-list">
            {sessions.map((session) => (
              <div key={session._id} className="card shadow-sm border-0 mb-3 hover-card">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{session.title}</strong>
                    <small className="text-muted d-block">Messages: {session.messages?.length || 0}</small>
                  </div>
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => toggleSession(session._id)}
                  >
                    {expandedSession === session._id ? "Hide" : "View Messages"}
                  </button>
                </div>
                <div className="card-body">
                  <div className="text-muted small mb-2">
                    Last updated: {new Date(session.updatedAt).toLocaleString()}
                  </div>
                  {expandedSession === session._id && (
                    <div className="chat-messages mt-3">
                      <h6>Messages:</h6>
                      {session.messages?.map((msg, idx) => (
                        <div key={idx} className="message-item">
                          <div className={`message-bubble ${msg.role === 'user' ? 'user' : 'ai'}`}>
                            <strong>{msg.role === 'user' ? '👤 Student' : '🤖 AI'}:</strong>
                            <p className="mb-0 mt-1">{msg.text}</p>
                            <small className="message-time">
                              {new Date(msg.createdAt).toLocaleString()}
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`
        .hover-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .hover-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }
        .chat-messages {
          max-height: 400px;
          overflow-y: auto;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 12px;
        }
        .message-item {
          margin-bottom: 15px;
        }
        .message-bubble {
          padding: 10px 15px;
          border-radius: 12px;
          background: white;
          border: 1px solid #e5e7eb;
        }
        .message-bubble.user {
          background: #e0e7ff;
          border-color: #c7d2fe;
        }
        .message-bubble.ai {
          background: #f3f4f6;
        }
        .message-time {
          font-size: 10px;
          color: #9ca3af;
          display: block;
          margin-top: 5px;
        }
      `}</style>
    </div>
  );
}