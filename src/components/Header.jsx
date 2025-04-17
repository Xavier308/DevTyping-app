// src/components/Header.jsx
import React from 'react';
import '../styles/components/Header.css';

/**
 * Header component containing app title, language selection, and theme toggle
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.darkMode - Current theme mode
 * @param {Function} props.setDarkMode - Function to toggle dark mode
 * @param {string} props.selectedLanguage - Currently selected language
 * @param {Function} props.setSelectedLanguage - Function to change language
 * @returns {JSX.Element} Header component
 */
const Header = ({ darkMode, setDarkMode, selectedLanguage, setSelectedLanguage }) => {
  return (
    <header className={`header ${darkMode ? 'dark' : 'light'}`}>
      <div className="header-container">
        <h1 className="app-title">
          <span role="img" aria-label="keyboard emoji">⌨️</span>DevTyping
        </h1>
        
        <div className="controls">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className={`select ${darkMode ? 'dark' : 'light'}`}
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
          </select>
          
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`button ${darkMode ? 'dark' : 'light'}`}
          >
            {darkMode ? (
              <><span role="img" aria-label="sun emoji">☀️</span> Light</>
            ) : (
              <><span role="img" aria-label="moon emoji">🌙</span> Dark</>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;