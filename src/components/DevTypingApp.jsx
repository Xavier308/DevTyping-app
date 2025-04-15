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

  const getGradientColor = () => {
    if (completed) return "bg-green-100 dark:bg-green-900 dark:bg-opacity-50";
    if (wpm > 60) return "bg-red-50 dark:bg-red-900 dark:bg-opacity-30"; // 🔥 Hot!
    if (wpm > 40) return "bg-orange-50 dark:bg-orange-900 dark:bg-opacity-30"; // Warm
    return "bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30"; // Cool
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

  return (
    <div className={`flex flex-col min-h-screen ${darkMode ? 'dark bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <header className="p-4 bg-gray-100 dark:bg-gray-800 shadow">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <span>⌨️</span> 
            <span className="ml-2">DevTyping</span>
          </h1>
          <div className="flex space-x-4">
            <select 
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-1 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
            </select>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="px-3 py-1 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow p-4">
        <div className="container mx-auto max-w-3xl">
          <div className="mb-6 flex justify-between">
            <div className="flex space-x-2">
              <select 
                value={currentSnippet?.id}
                onChange={handleSnippetChange}
                className="px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
              <label className="px-3 py-2 rounded border dark:bg-gray-700 dark:border-gray-600 dark:text-white cursor-pointer">
                📁 Upload
                <input 
                  type="file" 
                  accept=".py,.js,.txt" 
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex space-x-4 items-center">
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">Time</div>
                <div className="font-mono text-lg">{formatTime(elapsedTime)}</div>
              </div>
              <div className="text-center flex items-center">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">WPM</div>
                  <div className="font-mono text-lg">{wpm}</div>
                </div>
                <div className="text-2xl ml-2">{getEmojiForWPM()}</div>
              </div>
            </div>
          </div>

          {currentSnippet && (
            <>
              <div className="mb-4">
                <div className="p-4 rounded-t-lg bg-gray-200 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-700 flex justify-between items-center">
                  <div className="font-medium">{currentSnippet.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedLanguage === 'python' ? '🐍 Python' : '🟨 JavaScript'}
                  </div>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-800 font-mono text-sm md:text-base overflow-x-auto rounded-b-lg border border-gray-300 dark:border-gray-700">
                  {visibleLines.map((line, idx) => (
                    <pre key={idx} className="mb-1 dark:text-gray-200">{line}</pre>
                  ))}
                  {visibleLines.length < 3 && Array(3 - visibleLines.length).fill().map((_, idx) => (
                    <pre key={`empty-${idx}`} className="mb-1 dark:text-gray-200">&nbsp;</pre>
                  ))}
                </div>
              </div>

              <div className={`relative mb-6 ${getGradientColor()} rounded-lg p-4 border border-gray-300 dark:border-gray-700 transition-colors duration-300`}>
                <textarea
                  ref={inputRef}
                  value={userInput}
                  onChange={handleInputChange}
                  disabled={completed}
                  placeholder="Start typing here..."
                  className="w-full h-32 bg-transparent font-mono text-sm md:text-base p-0 focus:outline-none resize-none dark:text-white"
                  autoFocus
                />
                {completed && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl mb-2">🎉 Completed!</div>
                      <button 
                        onClick={resetPractice}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="text-center">
            <button 
              onClick={resetPractice}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded"
            >
              Reset
            </button>
          </div>
        </div>
      </main>

      <footer className="p-4 text-center text-gray-600 dark:text-gray-400 text-sm">
        <p>Practice makes perfect! Keep coding faster 💻</p>
      </footer>
    </div>
  );
};

export default DevTypingApp;