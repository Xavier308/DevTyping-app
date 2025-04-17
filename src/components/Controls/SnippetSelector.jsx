// src/components/Controls/SnippetSelector.jsx
import React from 'react';
import '../../styles/components/Controls.css';

/**
 * SnippetSelector component for selecting code snippets
 * 
 * @param {Object} props - Component props
 * @param {Object} props.currentSnippet - Currently selected snippet
 * @param {boolean} props.darkMode - Current theme mode
 * @param {Array} props.availableSnippets - All available snippets for current language
 * @param {Array} props.uploadedSnippets - User uploaded snippets
 * @param {string} props.selectedLanguage - Currently selected language
 * @param {Function} props.handleSnippetChange - Function to handle snippet selection
 * @returns {JSX.Element} SnippetSelector component
 */
const SnippetSelector = ({
  currentSnippet,
  darkMode,
  availableSnippets,
  uploadedSnippets,
  selectedLanguage,
  handleSnippetChange
}) => {
  // Get default snippets for the selected language
  const defaultSnippets = availableSnippets.filter(
    snippet => !uploadedSnippets.some(s => s.id === snippet.id)
  );
  
  // Get uploaded snippets for the selected language
  const filteredUploadedSnippets = uploadedSnippets.filter(
    s => s.language === selectedLanguage
  );
  
  return (
    <select
      value={currentSnippet?.id || ''}
      onChange={handleSnippetChange}
      className={`select ${darkMode ? 'dark' : 'light'}`}
      disabled={!currentSnippet}
    >
      {/* Default snippets */}
      {defaultSnippets.length > 0 ? (
        <optgroup label={selectedLanguage === 'python' ? 'Python Snippets' : 'JavaScript Snippets'}>
          {defaultSnippets.map(snippet => (
            <option key={snippet.id} value={snippet.id}>
              {snippet.name}
            </option>
          ))}
        </optgroup>
      ) : (
        <option disabled>No default snippets</option>
      )}

      {/* User uploaded snippets */}
      {filteredUploadedSnippets.length > 0 && (
        <optgroup label="Your Uploads">
          {filteredUploadedSnippets.map(snippet => (
            <option key={snippet.id} value={snippet.id}>
              {snippet.name}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  );
};

export default React.memo(SnippetSelector);