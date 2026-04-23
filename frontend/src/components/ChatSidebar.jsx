import React, { useState, useEffect, useRef } from "react";
import { FaPlus, FaTrash, FaComment, FaBars, FaTimes } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

export default function ChatSidebar({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onNewChat, 
  onDeleteSession,
  isOpen,
  onToggle 
}) {
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const sidebarRef = useRef(null);

  // Close sidebar when clicking outside (mobile)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        const toggleButton = document.querySelector('.sidebar-toggle');
        if (toggleButton && !toggleButton.contains(event.target)) {
          onToggle();
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  const handleSelectSession = (sessionId) => {
    onSelectSession(sessionId);
    onToggle(); // Auto close after selection
  };

  const handleNewChat = () => {
    onNewChat();
    onToggle(); // Auto close after new chat
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    setDeleteConfirm(id);
  };

  const confirmDelete = (id) => {
    onDeleteSession(id);
    setDeleteConfirm(null);
  };

  return (
    <>
      {/* Small Toggle Button */}
      <button className="sidebar-toggle" onClick={onToggle}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <div className={`chat-sidebar ${isOpen ? "open" : ""}`} ref={sidebarRef}>
        <div className="sidebar-header">
          <h3>📋 Chat History</h3>
          <button className="new-chat-btn" onClick={handleNewChat}>
            <FaPlus /> New Chat
          </button>
        </div>

        <div className="sessions-list">
          {sessions.length === 0 ? (
            <div className="no-sessions">
              <p>No chats yet</p>
              <button className="start-chat-btn" onClick={handleNewChat}>
                Start a new chat
              </button>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session._id}
                className={`session-item ${currentSessionId === session._id ? "active" : ""}`}
                onClick={() => handleSelectSession(session._id)}
              >
                <div className="session-icon">
                  <FaComment />
                </div>
                <div className="session-info">
                  <div className="session-title">{session.title}</div>
                  <div className="session-time">
                    {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                  </div>
                </div>
                <button 
                  className="delete-session-btn"
                  onClick={(e) => handleDelete(session._id, e)}
                >
                  <FaTrash />
                </button>

                {deleteConfirm === session._id && (
                  <div className="delete-confirm" onClick={(e) => e.stopPropagation()}>
                    <span>Delete?</span>
                    <button onClick={() => confirmDelete(session._id)}>Yes</button>
                    <button onClick={() => setDeleteConfirm(null)}>No</button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        .sidebar-toggle {
          position: fixed;
          top: 80px;
          left: 20px;
          z-index: 100;
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          border: none;
          color: white;
          width: 45px;
          height: 45px;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          transition: all 0.3s;
        }
        .sidebar-toggle:hover {
          transform: scale(1.05);
        }
        .chat-sidebar {
          position: fixed;
          top: 0;
          left: -320px;
          width: 320px;
          height: 100vh;
          background: linear-gradient(180deg, #0f172a, #1e293b);
          color: white;
          z-index: 99;
          transition: left 0.3s ease;
          display: flex;
          flex-direction: column;
          box-shadow: 2px 0 10px rgba(0,0,0,0.3);
        }
        .chat-sidebar.open { left: 0; }
        .sidebar-header { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .new-chat-btn {
          width: 100%;
          padding: 10px;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border: none;
          color: white;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .sessions-list { flex: 1; overflow-y: auto; padding: 12px; }
        .session-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          margin-bottom: 8px;
          border-radius: 12px;
          cursor: pointer;
          background: rgba(255,255,255,0.05);
          position: relative;
        }
        .session-item:hover, .session-item.active { background: linear-gradient(135deg, #4f46e5, #6366f1); }
        .session-title { font-size: 0.9rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .session-time { font-size: 0.7rem; opacity: 0.6; margin-top: 4px; }
        .delete-session-btn {
          background: rgba(239,68,68,0.2);
          border: none;
          color: #ef4444;
          width: 30px;
          height: 30px;
          border-radius: 8px;
          cursor: pointer;
        }
        .delete-session-btn:hover { background: #ef4444; color: white; }
        .delete-confirm {
          position: absolute;
          right: 50px;
          top: 50%;
          transform: translateY(-50%);
          background: #1e293b;
          padding: 6px 10px;
          border-radius: 8px;
          display: flex;
          gap: 8px;
          z-index: 10;
        }
        .no-sessions { text-align: center; padding: 40px 20px; opacity: 0.7; }
        @media (max-width: 768px) {
          .sidebar-toggle { top: 70px; left: 12px; width: 40px; height: 40px; }
          .chat-sidebar { width: 280px; left: -280px; }
        }
      `}</style>
    </>
  );
}