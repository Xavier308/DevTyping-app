// src/utils/helpers.js

/**
 * Get emoji based on WPM (words per minute) score
 * 
 * @param {number} wpm - Current words per minute
 * @param {boolean} isPaused - Whether the timer is paused
 * @param {boolean} completed - Whether typing is completed
 * @returns {string} - Appropriate emoji for the given state
 */
export const getEmojiForWPM = (wpm, isPaused, completed) => {
    if (isPaused) return "⏸️";
    if (completed) return "🎉";
    if (wpm > 80) return "🚀";
    if (wpm > 60) return "🔥";
    if (wpm > 40) return "⚡";
    if (wpm > 20) return "👨‍💻";
    return "🐢";
  };
  
  /**
   * Format time in seconds to MM:SS format
   * 
   * @param {number} seconds - Time in seconds
   * @returns {string} - Formatted time string
   */
  export const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  /**
   * Calculate words per minute based on character count
   * 
   * @param {number} charCount - Number of correctly typed characters
   * @param {number} timeInSeconds - Time taken in seconds
   * @returns {number} - Calculated WPM
   */
  export const calculateWPM = (charCount, timeInSeconds) => {
    const minutes = timeInSeconds / 60;
    // Standard WPM is words (char/5) per minute
    return minutes > 0 ? Math.round((charCount / 5) / minutes) : 0;
  };
  
  /**
   * Generate a unique ID for uploaded snippets
   * 
   * @param {string} prefix - Prefix for the ID
   * @returns {string} - Unique ID
   */
  export const generateUniqueId = (prefix = 'custom') => {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };