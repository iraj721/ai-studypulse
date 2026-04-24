import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Stars from "../../components/Stars";
import BackButton from "../../components/BackButton";
import Toast from "../../components/Toast";
import { useTimer } from "../../context/TimerContext";
import { 
  FaPlay, FaPause, FaUndo, FaClock, FaSave, FaSpinner, 
  FaChartLine, FaTrash, FaHistory 
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
    clearHistory 
  } = useTimer();
  
  const [showSettings, setShowSettings] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [studyDuration, setStudyDuration] = useState(timerState?.studyDuration || 25);
  const [breakDuration, setBreakDuration] = useState(timerState?.breakDuration || 5);
  const [longBreakDuration, setLongBreakDuration] = useState(timerState?.longBreakDuration || 15);
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [showStats, setShowStats] = useState(false);
  
  const audioRef = useRef(null);

  // ✅ Check for pending save on mount (when session completed)
  useEffect(() => {
    const pending = getPendingSave?.();
    if (pending) {
      setShowSaveModal(true);
    }
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercent = () => {
    const total = timerState.mode === 'study' ? timerState.studyDuration * 60 : 
                  (timerState.mode === 'break' && timerState.sessions % 4 === 0 ? timerState.longBreakDuration * 60 : timerState.breakDuration * 60);
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
        notes: `Pomodoro session completed on ${new Date().toLocaleString()}`
      });
      
      // ✅ Save to timer history
      addCompletedSession(subject.trim(), topic.trim(), timerState.studyDuration);
      
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

  // ✅ Calculate statistics with safe checks
  const sessionHistory = timerState?.sessionHistory || [];
  const totalSessions = sessionHistory.length;
  const totalMinutes = sessionHistory.reduce((sum, s) => sum + (s?.duration || 0), 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  const successRate = timerState?.sessions > 0 ? Math.round((totalSessions / timerState.sessions) * 100) : 0;

  return (
    <div className="timer-page min-vh-100 py-5 position-relative">
      <Stars />
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />
      
      <audio ref={audioRef} src="https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3" />

      <div className="container">
        <BackButton to="/dashboard" label="← Back to Dashboard" />

        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <h2 className="text-white fw-bold">⏱️ Pomodoro Timer</h2>
          <div className="timer-actions">
            <button onClick={() => setShowStats(!showStats)} className="btn-stats">
              <FaChartLine /> Stats
            </button>
            <button onClick={() => setShowSettings(!showSettings)} className="btn-settings">
              <FaClock /> Settings
            </button>
          </div>
        </div>

        {/* Statistics Panel */}
        {showStats && (
          <div className="stats-panel p-4 mb-4">
            <div className="stats-header">
              <h5>📊 Timer Statistics</h5>
              {totalSessions > 0 && (
                <button onClick={clearHistory} className="btn-clear-stats">
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
                <div className="stat-value">{totalHours}h {remainingMinutes}m</div>
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
                    <span><strong>{session.subject}</strong> - {session.topic}</span>
                    <span>{session.duration} min</span>
                    <span className="history-date">{new Date(session.date).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="settings-card p-4 mb-4">
            <h5 className="mb-3">⚙️ Timer Settings</h5>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Study Duration (minutes)</label>
                <input type="number" className="form-control" min="1" max="120" value={studyDuration} onChange={(e) => setStudyDuration(parseInt(e.target.value) || 25)} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Break Duration (minutes)</label>
                <input type="number" className="form-control" min="1" max="30" value={breakDuration} onChange={(e) => setBreakDuration(parseInt(e.target.value) || 5)} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Long Break (minutes)</label>
                <input type="number" className="form-control" min="5" max="60" value={longBreakDuration} onChange={(e) => setLongBreakDuration(parseInt(e.target.value) || 15)} />
              </div>
            </div>
            <button onClick={applySettings} className="btn-apply mt-3">Apply Settings</button>
          </div>
        )}

        {/* Main Timer Display */}
        <div className="timer-card p-4 mb-4">
          <div className="mode-selector">
            <button className={`mode-btn ${timerState?.mode === 'study' ? 'active' : ''}`}>
              📚 Study
            </button>
            <button className={`mode-btn ${timerState?.mode === 'break' ? 'active' : ''}`}>
              ☕ Break
            </button>
          </div>

          <div className="timer-display">{formatTime(timerState?.timeLeft || 0)}</div>

          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${getProgressPercent()}%` }}></div>
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
            <span className="session-count">✅ Completed Sessions: {timerState?.sessions || 0}</span>
            <span className="session-status">
              {timerState?.mode === 'study' ? '🎯 Focus Time!' : '🧘 Take a break!'}
            </span>
          </div>
        </div>

        {/* Session History */}
        <div className="history-section">
          <h5><FaHistory /> Session History ({totalSessions} sessions)</h5>
          {totalSessions === 0 ? (
            <div className="empty-history">
              No sessions recorded yet. 
              <br />
              <small>Complete a study session and save it to see it here!</small>
            </div>
          ) : (
            <div className="history-grid">
              {sessionHistory.map((session) => (
                <div key={session.id} className="history-record">
                  <div className="record-icon">✅</div>
                  <div className="record-details">
                    <div className="record-title">{session.subject} - {session.topic}</div>
                    <div className="record-meta">
                      {session.duration} min • {new Date(session.date).toLocaleString()}
                      {session.completedAt && <span> • Completed at {session.completedAt}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Save Session Modal */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={skipSave}>
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
              <button onClick={handleSaveSession} disabled={saving} className="btn-save">
                {saving ? <><FaSpinner className="spinner" /> Saving...</> : <><FaSave /> Save Session</>}
              </button>
              <button onClick={skipSave} className="btn-skip">Skip</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .timer-page { background: linear-gradient(180deg, #080e18 0%, #122138 25%, #1e3652 50%, #28507e 75%, #1a2a3d 100%); min-height: 100vh; }
        .timer-actions { display: flex; gap: 12px; }
        .btn-stats, .btn-settings { background: rgba(255,255,255,0.15); border: none; color: white; padding: 8px 16px; border-radius: 30px; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        .stats-panel { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 20px; color: white; margin-top: 20px; }
        .stats-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
        .btn-clear-stats { background: rgba(239,68,68,0.2); border: none; color: #ef4444; padding: 6px 12px; border-radius: 20px; cursor: pointer; font-size: 12px; }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 20px; }
        .stat-card { text-align: center; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 16px; }
        .stat-value { font-size: 24px; font-weight: bold; }
        .stat-label { font-size: 12px; opacity: 0.7; margin-top: 5px; }
        .history-list-mini { margin-top: 15px; max-height: 200px; overflow-y: auto; }
        .history-item-mini { display: flex; justify-content: space-between; align-items: center; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 8px; margin-bottom: 5px; font-size: 12px; flex-wrap: wrap; gap: 5px; }
        .history-date { color: #94a3b8; font-size: 10px; }
        .settings-card { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 20px; color: white; }
        .settings-card .form-control { background: rgba(255,255,255,0.2); border: none; color: white; padding: 10px; border-radius: 10px; }
        .btn-apply { background: linear-gradient(135deg, #4f46e5, #6366f1); border: none; color: white; padding: 8px 24px; border-radius: 30px; cursor: pointer; }
        .timer-card { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 30px; text-align: center; color: white; padding: 30px; }
        .mode-selector { display: flex; justify-content: center; gap: 20px; margin-bottom: 30px; }
        .mode-btn { background: rgba(255,255,255,0.15); border: none; color: white; padding: 10px 30px; border-radius: 40px; cursor: pointer; font-size: 16px; }
        .mode-btn.active { background: linear-gradient(135deg, #4f46e5, #6366f1); }
        .timer-display { font-size: 80px; font-weight: bold; font-family: monospace; margin: 20px 0; letter-spacing: 5px; }
        .progress-bar-container { background: rgba(255,255,255,0.2); border-radius: 10px; height: 8px; margin: 20px 0; overflow: hidden; }
        .progress-bar { background: linear-gradient(90deg, #10b981, #34d399); height: 100%; transition: width 0.3s; }
        .timer-controls { display: flex; justify-content: center; gap: 20px; margin: 30px 0; }
        .control-btn { padding: 12px 30px; border: none; border-radius: 40px; font-size: 16px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 10px; }
        .control-btn.play { background: #22c55e; color: white; }
        .control-btn.pause { background: #f59e0b; color: white; }
        .control-btn.reset { background: #6b7280; color: white; }
        .session-info { display: flex; justify-content: space-between; padding: 15px 20px; background: rgba(255,255,255,0.1); border-radius: 20px; margin-top: 20px; flex-wrap: wrap; gap: 10px; }
        .history-section { margin-top: 30px; }
        .history-section h5 { color: white; margin-bottom: 15px; }
        .empty-history { text-align: center; padding: 30px; background: rgba(255,255,255,0.05); border-radius: 16px; color: rgba(255,255,255,0.6); }
        .history-grid { display: flex; flex-direction: column; gap: 10px; max-height: 400px; overflow-y: auto; }
        .history-record { display: flex; align-items: center; gap: 15px; padding: 12px; background: rgba(255,255,255,0.08); border-radius: 12px; transition: transform 0.2s; }
        .history-record:hover { transform: translateX(5px); background: rgba(255,255,255,0.12); }
        .record-icon { font-size: 20px; }
        .record-details { flex: 1; }
        .record-title { font-weight: 500; color: white; }
        .record-meta { font-size: 11px; color: #94a3b8; margin-top: 4px; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: white; padding: 30px; border-radius: 24px; width: 90%; max-width: 400px; text-align: center; animation: modalPop 0.3s ease; }
        @keyframes modalPop { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .modal-icon { font-size: 48px; margin-bottom: 15px; }
        .modal-desc { font-size: 13px; color: #6b7280; margin-bottom: 20px; }
        .modal-content input { width: 100%; padding: 12px; margin: 8px 0; border: 1px solid #e2e8f0; border-radius: 12px; }
        .modal-actions { display: flex; gap: 12px; margin-top: 20px; }
        .btn-save { flex: 1; background: #22c55e; color: white; border: none; padding: 12px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-skip { flex: 1; background: #6b7280; color: white; border: none; padding: 12px; border-radius: 12px; cursor: pointer; }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .timer-display { font-size: 50px; letter-spacing: 2px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .timer-actions { width: 100%; justify-content: center; }
          .mode-selector { gap: 10px; }
          .mode-btn { padding: 8px 20px; font-size: 14px; }
          .control-btn { padding: 8px 20px; font-size: 14px; }
        }
      `}</style>
    </div>
  );
}