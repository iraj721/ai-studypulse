import React, { createContext, useState, useEffect, useContext, useRef } from 'react';

const TimerContext = createContext();

export const useTimer = () => useContext(TimerContext);

export const TimerProvider = ({ children }) => {
  const [timerState, setTimerState] = useState({
    mode: 'study',
    timeLeft: 25 * 60,
    isActive: false,
    sessions: 0,
    studyDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionHistory: []
  });
  
  const intervalRef = useRef(null);
  const [pendingSave, setPendingSave] = useState(null);

  // ✅ Load saved state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('timerState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimerState(prev => ({
          ...prev,
          ...parsed,
          isActive: false
        }));
      } catch (e) {
        console.error("Failed to load timer state:", e);
      }
    }
    
    const savedHistory = localStorage.getItem('timerSessionHistory');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setTimerState(prev => ({
          ...prev,
          sessionHistory: history
        }));
      } catch (e) {
        console.error("Failed to load timer history:", e);
      }
    }
  }, []);

  // ✅ Save state to localStorage
  useEffect(() => {
    const toSave = {
      mode: timerState.mode,
      timeLeft: timerState.timeLeft,
      studyDuration: timerState.studyDuration,
      breakDuration: timerState.breakDuration,
      longBreakDuration: timerState.longBreakDuration,
      sessions: timerState.sessions
    };
    localStorage.setItem('timerState', JSON.stringify(toSave));
  }, [timerState.mode, timerState.timeLeft, timerState.studyDuration, timerState.breakDuration, timerState.longBreakDuration, timerState.sessions]);

  // ✅ Save history to localStorage
  useEffect(() => {
    localStorage.setItem('timerSessionHistory', JSON.stringify(timerState.sessionHistory));
  }, [timerState.sessionHistory]);

  // ✅ TIMER COUNTDOWN LOGIC
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (timerState.isActive && timerState.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimerState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1
        }));
      }, 1000);
    }
    
    // When timer reaches 0
    if (timerState.timeLeft === 0 && timerState.isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      if (timerState.mode === 'study') {
        // ✅ Show save modal for completed study session
        const newSessions = timerState.sessions + 1;
        const isLongBreak = newSessions % 4 === 0;
        
        // Store pending save info
        setPendingSave({
          duration: timerState.studyDuration,
          sessions: newSessions
        });
        
        setTimerState(prev => ({
          ...prev,
          sessions: newSessions,
          mode: 'break',
          timeLeft: (isLongBreak ? prev.longBreakDuration : prev.breakDuration) * 60,
          isActive: true
        }));
      } else {
        // Break completed - switch to study
        setTimerState(prev => ({
          ...prev,
          mode: 'study',
          timeLeft: prev.studyDuration * 60,
          isActive: true
        }));
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.isActive, timerState.timeLeft, timerState.mode, timerState.sessions]);

  const startTimer = () => {
    setTimerState(prev => ({ ...prev, isActive: true }));
  };

  const pauseTimer = () => {
    setTimerState(prev => ({ ...prev, isActive: false }));
  };

  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    const studyMins = timerState.mode === 'study' ? timerState.studyDuration : 
                      (timerState.mode === 'break' && timerState.sessions % 4 === 0 ? timerState.longBreakDuration : timerState.breakDuration);
    setTimerState(prev => ({
      ...prev,
      timeLeft: studyMins * 60,
      isActive: false
    }));
  };

  const updateSettings = (study, shortBreak, longBreak) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setTimerState(prev => ({
      ...prev,
      studyDuration: study,
      breakDuration: shortBreak,
      longBreakDuration: longBreak,
      timeLeft: prev.mode === 'study' ? study * 60 : (prev.mode === 'break' && prev.sessions % 4 === 0 ? longBreak * 60 : shortBreak * 60),
      isActive: false
    }));
  };

  // ✅ Save completed session to history
  const addCompletedSession = (subject, topic, duration) => {
    const newSession = {
      id: Date.now(),
      subject: subject || "Study Session",
      topic: topic || "Pomodoro",
      duration: duration || 25,
      date: new Date().toISOString(),
      type: 'pomodoro',
      completedAt: new Date().toLocaleTimeString()
    };
    
    setTimerState(prev => ({
      ...prev,
      sessionHistory: [newSession, ...prev.sessionHistory].slice(0, 50)
    }));
    
    // Clear pending save
    setPendingSave(null);
  };

  // ✅ Get pending save info
  const getPendingSave = () => pendingSave;

  // ✅ Clear pending save (when user skips)
  const clearPendingSave = () => {
    setPendingSave(null);
  };

  const clearHistory = () => {
    setTimerState(prev => ({ ...prev, sessionHistory: [] }));
  };

  return (
    <TimerContext.Provider value={{
      timerState,
      startTimer,
      pauseTimer,
      resetTimer,
      updateSettings,
      addCompletedSession,
      getPendingSave,
      clearPendingSave,
      clearHistory
    }}>
      {children}
    </TimerContext.Provider>
  );
};