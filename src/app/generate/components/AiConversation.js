'use client';

import { useState, useEffect } from 'react';
import { generateConversationalResponse, generatePreviewWithGeography } from '@/lib/ai/aiProcessor';

export default function AiConversation({ prompt, onApplySettings, onClearPrompt, onMapOperation }) {
  const [conversation, setConversation] = useState(null);
  const [responses, setResponses] = useState({});
  const [geoPreview, setGeoPreview] = useState(null);

  useEffect(() => {
    if (prompt.trim().length > 0) {
      const response = generateConversationalResponse(prompt);
      setConversation(response);
      setResponses({});
      
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
        finalSettings.generationArea = responses.area === 'upload' ? 'uploaded' : responses.area;
      }

      onApplySettings(finalSettings);
    }
  };

  if (!conversation) return null;

  const preview = conversation.preview;
  const confidencePercent = Math.round((conversation.confidence || 0.8) * 100);

  return (
    <div className="space-y-4">
      {preview && (
        <div className="border border-green-200 bg-green-50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h4 className="text-sm font-semibold text-green-900">
                Suggested configuration
              </h4>
              <p className="mt-1 text-sm text-green-700">
                Review these inferred settings before applying them to the controls.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-sm border border-green-200 bg-white px-2 py-1 text-green-700">
                {confidencePercent}% match
              </span>
              {geoPreview?.hasLocationContext && (
                <span className="rounded-sm border border-blue-200 bg-blue-50 px-2 py-1 text-blue-700">
                  Location detected
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-white p-3 border border-green-200">
              <div className="text-xs text-green-600">Geometry</div>
              <div className="font-semibold text-green-900 capitalize">
                {preview.geometryType}
              </div>
            </div>

            <div className="bg-white p-3 border border-green-200">
              <div className="text-xs text-green-600">Quantity</div>
              <div className="font-semibold text-green-900">
                {responses.quantity || preview.quantity}
              </div>
            </div>

            {preview.domain && (
              <div className="bg-white p-3 border border-green-200">
                <div className="text-xs text-green-600">Match</div>
                <div className="font-semibold text-green-900 capitalize">
                  {preview.domain}
                </div>
              </div>
            )}

            <div className="bg-white p-3 border border-green-200">
              <div className="text-xs text-green-600">Attributes</div>
              <div className="font-semibold text-green-900">
                {preview.attributes?.length || 0}
              </div>
            </div>
          </div>

          {preview.attributes && preview.attributes.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-green-900 mb-2">Suggested attributes</p>
              <div className="flex flex-wrap gap-2">
                {preview.attributes.slice(0, 6).map((attr, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-white border border-green-200 text-xs text-green-700 rounded-sm"
                  >
                    {attr.name} ({attr.type})
                  </span>
                ))}
                {preview.attributes.length > 6 && (
                  <span className="px-2 py-1 bg-green-100 text-xs text-green-600 rounded-sm">
                    +{preview.attributes.length - 6} more
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
                <span className="text-sm font-medium text-blue-800">Location context</span>
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
                    className="text-xs px-2 py-1 bg-blue-600 text-white border border-blue-700 hover:bg-blue-500 transition-colors rounded-sm"
                  >
                    Show Preview on Map
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleConfirmGeneration}
              className="flex-1 px-4 py-3 bg-green-600 text-white font-medium border border-green-700 hover:bg-green-500 transition-colors rounded-sm"
            >
              Apply to controls
            </button>
            {prompt.trim().length > 0 && (
              <button
                type="button"
                onClick={() => onClearPrompt('')}
                className="px-4 py-3 bg-white text-green-700 font-medium border border-green-300 hover:bg-green-50 transition-colors rounded-sm"
              >
                Clear prompt
              </button>
            )}
          </div>
        </div>
      )}

      {conversation.type === 'clarification' && conversation.clarifications?.length > 0 && (
        <div className="space-y-3">
          {conversation.clarifications.map((clarification, idx) => (
            <div key={idx} className="bg-white border border-indigo-200 p-4">
              <h4 className="text-sm font-semibold text-indigo-900 mb-3">
                {clarification.type === 'quantity'
                  ? 'Questions to refine setup'
                  : clarification.type === 'area'
                  ? 'Generation area'
                  : 'Options'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {clarification.options.map((option, optIdx) => (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleClarificationResponse(clarification.type, option.value)}
                    className={`p-3 text-left border rounded-sm text-sm font-medium transition-colors ${
                      responses[clarification.type] === option.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {conversation.questions && conversation.questions.length > 0 && (
        <div className={`${conversation.type === 'need_more_info' ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'} border p-4`}>
          <h4 className={`text-sm font-semibold mb-2 ${conversation.type === 'need_more_info' ? 'text-yellow-900' : 'text-gray-900'}`}>
            {conversation.type === 'need_more_info' ? 'Questions to refine setup' : 'Additional questions'}
          </h4>
          <ul className={`list-disc list-inside space-y-1 text-sm ${conversation.type === 'need_more_info' ? 'text-yellow-800' : 'text-gray-700'}`}>
            {conversation.questions.map((question, idx) => (
              <li key={idx}>{question}</li>
            ))}
          </ul>
        </div>
      )}

      {conversation.type === 'need_more_info' && conversation.suggestions && (
        <div className="bg-white border border-yellow-200 p-4">
          <h4 className="text-sm font-semibold text-yellow-900 mb-2">Example prompts</h4>
          <div className="space-y-1">
            {conversation.suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onClearPrompt(suggestion.replace('Try: ', '').replace(/['"]/g, ''))}
                className="block text-left text-sm text-yellow-700 hover:text-yellow-900 hover:underline"
              >
                {suggestion.replace('Try: ', '')}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 
