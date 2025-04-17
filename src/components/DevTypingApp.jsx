// src/components/DevTypingApp.jsx
import React, { useState, useEffect, useRef } from 'react';
import '../styles/DevTypingApp.css'; // Ensure this path is correct

// --- Configuration ---
const VISIBLE_LINE_COUNT = 10; // Number of lines to display at once
const AUTO_PAUSE_DELAY = 3000; // Milliseconds of inactivity before pausing

const DevTypingApp = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [currentSnippet, setCurrentSnippet] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentElapsedTime, setCurrentElapsedTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [lastInputTime, setLastInputTime] = useState(null);
  const [completed, setCompleted] = useState(false);

  const [currentLineIndex, setCurrentLineIndex] = useState(0); // Index of the top visible line
  const [visibleLines, setVisibleLines] = useState([]);
  const [typedLines, setTypedLines] = useState(['']);
  const [errorPositions, setErrorPositions] = useState({}); // { "line:char": true }
  const [fixedPositions, setFixedPositions] = useState({}); // { "line:char": true }
  const [currentPosition, setCurrentPosition] = useState({ line: 0, char: 0 });

  const [uploadedSnippets, setUploadedSnippets] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('python');

  const inputRef = useRef(null);
  const pauseTimerRef = useRef(null);
  const intervalRef = useRef(null);


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


  // --- Effects ---

  // Initialize or change language
  useEffect(() => {
    const defaultSnippet = sampleSnippets[selectedLanguage]?.[0];
    if (defaultSnippet) {
        setCurrentSnippet(defaultSnippet);
        resetPracticeInternal(defaultSnippet.code);
    } else {
        setCurrentSnippet(null);
        resetPracticeInternal("");
    }
     // Reset scroll position when language changes
     setCurrentLineIndex(0);
  }, [selectedLanguage]);

  // Internal reset function
  const resetPracticeInternal = (snippetCode) => {
    clearInterval(intervalRef.current);
    clearTimeout(pauseTimerRef.current);

    setUserInput('');
    setStartTime(null);
    setElapsedTime(0);
    setCurrentElapsedTime(0);
    setWpm(0);
    setIsPaused(false);
    setLastInputTime(null);
    setCompleted(false);

    setTypedLines(['']);
    // setCurrentLineIndex(0); // Resetting scroll position is handled in language/snippet change effect
    setCurrentPosition({ line: 0, char: 0 });
    setErrorPositions({});
    setFixedPositions({});

    // Update visible lines calculation based on VISIBLE_LINE_COUNT
    const snippetLines = snippetCode.split('\n');
    const endLine = Math.min(snippetLines.length, VISIBLE_LINE_COUNT);
    setVisibleLines(snippetLines.slice(0, endLine));

    // Always focus after reset
    // Use setTimeout to ensure focus happens after potential DOM updates
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // Public reset function
  const resetPractice = () => {
    if (!currentSnippet) return;
    resetPracticeInternal(currentSnippet.code);
    setCurrentLineIndex(0); // Explicitly reset scroll on manual reset
  };

  // Timer logic (WPM calculation can be refined)
  useEffect(() => {
    // ... (timer logic remains the same as previous version) ...
        if (startTime && !completed && !isPaused) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsedSinceStart = (now - startTime) / 1000;
        const totalElapsed = elapsedTime + elapsedSinceStart;
        setCurrentElapsedTime(totalElapsed); // Update display time

        // Calculate WPM based on total characters typed in correctly finished lines + current line correct chars
        let correctChars = 0;
        const snippetLines = currentSnippet?.code.split('\n') || [];
        for (let i = 0; i < typedLines.length; i++) {
            const typed = typedLines[i];
            const target = snippetLines[i] || "";
            if (i < currentPosition.line) { // Count full correct lines
                // Check if the line matches target AND has no recorded errors for that line
                let lineHasError = false;
                for(const key in errorPositions) {
                    if (key.startsWith(`${i}:`)) {
                        lineHasError = true;
                        break;
                    }
                }
                if (typed === target && !lineHasError) {
                   correctChars += target.length + 1; // +1 for newline/enter
                }
            } else if (i === currentPosition.line) { // Count correct chars on current line up to cursor
                for(let j=0; j<currentPosition.char; j++){
                    // Check char match AND no error at that specific position
                    if(j < typed.length && j < target.length && typed[j] === target[j] && !errorPositions[`${i}:${j}`]) {
                        correctChars++;
                    }
                }
            }
        }

        const minutes = totalElapsed / 60;
        // Standard WPM is words (char/5) per minute
        const calculatedWPM = minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0;
        setWpm(calculatedWPM);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [startTime, elapsedTime, completed, isPaused, typedLines, currentPosition, errorPositions, currentSnippet]);


  // Auto-pause
  useEffect(() => {
    // ... (auto-pause logic remains the same) ...
        clearTimeout(pauseTimerRef.current);

    if (startTime && !completed && !isPaused && lastInputTime) {
      pauseTimerRef.current = setTimeout(() => {
        setIsPaused(true);
        const elapsedSinceStart = (Date.now() - startTime) / 1000;
        setElapsedTime(prev => prev + elapsedSinceStart);
        setStartTime(null);
      }, AUTO_PAUSE_DELAY);
    }

    return () => clearTimeout(pauseTimerRef.current);
  }, [lastInputTime, startTime, completed, isPaused]);


  // Completion check
  useEffect(() => {
    // ... (completion logic remains the same) ...
        if (!currentSnippet) return;
    const snippetLines = currentSnippet.code.split('\n');

    // Basic check: Has the user typed at least the required number of lines?
    if (typedLines.length < snippetLines.length) {
      setCompleted(false);
      return;
    }

    // Check content match and no errors remaining
    // Need to be careful here: userInput might have trailing newline if last action was Enter
    const typedTextForCompare = typedLines.join('\n'); //.trimEnd(); // Or handle textarea value carefully
    const targetText = currentSnippet.code;

    const hasErrors = Object.keys(errorPositions).length > 0;

    if (typedTextForCompare === targetText && !hasErrors) {
      if (!completed) { // Prevent setting completed multiple times
          setCompleted(true);
          clearInterval(intervalRef.current);
          clearTimeout(pauseTimerRef.current);
           // Final WPM calc
           const finalTotalElapsed = currentElapsedTime;
           let correctChars = targetText.replace(/\n/g, '').length;
           const finalMinutes = finalTotalElapsed / 60;
           const finalWPM = finalMinutes > 0 ? Math.round((correctChars / 5) / finalMinutes) : 0;
           setWpm(finalWPM);
       }
    } else {
      if (completed) { // If it was completed, but now isn't (e.g., user edits)
        setCompleted(false);
        // Optionally restart timer if needed, though typically editing after completion resets
      }
    }
  }, [typedLines, errorPositions, currentSnippet, currentElapsedTime, completed]);


  // Update visible lines for scrolling
  useEffect(() => {
    if (!currentSnippet) return;
    const snippetLines = currentSnippet.code.split('\n');
    // Ensure currentLineIndex doesn't go too far down
    const maxFirstLineIndex = Math.max(0, snippetLines.length - VISIBLE_LINE_COUNT);
    const validFirstLineIndex = Math.min(currentLineIndex, maxFirstLineIndex);

    // Calculate start and end lines for slicing
    const startLine = Math.max(0, validFirstLineIndex);
    const endLine = Math.min(snippetLines.length, startLine + VISIBLE_LINE_COUNT);

    // Only update state if the slice *actually* changes to prevent infinite loops
    const newVisible = snippetLines.slice(startLine, endLine);
    if (JSON.stringify(newVisible) !== JSON.stringify(visibleLines)) {
       setVisibleLines(newVisible);
    }

    // Adjust scroll position if currentLineIndex was invalid
    if (validFirstLineIndex !== currentLineIndex) {
       setCurrentLineIndex(validFirstLineIndex);
    }

  }, [currentLineIndex, currentSnippet, visibleLines]); // Added visibleLines dependency

  // --- Event Handlers ---

  // Handle Tab and Enter
  const handleKeyDown = (e) => {
    if (!currentSnippet || completed) return;

    // Tab Key
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const value = e.target.value;
      const newValue = value.substring(0, start) + '    ' + value.substring(end);
      const newCursorPos = start + 4;

      // Update textarea value and cursor position *before* calling handleInputChange
      e.target.value = newValue;
      e.target.selectionStart = e.target.selectionEnd = newCursorPos;

      // Trigger handleInputChange with the updated target state
      handleInputChange(e); // Pass the event object
      setLastInputTime(Date.now());
    }
    // Enter Key
    else if (e.key === 'Enter') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const value = e.target.value;
      const newValue = value.substring(0, start) + '\n' + value.substring(end);
      const newCursorPos = start + 1;

       // Update textarea value and cursor position *before* calling handleInputChange
       e.target.value = newValue;
       e.target.selectionStart = e.target.selectionEnd = newCursorPos;

       // Trigger handleInputChange with the updated target state
       handleInputChange(e); // Pass the event object

      // Scroll logic - scroll when cursor moves to the last visible line
      const nextLineLogicalIndex = currentPosition.line + 1; // Where the cursor will be logically
       // Check if the line the cursor *will move to* is beyond the currently displayed lines
      if (nextLineLogicalIndex >= currentLineIndex + VISIBLE_LINE_COUNT -1) {
          // We need to show the next line, so advance the top visible line index
          const snippetLines = currentSnippet.code.split('\n');
          const maxFirstLineIndex = Math.max(0, snippetLines.length - VISIBLE_LINE_COUNT);
           setCurrentLineIndex(prev => Math.min(prev + 1, maxFirstLineIndex));
      }
      setLastInputTime(Date.now());
    }
  };


  // Handle Input Change (Typing, Pasting, Deleting)
  const handleInputChange = (e) => {
    if (completed || !currentSnippet) return;

    const currentValue = e.target.value;
    const prevErrorState = { ...errorPositions }; // Capture previous state
    const prevFixedState = { ...fixedPositions }; // Capture previous state

    // --- Timer ---
    if (!startTime && !isPaused) { setStartTime(Date.now()); setElapsedTime(0); }
    if (isPaused) { setIsPaused(false); setStartTime(Date.now()); }
    setLastInputTime(Date.now());

    // --- Update Core State ---
    setUserInput(currentValue); // Update the backing state for the textarea

    // --- Process Input & Calculate State ---
    const inputLines = currentValue.split('\n');
    const snippetLines = currentSnippet.code.split('\n');
    const newTypedLines = [...inputLines]; // Update internal line array

    // --- Determine Current Position ---
    let cursorPosition = e.target.selectionStart;
    let determinedLineIndex = 0;
    let determinedCharIndex = 0;
    let cumulativeLength = 0;
    for (let i = 0; i < inputLines.length; i++) {
        const lineLength = inputLines[i].length;
        const lineEndPosition = cumulativeLength + lineLength;
        if (cursorPosition <= lineEndPosition) {
            determinedLineIndex = i;
            determinedCharIndex = cursorPosition - cumulativeLength;
            break;
        }
        cumulativeLength += lineLength + 1;
    }
     if (determinedLineIndex >= inputLines.length && inputLines.length > 0) {
         determinedLineIndex = inputLines.length - 1;
         determinedCharIndex = inputLines[determinedLineIndex].length;
     } else if (inputLines.length === 0) {
         determinedLineIndex = 0; determinedCharIndex = 0;
     }


    // --- Recalculate Errors and Fixed Positions ---
    const newErrors = {};
    const newFixed = {};

    // DEBUGGING LOG (Remove later)
    // console.log(`--- Input Change --- Cursor: ${determinedLineIndex}:${determinedCharIndex}`);

    for (let lineIdx = 0; lineIdx < Math.max(newTypedLines.length, snippetLines.length); lineIdx++) {
        const currentLineInput = newTypedLines[lineIdx] || '';
        const targetLine = snippetLines[lineIdx] || '';
        const maxLen = Math.max(currentLineInput.length, targetLine.length);

        for (let charIdx = 0; charIdx < maxLen; charIdx++) {
            const posKey = `${lineIdx}:${charIdx}`;
            const inputChar = currentLineInput[charIdx];
            const targetChar = targetLine[charIdx];
            const wasError = !!prevErrorState[posKey]; // Was this an error previously?

            if (charIdx < currentLineInput.length && charIdx < targetLine.length) {
                // Character exists in both input and target
                if (inputChar === targetChar) {
                    // Correctly typed character
                    if (wasError) {
                         newFixed[posKey] = true; // Mark as fixed if it was previously an error
                         // DEBUG LOG: console.log(`FIXED: ${posKey} ('${inputChar}')`);
                    }
                    // Correct: No error is marked. Fixed state is handled above.
                } else {
                    // Incorrectly typed character
                    newErrors[posKey] = true; // Mark as error
                    // DEBUG LOG: console.log(`ERROR: ${posKey} (Typed '${inputChar}', Expected '${targetChar}')`);
                }
            } else if (charIdx < currentLineInput.length) {
                 // Extra character typed by user (input longer than target)
                 newErrors[posKey] = true;
                 // DEBUG LOG: console.log(`ERROR: ${posKey} (Extra char '${inputChar}')`);
            } else if (charIdx < targetLine.length) {
                 // Character missing from input (target longer than input)
                 // Considered 'pending', no error marked by default.
                 // If it previously was fixed, clear that.
                 // delete newFixed[posKey]; // No need, we rebuild newFixed
            }
        }
    }

    // --- Update State ---
    // Only update if changed to avoid unnecessary re-renders
    if (JSON.stringify(newTypedLines) !== JSON.stringify(typedLines)) {
       setTypedLines(newTypedLines);
    }
    if (determinedLineIndex !== currentPosition.line || determinedCharIndex !== currentPosition.char) {
        setCurrentPosition({ line: determinedLineIndex, char: determinedCharIndex });
    }
     if (JSON.stringify(newErrors) !== JSON.stringify(errorPositions)) {
        setErrorPositions(newErrors);
     }
     if (JSON.stringify(newFixed) !== JSON.stringify(fixedPositions)) {
         setFixedPositions(newFixed);
     }
  };

  // --- Snippet Loading ---
  const handleSnippetChange = (e) => {
    // ... (snippet change logic remains the same) ...
        const snippetId = e.target.value;
    const allSnippets = [
        ...(sampleSnippets[selectedLanguage] || []), // Handle empty language case
        ...uploadedSnippets.filter(s => s.language === selectedLanguage)
    ];
    const newSnippet = allSnippets.find(s => s.id === snippetId);

    if (newSnippet) {
      setCurrentSnippet(newSnippet);
      resetPracticeInternal(newSnippet.code); // Use internal reset
      setCurrentLineIndex(0); // Reset scroll on snippet change
    }
  };

  const handleFileUpload = (e) => {
    // ... (file upload logic remains the same) ...
        const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const fileContent = event.target.result;
        if (typeof fileContent !== 'string' || fileContent.trim() === '') {
            console.error("Invalid file content.");
            alert("Error: Could not read file or file is empty.");
            return;
        }
        const newSnippet = {
          id: `custom-${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, ""),
          code: fileContent,
          language: selectedLanguage
        };

        setUploadedSnippets(prev => [...prev, newSnippet]);
        setCurrentSnippet(newSnippet);
        resetPracticeInternal(newSnippet.code); // Use internal reset
         setCurrentLineIndex(0); // Reset scroll on new upload
      } catch (error) {
        console.error("Error reading file:", error);
        alert("Error reading file. Please ensure it's a text file.");
      }
    };
    reader.onerror = () => {
        console.error("FileReader error:", reader.error);
        alert("Error reading file.");
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  // --- Helper Functions ---
  const getEmojiForWPM = () => { /* ... (same) ... */
        if (isPaused) return "⏸️";
    if (completed) return "🎉";
    if (wpm > 80) return "🚀";
    if (wpm > 60) return "🔥";
    if (wpm > 40) return "⚡";
    if (wpm > 20) return "👨‍💻";
    return "🐢";
   };
  const formatTime = (seconds) => { /* ... (same) ... */
      const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // --- Rendering ---

  // Render a single line
  const renderCodeLine = (line, lineIndex) => {
    // line: the target code string for this line
    // lineIndex: the index within the *visibleLines* array (0 to VISIBLE_LINE_COUNT-1)
    const actualLineIndex = lineIndex + currentLineIndex; // Absolute index in the snippet
    const typedLine = typedLines[actualLineIndex] || '';
    const isCurrentActiveLine = actualLineIndex === currentPosition.line;

    const spans = [];

    // Iterate through the maximum length of target or typed line for this row
    const maxLen = Math.max(line.length, isCurrentActiveLine ? typedLine.length : 0);

    for (let charIndex = 0; charIndex < maxLen; charIndex++) {
        const posKey = `${actualLineIndex}:${charIndex}`;
        const targetChar = line[charIndex];
        const typedChar = typedLine[charIndex];
        let charToDisplay = targetChar !== undefined ? targetChar : typedChar; // Display target, fallback to typed extra char
        let className = 'character';

        // Determine state: Error > Fixed > Correct > Pending
        if (errorPositions[posKey]) {
            className += ' error';
            if (targetChar === undefined) { // Handle extra character display
                charToDisplay = typedChar;
            }
        } else if (fixedPositions[posKey]) {
            className += ' fixed';
        } else if (charIndex < typedLine.length || completed) { // Mark as correct if typed or if practice is complete
             // Check if character exists in target, otherwise it's pending/extra
             if (charIndex < line.length && typedChar === targetChar) {
                 className += ' correct';
             } else if (charIndex >= line.length) {
                 // This case should be caught by errorPositions for extra chars, but as fallback:
                 className += ' error'; // Should be marked error already
                 charToDisplay = typedChar;
             }
              else {
                 // Typed, but doesn't match target (and wasn't marked error?) -> Should be error.
                 // Or, target exists but wasn't typed -> Pending
                 if (targetChar !== undefined) {
                      className += ' pending';
                 } else {
                      // Should not happen if maxLen logic is correct
                 }
             }
        } else {
            className += ' pending';
        }

        // Add cursor styling
        if (isCurrentActiveLine && charIndex === currentPosition.char) {
            className += ' current';
        }

         // Handle Tab display (render as spaces)
         const displayContent = charToDisplay === '\t' ? '    ' : charToDisplay;

        spans.push(
            <span key={`${actualLineIndex}-${charIndex}`} className={className}>
                {displayContent}
            </span>
        );
    }

     // Add cursor span if cursor is positioned *after* the last character of the line (target or typed)
     if (isCurrentActiveLine && currentPosition.char === maxLen && maxLen > 0) {
         // Check if the last span already has 'current' - if so, this might be redundant
         // It's needed if the line was empty and cursor is at 0, or after last char.
         if (!spans[maxLen - 1]?.props.className.includes(' current')) {
            spans.push(<span key={`${actualLineIndex}-cursor-end`} className="character current"></span>);
         }
     }
     // Ensure empty lines have height and potential cursor
     if (line.length === 0 && typedLine.length === 0) {
         if (isCurrentActiveLine && currentPosition.char === 0) {
            return <div key={actualLineIndex} className="line"><span className="character current"> </span></div>; // Non-breaking space with cursor
         } else {
             return <div key={actualLineIndex} className="line"> </div>; // Non-breaking space for height
         }
     }


    return (
        <div key={actualLineIndex} className="line">
            {spans}
        </div>
    );
};


  // --- Main JSX ---
  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
      {/* Header remains the same */}
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
              {darkMode ? <><span role="img" aria-label="sun emoji">☀️</span> Light</> : <><span role="img" aria-label="moon emoji">🌙</span> Dark</>}
            </button>
          </div>
        </div>
      </header>


      <main className="main">
        <div className="container">
          {/* Toolbar remains the same */}
           <div className="toolbar">
            <div className="snippet-controls">
              <select
                value={currentSnippet?.id || ''}
                onChange={handleSnippetChange}
                className={`select ${darkMode ? 'dark' : 'light'}`}
                disabled={!currentSnippet}
              >
                {/* Populate options based on selected language */}
                {sampleSnippets[selectedLanguage]?.length > 0 ? (
                   <optgroup label={selectedLanguage === 'python' ? 'Python Snippets' : 'JavaScript Snippets'}>
                     {sampleSnippets[selectedLanguage].map(snippet => (
                       <option key={snippet.id} value={snippet.id}>
                         {snippet.name}
                       </option>
                     ))}
                   </optgroup>
                ) : (
                    <option disabled>No default snippets</option>
                )}

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
              <label className={`file-label button ${darkMode ? 'dark' : 'light'}`}>
                 <span role="img" aria-label="folder emoji">📁</span> Upload
                <input
                  type="file"
                  accept=".py,.js,.txt,text/plain"
                  onChange={handleFileUpload}
                  className="file-input"
                  onClick={(e) => e.target.value = null}
                />
              </label>
            </div>
            <div className="metrics">
              <div className="metric">
                <div className="metric-label">Time</div>
                <div className="metric-value">{formatTime(currentElapsedTime)}</div>
              </div>
              <div className="metric">
                <div className="metric-label">WPM</div>
                <div className="metric-value">{wpm}</div>
                <span className="emoji" role="img" aria-label="wpm indicator emoji">{getEmojiForWPM()}</span>
              </div>
            </div>
          </div>


          {/* Code Display and Input Area */}
          {currentSnippet ? (
            <>
              <div className="snippet-container">
                {/* Header */}
                <div className={`snippet-header ${darkMode ? 'dark' : 'light'}`}>
                  <div className="snippet-title">{currentSnippet.name}</div>
                  <div className="snippet-language">
                    {/* ... language display ... */}
                    {selectedLanguage === 'python' ? <><span role="img" aria-label="python snake emoji">🐍</span> Python</> : <><span role="img" aria-label="javascript square emoji">🟨</span> JavaScript</>}
                  </div>
                </div>
                {/* Code Display Area */}
                <div
                    className={`snippet-content code-display ${darkMode ? 'dark' : 'light'}`}
                    onClick={() => inputRef.current?.focus()}
                >
                  {/* Render visible lines */}
                   {visibleLines.map((line, idx) => renderCodeLine(line, idx))}
                   {/* Add padding lines if snippet is shorter than visible count */}
                   {visibleLines.length < VISIBLE_LINE_COUNT &&
                     currentSnippet.code.split('\n').length > visibleLines.length && // Only add padding if there are more lines below
                     Array(VISIBLE_LINE_COUNT - visibleLines.length).fill().map((_, idx) => (
                       <div key={`empty-${idx + visibleLines.length}`} className="line"> </div>
                   ))}
                </div>
              </div>

              {/* Hidden Textarea and Overlay Container */}
              <div className="input-area" style={{ position: 'relative', height: '1px', overflow: 'hidden', marginBottom: '1rem' }}> {/* Minimal height */}
                <textarea
                   ref={inputRef}
                   value={userInput}
                   onChange={handleInputChange}
                   onKeyDown={handleKeyDown}
                   disabled={completed}
                   className="hidden-textarea"
                   autoFocus
                   spellCheck="false"
                   autoCapitalize="none"
                   autoComplete="off"
                   autoCorrect="off"
                   wrap="off"
                   rows={1}
                   style={{
                      position: 'absolute', left: '-9999px', top: '0px',
                      opacity: 0, width: '100px', height: '20px',
                      overflow: 'hidden', whiteSpace: 'pre'
                   }}
                />
                 {/* Overlay for Paused/Completed State */}
                 {(completed || isPaused) && (
                     // The overlay might be better positioned relative to snippet-container
                     // Or ensure input-area's parent (.container) is positioned
                     <div className="completion-overlay" style={{ /* ... overlay styles ... */ }}>
                         {/* ... completion message ... */}
                          <div className="completion-message">
                       <div className="completion-emoji">{completed ? "🎉" : "⏸️"}</div>
                       <div>{completed ? "Completed!" : "Paused - Click or type to resume"}</div>
                       <button
                         onClick={(e) => { e.stopPropagation(); resetPractice(); }}
                         className={`completion-button ${darkMode ? 'dark' : 'light'}`}
                       >
                         {completed ? "Try Again" : "Reset"}
                       </button>
                     </div>

                     </div>
                 )}
              </div>

            </>
          ) : (
            <div className="loading-placeholder">Select a snippet or upload a file to begin.</div>
          )}

          {/* Reset Button remains the same */}
           <div className="reset-container">
            <button
              onClick={resetPractice}
              className={`reset-button button ${darkMode ? 'dark' : 'light'}`}
              disabled={!currentSnippet}
            >
              Reset
            </button>
          </div>

        </div> {/* End .container */}
      </main>

      {/* Footer remains the same */}
      <footer className={`footer ${darkMode ? 'dark' : 'light'}`}>
        <p>Practice makes perfect! Keep coding faster <span role="img" aria-label="laptop emoji">💻</span></p>
      </footer>

    </div> // End .app-container
  );
};

export default DevTypingApp;