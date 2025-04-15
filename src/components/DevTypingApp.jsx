import React, { useState, useEffect, useRef } from 'react';

const DevTypingApp = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [currentSnippet, setCurrentSnippet] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [lineOffset, setLineOffset] = useState(0);
  const [visibleLines, setVisibleLines] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [uploadedSnippets, setUploadedSnippets] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const inputRef = useRef(null);
  
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
    updateVisibleLines(defaultSnippet.code, 0);
  }, [selectedLanguage]);

  // Timer logic
  useEffect(() => {
    let timerId;
    
    if (startTime && !completed) {
      timerId = setInterval(() => {
        const now = Date.now();
        const elapsed = (now - startTime) / 1000;
        setElapsedTime(elapsed);
        
        // Calculate WPM: (characters / 5) / (minutes)
        const charactersTyped = userInput.length;
        const minutes = elapsed / 60;
        const calculatedWPM = minutes > 0 ? Math.round((charactersTyped / 5) / minutes) : 0;
        setWpm(calculatedWPM);
      }, 1000);
    }
    
    return () => clearInterval(timerId);
  }, [startTime, userInput, completed]);

  // Update visible lines when typing progresses
  useEffect(() => {
    if (currentSnippet) {
      const snippetLines = currentSnippet.code.split('\n');
      const userLines = userInput.split('\n');
      const currentLineIndex = userLines.length - 1;
      
      if (lineOffset !== currentLineIndex) {
        setLineOffset(currentLineIndex);
        updateVisibleLines(currentSnippet.code, currentLineIndex);
      }
      
      // Check if completed
      if (userInput === currentSnippet.code) {
        setCompleted(true);
      }
    }
  }, [userInput, currentSnippet]);

  const updateVisibleLines = (code, currentLineIndex) => {
    const allLines = code.split('\n');
    const startLine = Math.max(0, currentLineIndex);
    const endLine = Math.min(allLines.length, startLine + 3);
    setVisibleLines(allLines.slice(startLine, endLine));
  };

  const handleInputChange = (e) => {
    if (!startTime) {
      setStartTime(Date.now());
    }
    setUserInput(e.target.value);
  };

  const resetPractice = () => {
    setUserInput('');
    setStartTime(null);
    setElapsedTime(0);
    setWpm(0);
    setLineOffset(0);
    setCompleted(false);
    if (currentSnippet) {
      updateVisibleLines(currentSnippet.code, 0);
    }
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
      updateVisibleLines(newSnippet.code, 0);
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
        updateVisibleLines(newSnippet.code, 0);
        resetPractice();
      } catch (error) {
        console.error("Error reading file:", error);
      }
    };
    reader.readAsText(file);
  };

  const getSpeedClass = () => {
    if (completed) return "typing-area-completed";
    if (wpm > 60) return "typing-area-hot"; // 🔥 Hot!
    if (wpm > 40) return "typing-area-warm"; // Warm
    return "typing-area-cool"; // Cool
  };

  const getEmojiForWPM = () => {
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

  const theme = darkMode ? 'dark' : 'light';

  return (
    <div className={`app-container ${theme}`}>
      <header className={`header ${theme}`}>
        <div className="header-container">
          <h1 className="app-title">
            <span>⌨️</span> 
            <span style={{ marginLeft: '0.5rem' }}>DevTyping</span>
          </h1>
          <div className="controls">
            <select 
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className={`select ${theme}`}
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
            </select>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`button ${theme}`}
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <div className="toolbar">
            <div className="snippet-controls">
              <select 
                value={currentSnippet?.id}
                onChange={handleSnippetChange}
                className={`select ${theme}`}
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
              <label className={`file-label ${theme}`}>
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
              <div className="metric" style={{ display: 'flex', alignItems: 'center' }}>
                <div>
                  <div className="metric-label">WPM</div>
                  <div className="metric-value">{wpm}</div>
                </div>
                <div className="emoji">{getEmojiForWPM()}</div>
              </div>
            </div>
          </div>

          {currentSnippet && (
            <>
              <div className="snippet-container">
                <div className={`snippet-header ${theme}`}>
                  <div className="snippet-title">{currentSnippet.name}</div>
                  <div className="snippet-language">
                    {selectedLanguage === 'python' ? '🐍 Python' : '🟨 JavaScript'}
                  </div>
                </div>
                <div className={`snippet-content ${theme}`}>
                  {visibleLines.map((line, idx) => (
                    <div key={idx} className="line">{line}</div>
                  ))}
                  {visibleLines.length < 3 && Array(3 - visibleLines.length).fill().map((_, idx) => (
                    <div key={`empty-${idx}`} className="line">&nbsp;</div>
                  ))}
                </div>
              </div>

              <div className={`typing-area ${getSpeedClass()} ${theme}`}>
                <textarea
                  ref={inputRef}
                  value={userInput}
                  onChange={handleInputChange}
                  disabled={completed}
                  placeholder="Start typing here..."
                  className={`textarea ${theme}`}
                  autoFocus
                />
                {completed && (
                  <div className="completion-overlay">
                    <div className="completion-message">
                      <div className="completion-emoji">🎉</div>
                      <div>Completed!</div>
                      <button 
                        onClick={resetPractice}
                        className="completion-button"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="reset-container">
            <button 
              onClick={resetPractice}
              className={`reset-button ${theme}`}
            >
              Reset
            </button>
          </div>
        </div>
      </main>

      <footer className={`footer ${theme}`}>
        <p>Practice makes perfect! Keep coding faster 💻</p>
      </footer>
    </div>
  );
};

export default DevTypingApp;