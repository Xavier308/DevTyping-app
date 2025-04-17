// src/hooks/useTypingLogic.js
import { useState, useCallback, useEffect, useRef } from 'react';

// Configuration
const VISIBLE_LINE_COUNT = 10; // Number of lines to display at once

/**
 * Custom hook to manage typing logic, error detection, and cursor positioning
 * 
 * @param {Object} currentSnippet - The current code snippet object
 * @param {Function} setLastInputTime - Optional function to update the last input time for auto-pause
 * @param {Boolean} completed - Whether the current typing session is completed
 * @returns {Object} - State and handlers for typing logic
 */
const useTypingLogic = (currentSnippet, setLastInputTime, completed) => {
  // User input state
  const [userInput, setUserInput] = useState('');
  
  // Line management
  const [currentLineIndex, setCurrentLineIndex] = useState(0); // Index of the top visible line
  const [visibleLines, setVisibleLines] = useState([]);
  const [typedLines, setTypedLines] = useState(['']);
  
  // Error tracking
  const [errorPositions, setErrorPositions] = useState({}); // { "line:char": true }
  const [fixedPositions, setFixedPositions] = useState({}); // { "line:char": true }
  const [currentPosition, setCurrentPosition] = useState({ line: 0, char: 0 });
  
  // Use a ref to store the handleInputChange function to avoid the circular reference
  const handleInputChangeRef = useRef(null);

  // Process input changes (typing, pasting, deleting)
  const handleInputChange = useCallback((e) => {
    if (completed || !currentSnippet?.code) return;

    const currentValue = e.target.value;
    
    // Update last input time if the callback is provided
    if (typeof setLastInputTime === 'function') {
      setLastInputTime(Date.now());
    }

    // Update core state
    setUserInput(currentValue);

    // Process input & calculate state
    const inputLines = currentValue.split('\n');
    const snippetLines = currentSnippet.code.split('\n');
    const newTypedLines = [...inputLines];

    // Determine current cursor position
    let cursorPosition = e.target.selectionStart;
    let determinedLineIndex = 0;
    let determinedCharIndex = 0;
    let cumulativeLength = 0;
    
    for (let i = 0; i < inputLines.length; i++) {
      const lineLength = inputLines[i].length;
      const lineEndPosition = cumulativeLength + lineLength;
      
      if (cursorPosition <= lineEndPosition) {
        determinedLineIndex = i;
        determinedCharIndex = cursorPosition - cumulativeLength;
        break;
      }
      cumulativeLength += lineLength + 1;
    }
    
    if (determinedLineIndex >= inputLines.length && inputLines.length > 0) {
      determinedLineIndex = inputLines.length - 1;
      determinedCharIndex = inputLines[determinedLineIndex].length;
    } else if (inputLines.length === 0) {
      determinedLineIndex = 0; 
      determinedCharIndex = 0;
    }

    // Recalculate errors and fixed positions
    const newErrors = {};
    const newFixed = {};

    for (let lineIdx = 0; lineIdx < Math.max(newTypedLines.length, snippetLines.length); lineIdx++) {
      const currentLineInput = newTypedLines[lineIdx] || '';
      const targetLine = snippetLines[lineIdx] || '';
      const maxLen = Math.max(currentLineInput.length, targetLine.length);

      for (let charIdx = 0; charIdx < maxLen; charIdx++) {
        const posKey = `${lineIdx}:${charIdx}`;
        const inputChar = currentLineInput[charIdx];
        const targetChar = targetLine[charIdx];
        const wasError = !!errorPositions[posKey];

        if (charIdx < currentLineInput.length && charIdx < targetLine.length) {
          // Character exists in both input and target
          if (inputChar === targetChar) {
            // Correctly typed character
            if (wasError) {
              newFixed[posKey] = true; // Mark as fixed if it was previously an error
            }
          } else {
            // Incorrectly typed character
            newErrors[posKey] = true; // Mark as error
          }
        } else if (charIdx < currentLineInput.length) {
          // Extra character typed by user (input longer than target)
          newErrors[posKey] = true;
        }
        // Missing characters in input compared to target are considered 'pending'
      }
    }

    // Update state only if changed to avoid unnecessary re-renders
    if (JSON.stringify(newTypedLines) !== JSON.stringify(typedLines)) {
      setTypedLines(newTypedLines);
    }
    if (determinedLineIndex !== currentPosition.line || determinedCharIndex !== currentPosition.char) {
      setCurrentPosition({ line: determinedLineIndex, char: determinedCharIndex });
    }
    if (JSON.stringify(newErrors) !== JSON.stringify(errorPositions)) {
      setErrorPositions(newErrors);
    }
    if (JSON.stringify(newFixed) !== JSON.stringify(fixedPositions)) {
      setFixedPositions(newFixed);
    }
  }, [currentSnippet, completed, errorPositions, typedLines, currentPosition, setLastInputTime]);

  // Store the current handleInputChange in the ref
  useEffect(() => {
    handleInputChangeRef.current = handleInputChange;
  }, [handleInputChange]);

  // Handle Tab and Enter key presses
  const handleKeyDown = useCallback((e) => {
    if (!currentSnippet?.code || completed) return;

    // Tab Key
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const value = e.target.value;
      const newValue = value.substring(0, start) + '    ' + value.substring(end);
      const newCursorPos = start + 4;

      // Update textarea value and cursor position
      e.target.value = newValue;
      e.target.selectionStart = e.target.selectionEnd = newCursorPos;

      // Trigger input change with the updated target state using the ref to avoid circular reference
      if (handleInputChangeRef.current) {
        handleInputChangeRef.current(e);
      }
    }
    // Enter Key
    else if (e.key === 'Enter') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const value = e.target.value;
      const newValue = value.substring(0, start) + '\n' + value.substring(end);
      const newCursorPos = start + 1;

      // Update textarea value and cursor position
      e.target.value = newValue;
      e.target.selectionStart = e.target.selectionEnd = newCursorPos;

      // Trigger input change with the updated target state using the ref to avoid circular reference
      if (handleInputChangeRef.current) {
        handleInputChangeRef.current(e);
      }

      // Scroll logic - scroll when cursor moves to the last visible line
      const nextLineLogicalIndex = currentPosition.line + 1; // Where the cursor will be logically
      // Check if the line the cursor *will move to* is beyond the currently displayed lines
      if (nextLineLogicalIndex >= currentLineIndex + VISIBLE_LINE_COUNT - 1) {
        // We need to show the next line, so advance the top visible line index
        if (currentSnippet?.code) {
          const snippetLines = currentSnippet.code.split('\n');
          const maxFirstLineIndex = Math.max(0, snippetLines.length - VISIBLE_LINE_COUNT);
          setCurrentLineIndex(prev => Math.min(prev + 1, maxFirstLineIndex));
        }
      }
    }
  }, [currentSnippet, completed, currentPosition, currentLineIndex]);

  // Update visible lines when currentSnippet or currentLineIndex changes
  useEffect(() => {
    if (!currentSnippet?.code) {
      setVisibleLines([]);
      return;
    }
    
    const snippetLines = currentSnippet.code.split('\n');
    // Ensure currentLineIndex doesn't go too far down
    const maxFirstLineIndex = Math.max(0, snippetLines.length - VISIBLE_LINE_COUNT);
    const validFirstLineIndex = Math.min(currentLineIndex, maxFirstLineIndex);

    // Calculate start and end lines for slicing
    const startLine = Math.max(0, validFirstLineIndex);
    const endLine = Math.min(snippetLines.length, startLine + VISIBLE_LINE_COUNT);

    // Only update state if the slice *actually* changes to prevent infinite loops
    const newVisible = snippetLines.slice(startLine, endLine);
    if (JSON.stringify(newVisible) !== JSON.stringify(visibleLines)) {
      setVisibleLines(newVisible);
    }

    // Adjust scroll position if currentLineIndex was invalid
    if (validFirstLineIndex !== currentLineIndex) {
      setCurrentLineIndex(validFirstLineIndex);
    }

  }, [currentLineIndex, currentSnippet, visibleLines]);

  // Reset function for typing logic
  const resetTypingLogic = useCallback((snippetCode = '') => {
    setUserInput('');
    setTypedLines(['']);
    setCurrentPosition({ line: 0, char: 0 });
    setErrorPositions({});
    setFixedPositions({});

    // Update visible lines calculation
    if (snippetCode) {
      const snippetLines = snippetCode.split('\n');
      const endLine = Math.min(snippetLines.length, VISIBLE_LINE_COUNT);
      setVisibleLines(snippetLines.slice(0, endLine));
    } else {
      setVisibleLines([]);
    }
  }, []);

  return {
    userInput,
    currentLineIndex,
    visibleLines, 
    typedLines,
    errorPositions,
    fixedPositions,
    currentPosition,
    setCurrentLineIndex,
    resetTypingLogic,
    handleKeyDown,
    handleInputChange
  };
};

export default useTypingLogic;