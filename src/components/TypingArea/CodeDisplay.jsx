// src/components/TypingArea/CodeDisplay.jsx
import React from 'react';
import '../../styles/components/CodeDisplay.css';

/**
 * CodeDisplay component renders the code with syntax highlighting and cursor
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.darkMode - Current theme mode
 * @param {Array} props.visibleLines - Current visible lines of code
 * @param {number} props.currentLineIndex - Index of the first visible line
 * @param {Array} props.typedLines - Lines typed by the user
 * @param {Object} props.errorPositions - Map of error positions
 * @param {Object} props.fixedPositions - Map of fixed error positions
 * @param {Object} props.currentPosition - Current cursor position
 * @param {Object} props.currentSnippet - Current code snippet
 * @param {Object} props.inputRef - Reference to the hidden input element
 * @returns {JSX.Element} CodeDisplay component
 */
const CodeDisplay = ({
  darkMode,
  visibleLines,
  currentLineIndex,
  typedLines,
  errorPositions,
  fixedPositions,
  currentPosition,
  currentSnippet,
  inputRef
}) => {
  // Function to render a single line of code
  const renderCodeLine = (line, lineIndex) => {
    // line: the target code string for this line
    // lineIndex: the index within the visibleLines array
    const actualLineIndex = lineIndex + currentLineIndex; // Absolute index in the snippet
    const typedLine = typedLines[actualLineIndex] || '';
    const isCurrentActiveLine = actualLineIndex === currentPosition.line;
    
    const spans = [];
    
    // Iterate through the maximum length of target or typed line for this row
    const maxLen = Math.max(line.length, isCurrentActiveLine ? typedLine.length : 0);
    
    for (let charIndex = 0; charIndex < maxLen; charIndex++) {
      const posKey = `${actualLineIndex}:${charIndex}`;
      const targetChar = line[charIndex];
      const typedChar = typedLine[charIndex];
      let charToDisplay = targetChar !== undefined ? targetChar : typedChar;
      let className = 'character';
      
      // Determine state: Error > Fixed > Correct > Pending
      if (errorPositions[posKey]) {
        className += ' error';
        if (targetChar === undefined) {
          charToDisplay = typedChar;
        }
      } else if (fixedPositions[posKey]) {
        className += ' fixed';
      } else if (charIndex < typedLine.length) {
        if (charIndex < line.length && typedChar === targetChar) {
          className += ' correct';
        } else if (charIndex >= line.length) {
          className += ' error';
          charToDisplay = typedChar;
        } else {
          className += ' pending';
        }
      } else {
        className += ' pending';
      }
      
      // Add cursor styling
      if (isCurrentActiveLine && charIndex === currentPosition.char) {
        className += ' current';
      }
      
      // Handle Tab display (render as spaces)
      const displayContent = charToDisplay === '\t' ? '    ' : charToDisplay;
      
      spans.push(
        <span key={`${actualLineIndex}-${charIndex}`} className={className}>
          {displayContent}
        </span>
      );
    }
    
    // Add cursor span if cursor is positioned after the last character
    if (isCurrentActiveLine && currentPosition.char === maxLen && maxLen > 0) {
      if (!spans[maxLen - 1]?.props.className.includes(' current')) {
        spans.push(<span key={`${actualLineIndex}-cursor-end`} className="character current"></span>);
      }
    }
    
    // Ensure empty lines have height and potential cursor
    if (line.length === 0 && typedLine.length === 0) {
      if (isCurrentActiveLine && currentPosition.char === 0) {
        return (
          <div key={actualLineIndex} className="line">
            <span className="character current"> </span>
          </div>
        );
      } else {
        return <div key={actualLineIndex} className="line"> </div>;
      }
    }
    
    return (
      <div key={actualLineIndex} className="line">
        {spans}
      </div>
    );
  };
  
  return (
    <div 
      className={`snippet-content ${darkMode ? 'dark' : 'light'}`} 
      onClick={() => inputRef.current?.focus()}
    >
      {/* Line numbers column */}
      <div className="line-numbers">
        {visibleLines.map((_, idx) => (
          <div key={`number-${idx + currentLineIndex + 1}`} className="line-number">
            {idx + currentLineIndex + 1}
          </div>
        ))}
        {/* Add padding numbers if snippet is shorter than visible count */}
        {visibleLines.length < 10 &&
          currentSnippet.code.split('\n').length > visibleLines.length &&
          Array(10 - visibleLines.length).fill().map((_, idx) => (
            <div key={`number-empty-${idx + visibleLines.length}`} className="line-number">
              {idx + visibleLines.length + currentLineIndex + 1}
            </div>
          ))}
      </div>
      
      {/* Code display */}
      <div className="code-display">
        {/* Render visible lines */}
        {visibleLines.map((line, idx) => renderCodeLine(line, idx))}
        {/* Add padding lines if snippet is shorter than visible count */}
        {visibleLines.length < 10 &&
          currentSnippet.code.split('\n').length > visibleLines.length &&
          Array(10 - visibleLines.length).fill().map((_, idx) => (
            <div key={`empty-${idx + visibleLines.length}`} className="line"> </div>
          ))}
      </div>
    </div>
  );
};

export default React.memo(CodeDisplay);