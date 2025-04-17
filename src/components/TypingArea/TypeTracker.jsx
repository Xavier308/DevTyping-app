// src/components/TypingArea/TypeTracker.jsx
import React, { useEffect } from 'react';
import '../../styles/components/TypeTracker.css';

/**
 * TypeTracker component handles the hidden textarea for user input
 * 
 * @param {Object} props - Component props
 * @param {Object} props.inputRef - Reference to the hidden input element
 * @param {string} props.userInput - Current user input text
 * @param {Function} props.handleInputChange - Function to handle input changes
 * @param {Function} props.handleKeyDown - Function to handle special key presses
 * @param {boolean} props.completed - Whether typing is completed
 * @returns {JSX.Element} TypeTracker component
 */
const TypeTracker = ({ 
  inputRef, 
  userInput, 
  handleInputChange, 
  handleKeyDown, 
  completed 
}) => {
  // Ensure the input is focused when the component mounts
  useEffect(() => {
    if (inputRef?.current && !completed) {
      // Short delay to ensure focus works properly after DOM updates
      setTimeout(() => {
        inputRef.current.focus();
      }, 100);
    }
  }, [inputRef, completed]);

  return (
    <div className="input-area">
      <textarea
        ref={inputRef}
        value={userInput}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={completed}
        className="hidden-textarea"
        autoFocus
        spellCheck="false"
        autoCapitalize="none"
        autoComplete="off"
        autoCorrect="off"
        wrap="off"
        rows={1}
      />
    </div>
  );
};

export default React.memo(TypeTracker);