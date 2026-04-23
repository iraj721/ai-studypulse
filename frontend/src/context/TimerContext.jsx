import React, { createContext, useState, useEffect, useContext } from 'react';

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
    currentSessionStart: null,
    sessionHistory: []
  });

  // Load timer state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('timerState');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Don't restore active state if it was running
      setTimerState({
        ...parsed,
        isActive: false,
        currentSessionStart: null
      });
    }
    
    const savedHistory = localStorage.getItem('timerSessionHistory');
    if (savedHistory) {
      setTimerState(prev => ({
        ...prev,
        sessionHistory: JSON.parse(savedHistory)
      }));
    }
  }, []);

  // Save timer state to localStorage whenever it changes
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

  const startTimer = () => {
    setTimerState(prev => ({
      ...prev,
      isActive: true,
      currentSessionStart: new Date()
    }));
  };

  const pauseTimer = () => {
    setTimerState(prev => ({ ...prev, isActive: false }));
  };

  const resetTimer = () => {
    const studyMins = timerState.mode === 'study' ? timerState.studyDuration : 
                      (timerState.mode === 'break' && timerState.sessions % 4 === 0 ? timerState.longBreakDuration : timerState.breakDuration);
    setTimerState(prev => ({
      ...prev,
      timeLeft: studyMins * 60,
      isActive: false,
      currentSessionStart: null
    }));
  };

  const updateSettings = (study, shortBreak, longBreak) => {
    setTimerState(prev => ({
      ...prev,
      studyDuration: study,
      breakDuration: shortBreak,
      longBreakDuration: longBreak,
      timeLeft: prev.mode === 'study' ? study * 60 : (prev.mode === 'break' && prev.sessions % 4 === 0 ? longBreak * 60 : shortBreak * 60)
    }));
  };

  const addCompletedSession = (subject, topic, duration) => {
    const newSession = {
      id: Date.now(),
      subject,
      topic,
      duration,
      date: new Date().toISOString(),
      type: 'pomodoro'
    };
    setTimerState(prev => ({
      ...prev,
      sessions: prev.sessions + 1,
      sessionHistory: [newSession, ...prev.sessionHistory].slice(0, 50)
    }));
    
    // Save to localStorage
    const updatedHistory = [newSession, ...timerState.sessionHistory].slice(0, 50);
    localStorage.setItem('timerSessionHistory', JSON.stringify(updatedHistory));
  };

  const completeSession = () => {
    setTimerState(prev => {
      const newSessions = prev.sessions + 1;
      const isLongBreak = newSessions % 4 === 0;
      return {
        ...prev,
        sessions: newSessions,
        mode: 'break',
        timeLeft: (isLongBreak ? prev.longBreakDuration : prev.breakDuration) * 60,
        isActive: true,
        currentSessionStart: new Date()
      };
    });
  };

  const completeBreak = () => {
    setTimerState(prev => ({
      ...prev,
      mode: 'study',
      timeLeft: prev.studyDuration * 60,
      isActive: true,
      currentSessionStart: new Date()
    }));
  };

  const clearHistory = () => {
    setTimerState(prev => ({ ...prev, sessionHistory: [] }));
    localStorage.removeItem('timerSessionHistory');
  };

  return (
    <TimerContext.Provider value={{
      timerState,
      startTimer,
      pauseTimer,
      resetTimer,
      updateSettings,
      addCompletedSession,
      completeSession,
      completeBreak,
      clearHistory
    }}>
      {children}
    </TimerContext.Provider>
  );
};