import React, { useState, useEffect } from "react";
import { FaPlay, FaPause, FaUndo, FaClock } from "react-icons/fa";
import api from "../services/api";

export default function StudyTimer({ onActivityAdd }) {
  const [mode, setMode] = useState('study');
  const [studyDuration, setStudyDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [timeLeft, setTimeLeft] = useState(studyDuration * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setTimeLeft(mode === 'study' ? studyDuration * 60 : (mode === 'break' && sessions > 0 && sessions % 4 === 0 ? longBreakDuration * 60 : breakDuration * 60));
  }, [studyDuration, breakDuration, longBreakDuration, mode, sessions]);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (mode === 'study') {
        setSessions(s => s + 1);
        setShowModal(true);
        setMode('break');
        setTimeLeft((sessions + 1) % 4 === 0 ? longBreakDuration * 60 : breakDuration * 60);
        setIsActive(true);
      } else {
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
    setTimeLeft(mode === 'study' ? studyDuration * 60 : (mode === 'break' && sessions % 4 === 0 ? longBreakDuration * 60 : breakDuration * 60));
  };

  const handleAddActivity = async () => {
    if (subject && topic) {
      try {
        await api.post("/activities", {
          subject,
          topic,
          durationMinutes: studyDuration,
          notes: `Pomodoro session completed`,
        });
        if (onActivityAdd) onActivityAdd();
        setShowModal(false);
        setSubject("");
        setTopic("");
      } catch (err) {
        console.error(err);
      }
    }
  };

  const applySettings = () => {
    setShowSettings(false);
    setTimeLeft(mode === 'study' ? studyDuration * 60 : (mode === 'break' && sessions % 4 === 0 ? longBreakDuration * 60 : breakDuration * 60));
    setIsActive(false);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontWeight: 'bold', fontSize: '14px' }}>⏱️ Pomodoro Timer</span>
        <button onClick={() => setShowSettings(!showSettings)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
          <FaClock />
        </button>
      </div>

      {showSettings && (
        <div style={{ background: '#f0f0f0', padding: '10px', borderRadius: '12px', marginBottom: '10px' }}>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', marginRight: '8px' }}>Study (min):</label>
            <input type="number" min="1" max="120" value={studyDuration} onChange={(e) => setStudyDuration(parseInt(e.target.value) || 25)} style={{ width: '60px', padding: '4px', borderRadius: '6px', border: '1px solid #ddd' }} />
          </div>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', marginRight: '8px' }}>Break (min):</label>
            <input type="number" min="1" max="30" value={breakDuration} onChange={(e) => setBreakDuration(parseInt(e.target.value) || 5)} style={{ width: '60px', padding: '4px', borderRadius: '6px', border: '1px solid #ddd' }} />
          </div>
          <div style={{ marginBottom: '8px' }}>
            <label style={{ fontSize: '12px', marginRight: '8px' }}>Long Break (min):</label>
            <input type="number" min="5" max="60" value={longBreakDuration} onChange={(e) => setLongBreakDuration(parseInt(e.target.value) || 15)} style={{ width: '60px', padding: '4px', borderRadius: '6px', border: '1px solid #ddd' }} />
          </div>
          <button onClick={applySettings} style={{ background: '#4f46e5', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>Apply</button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
        <span style={{ padding: '4px 12px', borderRadius: '20px', background: mode === 'study' ? '#4f46e5' : '#e5e7eb', color: mode === 'study' ? 'white' : '#666', cursor: 'pointer', fontSize: '12px' }} onClick={() => { if (!isActive) { setMode('study'); setTimeLeft(studyDuration * 60); } }}>📚 Study</span>
        <span style={{ padding: '4px 12px', borderRadius: '20px', background: mode === 'break' ? '#4f46e5' : '#e5e7eb', color: mode === 'break' ? 'white' : '#666', cursor: 'pointer', fontSize: '12px' }} onClick={() => { if (!isActive) { setMode('break'); setTimeLeft((sessions % 4 === 0 && sessions > 0) ? longBreakDuration * 60 : breakDuration * 60); } }}>☕ Break</span>
      </div>
      
      <div style={{ fontSize: '32px', fontWeight: 'bold', fontFamily: 'monospace', margin: '10px 0' }}>{formatTime(timeLeft)}</div>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
        {!isActive ? (
          <button onClick={startTimer} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#22c55e', color: 'white', border: 'none', cursor: 'pointer' }}><FaPlay /></button>
        ) : (
          <button onClick={pauseTimer} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f59e0b', color: 'white', border: 'none', cursor: 'pointer' }}><FaPause /></button>
        )}
        <button onClick={resetTimer} style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#6b7280', color: 'white', border: 'none', cursor: 'pointer' }}><FaUndo /></button>
      </div>
      
      <div style={{ fontSize: '12px', color: '#6b7280' }}>✅ Completed: {sessions} sessions</div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '16px', width: '280px', textAlign: 'center' }}>
            <h4>🎉 Great job!</h4>
            <input type="text" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} style={{ width: '100%', padding: '8px', margin: '8px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
            <input type="text" placeholder="Topic" value={topic} onChange={(e) => setTopic(e.target.value)} style={{ width: '100%', padding: '8px', margin: '8px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
            <button onClick={handleAddActivity} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', margin: '5px', cursor: 'pointer' }}>Save</button>
            <button onClick={() => setShowModal(false)} style={{ background: '#6b7280', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', margin: '5px', cursor: 'pointer' }}>Skip</button>
          </div>
        </div>
      )}
    </div>
  );
}