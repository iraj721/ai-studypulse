import React, { useEffect, useState, useRef, useCallback } from "react";
import api from "../../../services/api";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  FaMoon,
  FaSun,
  FaArrowDown,
  FaSpinner,
  FaBars,
  FaTimes,
  FaTrash,
  FaPlus,
  FaPaperPlane,
  FaRobot,
  FaUser,
  FaEdit,
  FaCopy,
  FaCheck,
  FaComment
} from "react-icons/fa";
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import relativeTime from "dayjs/plugin/relativeTime";
import BackButton from "../../../components/BackButton";
import Stars from "../../../components/Stars";

// Extend dayjs
dayjs.extend(calendar);
dayjs.extend(relativeTime);

export default function AIChat() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingText, setEditingText] = useState("");

  const messagesEndRef = useRef(null);
  const textAreaRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
  }, []);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const adjustTextareaHeight = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height =
        Math.min(textAreaRef.current.scrollHeight, 200) + "px";
    }
  };
  useEffect(() => adjustTextareaHeight(), [text]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
      } catch {
        localStorage.removeItem("token");
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

  // Fetch chat sessions
  const fetchSessions = async () => {
    try {
      const res = await api.get("/chat/sessions");
      setSessions(res.data);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    }
  };

  // Fetch specific session
  const fetchSession = async (sessionId) => {
    try {
      const res = await api.get(`/chat/sessions/${sessionId}`);
      setMessages(res.data.messages || []);
      setCurrentSessionId(sessionId);
      setTimeout(() => scrollToBottom(), 100);
    } catch (err) {
      console.error("Failed to fetch session:", err);
    }
  };

  // Create new chat session
  const createNewChat = async () => {
    try {
      const res = await api.post("/chat/sessions", { title: "New Chat" });
      const newSessionId = res.data._id;
      setSessions((prev) => [res.data, ...prev]);
      setCurrentSessionId(newSessionId);
      setMessages([]);
      if (isMobile) setIsSidebarOpen(false);
    } catch (err) {
      console.error("Failed to create session:", err);
    }
  };

  // Delete chat session
  const deleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this chat permanently?")) return;

    try {
      await api.delete(`/chat/sessions/${sessionId}`);
      setSessions((prev) => prev.filter((s) => s._id !== sessionId));

      if (currentSessionId === sessionId) {
        const remainingSessions = sessions.filter((s) => s._id !== sessionId);
        if (remainingSessions.length > 0) {
          fetchSession(remainingSessions[0]._id);
        } else {
          createNewChat();
        }
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || loadingAI) return;

    const messageText = text.trim();

    if (!currentSessionId) {
      // Create new session and send message
      try {
        const res = await api.post("/chat/sessions", {
          title: messageText.slice(0, 30),
        });
        const newSessionId = res.data._id;
        setSessions((prev) => [res.data, ...prev]);
        setCurrentSessionId(newSessionId);
        await sendMessageToSession(newSessionId, messageText);
      } catch (err) {
        console.error("Failed to create session:", err);
      }
    } else {
      await sendMessageToSession(currentSessionId, messageText);
    }
  };

  // Send message to a session
  const sendMessageToSession = async (sessionId, messageText) => {
    setText("");
    adjustTextareaHeight();

    // Add user message immediately
    const tempUserMessage = {
      _id: Date.now(),
      role: "user",
      text: messageText,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);
    scrollToBottom();

    setLoadingAI(true);

    try {
      const tempAiId = Date.now() + 1;
      setMessages((prev) => [
        ...prev,
        {
          _id: tempAiId,
          role: "assistant",
          text: "",
          createdAt: new Date(),
        },
      ]);
      scrollToBottom();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chat/sessions/${sessionId}/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ text: messageText }),
        },
      );

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "chunk") {
                fullResponse += data.content;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg._id === tempAiId ? { ...msg, text: fullResponse } : msg,
                  ),
                );
                scrollToBottom();
              } else if (data.type === "done") {
                fetchSessions();
              }
            } catch (e) {
              console.error("Parse error:", e);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === tempAiId
            ? {
                ...msg,
                text: "Sorry, I'm having trouble responding. Please try again.",
              }
            : msg,
        ),
      );
    } finally {
      setLoadingAI(false);
    }
  };

  // Copy message to clipboard
  const copyToClipboard = async (text, id) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Edit message
  const startEditing = (message) => {
    setEditingMessageId(message._id);
    setEditingText(message.text);
  };

  const saveEdit = async () => {
    // Note: This would require a backend endpoint to edit messages
    setEditingMessageId(null);
    setEditingText("");
  };

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setShowScrollBtn(scrollTop + clientHeight < scrollHeight - 20);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Custom Markdown components for code highlighting
  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <SyntaxHighlighter
          style={darkMode ? oneDark : oneLight}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

  // Group messages by date
  const groupedMessages = [];
  let lastDate = null;
  messages.forEach((m) => {
    const msgDate = dayjs(m.createdAt || new Date()).format("YYYY-MM-DD");
    if (msgDate !== lastDate) {
      groupedMessages.push({ type: "date", date: msgDate });
      lastDate = msgDate;
    }
    groupedMessages.push({ type: "message", ...m });
  });

  return (
    <div className={`ai-chat-container ${darkMode ? "dark" : ""}`}>
      <Stars />

      {/* Sidebar Toggle Button (Mobile) */}
      <button className="sidebar-toggle-btn-new" onClick={toggleSidebar}>
        {isSidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <div className={`chat-sidebar-new ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header-new">
          <div className="logo">
            <FaRobot className="logo-icon" />
            <span>StudyPulse AI</span>
          </div>
          <button className="new-chat-btn-new" onClick={createNewChat}>
            <FaPlus /> New Chat
          </button>
        </div>

        <div className="sessions-list-new">
          {sessions.length === 0 ? (
            <div className="no-sessions-new">
              <FaComment className="no-sessions-icon" />
              <p>No conversations yet</p>
              <button onClick={createNewChat}>Start a new chat</button>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session._id}
                className={`session-item-new ${currentSessionId === session._id ? "active" : ""}`}
                onClick={() => fetchSession(session._id)}
              >
                <div className="session-info-new">
                  <div className="session-title-new">
                    <FaRegMessage className="session-icon" />
                    <span>{session.title}</span>
                  </div>
                  <div className="session-time-new">
                    {dayjs(session.updatedAt).fromNow()}
                  </div>
                </div>
                <button
                  className="delete-session-new"
                  onClick={(e) => deleteSession(session._id, e)}
                  title="Delete chat"
                >
                  <FaTrash />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar-mini">
              {user?.name?.charAt(0) || "U"}
            </div>
            <span>{user?.name?.split(" ")[0] || "User"}</span>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div
        className={`chat-main-area-new ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
      >
        <div className="chat-header-new">
          <div className="header-left">
            {!isSidebarOpen && (
              <button className="open-sidebar-btn-new" onClick={toggleSidebar}>
                <FaBars />
              </button>
            )}
            <div className="chat-header-info">
              <h2>AI Study Assistant</h2>
              <p className="model-badge">Powered by Groq Llama 3.1</p>
            </div>
          </div>
          <button
            className="dark-mode-btn-new"
            onClick={toggleDarkMode}
            title={darkMode ? "Light mode" : "Dark mode"}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>

        <div
          className="chat-messages-area-new"
          ref={chatContainerRef}
          onScroll={handleScroll}
        >
          {messages.length === 0 ? (
            <div className="welcome-screen-new">
              <div className="welcome-icon-new">
                <FaRobot />
              </div>
              <h2>Hello, {user?.name?.split(" ")[0] || "Student"}! 👋</h2>
              <p>How can I help you with your studies today?</p>
              <div className="suggestions-grid">
                <button
                  onClick={() =>
                    setText("Explain quantum computing in simple terms")
                  }
                >
                  🔬 Explain quantum computing
                </button>
                <button
                  onClick={() =>
                    setText("Help me understand calculus derivatives")
                  }
                >
                  📐 Help me understand calculus
                </button>
                <button
                  onClick={() => setText("Summarize the theory of relativity")}
                >
                  🌌 Summarize relativity
                </button>
                <button
                  onClick={() => setText("Create a study plan for finals")}
                >
                  📅 Create a study plan
                </button>
                <button
                  onClick={() => setText("Explain machine learning basics")}
                >
                  🤖 Machine learning basics
                </button>
                <button onClick={() => setText("Help with essay writing")}>
                  ✍️ Essay writing help
                </button>
              </div>
            </div>
          ) : (
            <>
              {groupedMessages.map((item, i) =>
                item.type === "date" ? (
                  <div key={i} className="date-divider-new">
                    <span>
                      {dayjs(item.date).calendar(null, {
                        sameDay: "[Today]",
                        lastDay: "[Yesterday]",
                        lastWeek: "dddd",
                        sameElse: "MMMM D, YYYY",
                      })}
                    </span>
                  </div>
                ) : (
                  <div
                    key={i}
                    className={`message-row-new ${item.role === "user" ? "user" : "assistant"}`}
                  >
                    <div className="message-avatar-new">
                      {item.role === "user" ? (
                        <div className="user-avatar">
                          {user?.name?.charAt(0) || "U"}
                        </div>
                      ) : (
                        <div className="ai-avatar">
                          <FaRobot />
                        </div>
                      )}
                    </div>
                    <div className="message-content-new">
                      <div className="message-header-new">
                        <span className="message-sender">
                          {item.role === "user"
                            ? user?.name?.split(" ")[0] || "You"
                            : "StudyPulse AI"}
                        </span>
                        <span className="message-time-new">
                          {dayjs(item.createdAt).format("h:mm A")}
                        </span>
                      </div>
                      <div className="message-bubble-new">
                        {editingMessageId === item._id ? (
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="edit-textarea"
                            rows={4}
                          />
                        ) : (
                          <ReactMarkdown components={MarkdownComponents}>
                            {item.text}
                          </ReactMarkdown>
                        )}
                      </div>
                      <div className="message-actions-new">
                        {editingMessageId === item._id ? (
                          <>
                            <button
                              onClick={saveEdit}
                              className="action-btn save"
                            >
                              <FaCheck /> Save
                            </button>
                            <button
                              onClick={() => setEditingMessageId(null)}
                              className="action-btn cancel"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          item.role === "assistant" && (
                            <button
                              onClick={() =>
                                copyToClipboard(item.text, item._id)
                              }
                              className="action-btn copy"
                              title="Copy response"
                            >
                              {copiedId === item._id ? <FaCheck /> : <FaCopy />}
                              {copiedId === item._id ? "Copied!" : "Copy"}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                ),
              )}
            </>
          )}

          {loadingAI && (
            <div className="message-row-new assistant">
              <div className="message-avatar-new">
                <div className="ai-avatar">
                  <FaRobot />
                </div>
              </div>
              <div className="message-content-new">
                <div className="message-bubble-new thinking">
                  <FaSpinner className="spinner" />
                  <span>Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {showScrollBtn && (
          <button className="scroll-to-bottom-new" onClick={scrollToBottom}>
            <FaArrowDown />
          </button>
        )}

        <form className="chat-input-form-new" onSubmit={handleSend}>
          <div className="input-container">
            <textarea
              ref={textAreaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask me anything..."
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              disabled={loadingAI}
            />
            <button
              type="submit"
              disabled={loadingAI || !text.trim()}
              className="send-btn"
            >
              {loadingAI ? <FaSpinner className="spinner" /> : <FaPaperPlane />}
            </button>
          </div>
          <p className="input-hint">
            Press Enter to send, Shift + Enter for new line
          </p>
        </form>
      </div>

      <style>{`
        /* Container */
        .ai-chat-container {
          display: flex;
          height: 100vh;
          background: #f9fafb;
          position: relative;
          overflow: hidden;
        }
        .ai-chat-container.dark {
          background: #0f172a;
        }

        /* Sidebar */
        .chat-sidebar-new {
          width: 280px;
          background: white;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease;
          z-index: 100;
        }
        .dark .chat-sidebar-new {
          background: #1e293b;
          border-right-color: #334155;
        }
        .sidebar-header-new {
          padding: 20px;
          border-bottom: 1px solid #e2e8f0;
        }
        .dark .sidebar-header-new {
          border-bottom-color: #334155;
        }
        .logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 20px;
          color: #4f46e5;
        }
        .logo-icon {
          font-size: 24px;
        }
        .new-chat-btn-new {
          width: 100%;
          padding: 12px;
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 600;
          transition: all 0.2s;
        }
        .new-chat-btn-new:hover {
          transform: scale(1.02);
          box-shadow: 0 4px 12px rgba(79,70,229,0.3);
        }
        .sessions-list-new {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
        }
        .session-item-new {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          border-radius: 12px;
          cursor: pointer;
          margin-bottom: 6px;
          transition: all 0.2s;
        }
        .session-item-new:hover {
          background: #f1f5f9;
        }
        .dark .session-item-new:hover {
          background: #334155;
        }
        .session-item-new.active {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
        }
        .session-info-new {
          flex: 1;
          overflow: hidden;
        }
        .session-title-new {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .session-icon {
          font-size: 12px;
          opacity: 0.7;
        }
        .session-time-new {
          font-size: 0.7rem;
          opacity: 0.6;
          margin-top: 4px;
        }
        .delete-session-new {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          opacity: 0;
          transition: all 0.2s;
          padding: 6px;
          border-radius: 6px;
        }
        .delete-session-new:hover {
          background: rgba(239,68,68,0.1);
          color: #ef4444;
        }
        .session-item-new:hover .delete-session-new {
          opacity: 1;
        }
        .no-sessions-new {
          text-align: center;
          padding: 40px 20px;
        }
        .no-sessions-icon {
          font-size: 40px;
          opacity: 0.5;
          margin-bottom: 15px;
        }
        .no-sessions-new p {
          opacity: 0.7;
          margin-bottom: 15px;
        }
        .no-sessions-new button {
          background: none;
          border: 1px solid;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
        }
        .sidebar-footer {
          padding: 16px 20px;
          border-top: 1px solid #e2e8f0;
        }
        .dark .sidebar-footer {
          border-top-color: #334155;
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .user-avatar-mini {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
        }

        /* Main Chat Area */
        .chat-main-area-new {
          flex: 1;
          display: flex;
          flex-direction: column;
          transition: margin-left 0.3s ease;
        }
        .chat-header-new {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          z-index: 10;
        }
        .dark .chat-header-new {
          background: #1e293b;
          border-bottom-color: #334155;
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .chat-header-info h2 {
          font-size: 1.2rem;
          margin: 0;
        }
        .model-badge {
          font-size: 0.7rem;
          color: #4f46e5;
          margin: 0;
        }
        .dark .model-badge {
          color: #a5b4fc;
        }
        .open-sidebar-btn-new {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          display: none;
          padding: 8px;
          border-radius: 8px;
        }
        .dark-mode-btn-new {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: all 0.2s;
        }
        .dark-mode-btn-new:hover {
          background: rgba(0,0,0,0.05);
        }

        /* Messages Area */
        .chat-messages-area-new {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }
        .welcome-screen-new {
          text-align: center;
          padding: 60px 20px;
          max-width: 700px;
          margin: 0 auto;
        }
        .welcome-icon-new {
          font-size: 64px;
          color: #4f46e5;
          margin-bottom: 24px;
        }
        .welcome-screen-new h2 {
          font-size: 28px;
          margin-bottom: 12px;
        }
        .welcome-screen-new p {
          opacity: 0.7;
          margin-bottom: 32px;
        }
        .suggestions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 12px;
        }
        .suggestions-grid button {
          background: white;
          border: 1px solid #e2e8f0;
          padding: 12px 16px;
          border-radius: 12px;
          cursor: pointer;
          text-align: left;
          transition: all 0.2s;
          font-size: 0.85rem;
        }
        .dark .suggestions-grid button {
          background: #1e293b;
          border-color: #334155;
          color: white;
        }
        .suggestions-grid button:hover {
          background: #4f46e5;
          color: white;
          border-color: #4f46e5;
          transform: translateY(-2px);
        }
        .date-divider-new {
          text-align: center;
          margin: 24px 0;
          position: relative;
        }
        .date-divider-new span {
          background: #e2e8f0;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          color: #475569;
        }
        .dark .date-divider-new span {
          background: #334155;
          color: #94a3b8;
        }
        .message-row-new {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .message-row-new.user {
          flex-direction: row-reverse;
        }
        .message-avatar-new {
          flex-shrink: 0;
        }
        .user-avatar, .ai-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
        .user-avatar {
          background: #10b981;
          color: white;
        }
        .ai-avatar {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
        }
        .message-content-new {
          max-width: 75%;
          flex: 1;
        }
        .message-row-new.user .message-content-new {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        .message-header-new {
          display: flex;
          align-items: baseline;
          gap: 12px;
          margin-bottom: 6px;
        }
        .message-sender {
          font-weight: 600;
          font-size: 0.85rem;
        }
        .message-time-new {
          font-size: 0.7rem;
          opacity: 0.5;
        }
        .message-bubble-new {
          padding: 12px 16px;
          border-radius: 18px;
          background: white;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          line-height: 1.5;
        }
        .dark .message-bubble-new {
          background: #1e293b;
          color: #e2e8f0;
        }
        .message-row-new.user .message-bubble-new {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
        }
        .message-bubble-new.thinking {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .message-actions-new {
          margin-top: 6px;
          display: flex;
          gap: 8px;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .message-row-new:hover .message-actions-new {
          opacity: 1;
        }
        .action-btn {
          background: none;
          border: none;
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .action-btn.copy {
          color: #64748b;
        }
        .action-btn.copy:hover {
          background: #f1f5f9;
        }
        .edit-textarea {
          width: 100%;
          padding: 8px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.9rem;
        }

        /* Input Form */
        .chat-input-form-new {
          padding: 20px 24px;
          background: white;
          border-top: 1px solid #e2e8f0;
        }
        .dark .chat-input-form-new {
          background: #1e293b;
          border-top-color: #334155;
        }
        .input-container {
          display: flex;
          gap: 12px;
          align-items: flex-end;
        }
        .input-container textarea {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          resize: none;
          font-family: inherit;
          font-size: 0.9rem;
          background: white;
          transition: all 0.2s;
          max-height: 200px;
        }
        .dark .input-container textarea {
          background: #0f172a;
          border-color: #334155;
          color: white;
        }
        .input-container textarea:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79,70,229,0.1);
        }
        .send-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .send-btn:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(79,70,229,0.3);
        }
        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .input-hint {
          font-size: 0.7rem;
          opacity: 0.5;
          margin-top: 8px;
          text-align: center;
        }
        .scroll-to-bottom-new {
          position: absolute;
          bottom: 100px;
          right: 30px;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #4f46e5;
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          z-index: 10;
          transition: all 0.2s;
        }
        .scroll-to-bottom-new:hover {
          transform: scale(1.05);
        }
        .sidebar-toggle-btn-new {
          display: none;
          position: fixed;
          top: 80px;
          left: 15px;
          z-index: 200;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #4f46e5;
          color: white;
          border: none;
          cursor: pointer;
          font-size: 18px;
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Code Block Styling */
        .message-bubble-new pre {
          background: #1e293b;
          padding: 12px;
          border-radius: 8px;
          overflow-x: auto;
          margin: 12px 0;
        }
        .dark .message-bubble-new pre {
          background: #0f172a;
        }
        .message-bubble-new code {
          font-family: 'Fira Code', monospace;
          font-size: 0.85rem;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .sidebar-toggle-btn-new {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .chat-sidebar-new {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            width: 280px;
            transform: translateX(-100%);
            z-index: 150;
            box-shadow: 2px 0 10px rgba(0,0,0,0.1);
          }
          .chat-sidebar-new.open {
            transform: translateX(0);
          }
          .open-sidebar-btn-new {
            display: flex !important;
          }
          .message-content-new {
            max-width: 85%;
          }
          .suggestions-grid {
            grid-template-columns: 1fr;
          }
          .chat-messages-area-new {
            padding: 16px;
          }
          .chat-header-new {
            padding: 12px 16px;
          }
          .chat-input-form-new {
            padding: 12px 16px;
          }
        }

        @media (min-width: 769px) {
          .sidebar-toggle-btn-new {
            display: none;
          }
          .chat-main-area-new.sidebar-closed {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
}
