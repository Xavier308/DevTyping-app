// src/components/Controls/ResetButton.jsx
import React from 'react';
import '../../styles/components/Controls.css';

/**
 * ResetButton component for resetting the current practice session
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.darkMode - Current theme mode
 * @param {Function} props.resetPractice - Function to reset practice
 * @param {Object} props.currentSnippet - Current code snippet
 * @returns {JSX.Element} ResetButton component
 */
const ResetButton = ({ darkMode, resetPractice, currentSnippet }) => {
  return (
    <div className="reset-container">
      <button
        onClick={resetPractice}
        className={`reset-button button ${darkMode ? 'dark' : 'light'}`}
        disabled={!currentSnippet}
      >
        Reset
      </button>
    </div>
  );
};

export default React.memo(ResetButton);