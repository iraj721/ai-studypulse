import React, { useState, useEffect, useRef } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import Stars from "../../components/Stars";
import BackButton from "../../components/BackButton";
import Toast from "../../components/Toast";
import { FaPlus, FaUsers, FaShare, FaCopy, FaComments, FaStickyNote } from "react-icons/fa";

export default function StudyGroupsPage() {
  const navigate = useNavigate();
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
  const [activeTab, setActiveTab] = useState("chat");
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchGroups();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

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

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(import.meta.env.VITE_API_URL, {
        transports: ['websocket'],
        reconnection: true
      });
    }
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
      setMessages(prev => [...prev, { userName: "You", message, createdAt: new Date() }]);
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
    <div className="groups-page min-vh-100 py-5 position-relative">
      <Stars />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      <div className="container">
        <BackButton to="/dashboard" label="← Back to Dashboard" />

        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <h2 className="text-white fw-bold">👥 Study Groups</h2>
          <div className="groups-actions">
            <button onClick={() => setShowCreateModal(true)} className="btn-create">
              <FaPlus /> Create Group
            </button>
            <button onClick={() => setShowJoinModal(true)} className="btn-join">
              <FaUsers /> Join Group
            </button>
          </div>
        </div>

        <div className="groups-layout">
          {/* Sidebar - Groups List */}
          <div className="groups-sidebar">
            <h5>My Groups ({groups.length})</h5>
            <div className="groups-list">
              {groups.length === 0 ? (
                <div className="empty-groups">No groups yet. Create or join one!</div>
              ) : (
                groups.map(group => (
                  <div key={group._id} className={`group-item ${selectedGroup?._id === group._id ? 'active' : ''}`} onClick={() => fetchGroupDetails(group._id)}>
                    <div className="group-avatar"><FaUsers /></div>
                    <div className="group-details">
                      <div className="group-name">{group.name}</div>
                      <div className="group-code" onClick={(e) => { e.stopPropagation(); copyCode(group.code); }}>Code: {group.code} <FaCopy /></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="groups-main">
            {selectedGroup ? (
              <>
                <div className="group-header">
                  <div>
                    <h3>{selectedGroup.name}</h3>
                    <p>{selectedGroup.description}</p>
                    <span className="member-count">👥 {selectedGroup.members?.length || 0} members</span>
                  </div>
                </div>

                <div className="group-tabs">
                  <button className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
                    <FaComments /> Chat
                  </button>
                  <button className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>
                    <FaStickyNote /> Shared Notes
                  </button>
                </div>

                {activeTab === 'chat' && (
                  <div className="chat-container">
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
                      <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." onKeyPress={(e) => e.key === 'Enter' && sendMessage()} />
                      <button onClick={sendMessage}>Send</button>
                    </div>
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div className="notes-container">
                    <div className="share-note-box">
                      <h5><FaShare /> Share a Note</h5>
                      <input type="text" placeholder="Title" value={shareTitle} onChange={(e) => setShareTitle(e.target.value)} />
                      <textarea placeholder="Content" value={shareContent} onChange={(e) => setShareContent(e.target.value)} rows={3} />
                      <button onClick={shareNote}>Share Note</button>
                    </div>
                    <div className="shared-notes-list">
                      <h5>📖 Shared Notes</h5>
                      {selectedGroup.notes?.length === 0 ? (
                        <p className="text-muted">No notes shared yet</p>
                      ) : (
                        selectedGroup.notes?.map((note, idx) => (
                          <div key={idx} className="shared-note">
                            <div className="note-title">{note.title}</div>
                            <div className="note-content">{note.content?.substring(0, 150)}...</div>
                            <div className="note-meta">Shared by {note.createdBy?.name}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="no-group-selected">Select a group to start collaborating</div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Create Study Group</h4>
            <input type="text" placeholder="Group Name" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
            <textarea placeholder="Description (optional)" value={groupDesc} onChange={(e) => setGroupDesc(e.target.value)} rows={3} />
            <div className="modal-actions">
              <button onClick={createGroup} disabled={loading}>Create</button>
              <button onClick={() => setShowCreateModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>Join Study Group</h4>
            <input type="text" placeholder="Enter Group Code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
            <div className="modal-actions">
              <button onClick={joinGroup} disabled={loading}>Join</button>
              <button onClick={() => setShowJoinModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .groups-page {
          background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #1a2a3d 100%);
        }
        .groups-actions { display: flex; gap: 12px; }
        .btn-create { background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; border: none; padding: 10px 20px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        .btn-join { background: #22c55e; color: white; border: none; padding: 10px 20px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        .groups-layout { display: grid; grid-template-columns: 300px 1fr; gap: 20px; }
        .groups-sidebar { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 20px; padding: 20px; color: white; }
        .groups-sidebar h5 { margin-bottom: 15px; }
        .groups-list { max-height: 500px; overflow-y: auto; }
        .group-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.1); border-radius: 12px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s; }
        .group-item:hover, .group-item.active { background: linear-gradient(135deg, #4f46e5, #6366f1); }
        .group-avatar { font-size: 24px; }
        .group-name { font-weight: 600; }
        .group-code { font-size: 10px; opacity: 0.7; cursor: pointer; display: flex; align-items: center; gap: 4px; margin-top: 4px; }
        .groups-main { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 20px; padding: 20px; color: white; }
        .group-header { margin-bottom: 20px; }
        .member-count { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-top: 8px; }
        .group-tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 10px; }
        .tab-btn { background: none; border: none; color: white; padding: 8px 16px; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s; }
        .tab-btn.active { background: rgba(255,255,255,0.2); border-radius: 10px; }
        .chat-container { height: 400px; display: flex; flex-direction: column; }
        .chat-messages { flex: 1; overflow-y: auto; margin-bottom: 15px; }
        .chat-message { background: rgba(255,255,255,0.1); padding: 10px; border-radius: 12px; margin-bottom: 8px; display: flex; justify-content: space-between; flex-wrap: wrap; }
        .chat-message small { font-size: 10px; opacity: 0.6; }
        .no-messages { text-align: center; padding: 40px; opacity: 0.6; }
        .chat-input { display: flex; gap: 10px; }
        .chat-input input { flex: 1; padding: 12px; border: none; border-radius: 12px; }
        .chat-input button { background: #4f46e5; color: white; border: none; padding: 12px 24px; border-radius: 12px; cursor: pointer; }
        .share-note-box { background: rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; margin-bottom: 20px; }
        .share-note-box input, .share-note-box textarea { width: 100%; margin-bottom: 10px; padding: 10px; border: none; border-radius: 8px; }
        .share-note-box button { background: #22c55e; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; }
        .shared-notes-list { max-height: 300px; overflow-y: auto; }
        .shared-note { background: rgba(255,255,255,0.1); border-radius: 12px; padding: 12px; margin-bottom: 10px; }
        .note-title { font-weight: 600; margin-bottom: 5px; }
        .note-content { font-size: 12px; opacity: 0.8; }
        .note-meta { font-size: 10px; opacity: 0.6; margin-top: 8px; }
        .no-group-selected { display: flex; align-items: center; justify-content: center; height: 400px; opacity: 0.6; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: white; padding: 24px; border-radius: 20px; width: 90%; max-width: 400px; color: black; }
        .modal-content input, .modal-content textarea { width: 100%; margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 8px; }
        .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 15px; }
        @media (max-width: 768px) { .groups-layout { grid-template-columns: 1fr; } .groups-actions { width: 100%; justify-content: center; } .btn-create, .btn-join { flex: 1; justify-content: center; } }
      `}</style>
    </div>
  );
}