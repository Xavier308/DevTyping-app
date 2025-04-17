// src/components/Footer.jsx
import React from 'react';
import '../styles/components/Footer.css';

/**
 * Footer component with motivational message
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.darkMode - Current theme mode
 * @returns {JSX.Element} Footer component
 */
const Footer = ({ darkMode }) => {
  return (
    <footer className={`footer ${darkMode ? 'dark' : 'light'}`}>
      <p>
        Practice makes perfect! Keep coding faster <span role="img" aria-label="laptop emoji">💻</span>
      </p>
    </footer>
  );
};

export default Footer;