import React, { useState, useEffect, useRef } from "react";
import api from "../services/api";
import { io } from "socket.io-client";
import { FaPlus, FaUsers, FaShare, FaCopy } from "react-icons/fa";
import Toast from "./Toast";

export default function StudyGroups({ user }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [shareTitle, setShareTitle] = useState("");
  const [shareContent, setShareContent] = useState("");
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);

  // Fetch groups on mount
  useEffect(() => {
    fetchGroups();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Socket connection when selectedGroup changes
  useEffect(() => {
    if (selectedGroup && socketRef.current) {
      socketRef.current.emit('joinGroupRoom', selectedGroup._id);
      socketRef.current.on('newGroupMessage', (data) => {
        setMessages(prev => [...prev, data]);
      });
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off('newGroupMessage');
      }
    };
  }, [selectedGroup]);

  // Initialize socket connection once
  useEffect(() => {
    if (!socketRef.current) {
      try {
        socketRef.current = io(import.meta.env.VITE_API_URL, {
          transports: ['websocket'],
          reconnection: true,
          reconnectionAttempts: 3
        });
        
        socketRef.current.on('connect', () => {
          console.log('Socket connected');
        });
        
        socketRef.current.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
        });
      } catch (err) {
        console.error("Socket initialization error:", err);
      }
    }
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await api.get("/student/groups");
      setGroups(res.data);
    } catch (err) {
      setToast({ message: "Failed to load groups", type: "error" });
    }
  };

  const fetchGroupDetails = async (groupId) => {
    try {
      const res = await api.get(`/student/groups/${groupId}`);
      setSelectedGroup(res.data);
      setMessages(res.data.messages || []);
    } catch (err) {
      setToast({ message: "Failed to load group details", type: "error" });
    }
  };

  const createGroup = async () => {
    if (!groupName.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/student/groups/create", { name: groupName, description: groupDesc });
      setToast({ message: `Group created! Code: ${res.data.code}`, type: "success" });
      setShowCreateModal(false);
      setGroupName("");
      setGroupDesc("");
      fetchGroups();
    } catch (err) {
      setToast({ message: "Failed to create group", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const joinGroup = async () => {
    if (!joinCode.trim()) return;
    setLoading(true);
    try {
      await api.post("/student/groups/join", { code: joinCode });
      setToast({ message: "Joined group successfully!", type: "success" });
      setShowJoinModal(false);
      setJoinCode("");
      fetchGroups();
    } catch (err) {
      setToast({ message: err.response?.data?.message || "Failed to join", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedGroup) return;
    try {
      await api.post(`/student/groups/${selectedGroup._id}/messages`, { message });
      // Add message locally for immediate display
      const newMessage = {
        userName: user?.name || "You",
        message: message,
        createdAt: new Date()
      };
      setMessages(prev => [...prev, newMessage]);
      setMessage("");
    } catch (err) {
      setToast({ message: "Failed to send message", type: "error" });
    }
  };

  const shareNote = async () => {
    if (!shareTitle.trim() || !shareContent.trim()) return;
    try {
      await api.post(`/student/groups/${selectedGroup._id}/notes`, { title: shareTitle, content: shareContent });
      setToast({ message: "Note shared successfully!", type: "success" });
      setShareTitle("");
      setShareContent("");
      // Refresh group details to show new note
      fetchGroupDetails(selectedGroup._id);
    } catch (err) {
      setToast({ message: "Failed to share note", type: "error" });
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setToast({ message: "Code copied!", type: "success" });
  };

  return (
    <div className="study-groups-container">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className="groups-header">
        <h3>📚 Study Groups</h3>
        <div className="groups-actions">
          <button onClick={() => setShowCreateModal(true)} className="btn-primary-sm">
            <FaPlus /> Create
          </button>
          <button onClick={() => setShowJoinModal(true)} className="btn-secondary-sm">
            <FaUsers /> Join
          </button>
        </div>
      </div>

      <div className="groups-layout">
        {/* Groups List */}
        <div className="groups-list">
          {groups.length === 0 ? (
            <div className="empty-groups">
              <p>No groups yet. Create or join one!</p>
            </div>
          ) : (
            groups.map(group => (
              <div 
                key={group._id} 
                className={`group-item ${selectedGroup?._id === group._id ? 'active' : ''}`} 
                onClick={() => fetchGroupDetails(group._id)}
              >
                <div className="group-icon"><FaUsers /></div>
                <div className="group-info">
                  <div className="group-name">{group.name}</div>
                  <div className="group-code" onClick={(e) => { e.stopPropagation(); copyCode(group.code); }}>
                    Code: {group.code} <FaCopy />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Group Details */}
        {selectedGroup ? (
          <div className="group-details">
            <div className="group-details-header">
              <h4>{selectedGroup.name}</h4>
              <p>{selectedGroup.description}</p>
              <div className="group-stats">
                <span>👥 {selectedGroup.members?.length || 0} members</span>
              </div>
            </div>

            {/* Chat Section */}
            <div className="group-chat">
              <h5>💬 Group Chat</h5>
              <div className="chat-messages">
                {messages.length === 0 ? (
                  <div className="no-messages">No messages yet. Start the conversation!</div>
                ) : (
                  messages.map((msg, idx) => (
                    <div key={idx} className="chat-message">
                      <strong>{msg.userName}:</strong> {msg.message}
                      <small>{new Date(msg.createdAt).toLocaleTimeString()}</small>
                    </div>
                  ))
                )}
              </div>
              <div className="chat-input">
                <input 
                  type="text" 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  placeholder="Type a message..." 
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()} 
                />
                <button onClick={sendMessage}>Send</button>
              </div>
            </div>

            {/* Share Note Section */}
            <div className="share-note">
              <h5><FaShare /> Share a Note</h5>
              <input 
                type="text" 
                placeholder="Title" 
                value={shareTitle} 
                onChange={(e) => setShareTitle(e.target.value)} 
              />
              <textarea 
                placeholder="Content" 
                value={shareContent} 
                onChange={(e) => setShareContent(e.target.value)} 
                rows={3} 
              />
              <button onClick={shareNote}>Share Note</button>
            </div>

            {/* Shared Notes */}
            <div className="shared-notes">
              <h5>📖 Shared Notes</h5>
              {selectedGroup.notes?.length === 0 ? (
                <p className="text-muted">No notes shared yet</p>
              ) : (
                selectedGroup.notes?.map((note, idx) => (
                  <div key={idx} className="shared-note">
                    <div className="note-title">{note.title}</div>
                    <div className="note-content-preview">{note.content?.substring(0, 100)}...</div>
                    <div className="note-meta">Shared by {note.createdBy?.name}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="no-group-selected">Select a group to start collaborating</div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Create Study Group</h4>
            <input 
              type="text" 
              placeholder="Group Name" 
              value={groupName} 
              onChange={(e) => setGroupName(e.target.value)} 
            />
            <textarea 
              placeholder="Description (optional)" 
              value={groupDesc} 
              onChange={(e) => setGroupDesc(e.target.value)} 
              rows={3} 
            />
            <div className="modal-actions">
              <button onClick={createGroup} disabled={loading}>Create</button>
              <button onClick={() => setShowCreateModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Join Study Group</h4>
            <input 
              type="text" 
              placeholder="Enter Group Code" 
              value={joinCode} 
              onChange={(e) => setJoinCode(e.target.value)} 
            />
            <div className="modal-actions">
              <button onClick={joinGroup} disabled={loading}>Join</button>
              <button onClick={() => setShowJoinModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .study-groups-container { 
          padding: 20px; 
          background: linear-gradient(145deg, #ebf1f4ff, #bedaf3ff); 
          border-radius: 20px; 
          margin-top: 20px; 
        }
        .groups-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin-bottom: 20px; 
          flex-wrap: wrap; 
          gap: 12px; 
        }
        .groups-actions { display: flex; gap: 10px; }
        .btn-primary-sm { 
          background: linear-gradient(135deg, #4f46e5, #6366f1); 
          color: white; border: none; 
          padding: 8px 16px; 
          border-radius: 10px; 
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          gap: 6px; 
        }
        .btn-secondary-sm { 
          background: #22c55e; 
          color: white; 
          border: none; 
          padding: 8px 16px; 
          border-radius: 10px; 
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          gap: 6px; 
        }
        .groups-layout { 
          display: grid; 
          grid-template-columns: 280px 1fr; 
          gap: 20px; 
          min-height: 500px; 
        }
        .groups-list { 
          background: rgba(255,255,255,0.5); 
          border-radius: 16px; 
          padding: 12px; 
          max-height: 500px; 
          overflow-y: auto; 
        }
        .group-item { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          padding: 12px; 
          border-radius: 12px; 
          cursor: pointer; 
          transition: all 0.2s; 
          margin-bottom: 8px; 
          background: white; 
        }
        .group-item:hover, .group-item.active { 
          background: linear-gradient(135deg, #4f46e5, #6366f1); 
          color: white; 
        }
        .group-code { 
          font-size: 11px; 
          opacity: 0.7; 
          cursor: pointer; 
          display: flex; 
          align-items: center; 
          gap: 4px; 
        }
        .group-details { background: white; border-radius: 16px; padding: 20px; }
        .group-details-header { margin-bottom: 15px; }
        .group-stats { font-size: 12px; color: #6b7280; margin-top: 5px; }
        .group-chat { margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px; }
        .chat-messages { max-height: 200px; overflow-y: auto; margin-bottom: 12px; }
        .chat-message { 
          padding: 8px; 
          background: #f8f9fa; 
          border-radius: 8px; 
          margin-bottom: 6px; 
          display: flex; 
          justify-content: space-between; 
          flex-wrap: wrap; 
        }
        .no-messages { text-align: center; padding: 20px; color: #9ca3af; }
        .chat-input { display: flex; gap: 8px; }
        .chat-input input { flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 12px; }
        .chat-input button { padding: 8px 20px; background: #4f46e5; color: white; border: none; border-radius: 12px; cursor: pointer; }
        .share-note { margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 16px; }
        .share-note input, .share-note textarea { width: 100%; margin-bottom: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 8px; }
        .share-note button { background: #22c55e; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
        .shared-notes { margin-top: 20px; }
        .shared-note { padding: 12px; background: #f8f9fa; border-radius: 12px; margin-bottom: 10px; }
        .note-title { font-weight: 600; margin-bottom: 5px; }
        .note-content-preview { font-size: 12px; color: #6b7280; }
        .note-meta { font-size: 10px; color: #9ca3af; margin-top: 5px; }
        .no-group-selected { 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          background: white; 
          border-radius: 16px; 
          color: #6b7280; 
        }
        .modal-overlay { 
          position: fixed; 
          top: 0; left: 0; right: 0; bottom: 0; 
          background: rgba(0,0,0,0.5); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          z-index: 1000; 
        }
        .modal-content { 
          background: white; 
          padding: 24px; 
          border-radius: 20px; 
          width: 90%; 
          max-width: 400px; 
        }
        .modal-content input, .modal-content textarea { 
          width: 100%; 
          margin: 10px 0; 
          padding: 10px; 
          border: 1px solid #ddd; 
          border-radius: 8px; 
        }
        .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 15px; }
        
        @media (max-width: 768px) { 
          .groups-layout { grid-template-columns: 1fr; } 
          .groups-header { flex-direction: column; }
          .groups-header h3 { text-align: center; }
          .groups-actions { width: 100%; justify-content: center; }
        }
      `}</style>
    </div>
  );
}