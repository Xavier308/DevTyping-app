// src/components/Controls/FileUploader.jsx
import React from 'react';
import '../../styles/components/Controls.css';

/**
 * FileUploader component for uploading custom code snippets
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.darkMode - Current theme mode
 * @param {Function} props.handleFileUpload - Function to handle file upload
 * @returns {JSX.Element} FileUploader component
 */
const FileUploader = ({ darkMode, handleFileUpload }) => {
  return (
    <label className={`file-label ${darkMode ? 'dark' : 'light'}`}>
      <span role="img" aria-label="folder emoji">📁</span>
      <span>Upload</span>
      <input
        type="file"
        accept=".py,.js,.txt,text/plain"
        onChange={handleFileUpload}
        className="file-input"
        onClick={(e) => e.target.value = null}
      />
    </label>
  );
};

export default React.memo(FileUploader);