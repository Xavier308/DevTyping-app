// src/hooks/useSnippetManager.js
import { useState, useEffect, useCallback, useRef } from 'react';
import sampleSnippets from '../data/sampleSnippets';
import { generateUniqueId } from '../utils/helpers';

/**
 * Custom hook to manage code snippets, language selection, and file uploads
 * 
 * @param {Function} resetPractice - Optional function to reset the practice when a new snippet is selected
 * @returns {Object} - Snippet state and handlers
 */
const useSnippetManager = (resetPractice = null) => {
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [currentSnippet, setCurrentSnippet] = useState(null);
  const [uploadedSnippets, setUploadedSnippets] = useState([]);
  
  // Store resetPractice in a ref to avoid dependency issues
  const resetPracticeRef = useRef(resetPractice);
  
  // Update the ref when resetPractice changes
  useEffect(() => {
    resetPracticeRef.current = resetPractice;
  }, [resetPractice]);

  // Initialize or change snippet when language changes
  useEffect(() => {
    const defaultSnippet = sampleSnippets[selectedLanguage]?.[0];
    if (defaultSnippet) {
      setCurrentSnippet(defaultSnippet);
      // Only call resetPractice if it's available
      if (resetPracticeRef.current) {
        resetPracticeRef.current(defaultSnippet.code);
      }
    } else {
      setCurrentSnippet(null);
      if (resetPracticeRef.current) {
        resetPracticeRef.current("");
      }
    }
  }, [selectedLanguage]);

  // Get all available snippets for the current language
  const getAvailableSnippets = useCallback(() => {
    return [
      ...(sampleSnippets[selectedLanguage] || []),
      ...uploadedSnippets.filter(s => s.language === selectedLanguage)
    ];
  }, [selectedLanguage, uploadedSnippets]);

  // Handle snippet selection from dropdown
  const handleSnippetChange = useCallback((e) => {
    const snippetId = e.target.value;
    const allSnippets = getAvailableSnippets();
    const newSnippet = allSnippets.find(s => s.id === snippetId);

    if (newSnippet) {
      setCurrentSnippet(newSnippet);
      // Only call resetPractice if it's available
      if (resetPracticeRef.current) {
        resetPracticeRef.current(newSnippet.code);
      }
    }
  }, [getAvailableSnippets]);

  // Handle file upload
  const handleFileUpload = useCallback((e) => {
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
          id: generateUniqueId('custom'),
          name: file.name.replace(/\.[^/.]+$/, ""),
          code: fileContent,
          language: selectedLanguage
        };

        setUploadedSnippets(prev => [...prev, newSnippet]);
        setCurrentSnippet(newSnippet);
        // Only call resetPractice if it's available
        if (resetPracticeRef.current) {
          resetPracticeRef.current(newSnippet.code);
        }
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
  }, [selectedLanguage]);

  // Initialize default snippet on first render
  useEffect(() => {
    const defaultSnippet = sampleSnippets[selectedLanguage]?.[0];
    if (defaultSnippet && !currentSnippet) {
      setCurrentSnippet(defaultSnippet);
    }
  }, []);

  return {
    selectedLanguage,
    currentSnippet,
    uploadedSnippets,
    setSelectedLanguage,
    handleSnippetChange,
    handleFileUpload,
    getAvailableSnippets
  };
};

export default useSnippetManager;