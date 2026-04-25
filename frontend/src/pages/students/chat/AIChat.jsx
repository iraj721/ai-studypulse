import React, { useEffect, useState, useRef, useCallback } from "react";
import api from "../../../services/api";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import Navbar from "../../../components/Navbar";
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
  FaCopy,
  FaCheck,
  FaComment,
} from "react-icons/fa";
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";
import relativeTime from "dayjs/plugin/relativeTime";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);

  const messagesEndRef = useRef(null);
  const textAreaRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

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

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("chatDarkMode") === "true";
    setDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    localStorage.setItem("chatDarkMode", darkMode);
  }, [darkMode]);

  const adjustTextareaHeight = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height =
        Math.min(textAreaRef.current.scrollHeight, 200) + "px";
    }
  };
  useEffect(() => adjustTextareaHeight(), [text]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const fetchSessions = async () => {
    try {
      const res = await api.get("/chat/sessions");
      setSessions(res.data);
      if (res.data.length > 0 && !currentSessionId) {
        fetchSession(res.data[0]._id);
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    }
  };

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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data);
        await fetchSessions();
      } catch {
        localStorage.removeItem("token");
        navigate("/login");
      }
    };
    fetchUser();
  }, [navigate]);

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

  const openDeleteModal = (sessionId, e) => {
    e.stopPropagation();
    setSessionToDelete(sessionId);
    setShowDeleteModal(true);
  };

  const confirmDeleteSession = async () => {
    if (!sessionToDelete) return;
    try {
      await api.delete(`/chat/sessions/${sessionToDelete}`);
      setSessions((prev) => prev.filter((s) => s._id !== sessionToDelete));
      if (currentSessionId === sessionToDelete) {
        const remainingSessions = sessions.filter(
          (s) => s._id !== sessionToDelete
        );
        if (remainingSessions.length > 0) {
          fetchSession(remainingSessions[0]._id);
        } else {
          setCurrentSessionId(null);
          setMessages([]);
        }
      }
      setShowDeleteModal(false);
      setSessionToDelete(null);
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || loadingAI) return;
    const messageText = text.trim();
    if (!currentSessionId) {
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

  const sendMessageToSession = async (sessionId, messageText) => {
    setText("");
    adjustTextareaHeight();
    const tempUserMessage = {
      _id: Date.now(),
      role: "user",
      text: messageText,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);
    scrollToBottom();
    setLoadingAI(true);
    const tempAiId = Date.now() + 1;
    try {
      setMessages((prev) => [
        ...prev,
        { _id: tempAiId, role: "assistant", text: "", createdAt: new Date() },
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
        }
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
                    msg._id === tempAiId ? { ...msg, text: fullResponse } : msg
                  )
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
            ? { ...msg, text: "Sorry, I'm having trouble responding. Please try again." }
            : msg
        )
      );
    } finally {
      setLoadingAI(false);
    }
  };

  const copyToClipboard = async (text, id) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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

  /* ─── NAVBAR_HEIGHT CSS variable ─── */
  const NAVBAR = 64; // px — must match your Navbar height

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');

        /* ── GLOBAL RESET ── */
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        /* KEY FIX: kill page-level scroll so only the messages pane scrolls */
        html, body {
          height: 100%;
          overflow: hidden;
        }

        /* ── TOKENS ── */
        .cr {
          --bg:      #0a0c12;
          --surface: #111318;
          --border:  rgba(88,130,255,0.12);
          --border-h:rgba(88,130,255,0.28);
          --accent:  #5882ff;
          --accent2: #20e6d0;
          --violet:  #9b7aff;
          --text:    #edf2ff;
          --muted:   #8e9cc4;
          --faint:   #49587a;
          --nb:      ${NAVBAR}px;   /* navbar height */
          font-family: 'Inter', sans-serif;
          color: var(--text);
        }
        .cr.dark { --bg: #0a0c12; --surface: #0f172a; }

        /* ── ROOT: full viewport minus navbar ── */
        .cr {
          position: fixed;          /* KEY: fixed so it never pushes body */
          top: var(--nb);
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          background: var(--bg);
          overflow: hidden;         /* no scrollbar on the shell itself */
        }

        /* ── DECORATIVE BACKGROUND ── */
        .cr-bg {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background: radial-gradient(ellipse 60% 45% at 50% -5%, rgba(88,130,255,0.08) 0%, transparent 60%);
        }
        .cr-grid {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
          background-image:
            linear-gradient(rgba(88,130,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(88,130,255,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .cr-orb {
          position: absolute; border-radius: 50%;
          filter: blur(80px); pointer-events: none; z-index: 0;
        }
        .cr-orb-a {
          width: 400px; height: 400px; top: -100px; left: 50%;
          transform: translateX(-50%);
          background: rgba(88,130,255,0.06);
          animation: orbA 12s ease-in-out infinite;
        }
        .cr-orb-b {
          width: 250px; height: 250px; bottom: 10%; right: -5%;
          background: rgba(32,230,208,0.04);
          animation: orbB 10s ease-in-out infinite;
        }
        @keyframes orbA { 0%,100%{transform:translateX(-50%) scale(1)} 50%{transform:translateX(-50%) scale(1.1)} }
        @keyframes orbB { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }

        /* ── SIDEBAR ── */
        .cr-sidebar {
          width: 280px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          background: rgba(17,19,24,0.97);
          border-right: 1px solid var(--border);
          z-index: 10;
          /* KEY: sidebar scrolls internally, not the page */
          overflow: hidden;
          transition: width 0.3s ease;
        }

        .cr-sidebar-head {
          padding: 20px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        .cr-logo {
          display: flex; align-items: center; gap: 10px;
          font-size: 1.05rem; font-weight: 700; color: var(--accent);
          margin-bottom: 16px;
        }
        .cr-logo svg { font-size: 22px; }
        .cr-new-btn {
          width: 100%; padding: 10px;
          background: linear-gradient(135deg, var(--accent), #3a61e0);
          color: #fff; border: none; border-radius: 40px;
          cursor: pointer; display: flex; align-items: center;
          justify-content: center; gap: 8px;
          font-weight: 600; font-size: 0.85rem;
          transition: opacity 0.2s, transform 0.2s;
        }
        .cr-new-btn:hover { opacity: 0.88; transform: scale(1.02); }

        /* sessions list — ONLY this div scrolls inside sidebar */
        .cr-sessions {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 10px;
        }
        .cr-sessions::-webkit-scrollbar { width: 4px; }
        .cr-sessions::-webkit-scrollbar-thumb { background: rgba(88,130,255,0.2); border-radius: 4px; }

        .cr-session {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 10px 12px; border-radius: 12px;
          cursor: pointer; margin-bottom: 4px;
          transition: background 0.2s;
          min-width: 0;
        }
        .cr-session:hover { background: rgba(88,130,255,0.08); }
        .cr-session.active { background: rgba(88,130,255,0.15); color: var(--accent); }

        .cr-session-info { flex: 1; min-width: 0; overflow: hidden; }
        .cr-session-title {
          display: flex; align-items: center; gap: 8px;
          font-size: 0.83rem; font-weight: 500;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .cr-session-time { font-size: 0.65rem; opacity: 0.5; margin-top: 3px; }
        .cr-session-del {
          background: none; border: none; color: #94a3b8;
          cursor: pointer; opacity: 0; padding: 6px; border-radius: 6px;
          flex-shrink: 0; transition: all 0.2s;
        }
        .cr-session:hover .cr-session-del { opacity: 1; }
        .cr-session-del:hover { background: rgba(239,68,68,0.12); color: #ef4444; }

        .cr-no-sessions { text-align: center; padding: 40px 20px; opacity: 0.6; }
        .cr-no-sessions svg { font-size: 36px; margin-bottom: 12px; }
        .cr-no-sessions p { font-size: 0.83rem; margin-bottom: 12px; }
        .cr-no-sessions button {
          background: none; border: 1px solid var(--border);
          color: var(--accent); padding: 8px 16px; border-radius: 20px;
          cursor: pointer; font-size: 0.8rem;
        }

        .cr-sidebar-foot {
          padding: 14px 20px;
          border-top: 1px solid var(--border);
          flex-shrink: 0;
          display: flex; align-items: center; gap: 10px;
        }
        .cr-avatar {
          width: 32px; height: 32px;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 0.8rem;
          flex-shrink: 0;
        }
        .cr-avatar-sm {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg,#10b981,#059669);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; flex-shrink: 0;
        }
        .cr-ai-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
        }

        /* ── MAIN PANEL ── */
        .cr-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;        /* KEY: prevent flex blowout */
          position: relative;
          background: rgba(10,12,18,0.5);
          z-index: 5;
          /* KEY: main panel fills height, never overflows */
          overflow: hidden;
        }

        /* Header — fixed height, no shrink */
        .cr-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 22px;
          background: rgba(17,19,24,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;       /* KEY */
          z-index: 10;
        }
        .cr-header-left { display: flex; align-items: center; gap: 14px; }
        .cr-header h2 { font-size: 1.05rem; margin: 0; }
        .cr-model-badge { font-size: 0.68rem; color: var(--accent); margin: 0; }

        .cr-icon-btn {
          background: none; border: none; font-size: 18px; cursor: pointer;
          padding: 8px; border-radius: 50%; color: var(--text);
          transition: background 0.2s;
          display: flex; align-items: center; justify-content: center;
        }
        .cr-icon-btn:hover { background: rgba(255,255,255,0.08); }

        /* ── MESSAGES — THIS is the only scroll container ── */
        .cr-messages {
          flex: 1;              /* takes remaining height */
          overflow-y: auto;    /* KEY: scroll here, not on page */
          overflow-x: hidden;
          padding: 24px;
          min-height: 0;       /* KEY: flex child must be 0 to allow shrink */
        }
        .cr-messages::-webkit-scrollbar { width: 5px; }
        .cr-messages::-webkit-scrollbar-thumb { background: rgba(88,130,255,0.2); border-radius: 4px; }

        /* Welcome */
        .cr-welcome {
          text-align: center;
          padding: 48px 20px;
          max-width: 680px;
          margin: 0 auto;
        }
        .cr-welcome-icon { font-size: 60px; color: var(--accent); margin-bottom: 20px; }
        .cr-welcome h2 { font-size: clamp(20px, 4vw, 28px); margin-bottom: 10px; }
        .cr-welcome p { opacity: 0.65; margin-bottom: 28px; font-size: 0.9rem; }
        .cr-suggestions {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 10px;
        }
        .cr-suggestions button {
          background: rgba(17,19,24,0.8);
          border: 1px solid var(--border);
          padding: 12px 14px;
          border-radius: 12px;
          cursor: pointer;
          text-align: left;
          font-size: 0.83rem;
          color: var(--text);
          transition: all 0.2s;
          font-family: inherit;
        }
        .cr-suggestions button:hover {
          background: var(--accent); color: #fff; transform: translateY(-2px);
        }

        /* Date divider */
        .cr-date-div {
          text-align: center; margin: 20px 0;
        }
        .cr-date-div span {
          background: rgba(255,255,255,0.05);
          padding: 4px 12px; border-radius: 20px;
          font-size: 0.68rem; color: var(--muted);
        }

        /* Messages */
        .cr-msg {
          display: flex; gap: 14px; margin-bottom: 22px;
          animation: fadeUp 0.3s ease;
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .cr-msg.user { flex-direction: row-reverse; }
        .cr-msg-body { max-width: 75%; min-width: 0; }
        .cr-msg.user .cr-msg-body { display:flex; flex-direction:column; align-items:flex-end; }

        .cr-msg-meta {
          display: flex; align-items: baseline; gap: 10px; margin-bottom: 5px;
        }
        .cr-msg-sender { font-weight: 600; font-size: 0.83rem; }
        .cr-msg-time   { font-size: 0.68rem; opacity: 0.45; }

        .cr-bubble {
          padding: 12px 16px; border-radius: 18px;
          background: rgba(17,19,24,0.85);
          border: 1px solid var(--border);
          line-height: 1.55; font-size: 0.88rem;
          word-break: break-word;        /* KEY: long words don't cause horizontal scroll */
          overflow-wrap: break-word;
        }
        .cr-msg.user .cr-bubble {
          background: linear-gradient(135deg, var(--accent), #3a61e0);
          color: #fff; border-color: transparent;
        }
        .cr-bubble p  { margin: 0 0 8px; }
        .cr-bubble p:last-child { margin-bottom: 0; }
        .cr-bubble pre {
          background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px;
          overflow-x: auto; font-size: 0.8rem; margin: 8px 0;
        }
        .cr-bubble code { font-family: monospace; font-size: 0.82rem; }

        .cr-thinking {
          display: flex; align-items: center; gap: 10px;
          color: var(--muted); font-size: 0.85rem;
        }
        .cr-spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .cr-actions {
          margin-top: 5px; display:flex; gap:8px;
          opacity: 0; transition: opacity 0.2s;
        }
        .cr-msg:hover .cr-actions { opacity: 1; }
        .cr-copy-btn {
          background: none; border: 1px solid var(--border);
          font-size: 11px; padding: 3px 10px; border-radius: 20px;
          cursor: pointer; display:flex; align-items:center; gap:5px;
          color: var(--muted); font-family: inherit;
          transition: all 0.2s;
        }
        .cr-copy-btn:hover { background: rgba(88,130,255,0.1); color: var(--accent); }

        /* Input — fixed height, no shrink */
        .cr-input-wrap {
          flex-shrink: 0;      /* KEY */
          padding: 16px 22px;
          background: rgba(17,19,24,0.92);
          backdrop-filter: blur(12px);
          border-top: 1px solid var(--border);
        }
        .cr-input-row {
          display: flex; gap: 10px; align-items: flex-end;
        }
        .cr-input-row textarea {
          flex: 1;
          padding: 11px 16px;
          border: 1px solid var(--border);
          border-radius: 24px;
          resize: none;
          font-family: inherit;
          font-size: 0.88rem;
          background: rgba(0,0,0,0.22);
          color: var(--text);
          transition: border-color 0.2s, box-shadow 0.2s;
          max-height: 200px;
          min-height: 44px;
          line-height: 1.5;
        }
        .cr-input-row textarea::placeholder { color: var(--faint); }
        .cr-input-row textarea:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 0 3px rgba(88,130,255,0.1);
        }
        .cr-input-row textarea:disabled { opacity: 0.5; }

        .cr-send {
          width: 44px; height: 44px; border-radius: 50%;
          border: none; flex-shrink: 0;
          background: linear-gradient(135deg, var(--accent), #3a61e0);
          color: #fff; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.2s, transform 0.2s;
        }
        .cr-send:hover:not(:disabled) { transform: scale(1.06); opacity: 0.9; }
        .cr-send:disabled { opacity: 0.45; cursor: not-allowed; }

        .cr-hint {
          font-size: 0.62rem; opacity: 0.4; margin-top: 6px; text-align: center;
        }

        /* Scroll-to-bottom button */
        .cr-scroll-btn {
          position: absolute;
          bottom: 90px; right: 24px;
          width: 38px; height: 38px; border-radius: 50%;
          background: var(--accent); color: #fff; border: none;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          z-index: 20; transition: transform 0.2s;
          box-shadow: 0 4px 16px rgba(88,130,255,0.35);
        }
        .cr-scroll-btn:hover { transform: scale(1.08); }

        /* Mobile sidebar toggle */
        .cr-toggle {
          display: none;
          position: fixed;
          top: calc(var(--nb) + 12px);
          left: 14px;
          z-index: 100;
          width: 38px; height: 38px; border-radius: 50%;
          background: var(--accent); color: #fff; border: none;
          cursor: pointer; font-size: 16px;
          align-items: center; justify-content: center;
          box-shadow: 0 4px 14px rgba(88,130,255,0.4);
        }

        /* Modal */
        .cr-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.72);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          z-index: 200;
          padding: 1rem;
        }
        .cr-modal {
          background: var(--surface);
          border: 1px solid var(--border-h);
          border-radius: 24px;
          padding: 30px 28px;
          width: 100%; max-width: 380px;
          text-align: center;
        }
        .cr-modal-icon {
          width: 60px; height: 60px;
          background: rgba(239,68,68,0.1);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 18px; color: #ef4444;
        }
        .cr-modal h3 { font-size: 1.1rem; margin-bottom: 8px; }
        .cr-modal p  { font-size: 0.82rem; opacity: 0.65; margin-bottom: 22px; }
        .cr-modal-btns { display: flex; gap: 10px; justify-content: center; }
        .cr-cancel {
          padding: 10px 22px;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border);
          border-radius: 12px; cursor: pointer;
          color: var(--text); font-family: inherit;
          transition: background 0.2s;
        }
        .cr-cancel:hover { background: rgba(255,255,255,0.1); }
        .cr-confirm {
          padding: 10px 22px;
          background: #ef4444; border: none;
          border-radius: 12px; color: #fff;
          cursor: pointer; font-family: inherit;
          transition: background 0.2s;
        }
        .cr-confirm:hover { background: #dc2626; }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .cr {
            --nb: 58px;
          }
          .cr-toggle { display: flex; }

          /* sidebar becomes an overlay drawer */
          .cr-sidebar {
            position: fixed;
            top: 58px;
            left: 0;
            bottom: 0;
            width: 280px;
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            z-index: 60;
          }
          .cr-sidebar.open { transform: translateX(0); }

          /* backdrop when sidebar open */
          .cr-backdrop {
            display: block !important;
          }

          .cr-msg-body { max-width: 88%; }
          .cr-messages { padding: 14px; }
          .cr-header { padding: 10px 14px; }
          .cr-input-wrap { padding: 10px 14px; }
          .cr-suggestions { grid-template-columns: 1fr; }
          .cr-welcome { padding: 32px 12px; }
        }

        @media (max-width: 480px) {
          .cr-msg-body { max-width: 94%; }
          .cr-modal { padding: 22px 18px; }
        }

        /* Sidebar backdrop (mobile) */
        .cr-backdrop {
          display: none;
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 55;
        }
      `}</style>

      {/* Navbar rendered outside so it occupies top of page normally */}
      <Navbar user={user} onLogout={handleLogout} />

      {/* Chat shell — fixed below navbar */}
      <div className={`cr ${darkMode ? "dark" : ""}`}>
        <div className="cr-bg" />
        <div className="cr-grid" />
        <div className="cr-orb cr-orb-a" />
        <div className="cr-orb cr-orb-b" />

        {/* Mobile toggle */}
        <button className="cr-toggle" onClick={toggleSidebar}>
          {isSidebarOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Backdrop for mobile sidebar */}
        {isMobile && isSidebarOpen && (
          <div className="cr-backdrop" onClick={() => setIsSidebarOpen(false)} />
        )}

        {/* ── SIDEBAR ── */}
        <div className={`cr-sidebar ${isSidebarOpen ? "open" : ""}`}>
          <div className="cr-sidebar-head">
            <div className="cr-logo">
              <FaRobot />
              <span>StudyPulse AI</span>
            </div>
            <button className="cr-new-btn" onClick={createNewChat}>
              <FaPlus /> New Chat
            </button>
          </div>

          <div className="cr-sessions">
            {sessions.length === 0 ? (
              <div className="cr-no-sessions">
                <FaComment style={{ fontSize: 36, marginBottom: 12, display: "block", margin: "0 auto 12px" }} />
                <p>No conversations yet</p>
                <button onClick={createNewChat}>Start a new chat</button>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session._id}
                  className={`cr-session ${currentSessionId === session._id ? "active" : ""}`}
                  onClick={() => {
                    fetchSession(session._id);
                    if (isMobile) setIsSidebarOpen(false);
                  }}
                >
                  <div className="cr-session-info">
                    <div className="cr-session-title">
                      <FaComment style={{ fontSize: 11, opacity: 0.6, flexShrink: 0 }} />
                      <span>{session.title}</span>
                    </div>
                    <div className="cr-session-time">{dayjs(session.updatedAt).fromNow()}</div>
                  </div>
                  <button
                    className="cr-session-del"
                    onClick={(e) => openDeleteModal(session._id, e)}
                    title="Delete chat"
                  >
                    <FaTrash />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="cr-sidebar-foot">
            <div className="cr-avatar">{user?.name?.charAt(0) || "U"}</div>
            <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>
              {user?.name?.split(" ")[0] || "User"}
            </span>
          </div>
        </div>

        {/* ── MAIN ── */}
        <div className="cr-main">
          {/* Header */}
          <div className="cr-header">
            <div className="cr-header-left">
              {(!isSidebarOpen || isMobile) && !isMobile && (
                <button className="cr-icon-btn" onClick={toggleSidebar}>
                  <FaBars />
                </button>
              )}
              <div>
                <h2>AI Study Assistant</h2>
                <p className="cr-model-badge">Powered by Groq Llama 3.1</p>
              </div>
            </div>
            <button className="cr-icon-btn" onClick={toggleDarkMode} title={darkMode ? "Light mode" : "Dark mode"}>
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
          </div>

          {/* Messages — only scroll area */}
          <div className="cr-messages" ref={chatContainerRef} onScroll={handleScroll}>
            {messages.length === 0 ? (
              <div className="cr-welcome">
                <div className="cr-welcome-icon"><FaRobot /></div>
                <h2>Hello, {user?.name?.split(" ")[0] || "Student"}! 👋</h2>
                <p>How can I help you with your studies today?</p>
                <div className="cr-suggestions">
                  <button onClick={() => setText("Explain quantum computing in simple terms")}>
                    🔬 Explain quantum computing
                  </button>
                  <button onClick={() => setText("Help me understand calculus derivatives")}>
                    📐 Help me understand calculus
                  </button>
                  <button onClick={() => setText("Create a study plan for finals")}>
                    📅 Create a study plan
                  </button>
                  <button onClick={() => setText("Explain machine learning basics")}>
                    🤖 Machine learning basics
                  </button>
                </div>
              </div>
            ) : (
              groupedMessages.map((item, i) =>
                item.type === "date" ? (
                  <div key={i} className="cr-date-div">
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
                  <div key={i} className={`cr-msg ${item.role === "user" ? "user" : "assistant"}`}>
                    <div className="cr-msg-avatar">
                      {item.role === "user" ? (
                        <div className="cr-avatar-sm">{user?.name?.charAt(0) || "U"}</div>
                      ) : (
                        <div className="cr-ai-avatar"><FaRobot /></div>
                      )}
                    </div>
                    <div className="cr-msg-body">
                      <div className="cr-msg-meta">
                        <span className="cr-msg-sender">
                          {item.role === "user" ? user?.name?.split(" ")[0] || "You" : "StudyPulse AI"}
                        </span>
                        <span className="cr-msg-time">{dayjs(item.createdAt).format("h:mm A")}</span>
                      </div>
                      <div className="cr-bubble">
                        <ReactMarkdown>{item.text}</ReactMarkdown>
                      </div>
                      {item.role === "assistant" && (
                        <div className="cr-actions">
                          <button className="cr-copy-btn" onClick={() => copyToClipboard(item.text, item._id)}>
                            {copiedId === item._id ? <FaCheck /> : <FaCopy />}
                            {copiedId === item._id ? "Copied!" : "Copy"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              )
            )}

            {loadingAI && (
              <div className="cr-msg assistant">
                <div className="cr-ai-avatar"><FaRobot /></div>
                <div className="cr-msg-body">
                  <div className="cr-bubble cr-thinking">
                    <FaSpinner className="cr-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {showScrollBtn && (
            <button className="cr-scroll-btn" onClick={scrollToBottom}>
              <FaArrowDown />
            </button>
          )}

          {/* Input */}
          <form className="cr-input-wrap" onSubmit={handleSend}>
            <div className="cr-input-row">
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
              <button type="submit" disabled={loadingAI || !text.trim()} className="cr-send">
                {loadingAI ? <FaSpinner className="cr-spin" /> : <FaPaperPlane />}
              </button>
            </div>
            <p className="cr-hint">Enter to send · Shift+Enter for new line</p>
          </form>
        </div>

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="cr-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="cr-modal" onClick={(e) => e.stopPropagation()}>
              <div className="cr-modal-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3>Delete Conversation?</h3>
              <p>This action cannot be undone. All messages will be permanently removed.</p>
              <div className="cr-modal-btns">
                <button className="cr-cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                <button className="cr-confirm" onClick={confirmDeleteSession}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}