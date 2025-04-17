// src/hooks/useTimer.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { calculateWPM } from '../utils/helpers';

// Configuration
const AUTO_PAUSE_DELAY = 3000; // Milliseconds of inactivity before pausing

/**
 * Custom hook to manage timer functionality and WPM calculations
 * 
 * @param {Object} currentSnippet - The current code snippet object
 * @param {Array} typedLines - Array of typed text lines 
 * @param {Object} currentPosition - Current cursor position {line, char}
 * @param {Object} errorPositions - Map of error positions
 * @param {Boolean} completed - Whether typing is completed
 * @returns {Object} - Timer state and functions
 */
const useTimer = (currentSnippet, typedLines, currentPosition, errorPositions, completed) => {
  // Timer state
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentElapsedTime, setCurrentElapsedTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [lastInputTime, setLastInputTime] = useState(null);

  // Refs for timers
  const intervalRef = useRef(null);
  const pauseTimerRef = useRef(null);

  // Timer logic for WPM calculation
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // If user has started typing and isn't paused or completed
    if (startTime && !completed && !isPaused) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsedSinceStart = (now - startTime) / 1000;
        const totalElapsed = elapsedTime + elapsedSinceStart;
        setCurrentElapsedTime(totalElapsed);

        // Calculate WPM based on correctly typed characters
        let correctChars = 0;
        const snippetLines = currentSnippet?.code?.split('\n') || [];
        
        for (let i = 0; i < typedLines.length; i++) {
          const typed = typedLines[i];
          const target = snippetLines[i] || "";
          
          if (i < currentPosition.line) { // Count full correct lines
            // Check if the line matches target AND has no recorded errors for that line
            let lineHasError = false;
            for (const key in errorPositions) {
              if (key.startsWith(`${i}:`)) {
                lineHasError = true;
                break;
              }
            }
            if (typed === target && !lineHasError) {
              correctChars += target.length + 1; // +1 for newline/enter
            }
          } else if (i === currentPosition.line) { // Count correct chars on current line up to cursor
            for (let j = 0; j < currentPosition.char; j++) {
              // Check char match AND no error at that specific position
              if (j < typed.length && j < target.length && typed[j] === target[j] && !errorPositions[`${i}:${j}`]) {
                correctChars++;
              }
            }
          }
        }

        // Calculate WPM
        const minutes = totalElapsed / 60;
        const calculatedWpm = minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0;
        setWpm(calculatedWpm);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [startTime, elapsedTime, completed, isPaused, typedLines, currentPosition, errorPositions, currentSnippet]);

  // Handle auto-pause
  useEffect(() => {
    // Clear any existing auto-pause timer
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }

    // Set up auto-pause timer if needed
    if (startTime && !completed && !isPaused && lastInputTime) {
      pauseTimerRef.current = setTimeout(() => {
        console.log("Auto-pausing due to inactivity");
        setIsPaused(true);
        const elapsedSinceStart = (Date.now() - startTime) / 1000;
        setElapsedTime(prev => prev + elapsedSinceStart);
        setStartTime(null);
      }, AUTO_PAUSE_DELAY);
    }

    return () => {
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }
    };
  }, [lastInputTime, startTime, completed, isPaused]);

  // Start timer on first input if not already started
  const startTimer = useCallback(() => {
    if (!startTime && !completed && !isPaused) {
      console.log("Starting timer");
      setStartTime(Date.now());
    }
  }, [startTime, completed, isPaused]);

  // Resume from pause
  const resumeTimer = useCallback(() => {
    if (isPaused) {
      console.log("Resuming timer");
      setIsPaused(false);
      setStartTime(Date.now());
    }
  }, [isPaused]);

  // Reset timer
  const resetTimer = useCallback(() => {
    console.log("Resetting timer");
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }
    
    setStartTime(null);
    setElapsedTime(0);
    setCurrentElapsedTime(0);
    setWpm(0);
    setIsPaused(false);
    setLastInputTime(null);
  }, []);

  // Calculate final WPM
  const calculateFinalWPM = useCallback(() => {
    if (!currentSnippet?.code) return;
    
    const targetText = currentSnippet.code;
    let correctChars = targetText.replace(/\n/g, '').length;
    const finalTotalElapsed = currentElapsedTime || 0.1; // Prevent division by zero
    
    // Use helper function to calculate final WPM
    const finalWpm = calculateWPM(correctChars, finalTotalElapsed);
    setWpm(finalWpm);
  }, [currentSnippet, currentElapsedTime]);

  return {
    startTime,
    elapsedTime,
    currentElapsedTime,
    wpm,
    isPaused,
    lastInputTime,
    setLastInputTime,
    setIsPaused,
    startTimer,
    resetTimer,
    resumeTimer,
    calculateFinalWPM
  };
};

export default useTimer;