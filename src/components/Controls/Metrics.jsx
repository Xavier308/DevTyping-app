// src/components/Controls/Metrics.jsx
import React from 'react';
import '../../styles/components/Controls.css';

/**
 * Metrics component for displaying typing metrics (time and WPM)
 * 
 * @param {Object} props - Component props
 * @param {number} props.currentElapsedTime - Current elapsed time in seconds
 * @param {Function} props.formatTime - Function to format time display
 * @param {number} props.wpm - Current words per minute
 * @param {Function} props.getEmojiForWPM - Function to get emoji based on WPM
 * @returns {JSX.Element} Metrics component
 */
const Metrics = ({ currentElapsedTime, formatTime, wpm, getEmojiForWPM }) => {
  return (
    <div className="metrics">
      <div className="metric">
        <div className="metric-label">Time</div>
        <div className="metric-value">{formatTime(currentElapsedTime)}</div>
      </div>
      <div className="metric">
        <div className="metric-label">WPM</div>
        <div className="metric-value">{wpm}</div>
        <span className="emoji" role="img" aria-label="wpm indicator emoji">
          {getEmojiForWPM()}
        </span>
      </div>
    </div>
  );
};

export default React.memo(Metrics);