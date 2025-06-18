'use client';

import { useState } from 'react';
import { parsePrompt, getExamplePrompts } from '../generate/utils/aiProcessor';

export default function AiDemoSection() {
  const [demoPrompt, setDemoPrompt] = useState('');
  const [demoResult, setDemoResult] = useState(null);

  const handlePromptChange = (prompt) => {
    setDemoPrompt(prompt);
    if (prompt.trim()) {
      const result = parsePrompt(prompt);
      setDemoResult(result);
    } else {
      setDemoResult(null);
    }
  };

  const examplePrompts = [
    "Generate 50 coffee shops with ratings and wifi info",
    "Create hiking trails with difficulty levels",
    "Make 25 parks with facilities and area info"
  ];

  return (
    <section className="py-16 bg-indigo-900 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black uppercase mb-4">
            AI-Powered Generation
          </h2>
          <p className="text-xl text-indigo-200 max-w-3xl mx-auto">
            Describe what you want in natural language, and our AI will automatically 
            configure the perfect dataset for you.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Input Side */}
            <div className="bg-white text-black p-6 border-4 border-indigo-300">
              <h3 className="text-lg font-black uppercase text-indigo-800 mb-4">
                Try AI Generation
              </h3>
              
              <div className="space-y-4">
                <textarea
                  value={demoPrompt}
                  onChange={(e) => handlePromptChange(e.target.value)}
                  placeholder="Describe your dataset..."
                  className="w-full p-3 border-2 border-indigo-300 focus:border-indigo-500 focus:outline-none min-h-[100px]"
                />
                
                <div className="space-y-2">
                  <p className="text-sm font-bold text-indigo-800">Try these examples:</p>
                  {examplePrompts.map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => handlePromptChange(example)}
                      className="block w-full text-left text-sm text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-2 border border-indigo-200 hover:border-indigo-300"
                    >
                      "{example}"
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Output Side */}
            <div className="bg-gray-100 text-black p-6 border-4 border-gray-400">
              <h3 className="text-lg font-black uppercase text-gray-800 mb-4">
                AI Understanding
              </h3>
              
              {demoResult ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 border-2 border-gray-300">
                      <div className="text-xs text-gray-600">Geometry Type</div>
                      <div className="font-bold text-gray-800 capitalize">
                        {demoResult.geometryType}s
                      </div>
                    </div>
                    
                    <div className="bg-white p-3 border-2 border-gray-300">
                      <div className="text-xs text-gray-600">Quantity</div>
                      <div className="font-bold text-gray-800">
                        {demoResult.quantity}
                      </div>
                    </div>
                  </div>
                  
                  {demoResult.domain && (
                    <div className="bg-green-100 p-3 border-2 border-green-300">
                      <div className="text-xs text-green-600">Detected Domain</div>
                      <div className="font-bold text-green-800 capitalize">
                        {demoResult.domain}
                      </div>
                    </div>
                  )}
                  
                  {demoResult.attributes.length > 0 && (
                    <div className="bg-blue-100 p-3 border-2 border-blue-300">
                      <div className="text-xs text-blue-600 mb-2">Generated Attributes</div>
                      <div className="space-y-1">
                        {demoResult.attributes.slice(0, 3).map((attr, idx) => (
                          <div key={idx} className="text-sm text-blue-800">
                            <strong>{attr.name}</strong> ({attr.type})
                          </div>
                        ))}
                        {demoResult.attributes.length > 3 && (
                          <div className="text-xs text-blue-600">
                            +{demoResult.attributes.length - 3} more attributes
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-white p-3 border-2 border-gray-300">
                    <div className="text-xs text-gray-600">AI Confidence</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 h-2">
                        <div 
                          className={`h-2 ${demoResult.confidence > 0.7 ? 'bg-green-500' : demoResult.confidence > 0.4 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${demoResult.confidence * 100}%` }}
                        />
                      </div>
                      <span className="font-bold text-gray-800">
                        {Math.round(demoResult.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  <p>Enter a prompt to see AI analysis</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="text-center mt-8">
            <a
              href="/generate"
              className="inline-block px-8 py-4 bg-white text-indigo-900 font-black text-lg uppercase border-4 border-white hover:bg-indigo-100 transform hover:translate-y-[-2px] transition-transform"
            >
              Try Full AI Generation →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
} 