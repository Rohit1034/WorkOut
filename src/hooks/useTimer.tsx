
import { useState, useEffect, useRef } from 'react';

export const useTimer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      const startTime = Date.now() - seconds * 1000;
      
      intervalRef.current = window.setInterval(() => {
        setSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    }
  };

  const pauseTimer = () => {
    if (isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsRunning(false);
    }
  };

  const resetTimer = () => {
    pauseTimer();
    setSeconds(0);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTime = () => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return {
    seconds,
    isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    formatTime
  };
};
