import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiAdmin from "../../services/apiAdmin";
// import BackButton from "../../components/BackButton";
import Toast from "../../components/Toast";
import { FaComments, FaShare, FaEye, FaUsers, FaCalendar, FaArrowLeft } from "react-icons/fa";

export default function AdminGroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
      const res = await apiAdmin.get(`/admin/groups/${groupId}`);
      setGroup(res.data);
    } catch (err) {
      console.error(err);
      setToast({ message: "Failed to load group details", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMessageIcon = (type) => {
    switch (type) {
      case "note": return "📓";
      case "quiz": return "📝";
      case "youtube": return "🎥";
      case "insight": return "💡";
      case "flashcard": return "🃏";
      case "file": return "📄";
      default: return "💬";
    }
  };

  if (loading) {
    return (
      <div className="admin-page-container">
        <div className="container text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3 text-muted">Loading group details...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="admin-page-container">
        <div className="container">
          <BackButton to="#" onClick={() => navigate(-1)} label="← Back" />
          <div className="alert alert-danger mt-4">Group not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-container">
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: "", type: "success" })} 
      />
      
      <div className="container py-4">
        {/* Back Button */}
        <div className="mb-3">
          <button 
            onClick={() => navigate(-1)} 
            className="btn btn-outline-secondary btn-sm"
          >
            <FaArrowLeft className="me-1" /> Back
          </button>
        </div>
        
        {/* Group Header */}
        <div className="admin-group-header mb-4">
          <h3 className="fw-bold mb-2">👥 {group.name}</h3>
          <p className="text-muted mb-3">{group.description || "No description"}</p>
          <div className="group-meta">
            <span className="badge bg-secondary">Code: {group.code}</span>
            <span className="badge bg-info ms-2"><FaUsers className="me-1" /> {group.members?.length || 0} members</span>
            <span className="badge bg-success ms-2"><FaCalendar className="me-1" /> {new Date(group.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        {/* Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === "chat" ? "active fw-bold" : ""}`}
              onClick={() => setActiveTab("chat")}
            >
              <FaComments className="me-1" /> Chat ({group.messages?.length || 0})
            </button>
          </li>
          <li className="nav-item">
            <button 
              className={`nav-link ${activeTab === "shared" ? "active fw-bold" : ""}`}
              onClick={() => setActiveTab("shared")}
            >
              <FaShare className="me-1" /> Shared Content ({group.sharedContent?.length || 0})
            </button>
          </li>
        </ul>
        
        {/* Chat Tab */}
        {activeTab === "chat" && (
          <div className="admin-chat-container">
            {group.messages?.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <div className="fs-1 mb-3">💬</div>
                <h5>No messages yet</h5>
                <p>This group hasn't had any conversations.</p>
              </div>
            ) : (
              <div className="admin-messages-list">
                {group.messages.map((msg, idx) => (
                  <div key={msg._id || idx} className="admin-message-item">
                    <div className="message-avatar">
                      {msg.userName?.charAt(0) || "U"}
                    </div>
                    <div className="message-content">
                      <div className="message-header">
                        <strong>{msg.userName || "Unknown"}</strong>
                        <small className="text-muted ms-2">{formatTime(msg.createdAt)}</small>
                      </div>
                      <div className="message-body">
                        {msg.type !== "text" && (
                          <span className="message-type-badge me-2">
                            {getMessageIcon(msg.type)} {msg.type}
                          </span>
                        )}
                        {msg.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Shared Content Tab */}
        {activeTab === "shared" && (
          <div className="admin-shared-container">
            {group.sharedContent?.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <div className="fs-1 mb-3">📤</div>
                <h5>No shared content yet</h5>
                <p>Members haven't shared anything in this group.</p>
              </div>
            ) : (
              <div className="row g-4">
                {group.sharedContent.map((item, idx) => (
                  <div key={item._id || idx} className="col-md-6 col-lg-4">
                    <div className="shared-admin-card">
                      <div className="shared-type-icon">
                        {item.type === "note" && "📓"}
                        {item.type === "quiz" && "📝"}
                        {item.type === "youtube" && "🎥"}
                        {item.type === "insight" && "💡"}
                        {item.type === "flashcard" && "🃏"}
                        {item.type === "file" && "📄"}
                      </div>
                      <div className="shared-info">
                        <h6 className="shared-title">{item.title}</h6>
                        <p className="shared-preview">{item.content?.substring(0, 100)}...</p>
                        <div className="shared-meta">
                          <small>Shared by {item.sharedByName}</small>
                          <small>{new Date(item.sharedAt).toLocaleDateString()}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .admin-page-container {
          background: #f0f2f5;
          min-height: 100vh;
        }
        .admin-group-header {
          background: white;
          padding: 20px 24px;
          border-radius: 16px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .group-meta {
          display: flex;
          gap: 10px;
          margin-top: 10px;
          flex-wrap: wrap;
        }
        .admin-chat-container {
          background: white;
          border-radius: 16px;
          padding: 20px;
          max-height: 600px;
          overflow-y: auto;
        }
        .admin-messages-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .admin-message-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 12px;
          transition: all 0.2s;
        }
        .admin-message-item:hover {
          background: #f1f3f5;
        }
        .message-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          flex-shrink: 0;
        }
        .message-content {
          flex: 1;
        }
        .message-header {
          margin-bottom: 5px;
        }
        .message-body {
          color: #475569;
          word-break: break-word;
        }
        .message-type-badge {
          display: inline-block;
          background: #e0e7ff;
          color: #4f46e5;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
        }
        .admin-shared-container {
          background: white;
          border-radius: 16px;
          padding: 20px;
        }
        .shared-admin-card {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 15px;
          display: flex;
          gap: 12px;
          transition: all 0.2s;
          height: 100%;
        }
        .shared-admin-card:hover {
          background: #f1f3f5;
          transform: translateY(-2px);
        }
        .shared-type-icon {
          font-size: 32px;
          flex-shrink: 0;
        }
        .shared-info {
          flex: 1;
        }
        .shared-title {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 5px;
          color: #1e293b;
        }
        .shared-preview {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 8px;
        }
        .shared-meta {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #94a3b8;
        }
        .nav-tabs {
          border-bottom: 1px solid #dee2e6;
          background: white;
          padding: 0 20px;
          border-radius: 16px 16px 0 0;
        }
        .nav-tabs .nav-link {
          color: #475569;
          border: none;
          padding: 12px 20px;
          margin-right: 5px;
        }
        .nav-tabs .nav-link:hover {
          color: #4f46e5;
          background: transparent;
        }
        .nav-tabs .nav-link.active {
          color: #4f46e5;
          border-bottom: 2px solid #4f46e5;
          background: none;
        }
        .btn-outline-secondary {
          border-radius: 20px;
          padding: 6px 16px;
        }
      `}</style>
    </div>
  );
}