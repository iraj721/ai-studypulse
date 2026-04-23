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

  // ✅ Close sidebar when clicking outside (mobile)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        // Check if click is on the toggle button
        const toggleButton = document.querySelector('.sidebar-toggle');
        if (toggleButton && !toggleButton.contains(event.target)) {
          onToggle();
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onToggle]);

  // ✅ Handle session selection with auto-close
  const handleSelectSession = (sessionId) => {
    onSelectSession(sessionId);
    // Close sidebar after selection (especially important on mobile)
    if (window.innerWidth <= 768) {
      onToggle();
    }
  };

  // ✅ Handle new chat with auto-close
  const handleNewChat = () => {
    onNewChat();
    // Close sidebar after creating new chat
    if (window.innerWidth <= 768) {
      onToggle();
    }
  };

  // ✅ Handle delete with auto-close
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
      {/* Mobile Toggle Button */}
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

                {/* Delete Confirmation Modal */}
                {deleteConfirm === session._id && (
                  <div className="delete-confirm" onClick={(e) => e.stopPropagation()}>
                    <span>Delete this chat?</span>
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
          background: linear-gradient(135deg, #5b4be8, #7b66f3);
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
        
        .chat-sidebar.open {
          left: 0;
        }
        
        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          background: rgba(0,0,0,0.2);
        }
        
        .sidebar-header h3 {
          margin: 0 0 12px 0;
          font-size: 1.2rem;
        }
        
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
          font-weight: 600;
          transition: all 0.3s;
        }
        
        .new-chat-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(34,197,94,0.3);
        }
        
        .sessions-list {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
        }
        
        .session-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          margin-bottom: 8px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          background: rgba(255,255,255,0.05);
        }
        
        .session-item:hover {
          background: rgba(255,255,255,0.1);
        }
        
        .session-item.active {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
        }
        
        .session-icon {
          font-size: 1.1rem;
          color: rgba(255,255,255,0.7);
        }
        
        .session-info {
          flex: 1;
          overflow: hidden;
        }
        
        .session-title {
          font-size: 0.9rem;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        
        .session-time {
          font-size: 0.7rem;
          opacity: 0.6;
          margin-top: 4px;
        }
        
        .delete-session-btn {
          background: rgba(239,68,68,0.2);
          border: none;
          color: #ef4444;
          width: 30px;
          height: 30px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .delete-session-btn:hover {
          background: #ef4444;
          color: white;
        }
        
        .delete-confirm {
          position: absolute;
          right: 50px;
          top: 50%;
          transform: translateY(-50%);
          background: #1e293b;
          padding: 8px 12px;
          border-radius: 8px;
          display: flex;
          gap: 8px;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        }
        
        .delete-confirm button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px 12px;
          border-radius: 6px;
        }
        
        .delete-confirm button:first-child {
          background: #ef4444;
        }
        
        .delete-confirm button:last-child {
          background: #475569;
        }
        
        .no-sessions {
          text-align: center;
          padding: 40px 20px;
          opacity: 0.7;
        }
        
        .start-chat-btn {
          margin-top: 12px;
          background: rgba(255,255,255,0.1);
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
        }
        
        /* Desktop: always show sidebar, no toggle */
        @media (min-width: 769px) {
          .sidebar-toggle {
            display: none;
          }
          
          .chat-sidebar {
            left: 0 !important;
            position: fixed;
            z-index: 90;
          }
          
          .ai-chat {
            margin-left: 320px !important;
            width: calc(100% - 320px) !important;
          }
          
          .ai-input {
            margin-left: 320px !important;
            width: calc(100% - 320px) !important;
          }
          
          .ai-header {
            margin-left: 320px !important;
            width: calc(100% - 320px) !important;
          }
          
          .chat-header-wrapper {
            margin-left: 320px !important;
          }
        }
        
        /* Mobile */
        @media (max-width: 768px) {
          .sidebar-toggle {
            top: 70px;
            left: 12px;
            width: 40px;
            height: 40px;
          }
          
          .chat-sidebar {
            width: 280px;
            left: -280px;
          }
          
          .session-title {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </>
  );
}