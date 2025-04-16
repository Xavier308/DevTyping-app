// src/App.jsx
import React from 'react'
import DevTypingApp from './components/DevTypingApp'
import './index.css'
import './App.css'

function App() {
  // Add a class to the body to ensure full viewport coverage
  React.useEffect(() => {
    document.body.classList.add('fullscreen-app');
    return () => {
      document.body.classList.remove('fullscreen-app');
    };
  }, []);
  
  return (
    <DevTypingApp />
  )
}

export default App