import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Import CSS files
import './App.css' // Make sure App.css is imported
import './index.css' // This import is important

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)