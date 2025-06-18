import { useState } from 'react';

const ReasoningPromptForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    context: '',
    useCase: '',
    prompt: ''
  });
  
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSubmit(formData);
      // Optionally clear the form after successful submission
      // setFormData({ context: '', useCase: '', prompt: '' });
    } catch (error) {
      console.error('Error submitting prompt:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="w-full mx-auto bg-white rounded-lg shadow-md p-6 mt-6" style={{ maxWidth: "48rem" }}>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Reasoning Prompt Form</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-1">
            Context
          </label>
          <textarea
            id="context"
            name="context"
            rows="3"
            placeholder="Provide background information and relevant context..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={formData.context}
            onChange={handleChange}
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Describe the situation, environment, or background information needed for reasoning.
          </p>
        </div>
        
        <div className="mb-4">
          <label htmlFor="useCase" className="block text-sm font-medium text-gray-700 mb-1">
            Use Case
          </label>
          <textarea
            id="useCase"
            name="useCase"
            rows="3"
            placeholder="Describe how this will be used and by whom..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={formData.useCase}
            onChange={handleChange}
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Explain the specific purpose of this prompt and who will be using the results.
          </p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
            Prompt
          </label>
          <textarea
            id="prompt"
            name="prompt"
            rows="5"
            placeholder="Enter your reasoning prompt here..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={formData.prompt}
            onChange={handleChange}
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Write the specific prompt or question that requires reasoning, considering the context and use case.
          </p>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Processing...' : 'Submit Prompt'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReasoningPromptForm; 