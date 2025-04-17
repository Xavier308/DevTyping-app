// src/App.jsx
import React, { useEffect } from 'react';
import DevTypingApp from './components/DevTypingApp';
import './index.css';
import './App.css';

function App() {
  // Add a class to the body to ensure full viewport coverage
  useEffect(() => {
    document.body.classList.add('fullscreen-app');
    return () => {
      document.body.classList.remove('fullscreen-app');
    };
  }, []);
  
  return (
    <DevTypingApp />
  );
}

export default App;