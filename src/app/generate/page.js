'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import * as turf from '@turf/turf';
import GenerateMap from './components/GenerateMap';
import FeatureAttributeEditor from './components/FeatureAttributeEditor';
import GeoJSONUploader from './components/GeoJSONUploader';
import AiConversation from './components/AiConversation';
import { exportAsGeoJSON, exportAsShapefile, exportAsGeoPackage } from '@/lib/geo/exporters';
import { parsePrompt, generateSmartDefaults, validatePrompt, getExamplePrompts } from '@/lib/ai/aiProcessor';
import Layout from '@/components/layout/Layout';

export default function GeneratePage() {
  // Map and geometry state
  const [geometryType, setGeometryType] = useState('point');
  const [quantity, setQuantity] = useState(50);
  const [generationArea, setGenerationArea] = useState('viewport');
  const [customAttributes, setCustomAttributes] = useState([]);
  const [exportFormat, setExportFormat] = useState('geojson');
  const [fileName, setFileName] = useState('generated_features');
  const [generatedFeatures, setGeneratedFeatures] = useState(null);
  const [drawnArea, setDrawnArea] = useState(null);
  const [uploadedGeoJSON, setUploadedGeoJSON] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiParsedResult, setAiParsedResult] = useState(null);
  const [aiValidation, setAiValidation] = useState(null);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [isPromptPanelOpen, setIsPromptPanelOpen] = useState(false);
  const [lineLength, setLineLength] = useState({ min: 100, max: 1000 }); // in meters
  const [polygonArea, setPolygonArea] = useState({ min: 1000, max: 10000 }); // in square meters
  const generateMapRef = useRef(null);
  
  // AI prompt processing effect
  useEffect(() => {
    if (aiPrompt.trim().length === 0) {
      setAiParsedResult(null);
      setAiValidation(null);
      return;
    }
    
    // Debounce the parsing to avoid excessive processing
    const timeoutId = setTimeout(() => {
      const parsed = parsePrompt(aiPrompt);
      const validation = validatePrompt(aiPrompt);
      
      setAiParsedResult(parsed);
      setAiValidation(validation);
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [aiPrompt]);
  
  // Handle geometry type change
  const handleGeometryTypeChange = (type) => {
    setGeometryType(type);
    // Reset custom attributes when geometry type changes
    setCustomAttributes([]);
  };
  
  // Handle drawing completion
  const handleDrawingComplete = (polygon) => {
    setDrawnArea(polygon);
    // Only set to 'draw' if we actually have a polygon (not when clearing)
    if (polygon) {
      setGenerationArea('draw');
    }
  };
  
  // Handle GeoJSON upload completion
  const handleGeoJSONUploaded = (geojson) => {
    setUploadedGeoJSON(geojson);
    setGenerationArea('uploaded');
    // Also set the drawn area for generation
    setDrawnArea(geojson);
  };
  
  // Generate features
  const handleGenerate = useCallback(() => {
    if (!generateMapRef.current) {
      alert('Map not ready. Please wait a moment and try again.');
      return;
    }

    try {
      console.log('Starting feature generation...');
      const features = generateMapRef.current.generateFeatures({
        geometryType,
        quantity: Math.min(quantity, 50000), // Limit to 50k features
        customAttributes,
        lineLength,
        polygonArea,
        generationArea,
        drawnArea,
        aiPrompt: aiPrompt.trim() // Include AI prompt if provided
      });
      
      if (features && features.length > 0) {
        setGeneratedFeatures(features);
        console.log(`Successfully generated ${features.length} features`);
      } else {
        alert('No features were generated. Please check your settings and try again.');
      }
    } catch (error) {
      console.error('Error during feature generation:', error);
      alert('An error occurred during generation. Please check the console for details.');
    }
  }, [geometryType, quantity, customAttributes, lineLength, polygonArea, generationArea, drawnArea, aiPrompt]);
  
  // Download features in the selected format
  const handleDownload = async () => {
    if (!generatedFeatures || generatedFeatures.length === 0) {
      alert('No features to export. Please generate features first.');
      return;
    }
    
    const exportFileName = fileName || 'generated_features';
    
    try {
      switch (exportFormat) {
        case 'geojson':
          exportAsGeoJSON(generatedFeatures, exportFileName);
          break;
        case 'shapefile':
          await exportAsShapefile(generatedFeatures, exportFileName);
          break;
        case 'geopackage':
          await exportAsGeoPackage(generatedFeatures, exportFileName);
          break;
        default:
          exportAsGeoJSON(generatedFeatures, exportFileName);
      }
      console.log(`Successfully exported ${generatedFeatures.length} features as ${exportFormat}`);
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error.message}`);
    }
  };
  
  // Clear generated features
  const handleClearFeatures = () => {
    setGeneratedFeatures(null);
    // Also clear features from the map
    if (generateMapRef.current && generateMapRef.current.clearFeatures) {
      generateMapRef.current.clearFeatures();
    }
  };

  // Apply AI suggestions from conversational flow
  const handleApplyAiSettings = (settings) => {
    // Apply the AI-suggested values
    if (settings.geometryType) setGeometryType(settings.geometryType);
    if (settings.quantity) setQuantity(settings.quantity);
    if (settings.customAttributes) setCustomAttributes(settings.customAttributes);
    if (settings.generationArea) setGenerationArea(settings.generationArea);
    
    // Apply geometry-specific parameters
    if (settings.lineLength) {
      setLineLength(settings.lineLength);
    }
    if (settings.polygonArea) {
      setPolygonArea(settings.polygonArea);
    }
    
    console.log('Applied AI conversation settings:', settings);
  };

  // Handle prompt replacement from AI suggestions
  const handleReplacePrompt = (newPrompt) => {
    setAiPrompt(newPrompt);
  };

  // Legacy apply AI suggestions (for the simple button)
  const handleApplyAiSuggestions = () => {
    if (!aiParsedResult) return;
    
    const smartDefaults = generateSmartDefaults(aiPrompt);
    
    // Apply the suggested values
    setGeometryType(smartDefaults.geometryType);
    setQuantity(smartDefaults.quantity);
    setCustomAttributes(smartDefaults.customAttributes);
    
    // Apply geometry-specific parameters
    if (smartDefaults.lineLength) {
      setLineLength(smartDefaults.lineLength);
    }
    if (smartDefaults.polygonArea) {
      setPolygonArea(smartDefaults.polygonArea);
    }
    
    console.log('Applied AI suggestions:', smartDefaults);
  };

  // Handle attribute changes
  const handleAttributesChange = (newAttributes) => {
    setCustomAttributes(newAttributes);
  };

  // Handle map operations from AI conversation
  const handleMapOperation = (operation) => {
    if (!generateMapRef.current) return;
    
    switch (operation.type) {
      case 'setLocation':
        // Set map center and zoom
        if (generateMapRef.current.setMapView) {
          generateMapRef.current.setMapView({
            center: operation.centerPoint,
            zoom: operation.zoomLevel,
            bounds: operation.bounds
          });
        }
        console.log('Set map location:', operation.locationMessage);
        break;
        
      case 'showPreview':
        // Show preview features on map
        if (generateMapRef.current.showPreviewFeatures && operation.geoJSON) {
          generateMapRef.current.showPreviewFeatures(operation.geoJSON);
          
          // Also set map bounds to show all preview features
          if (operation.bounds && generateMapRef.current.setMapView) {
            generateMapRef.current.setMapView({
              bounds: operation.bounds,
              padding: 50
            });
          }
        }
        console.log('Showing preview features on map');
        break;
        
      default:
        console.warn('Unknown map operation:', operation.type);
    }
  };

  const hasPrompt = aiPrompt.trim().length > 0;
  const promptMatchPercent = aiParsedResult ? Math.round(aiParsedResult.confidence * 100) : null;
  const generationAreaSummary =
    generationArea === 'draw'
      ? 'drawn boundary'
      : generationArea === 'uploaded'
      ? 'uploaded GeoJSON boundary'
      : 'current map view';
  const geometryLabel =
    geometryType === 'polygon'
      ? 'polygon features'
      : geometryType === 'line'
      ? 'line features'
      : 'point features';
  const generationAreaOptions = [
    {
      value: 'viewport',
      label: 'Current map viewport',
      description: 'Use whatever is visible on the map when you generate.',
      helper: 'Pan or zoom the map to change the extent.',
      badge: 'Fastest'
    },
    {
      value: 'draw',
      label: 'Draw on map',
      description: 'Sketch a custom boundary directly on the map.',
      helper: drawnArea ? 'Boundary ready. Redraw anytime.' : 'Best when you need a custom footprint.',
      badge: drawnArea ? 'Boundary ready' : 'Most control'
    },
    {
      value: 'uploaded',
      label: 'Upload GeoJSON boundary',
      description: 'Use an existing GeoJSON polygon or feature collection.',
      helper: uploadedGeoJSON ? 'Boundary loaded and ready to use.' : 'Useful when you already have a study area.',
      badge: uploadedGeoJSON ? 'Boundary loaded' : 'Reusable'
    }
  ];
  const activeAreaOption = generationAreaOptions.find((option) => option.value === generationArea);
  const mapEmptyState =
    generationArea === 'viewport'
      ? {
          eyebrow: 'Map extent',
          title: 'The visible map area will be used for generation.',
          detail: 'Pan or zoom to refine coverage, or switch to draw or upload for tighter control.'
        }
      : generationArea === 'draw'
      ? {
          eyebrow: drawnArea ? 'Custom boundary ready' : 'Draw a boundary',
          title: drawnArea
            ? 'Generated features will stay inside the drawn shape.'
            : 'Sketch a polygon on the map to define the generation boundary.',
          detail: drawnArea
            ? 'You can redraw the boundary at any time before generating.'
            : 'Use viewport mode for quick tests or upload a GeoJSON boundary if you already have one.'
        }
      : {
          eyebrow: uploadedGeoJSON ? 'Boundary loaded' : 'Upload a boundary',
          title: uploadedGeoJSON
            ? 'Generated features will use the uploaded GeoJSON extent.'
            : 'Upload a GeoJSON boundary to constrain the generation area.',
          detail: uploadedGeoJSON
            ? 'Pan and zoom are still useful for reviewing the selected area before generating.'
            : 'This works well when you already have a study area or demo boundary prepared.'
        };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column - Controls */}
          <div className="md:w-1/3 space-y-6">
            <div className="bg-white border border-slate-200 p-5 shadow-sm">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-500">
                  Generate Features
                </p>
                <h2 className="mt-2 text-2xl font-black text-indigo-950">
                  Build a synthetic feature set
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Configure geometry, quantity, area, and attributes first. Prompt-assisted setup is available as an optional helper.
                </p>
              </div>

              <div className="mb-5 rounded-sm border border-slate-200 bg-slate-50/60 p-4">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Dataset setup
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Choose the feature shape and the volume you want to generate.
                  </p>
                </div>

                <div className="space-y-5">
                  {/* Geometry Type */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-base font-bold text-indigo-900">
                        Geometry type
                      </h4>
                      {aiParsedResult && aiParsedResult.geometryType === geometryType && (
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-1 border border-green-200 rounded-sm">
                          Suggested from prompt
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleGeometryTypeChange('point')}
                        className={`px-4 py-3 font-semibold text-center text-sm border rounded-sm transition-colors ${
                          geometryType === 'point'
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                        }`}
                      >
                        Points
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGeometryTypeChange('line')}
                        className={`px-4 py-3 font-semibold text-center text-sm border rounded-sm transition-colors ${
                          geometryType === 'line'
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                        }`}
                      >
                        Lines
                      </button>
                      <button
                        type="button"
                        onClick={() => handleGeometryTypeChange('polygon')}
                        className={`px-4 py-3 font-semibold text-center text-sm border rounded-sm transition-colors ${
                          geometryType === 'polygon'
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                        }`}
                      >
                        Polygons
                      </button>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-base font-bold text-indigo-900">
                        Quantity
                      </h4>
                      {aiParsedResult && aiParsedResult.quantity === quantity && (
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-1 border border-green-200 rounded-sm">
                          Suggested from prompt
                        </span>
                      )}
                    </div>
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="1"
                        max="50000"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, 50000))}
                        className="w-full p-3 border border-indigo-200 rounded-sm focus:border-indigo-500 focus:outline-none"
                        placeholder="Enter number of features to generate"
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Enter a value between 1 and 50,000.</p>
                  </div>
                  
                  {/* Line Length Controls - Only show when geometry type is line */}
                  {geometryType === 'line' && (
                    <div>
                      <h4 className="text-base font-bold text-indigo-900 mb-2">
                        Line Length (meters)
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-slate-600 mb-1">Minimum</label>
                          <input
                            type="number"
                            min="1"
                            max={lineLength.max}
                            value={lineLength.min}
                            onChange={(e) => setLineLength(prev => ({
                              ...prev,
                              min: Math.min(parseInt(e.target.value) || 1, prev.max)
                            }))}
                            className="w-full p-2 border border-indigo-200 rounded-sm focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-600 mb-1">Maximum</label>
                          <input
                            type="number"
                            min={lineLength.min}
                            value={lineLength.max}
                            onChange={(e) => setLineLength(prev => ({
                              ...prev,
                              max: Math.max(parseInt(e.target.value) || prev.min, prev.min)
                            }))}
                            className="w-full p-2 border border-indigo-200 rounded-sm focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Polygon Area Controls - Only show when geometry type is polygon */}
                  {geometryType === 'polygon' && (
                    <div>
                      <h4 className="text-base font-bold text-indigo-900 mb-2">
                        Polygon Area (square meters)
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-slate-600 mb-1">Minimum</label>
                          <input
                            type="number"
                            min="1"
                            max={polygonArea.max}
                            value={polygonArea.min}
                            onChange={(e) => setPolygonArea(prev => ({
                              ...prev,
                              min: Math.min(parseInt(e.target.value) || 1, prev.max)
                            }))}
                            className="w-full p-2 border border-indigo-200 rounded-sm focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-slate-600 mb-1">Maximum</label>
                          <input
                            type="number"
                            min={polygonArea.min}
                            value={polygonArea.max}
                            onChange={(e) => setPolygonArea(prev => ({
                              ...prev,
                              max: Math.max(parseInt(e.target.value) || prev.min, prev.min)
                            }))}
                            className="w-full p-2 border border-indigo-200 rounded-sm focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Generation Area */}
              <div className="mb-5 rounded-sm border border-slate-200 bg-slate-50/60 p-4">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Generation area
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Choose how the map should define the feature boundary.
                  </p>
                </div>
                <div className="space-y-3">
                  {generationAreaOptions.map((option, index) => {
                    const isSelected = generationArea === option.value;

                    return (
                      <label
                        key={option.value}
                        className={`block cursor-pointer rounded-sm border p-3 transition-colors ${
                          isSelected
                            ? 'border-indigo-300 bg-white shadow-sm'
                            : 'border-slate-200 bg-white/80 hover:border-indigo-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="generation-area"
                          value={option.value}
                          checked={isSelected}
                          onChange={() => setGenerationArea(option.value)}
                          className="sr-only"
                        />
                        <div className="flex items-start gap-3">
                          <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-slate-900">
                                {option.label}
                              </span>
                              <span className={`rounded-sm px-2 py-1 text-[11px] font-medium ${
                                isSelected
                                  ? 'bg-indigo-50 text-indigo-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {option.badge}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-slate-600">
                              {option.description}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {option.helper}
                            </p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                  
                  {generationArea === 'uploaded' && (
                    <div className="pt-1">
                      <GeoJSONUploader 
                        onGeoJSONLoaded={handleGeoJSONUploaded} 
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Feature Attributes */}
              <FeatureAttributeEditor
                geometryType={geometryType}
                attributes={customAttributes}
                onAttributesChange={handleAttributesChange}
              />

              {/* Prompt-Assisted Setup */}
              <div className="mt-6 border border-slate-200 bg-slate-50/80">
                <button
                  type="button"
                  onClick={() => setIsPromptPanelOpen(!isPromptPanelOpen)}
                  className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left"
                >
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      Prompt-assisted setup
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Optional helper that suggests a configuration and attributes from a text description.
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {hasPrompt && promptMatchPercent !== null && (
                      <span className="rounded-sm border border-indigo-200 bg-white px-2 py-1 text-xs font-medium text-indigo-700">
                        {promptMatchPercent}% match
                      </span>
                    )}
                    <span className="text-xs font-medium text-indigo-600">
                      {isPromptPanelOpen ? 'Hide' : 'Show'}
                    </span>
                  </div>
                </button>

                {isPromptPanelOpen && (
                  <div className="border-t border-indigo-200 px-4 py-4 space-y-4">
                    <div className="space-y-2">
                      <div className="relative">
                        <textarea
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder="Example: 50 coffee shops with ratings and wifi info"
                          className={`w-full p-3 pr-10 border rounded-sm focus:outline-none min-h-[92px] text-sm leading-6 ${
                            aiValidation?.isValid === false 
                              ? 'border-red-300 focus:border-red-500'
                              : aiValidation?.warning
                              ? 'border-yellow-300 focus:border-yellow-500'
                              : aiValidation?.confidence > 0.7
                              ? 'border-green-300 focus:border-green-500'
                              : 'border-indigo-200 focus:border-indigo-500'
                          }`}
                        />

                        {aiParsedResult && (
                          <div className="absolute top-3 right-3">
                            <div className={`w-2.5 h-2.5 rounded-full ${
                              aiParsedResult.confidence > 0.7 ? 'bg-green-500' :
                              aiParsedResult.confidence > 0.4 ? 'bg-yellow-500' : 'bg-gray-400'
                            }`} title={`Prompt match: ${promptMatchPercent}%`} />
                          </div>
                        )}
                      </div>

                      {aiValidation && (
                        <div className={`rounded-sm border px-3 py-2 text-xs ${
                          aiValidation.isValid === false 
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : aiValidation.warning
                            ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                            : 'bg-green-50 border-green-200 text-green-700'
                        }`}>
                          {aiValidation.message}
                        </div>
                      )}

                      {aiParsedResult && (
                        <div className="flex flex-wrap gap-2 text-xs">
                          {aiParsedResult.domain && (
                            <span className="rounded-sm bg-white border border-indigo-200 px-2 py-1 text-indigo-700 capitalize">
                              {aiParsedResult.domain}
                            </span>
                          )}
                          <span className="rounded-sm bg-white border border-indigo-200 px-2 py-1 text-indigo-700 capitalize">
                            {aiParsedResult.geometryType}
                          </span>
                          <span className="rounded-sm bg-white border border-indigo-200 px-2 py-1 text-indigo-700">
                            {aiParsedResult.quantity} features
                          </span>
                          {aiParsedResult.attributes?.length > 0 && (
                            <span className="rounded-sm bg-white border border-indigo-200 px-2 py-1 text-indigo-700">
                              {aiParsedResult.attributes.length} suggested attributes
                            </span>
                          )}
                        </div>
                      )}

                      {aiParsedResult && aiParsedResult.confidence > 0.8 && (
                        <button
                          type="button"
                          onClick={handleApplyAiSuggestions}
                          className="inline-flex items-center rounded-sm border border-green-300 bg-green-50 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100"
                        >
                          Apply suggested configuration
                        </button>
                      )}

                      <p className="text-xs text-slate-500">
                        Uses built-in keyword matching and templates to prefill the controls above.
                      </p>
                    </div>

                    <AiConversation 
                      prompt={aiPrompt}
                      onApplySettings={handleApplyAiSettings}
                      onClearPrompt={handleReplacePrompt}
                      onMapOperation={handleMapOperation}
                    />

                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setShowAiSuggestions(!showAiSuggestions)}
                        className="text-xs font-medium text-indigo-700 hover:text-indigo-900"
                      >
                        {showAiSuggestions ? 'Hide examples' : 'Show example prompts'}
                      </button>

                      {showAiSuggestions && (
                        <div className="rounded-sm border border-indigo-200 bg-white p-3">
                          <h4 className="text-sm font-semibold text-indigo-900 mb-2">Example prompts</h4>
                          <div className="space-y-2">
                            {Object.entries(getExamplePrompts()).map(([category, examples]) => (
                              <div key={category} className="text-xs">
                                <strong className="text-indigo-700 capitalize">{category}</strong>
                                <div className="mt-1 space-y-1">
                                  {examples.map((example, idx) => (
                                    <button
                                      key={idx}
                                      type="button"
                                      onClick={() => {
                                        setAiPrompt(example);
                                        setIsPromptPanelOpen(true);
                                      }}
                                      className="block text-left text-indigo-600 hover:text-indigo-800 hover:underline"
                                    >
                                      {example}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 border border-indigo-200 bg-indigo-50 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-indigo-900">Ready to generate</h3>
                    <p className="mt-1 text-sm text-indigo-700">
                      {quantity} {geometryLabel} in the {generationAreaSummary}.
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="rounded-sm border border-indigo-200 bg-white px-2 py-1 text-xs text-indigo-700">
                      {customAttributes.length} attributes
                    </span>
                    {hasPrompt && promptMatchPercent !== null && (
                      <span className="rounded-sm border border-green-200 bg-green-50 px-2 py-1 text-xs text-green-700">
                        Prompt helper active
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="w-full mt-4 px-6 py-3 bg-indigo-600 text-white font-semibold text-base border border-indigo-700 hover:bg-indigo-500 transition-colors"
                >
                  Generate features
                </button>
              </div>
            </div>
            
            {/* Export Options - Only show when features are generated */}
            {generatedFeatures && generatedFeatures.length > 0 && (
              <div className="bg-white border-2 border-green-300 p-4 shadow-sm">
                <h2 className="text-xl font-bold text-green-900 mb-4">
                  Export Features
                </h2>
                
                <div className="mb-4">
                  <label className="block text-green-900 font-semibold mb-2" htmlFor="filename">
                    File Name
                  </label>
                  <input
                    type="text"
                    id="filename"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full p-2 border border-green-200 focus:border-green-500 focus:outline-none"
                    placeholder="Enter file name"
                  />
                </div>
                
                <div className="mb-6">
                  <h3 className="text-base font-semibold text-green-900 mb-2">
                    Format
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="export-format"
                        value="geojson"
                        checked={exportFormat === 'geojson'}
                        onChange={() => setExportFormat('geojson')}
                        className="form-radio text-green-600"
                      />
                      <span className="text-green-800">GeoJSON</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="export-format"
                        value="shapefile"
                        checked={exportFormat === 'shapefile'}
                        onChange={() => setExportFormat('shapefile')}
                        className="form-radio text-green-600"
                      />
                      <span className="text-green-800">Shapefile (ZIP) ✅</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="export-format"
                        value="geopackage"
                        checked={exportFormat === 'geopackage'}
                        onChange={() => setExportFormat('geopackage')}
                        className="form-radio text-green-600"
                        disabled
                      />
                      <span className="text-gray-500">GeoPackage (Coming Soon)</span>
                    </label>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="w-full px-6 py-3 bg-green-600 text-white font-semibold text-base border border-green-700 hover:bg-green-500 transition-colors"
                  >
                    Download
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleClearFeatures}
                    className="w-full px-6 py-2 bg-red-600 text-white font-medium text-sm border border-red-700 hover:bg-red-500 transition-colors"
                  >
                    Clear Features
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Map */}
          <div className="md:w-2/3 h-[70vh]">
            <div className="relative h-full">
              <GenerateMap
                ref={generateMapRef}
                generationArea={generationArea}
                onDrawingComplete={handleDrawingComplete}
                uploadedGeoJSON={uploadedGeoJSON}
              />

              {!generatedFeatures && (
                <div className="pointer-events-none absolute left-4 top-4 max-w-sm rounded-sm border border-white/80 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <span className="rounded-sm bg-indigo-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-700">
                      {mapEmptyState.eyebrow}
                    </span>
                    {activeAreaOption && (
                      <span className="text-[11px] font-medium text-slate-500">
                        {activeAreaOption.label}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-900">
                    {mapEmptyState.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {mapEmptyState.detail}
                  </p>
                </div>
              )}
            </div>
            
            {/* Statistics Panel */}
            {generatedFeatures && (
              <div className="mt-4 p-4 bg-white border-2 border-indigo-200 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-indigo-900">
                    Feature Statistics
                  </h3>
                  <button
                    type="button"
                    onClick={handleClearFeatures}
                    className="px-4 py-2 bg-red-600 text-white font-medium text-sm border border-red-700 hover:bg-red-500 transition-colors"
                    title="Clear all generated features"
                  >
                    Clear Features
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-indigo-50 p-3 border border-indigo-200">
                    <div className="text-sm text-indigo-600">Features</div>
                    <div className="text-xl font-bold text-indigo-800">
                      {generatedFeatures.length}
                    </div>
                  </div>
                  
                  <div className="bg-indigo-50 p-3 border border-indigo-200">
                    <div className="text-sm text-indigo-600">Type</div>
                    <div className="text-xl font-bold text-indigo-800 capitalize">
                      {geometryType}s
                    </div>
                  </div>
                  
                  {generationArea === 'draw' && drawnArea && (
                    <div className="bg-indigo-50 p-3 border border-indigo-200">
                      <div className="text-sm text-indigo-600">Area</div>
                      <div className="text-xl font-bold text-indigo-800">
                        {(turf.area(drawnArea) / 1000000).toFixed(2)} km²
                      </div>
                    </div>
                  )}
                  
                  {customAttributes.length > 0 && (
                    <div className="bg-indigo-50 p-3 border border-indigo-200">
                      <div className="text-sm text-indigo-600">Attributes</div>
                      <div className="text-xl font-bold text-indigo-800">
                        {customAttributes.length}
                      </div>
                    </div>
                  )}
                  
                  {aiParsedResult && aiParsedResult.domain && (
                    <div className="bg-green-50 p-3 border border-green-200">
                      <div className="text-sm text-green-600">Prompt Match</div>
                      <div className="text-xl font-bold text-green-800 capitalize">
                        {aiParsedResult.domain}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
