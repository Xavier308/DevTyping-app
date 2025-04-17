// src/components/DevTypingApp.jsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import '../styles/variables.css';

// Components
import Header from './Header';
import Footer from './Footer';
import CodeDisplay from './TypingArea/CodeDisplay';
import TypeTracker from './TypingArea/TypeTracker';
import CompletionOverlay from './TypingArea/CompletionOverlay';
import SnippetSelector from './Controls/SnippetSelector';
import FileUploader from './Controls/FileUploader';
import Metrics from './Controls/Metrics';
import ResetButton from './Controls/ResetButton';

// Custom Hooks
import useTypingLogic from '../hooks/useTypingLogic';
import useTimer from '../hooks/useTimer';
import useSnippetManager from '../hooks/useSnippetManager';

// Utils
import { formatTime, getEmojiForWPM } from '../utils/helpers';

const DevTypingApp = () => {
  // Theme state
  const [darkMode, setDarkMode] = useState(true);
  
  // Completion state
  const [completed, setCompleted] = useState(false);
  
  // Refs for focusing the input
  const inputRef = useRef(null);
  
  // Get snippet management functionality
  const {
    selectedLanguage,
    currentSnippet,
    uploadedSnippets,
    setSelectedLanguage,
    handleSnippetChange,
    handleFileUpload,
    getAvailableSnippets
  } = useSnippetManager();
  
  // Get typing logic
  const {
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
  } = useTypingLogic(currentSnippet, null, completed);
  
  // Get timer functionality
  const {
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
  } = useTimer(currentSnippet, typedLines, currentPosition, errorPositions, completed);
  
  // Create a modified input handler that also updates the timer
  const handleInputWithTimer = useCallback((e) => {
    // Call the original handler
    handleInputChange(e);
    
    // Start or maintain the timer
    startTimer();
    
    // Update last input time for auto-pause
    setLastInputTime(Date.now());
    
    // Resume from pause if needed
    if (isPaused) {
      resumeTimer();
    }
  }, [handleInputChange, startTimer, setLastInputTime, isPaused, resumeTimer]);
  
  // Create a modified key handler that also updates the timer
  const handleKeyDownWithTimer = useCallback((e) => {
    // Call the original handler
    handleKeyDown(e);
    
    // Start or maintain the timer
    startTimer();
    
    // Update last input time for auto-pause
    setLastInputTime(Date.now());
    
    // Resume from pause if needed
    if (isPaused) {
      resumeTimer();
    }
  }, [handleKeyDown, startTimer, setLastInputTime, isPaused, resumeTimer]);
  
  // Reset practice function
  const resetPractice = useCallback(() => {
    if (!currentSnippet) return;
    
    // Reset states
    setCompleted(false);
    resetTypingLogic(currentSnippet.code);
    resetTimer();
    setCurrentLineIndex(0);
    
    // Focus the input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  }, [currentSnippet, resetTypingLogic, resetTimer, setCurrentLineIndex]);
  
  // Handle language or snippet changes
  useEffect(() => {
    if (currentSnippet) {
      resetPractice();
    }
  }, [currentSnippet, resetPractice]);
  
  // Check for completion
  useEffect(() => {
    if (!currentSnippet) return;
    
    const snippetLines = currentSnippet.code.split('\n');
    
    // Basic check: Has the user typed at least the required number of lines?
    if (typedLines.length < snippetLines.length) {
      setCompleted(false);
      return;
    }
    
    // Check content match and no errors remaining
    const typedTextForCompare = typedLines.join('\n');
    const targetText = currentSnippet.code;
    const hasErrors = Object.keys(errorPositions).length > 0;
    
    if (typedTextForCompare === targetText && !hasErrors) {
      if (!completed) {
        setCompleted(true);
        calculateFinalWPM();
      }
    } else if (completed) {
      setCompleted(false);
    }
  }, [typedLines, errorPositions, currentSnippet, completed, calculateFinalWPM]);
  
  // Get emoji for WPM
  const getWpmEmoji = useCallback(() => {
    return getEmojiForWPM(wpm, isPaused, completed);
  }, [wpm, isPaused, completed]);
  
  // When clicking on overlay, resume if paused
  const handleOverlayClick = useCallback(() => {
    if (isPaused && !completed) {
      resumeTimer();
      setIsPaused(false);
      inputRef.current?.focus();
    }
  }, [isPaused, completed, resumeTimer, setIsPaused]);
  
  // Render component
  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
      <Header 
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
      />
      
      <main className="main">
        <div className="container">
          <div className="toolbar">
            <div className="snippet-controls">
              {getAvailableSnippets && (
                <SnippetSelector 
                  currentSnippet={currentSnippet}
                  darkMode={darkMode}
                  availableSnippets={getAvailableSnippets()}
                  uploadedSnippets={uploadedSnippets}
                  selectedLanguage={selectedLanguage}
                  handleSnippetChange={handleSnippetChange}
                />
              )}
              
              <FileUploader 
                darkMode={darkMode}
                handleFileUpload={handleFileUpload}
              />
            </div>
            
            <Metrics 
              currentElapsedTime={currentElapsedTime}
              formatTime={formatTime}
              wpm={wpm}
              getEmojiForWPM={getWpmEmoji}
            />
          </div>
          
          {currentSnippet ? (
            <>
              <div className="snippet-container">
                <div className={`snippet-header ${darkMode ? 'dark' : 'light'}`}>
                  <div className="snippet-title">{currentSnippet.name}</div>
                  <div className="snippet-language">
                    {selectedLanguage === 'python' ? (
                      <><span role="img" aria-label="python snake emoji">🐍</span> Python</>
                    ) : (
                      <><span role="img" aria-label="javascript square emoji">🟨</span> JavaScript</>
                    )}
                  </div>
                </div>
                
                <CodeDisplay 
                  darkMode={darkMode}
                  visibleLines={visibleLines}
                  currentLineIndex={currentLineIndex}
                  typedLines={typedLines}
                  errorPositions={errorPositions}
                  fixedPositions={fixedPositions}
                  currentPosition={currentPosition}
                  currentSnippet={currentSnippet}
                  inputRef={inputRef}
                />
              </div>
              
              <TypeTracker 
                inputRef={inputRef}
                userInput={userInput}
                handleInputChange={handleInputWithTimer}
                handleKeyDown={handleKeyDownWithTimer}
                completed={completed}
              />
              
              {(completed || isPaused) && (
                <CompletionOverlay 
                  darkMode={darkMode}
                  completed={completed}
                  resetPractice={resetPractice}
                  resumePractice={handleOverlayClick}
                />
              )}
            </>
          ) : (
            <div className="loading-placeholder">
              Select a snippet or upload a file to begin.
            </div>
          )}
          
          <ResetButton 
            darkMode={darkMode}
            resetPractice={resetPractice}
            currentSnippet={currentSnippet}
          />
        </div>
      </main>
      
      <Footer darkMode={darkMode} />
    </div>
  );
};

export default DevTypingApp;