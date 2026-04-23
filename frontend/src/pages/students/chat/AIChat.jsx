import React, { useEffect, useState, useRef, useCallback } from "react";
import api from "../../../services/api";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { FaMoon, FaSun, FaArrowDown, FaSpinner, FaMicrophone, FaStop } from "react-icons/fa";
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import BackButton from "../../../components/BackButton";
import Stars from "../../../components/Stars";
import ChatSidebar from "../../../components/ChatSidebar";

// Speech recognition setup
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
if (recognition) {
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
}

dayjs.extend(calendar);

export default function AIChat() {
  const navigate = useNavigate();
  const { sessionId: urlSessionId } = useParams();

  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef(null);
  const textAreaRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // Voice recognition handlers
  const startListening = () => {
    if (!recognition) {
      alert("Speech recognition is not supported in your browser. Please use Chrome or Edge.");
      return;
    }
    
    recognition.start();
    setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText(prev => prev + (prev ? ' ' : '') + transcript);
      setIsListening(false);
    };
    
    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

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

  const fetchSessions = async () => {
    try {
      const res = await api.get("/chat/sessions");
      setSessions(res.data);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    }
  };

  const fetchSession = async (sessionId) => {
    try {
      const res = await api.get(`/chat/sessions/${sessionId}`);
      setCurrentSession(res.data);
      setMessages(res.data.messages || []);
      setTimeout(() => scrollToBottom(), 100);
    } catch (err) {
      console.error("Failed to fetch session:", err);
    }
  };

  const createNewChat = async () => {
    try {
      const res = await api.post("/chat/sessions", { title: "New Chat" });
      setSessions([res.data, ...sessions]);
      setCurrentSession(res.data);
      setMessages([]);
      setSidebarOpen(false);
      navigate(`/chat/${res.data._id}`);
    } catch (err) {
      console.error("Failed to create session:", err);
    }
  };

  const deleteSession = async (sessionId) => {
    try {
      await api.delete(`/chat/sessions/${sessionId}`);
      setSessions(sessions.filter((s) => s._id !== sessionId));
      if (currentSession?._id === sessionId) {
        if (sessions.length > 1) {
          const nextSession = sessions.find((s) => s._id !== sessionId);
          if (nextSession) {
            fetchSession(nextSession._id);
            navigate(`/chat/${nextSession._id}`);
          } else {
            createNewChat();
          }
        } else {
          createNewChat();
        }
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (urlSessionId) {
      fetchSession(urlSessionId);
    } else if (sessions.length > 0) {
      fetchSession(sessions[0]._id);
      navigate(`/chat/${sessions[0]._id}`);
    } else {
      createNewChat();
    }
  }, [urlSessionId, sessions.length]);

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

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || loadingAI || !currentSession) return;

    const userMessageText = text.trim();
    setText("");
    adjustTextareaHeight();

    const tempUserMessage = {
      _id: Date.now(),
      role: "user",
      text: userMessageText,
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
          role: "ai",
          text: "",
          createdAt: new Date(),
        },
      ]);
      scrollToBottom();

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chat/sessions/${currentSession._id}/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ text: userMessageText }),
        },
      );

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

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
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg._id === tempAiId
                      ? { ...msg, text: msg.text + data.content }
                      : msg,
                  ),
                );
                scrollToBottom();
              } else if (data.type === "done") {
                fetchSessions();
                if (data.message) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg._id === tempAiId
                        ? { ...msg, _id: Date.now(), text: data.message.text }
                        : msg,
                    ),
                  );
                }
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
            ? { ...msg, text: "Sorry, I'm having trouble responding. Please try again." }
            : msg,
        ),
      );
    } finally {
      setLoadingAI(false);
      fetchSessions();
    }
  };

  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

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
    <div className={`min-vh-100 ai-bg ${darkMode ? "dark" : ""} position-relative`}>
      <Stars />

      <ChatSidebar
        sessions={sessions}
        currentSessionId={currentSession?._id}
        onSelectSession={(id) => {
          fetchSession(id);
          navigate(`/chat/${id}`);
          setSidebarOpen(false);
        }}
        onNewChat={createNewChat}
        onDeleteSession={deleteSession}
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />

      <div className="chat-header-wrapper">
        <div className="container">
          <BackButton to="/dashboard" label="← Back to Dashboard" />
        </div>
      </div>

      <div className="ai-header">
        <h5>🤖 AI Study Assistant</h5>
        <button className="btn btn-sm btn-outline-light" onClick={toggleDarkMode}>
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>

      <div className="ai-chat" ref={chatContainerRef} onScroll={handleScroll}>
        {currentSession && currentSession.title !== "New Chat" && (
          <div className="chat-title-badge">📌 {currentSession.title}</div>
        )}

        {groupedMessages.map((m, i) =>
          m.type === "date" ? (
            <div key={i} className="date-badge">
              {dayjs(m.date).calendar(null, {
                sameDay: "[Today]",
                lastDay: "[Yesterday]",
                lastWeek: "DD MMM",
                sameElse: "DD MMM YYYY",
              })}
            </div>
          ) : (
            <div
              key={i}
              className={`msg-row ${m.role === "user" ? "justify-content-end" : "justify-content-start"}`}
            >
              {m.role === "ai" && <div className="ai-avatar">🤖</div>}
              <div className={`msg-bubble ${m.role}`} style={{ maxWidth: "70%" }}>
                <ReactMarkdown>{m.text}</ReactMarkdown>
                <div className="msg-time">
                  {dayjs(m.createdAt || new Date()).format("HH:mm")}
                </div>
              </div>
              {m.role === "user" && <div className="user-avatar">👤</div>}
            </div>
          ),
        )}

        {loadingAI && (
          <div className="msg-row justify-content-start">
            <div className="ai-avatar">🤖</div>
            <div className="msg-bubble ai loading-msg">
              <FaSpinner className="spinner" />
              <span>Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef}></div>
      </div>

      {showScrollBtn && (
        <button className="scroll-btn" onClick={scrollToBottom}>
          <FaArrowDown />
        </button>
      )}

      <form className="ai-input" onSubmit={handleSend}>
        <textarea
          ref={textAreaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask a study question... or click the mic to speak 🎤"
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
          type="button"
          onClick={toggleListening}
          className={`voice-btn ${isListening ? "listening" : ""}`}
          title={isListening ? "Stop listening" : "Start voice input"}
        >
          {isListening ? <FaStop /> : <FaMicrophone />}
        </button>
        <button disabled={loadingAI}>
          {loadingAI ? <FaSpinner className="spinner" /> : "Send"}
        </button>
      </form>

      <style>{`
        .chat-header-wrapper { position: relative; z-index: 10; padding-top: 10px; }
        .ai-bg {
          background: linear-gradient(180deg, #080e18ff 0%, #122138ff 25%, #1e3652ff 50%, #28507eff 75%, #5a77a3ff 100%);
          min-height: 100vh;
        }
        .ai-header {
          position: fixed;
          top: 70px;
          left: 0;
          right: 0;
          height: 56px;
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          backdrop-filter: blur(12px);
          background: rgba(0,0,0,0.35);
          color: #fff;
          z-index: 3;
        }
        .voice-btn {
          width: 50px;
          border-radius: 24px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }
        .voice-btn.listening {
          background: linear-gradient(135deg, #22c55e, #16a34a);
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1); opacity: 1; }
        }
        .chat-title-badge {
          text-align: center;
          padding: 8px 16px;
          margin-bottom: 16px;
          background: rgba(79,70,229,0.2);
          border-radius: 20px;
          display: inline-block;
          font-size: 0.8rem;
          color: #a5b4fc;
        }
        .ai-chat {
          padding: 140px 16px 110px;
          height: 100vh;
          overflow-y: auto;
        }
        .msg-row { display: flex; margin-bottom: 12px; align-items: flex-start; }
        .msg-bubble {
          padding: 10px 16px;
          border-radius: 18px;
          font-size: 0.95rem;
          word-wrap: break-word;
        }
        .msg-bubble.user { background: #007bff; color: #fff; border-radius: 18px 18px 4px 18px; }
        .msg-bubble.ai { background: rgba(255,255,255,0.9); color: #000; border-radius: 18px 18px 18px 4px; }
        .dark .msg-bubble.ai { background: #2d2d2d; color: #fff; }
        .loading-msg { display: flex; align-items: center; gap: 8px; }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .msg-time { font-size: 0.7rem; opacity: 0.7; text-align: right; margin-top: 4px; }
        .date-badge { text-align: center; margin: 12px 0; color: #fff; opacity: 0.7; font-size: 0.8rem; }
        .ai-input {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 14px;
          display: flex;
          gap: 12px;
          backdrop-filter: blur(12px);
          background: rgba(0,0,0,0.45);
          z-index: 3;
        }
        .ai-input textarea {
          flex: 1;
          border-radius: 24px;
          padding: 12px 16px;
          resize: none;
          border: none;
          outline: none;
        }
        .ai-input button {
          padding: 0 24px;
          border-radius: 24px;
          border: none;
          background: linear-gradient(135deg, #0066ff, #00c6ff);
          color: white;
          font-weight: 600;
          cursor: pointer;
        }
        .ai-input button:disabled { opacity: 0.6; cursor: not-allowed; }
        .scroll-btn {
          position: fixed;
          bottom: 100px;
          right: 24px;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: none;
          background: #007bff;
          color: #fff;
          z-index: 4;
          cursor: pointer;
        }
        .ai-avatar, .user-avatar { font-size: 28px; margin: 0 8px; }
        @media (max-width: 768px) {
          .ai-header { top: 60px; height: 50px; padding: 0 16px; }
          .ai-chat { padding: 130px 12px 100px; }
          .msg-bubble { max-width: 85% !important; font-size: 0.85rem; }
          .ai-avatar, .user-avatar { font-size: 22px; margin: 0 4px; }
          .ai-input textarea { font-size: 14px; }
          .scroll-btn { bottom: 80px; right: 16px; width: 36px; height: 36px; }
          .voice-btn { width: 45px; }
        }
        @media (min-width: 769px) {
          .ai-chat { margin-left: 320px !important; width: calc(100% - 320px) !important; }
          .ai-input { margin-left: 320px !important; width: calc(100% - 320px) !important; }
          .ai-header { margin-left: 320px !important; width: calc(100% - 320px) !important; left: 320px; }
          .chat-header-wrapper { margin-left: 320px !important; }
        }
      `}</style>
    </div>
  );
}