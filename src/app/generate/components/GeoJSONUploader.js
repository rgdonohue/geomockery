'use client';

import { useState, useRef } from 'react';

export default function GeoJSONUploader({ onGeoJSONLoaded }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'url'
  const [url, setUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await readFile(file);
  };

  const readFile = async (file) => {
    setIsUploading(true);
    setError(null);
    try {
      const text = await file.text();
      processGeoJSON(text, file.name);
    } catch (err) {
      setError(`Failed to read file: ${err.message}`);
      setIsUploading(false);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await readFile(file);
  };

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsUploading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json, application/geo+json, text/plain, */*'
        }
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const text = await response.text();
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1].split('?')[0] || 'imported-geojson';
      processGeoJSON(text, fileName);
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setError('CORS error — try uploading the file directly instead.');
      } else {
        setError(`Failed to fetch: ${err.message}`);
      }
      setIsUploading(false);
    }
  };

  const processGeoJSON = (text, fileName) => {
    try {
      let geoJSON;
      try {
        geoJSON = JSON.parse(text);
      } catch {
        throw new Error('Invalid JSON format.');
      }

      if (!geoJSON || typeof geoJSON !== 'object') throw new Error('Not a valid object');
      if (!geoJSON.type) throw new Error('Missing "type" property');

      if (geoJSON.type === 'FeatureCollection') {
        if (!Array.isArray(geoJSON.features)) throw new Error('"features" must be an array');
        if (geoJSON.features.length === 0) throw new Error('FeatureCollection is empty');
        for (let i = 0; i < Math.min(3, geoJSON.features.length); i++) {
          const f = geoJSON.features[i];
          if (!f || f.type !== 'Feature') throw new Error(`Invalid feature at index ${i}`);
          if (!f.geometry) throw new Error(`Feature at index ${i} missing geometry`);
        }
      } else if (geoJSON.type === 'Feature') {
        if (!geoJSON.geometry) throw new Error('Feature missing "geometry"');
        if (!geoJSON.geometry.type) throw new Error('Geometry missing "type"');
      } else if (['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection'].includes(geoJSON.type)) {
        if (geoJSON.type !== 'GeometryCollection' && !geoJSON.coordinates) {
          throw new Error(`${geoJSON.type} missing "coordinates"`);
        }
      } else {
        throw new Error(`Unsupported type: "${geoJSON.type}"`);
      }

      let featureCollection;
      if (geoJSON.type === 'FeatureCollection') {
        featureCollection = geoJSON;
      } else if (geoJSON.type === 'Feature') {
        featureCollection = { type: 'FeatureCollection', features: [geoJSON] };
      } else {
        featureCollection = {
          type: 'FeatureCollection',
          features: [{ type: 'Feature', properties: {}, geometry: geoJSON }]
        };
      }

      onGeoJSONLoaded(featureCollection, fileName);
      setIsUploading(false);

      const count = featureCollection.features.length;
      setError(`✅ Imported ${count} feature${count === 1 ? '' : 's'} from ${fileName}`);

      if (uploadMode === 'file' && fileInputRef.current) fileInputRef.current.value = '';
      else setUrl('');

      setTimeout(() => setError(null), 3000);
    } catch (err) {
      setError(`Invalid GeoJSON: ${err.message}`);
      setIsUploading(false);
    }
  };

  return (
    <div>
      {/* Mode tabs */}
      <div className="flex border-b border-slate-700 mb-3">
        {['file', 'url'].map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setUploadMode(mode)}
            className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors ${
              uploadMode === mode
                ? 'text-indigo-400 border-b border-indigo-500 -mb-px'
                : 'text-slate-600 hover:text-slate-400'
            }`}
          >
            {mode === 'file' ? 'Upload File' : 'Import URL'}
          </button>
        ))}
      </div>

      {uploadMode === 'file' && (
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-2 px-4 py-5 border border-dashed transition-colors ${
            isDragging
              ? 'border-indigo-400 bg-indigo-900/20'
              : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
          }`}
        >
          <svg className="h-7 w-7 text-slate-600" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
          <p className="text-xs text-slate-500 text-center">
            {isDragging ? 'Drop to import' : 'Drag a file here, or'}
          </p>
          {!isDragging && (
            <label className="cursor-pointer text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              browse
              <input
                type="file"
                accept=".json,.geojson"
                className="sr-only"
                onChange={handleFileChange}
                ref={fileInputRef}
                disabled={isUploading}
              />
            </label>
          )}
          <p className="text-[10px] text-slate-700">.json / .geojson</p>
        </div>
      )}

      {uploadMode === 'url' && (
        <form onSubmit={handleUrlSubmit} className="space-y-2">
          <input
            type="url"
            className="w-full bg-slate-800 border border-slate-700 text-white px-2.5 py-1.5 text-sm focus:border-indigo-500 focus:outline-none placeholder-slate-600"
            placeholder="https://example.com/data.geojson"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isUploading}
            required
          />
          <button
            type="submit"
            disabled={isUploading}
            className="w-full text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 transition-colors disabled:opacity-50"
          >
            {isUploading ? 'Loading...' : 'Import'}
          </button>
        </form>
      )}

      {error && (
        <p className={`mt-2 text-xs ${
          error.startsWith('✅') ? 'text-emerald-400' : 'text-red-400'
        }`}>
          {error}
        </p>
      )}

      {isUploading && (
        <div className="mt-2 flex items-center gap-2">
          <div className="h-3.5 w-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-500">Processing…</span>
        </div>
      )}
    </div>
  );
}
