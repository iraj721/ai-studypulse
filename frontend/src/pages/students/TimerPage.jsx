import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Toast from "../../components/Toast";
import { useTimer } from "../../context/TimerContext";
import {
  FaPlay,
  FaPause,
  FaUndo,
  FaClock,
  FaSave,
  FaSpinner,
  FaChartLine,
  FaTrash,
  FaHistory,
  FaBell,
  FaCog,
} from "react-icons/fa";

export default function TimerPage() {
  const navigate = useNavigate();
  const {
    timerState,
    startTimer,
    pauseTimer,
    resetTimer,
    updateSettings,
    addCompletedSession,
    getPendingSave,
    clearPendingSave,
    clearHistory,
  } = useTimer();

  const [showSettings, setShowSettings] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [studyDuration, setStudyDuration] = useState(
    timerState?.studyDuration || 25,
  );
  const [breakDuration, setBreakDuration] = useState(
    timerState?.breakDuration || 5,
  );
  const [longBreakDuration, setLongBreakDuration] = useState(
    timerState?.longBreakDuration || 15,
  );
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [showStats, setShowStats] = useState(false);

  const audioRef = useRef(null);

  // Check for pending save on mount (when session completed)
  useEffect(() => {
    const pending = getPendingSave?.();
    if (pending) {
      setShowSaveModal(true);
    }
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgressPercent = () => {
    const total =
      timerState.mode === "study"
        ? timerState.studyDuration * 60
        : timerState.mode === "break" && timerState.sessions % 4 === 0
          ? timerState.longBreakDuration * 60
          : timerState.breakDuration * 60;
    return ((total - timerState.timeLeft) / total) * 100;
  };

  const applySettings = () => {
    updateSettings(studyDuration, breakDuration, longBreakDuration);
    setShowSettings(false);
    setToast({ message: "Settings updated!", type: "success" });
  };

  const handleSaveSession = async () => {
    if (!subject.trim() || !topic.trim()) {
      setToast({ message: "Please enter subject and topic", type: "error" });
      return;
    }

    setSaving(true);
    try {
      await api.post("/activities", {
        subject: subject.trim(),
        topic: topic.trim(),
        durationMinutes: timerState.studyDuration,
        notes: `Pomodoro session completed on ${new Date().toLocaleString()}`,
      });

      addCompletedSession(
        subject.trim(),
        topic.trim(),
        timerState.studyDuration,
      );
      setToast({ message: "Session saved! 🎉", type: "success" });
      setShowSaveModal(false);
      setSubject("");
      setTopic("");
      clearPendingSave?.();
    } catch (err) {
      setToast({ message: "Failed to save session", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const skipSave = () => {
    setShowSaveModal(false);
    clearPendingSave?.();
    setToast({ message: "Session not saved", type: "info" });
  };

  const sessionHistory = timerState?.sessionHistory || [];
  const totalSessions = sessionHistory.length;
  const totalMinutes = sessionHistory.reduce(
    (sum, s) => sum + (s?.duration || 0),
    0,
  );
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const successRate =
    timerState?.sessions > 0
      ? Math.round((totalSessions / timerState.sessions) * 100)
      : 0;

  return (
    <div className="timer-root">
      {/* Background */}
      <div className="timer-bg" />
      <div className="timer-grid" />
      <div className="timer-orb timer-orb-a" />
      <div className="timer-orb timer-orb-b" />

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "success" })}
      />

      <audio
        ref={audioRef}
        src="https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3"
      />

      {/* Main Content */}
      <main className="timer-main">
        <div className="timer-container">
          {/* Back Button */}
          <button className="timer-back" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>

          {/* Header */}
          <div className="timer-header">
            <div className="timer-header-icon">
              <FaClock />
            </div>
            <div>
              <h1 className="timer-title">
                Pomodoro <span className="timer-grad">Timer</span>
              </h1>
              <p className="timer-subtitle">
                Boost your productivity with focused study sessions
              </p>
            </div>
            <div className="timer-header-actions">
              <button
                onClick={() => setShowStats(!showStats)}
                className="stats-btn"
              >
                <FaChartLine /> Stats
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="settings-btn"
              >
                <FaCog /> Settings
              </button>
            </div>
          </div>

          {/* Statistics Panel */}
          {showStats && (
            <div className="stats-panel">
              <div className="stats-header">
                <h5>
                  <FaChartLine /> Timer Statistics
                </h5>
                {totalSessions > 0 && (
                  <button onClick={clearHistory} className="clear-stats-btn">
                    <FaTrash /> Clear History
                  </button>
                )}
              </div>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{timerState?.sessions || 0}</div>
                  <div className="stat-label">Total Sessions</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {totalHours}h {remainingMinutes}m
                  </div>
                  <div className="stat-label">Total Study Time</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{totalSessions}</div>
                  <div className="stat-label">Completed</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{successRate}%</div>
                  <div className="stat-label">Success Rate</div>
                </div>
              </div>
              {totalSessions > 0 && (
                <div className="history-list-mini">
                  <h6>Recent Sessions</h6>
                  {sessionHistory.slice(0, 5).map((session, idx) => (
                    <div key={idx} className="history-item-mini">
                      <span>
                        <strong>{session.subject}</strong> - {session.topic}
                      </span>
                      <span>{session.duration} min</span>
                      <span className="history-date">
                        {new Date(session.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Panel */}
          {showSettings && (
            <div className="settings-panel">
              <h5>
                <FaCog /> Timer Settings
              </h5>
              <div className="settings-grid">
                <div className="setting-item">
                  <label>Study Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={studyDuration}
                    onChange={(e) =>
                      setStudyDuration(parseInt(e.target.value) || 25)
                    }
                  />
                </div>
                <div className="setting-item">
                  <label>Break Duration (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={breakDuration}
                    onChange={(e) =>
                      setBreakDuration(parseInt(e.target.value) || 5)
                    }
                  />
                </div>
                <div className="setting-item">
                  <label>Long Break (minutes)</label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={longBreakDuration}
                    onChange={(e) =>
                      setLongBreakDuration(parseInt(e.target.value) || 15)
                    }
                  />
                </div>
              </div>
              <button onClick={applySettings} className="apply-settings-btn">
                Apply Settings
              </button>
            </div>
          )}

          {/* Main Timer Card */}
          <div className="timer-card">
            <div className="mode-selector">
              <button
                className={`mode-btn ${timerState?.mode === "study" ? "active" : ""}`}
              >
                📚 Study
              </button>
              <button
                className={`mode-btn ${timerState?.mode === "break" ? "active" : ""}`}
              >
                ☕ Break
              </button>
            </div>
            <div className="timer-display">
              {formatTime(timerState?.timeLeft || 0)}
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar"
                style={{ width: `${getProgressPercent()}%` }}
              ></div>
            </div>
            <div className="timer-controls">
              {!timerState?.isActive ? (
                <button onClick={startTimer} className="control-btn play">
                  <FaPlay /> Start
                </button>
              ) : (
                <button onClick={pauseTimer} className="control-btn pause">
                  <FaPause /> Pause
                </button>
              )}
              <button onClick={resetTimer} className="control-btn reset">
                <FaUndo /> Reset
              </button>
            </div>
            <div className="session-info">
              <span className="session-count">
                ✅ Completed Sessions: {timerState?.sessions || 0}
              </span>
              <span className="session-status">
                {timerState?.mode === "study"
                  ? "🎯 Focus Time!"
                  : "🧘 Take a break!"}
              </span>
            </div>
          </div>

          {/* Session History */}
          <div className="history-section">
            <h5>
              <FaHistory /> Session History ({totalSessions} sessions)
            </h5>
            {totalSessions === 0 ? (
              <div className="empty-history">
                No sessions recorded yet. Complete a study session and save it
                to see it here!
              </div>
            ) : (
              <div className="history-grid">
                {sessionHistory.map((session) => (
                  <div key={session.id} className="history-record">
                    <div className="record-icon">✅</div>
                    <div className="record-details">
                      <div className="record-title">
                        {session.subject} - {session.topic}
                      </div>
                      <div className="record-meta">
                        {session.duration} min •{" "}
                        {new Date(session.date).toLocaleString()}
                        {session.completedAt && (
                          <span> • Completed at {session.completedAt}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Save Session Modal */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={skipSave}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">🎉</div>
            <h4>Great job! You completed a study session!</h4>
            <p className="modal-desc">
              Save this session to track your progress.
            </p>
            <input
              type="text"
              placeholder="Subject (e.g., Mathematics)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <input
              type="text"
              placeholder="Topic (e.g., Algebra)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <div className="modal-actions">
              <button
                onClick={handleSaveSession}
                disabled={saving}
                className="save-btn"
              >
                {saving ? (
                  <>
                    <FaSpinner className="spinner" /> Saving...
                  </>
                ) : (
                  <>
                    <FaSave /> Save Session
                  </>
                )}
              </button>
              <button onClick={skipSave} className="skip-btn">
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap');
        .timer-root { --bg: #0a0c12; --surface: #111318; --border: rgba(88,130,255,0.12); --border-h: rgba(88,130,255,0.28); --accent: #5882ff; --accent2: #20e6d0; --violet: #9b7aff; --text: #edf2ff; --muted: #8e9cc4; --faint: #49587a; --fd: 'Syne', sans-serif; --fb: 'Inter', sans-serif; --success: #10b981; --warning: #f59e0b; --error: #ef4444; }
        *,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
        .timer-root{font-family:var(--fb);background:var(--bg);color:var(--text);min-height:100vh;}
        .timer-grad{background:linear-gradient(135deg,var(--accent),var(--accent2),var(--violet));-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
        .timer-bg{position:fixed;inset:0;z-index:0;background:radial-gradient(ellipse 60% 45% at 50% -5%,rgba(88,130,255,0.08) 0%,transparent 60%);}
        .timer-grid{position:fixed;inset:0;z-index:0;background-image:linear-gradient(rgba(88,130,255,0.03)1px,transparent 1px),linear-gradient(90deg,rgba(88,130,255,0.03)1px,transparent 1px);background-size:48px 48px;}
        .timer-orb{position:fixed;border-radius:50%;filter:blur(80px);pointer-events:none;z-index:0;}
        .timer-orb-a{width:400px;height:400px;top:-100px;left:50%;transform:translateX(-50%);background:rgba(88,130,255,0.06);animation:orbFloat 12s infinite;}
        .timer-orb-b{width:250px;height:250px;bottom:10%;right:-5%;background:rgba(32,230,208,0.04);animation:orbFloat2 10s infinite;}
        @keyframes orbFloat{0%,100%{transform:translateX(-50%) scale(1)}50%{transform:translateX(-50%) scale(1.1)}}
        @keyframes orbFloat2{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}
        .timer-main{position:relative;z-index:10;max-width:900px;margin:0 auto;padding:90px 2rem 3rem;min-height:100vh;}
        .timer-back{display:inline-flex;align-items:center;gap:8px;background:rgba(88,130,255,0.1);border:1px solid var(--border);color:var(--accent);padding:8px 20px;border-radius:40px;font-size:0.85rem;cursor:pointer;margin-bottom:1.5rem;transition:all 0.2s;}
        .timer-back:hover{background:rgba(88,130,255,0.2);transform:translateX(-4px);}
        .timer-header{display:flex;align-items:center;gap:1rem;margin-bottom:2rem;flex-wrap:wrap;}
        .timer-header-icon{width:60px;height:60px;background:rgba(88,130,255,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.8rem;color:var(--accent);}
        .timer-title{font-family:var(--fd);font-size:1.8rem;font-weight:700;margin-bottom:0.25rem;}
        .timer-subtitle{color:var(--muted);font-size:0.85rem;}
        .timer-header-actions{display:flex;gap:12px;margin-left:auto;}
        .stats-btn,.settings-btn{background:rgba(255,255,255,0.05);border:1px solid var(--border);color:white;padding:8px 16px;border-radius:30px;cursor:pointer;display:flex;align-items:center;gap:8px;}
        .stats-panel,.settings-panel{background:rgba(17,19,24,0.6);backdrop-filter:blur(12px);border:1px solid var(--border);border-radius:20px;padding:1.5rem;margin-bottom:1.5rem;}
        .stats-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:10px;}
        .clear-stats-btn{background:rgba(239,68,68,0.15);border:none;color:#f87171;padding:6px 12px;border-radius:20px;cursor:pointer;font-size:12px;}
        .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-bottom:1rem;}
        .stat-card{text-align:center;padding:1rem;background:rgba(255,255,255,0.05);border-radius:16px;}
        .stat-value{font-size:1.5rem;font-weight:700;}
        .stat-label{font-size:0.7rem;opacity:0.7;margin-top:5px;}
        .history-list-mini{margin-top:1rem;max-height:200px;overflow-y:auto;}
        .history-item-mini{display:flex;justify-content:space-between;align-items:center;padding:8px;background:rgba(255,255,255,0.03);border-radius:8px;margin-bottom:5px;font-size:12px;flex-wrap:wrap;gap:5px;}
        .history-date{color:#94a3b8;font-size:10px;}
        .settings-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem;margin-bottom:1rem;}
        .setting-item{display:flex;flex-direction:column;gap:0.5rem;}
        .setting-item input{padding:8px 12px;background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:10px;color:white;}
        .apply-settings-btn{background:linear-gradient(135deg,var(--accent),#3a61e0);border:none;color:white;padding:8px 24px;border-radius:30px;cursor:pointer;}
        .timer-card{background:rgba(17,19,24,0.6);backdrop-filter:blur(12px);border:1px solid var(--border);border-radius:30px;padding:2rem;text-align:center;margin-bottom:1.5rem;}
        .mode-selector{display:flex;justify-content:center;gap:1rem;margin-bottom:1.5rem;}
        .mode-btn{background:rgba(255,255,255,0.1);border:none;color:white;padding:8px 30px;border-radius:40px;cursor:pointer;}
        .mode-btn.active{background:linear-gradient(135deg,var(--accent),#3a61e0);}
        .timer-display{font-size:5rem;font-weight:700;font-family:monospace;margin:1rem 0;letter-spacing:5px;}
        .progress-bar-container{background:rgba(255,255,255,0.2);border-radius:10px;height:6px;margin:1rem 0;overflow:hidden;}
        .progress-bar{background:linear-gradient(90deg,var(--accent),var(--accent2));height:100%;transition:width 0.3s;}
        .timer-controls{display:flex;justify-content:center;gap:1rem;margin:1.5rem 0;}
        .control-btn{padding:10px 30px;border:none;border-radius:40px;font-size:1rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;}
        .control-btn.play{background:#22c55e;color:white;}
        .control-btn.pause{background:#f59e0b;color:white;}
        .control-btn.reset{background:#6b7280;color:white;}
        .session-info{display:flex;justify-content:space-between;padding:1rem;background:rgba(255,255,255,0.05);border-radius:20px;margin-top:1rem;flex-wrap:wrap;gap:10px;}
        .history-section{margin-top:1rem;}
        .history-section h5{color:white;margin-bottom:1rem;}
        .empty-history{text-align:center;padding:2rem;background:rgba(255,255,255,0.05);border-radius:16px;color:rgba(255,255,255,0.6);}
        .history-grid{display:flex;flex-direction:column;gap:10px;max-height:300px;overflow-y:auto;}
        .history-record{display:flex;align-items:center;gap:15px;padding:12px;background:rgba(255,255,255,0.05);border-radius:12px;}
        .record-icon{font-size:1.2rem;}
        .record-details{flex:1;}
        .record-title{font-weight:500;}
        .record-meta{font-size:11px;color:#94a3b8;margin-top:4px;}
        .modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:1000;}
        .modal-content{background:white;padding:2rem;border-radius:24px;width:90%;max-width:400px;text-align:center;color:black;}
        .modal-icon{font-size:3rem;margin-bottom:1rem;}
        .modal-content h4{margin-bottom:0.5rem;}
        .modal-desc{font-size:0.85rem;color:#6b7280;margin-bottom:1.5rem;}
        .modal-content input{width:100%;padding:12px;margin:8px 0;border:1px solid #e2e8f0;border-radius:12px;}
        .modal-actions{display:flex;gap:12px;margin-top:1rem;}
        .save-btn{flex:1;background:#22c55e;color:white;border:none;padding:12px;border-radius:12px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;}
        .skip-btn{flex:1;background:#6b7280;color:white;border:none;padding:12px;border-radius:12px;cursor:pointer;}
        .spinner{animation:spin 0.8s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:768px){
          .timer-main{padding:80px 1rem 2rem;}
          .timer-title{font-size:1.5rem;}
          .timer-header{flex-direction:column;align-items:flex-start;}
          .timer-header-actions{margin-left:0;width:100%;}
          .stats-btn,.settings-btn{flex:1;justify-content:center;}
          .stats-grid{grid-template-columns:repeat(2,1fr);}
          .settings-grid{grid-template-columns:1fr;}
          .timer-display{font-size:3rem;letter-spacing:2px;}
          .timer-card{padding:1.5rem;}
          .timer-back{width:100%;justify-content:center;}
        }
      `}</style>
    </div>
  );
}
