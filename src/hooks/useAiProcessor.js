import { useState, useEffect, useCallback } from 'react';
import { parsePrompt, generateSmartDefaults, validatePrompt, getExamplePrompts } from '@/lib/ai/aiProcessor';

/**
 * Custom hook for managing AI prompt processing and suggestions
 * @returns {Object} Hook state and methods
 */
export function useAiProcessor() {
  const [prompt, setPrompt] = useState('');
  const [parsedResult, setParsedResult] = useState(null);
  const [validation, setValidation] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Process prompt with debouncing
  useEffect(() => {
    if (prompt.trim().length === 0) {
      setParsedResult(null);
      setValidation(null);
      return;
    }
    
    setIsProcessing(true);
    
    // Debounce the parsing to avoid excessive processing
    const timeoutId = setTimeout(() => {
      try {
        console.log('Processing AI prompt:', prompt);
        const parsed = parsePrompt(prompt);
        const validationResult = validatePrompt(prompt);
        
        setParsedResult(parsed);
        setValidation(validationResult);
      } catch (error) {
        console.error('Error processing prompt:', error);
        setValidation({ isValid: false, issues: [error.message] });
      } finally {
        setIsProcessing(false);
      }
    }, 500);
    
    return () => {
      clearTimeout(timeoutId);
      setIsProcessing(false);
    };
  }, [prompt]);

  /**
   * Generate smart defaults from the current prompt
   * @returns {Object} Smart defaults configuration
   */
  const generateDefaults = useCallback(() => {
    if (!prompt.trim()) {
      return null;
    }
    
    try {
      return generateSmartDefaults(prompt);
    } catch (error) {
      console.error('Error generating defaults:', error);
      return null;
    }
  }, [prompt]);

  /**
   * Get example prompts for inspiration
   * @returns {Array} Array of example prompts
   */
  const getExamples = useCallback(() => {
    try {
      return getExamplePrompts();
    } catch (error) {
      console.error('Error getting examples:', error);
      return [];
    }
  }, []);

  /**
   * Set a new prompt value
   * @param {string} newPrompt - New prompt text
   */
  const updatePrompt = useCallback((newPrompt) => {
    setPrompt(newPrompt);
  }, []);

  /**
   * Clear the prompt and results
   */
  const clearPrompt = useCallback(() => {
    setPrompt('');
    setParsedResult(null);
    setValidation(null);
    setShowSuggestions(false);
  }, []);

  /**
   * Toggle suggestions visibility
   */
  const toggleSuggestions = useCallback(() => {
    setShowSuggestions(prev => !prev);
  }, []);

  /**
   * Apply an example prompt
   * @param {string} examplePrompt - Example prompt to apply
   */
  const applyExample = useCallback((examplePrompt) => {
    setPrompt(examplePrompt);
    setShowSuggestions(false);
  }, []);

  return {
    // State
    prompt,
    parsedResult,
    validation,
    isProcessing,
    showSuggestions,
    
    // Actions
    updatePrompt,
    clearPrompt,
    toggleSuggestions,
    applyExample,
    generateDefaults,
    getExamples,
    
    // Computed properties
    hasPrompt: prompt.trim().length > 0,
    isValid: validation?.isValid ?? null,
    hasResults: !!parsedResult,
    issues: validation?.issues || [],
    suggestions: validation?.suggestions || []
  };
} 