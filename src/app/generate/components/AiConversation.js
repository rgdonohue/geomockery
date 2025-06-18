'use client';

import { useState, useEffect } from 'react';
import { generateConversationalResponse, generatePreviewWithGeography } from '@/lib/ai/aiProcessor';

export default function AiConversation({ prompt, onApplySettings, onClearPrompt, onMapOperation }) {
  const [conversation, setConversation] = useState(null);
  const [responses, setResponses] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [geoPreview, setGeoPreview] = useState(null);

  useEffect(() => {
    if (prompt.trim().length > 0) {
      const response = generateConversationalResponse(prompt);
      setConversation(response);
      setResponses({});
      setShowPreview(false);
      
      // Generate geographic preview if location context is detected
      const preview = generatePreviewWithGeography(prompt);
      setGeoPreview(preview);
      
      // Auto-set map location if we have geographic context
      if (preview && preview.hasLocationContext && preview.mapSuggestions.shouldSetLocation && onMapOperation) {
        onMapOperation({
          type: 'setLocation',
          bounds: preview.mapSuggestions.bounds,
          centerPoint: preview.mapSuggestions.centerPoint,
          zoomLevel: preview.mapSuggestions.zoomLevel,
          locationMessage: preview.locationMessage
        });
      }
    } else {
      setConversation(null);
      setResponses({});
      setShowPreview(false);
      setGeoPreview(null);
    }
  }, [prompt, onMapOperation]);

  const handleClarificationResponse = (type, value) => {
    setResponses(prev => ({ ...prev, [type]: value }));
  };

  const handleConfirmGeneration = () => {
    if (conversation?.preview) {
      let finalSettings = {
        geometryType: conversation.preview.geometryType,
        quantity: responses.quantity || conversation.preview.quantity,
        customAttributes: conversation.preview.attributes || []
      };

      // Apply clarification responses
      if (responses.area) {
        finalSettings.generationArea = responses.area;
      }

      onApplySettings(finalSettings);
    }
  };

  const handleModifyPrompt = () => {
    setShowPreview(false);
    // Could open a modal or inline editor here
  };

  if (!conversation) return null;

  return (
    <div className="mt-4 space-y-4">
      {/* AI Response Message */}
      <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-indigo-800 font-medium">{conversation.message}</p>
          </div>
        </div>
      </div>

      {/* Questions and Clarifications */}
      {conversation.type === 'clarification' && (
        <div className="space-y-4">
          {conversation.clarifications?.map((clarification, idx) => (
            <div key={idx} className="bg-white border-2 border-indigo-200 p-4">
              <h4 className="font-bold text-indigo-800 mb-3">
                {clarification.type === 'quantity' ? 'Dataset Size:' : 
                 clarification.type === 'area' ? 'Generation Area:' : 'Options:'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {clarification.options.map((option, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => handleClarificationResponse(clarification.type, option.value)}
                    className={`p-3 text-left border-2 font-medium transition-colors ${
                      responses[clarification.type] === option.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-indigo-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Preview Button */}
          {Object.keys(responses).length > 0 && (
            <button
              onClick={() => setShowPreview(true)}
              className="w-full px-4 py-3 bg-indigo-600 text-white font-bold uppercase border-2 border-indigo-700 hover:bg-indigo-500 transition-colors"
            >
              Preview Generation
            </button>
          )}
        </div>
      )}

      {/* Need More Info */}
      {conversation.type === 'need_more_info' && (
        <div className="bg-yellow-50 border-2 border-yellow-300 p-4">
          <h4 className="font-bold text-yellow-800 mb-2">Help me understand:</h4>
          <ul className="list-disc list-inside space-y-1 text-yellow-700">
            {conversation.questions.map((question, idx) => (
              <li key={idx}>{question}</li>
            ))}
          </ul>
          
          {conversation.suggestions && (
            <div className="mt-3">
              <p className="font-medium text-yellow-800 mb-2">Try these examples:</p>
              <div className="space-y-1">
                {conversation.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => onClearPrompt(suggestion.replace('Try: ', '').replace(/['"]/g, ''))}
                    className="block text-sm text-yellow-700 hover:text-yellow-900 hover:underline"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Generation Preview */}
      {(showPreview || conversation.type === 'ready_to_generate') && conversation.preview && (
        <div className="bg-green-50 border-2 border-green-300 p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-green-800">Generation Preview</h4>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                conversation.confidence > 0.7 ? 'bg-green-500' : 
                conversation.confidence > 0.4 ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-sm text-green-700">
                {Math.round((conversation.confidence || 0.8) * 100)}% confidence
              </span>
              {geoPreview && geoPreview.hasLocationContext && (
                <div className="flex items-center gap-1 ml-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-sm text-blue-700">Location detected</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white p-3 border border-green-200">
              <div className="text-xs text-green-600">Type</div>
              <div className="font-bold text-green-800 capitalize">
                {conversation.preview.geometryType}s
              </div>
            </div>
            
            <div className="bg-white p-3 border border-green-200">
              <div className="text-xs text-green-600">Quantity</div>
              <div className="font-bold text-green-800">
                {responses.quantity || conversation.preview.quantity}
              </div>
            </div>
            
            {conversation.preview.domain && (
              <div className="bg-white p-3 border border-green-200">
                <div className="text-xs text-green-600">Domain</div>
                <div className="font-bold text-green-800 capitalize">
                  {conversation.preview.domain}
                </div>
              </div>
            )}
            
            <div className="bg-white p-3 border border-green-200">
              <div className="text-xs text-green-600">Attributes</div>
              <div className="font-bold text-green-800">
                {conversation.preview.attributes?.length || 0}
              </div>
            </div>
          </div>

          {conversation.preview.attributes && conversation.preview.attributes.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-green-800 mb-2">Included Attributes:</p>
              <div className="flex flex-wrap gap-2">
                {conversation.preview.attributes.slice(0, 6).map((attr, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-white border border-green-200 text-xs text-green-700"
                  >
                    {attr.name} ({attr.type})
                  </span>
                ))}
                {conversation.preview.attributes.length > 6 && (
                  <span className="px-2 py-1 bg-green-100 text-xs text-green-600">
                    +{conversation.preview.attributes.length - 6} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Geographic Context */}
          {geoPreview && geoPreview.hasLocationContext && (
            <div className="mb-4 bg-blue-50 border border-blue-200 p-3">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm font-medium text-blue-800">Geographic Context</span>
              </div>
              <p className="text-sm text-blue-700">{geoPreview.locationMessage}</p>
              {geoPreview.geoJSON && (
                <div className="mt-2">
                  <button
                    onClick={() => {
                      if (onMapOperation && geoPreview.geoJSON) {
                        onMapOperation({
                          type: 'showPreview',
                          geoJSON: geoPreview.geoJSON,
                          bounds: geoPreview.mapSuggestions.bounds
                        });
                      }
                    }}
                    className="text-xs px-2 py-1 bg-blue-600 text-white border border-blue-700 hover:bg-blue-500 transition-colors"
                  >
                    Show Preview on Map
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleConfirmGeneration}
              className="flex-1 px-4 py-3 bg-green-600 text-white font-bold uppercase border-2 border-green-700 hover:bg-green-500 transition-colors"
            >
              ✓ Generate This Dataset
            </button>
            
            <button
              onClick={handleModifyPrompt}
              className="px-4 py-3 bg-white text-green-700 font-bold uppercase border-2 border-green-300 hover:bg-green-50 transition-colors"
            >
              Modify
            </button>
          </div>
        </div>
      )}

      {/* Additional Questions */}
      {conversation.questions && conversation.questions.length > 0 && (
        <div className="bg-gray-50 border-2 border-gray-200 p-4">
          <h4 className="font-bold text-gray-800 mb-2">Additional Questions:</h4>
          <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
            {conversation.questions.map((question, idx) => (
              <li key={idx}>{question}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 