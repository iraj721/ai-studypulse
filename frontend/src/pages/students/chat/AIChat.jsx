import React, { useEffect, useState, useRef, useCallback } from "react";
import api from "../../../services/api";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { FaMoon, FaSun, FaArrowDown, FaSpinner, FaMicrophone, FaStop, FaBars, FaTimes, FaTrash, FaPlus } from "react-icons/fa";
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import BackButton from "../../../components/BackButton";
import Stars from "../../../components/Stars";

dayjs.extend(calendar);

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
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const adjustTextareaHeight = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px";
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

  // ✅ Create new chat session (only when user sends first message)
  const createNewChat = async (firstMessage = null) => {
    try {
      const res = await api.post("/chat/sessions", { title: "New Chat" });
      const newSessionId = res.data._id;
      setSessions(prev => [res.data, ...prev]);
      setCurrentSessionId(newSessionId);
      setMessages([]);
      
      // If there's a first message, send it immediately
      if (firstMessage) {
        await sendMessageToSession(newSessionId, firstMessage);
      }
      
      return newSessionId;
    } catch (err) {
      console.error("Failed to create session:", err);
      return null;
    }
  };

  // Delete chat session
  const deleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this chat permanently?")) return;
    
    try {
      await api.delete(`/chat/sessions/${sessionId}`);
      setSessions(prev => prev.filter(s => s._id !== sessionId));
      
      if (currentSessionId === sessionId) {
        const remainingSessions = sessions.filter(s => s._id !== sessionId);
        if (remainingSessions.length > 0) {
          fetchSession(remainingSessions[0]._id);
        } else {
          // Don't auto-create, just clear
          setCurrentSessionId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  // Send message to a session
  const sendMessageToSession = async (sessionId, messageText) => {
    if (!messageText.trim()) return;
    
    // Add user message immediately
    const tempUserMessage = {
      _id: Date.now(),
      role: "user",
      text: messageText,
      createdAt: new Date(),
    };
    setMessages(prev => [...prev, tempUserMessage]);
    setText("");
    adjustTextareaHeight();
    scrollToBottom();

    setLoadingAI(true);

    try {
      const tempAiId = Date.now() + 1;
      setMessages(prev => [...prev, {
        _id: tempAiId,
        role: "ai",
        text: "",
        createdAt: new Date(),
      }]);
      scrollToBottom();

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/sessions/${sessionId}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ text: messageText }),
      });

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
                setMessages(prev => prev.map(msg =>
                  msg._id === tempAiId ? { ...msg, text: fullResponse } : msg
                ));
                scrollToBottom();
              } else if (data.type === "done") {
                fetchSessions(); // Update session list (title may have changed)
              }
            } catch (e) {
              console.error("Parse error:", e);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => prev.map(msg =>
        msg._id === tempAiId ? { ...msg, text: "Sorry, I'm having trouble responding. Please try again." } : msg
      ));
    } finally {
      setLoadingAI(false);
    }
  };

  // Handle send message (creates new session if needed)
  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || loadingAI) return;
    
    const messageText = text.trim();
    
    if (!currentSessionId) {
      // Create new session and send message
      await createNewChat(messageText);
    } else {
      // Send to existing session
      await sendMessageToSession(currentSessionId, messageText);
    }
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setMessages([]);
    if (isMobile) setIsSidebarOpen(false);
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
  const toggleDarkMode = () => setDarkMode(prev => !prev);

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
      <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
        {isSidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar */}
      <div className={`chat-sidebar-new ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header-new">
          <h3>💬 Chats</h3>
          <button className="new-chat-btn-new" onClick={handleNewChat}>
            <FaPlus /> New Chat
          </button>
        </div>
        <div className="sessions-list-new">
          {sessions.length === 0 ? (
            <div className="no-sessions-new">
              <p>No chats yet</p>
              <button onClick={handleNewChat}>Start a new chat</button>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session._id}
                className={`session-item-new ${currentSessionId === session._id ? "active" : ""}`}
                onClick={() => fetchSession(session._id)}
              >
                <div className="session-info-new">
                  <div className="session-title-new">{session.title}</div>
                  <div className="session-time-new">
                    {dayjs(session.updatedAt).fromNow()}
                  </div>
                </div>
                <button 
                  className="delete-session-new"
                  onClick={(e) => deleteSession(session._id, e)}
                >
                  <FaTrash />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`chat-main-area ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <div className="chat-header-new">
          <div className="header-left">
            {!isSidebarOpen && (
              <button className="open-sidebar-btn" onClick={toggleSidebar}>
                <FaBars />
              </button>
            )}
            <h2>AI Study Assistant</h2>
          </div>
          <button className="dark-mode-btn" onClick={toggleDarkMode}>
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>

        <div className="chat-messages-area" ref={chatContainerRef} onScroll={handleScroll}>
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-icon">🤖</div>
              <h2>How can I help you today?</h2>
              <p>Ask me anything about your studies, homework, or any topic!</p>
              <div className="suggestions-list">
                <button onClick={() => setText("Explain quantum computing simply")}>🔬 Explain quantum computing</button>
                <button onClick={() => setText("Help me understand calculus")}>📐 Help me understand calculus</button>
                <button onClick={() => setText("Summarize a topic for me")}>📝 Summarize a topic for me</button>
                <button onClick={() => setText("Create a study plan")}>📅 Create a study plan</button>
              </div>
            </div>
          ) : (
            groupedMessages.map((item, i) =>
              item.type === "date" ? (
                <div key={i} className="date-divider">
                  {dayjs(item.date).calendar(null, {
                    sameDay: "[Today]",
                    lastDay: "[Yesterday]",
                    lastWeek: "dddd",
                    sameElse: "MMMM D, YYYY",
                  })}
                </div>
              ) : (
                <div
                  key={i}
                  className={`message-row ${item.role === "user" ? "user" : "assistant"}`}
                >
                  <div className="message-avatar">
                    {item.role === "user" ? "👤" : "🤖"}
                  </div>
                  <div className="message-bubble-new">
                    <ReactMarkdown>{item.text}</ReactMarkdown>
                    <div className="message-time">
                      {dayjs(item.createdAt).format("h:mm A")}
                    </div>
                  </div>
                </div>
              )
            )
          )}
          
          {loadingAI && (
            <div className="message-row assistant">
              <div className="message-avatar">🤖</div>
              <div className="message-bubble-new thinking">
                <FaSpinner className="spinner" />
                <span>Thinking...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {showScrollBtn && (
          <button className="scroll-to-bottom" onClick={scrollToBottom}>
            <FaArrowDown />
          </button>
        )}

        <form className="chat-input-form" onSubmit={handleSend}>
          <textarea
            ref={textAreaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask a study question..."
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            disabled={loadingAI}
          />
          <button type="submit" disabled={loadingAI || !text.trim()}>
            {loadingAI ? <FaSpinner className="spinner" /> : "Send"}
          </button>
        </form>
      </div>

      <style>{`
        .ai-chat-container {
          display: flex;
          height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
          position: relative;
          overflow: hidden;
        }
        .ai-chat-container.dark {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        }

        /* Sidebar */
        .chat-sidebar-new {
          width: 280px;
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(10px);
          border-right: 1px solid rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          transition: transform 0.3s ease;
          z-index: 100;
        }
        .dark .chat-sidebar-new {
          background: rgba(30,30,50,0.95);
          border-right-color: rgba(255,255,255,0.1);
        }
        .sidebar-header-new {
          padding: 20px;
          border-bottom: 1px solid rgba(0,0,0,0.1);
        }
        .dark .sidebar-header-new {
          border-bottom-color: rgba(255,255,255,0.1);
        }
        .sidebar-header-new h3 {
          margin: 0 0 12px 0;
          font-size: 1.2rem;
        }
        .new-chat-btn-new {
          width: 100%;
          padding: 10px;
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
          margin-bottom: 8px;
          background: rgba(0,0,0,0.03);
          transition: all 0.2s;
        }
        .dark .session-item-new {
          background: rgba(255,255,255,0.05);
        }
        .session-item-new:hover {
          background: rgba(79,70,229,0.1);
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
          font-weight: 500;
          font-size: 0.9rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .session-time-new {
          font-size: 0.7rem;
          opacity: 0.6;
          margin-top: 4px;
        }
        .delete-session-new {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
          padding: 5px;
          border-radius: 6px;
        }
        .session-item-new:hover .delete-session-new {
          opacity: 1;
        }
        .delete-session-new:hover {
          background: rgba(239,68,68,0.2);
        }
        .no-sessions-new {
          text-align: center;
          padding: 30px 20px;
          opacity: 0.7;
        }
        .no-sessions-new button {
          margin-top: 12px;
          background: none;
          border: 1px solid;
          padding: 8px 16px;
          border-radius: 20px;
          cursor: pointer;
        }

        /* Main Chat Area */
        .chat-main-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          transition: margin-left 0.3s ease;
          position: relative;
        }
        .chat-main-area.sidebar-open {
          margin-left: 0;
        }
        .chat-header-new {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0,0,0,0.1);
          z-index: 10;
        }
        .dark .chat-header-new {
          background: rgba(30,30,50,0.9);
          border-bottom-color: rgba(255,255,255,0.1);
        }
        .header-left {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .open-sidebar-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          display: none;
        }
        .dark-mode-btn {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
        }
        .chat-messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }
        .welcome-screen {
          text-align: center;
          padding: 60px 20px;
        }
        .welcome-icon {
          font-size: 64px;
          margin-bottom: 20px;
        }
        .welcome-screen h2 {
          margin-bottom: 10px;
        }
        .welcome-screen p {
          opacity: 0.7;
          margin-bottom: 30px;
        }
        .suggestions-list {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 12px;
          max-width: 600px;
          margin: 0 auto;
        }
        .suggestions-list button {
          background: rgba(0,0,0,0.05);
          border: none;
          padding: 10px 18px;
          border-radius: 30px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .dark .suggestions-list button {
          background: rgba(255,255,255,0.1);
          color: white;
        }
        .suggestions-list button:hover {
          background: #4f46e5;
          color: white;
          transform: scale(1.02);
        }
        .date-divider {
          text-align: center;
          margin: 20px 0;
          font-size: 0.8rem;
          opacity: 0.6;
          position: relative;
        }
        .message-row {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .message-row.user {
          flex-direction: row-reverse;
        }
        .message-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #4f46e5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }
        .message-row.user .message-avatar {
          background: #10b981;
        }
        .message-bubble-new {
          max-width: 70%;
          padding: 12px 16px;
          border-radius: 18px;
          background: white;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .dark .message-bubble-new {
          background: #2d2d3d;
          color: white;
        }
        .message-row.user .message-bubble-new {
          background: #4f46e5;
          color: white;
        }
        .message-bubble-new.thinking {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .message-time {
          font-size: 0.7rem;
          opacity: 0.6;
          margin-top: 5px;
          text-align: right;
        }
        .chat-input-form {
          display: flex;
          gap: 12px;
          padding: 20px;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(0,0,0,0.1);
        }
        .dark .chat-input-form {
          background: rgba(30,30,50,0.9);
          border-top-color: rgba(255,255,255,0.1);
        }
        .chat-input-form textarea {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 24px;
          resize: none;
          font-family: inherit;
          font-size: 14px;
          max-height: 120px;
        }
        .dark .chat-input-form textarea {
          background: #1e1e2e;
          border-color: rgba(255,255,255,0.1);
          color: white;
        }
        .chat-input-form textarea:focus {
          outline: none;
          border-color: #4f46e5;
        }
        .chat-input-form button {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          transition: all 0.2s;
        }
        .chat-input-form button:hover:not(:disabled) {
          transform: scale(1.05);
        }
        .chat-input-form button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .scroll-to-bottom {
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
        }
        .sidebar-toggle-btn {
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

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .sidebar-toggle-btn {
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
          }
          .chat-sidebar-new.open {
            transform: translateX(0);
          }
          .chat-main-area.sidebar-open {
            margin-left: 0;
          }
          .open-sidebar-btn {
            display: flex !important;
          }
          .message-bubble-new {
            max-width: 85%;
          }
          .suggestions-list button {
            font-size: 12px;
            padding: 8px 14px;
          }
        }

        @media (min-width: 769px) {
          .sidebar-toggle-btn {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}