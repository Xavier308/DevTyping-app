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

  // Refs to keep latest typing state
  const typedRef    = useRef(typedLines);
  const positionRef = useRef(currentPosition);
  const errorsRef   = useRef(errorPositions);
  const snippetRef  = useRef(currentSnippet);

  // Sync refs when values update
  useEffect(() => { typedRef.current    = typedLines;       }, [typedLines]);
  useEffect(() => { positionRef.current = currentPosition;  }, [currentPosition]);
  useEffect(() => { errorsRef.current   = errorPositions;   }, [errorPositions]);
  useEffect(() => { snippetRef.current  = currentSnippet;   }, [currentSnippet]);

  // Timer logic for WPM calculation
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start interval if running
    if (startTime && !completed && !isPaused) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsedSinceStart = (now - startTime) / 1000;
        const totalElapsed = elapsedTime + elapsedSinceStart;
        setCurrentElapsedTime(totalElapsed);

        // Calculate WPM based on correctly typed characters
        let correctChars = 0;
        const snippetLines = snippetRef.current?.code?.split('\n') || [];

        for (let i = 0; i < typedRef.current.length; i++) {
          const typed = typedRef.current[i];
          const target = snippetLines[i] || '';

          if (i < positionRef.current.line) {
            // Full line correct and no errors
            let lineHasError = false;
            Object.keys(errorsRef.current).forEach(key => {
              if (key.startsWith(`${i}:`)) lineHasError = true;
            });
            if (typed === target && !lineHasError) {
              correctChars += target.length + 1; // +1 for newline
            }
          } else if (i === positionRef.current.line) {
            // Partial line up to cursor
            for (let j = 0; j < positionRef.current.char; j++) {
              if (
                j < typed.length &&
                j < target.length &&
                typed[j] === target[j] &&
                !errorsRef.current[`${i}:${j}`]
              ) {
                correctChars++;
              }
            }
          }
        }

        const minutes = totalElapsed / 60;
        const calculated = minutes > 0
          ? Math.round((correctChars / 5) / minutes)
          : 0;
        setWpm(calculated);
      }, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [startTime, elapsedTime, isPaused, completed]);

  // Handle auto-pause
  useEffect(() => {
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
    }

    if (startTime && !completed && !isPaused && lastInputTime) {
      pauseTimerRef.current = setTimeout(() => {
        console.log('Auto-pausing due to inactivity');
        setIsPaused(true);
        const elapsedSinceStart = (Date.now() - startTime) / 1000;
        setElapsedTime(prev => prev + elapsedSinceStart);
        setStartTime(null);
      }, AUTO_PAUSE_DELAY);
    }

    return () => clearTimeout(pauseTimerRef.current);
  }, [lastInputTime, startTime, completed, isPaused]);

  // Start timer on first input
  const startTimer = useCallback(() => {
    if (!startTime && !completed && !isPaused) {
      console.log('Starting timer');
      setStartTime(Date.now());
    }
  }, [startTime, completed, isPaused]);

  // Resume from pause
  const resumeTimer = useCallback(() => {
    if (isPaused) {
      console.log('Resuming timer');
      setIsPaused(false);
      setStartTime(Date.now());
    }
  }, [isPaused]);

  // Reset timer
  const resetTimer = useCallback(() => {
    console.log('Resetting timer');
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);

    setStartTime(null);
    setElapsedTime(0);
    setCurrentElapsedTime(0);
    setWpm(0);
    setIsPaused(false);
    setLastInputTime(null);
  }, []);

  // Calculate final WPM on completion
  const calculateFinalWPM = useCallback(() => {
    const code = snippetRef.current?.code;
    if (!code) return;
    const charCount = code.replace(/\n/g, '').length;
    const timeSec = currentElapsedTime || 0.1; // prevent zero
    const finalWpm = calculateWPM(charCount, timeSec);
    setWpm(finalWpm);
  }, [currentElapsedTime]);

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
