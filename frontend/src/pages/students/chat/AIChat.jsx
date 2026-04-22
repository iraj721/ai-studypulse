// src/pages/AIChat.jsx
import React, { useEffect, useState, useRef } from "react";
import api from "../../../services/api";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { FaMoon, FaSun, FaArrowDown } from "react-icons/fa";
import dayjs from "dayjs";
import calendar from "dayjs/plugin/calendar";

dayjs.extend(calendar);

export default function AIChat() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const messagesEndRef = useRef(null);
  const textAreaRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  // Adjust textarea height
  const adjustTextareaHeight = () => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height =
        textAreaRef.current.scrollHeight + "px";
    }
  };
  useEffect(() => adjustTextareaHeight(), [text]);

  // Fetch user
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

  // Fetch messages
  useEffect(() => {
    if (user) fetchMessages();
  }, [user]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setShowScrollBtn(scrollTop + clientHeight < scrollHeight - 20);
  };

  const fetchMessages = async () => {
    try {
      const res = await api.get("/chat");
      const chatMessages = res.data.filter((m) => m.type === "chat");
      setMessages(chatMessages);
      setTimeout(() => scrollToBottom(), 50); // ensure initial scroll works
    } catch (err) {
      console.error(err);
    }
  };

  const appendAIResponse = async (text) => {
    const words = text.split(" ");
    let currentText = "";
    setMessages((prev) => [...prev, { role: "ai", text: "" }]);
    for (let i = 0; i < words.length; i++) {
      currentText += words[i] + " ";
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1].text = currentText.trim();
        return updated;
      });
      await new Promise((res) => setTimeout(res, 100));
      scrollToBottom();
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoadingAI(true);

    try {
      const res = await api.post("/chat", { text });
      setMessages((prev) => [...prev, res.data.userMessage]);
      scrollToBottom();

      const aiReply = res?.data?.aiMessage?.text || "AI response error.";
      await appendAIResponse(aiReply);

      setText("");
      adjustTextareaHeight();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAI(false);
    }
  };

  const toggleDarkMode = () => setDarkMode((prev) => !prev);


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
    <div className={`min-vh-100 ai-bg ${darkMode ? "dark" : ""}`}>
      {/* HEADER */}
      <div className="ai-header">
        <h5>AI Study Assistant</h5>
        <button
          className="btn btn-sm btn-outline-light"
          onClick={toggleDarkMode}
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </div>

      {/* CHAT */}
      <div className="ai-chat" ref={chatContainerRef} onScroll={handleScroll}>
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
              className={`msg-row ${
                m.role === "user"
                  ? "justify-content-end"
                  : "justify-content-start"
              }`}
            >
              {m.role === "ai" && (
                <div style={{ fontSize: 28, marginRight: 8 }}>🤖</div>
              )}
              <div
                className={`msg-bubble ${m.role}`}
                style={{ maxWidth: "70%" }}
              >
                <ReactMarkdown>{m.text}</ReactMarkdown>
                <div className="msg-time">
                  {dayjs(m.createdAt || new Date()).format("HH:mm")}
                </div>
              </div>
              {m.role === "user" && (
                <div style={{ fontSize: 28, marginLeft: 8 }}>👤</div>
              )}
            </div>
          )
        )}
        <div ref={messagesEndRef}></div>
      </div>

      {/* Scroll-to-bottom button */}
      {showScrollBtn && (
        <button className="scroll-btn" onClick={scrollToBottom}>
          <FaArrowDown />
        </button>
      )}

      {/* INPUT */}
      <form className="ai-input" onSubmit={handleSend}>
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
        />
        <button disabled={loadingAI}>{loadingAI ? "..." : "Send"}</button>
      </form>

      {/* STYLES */}
      <style>{`
        .ai-bg {
          background: linear-gradient(180deg,
            #080e18ff 0%,
            #122138ff 25%,
            #1e3652ff 50%,
            #28507eff 75%,
            #5a77a3ff 100%);
          position: relative;
          overflow: hidden;
        }

        .ai-header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 64px;
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          backdrop-filter: blur(12px);
          background: rgba(0,0,0,0.35);
          color: #fff;
          z-index: 3;
        }

        .ai-chat {
          padding: 90px 16px 110px;
          height: 100vh;
          overflow-y: auto;
          scroll-behavior: smooth;
        }

        .msg-row {
          display: flex;
          margin-bottom: 12px;
        }

        .msg-bubble {
          padding: 8px 14px;
          border-radius: 14px;
          font-size: 0.95rem;
          position: relative;
          word-wrap: break-word;
          white-space: pre-wrap;
        }

        .msg-bubble.user {
          background: #007bff;
          color: #fff;
        }

        .msg-bubble.ai {
          background: rgba(255,255,255,0.9);
          color: #000;
        }

        .msg-time {
          font-size: 0.7rem;
          opacity: 0.7;
          text-align: right;
          margin-top: 4px;
        }

        .date-badge {
          text-align: center;
          margin: 12px 0;
          color: #fff;
          opacity: 0.7;
        }

        .ai-input {
          position: fixed;
          bottom: 0;
          left: 0;
          width: 100%;
          padding: 14px;
          display: flex;
          gap: 12px;
          backdrop-filter: blur(12px);
          background: rgba(0,0,0,0.45);
          z-index: 3;
        }

        .ai-input textarea {
          flex: 1;
          border-radius: 12px;
          padding: 12px;
          resize: none;
        }

        .ai-input button {
          padding: 0 22px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #0066ff, #00c6ff);
          color: white;
          font-weight: 600;
        }

        .scroll-btn {
          position: fixed;
          bottom: 120px;
          right: 24px;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: none;
          background: #007bff;
          color: #fff;
          z-index: 4;
        }
                  .dark .msg-bubble.ai { background:#333; color:#fff; }

      `}</style>
    </div>
  );
}
