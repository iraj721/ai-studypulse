import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Stars from "../../components/Stars";
import BackButton from "../../components/BackButton";
import Toast from "../../components/Toast";
import { FaPlay, FaPause, FaUndo, FaClock, FaSave, FaSpinner, FaChartLine } from "react-icons/fa";

export default function TimerPage() {
  const navigate = useNavigate();
  
  // Timer States
  const [mode, setMode] = useState('study'); // study, break
  const [studyDuration, setStudyDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [sessionHistory, setSessionHistory] = useState([]);
  
  const audioRef = useRef(null);

  // Load session history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("timerSessionHistory");
    if (saved) {
      setSessionHistory(JSON.parse(saved));
    }
  }, []);

  // Update timer when durations change
  useEffect(() => {
    if (!isActive) {
      if (mode === 'study') {
        setTimeLeft(studyDuration * 60);
      } else if (mode === 'break') {
        const isLongBreak = sessions > 0 && sessions % 4 === 0;
        setTimeLeft((isLongBreak ? longBreakDuration : breakDuration) * 60);
      }
    }
  }, [studyDuration, breakDuration, longBreakDuration, mode, sessions, isActive]);

  // Timer countdown logic
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      // Timer completed
      setIsActive(false);
      
      // Play sound
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
      }
      
      if (mode === 'study') {
        // Study session completed
        const newSessions = sessions + 1;
        setSessions(newSessions);
        
        // Show save modal to record activity
        setShowSaveModal(true);
        
        // Check if it's time for long break (every 4 sessions)
        const isLongBreak = newSessions % 4 === 0;
        setMode('break');
        setTimeLeft((isLongBreak ? longBreakDuration : breakDuration) * 60);
        setIsActive(true);
      } else {
        // Break completed, start next study session
        setMode('study');
        setTimeLeft(studyDuration * 60);
        setIsActive(true);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode, sessions, studyDuration, breakDuration, longBreakDuration]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => setIsActive(true);
  const pauseTimer = () => setIsActive(false);
  
  const resetTimer = () => {
    setIsActive(false);
    if (mode === 'study') {
      setTimeLeft(studyDuration * 60);
    } else {
      const isLongBreak = sessions > 0 && sessions % 4 === 0;
      setTimeLeft((isLongBreak ? longBreakDuration : breakDuration) * 60);
    }
  };

  const resetAll = () => {
    setIsActive(false);
    setMode('study');
    setSessions(0);
    setTimeLeft(studyDuration * 60);
    setToast({ message: "Timer reset! Start fresh? 🎯", type: "info" });
  };

  const applySettings = () => {
    setShowSettings(false);
    setTimeLeft(mode === 'study' ? studyDuration * 60 : breakDuration * 60);
    setIsActive(false);
    setToast({ message: "Timer settings updated! ✅", type: "success" });
  };

  const saveSession = async () => {
    if (!subject.trim() || !topic.trim()) {
      setToast({ message: "Please enter subject and topic", type: "error" });
      return;
    }
    
    setSaving(true);
    try {
      await api.post("/activities", {
        subject: subject.trim(),
        topic: topic.trim(),
        durationMinutes: studyDuration,
        notes: `Pomodoro session completed (${new Date().toLocaleString()})`
      });
      
      // Save to local history
      const newSession = {
        id: Date.now(),
        subject: subject.trim(),
        topic: topic.trim(),
        duration: studyDuration,
        date: new Date().toISOString(),
        type: 'pomodoro'
      };
      const updatedHistory = [newSession, ...sessionHistory].slice(0, 20);
      setSessionHistory(updatedHistory);
      localStorage.setItem("timerSessionHistory", JSON.stringify(updatedHistory));
      
      setToast({ message: "Study session saved! 🎉", type: "success" });
      setShowSaveModal(false);
      setSubject("");
      setTopic("");
    } catch (err) {
      setToast({ message: "Failed to save session", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const skipSave = () => {
    setShowSaveModal(false);
    setSubject("");
    setTopic("");
  };

  const clearHistory = () => {
    setSessionHistory([]);
    localStorage.removeItem("timerSessionHistory");
    setToast({ message: "History cleared!", type: "success" });
  };

  const getProgressPercent = () => {
    const total = mode === 'study' ? studyDuration * 60 : 
                  (sessions > 0 && sessions % 4 === 0 ? longBreakDuration * 60 : breakDuration * 60);
    return ((total - timeLeft) / total) * 100;
  };

  return (
    <div className="timer-page min-vh-100 py-5 position-relative">
      <Stars />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />
      
      {/* Audio for completion */}
      <audio ref={audioRef} src="https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3" />

      <div className="container">
        <BackButton to="/dashboard" label="← Back to Dashboard" />

        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <h2 className="text-white fw-bold">⏱️ Pomodoro Timer</h2>
          <div className="timer-actions">
            <button onClick={() => setShowSettings(!showSettings)} className="btn-settings">
              <FaClock /> Settings
            </button>
            <button onClick={resetAll} className="btn-reset-all">
              <FaUndo /> Reset All
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="settings-card p-4 mb-4">
            <h5 className="mb-3">⚙️ Timer Settings</h5>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Study Duration (minutes)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  min="1" 
                  max="120" 
                  value={studyDuration} 
                  onChange={(e) => setStudyDuration(Math.max(1, parseInt(e.target.value) || 25))}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Break Duration (minutes)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  min="1" 
                  max="30" 
                  value={breakDuration} 
                  onChange={(e) => setBreakDuration(Math.max(1, parseInt(e.target.value) || 5))}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Long Break (minutes)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  min="5" 
                  max="60" 
                  value={longBreakDuration} 
                  onChange={(e) => setLongBreakDuration(Math.max(5, parseInt(e.target.value) || 15))}
                />
              </div>
            </div>
            <button onClick={applySettings} className="btn-apply mt-3">Apply Settings</button>
          </div>
        )}

        {/* Main Timer Display */}
        <div className="timer-card p-4 mb-4">
          <div className="mode-selector">
            <button className={`mode-btn ${mode === 'study' ? 'active' : ''}`} onClick={() => { if (!isActive) { setMode('study'); setTimeLeft(studyDuration * 60); } }}>
              📚 Study
            </button>
            <button className={`mode-btn ${mode === 'break' ? 'active' : ''}`} onClick={() => { if (!isActive) { setMode('break'); setTimeLeft((sessions % 4 === 0 && sessions > 0 ? longBreakDuration : breakDuration) * 60); } }}>
              ☕ Break
            </button>
          </div>

          <div className="timer-display">{formatTime(timeLeft)}</div>

          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${getProgressPercent()}%` }}></div>
          </div>

          <div className="timer-controls">
            {!isActive ? (
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
            <span className="session-count">✅ Completed Sessions: {sessions}</span>
            <span className="session-status">
              {mode === 'study' ? 'Focus Time!' : 'Take a break! 🧘'}
            </span>
          </div>
        </div>

        {/* Stats & History */}
        <div className="row g-4">
          <div className="col-md-6">
            <div className="stats-card p-4">
              <h5><FaChartLine /> Today's Statistics</h5>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{Math.floor(sessionHistory.reduce((sum, s) => sum + s.duration, 0) / 60)}h</div>
                  <div className="stat-label">Total Hours</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{sessionHistory.length}</div>
                  <div className="stat-label">Sessions</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{sessions}</div>
                  <div className="stat-label">Today's Sessions</div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="history-card p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>📋 Recent Sessions</h5>
                {sessionHistory.length > 0 && (
                  <button onClick={clearHistory} className="btn-clear-history">Clear All</button>
                )}
              </div>
              {sessionHistory.length === 0 ? (
                <div className="empty-history">
                  <p>No sessions recorded yet.</p>
                  <small>Complete a study session to see it here!</small>
                </div>
              ) : (
                <div className="history-list">
                  {sessionHistory.slice(0, 10).map((session) => (
                    <div key={session.id} className="history-item">
                      <div className="history-info">
                        <div className="history-title">{session.subject} - {session.topic}</div>
                        <div className="history-meta">
                          {session.duration} min • {new Date(session.date).toLocaleDateString()} • {new Date(session.date).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className="history-badge">✅</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Session Modal */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">🎉</div>
            <h4>Great job! You completed a study session!</h4>
            <p className="modal-desc">Save this session to track your progress.</p>
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
              <button onClick={saveSession} disabled={saving} className="btn-save">
                {saving ? <><FaSpinner className="spinner" /> Saving...</> : <><FaSave /> Save Session</>}
              </button>
              <button onClick={skipSave} className="btn-skip">Skip</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .timer-page {
          background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #1a2a3d 100%);
        }
        .timer-actions { display: flex; gap: 12px; }
        .btn-settings, .btn-reset-all {
          background: rgba(255,255,255,0.15);
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 30px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }
        .btn-settings:hover, .btn-reset-all:hover { background: rgba(255,255,255,0.25); transform: scale(1.02); }
        
        .settings-card {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          color: white;
        }
        .settings-card .form-label { font-size: 12px; opacity: 0.8; margin-bottom: 5px; }
        .settings-card .form-control {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 10px;
          border-radius: 10px;
        }
        .btn-apply {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          border: none;
          color: white;
          padding: 8px 24px;
          border-radius: 30px;
          cursor: pointer;
        }
        
        .timer-card {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 30px;
          text-align: center;
          color: white;
        }
        .mode-selector { display: flex; justify-content: center; gap: 20px; margin-bottom: 30px; }
        .mode-btn {
          background: rgba(255,255,255,0.15);
          border: none;
          color: white;
          padding: 10px 30px;
          border-radius: 40px;
          cursor: pointer;
          font-size: 16px;
          transition: all 0.3s;
        }
        .mode-btn.active {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          box-shadow: 0 5px 15px rgba(79,70,229,0.3);
        }
        .timer-display {
          font-size: 80px;
          font-weight: bold;
          font-family: monospace;
          letter-spacing: 5px;
          margin: 20px 0;
        }
        .progress-bar-container {
          background: rgba(255,255,255,0.2);
          border-radius: 10px;
          height: 8px;
          margin: 20px 0;
          overflow: hidden;
        }
        .progress-bar {
          background: linear-gradient(90deg, #10b981, #34d399);
          height: 100%;
          transition: width 0.3s ease;
          border-radius: 10px;
        }
        .timer-controls { display: flex; justify-content: center; gap: 20px; margin: 30px 0; }
        .control-btn {
          padding: 12px 30px;
          border: none;
          border-radius: 40px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s;
        }
        .control-btn.play { background: #22c55e; color: white; }
        .control-btn.pause { background: #f59e0b; color: white; }
        .control-btn.reset { background: #6b7280; color: white; }
        .control-btn:hover { transform: scale(1.05); }
        .session-info { display: flex; justify-content: space-between; padding: 15px 20px; background: rgba(255,255,255,0.1); border-radius: 20px; margin-top: 20px; }
        
        .stats-card, .history-card {
          background: rgba(255,255,255,0.1);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          color: white;
        }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 15px; text-align: center; }
        .stat-value { font-size: 28px; font-weight: bold; }
        .stat-label { font-size: 12px; opacity: 0.7; margin-top: 5px; }
        .btn-clear-history {
          background: rgba(239,68,68,0.2);
          border: none;
          color: #ef4444;
          padding: 4px 12px;
          border-radius: 20px;
          cursor: pointer;
          font-size: 11px;
        }
        .history-list { max-height: 200px; overflow-y: auto; }
        .history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background: rgba(255,255,255,0.1);
          border-radius: 12px;
          margin-bottom: 8px;
        }
        .history-title { font-size: 13px; font-weight: 500; }
        .history-meta { font-size: 10px; opacity: 0.6; margin-top: 3px; }
        .empty-history { text-align: center; padding: 30px; opacity: 0.6; }
        
        .modal-overlay {
          position: fixed; top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000;
        }
        .modal-content {
          background: white; padding: 30px; border-radius: 24px; width: 90%; max-width: 400px; text-align: center;
        }
        .modal-icon { font-size: 48px; margin-bottom: 15px; }
        .modal-desc { font-size: 13px; color: #6b7280; margin-bottom: 20px; }
        .modal-content input {
          width: 100%; padding: 12px; margin: 8px 0; border: 1px solid #e5e7eb; border-radius: 12px;
        }
        .modal-actions { display: flex; gap: 12px; margin-top: 20px; }
        .btn-save { flex: 1; background: linear-gradient(135deg, #22c55e, #16a34a); color: white; border: none; padding: 12px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-skip { flex: 1; background: #6b7280; color: white; border: none; padding: 12px; border-radius: 12px; cursor: pointer; }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        @media (max-width: 768px) {
          .timer-display { font-size: 50px; }
          .mode-btn { padding: 8px 20px; font-size: 14px; }
          .control-btn { padding: 8px 20px; font-size: 14px; }
          .stats-grid { gap: 10px; }
          .stat-value { font-size: 20px; }
          .timer-actions { width: 100%; justify-content: center; }
          .row.g-4 { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}