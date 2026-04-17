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
import {
  DEFAULT_UTILITY_NETWORK_SETTINGS,
  LINE_WORKFLOW_MODES,
  UTILITY_DENSITIES,
  UTILITY_PATTERNS,
  UTILITY_PATTERN_DESCRIPTIONS
} from '@/lib/geo/utilityNetworkConfig';

function getFeatureCollectionCount(geoJSON) {
  if (!geoJSON) return 0;
  if (geoJSON.type === 'FeatureCollection') return geoJSON.features?.length || 0;
  if (geoJSON.type === 'Feature') return 1;
  return 0;
}

function mergeFeatureCollections(existingGeoJSON, nextGeoJSON) {
  if (!existingGeoJSON) {
    return nextGeoJSON;
  }

  const existingFeatures =
    existingGeoJSON.type === 'FeatureCollection'
      ? existingGeoJSON.features || []
      : existingGeoJSON.type === 'Feature'
      ? [existingGeoJSON]
      : [];
  const nextFeatures =
    nextGeoJSON?.type === 'FeatureCollection'
      ? nextGeoJSON.features || []
      : nextGeoJSON?.type === 'Feature'
      ? [nextGeoJSON]
      : [];

  return {
    type: 'FeatureCollection',
    features: [...existingFeatures, ...nextFeatures]
  };
}

export default function GeneratePage() {
  const [geometryType, setGeometryType] = useState('point');
  const [quantity, setQuantity] = useState(50);
  const [generationArea, setGenerationArea] = useState('viewport');
  const [customAttributes, setCustomAttributes] = useState([]);
  const [exportFormat, setExportFormat] = useState('geojson');
  const [fileName, setFileName] = useState('generated_features');
  const [generatedFeatures, setGeneratedFeatures] = useState(null);
  const [generationMetadata, setGenerationMetadata] = useState(null);
  const [generationWarnings, setGenerationWarnings] = useState([]);
  const [drawnArea, setDrawnArea] = useState(null);
  const [uploadedGeoJSON, setUploadedGeoJSON] = useState(null);
  const [excludedGeoJSON, setExcludedGeoJSON] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiParsedResult, setAiParsedResult] = useState(null);
  const [aiValidation, setAiValidation] = useState(null);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);
  const [isPromptPanelOpen, setIsPromptPanelOpen] = useState(false);
  const [lineLength, setLineLength] = useState({ min: 100, max: 1000 });
  const [polygonArea, setPolygonArea] = useState({ min: 1000, max: 10000 });
  const [lineWorkflowMode, setLineWorkflowMode] = useState(LINE_WORKFLOW_MODES.BASIC);
  const [utilityNetworkSettings, setUtilityNetworkSettings] = useState(DEFAULT_UTILITY_NETWORK_SETTINGS);
  const [activeDrawTarget, setActiveDrawTarget] = useState(null);
  const generateMapRef = useRef(null);

  useEffect(() => {
    if (aiPrompt.trim().length === 0) {
      setAiParsedResult(null);
      setAiValidation(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      setAiParsedResult(parsePrompt(aiPrompt));
      setAiValidation(validatePrompt(aiPrompt));
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [aiPrompt]);

  const handleGeometryTypeChange = (type) => {
    setGeometryType(type);
    setCustomAttributes([]);

    if (type !== 'line') {
      setExcludedGeoJSON(null);
    }

    if (type !== 'line' && activeDrawTarget === 'exclusion') {
      setActiveDrawTarget(null);
    }
  };

  const handleDrawingComplete = useCallback((polygon) => {
    setDrawnArea(polygon);
    if (polygon) setGenerationArea('draw');
    setActiveDrawTarget(null);
  }, []);

  const handleGeoJSONUploaded = useCallback((geojson) => {
    setUploadedGeoJSON(geojson);
    setGenerationArea('uploaded');
    setDrawnArea(geojson);
    setActiveDrawTarget(null);
  }, []);

  const handleExclusionGeoJSONUploaded = useCallback((geojson) => {
    setExcludedGeoJSON((prev) => mergeFeatureCollections(prev, geojson));
    setActiveDrawTarget(null);
  }, []);

  const handleExclusionDrawComplete = useCallback((geojson) => {
    setExcludedGeoJSON((prev) => mergeFeatureCollections(prev, geojson));
    setActiveDrawTarget(null);
  }, []);

  const handleGenerate = useCallback(() => {
    if (!generateMapRef.current) {
      alert('Map not ready. Please wait a moment and try again.');
      return;
    }

    try {
      const result = generateMapRef.current.generateFeatures({
        geometryType,
        quantity: Math.min(quantity, 50000),
        customAttributes,
        lineLength,
        polygonArea,
        generationArea,
        lineWorkflowMode,
        utilityNetworkSettings,
        aiPrompt: aiPrompt.trim()
      });

      setGenerationWarnings(result?.warnings || []);
      setGenerationMetadata(result?.metadata || null);

      if (result?.features && result.features.length > 0) {
        setGeneratedFeatures(result.features);
        return;
      }

      setGeneratedFeatures(null);
      alert(result?.warnings?.[0] || 'No features were generated. Please check your settings and try again.');
    } catch (error) {
      console.error('Error during feature generation:', error);
      alert('An error occurred during generation. Please check the console for details.');
    }
  }, [
    geometryType,
    quantity,
    customAttributes,
    lineLength,
    polygonArea,
    generationArea,
    lineWorkflowMode,
    utilityNetworkSettings,
    aiPrompt
  ]);

  const handleDownload = async () => {
    if (!generatedFeatures || generatedFeatures.length === 0) {
      alert('No features to export. Please generate features first.');
      return;
    }

    const exportFileName = fileName || 'generated_features';

    try {
      switch (exportFormat) {
        case 'geojson':
          exportAsGeoJSON(generatedFeatures, exportFileName, generationMetadata);
          break;
        case 'shapefile':
          await exportAsShapefile(generatedFeatures, exportFileName);
          break;
        case 'geopackage':
          await exportAsGeoPackage(generatedFeatures, exportFileName);
          break;
        default:
          exportAsGeoJSON(generatedFeatures, exportFileName, generationMetadata);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert(`Export failed: ${error.message}`);
    }
  };

  const handleClearFeatures = () => {
    setGeneratedFeatures(null);
    setGenerationMetadata(null);
    setGenerationWarnings([]);
    if (generateMapRef.current?.clearFeatures) {
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
    if (settings.lineWorkflowMode) setLineWorkflowMode(settings.lineWorkflowMode);
    if (settings.utilityNetworkSettings) {
      setUtilityNetworkSettings((prev) => ({
        ...prev,
        ...settings.utilityNetworkSettings
      }));
    }
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
    if (smartDefaults.lineWorkflowMode) setLineWorkflowMode(smartDefaults.lineWorkflowMode);
    if (smartDefaults.utilityNetworkSettings) {
      setUtilityNetworkSettings((prev) => ({
        ...prev,
        ...smartDefaults.utilityNetworkSettings
      }));
    }
  };

  const handleAttributesChange = (newAttributes) => {
    setCustomAttributes(newAttributes);
  };

  const updateUtilityNetworkSetting = (field, value) => {
    setUtilityNetworkSettings((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMapOperation = (operation) => {
    if (!generateMapRef.current) return;

    switch (operation.type) {
      case 'setLocation':
        generateMapRef.current.setMapView?.({
          center: operation.centerPoint,
          zoom: operation.zoomLevel,
          bounds: operation.bounds
        });
        break;
      case 'showPreview':
        if (generateMapRef.current.showPreviewFeatures && operation.geoJSON) {
          generateMapRef.current.showPreviewFeatures(operation.geoJSON);
          if (operation.bounds) {
            generateMapRef.current.setMapView?.({ bounds: operation.bounds, padding: 50 });
          }
        }
        break;
    }
  };

  const generationAreaSummary =
    generationArea === 'draw' ? 'drawn boundary' :
    generationArea === 'uploaded' ? 'uploaded boundary' :
    'map viewport';
  const geometryLabel =
    geometryType === 'polygon' ? 'polygons' :
    geometryType === 'line' ? 'lines' :
    'points';
  const utilityPatternDescription = UTILITY_PATTERN_DESCRIPTIONS[utilityNetworkSettings.pattern];
  const exclusionCount = getFeatureCollectionCount(excludedGeoJSON);
  const boundaryStatus =
    generationArea === 'draw' ? (drawnArea ? 'Drawn boundary ready' : 'Draw boundary on map') :
    generationArea === 'uploaded' ? (uploadedGeoJSON ? 'Uploaded boundary ready' : 'Upload a boundary polygon') :
    'Using current viewport as the boundary';
  const activeConstraintSummary = `${boundaryStatus} · ${exclusionCount} no-go zone${exclusionCount === 1 ? '' : 's'}`;

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

  const sidebarSummary =
    geometryType === 'line' && lineWorkflowMode === LINE_WORKFLOW_MODES.UTILITY
      ? `~${quantity} connected lines · ${generationAreaSummary}`
      : `${quantity} ${geometryLabel} · ${generationAreaSummary}`;

  const patternLabel = UTILITY_PATTERNS.find((opt) => opt.value === utilityNetworkSettings.pattern)?.label || utilityNetworkSettings.pattern;
  const metadataPatternLabel = generationMetadata?.networkPattern
    ? UTILITY_PATTERNS.find((opt) => opt.value === generationMetadata.networkPattern)?.label || generationMetadata.networkPattern
    : null;

  return (
    <div className="flex flex-col min-h-screen md:h-screen md:overflow-hidden">
      <Header variant="dark" />

      <div className="flex flex-col md:flex-row flex-1 md:overflow-hidden">
        <aside className="w-full md:w-80 xl:w-96 flex-shrink-0 bg-slate-900 flex flex-col border-b md:border-b-0 md:border-r border-slate-800">
          <div className="flex-1 md:overflow-y-auto p-5 space-y-6">
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

              {geometryType === 'point' && (
                <p className="mt-3 text-xs text-slate-500">
                  Point generation is the most credible general-purpose workflow in the current demo.
                </p>
              )}

              {geometryType === 'line' && (
                <div className="mt-3 border border-slate-700 bg-slate-950/40 px-3 py-2.5">
                  <p className="text-xs text-slate-300">
                    Connected lines sketch a simple branching network and respect no-go zones. Basic lines emit unrelated random segments.
                  </p>
                </div>
              )}

              {geometryType === 'polygon' && (
                <div className="mt-3 border border-amber-800/60 bg-amber-950/20 px-3 py-2.5">
                  <p className="text-xs text-amber-300">
                    Polygon mode currently produces basic synthetic areas. Use it as an experimental workflow, not a semantic land-use generator.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                {geometryType === 'line' && lineWorkflowMode === LINE_WORKFLOW_MODES.UTILITY ? 'Approximate line count' : 'Quantity'}
              </label>
              <input
                type="number"
                min="1"
                max="50000"
                value={quantity}
                onChange={(e) => setQuantity(Math.min(parseInt(e.target.value, 10) || 1, 50000))}
                className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-600">
                {geometryType === 'line' && lineWorkflowMode === LINE_WORKFLOW_MODES.UTILITY
                  ? 'Target number of connected line segments. Expect a few fewer than asked.'
                  : '1 – 50,000 features'}
              </p>
            </div>

            {geometryType === 'line' && (
              <div className="space-y-4 border border-slate-800 bg-slate-950/40 p-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                    Line workflow
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      {
                        value: LINE_WORKFLOW_MODES.BASIC,
                        label: 'Basic lines',
                        helper: 'Random unrelated segments'
                      },
                      {
                        value: LINE_WORKFLOW_MODES.UTILITY,
                        label: 'Connected lines',
                        helper: 'Branching sketch with no-go zones'
                      }
                    ].map((mode) => (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => setLineWorkflowMode(mode.value)}
                        className={`border px-3 py-2.5 text-left transition-colors ${
                          lineWorkflowMode === mode.value
                            ? 'border-indigo-500 bg-indigo-950/50 text-white'
                            : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                        }`}
                      >
                        <div className="text-sm font-semibold">{mode.label}</div>
                        <div className="mt-1 text-[11px] text-slate-500">{mode.helper}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {lineWorkflowMode === LINE_WORKFLOW_MODES.BASIC ? (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Line length (m)
                      </label>
                      <span className="text-[9px] uppercase tracking-widest text-amber-400">basic / experimental</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-xs text-slate-600 mb-1 block">Min</span>
                        <input
                          type="number"
                          min="1"
                          max={lineLength.max}
                          value={lineLength.min}
                          onChange={(e) => setLineLength((prev) => ({ ...prev, min: Math.min(parseInt(e.target.value, 10) || 1, prev.max) }))}
                          className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <span className="text-xs text-slate-600 mb-1 block">Max</span>
                        <input
                          type="number"
                          min={lineLength.min}
                          value={lineLength.max}
                          onChange={(e) => setLineLength((prev) => ({ ...prev, max: Math.max(parseInt(e.target.value, 10) || prev.min, prev.min) }))}
                          className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-slate-600">
                      Basic mode emits simple synthetic segments and may self-intersect.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                        Shape
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-xs text-slate-600 mb-1 block">Layout</span>
                          <select
                            value={utilityNetworkSettings.pattern}
                            onChange={(e) => updateUtilityNetworkSetting('pattern', e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                          >
                            {UTILITY_PATTERNS.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <span className="text-xs text-slate-600 mb-1 block">Density</span>
                          <select
                            value={utilityNetworkSettings.density}
                            onChange={(e) => updateUtilityNetworkSetting('density', e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                          >
                            {UTILITY_DENSITIES.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <span className="text-xs text-slate-600 mb-1 block">Min separation (m)</span>
                          <input
                            type="number"
                            min="0"
                            value={utilityNetworkSettings.minSeparation}
                            onChange={(e) => updateUtilityNetworkSetting('minSeparation', Math.max(0, parseInt(e.target.value, 10) || 0))}
                            className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                          />
                          <p className="mt-1 text-[11px] text-slate-600">
                            Minimum gap between parallel lines. Larger values = cleaner sketch, fewer segments.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="border border-slate-800 bg-slate-900/80 px-3 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                            What this will look like
                          </div>
                          <p className="mt-1 text-sm text-slate-300">{utilityPatternDescription}</p>
                        </div>
                        <span className="text-[9px] uppercase tracking-widest text-sky-400">
                          synthetic sketch
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                          No-go zones (optional)
                        </label>
                        {excludedGeoJSON && (
                          <button
                            type="button"
                            onClick={() => setExcludedGeoJSON(null)}
                            className="text-[10px] uppercase tracking-widest text-slate-600 hover:text-red-400"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <p className="mb-3 text-xs text-slate-600">
                        Use polygons for lakes, parks, or other exclusion zones. Generated lines will try to stay inside the boundary and avoid these areas.
                      </p>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <button
                          type="button"
                          onClick={() => setActiveDrawTarget('exclusion')}
                          className={`border px-3 py-2 text-xs font-semibold transition-colors ${
                            activeDrawTarget === 'exclusion'
                              ? 'border-red-500 bg-red-950/40 text-red-300'
                              : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          Draw on map
                        </button>
                        <div className="border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs text-slate-500 flex items-center">
                          Red fill = exclusion zone
                        </div>
                      </div>

                      <GeoJSONUploader onGeoJSONLoaded={handleExclusionGeoJSONUploaded} />
                      {excludedGeoJSON && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-emerald-400">
                            {exclusionCount} no-go zone{exclusionCount === 1 ? '' : 's'} loaded.
                          </p>
                          <p className="text-[11px] text-slate-600">
                            Uploads and drawn polygons are combined into the active exclusion mask.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {geometryType === 'polygon' && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                  Polygon area (m²)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-xs text-slate-600 mb-1 block">Min</span>
                    <input
                      type="number"
                      min="1"
                      max={polygonArea.max}
                      value={polygonArea.min}
                      onChange={(e) => setPolygonArea((prev) => ({ ...prev, min: Math.min(parseInt(e.target.value, 10) || 1, prev.max) }))}
                      className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <span className="text-xs text-slate-600 mb-1 block">Max</span>
                    <input
                      type="number"
                      min={polygonArea.min}
                      value={polygonArea.max}
                      onChange={(e) => setPolygonArea((prev) => ({ ...prev, max: Math.max(parseInt(e.target.value, 10) || prev.min, prev.min) }))}
                      className="w-full bg-slate-800 border border-slate-700 text-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-slate-800" />

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                Boundary / extent
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
                        onChange={() => {
                          setGenerationArea(option.value);
                          if (option.value === 'draw') {
                            setActiveDrawTarget('boundary');
                          } else if (activeDrawTarget === 'boundary') {
                            setActiveDrawTarget(null);
                          }
                        }}
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

              {generationArea === 'draw' && (
                <div className="mt-3 border border-slate-800 bg-slate-950/50 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-300">Boundary drawing is enabled on the map.</p>
                      <p className="mt-1 text-[11px] text-slate-600">Click to place vertices. Double-click to finish the polygon.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveDrawTarget('boundary')}
                      className={`border px-3 py-2 text-xs font-semibold transition-colors ${
                        activeDrawTarget === 'boundary'
                          ? 'border-indigo-500 bg-indigo-950/50 text-indigo-300'
                          : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'
                      }`}
                    >
                      Draw boundary
                    </button>
                  </div>
                </div>
              )}

              {generationArea === 'uploaded' && (
                <div className="mt-3">
                  <GeoJSONUploader onGeoJSONLoaded={handleGeoJSONUploaded} />
                </div>
              )}
            </div>

            <div className="border-t border-slate-800" />

            <FeatureAttributeEditor
              geometryType={geometryType}
              attributes={customAttributes}
              onAttributesChange={handleAttributesChange}
            />

            <div className="border-t border-slate-800" />

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
                      placeholder="Generate a connected network that avoids lakes and favors branching..."
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
                          aiParsedResult.confidence > 0.4 ? 'bg-yellow-500' :
                          'bg-slate-600'
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
                      {aiParsedResult.lineWorkflowMode === LINE_WORKFLOW_MODES.UTILITY && (
                        <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 text-[11px] text-sky-300">
                          connected lines
                        </span>
                      )}
                      <span className="bg-slate-800 border border-slate-700 px-2 py-0.5 text-[11px] text-slate-400">
                        {aiParsedResult.quantity} {aiParsedResult.lineWorkflowMode === LINE_WORKFLOW_MODES.UTILITY ? 'lines' : 'features'}
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

                  <p className="text-xs text-slate-700">
                    Rule-based prompt interpretation only. No external API calls and no raw coordinate generation.
                  </p>

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
                                onClick={() => setAiPrompt(example)}
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

          <div className="flex-shrink-0 border-t-2 border-indigo-600/40 bg-slate-900 p-5 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>{sidebarSummary}</span>
              {customAttributes.length > 0 && (
                <span className="bg-slate-800 px-2 py-0.5 text-slate-500">
                  {customAttributes.length} attrs
                </span>
              )}
            </div>

            {geometryType === 'line' && lineWorkflowMode === LINE_WORKFLOW_MODES.UTILITY && (
              <div className="border border-slate-800 bg-slate-950/50 px-3 py-2.5 text-xs text-slate-400 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="uppercase tracking-widest text-slate-600">Mode</span>
                  <span className="text-sky-300">Connected lines</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{patternLabel}</span>
                  <span className="capitalize">{utilityNetworkSettings.density} density</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{exclusionCount} no-go zone{exclusionCount === 1 ? '' : 's'}</span>
                  <span>{utilityNetworkSettings.minSeparation} m min gap</span>
                </div>
                <div className="text-[11px] text-slate-600">
                  {activeConstraintSummary}
                </div>
              </div>
            )}

            {generationWarnings.length > 0 && (
              <div className="space-y-1">
                {generationWarnings.map((warning, index) => (
                  <div key={`${warning}-${index}`} className="border border-amber-800/50 bg-amber-950/20 px-3 py-2 text-xs text-amber-300">
                    {warning}
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={handleGenerate}
              className="w-full py-3 bg-indigo-600 text-white font-bold text-sm tracking-wide hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/60"
            >
              Generate features
            </button>

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

                {generationMetadata && (
                  <div className="border border-slate-800 bg-slate-950/50 p-3 text-xs text-slate-400 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="uppercase tracking-widest text-slate-600">Summary</span>
                      <span className="capitalize text-slate-200">
                        {generationMetadata.workflowMode === 'utility' ? 'Connected lines' : geometryType}
                      </span>
                    </div>

                    {metadataPatternLabel && (
                      <div className="flex items-center justify-between">
                        <span>Shape</span>
                        <span>{metadataPatternLabel}</span>
                      </div>
                    )}

                    {typeof generationMetadata.exclusionsUsed === 'number' && (
                      <div className="flex items-center justify-between">
                        <span>Exclusions used</span>
                        <span>{generationMetadata.exclusionsUsed}</span>
                      </div>
                    )}

                    {generationMetadata.totalLengthMeters && (
                      <div className="flex items-center justify-between">
                        <span>Total length</span>
                        <span>{generationMetadata.totalLengthMeters.toLocaleString()} m</span>
                      </div>
                    )}

                    {generationMetadata.syntheticNotice && (
                      <p className="text-[11px] text-slate-500">
                        {generationMetadata.syntheticNotice}
                      </p>
                    )}
                  </div>
                )}

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

        <div className="relative bg-slate-950 h-[65vh] md:h-auto md:flex-1">
          <GenerateMap
            ref={generateMapRef}
            generationArea={generationArea}
            onDrawingComplete={handleDrawingComplete}
            onExclusionDrawComplete={handleExclusionDrawComplete}
            uploadedGeoJSON={uploadedGeoJSON}
            excludedGeoJSON={excludedGeoJSON}
            activeDrawTarget={activeDrawTarget}
          />

          {activeDrawTarget && (
            <div className="pointer-events-none absolute left-4 top-4 max-w-[240px]">
              <div className={`backdrop-blur-sm border px-3 py-2.5 ${
                activeDrawTarget === 'boundary'
                  ? 'bg-indigo-950/85 border-indigo-700/80'
                  : 'bg-red-950/85 border-red-700/80'
              }`}>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${
                  activeDrawTarget === 'boundary' ? 'text-indigo-300' : 'text-red-300'
                }`}>
                  {activeDrawTarget === 'boundary' ? 'Drawing Boundary' : 'Drawing No-Go Zone'}
                </span>
                <p className="mt-1.5 text-sm font-medium text-slate-100">
                  Click to place vertices. Double-click to finish the polygon.
                </p>
              </div>
            </div>
          )}

          {!generatedFeatures && (
            <div className="pointer-events-none absolute right-4 top-4 max-w-[220px]">
              <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700/80 px-3 py-2.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                  {mapEmptyState.eyebrow}
                </span>
                <p className="mt-1.5 text-sm font-medium text-slate-200">
                  {mapEmptyState.title}
                </p>
                <p className="mt-1 text-xs text-slate-500">{mapEmptyState.detail}</p>
                {geometryType === 'line' && lineWorkflowMode === LINE_WORKFLOW_MODES.UTILITY && (
                  <p className="mt-2 text-xs text-sky-300">
                    Blue = boundary. Red = no-go zones. White = main line, purple = branches, dashed cyan = loops.
                  </p>
                )}
              </div>
            </div>
          )}

          {generatedFeatures && generatedFeatures.length > 0 && geometryType === 'line' && lineWorkflowMode === LINE_WORKFLOW_MODES.UTILITY && (
            <div className="pointer-events-none absolute left-4 top-4">
              <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700/80 px-3 py-2 text-[11px] text-slate-300 space-y-1">
                <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Line roles</div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-[3px] w-5 bg-white"></span>
                  <span>Main line</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-[3px] w-5" style={{ background: '#c4b5fd' }}></span>
                  <span>Branches</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-[2px] w-5" style={{ background: 'repeating-linear-gradient(90deg, #67e8f9 0 4px, transparent 4px 8px)' }}></span>
                  <span>Loops</span>
                </div>
              </div>
            </div>
          )}

          {generatedFeatures && generatedFeatures.length > 0 && (
            <div className="absolute bottom-6 right-4">
              <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700/80 px-5 py-3 flex items-center gap-6">
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Features</div>
                  <div className="text-xl font-bold text-white">{generatedFeatures.length.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Type</div>
                  <div className="text-xl font-bold text-white capitalize">
                    {`${geometryType}s`}
                  </div>
                </div>
                {(generationArea === 'draw' || generationArea === 'uploaded') && drawnArea && (
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Area</div>
                    <div className="text-xl font-bold text-white">
                      {(turf.area(drawnArea) / 1000000).toFixed(2)} km²
                    </div>
                  </div>
                )}
                {metadataPatternLabel && (
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Shape</div>
                    <div className="text-xl font-bold text-white">{metadataPatternLabel}</div>
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
