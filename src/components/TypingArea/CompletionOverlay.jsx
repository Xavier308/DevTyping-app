// src/components/TypingArea/CompletionOverlay.jsx
import React from 'react';
import '../../styles/components/Overlay.css';

/**
 * CompletionOverlay component shows completion or paused state
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.darkMode - Current theme mode
 * @param {boolean} props.completed - Whether typing is completed
 * @param {Function} props.resetPractice - Function to reset practice
 * @param {Function} props.resumePractice - Function to resume from pause
 * @returns {JSX.Element} CompletionOverlay component
 */
const CompletionOverlay = ({ 
  darkMode, 
  completed, 
  resetPractice,
  resumePractice
}) => {
  return (
    <div 
      className="completion-overlay"
      onClick={!completed ? resumePractice : undefined}
    >
      <div className="completion-message">
        <div className="completion-emoji">
          {completed ? "🎉" : "⏸️"}
        </div>
        <div>
          {completed ? "Completed!" : "Paused - Click or type to resume"}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            resetPractice();
          }}
          className={`completion-button ${darkMode ? 'dark' : 'light'}`}
        >
          {completed ? "Try Again" : "Reset"}
        </button>
        
        {!completed && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              resumePractice();
            }}
            className={`resume-button ${darkMode ? 'dark' : 'light'}`}
          >
            Resume
          </button>
        )}
      </div>
    </div>
  );
};

export default React.memo(CompletionOverlay);