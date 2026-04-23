import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimer } from '../context/TimerContext';
import { FaPlay, FaPause, FaUndo, FaExternalLinkAlt } from 'react-icons/fa';

export default function MiniTimer() {
  const navigate = useNavigate();
  const { timerState, startTimer, pauseTimer, resetTimer } = useTimer();

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

  return (
    <div className="mini-timer">
      <div className="mini-timer-header">
        <span className="mini-timer-icon">⏱️</span>
        <span className="mini-timer-label">{timerState.mode === 'study' ? 'Focus' : 'Break'}</span>
        <button className="mini-timer-expand" onClick={() => navigate('/timer')}>
          <FaExternalLinkAlt />
        </button>
      </div>
      <div className="mini-timer-time">{formatTime(timerState.timeLeft)}</div>
      <div className="mini-timer-progress">
        <div className="mini-timer-progress-bar" style={{ width: `${getProgressPercent()}%` }}></div>
      </div>
      <div className="mini-timer-controls">
        {!timerState.isActive ? (
          <button onClick={startTimer} className="mini-timer-play">
            <FaPlay />
          </button>
        ) : (
          <button onClick={pauseTimer} className="mini-timer-pause">
            <FaPause />
          </button>
        )}
        <button onClick={resetTimer} className="mini-timer-reset">
          <FaUndo />
        </button>
      </div>
      <div className="mini-timer-sessions">✅ {timerState.sessions} sessions</div>

      <style>{`
        .mini-timer {
          background: linear-gradient(145deg, #ebf1f4ff, #bedaf3ff);
          border-radius: 16px;
          padding: 12px;
          text-align: center;
        }
        .mini-timer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .mini-timer-icon { font-size: 18px; }
        .mini-timer-label { font-size: 12px; font-weight: 600; color: #4f46e5; }
        .mini-timer-expand {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          font-size: 12px;
        }
        .mini-timer-time {
          font-size: 28px;
          font-weight: bold;
          font-family: monospace;
          margin: 8px 0;
          color: #1e293b;
        }
        .mini-timer-progress {
          background: #e2e8f0;
          border-radius: 4px;
          height: 4px;
          margin: 8px 0;
          overflow: hidden;
        }
        .mini-timer-progress-bar {
          background: linear-gradient(90deg, #4f46e5, #6366f1);
          height: 100%;
          transition: width 0.3s;
        }
        .mini-timer-controls {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin: 10px 0;
        }
        .mini-timer-play, .mini-timer-pause, .mini-timer-reset {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mini-timer-play { background: #22c55e; color: white; }
        .mini-timer-pause { background: #f59e0b; color: white; }
        .mini-timer-reset { background: #6b7280; color: white; }
        .mini-timer-sessions { font-size: 10px; color: #6b7280; margin-top: 8px; }
      `}</style>
    </div>
  );
}