'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import * as turf from '@turf/turf';
import GenerateMap from './components/GenerateMap';
import FeatureAttributeEditor from './components/FeatureAttributeEditor';
import GeoJSONUploader from './components/GeoJSONUploader';
import AiConversation from './components/AiConversation';
import { exportAsGeoJSON, exportAsShapefile, exportAsGeoPackage } from '@/lib/geo/exporters';
import { parsePrompt, generateSmartDefaults, validatePrompt, getExamplePrompts } from '@/lib/ai/aiProcessor';
import Header from '@/components/layout/Header';

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
  const [lineLength, setLineLength] = useState({ min: 100, max: 1000 });
  const [polygonArea, setPolygonArea] = useState({ min: 1000, max: 10000 });
  const generateMapRef = useRef(null);

  // AI prompt processing effect
  useEffect(() => {
    if (aiPrompt.trim().length === 0) {
      setAiParsedResult(null);
      setAiValidation(null);
      return;
    }
    const timeoutId = setTimeout(() => {
      const parsed = parsePrompt(aiPrompt);
      const validation = validatePrompt(aiPrompt);
      setAiParsedResult(parsed);
      setAiValidation(validation);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [aiPrompt]);

  const handleGeometryTypeChange = (type) => {
    setGeometryType(type);
    setCustomAttributes([]);
  };

  const handleDrawingComplete = (polygon) => {
    setDrawnArea(polygon);
    if (polygon) setGenerationArea('draw');
  };

  const handleGeoJSONUploaded = (geojson) => {
    setUploadedGeoJSON(geojson);
    setGenerationArea('uploaded');
    setDrawnArea(geojson);
  };

  const handleGenerate = useCallback(() => {
    if (!generateMapRef.current) {
      alert('Map not ready. Please wait a moment and try again.');
      return;
    }
    try {
      const features = generateMapRef.current.generateFeatures({
        geometryType,
        quantity: Math.min(quantity, 50000),
        customAttributes,
        lineLength,
        polygonArea,
        generationArea,
        drawnArea,
        aiPrompt: aiPrompt.trim()
      });
      if (features && features.length > 0) {
        setGeneratedFeatures(features);
      } else {
        alert('No features were generated. Please check your settings and try again.');
      }
    } catch (error) {
      console.error('Error during feature generation:', error);
      alert('An error occurred during generation. Please check the console for details.');
    }
  }, [geometryType, quantity, customAttributes, lineLength, polygonArea, generationArea, drawnArea, aiPrompt]);

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
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error.message}`);
    }
  };

  const handleClearFeatures = () => {
    setGeneratedFeatures(null);
    if (generateMapRef.current && generateMapRef.current.clearFeatures) {
      generateMapRef.current.clearFeatures();
    }
  };

  const handleApplyAiSettings = (settings) => {
    if (settings.geometryType) setGeometryType(settings.geometryType);
    if (settings.quantity) setQuantity(settings.quantity);
    if (settings.customAttributes) setCustomAttributes(settings.customAttributes);
    if (settings.generationArea) setGenerationArea(settings.generationArea);
    if (settings.lineLength) setLineLength(settings.lineLength);
    if (settings.polygonArea) setPolygonArea(settings.polygonArea);
  };

  const handleReplacePrompt = (newPrompt) => {
    setAiPrompt(newPrompt);
  };

  const handleApplyAiSuggestions = () => {
    if (!aiParsedResult) return;
    const smartDefaults = generateSmartDefaults(aiPrompt);
    setGeometryType(smartDefaults.geometryType);
    setQuantity(smartDefaults.quantity);
    setCustomAttributes(smartDefaults.customAttributes);
    if (smartDefaults.lineLength) setLineLength(smartDefaults.lineLength);
    if (smartDefaults.polygonArea) setPolygonArea(smartDefaults.polygonArea);
  };

  const handleAttributesChange = (newAttributes) => {
    setCustomAttributes(newAttributes);
  };

  const handleMapOperation = (operation) => {
    if (!generateMapRef.current) return;
    switch (operation.type) {
      case 'setLocation':
        if (generateMapRef.current.setMapView) {
          generateMapRef.current.setMapView({
            center: operation.centerPoint,
            zoom: operation.zoomLevel,
            bounds: operation.bounds
          });
        }
        break;
      case 'showPreview':
        if (generateMapRef.current.showPreviewFeatures && operation.geoJSON) {
          generateMapRef.current.showPreviewFeatures(operation.geoJSON);
          if (operation.bounds && generateMapRef.current.setMapView) {
            generateMapRef.current.setMapView({ bounds: operation.bounds, padding: 50 });
          }
        }
        break;
    }
  };

  const hasPrompt = aiPrompt.trim().length > 0;
  const promptMatchPercent = aiParsedResult ? Math.round(aiParsedResult.confidence * 100) : null;
  const generationAreaSummary =
    generationArea === 'draw' ? 'drawn boundary' :
    generationArea === 'uploaded' ? 'uploaded boundary' : 'map viewport';
  const geometryLabel =
    geometryType === 'polygon' ? 'polygons' :
    geometryType === 'line' ? 'lines' : 'points';

  const generationAreaOptions = [
    {
      value: 'viewport',
      label: 'Map viewport',
      helper: 'Pan or zoom to set the extent.',
      badge: 'Default'
    },
    {
      value: 'draw',
      label: 'Draw boundary',
      helper: drawnArea ? 'Boundary ready. Redraw anytime.' : 'Sketch a custom polygon on the map.',
      badge: drawnArea ? 'Ready' : 'Custom'
    },
    {
      value: 'uploaded',
      label: 'Upload GeoJSON',
      helper: uploadedGeoJSON ? 'Boundary loaded.' : 'Use an existing polygon file.',
      badge: uploadedGeoJSON ? 'Loaded' : 'Import'
    }
  ];

  const activeAreaOption = generationAreaOptions.find((o) => o.value === generationArea);

  const mapEmptyState =
    generationArea === 'viewport'
      ? { eyebrow: 'Map viewport', title: 'The visible map area will be used.', detail: 'Pan or zoom to adjust coverage.' }
      : generationArea === 'draw'
      ? {
          eyebrow: drawnArea ? 'Boundary ready' : 'Draw mode',
          title: drawnArea ? 'Features will be generated inside the drawn shape.' : 'Sketch a polygon to define the generation boundary.',
          detail: drawnArea ? 'Redraw at any time.' : 'Use the map drawing tools.'
        }
      : {
          eyebrow: uploadedGeoJSON ? 'Boundary loaded' : 'Upload mode',
          title: uploadedGeoJSON ? 'Using the uploaded GeoJSON extent.' : 'Upload a GeoJSON boundary.',
          detail: uploadedGeoJSON ? 'Review the area before generating.' : 'Upload a polygon from the sidebar.'
        };

  return (
    <div className="flex flex-col min-h-screen md:h-screen md:overflow-hidden">
      <Header variant="dark" />

      <div className="flex flex-col md:flex-row flex-1 md:overflow-hidden">
        {/* Dark Sidebar */}
        <aside className="w-full md:w-80 xl:w-96 flex-shrink-0 bg-slate-900 flex flex-col border-b md:border-b-0 md:border-r border-slate-800">
          {/* Scrollable controls area */}
          <div className="flex-1 md:overflow-y-auto p-5 space-y-6">

            {/* Page header */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                Geomockery
              </span>
              <h2 className="mt-1 text-xl font-bold text-white">Generate dataset</h2>
              <p className="mt-1 text-sm text-slate-500">
                Synthetic geospatial features for testing and development.
              </p>
            </div>

            <div className="border-t border-slate-800" />

            {/* Geometry type */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                Geometry type
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { value: 'point', label: 'Points' },
                  { value: 'line', label: 'Lines' },
                  { value: 'polygon', label: 'Polygons' },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleGeometryTypeChange(value)}
                    className={`py-2.5 text-sm font-semibold transition-colors border ${
                      geometryType === value
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                max="50000"
                value={quantity}
                onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, 50000))}
                className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-600">1 – 50,000 features</p>
            </div>

            {/* Line length — conditional */}
            {geometryType === 'line' && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                  Line length (m)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-xs text-slate-600 mb-1 block">Min</span>
                    <input
                      type="number" min="1" max={lineLength.max} value={lineLength.min}
                      onChange={(e) => setLineLength(prev => ({ ...prev, min: Math.min(parseInt(e.target.value) || 1, prev.max) }))}
                      className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-slate-600 mb-1 block">Max</span>
                    <input
                      type="number" min={lineLength.min} value={lineLength.max}
                      onChange={(e) => setLineLength(prev => ({ ...prev, max: Math.max(parseInt(e.target.value) || prev.min, prev.min) }))}
                      className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Polygon area — conditional */}
            {geometryType === 'polygon' && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                  Polygon area (m²)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-xs text-slate-600 mb-1 block">Min</span>
                    <input
                      type="number" min="1" max={polygonArea.max} value={polygonArea.min}
                      onChange={(e) => setPolygonArea(prev => ({ ...prev, min: Math.min(parseInt(e.target.value) || 1, prev.max) }))}
                      className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-slate-600 mb-1 block">Max</span>
                    <input
                      type="number" min={polygonArea.min} value={polygonArea.max}
                      onChange={(e) => setPolygonArea(prev => ({ ...prev, max: Math.max(parseInt(e.target.value) || prev.min, prev.min) }))}
                      className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-slate-800" />

            {/* Generation area */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                Generation area
              </label>
              <div className="space-y-1.5">
                {generationAreaOptions.map((option, index) => {
                  const isSelected = generationArea === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`flex cursor-pointer items-start gap-3 p-3 border transition-colors ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-950/50'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        name="generation-area"
                        value={option.value}
                        checked={isSelected}
                        onChange={() => setGenerationArea(option.value)}
                      />
                      <div className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center text-[10px] font-bold ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-200">{option.label}</span>
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 ${
                            isSelected ? 'bg-indigo-800/60 text-indigo-300' : 'bg-slate-800 text-slate-600'
                          }`}>
                            {option.badge}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-600">{option.helper}</p>
                      </div>
                    </label>
                  );
                })}
              </div>

              {generationArea === 'uploaded' && (
                <div className="mt-3">
                  <GeoJSONUploader onGeoJSONLoaded={handleGeoJSONUploaded} />
                </div>
              )}
            </div>

            <div className="border-t border-slate-800" />

            {/* Attributes */}
            <FeatureAttributeEditor
              geometryType={geometryType}
              attributes={customAttributes}
              onAttributesChange={handleAttributesChange}
            />

            <div className="border-t border-slate-800" />

            {/* Prompt-assisted setup */}
            <div>
              <button
                type="button"
                onClick={() => setIsPromptPanelOpen(!isPromptPanelOpen)}
                className="flex w-full items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    Prompt-assisted setup
                  </span>
                  <span className="ml-2 text-[9px] border border-slate-700 px-1.5 py-0.5 text-slate-600 uppercase tracking-widest">
                    experimental
                  </span>
                </div>
                <span className="text-slate-600 text-sm">{isPromptPanelOpen ? '−' : '+'}</span>
              </button>

              {isPromptPanelOpen && (
                <div className="mt-3 space-y-3">
                  <div className="relative">
                    <textarea
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="50 coffee shops with ratings and wifi..."
                      className={`w-full bg-slate-800 border text-white px-3 py-2.5 text-sm focus:outline-none min-h-[80px] resize-none ${
                        aiValidation?.isValid === false ? 'border-red-500 focus:border-red-400' :
                        aiValidation?.confidence > 0.7 ? 'border-green-600 focus:border-green-500' :
                        'border-slate-700 focus:border-indigo-500'
                      }`}
                    />
                    {aiParsedResult && (
                      <div className="absolute top-2.5 right-2.5">
                        <div className={`w-2 h-2 rounded-full ${
                          aiParsedResult.confidence > 0.7 ? 'bg-green-500' :
                          aiParsedResult.confidence > 0.4 ? 'bg-yellow-500' : 'bg-slate-600'
                        }`} />
                      </div>
                    )}
                  </div>

                  {aiValidation && (
                    <div className={`px-3 py-2 text-xs border ${
                      aiValidation.isValid === false ? 'bg-red-950/60 border-red-800 text-red-400' :
                      aiValidation.warning ? 'bg-yellow-950/60 border-yellow-800 text-yellow-400' :
                      'bg-green-950/60 border-green-800 text-green-400'
                    }`}>
                      {aiValidation.message}
                    </div>
                  )}

                  {aiParsedResult && (
                    <div className="flex flex-wrap gap-1.5">
                      {aiParsedResult.domain && (
                        <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 text-[11px] text-slate-400 capitalize">
                          {aiParsedResult.domain}
                        </span>
                      )}
                      <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 text-[11px] text-slate-400 capitalize">
                        {aiParsedResult.geometryType}
                      </span>
                      <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 text-[11px] text-slate-400">
                        {aiParsedResult.quantity} features
                      </span>
                      {aiParsedResult.attributes?.length > 0 && (
                        <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 text-[11px] text-slate-400">
                          {aiParsedResult.attributes.length} attrs suggested
                        </span>
                      )}
                    </div>
                  )}

                  {aiParsedResult && aiParsedResult.confidence > 0.8 && (
                    <button
                      type="button"
                      onClick={handleApplyAiSuggestions}
                      className="w-full py-2 text-sm font-medium bg-slate-800 border border-green-700/60 text-green-400 hover:bg-green-950/40 transition-colors"
                    >
                      Apply suggested configuration
                    </button>
                  )}

                  <p className="text-xs text-slate-700">Keyword matching only — no external API calls.</p>

                  <AiConversation
                    prompt={aiPrompt}
                    onApplySettings={handleApplyAiSettings}
                    onClearPrompt={handleReplacePrompt}
                    onMapOperation={handleMapOperation}
                  />

                  <button
                    type="button"
                    onClick={() => setShowAiSuggestions(!showAiSuggestions)}
                    className="text-xs text-indigo-500 hover:text-indigo-400"
                  >
                    {showAiSuggestions ? 'Hide examples' : 'Show example prompts'}
                  </button>

                  {showAiSuggestions && (
                    <div className="bg-slate-800 border border-slate-700 p-3 space-y-2">
                      {Object.entries(getExamplePrompts()).map(([category, examples]) => (
                        <div key={category} className="text-xs">
                          <strong className="text-slate-500 capitalize">{category}</strong>
                          <div className="mt-1 space-y-1">
                            {examples.map((example, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => { setAiPrompt(example); }}
                                className="block text-left text-indigo-400 hover:text-indigo-300"
                              >
                                {example}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sticky bottom: generate + export */}
          <div className="flex-shrink-0 border-t-2 border-indigo-600/40 bg-slate-900 p-5 space-y-3">
            {/* Summary line */}
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>{quantity} {geometryLabel} · {generationAreaSummary}</span>
              {customAttributes.length > 0 && (
                <span className="bg-slate-800 px-2 py-0.5 text-slate-500">
                  {customAttributes.length} attrs
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              className="w-full py-3 bg-indigo-600 text-white font-bold text-sm tracking-wide hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/60"
            >
              Generate features
            </button>

            {/* Export — only when features exist */}
            {generatedFeatures && generatedFeatures.length > 0 && (
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">
                    {generatedFeatures.length.toLocaleString()} features generated
                  </span>
                  <button
                    type="button"
                    onClick={handleClearFeatures}
                    className="text-xs text-slate-600 hover:text-red-400 transition-colors"
                  >
                    Clear
                  </button>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-1.5 block">
                    Filename
                  </label>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:border-emerald-600 focus:outline-none"
                    placeholder="generated_features"
                  />
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { value: 'geojson', label: 'GeoJSON' },
                    { value: 'shapefile', label: 'Shapefile' },
                  ].map((fmt) => (
                    <label
                      key={fmt.value}
                      className={`flex items-center justify-center py-2 text-xs font-semibold border cursor-pointer transition-colors ${
                        exportFormat === fmt.value
                          ? 'bg-emerald-800/60 border-emerald-600 text-emerald-300'
                          : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="export-format"
                        value={fmt.value}
                        checked={exportFormat === fmt.value}
                        onChange={() => setExportFormat(fmt.value)}
                        className="sr-only"
                      />
                      {fmt.label}
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full py-2.5 bg-emerald-700 text-white font-bold text-sm hover:bg-emerald-600 transition-colors"
                >
                  Download {exportFormat === 'shapefile' ? 'ZIP' : exportFormat.toUpperCase()}
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Map area */}
        <div className="relative bg-slate-950 h-[65vh] md:h-auto md:flex-1">
          <GenerateMap
            ref={generateMapRef}
            generationArea={generationArea}
            onDrawingComplete={handleDrawingComplete}
            uploadedGeoJSON={uploadedGeoJSON}
          />

          {/* Empty state overlay */}
          {!generatedFeatures && (
            <div className="pointer-events-none absolute right-4 top-4 max-w-[190px]">
              <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700/80 px-3 py-2.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                  {mapEmptyState.eyebrow}
                </span>
                <p className="mt-1.5 text-sm font-medium text-slate-200">
                  {mapEmptyState.title}
                </p>
                <p className="mt-1 text-xs text-slate-500">{mapEmptyState.detail}</p>
              </div>
            </div>
          )}

          {/* Stats overlay — when features exist */}
          {generatedFeatures && generatedFeatures.length > 0 && (
            <div className="absolute bottom-6 right-4">
              <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700/80 px-5 py-3 flex items-center gap-6">
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Features</div>
                  <div className="text-xl font-bold text-white">{generatedFeatures.length.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Type</div>
                  <div className="text-xl font-bold text-white capitalize">{geometryType}s</div>
                </div>
                {generationArea === 'draw' && drawnArea && (
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Area</div>
                    <div className="text-xl font-bold text-white">
                      {(turf.area(drawnArea) / 1000000).toFixed(2)} km²
                    </div>
                  </div>
                )}
                {customAttributes.length > 0 && (
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Attrs</div>
                    <div className="text-xl font-bold text-white">{customAttributes.length}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
