'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import * as turf from '@turf/turf';
import GenerateMap from './components/GenerateMap';
import FeatureAttributeEditor from './components/FeatureAttributeEditor';
import GeoJSONUploader from './components/GeoJSONUploader';
import AiConversation from './components/AiConversation';
import { exportAsGeoJSON, exportAsShapefile, exportAsGeoPackage } from './utils/exporters';
import { parsePrompt, generateSmartDefaults, validatePrompt, getExamplePrompts } from './utils/aiProcessor';
import Layout from '../components/Layout';

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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Controls */}
          <div className="md:w-1/3 space-y-8">
            <div className="bg-white border-4 border-indigo-600 p-4">
              <h2 className="text-2xl font-black uppercase text-indigo-900 mb-4">
                Generate Features
              </h2>
              
              {/* AI Dataset Generation */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-black uppercase text-indigo-800">
                    AI Dataset Generation
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAiSuggestions(!showAiSuggestions)}
                    className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 border border-indigo-300 hover:bg-indigo-200"
                  >
                    {showAiSuggestions ? 'Hide' : 'Show'} Examples
                  </button>
                </div>
                
                <div className="space-y-2">
                  <div className="relative">
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="Describe the dataset you want to generate (e.g., 'Create 50 coffee shops with ratings and wifi info')"
                      className={`w-full p-3 border-2 focus:outline-none min-h-[100px] ${
                        aiValidation?.isValid === false 
                          ? 'border-red-300 focus:border-red-500'
                          : aiValidation?.warning
                          ? 'border-yellow-300 focus:border-yellow-500'
                          : aiValidation?.confidence > 0.7
                          ? 'border-green-300 focus:border-green-500'
                          : 'border-indigo-300 focus:border-indigo-500'
                      }`}
                    />
                    
                    {/* AI Status Indicator */}
                    {aiParsedResult && (
                      <div className="absolute top-2 right-2">
                        <div className={`w-3 h-3 rounded-full ${
                          aiParsedResult.confidence > 0.7 ? 'bg-green-500' :
                          aiParsedResult.confidence > 0.4 ? 'bg-yellow-500' : 'bg-gray-400'
                        }`} title={`AI Confidence: ${Math.round(aiParsedResult.confidence * 100)}%`} />
                      </div>
                    )}
                  </div>
                  
                  {/* AI Validation Message */}
                  {aiValidation && (
                    <div className={`p-2 text-xs border-l-4 ${
                      aiValidation.isValid === false 
                        ? 'bg-red-50 border-red-500 text-red-700'
                        : aiValidation.warning
                        ? 'bg-yellow-50 border-yellow-500 text-yellow-700'
                        : 'bg-green-50 border-green-500 text-green-700'
                    }`}>
                      {aiValidation.message}
                    </div>
                  )}
                  
                  {/* Simple Apply AI Suggestions Button (fallback) */}
                  {aiParsedResult && aiParsedResult.confidence > 0.8 && (
                    <button
                      type="button"
                      onClick={handleApplyAiSuggestions}
                      className="w-full px-4 py-2 bg-green-600 text-white font-bold text-sm uppercase border-2 border-green-700 hover:bg-green-500 transform hover:translate-y-[-1px] transition-transform"
                    >
                      Quick Apply ({aiParsedResult.domain})
                    </button>
                  )}
                  
                  <p className="text-xs text-indigo-500">
                    💡 Try: "50 restaurants with ratings", "hiking trails with difficulty levels", or "parks with facilities"
                  </p>
                </div>
                
                {/* AI Conversation */}
                <AiConversation 
                  prompt={aiPrompt}
                  onApplySettings={handleApplyAiSettings}
                  onClearPrompt={handleReplacePrompt}
                  onMapOperation={handleMapOperation}
                />
                
                {/* Example Prompts */}
                {showAiSuggestions && (
                  <div className="mt-3 p-3 bg-indigo-50 border border-indigo-200">
                    <h4 className="font-bold text-indigo-800 text-sm mb-2">Example Prompts:</h4>
                    <div className="space-y-1">
                      {Object.entries(getExamplePrompts()).map(([category, examples]) => (
                        <div key={category} className="text-xs">
                          <strong className="text-indigo-700 capitalize">{category}:</strong>
                          {examples.map((example, idx) => (
                            <button
                              key={idx}
                              onClick={() => setAiPrompt(example)}
                              className="block text-indigo-600 hover:text-indigo-800 hover:underline ml-2"
                            >
                              "{example}"
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Geometry Type */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-black uppercase text-indigo-800">
                    Geometry Type
                  </h3>
                  {aiParsedResult && aiParsedResult.geometryType === geometryType && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 border border-green-300">
                      AI
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleGeometryTypeChange('point')}
                    className={`px-4 py-3 font-bold text-center text-sm border-2 ${
                      geometryType === 'point'
                        ? 'bg-indigo-600 text-white border-indigo-700'
                        : 'bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-50'
                    }`}
                  >
                    Points
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGeometryTypeChange('line')}
                    className={`px-4 py-3 font-bold text-center text-sm border-2 ${
                      geometryType === 'line'
                        ? 'bg-indigo-600 text-white border-indigo-700'
                        : 'bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-50'
                    }`}
                  >
                    Lines
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGeometryTypeChange('polygon')}
                    className={`px-4 py-3 font-bold text-center text-sm border-2 ${
                      geometryType === 'polygon'
                        ? 'bg-indigo-600 text-white border-indigo-700'
                        : 'bg-white text-indigo-700 border-indigo-300 hover:bg-indigo-50'
                    }`}
                  >
                    Polygons
                  </button>
                </div>
              </div>
              
              {/* Quantity */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-black uppercase text-indigo-800">
                    Quantity
                  </h3>
                  {aiParsedResult && aiParsedResult.quantity === quantity && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 border border-green-300">
                      AI
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
                    className="w-full p-3 border-2 border-indigo-300 focus:border-indigo-500 focus:outline-none"
                    placeholder="Enter number of features to generate"
                  />
                </div>
                <p className="text-xs text-indigo-500 mt-1">Enter a value between 1 and 50,000</p>
              </div>
              
              {/* Line Length Controls - Only show when geometry type is line */}
              {geometryType === 'line' && (
                <div className="mb-6">
                  <h3 className="text-lg font-black uppercase text-indigo-800 mb-2">
                    Line Length (meters)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-indigo-600 mb-1">Minimum</label>
                      <input
                        type="number"
                        min="1"
                        max={lineLength.max}
                        value={lineLength.min}
                        onChange={(e) => setLineLength(prev => ({
                          ...prev,
                          min: Math.min(parseInt(e.target.value) || 1, prev.max)
                        }))}
                        className="w-full p-2 border-2 border-indigo-300 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-indigo-600 mb-1">Maximum</label>
                      <input
                        type="number"
                        min={lineLength.min}
                        value={lineLength.max}
                        onChange={(e) => setLineLength(prev => ({
                          ...prev,
                          max: Math.max(parseInt(e.target.value) || prev.min, prev.min)
                        }))}
                        className="w-full p-2 border-2 border-indigo-300 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Polygon Area Controls - Only show when geometry type is polygon */}
              {geometryType === 'polygon' && (
                <div className="mb-6">
                  <h3 className="text-lg font-black uppercase text-indigo-800 mb-2">
                    Polygon Area (square meters)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-indigo-600 mb-1">Minimum</label>
                      <input
                        type="number"
                        min="1"
                        max={polygonArea.max}
                        value={polygonArea.min}
                        onChange={(e) => setPolygonArea(prev => ({
                          ...prev,
                          min: Math.min(parseInt(e.target.value) || 1, prev.max)
                        }))}
                        className="w-full p-2 border-2 border-indigo-300 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-indigo-600 mb-1">Maximum</label>
                      <input
                        type="number"
                        min={polygonArea.min}
                        value={polygonArea.max}
                        onChange={(e) => setPolygonArea(prev => ({
                          ...prev,
                          max: Math.max(parseInt(e.target.value) || prev.min, prev.min)
                        }))}
                        className="w-full p-2 border-2 border-indigo-300 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Generation Area */}
              <div className="mb-6">
                <h3 className="text-lg font-black uppercase text-indigo-800 mb-2">
                  Generation Area
                </h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="generation-area"
                      value="viewport"
                      checked={generationArea === 'viewport'}
                      onChange={() => setGenerationArea('viewport')}
                      className="form-radio text-indigo-600"
                    />
                    <span className="text-indigo-800">Current Map Viewport</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="generation-area"
                      value="draw"
                      checked={generationArea === 'draw'}
                      onChange={() => setGenerationArea('draw')}
                      className="form-radio text-indigo-600"
                    />
                    <span className="text-indigo-800">Draw on Map</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="generation-area"
                      value="uploaded"
                      checked={generationArea === 'uploaded'}
                      onChange={() => setGenerationArea('uploaded')}
                      className="form-radio text-indigo-600"
                    />
                    <span className="text-indigo-800">Upload GeoJSON</span>
                  </label>
                  
                  {generationArea === 'uploaded' && (
                    <div className="mt-4 pl-6">
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
              
              {/* Generate Button */}
              <button
                type="button"
                onClick={handleGenerate}
                className="w-full mt-6 px-6 py-3 bg-indigo-600 text-white font-black text-lg uppercase border-2 border-indigo-700 hover:bg-indigo-500 transform hover:translate-y-[-2px] transition-transform"
              >
                Generate Features
              </button>
            </div>
            
            {/* Export Options - Only show when features are generated */}
            {generatedFeatures && generatedFeatures.length > 0 && (
              <div className="bg-white border-4 border-green-600 p-4">
                <h2 className="text-2xl font-black uppercase text-green-800 mb-4">
                  Export Features
                </h2>
                
                <div className="mb-4">
                  <label className="block text-green-800 font-bold mb-2" htmlFor="filename">
                    File Name
                  </label>
                  <input
                    type="text"
                    id="filename"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full p-2 border-2 border-green-300 focus:border-green-500 focus:outline-none"
                    placeholder="Enter file name"
                  />
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-green-800 mb-2">
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
                    className="w-full px-6 py-3 bg-green-600 text-white font-black text-lg uppercase border-2 border-green-700 hover:bg-green-500 transform hover:translate-y-[-2px] transition-transform"
                  >
                    Download
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleClearFeatures}
                    className="w-full px-6 py-2 bg-red-600 text-white font-bold text-sm uppercase border-2 border-red-700 hover:bg-red-500 transform hover:translate-y-[-1px] transition-transform"
                  >
                    Clear Features
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Map */}
          <div className="md:w-2/3 h-[70vh]">
            <GenerateMap
              ref={generateMapRef}
              generationArea={generationArea}
              onDrawingComplete={handleDrawingComplete}
              uploadedGeoJSON={uploadedGeoJSON}
            />
            
            {/* Statistics Panel */}
            {generatedFeatures && (
              <div className="mt-4 p-4 bg-white border-4 border-indigo-300">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold text-indigo-800">
                    Feature Statistics
                  </h3>
                  <button
                    type="button"
                    onClick={handleClearFeatures}
                    className="px-4 py-2 bg-red-600 text-white font-bold text-sm uppercase border-2 border-red-700 hover:bg-red-500 transform hover:translate-y-[-1px] transition-transform"
                    title="Clear all generated features"
                  >
                    Clear Features
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-indigo-50 p-3 border-2 border-indigo-200">
                    <div className="text-sm text-indigo-600">Features</div>
                    <div className="text-xl font-bold text-indigo-800">
                      {generatedFeatures.length}
                    </div>
                  </div>
                  
                  <div className="bg-indigo-50 p-3 border-2 border-indigo-200">
                    <div className="text-sm text-indigo-600">Type</div>
                    <div className="text-xl font-bold text-indigo-800 capitalize">
                      {geometryType}s
                    </div>
                  </div>
                  
                  {generationArea === 'draw' && drawnArea && (
                    <div className="bg-indigo-50 p-3 border-2 border-indigo-200">
                      <div className="text-sm text-indigo-600">Area</div>
                      <div className="text-xl font-bold text-indigo-800">
                        {(turf.area(drawnArea) / 1000000).toFixed(2)} km²
                      </div>
                    </div>
                  )}
                  
                  {customAttributes.length > 0 && (
                    <div className="bg-indigo-50 p-3 border-2 border-indigo-200">
                      <div className="text-sm text-indigo-600">Attributes</div>
                      <div className="text-xl font-bold text-indigo-800">
                        {customAttributes.length}
                      </div>
                    </div>
                  )}
                  
                  {aiParsedResult && aiParsedResult.domain && (
                    <div className="bg-green-50 p-3 border-2 border-green-200">
                      <div className="text-sm text-green-600">AI Generated</div>
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