import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimer } from '../context/TimerContext';
import { FaPlay, FaPause, FaUndo, FaExpand, FaTimes, FaClock } from 'react-icons/fa';

export default function FloatingTimer() {
  const navigate = useNavigate();
  const { timerState, startTimer, pauseTimer, resetTimer } = useTimer();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const timerRef = useRef(null);

  // Load saved position from localStorage
  useEffect(() => {
    const savedPosition = localStorage.getItem('floatingTimerPosition');
    if (savedPosition) {
      setPosition(JSON.parse(savedPosition));
    }
  }, []);

  // Save position when changed
  useEffect(() => {
    localStorage.setItem('floatingTimerPosition', JSON.stringify(position));
  }, [position]);

  // Auto-show when timer is active (study mode)
  useEffect(() => {
    if (timerState.isActive && timerState.mode === 'study') {
      setIsVisible(true);
    }
  }, [timerState.isActive, timerState.mode]);

  // Auto-minimize when not active for 30 seconds
  useEffect(() => {
    let timeout;
    if (!timerState.isActive && !isMinimized && isVisible) {
      timeout = setTimeout(() => {
        setIsMinimized(true);
      }, 30000);
    }
    return () => clearTimeout(timeout);
  }, [timerState.isActive, isMinimized, isVisible]);

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

  const handleMouseDown = (e) => {
    if (e.target.closest('.floating-timer-controls') || e.target.closest('.close-timer-btn')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    const maxX = window.innerWidth - 280;
    const maxY = window.innerHeight - 150;
    
    setPosition({
      x: Math.min(Math.max(0, newX), maxX),
      y: Math.min(Math.max(0, newY), maxY)
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleClose = () => {
    setIsVisible(false);
    pauseTimer();
  };

  const handleShow = () => {
    setIsVisible(true);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={timerRef}
      className={`floating-timer ${isMinimized ? 'minimized' : 'expanded'} ${timerState.isActive ? 'active' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        position: 'fixed',
        zIndex: 9999
      }}
    >
      <div className="floating-timer-header" onMouseDown={handleMouseDown}>
        <div className="timer-drag-handle">
          <FaClock className="drag-icon" />
          <span className="timer-mode-badge">{timerState.mode === 'study' ? '📚 Study' : '☕ Break'}</span>
        </div>
        <div className="timer-header-actions">
          <button onClick={() => setIsMinimized(!isMinimized)} className="minimize-btn">
            {isMinimized ? <FaExpand /> : <FaTimes />}
          </button>
          <button onClick={handleClose} className="close-timer-btn" title="Close timer">
            <FaTimes />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="floating-timer-body">
            <div className="floating-time">{formatTime(timerState.timeLeft)}</div>
            <div className="floating-progress">
              <div className="floating-progress-bar" style={{ width: `${getProgressPercent()}%` }}></div>
            </div>
            <div className="floating-timer-controls">
              {!timerState.isActive ? (
                <button onClick={startTimer} className="float-play">
                  <FaPlay />
                </button>
              ) : (
                <button onClick={pauseTimer} className="float-pause">
                  <FaPause />
                </button>
              )}
              <button onClick={resetTimer} className="float-reset">
                <FaUndo />
              </button>
              <button onClick={() => {
                navigate('/timer');
                handleShow();
              }} className="float-expand">
                <FaExpand />
              </button>
            </div>
            <div className="floating-sessions">
              ✅ {timerState.sessions} sessions
            </div>
          </div>
        </>
      )}

      {isMinimized && (
        <div className="floating-minimized" onClick={() => setIsMinimized(false)}>
          <span>{formatTime(timerState.timeLeft)}</span>
          <span className="mini-mode">{timerState.mode === 'study' ? '📚' : '☕'}</span>
        </div>
      )}

      <style>{`
        .floating-timer {
          background: linear-gradient(145deg, #1e293b, #0f172a);
          border-radius: 16px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.3);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
          min-width: 260px;
          cursor: move;
          transition: all 0.2s ease;
        }
        .floating-timer.active {
          border: 1px solid #4f46e5;
          box-shadow: 0 8px 25px rgba(79,70,229,0.3);
        }
        .floating-timer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          background: rgba(0,0,0,0.3);
          border-radius: 16px 16px 0 0;
          cursor: move;
        }
        .timer-drag-handle {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .drag-icon {
          color: #94a3b8;
          font-size: 12px;
        }
        .timer-mode-badge {
          font-size: 11px;
          font-weight: 600;
          color: #a5b4fc;
        }
        .timer-header-actions {
          display: flex;
          gap: 8px;
        }
        .minimize-btn, .close-timer-btn {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          font-size: 12px;
          padding: 2px 6px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .minimize-btn:hover, .close-timer-btn:hover {
          background: rgba(255,255,255,0.1);
          color: white;
        }
        .close-timer-btn:hover {
          color: #ef4444;
        }
        .floating-timer-body {
          padding: 12px;
        }
        .floating-time {
          font-size: 28px;
          font-weight: bold;
          font-family: monospace;
          text-align: center;
          color: white;
          letter-spacing: 2px;
        }
        .floating-progress {
          background: #334155;
          border-radius: 4px;
          height: 4px;
          margin: 10px 0;
          overflow: hidden;
        }
        .floating-progress-bar {
          background: linear-gradient(90deg, #4f46e5, #6366f1);
          height: 100%;
          transition: width 0.3s;
        }
        .floating-timer-controls {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin: 10px 0;
        }
        .float-play, .float-pause, .float-reset, .float-expand {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .float-play { background: #22c55e; color: white; }
        .float-pause { background: #f59e0b; color: white; }
        .float-reset { background: #6b7280; color: white; }
        .float-expand { background: #4f46e5; color: white; }
        .float-play:hover, .float-pause:hover, .float-reset:hover, .float-expand:hover {
          transform: scale(1.05);
        }
        .floating-sessions {
          text-align: center;
          font-size: 10px;
          color: #94a3b8;
          margin-top: 8px;
        }
        .floating-minimized {
          padding: 8px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          font-family: monospace;
          font-weight: bold;
          color: white;
        }
        .floating-minimized span:first-child {
          font-size: 18px;
        }
        .mini-mode {
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}