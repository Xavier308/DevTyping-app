// src/components/DevTypingApp.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../styles/DevTypingApp.css';

const DevTypingApp = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [currentSnippet, setCurrentSnippet] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [lastInputTime, setLastInputTime] = useState(null);
  const [completed, setCompleted] = useState(false);
  
  // For displaying and tracking progress
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [visibleLines, setVisibleLines] = useState([]);
  const [typedLines, setTypedLines] = useState(['']);
  const [errorPositions, setErrorPositions] = useState({});
  const [fixedPositions, setFixedPositions] = useState({});
  const [currentPosition, setCurrentPosition] = useState({ line: 0, char: 0 });
  
  const [uploadedSnippets, setUploadedSnippets] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  
  const inputRef = useRef(null);
  const pauseTimerRef = useRef(null);
  
  // Sample snippets (default examples)
  const sampleSnippets = {
    python: [
      {
        id: 'py1',
        name: 'Quick Sort',
        code: `def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)`
      },
      {
        id: 'py2',
        name: 'Binary Search',
        code: `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] < target:
            low = mid + 1
        elif arr[mid] > target:
            high = mid - 1
        else:
            return mid
    return -1`
      }
    ],
    javascript: [
      {
        id: 'js1',
        name: 'Array Filter',
        code: `const numbers = [1, 2, 3, 4, 5, 6];
const evenNumbers = numbers.filter(num => {
  return num % 2 === 0;
});
console.log(evenNumbers); // [2, 4, 6]`
      },
      {
        id: 'js2',
        name: 'Promise Example',
        code: `const fetchData = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const data = { id: 1, name: 'User' };
      resolve(data);
    }, 1000);
  });
};

fetchData()
  .then(data => console.log(data))
  .catch(error => console.error(error));`
      }
    ]
  };

  // Initialize with a snippet
  useEffect(() => {
    const defaultSnippet = sampleSnippets[selectedLanguage][0];
    setCurrentSnippet(defaultSnippet);
    
    // Initialize the app state with the first snippet
    const snippetLines = defaultSnippet.code.split('\n');
    setVisibleLines(snippetLines.slice(0, 3));
    setTypedLines(['']);
    setCurrentLineIndex(0);
    setCurrentPosition({ line: 0, char: 0 });
    setErrorPositions({});
    setFixedPositions({});
  }, [selectedLanguage]);
  
  // Timer logic with pause functionality
  useEffect(() => {
    let timerId;
    
    if (startTime && !completed && !isPaused) {
      timerId = setInterval(() => {
        const now = Date.now();
        const elapsed = ((now - startTime) / 1000) + elapsedTime;
        setElapsedTime(elapsed);
        
        // Calculate WPM: Calculate a more accurate WPM
        const totalChars = typedLines.join('\n').length;
        const minutes = elapsed / 60;
        const calculatedWPM = minutes > 0 ? Math.round((totalChars / 5) / minutes) : 0;
        setWpm(calculatedWPM);
      }, 1000);
    }
    
    return () => clearInterval(timerId);
  }, [startTime, typedLines, completed, isPaused, elapsedTime]);

  // Auto-pause when no typing for 3 seconds
  useEffect(() => {
    clearTimeout(pauseTimerRef.current);
    
    if (startTime && !completed && !isPaused && lastInputTime) {
      pauseTimerRef.current = setTimeout(() => {
        setIsPaused(true);
      }, 3000);
    }
    
    return () => clearTimeout(pauseTimerRef.current);
  }, [lastInputTime, startTime, completed, isPaused]);

  // Check for completion
  useEffect(() => {
    if (!currentSnippet) return;
    
    const typedText = typedLines.join('\n');
    if (typedText === currentSnippet.code) {
      setCompleted(true);
    }
  }, [typedLines, currentSnippet]);

  // Update visible lines when current line changes
  useEffect(() => {
    if (!currentSnippet) return;
    
    const snippetLines = currentSnippet.code.split('\n');
    const startLine = Math.max(0, currentLineIndex);
    const endLine = Math.min(snippetLines.length, startLine + 3);
    setVisibleLines(snippetLines.slice(startLine, endLine));
  }, [currentLineIndex, currentSnippet]);

  // Handle tab key and other special keys
  const handleKeyDown = (e) => {
    if (!currentSnippet) return;
    
    // Handle tab key
    if (e.key === 'Tab') {
      e.preventDefault();
      
      // Insert 4 spaces at current cursor position
      const currentLine = typedLines[currentPosition.line] || '';
      const before = currentLine.substring(0, currentPosition.char);
      const after = currentLine.substring(currentPosition.char);
      
      const newLine = before + '    ' + after;
      const newLines = [...typedLines];
      newLines[currentPosition.line] = newLine;
      
      setTypedLines(newLines);
      setCurrentPosition({
        ...currentPosition,
        char: currentPosition.char + 4
      });
      
      // Update last input time
      setLastInputTime(Date.now());
    }
    
    // Handle enter key
    else if (e.key === 'Enter') {
      e.preventDefault();
      
      // Move to next line
      const newLines = [...typedLines];
      if (currentPosition.line === newLines.length - 1) {
        newLines.push('');
      }
      
      setTypedLines(newLines);
      setCurrentPosition({
        line: currentPosition.line + 1,
        char: 0
      });
      
      // Update the current line index if needed to show the next lines
      if (currentPosition.line + 1 >= currentLineIndex + 3) {
        setCurrentLineIndex(currentLineIndex + 1);
      }
      
      // Update last input time
      setLastInputTime(Date.now());
    }
  };

  // Handle all user input
  const handleInputChange = (e) => {
    const value = e.target.value;
    const isComposition = value !== userInput && value.length > userInput.length + 1;
    
    // If it's paste or multiple characters input, handle it differently
    if (isComposition) {
      handlePastedText(value);
      return;
    }
    
    // Start timer if not started
    if (!startTime) {
      setStartTime(Date.now());
    }
    
    // Resume timer if paused
    if (isPaused) {
      setIsPaused(false);
      setStartTime(Date.now());
    }
    
    // Update last input time
    setLastInputTime(Date.now());
    
    // Split the input by lines for processing
    const inputLines = value.split('\n');
    
    // Update the current typed text line by line
    const newTypedLines = [...typedLines];
    const snippetLines = currentSnippet.code.split('\n');
    
    // Update the current line
    const currentLine = inputLines[inputLines.length - 1];
    newTypedLines[currentPosition.line] = currentLine;
    
    // Check correctness of each character in the current line
    const targetLine = snippetLines[currentPosition.line] || '';
    const newErrorPositions = { ...errorPositions };
    const newFixedPositions = { ...fixedPositions };
    
    // First remove any error/fixed positions for characters that no longer exist
    for (const key in newErrorPositions) {
      const [line, char] = key.split(':').map(Number);
      if (line === currentPosition.line && char >= currentLine.length) {
        delete newErrorPositions[key];
      }
    }
    
    for (const key in newFixedPositions) {
      const [line, char] = key.split(':').map(Number);
      if (line === currentPosition.line && char >= currentLine.length) {
        delete newFixedPositions[key];
      }
    }
    
    // Then check character by character
    for (let i = 0; i < currentLine.length; i++) {
      const posKey = `${currentPosition.line}:${i}`;
      
      if (i < targetLine.length) {
        if (currentLine[i] === targetLine[i]) {
          // Correct character
          if (newErrorPositions[posKey]) {
            // Was an error, now fixed
            delete newErrorPositions[posKey];
            newFixedPositions[posKey] = true;
          }
        } else {
          // Error character
          newErrorPositions[posKey] = true;
          delete newFixedPositions[posKey];
        }
      } else {
        // Extra character beyond target line
        newErrorPositions[posKey] = true;
      }
    }
    
    // Update cursor position
    const newPosition = {
      line: currentPosition.line,
      char: currentLine.length
    };
    
    setTypedLines(newTypedLines);
    setCurrentPosition(newPosition);
    setErrorPositions(newErrorPositions);
    setFixedPositions(newFixedPositions);
    setUserInput(value);
  };
  
  // Handle pasted text
  const handlePastedText = (pastedText) => {
    // For simplicity, we'll just set the user input directly
    // and let the handleInputChange logic handle it on the next change
    setUserInput(pastedText);
  };

  const resetPractice = () => {
    if (!currentSnippet) return;
    
    setUserInput('');
    setStartTime(null);
    setElapsedTime(0);
    setWpm(0);
    setIsPaused(false);
    setLastInputTime(null);
    setCompleted(false);
    
    // Reset typing position and state
    setTypedLines(['']);
    setCurrentLineIndex(0);
    setCurrentPosition({ line: 0, char: 0 });
    setErrorPositions({});
    setFixedPositions({});
    
    // Reset visible lines
    const snippetLines = currentSnippet.code.split('\n');
    setVisibleLines(snippetLines.slice(0, 3));
    
    // Focus the input
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSnippetChange = (e) => {
    const snippetId = e.target.value;
    const allSnippets = [...sampleSnippets[selectedLanguage], ...uploadedSnippets.filter(s => s.language === selectedLanguage)];
    const newSnippet = allSnippets.find(s => s.id === snippetId);
    
    if (newSnippet) {
      setCurrentSnippet(newSnippet);
      resetPractice();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const fileContent = event.target.result;
        const newSnippet = {
          id: `custom-${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
          code: fileContent,
          language: selectedLanguage
        };
        
        setUploadedSnippets(prev => [...prev, newSnippet]);
        setCurrentSnippet(newSnippet);
        resetPractice();
      } catch (error) {
        console.error("Error reading file:", error);
      }
    };
    reader.readAsText(file);
  };

  const getTypingAreaClass = () => {
    const theme = darkMode ? 'dark' : 'light';
    if (isPaused) return `typing-area typing-area-paused ${theme}`;
    if (completed) return `typing-area typing-area-completed ${theme}`;
    if (wpm > 60) return `typing-area typing-area-hot ${theme}`; // 🔥 Hot!
    if (wpm > 40) return `typing-area typing-area-warm ${theme}`; // Warm
    return `typing-area typing-area-cool ${theme}`; // Cool
  };

  const getEmojiForWPM = () => {
    if (isPaused) return "⏸️";
    if (completed) return "🎉";
    if (wpm > 80) return "💥";
    if (wpm > 60) return "🔥";
    if (wpm > 40) return "⚡";
    if (wpm > 20) return "👨‍💻";
    return "🐢";
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Render a line of code with character highlighting
  const renderCodeLine = (line, lineIndex) => {
    const actualLineIndex = lineIndex + currentLineIndex;
    const typedLine = typedLines[actualLineIndex] || '';
    const isCurrentLine = actualLineIndex === currentPosition.line;
    
    return (
      <div key={lineIndex} className="line">
        {line.split('').map((char, charIndex) => {
          const posKey = `${actualLineIndex}:${charIndex}`;
          let className = 'character pending';
          
          // Determine character state based on typing progress
          if (charIndex < typedLine.length) {
            if (errorPositions[posKey]) {
              className = 'character error';
            } else if (fixedPositions[posKey]) {
              className = 'character fixed';
            } else {
              className = 'character correct';
            }
          }
          
          // Add "current" class for current typing position
          if (isCurrentLine && charIndex === typedLine.length) {
            className += ' current';
          }
          
          return (
            <span key={charIndex} className={className}>
              {char}
            </span>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
      <header className={`header ${darkMode ? 'dark' : 'light'}`}>
        <div className="header-container">
          <h1 className="app-title">
            <span className="emoji">⌨️</span>DevTyping
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
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {/* Snippet Controls */}
          <div className="toolbar">
            <div className="snippet-controls">
              <select 
                value={currentSnippet?.id}
                onChange={handleSnippetChange}
                className={`select ${darkMode ? 'dark' : 'light'}`}
              >
                <optgroup label={selectedLanguage === 'python' ? 'Python Snippets' : 'JavaScript Snippets'}>
                  {sampleSnippets[selectedLanguage].map(snippet => (
                    <option key={snippet.id} value={snippet.id}>
                      {snippet.name}
                    </option>
                  ))}
                </optgroup>
                {uploadedSnippets.filter(s => s.language === selectedLanguage).length > 0 && (
                  <optgroup label="Your Uploads">
                    {uploadedSnippets
                      .filter(s => s.language === selectedLanguage)
                      .map(snippet => (
                        <option key={snippet.id} value={snippet.id}>
                          {snippet.name}
                        </option>
                      ))}
                  </optgroup>
                )}
              </select>
              <label className={`file-label ${darkMode ? 'dark' : 'light'}`}>
                📁 Upload
                <input 
                  type="file" 
                  accept=".py,.js,.txt" 
                  onChange={handleFileUpload}
                  className="file-input"
                />
              </label>
            </div>
            <div className="metrics">
              <div className="metric">
                <div className="metric-label">Time</div>
                <div className="metric-value">{formatTime(elapsedTime)}</div>
              </div>
              <div className="metric">
                <div className="metric-label">WPM</div>
                <div className="metric-value">{wpm}</div>
                <span className="emoji">{getEmojiForWPM()}</span>
              </div>
            </div>
          </div>

          {/* Code Display */}
          {currentSnippet && (
            <>
              <div className="snippet-container">
                <div className={`snippet-header ${darkMode ? 'dark' : 'light'}`}>
                  <div className="snippet-title">{currentSnippet.name}</div>
                  <div className="snippet-language">
                    {selectedLanguage === 'python' ? '🐍 Python' : '🟨 JavaScript'}
                  </div>
                </div>
                <div className={`snippet-content code-display ${darkMode ? 'dark' : 'light'}`}>
                  {visibleLines.map((line, idx) => renderCodeLine(line, idx))}
                  {visibleLines.length < 3 && Array(3 - visibleLines.length).fill().map((_, idx) => (
                    <div key={`empty-${idx}`} className="line">&nbsp;</div>
                  ))}
                </div>
              </div>

              {/* Hidden Text input for typing */}
              <div className="hidden-input-container">
                <textarea
                  ref={inputRef}
                  value={userInput}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={completed}
                  className="hidden-textarea"
                  autoFocus
                />
                {(completed || isPaused) && (
                  <div className="completion-overlay">
                    <div className="completion-message">
                      <div className="completion-emoji">{completed ? "🎉" : "⏸️"}</div>
                      <div>{completed ? "Completed!" : "Paused - Click or type to resume"}</div>
                      <button 
                        onClick={resetPractice}
                        className="completion-button"
                      >
                        {completed ? "Try Again" : "Reset"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Reset Button */}
          <div className="reset-container">
            <button 
              onClick={resetPractice}
              className={`reset-button ${darkMode ? 'dark' : 'light'}`}
            >
              Reset
            </button>
          </div>
        </div>
      </main>

      <footer className={`footer ${darkMode ? 'dark' : 'light'}`}>
        <p>Practice makes perfect! Keep coding faster 💻</p>
      </footer>
    </div>
  );
};

export default DevTypingApp;