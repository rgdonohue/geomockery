'use client';

import { useState } from 'react';
import ReasoningPromptForm from '../components/ReasoningPromptForm';

export default function ReasoningPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/reasoning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process reasoning request');
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Error submitting prompt:', err);
      setError(err.message || 'An error occurred while processing your request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Contextual Reasoning Prompt</h1>
      
      <div className="mb-8 p-6 bg-indigo-50 rounded-lg border-2 border-indigo-100">
        <h2 className="text-xl font-semibold mb-4 text-indigo-800">What is this?</h2>
        <p className="mb-4">
          This form allows you to submit a prompt for reasoning, taking into account the context and specific use case.
          By providing these additional details, the reasoning process can be more targeted and relevant to your needs.
        </p>
        <ul className="list-disc pl-5 mb-2 text-indigo-700">
          <li><strong>Context</strong> - Provides background information and relevant details for reasoning</li>
          <li><strong>Use Case</strong> - Explains how the reasoning will be used and by whom</li>
          <li><strong>Prompt</strong> - The specific question or statement that requires reasoning</li>
        </ul>
      </div>
      
      <ReasoningPromptForm onSubmit={handleSubmit} />
      
      {loading && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-2 text-indigo-600">Processing your reasoning request...</p>
        </div>
      )}
      
      {error && (
        <div className="mt-8 p-6 bg-red-50 rounded-lg border-2 border-red-200">
          <h2 className="text-xl font-semibold mb-2 text-red-700">Error</h2>
          <p className="text-red-600">{error}</p>
        </div>
      )}
      
      {result && !loading && !error && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Reasoning Result</h2>
          <div className="prose prose-indigo max-w-none">
            <p className="mb-4 whitespace-pre-line">{result.analysis}</p>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">Generated at: {new Date(result.timestamp).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
} 