import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../../services/api";
import Stars from "../../components/Stars";
import BackButton from "../../components/BackButton";
import Toast from "../../components/Toast";
import {
  FaPlus,
  FaUsers,
  FaShare,
  FaCopy,
  FaComments,
  FaStickyNote,
  FaFileAlt,
  FaVideo,
  FaLightbulb,
  FaPaperPlane,
  FaTrash,
  FaUserPlus,
  FaIdCard,
  FaFilePdf,
  FaEye,
} from "react-icons/fa";

export default function StudyGroupsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("chat");
  const [sharedContent, setSharedContent] = useState([]);
  const [notes, setNotes] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [videos, setVideos] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareType, setShareType] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [sharingLoading, setSharingLoading] = useState(false);
  const [deleteMenuOpen, setDeleteMenuOpen] = useState(null);
  const [showContentModal, setShowContentModal] = useState(false);
  const [viewingContent, setViewingContent] = useState(null);
  const [showFileShareModal, setShowFileShareModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [insights, setInsights] = useState([]);
  const [flashcardGroups, setFlashcardGroups] = useState([]);
  const [sendingMessage, setSendingMessage] = useState(false);

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchUser();
    fetchGroups();
    fetchUserContent();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (selectedGroup && socketRef.current) {
      socketRef.current.emit("joinGroupRoom", selectedGroup._id);

      socketRef.current.on("newGroupMessage", (data) => {
        console.log("New message received:", data);
        setMessages((prev) => {
          // Remove temp message if exists, then add real one
          const filtered = prev.filter(
            (msg) => msg._id !== data._id && !msg.isTemp,
          );
          return [...filtered, data];
        });
        setTimeout(scrollToBottom, 100);
      });

      socketRef.current.on(
        "messageDeleted",
        ({ messageId, deleteForEveryone }) => {
          setMessages((prev) => {
            if (deleteForEveryone) {
              return prev.filter((msg) => msg._id !== messageId);
            } else {
              return prev.map((msg) => {
                if (msg._id === messageId) {
                  return {
                    ...msg,
                    message: "You deleted this message",
                    deleted: true,
                  };
                }
                return msg;
              });
            }
          });
        },
      );

      socketRef.current.on("contentDeleted", ({ contentId }) => {
        setSharedContent((prev) => prev.filter((c) => c._id !== contentId));
      });
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off("newGroupMessage");
        socketRef.current.off("messageDeleted");
        socketRef.current.off("contentDeleted");
      }
    };
  }, [selectedGroup]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch (err) {
      navigate("/login");
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await api.get("/student/groups");
      setGroups(res.data);
    } catch (err) {
      setToast({ message: "Failed to load groups", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupDetails = async (groupId) => {
    try {
      const res = await api.get(`/student/groups/${groupId}`);
      setSelectedGroup(res.data);
      setMessages(res.data.messages || []);

      const contentRes = await api.get(
        `/student/groups/${groupId}/shared-content`,
      );
      setSharedContent(contentRes.data || []);
    } catch (err) {
      setToast({ message: "Failed to load group details", type: "error" });
    }
  };

  const fetchUserContent = async () => {
    try {
      const [notesRes, quizzesRes, videosRes, flashcardGroupsRes, insightsRes] =
        await Promise.all([
          api.get("/notes").catch(() => ({ data: [] })),
          api.get("/quizzes").catch(() => ({ data: [] })),
          api.get("/student/video/summaries").catch(() => ({ data: [] })),
          api.get("/student/flashcard-groups").catch(() => ({ data: [] })),
          api.get("/student/insights").catch(() => ({ data: [] })),
        ]);

      setNotes(notesRes.data || []);
      setQuizzes(quizzesRes.data || []);
      setVideos(videosRes.data || []);
      setFlashcardGroups(flashcardGroupsRes.data || []);
      setInsights(insightsRes.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  const initSocket = () => {
    if (!socketRef.current) {
      const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      console.log("Initializing socket connection to:", socketUrl);

      socketRef.current = io(socketUrl, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      socketRef.current.on("connect", () => {
        console.log("Socket connected successfully, ID:", socketRef.current.id);
        // Re-join group if already selected
        if (selectedGroup && selectedGroup._id) {
          socketRef.current.emit("joinGroupRoom", selectedGroup._id);
          console.log("Re-joined group room:", selectedGroup._id);
        }
      });

      socketRef.current.on("connect_error", (error) => {
        console.log("Socket connection error:", error);
      });

      socketRef.current.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
      });

      socketRef.current.on("reconnect", (attemptNumber) => {
        console.log("Socket reconnected after", attemptNumber, "attempts");
        // Re-join group after reconnection
        if (selectedGroup && selectedGroup._id) {
          socketRef.current.emit("joinGroupRoom", selectedGroup._id);
        }
      });
    }
    return socketRef.current;
  };

  const createGroup = async () => {
    if (!groupName.trim()) return;
    setLoading(true);
    try {
      const res = await api.post("/student/groups/create", {
        name: groupName,
        description: groupDesc,
      });
      setToast({
        message: `Group created! Code: ${res.data.code}`,
        type: "success",
      });
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
      setToast({
        message: err.response?.data?.message || "Failed to join",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !selectedGroup || sendingMessage) return;

    setSendingMessage(true);
    const messageContent = messageText;
    setMessageText("");

    // Optimistically add message to UI
    const tempId = Date.now();
    const tempMessage = {
      _id: tempId,
      user: user._id,
      userName: user.name,
      message: messageContent,
      type: "text",
      deleted: false,
      createdAt: new Date(),
      isTemp: true,
    };
    setMessages((prev) => [...prev, tempMessage]);
    scrollToBottom();

    try {
      const response = await api.post(
        `/student/groups/${selectedGroup._id}/messages`,
        {
          message: messageContent,
          type: "text",
        },
      );

      // Replace temp message with real one
      setMessages((prev) =>
        prev.map((msg) => (msg._id === tempId ? response.data.data : msg)),
      );

      // Also emit via socket for immediate delivery to other clients (redundant but safe)
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("newGroupMessage", response.data.data);
      }
    } catch (err) {
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
      setToast({ message: "Failed to send message", type: "error" });
      setMessageText(messageContent);
    } finally {
      setSendingMessage(false);
    }
  };

  const deleteMessage = async (messageId, deleteForEveryone = false) => {
    try {
      await api.delete(
        `/student/groups/${selectedGroup._id}/messages/${messageId}`,
        {
          data: { deleteForEveryone },
        },
      );
      if (deleteForEveryone) {
        setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
      } else {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg._id === messageId) {
              return {
                ...msg,
                message: "You deleted this message",
                deleted: true,
              };
            }
            return msg;
          }),
        );
      }
      setToast({
        message: deleteForEveryone
          ? "Message deleted for everyone"
          : "Message deleted",
        type: "success",
      });
      setDeleteMenuOpen(null);
    } catch (err) {
      setToast({ message: "Failed to delete message", type: "error" });
    }
  };

  const deleteSharedContent = async (contentId) => {
    try {
      await api.delete(
        `/student/groups/${selectedGroup._id}/shared-content/${contentId}`,
      );
      setToast({ message: "Content deleted successfully", type: "success" });
      setSharedContent((prev) => prev.filter((c) => c._id !== contentId));
    } catch (err) {
      setToast({ message: "Failed to delete content", type: "error" });
    }
  };

  const shareContent = async () => {
    if (!selectedItemId) {
      setToast({ message: "Please select an item to share", type: "error" });
      return;
    }

    setSharingLoading(true);
    let endpoint = "";
    let payload = {};

    if (shareType === "note") {
      endpoint = `/student/groups/${selectedGroup._id}/share-note`;
      payload = { noteId: selectedItemId };
    } else if (shareType === "quiz") {
      endpoint = `/student/groups/${selectedGroup._id}/share-quiz`;
      payload = { quizId: selectedItemId };
    } else if (shareType === "youtube") {
      endpoint = `/student/groups/${selectedGroup._id}/share-youtube`;
      payload = { videoId: selectedItemId };
    } else if (shareType === "insight") {
      endpoint = `/student/groups/${selectedGroup._id}/share-insight`;
      payload = { insightId: selectedItemId };
    } else if (shareType === "flashcard") {
      endpoint = `/student/groups/${selectedGroup._id}/share-flashcard-group`;
      payload = { noteId: selectedItemId };
    }

    try {
      await api.post(endpoint, payload);
      setToast({
        message: `${shareType?.toUpperCase()} shared successfully!`,
        type: "success",
      });
      setShowShareModal(false);
      setSelectedItemId("");
      setShareType(null);
      await fetchGroupDetails(selectedGroup._id);
    } catch (err) {
      console.error("Share error:", err);
      setToast({
        message: err.response?.data?.message || `Failed to share ${shareType}`,
        type: "error",
      });
    } finally {
      setSharingLoading(false);
    }
  };

  const shareFile = async () => {
    if (!selectedFile) {
      setToast({ message: "Please select a file", type: "error" });
      return;
    }

    setUploadingFile(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await api.post(
        `/student/groups/${selectedGroup._id}/share-file`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      setToast({ message: "File shared successfully!", type: "success" });
      setShowFileShareModal(false);
      setSelectedFile(null);
      await fetchGroupDetails(selectedGroup._id);
    } catch (err) {
      console.error("File share error:", err);
      setToast({ message: "Failed to share file", type: "error" });
    } finally {
      setUploadingFile(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setToast({ message: "Code copied!", type: "success" });
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const canDeleteForEveryone = (message) => {
    if (!selectedGroup || !user) return false;
    const isOwner = message.user?._id === user._id || message.user === user._id;
    const isGroupCreator =
      selectedGroup.createdBy?._id === user._id ||
      selectedGroup.createdBy === user._id;
    return isOwner || isGroupCreator;
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const openSharedContent = async (item) => {
    if (item.type === "note") {
      setViewingContent({
        type: "note",
        title: item.title,
        content: item.metadata?.fullContent || item.content,
        subject: item.metadata?.subject,
        topic: item.metadata?.topic,
        sharedBy: item.sharedByName,
        sharedAt: item.sharedAt,
      });
      setShowContentModal(true);
    } else if (item.type === "quiz") {
      setViewingContent({
        type: "quiz",
        title: item.title,
        content: {
          topic: item.metadata?.topic,
          questions: item.metadata?.questions || [],
          description: item.metadata?.description,
        },
        sharedBy: item.sharedByName,
        sharedAt: item.sharedAt,
      });
      setShowContentModal(true);
    } else if (item.type === "flashcard") {
      setViewingContent({
        type: "flashcard",
        title: item.title,
        flashcards: item.metadata?.flashcards || [],
        flashcardCount: item.metadata?.flashcardCount || 0,
        noteTopic: item.metadata?.noteTopic,
        sharedBy: item.sharedByName,
        sharedAt: item.sharedAt,
      });
      setShowContentModal(true);
    } else if (item.type === "youtube") {
      setViewingContent({
        type: "youtube",
        title: item.title,
        content: item.metadata?.summary || item.content,
        sharedBy: item.sharedByName,
        sharedAt: item.sharedAt,
      });
      setShowContentModal(true);
    } else if (item.type === "insight") {
      setViewingContent({
        type: "insight",
        title: item.title,
        content:
          item.metadata?.fullContent || item.content || "No content available",
        sharedBy: item.sharedByName,
        sharedAt: item.sharedAt,
      });
      setShowContentModal(true);
    } else if (item.type === "file") {
      const fileUrl = item.metadata?.fileUrl || item.link;
      const fileName = item.metadata?.fileName || item.title;
      const fileType = item.metadata?.fileType || "";
      setViewingContent({
        type: "file",
        title: fileName,
        fileUrl: fileUrl,
        fileName: fileName,
        fileType: fileType,
        sharedBy: item.sharedByName,
        sharedAt: item.sharedAt,
      });
      setShowContentModal(true);
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <div className="groups-page min-vh-100 py-5 position-relative">
      <Stars />
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      <div className="container">
        <BackButton to="/dashboard" label="← Back to Dashboard" />

        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <h2 className="text-white fw-bold">👥 Study Groups</h2>
          <div className="groups-actions">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-create"
            >
              <FaPlus /> Create Group
            </button>
            <button onClick={() => setShowJoinModal(true)} className="btn-join">
              <FaUserPlus /> Join Group
            </button>
          </div>
        </div>

        <div className="groups-layout">
          <div className="groups-sidebar">
            <h5>My Groups ({groups.length})</h5>
            <div className="groups-list">
              {groups.length === 0 ? (
                <div className="empty-groups">
                  No groups yet. Create or join one!
                </div>
              ) : (
                groups.map((group) => (
                  <div
                    key={group._id}
                    className={`group-item ${selectedGroup?._id === group._id ? "active" : ""}`}
                    onClick={() => {
                      fetchGroupDetails(group._id);
                      initSocket();
                    }}
                  >
                    <div className="group-avatar">
                      <FaUsers />
                    </div>
                    <div className="group-details">
                      <div className="group-name">{group.name}</div>
                      <div
                        className="group-code"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyCode(group.code);
                        }}
                      >
                        Code: {group.code} <FaCopy />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="groups-main">
            {selectedGroup ? (
              <>
                <div className="group-header">
                  <div>
                    <h3>{selectedGroup.name}</h3>
                    <p>{selectedGroup.description}</p>
                    <span className="member-count">
                      👥 {selectedGroup.members?.length || 0} members
                    </span>
                  </div>
                  <div className="share-buttons">
                    <button
                      onClick={() => {
                        setShareType("note");
                        setShowShareModal(true);
                      }}
                      className="share-btn note"
                    >
                      <FaStickyNote /> Note
                    </button>
                    <button
                      onClick={() => {
                        setShareType("quiz");
                        setShowShareModal(true);
                      }}
                      className="share-btn quiz"
                    >
                      <FaFileAlt /> Quiz
                    </button>
                    <button
                      onClick={() => {
                        setShareType("youtube");
                        setShowShareModal(true);
                      }}
                      className="share-btn video"
                    >
                      <FaVideo /> Video
                    </button>
                    <button
                      onClick={() => {
                        setShareType("insight");
                        setShowShareModal(true);
                      }}
                      className="share-btn insight"
                    >
                      <FaLightbulb /> Insight
                    </button>
                    <button
                      onClick={() => {
                        setShareType("flashcard");
                        setShowShareModal(true);
                      }}
                      className="share-btn flashcard"
                    >
                      <FaIdCard /> Flashcard
                    </button>
                    <button
                      onClick={() => setShowFileShareModal(true)}
                      className="share-btn file"
                    >
                      <FaFilePdf /> File
                    </button>
                  </div>
                </div>

                <div className="group-tabs">
                  <button
                    className={`tab-btn ${activeTab === "chat" ? "active" : ""}`}
                    onClick={() => setActiveTab("chat")}
                  >
                    <FaComments /> Chat ({messages.length})
                  </button>
                  <button
                    className={`tab-btn ${activeTab === "shared" ? "active" : ""}`}
                    onClick={() => setActiveTab("shared")}
                  >
                    <FaShare /> Shared Content ({sharedContent.length})
                  </button>
                </div>

                {activeTab === "chat" && (
                  <div className="chat-container">
                    <div className="chat-messages">
                      {messages.length === 0 ? (
                        <div className="no-messages">
                          No messages yet. Start the conversation!
                        </div>
                      ) : (
                        messages.map((msg) => {
                          const isOwnMessage =
                            msg.user?._id === user._id || msg.user === user._id;
                          const isDeleted = msg.deleted === true;
                          const isTemp = msg.isTemp === true;
                          return (
                            <div
                              key={msg._id}
                              className={`message-row ${isOwnMessage ? "own" : "other"}`}
                            >
                              {!isOwnMessage && !isDeleted && (
                                <div className="message-sender-name">
                                  {msg.userName}
                                </div>
                              )}
                              <div
                                className={`message-bubble ${isOwnMessage ? "own" : "other"} ${isDeleted ? "deleted" : ""} ${isTemp ? "temp" : ""}`}
                              >
                                <div className="message-text">
                                  {msg.type !== "text" && !isDeleted && (
                                    <span className="message-type-icon">
                                      {msg.type === "note" && "📓 "}
                                      {msg.type === "quiz" && "📝 "}
                                      {msg.type === "youtube" && "🎥 "}
                                      {msg.type === "insight" && "💡 "}
                                      {msg.type === "flashcard" && "🃏 "}
                                      {msg.type === "file" && "📄 "}
                                    </span>
                                  )}
                                  {msg.message}
                                  {isTemp && (
                                    <span className="sending-indicator">
                                      {" "}
                                      (sending...)
                                    </span>
                                  )}
                                </div>
                                <div className="message-footer">
                                  <span className="message-time">
                                    {formatTime(msg.createdAt)}
                                  </span>
                                  {!isDeleted &&
                                    !isTemp &&
                                    (isOwnMessage ||
                                      canDeleteForEveryone(msg)) && (
                                      <div className="message-delete-wrapper">
                                        <button
                                          className="message-delete-btn"
                                          onClick={() =>
                                            setDeleteMenuOpen(
                                              deleteMenuOpen === msg._id
                                                ? null
                                                : msg._id,
                                            )
                                          }
                                        >
                                          <FaTrash />
                                        </button>
                                        {deleteMenuOpen === msg._id && (
                                          <div className="delete-menu">
                                            <button
                                              onClick={() =>
                                                deleteMessage(msg._id, false)
                                              }
                                            >
                                              Delete for me
                                            </button>
                                            {canDeleteForEveryone(msg) && (
                                              <button
                                                onClick={() =>
                                                  deleteMessage(msg._id, true)
                                                }
                                              >
                                                Delete for everyone
                                              </button>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                    <div className="chat-input">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Type a message..."
                        onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        disabled={sendingMessage}
                      />
                      <button onClick={sendMessage} disabled={sendingMessage}>
                        <FaPaperPlane />{" "}
                        {sendingMessage ? "Sending..." : "Send"}
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === "shared" && (
                  <div className="shared-content-container">
                    {sharedContent.length === 0 ? (
                      <div className="no-content">
                        No shared content yet. Share something using the buttons
                        above!
                      </div>
                    ) : (
                      sharedContent.map((item) => {
                        const isOwner =
                          item.sharedBy?._id === user._id ||
                          item.sharedBy === user._id;
                        const isGroupCreator =
                          selectedGroup.createdBy?._id === user._id ||
                          selectedGroup.createdBy === user._id;
                        const canDelete = isOwner || isGroupCreator;
                        return (
                          <div key={item._id} className="shared-item">
                            <div className="shared-icon">
                              {item.type === "note" && "📓"}
                              {item.type === "quiz" && "📝"}
                              {item.type === "youtube" && "🎥"}
                              {item.type === "insight" && "💡"}
                              {item.type === "flashcard" && "🃏"}
                              {item.type === "file" && "📄"}
                            </div>
                            <div className="shared-info">
                              <div className="shared-title">{item.title}</div>
                              <div className="shared-content-preview">
                                {item.content}
                              </div>
                              <div className="shared-meta">
                                Shared by {item.sharedByName} •{" "}
                                {new Date(item.sharedAt).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="shared-actions">
                              <button
                                className="shared-view-btn"
                                onClick={() => openSharedContent(item)}
                              >
                                <FaEye /> View
                              </button>
                              {canDelete && (
                                <button
                                  className="shared-delete-btn"
                                  onClick={() => deleteSharedContent(item._id)}
                                >
                                  <FaTrash />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="no-group-selected">
                Select a group to start collaborating
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >
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
              <button onClick={createGroup} disabled={loading}>
                Create
              </button>
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
              <button onClick={joinGroup} disabled={loading}>
                Join
              </button>
              <button onClick={() => setShowJoinModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div
            className="modal-content share-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h4>Share {shareType?.toUpperCase()}</h4>
            <select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
            >
              <option value="">Select {shareType} to share...</option>
              {shareType === "note" &&
                notes.map((n) => (
                  <option key={n._id} value={n._id}>
                    {n.subject} - {n.topic}
                  </option>
                ))}
              {shareType === "quiz" &&
                quizzes.map((q) => (
                  <option key={q._id} value={q._id}>
                    {q.topic}
                  </option>
                ))}
              {shareType === "youtube" &&
                videos.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.title}
                  </option>
                ))}
              {shareType === "insight" && insights.length > 0
                ? insights.map((insight) => (
                    <option key={insight._id} value={insight._id}>
                      💡 {insight.title?.substring(0, 80)}...
                    </option>
                  ))
                : shareType === "insight" && (
                    <option disabled>No insights found</option>
                  )}
              {shareType === "flashcard" && flashcardGroups.length > 0
                ? flashcardGroups.map((group) => (
                    <option
                      key={group.noteId || group._id}
                      value={group.noteId}
                    >
                      📚 {group.noteSubject || "Note"} -{" "}
                      {group.noteTopic || "Flashcards"} ({group.flashcardCount}{" "}
                      cards)
                    </option>
                  ))
                : shareType === "flashcard" && (
                    <option disabled>No flashcard sets found</option>
                  )}
            </select>
            <div className="modal-actions">
              <button onClick={shareContent} disabled={sharingLoading}>
                {sharingLoading ? "Sharing..." : "Share"}
              </button>
              <button onClick={() => setShowShareModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* File Share Modal */}
      {showFileShareModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowFileShareModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h4>📄 Share File</h4>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              accept=".pdf,.doc,.docx,.txt,.jpg,.png"
            />
            <div className="modal-actions">
              <button onClick={shareFile} disabled={uploadingFile}>
                {uploadingFile ? "Uploading..." : "Share"}
              </button>
              <button onClick={() => setShowFileShareModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Content Modal */}
      {showContentModal && viewingContent && (
        <div
          className="modal-overlay"
          onClick={() => setShowContentModal(false)}
        >
          <div
            className="modal-content content-view-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h4>
              {viewingContent.type === "note" && "📓 "}
              {viewingContent.type === "quiz" && "📝 "}
              {viewingContent.type === "insight" && "💡 "}
              {viewingContent.type === "flashcard" && "🃏 "}
              {viewingContent.type === "youtube" && "🎥 "}
              {viewingContent.type === "file" && "📄 "}
              {viewingContent.title}
            </h4>
            <div className="content-meta">
              Shared by {viewingContent.sharedBy} •{" "}
              {new Date(viewingContent.sharedAt).toLocaleString()}
            </div>
            <div className="content-body">
              {viewingContent.type === "note" && (
                <div className="note-content">
                  <div className="note-subject">
                    <strong>Subject:</strong> {viewingContent.subject}
                  </div>
                  <div className="note-topic">
                    <strong>Topic:</strong> {viewingContent.topic}
                  </div>
                  <hr />
                  <div className="note-text">
                    <strong>Content:</strong>
                    <br />
                    {viewingContent.content}
                  </div>
                </div>
              )}
              {viewingContent.type === "quiz" && viewingContent.content && (
                <div className="quiz-content">
                  <p>
                    <strong>Topic:</strong>{" "}
                    {viewingContent.content.topic || viewingContent.title}
                  </p>
                  <p>
                    <strong>Description:</strong>{" "}
                    {viewingContent.content.description || "No description"}
                  </p>
                  <div className="quiz-questions">
                    <strong>
                      Questions ({viewingContent.content.questions?.length || 0}
                      )
                    </strong>
                    {viewingContent.content.questions?.map((q, idx) => (
                      <div key={idx} className="quiz-question">
                        <p>
                          <strong>
                            {idx + 1}. {q.question}
                          </strong>
                        </p>
                        <ul>
                          {q.options?.map((opt, optIdx) => (
                            <li
                              key={optIdx}
                              className={
                                opt === q.answer ? "correct-answer" : ""
                              }
                            >
                              {opt} {opt === q.answer && "✓"}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {viewingContent.type === "flashcard" && (
                <div className="flashcard-set-content">
                  <p>
                    <strong>Total Cards:</strong>{" "}
                    {viewingContent.flashcardCount}
                  </p>
                  <div className="flashcard-list">
                    {viewingContent.flashcards?.map((card, idx) => (
                      <div key={idx} className="flashcard-item">
                        <div className="flashcard-question">
                          <strong>Q{idx + 1}:</strong> {card.front}
                        </div>
                        <div className="flashcard-answer">
                          <strong>A:</strong> {card.back}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {viewingContent.type === "youtube" && (
                <div className="youtube-content">
                  <strong>🎥 Video Summary:</strong>
                  <div className="formatted-content">
                    {viewingContent.content?.split("\n").map(
                      (line, idx) =>
                        line.trim() && (
                          <p
                            key={idx}
                            className={
                              line.startsWith("•") ? "bullet-point" : ""
                            }
                          >
                            {line.startsWith("•") ? "•" : ""}{" "}
                            {line.replace(/^•\s*/, "")}
                          </p>
                        ),
                    )}
                  </div>
                </div>
              )}
              {viewingContent.type === "insight" && (
                <div className="insight-content">
                  <div className="insight-text">
                    <div className="formatted-content">
                      {viewingContent.content?.split("\n").map(
                        (line, idx) =>
                          line.trim() && (
                            <p
                              key={idx}
                              className={
                                line.startsWith("•")
                                  ? "bullet-point"
                                  : line.match(/^\d+\./)
                                    ? "numbered-point"
                                    : ""
                              }
                            >
                              {line}
                            </p>
                          ),
                      )}
                    </div>
                  </div>
                  <div className="insight-tip">
                    💡 AI-generated learning insight based on your activity
                  </div>
                </div>
              )}
              {viewingContent.type === "file" && (
                <div className="file-content">
                  <p>
                    <strong>File Name:</strong> {viewingContent.fileName}
                  </p>
                  <p>
                    <strong>Shared by:</strong> {viewingContent.sharedBy}
                  </p>
                  <div className="file-actions">
                    <button
                      className="download-btn"
                      onClick={() => {
                        const fullUrl = viewingContent.fileUrl.startsWith(
                          "http",
                        )
                          ? viewingContent.fileUrl
                          : `http://localhost:5000${viewingContent.fileUrl}`;
                        window.open(fullUrl, "_blank");
                      }}
                    >
                      📥 Download / View File
                    </button>
                  </div>
                  {viewingContent.fileType === "application/pdf" && (
                    <iframe
                      src={
                        viewingContent.fileUrl.startsWith("http")
                          ? viewingContent.fileUrl
                          : `http://localhost:5000${viewingContent.fileUrl}`
                      }
                      width="100%"
                      height="400px"
                      title="PDF Preview"
                      style={{
                        marginTop: "15px",
                        border: "none",
                        borderRadius: "8px",
                      }}
                    />
                  )}
                  {viewingContent.fileType?.includes("image") && (
                    <img
                      src={
                        viewingContent.fileUrl.startsWith("http")
                          ? viewingContent.fileUrl
                          : `http://localhost:5000${viewingContent.fileUrl}`
                      }
                      alt={viewingContent.fileName}
                      style={{
                        maxWidth: "100%",
                        marginTop: "15px",
                        borderRadius: "8px",
                      }}
                    />
                  )}
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowContentModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .groups-page { background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #1a2a3d 100%); min-height: 100vh; }
        .groups-actions { display: flex; gap: 12px; }
        .btn-create, .btn-join { padding: 10px 20px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; border: none; }
        .btn-create { background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; }
        .btn-join { background: #22c55e; color: white; }
        .groups-layout { display: grid; grid-template-columns: 300px 1fr; gap: 20px; min-height: 500px; }
        .groups-sidebar { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 20px; padding: 20px; color: white; }
        .groups-list { max-height: 500px; overflow-y: auto; }
        .group-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255,255,255,0.1); border-radius: 12px; margin-bottom: 8px; cursor: pointer; transition: all 0.2s; }
        .group-item:hover, .group-item.active { background: linear-gradient(135deg, #4f46e5, #6366f1); }
        .group-name { font-weight: 600; }
        .group-code { font-size: 10px; opacity: 0.7; cursor: pointer; display: flex; align-items: center; gap: 4px; margin-top: 4px; }
        .groups-main { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 20px; padding: 20px; color: white; }
        .group-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 15px; }
        .member-count { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-top: 8px; }
        .share-buttons { display: flex; gap: 8px; flex-wrap: wrap; }
        .share-btn { padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 6px; border: none; font-weight: 500; transition: all 0.2s; }
        .share-btn.note { background: #3b82f6; color: white; }
        .share-btn.quiz { background: #10b981; color: white; }
        .share-btn.video { background: #ef4444; color: white; }
        .share-btn.insight { background: #8b5cf6; color: white; }
        .share-btn.flashcard { background: #f59e0b; color: white; }
        .share-btn.file { background: #6b7280; color: white; }
        .share-btn:hover { transform: translateY(-2px); opacity: 0.9; }
        .group-tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 10px; }
        .tab-btn { background: none; border: none; color: white; padding: 8px 20px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; border-radius: 10px; font-size: 14px; }
        .tab-btn.active { background: rgba(255,255,255,0.2); }
        .tab-btn:hover { background: rgba(255,255,255,0.1); }
        .chat-container { display: flex; flex-direction: column; height: 450px; }
        .chat-messages { flex: 1; overflow-y: auto; padding: 15px; display: flex; flex-direction: column; gap: 12px; }
        .message-row { display: flex; flex-direction: column; margin-bottom: 8px; animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .message-row.own { align-items: flex-end; }
        .message-row.other { align-items: flex-start; }
        .message-sender-name { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.7); margin-bottom: 4px; margin-left: 12px; }
        .message-bubble { max-width: 70%; padding: 10px 14px; border-radius: 18px; position: relative; word-wrap: break-word; transition: all 0.2s; }
        .message-bubble.own { background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; border-bottom-right-radius: 4px; }
        .message-bubble.other { background: rgba(255,255,255,0.15); color: white; border-bottom-left-radius: 4px; }
        .message-bubble.deleted { opacity: 0.6; font-style: italic; background: rgba(255,255,255,0.08); }
        .message-bubble.temp { opacity: 0.7; }
        .message-text { font-size: 14px; line-height: 1.4; }
        .message-type-icon { font-weight: bold; margin-right: 4px; }
        .sending-indicator { font-size: 10px; opacity: 0.6; margin-left: 6px; }
        .message-footer { display: flex; justify-content: flex-end; align-items: center; gap: 8px; margin-top: 4px; }
        .message-time { font-size: 10px; opacity: 0.6; }
        .message-delete-wrapper { position: relative; display: inline-flex; }
        .message-delete-btn { background: none; border: none; color: rgba(255,255,255,0.4); cursor: pointer; padding: 2px 6px; border-radius: 4px; font-size: 10px; transition: all 0.2s; }
        .message-delete-btn:hover { color: #ef4444; background: rgba(0,0,0,0.1); }
        .delete-menu { position: absolute; bottom: 100%; right: 0; background: #1e1e2e; color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.3); z-index: 10; margin-bottom: 5px; min-width: 140px; }
        .delete-menu button { display: block; width: 100%; padding: 10px 14px; border: none; background: #2a2a3e; color: white; text-align: left; cursor: pointer; font-size: 12px; transition: all 0.2s; }
        .delete-menu button:hover { background: #ef4444; }
        .chat-input { display: flex; gap: 10px; margin-top: 10px; }
        .chat-input input { flex: 1; padding: 12px 18px; border: none; border-radius: 24px; background: rgba(255,255,255,0.15); color: white; outline: none; font-size: 14px; }
        .chat-input input:disabled { opacity: 0.6; cursor: not-allowed; }
        .chat-input input::placeholder { color: rgba(255,255,255,0.6); }
        .chat-input button { padding: 12px 24px; background: linear-gradient(135deg, #4f46e5, #6366f1); border: none; border-radius: 24px; color: white; cursor: pointer; display: flex; align-items: center; gap: 8px; font-weight: 600; transition: all 0.2s; }
        .chat-input button:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .shared-content-container { max-height: 450px; overflow-y: auto; }
        .shared-item { display: flex; align-items: center; gap: 15px; padding: 15px; background: rgba(255,255,255,0.08); border-radius: 12px; margin-bottom: 10px; transition: all 0.2s; }
        .shared-item:hover { background: rgba(255,255,255,0.12); }
        .shared-icon { font-size: 32px; min-width: 50px; text-align: center; }
        .shared-info { flex: 1; }
        .shared-title { font-weight: 600; margin-bottom: 5px; font-size: 14px; }
        .shared-content-preview { font-size: 12px; opacity: 0.7; margin-bottom: 5px; }
        .shared-meta { font-size: 10px; opacity: 0.5; }
        .shared-actions { display: flex; gap: 8px; align-items: center; }
        .shared-view-btn, .download-btn { padding: 8px 16px; background: linear-gradient(135deg, #4f46e5, #6366f1); border-radius: 8px; color: white; font-size: 12px; font-weight: 500; cursor: pointer; border: none; transition: all 0.2s; display: flex; align-items: center; gap: 5px; }
        .shared-view-btn:hover, .download-btn:hover { transform: translateY(-1px); }
        .shared-delete-btn { padding: 8px 12px; background: rgba(239, 68, 68, 0.2); border: none; border-radius: 8px; color: #ef4444; cursor: pointer; transition: all 0.2s; }
        .shared-delete-btn:hover { background: rgba(239, 68, 68, 0.4); }
        .no-group-selected, .no-messages, .no-content { display: flex; align-items: center; justify-content: center; height: 400px; opacity: 0.6; text-align: center; font-size: 14px; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: white; padding: 24px; border-radius: 20px; width: 90%; max-width: 400px; color: black; }
        .share-modal { max-width: 500px; }
        .content-view-modal { max-width: 700px; max-height: 80vh; overflow-y: auto; }
        .content-meta { font-size: 12px; color: #666; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
        .content-body { margin: 15px 0; }
        .note-content, .quiz-content, .insight-content, .flashcard-content, .youtube-content, .file-content { line-height: 1.6; }
        .note-subject, .note-topic { margin: 5px 0; }
        .note-text { margin-top: 15px; white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 8px; max-height: 400px; overflow-y: auto; }
        .quiz-question { margin: 15px 0; padding: 12px; background: #f8f9fa; border-radius: 8px; }
        .correct-answer { color: #10b981; font-weight: 500; }
        .insight-tip { background: #f0fdf4; color: #166534; padding: 12px; border-radius: 8px; text-align: center; font-size: 14px; }
        .flashcard-set-content { max-height: 500px; overflow-y: auto; }
        .flashcard-list { display: flex; flex-direction: column; gap: 15px; margin-top: 15px; }
        .flashcard-item { background: #f8f9fa; border-radius: 12px; padding: 15px; border-left: 4px solid #f59e0b; }
        .flashcard-question { margin-bottom: 10px; color: #1e293b; }
        .flashcard-answer { color: #475569; padding-left: 15px; border-left: 2px solid #e2e8f0; }
        .formatted-content { line-height: 1.6; color: #1e293b; }
        .formatted-content p { margin: 8px 0; }
        .formatted-content .bullet-point { padding-left: 20px; position: relative; margin: 5px 0; }
        .formatted-content .numbered-point { margin: 5px 0; padding-left: 5px; }
        .youtube-content .formatted-content { background: #f1f5f9; padding: 15px; border-radius: 12px; max-height: 400px; overflow-y: auto; white-space: pre-wrap; }
        .insight-text { background: #ffffff; color: #1e293b; padding: 20px; border-radius: 12px; margin-bottom: 15px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .insight-text p { margin: 0 0 10px 0; line-height: 1.6; color: #1e293b; }
        .insight-text .formatted-content { background: #ffffff; padding: 15px; border-radius: 12px; color: #1e293b; white-space: pre-wrap; }
        .insight-text .formatted-content .bullet-point { padding-left: 20px; }
        .file-actions { display: flex; flex-direction: column; gap: 15px; margin-top: 15px; }
        .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 15px; }
        .modal-actions button { padding: 8px 16px; border-radius: 8px; cursor: pointer; font-size: 14px; }
        .modal-actions button:first-child { background: linear-gradient(135deg, #4f46e5, #6366f1); color: white; border: none; }
        .modal-actions button:last-child { background: #e5e7eb; border: none; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.1); border-radius: 10px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.3); border-radius: 10px; }
        @media (max-width: 768px) {
          .groups-layout { grid-template-columns: 1fr; }
          .groups-actions { width: 100%; justify-content: center; }
          .btn-create, .btn-join { flex: 1; justify-content: center; }
          .message-bubble { max-width: 85%; }
        }
      `}</style>
    </div>
  );
}
