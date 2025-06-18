'use client';

import { useState, useRef } from 'react';
import * as turf from '@turf/turf';

export default function GeoJSONUploader({ onGeoJSONLoaded }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'url'
  const [url, setUrl] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  const handleUrlSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsUploading(true);
    setError(null);

    try {
      // Add headers to handle CORS and content-type better
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json, application/geo+json, text/plain, */*'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      
      const text = await response.text();
      
      // Extract filename from URL or use a default
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1].split('?')[0] || 'imported-geojson';
      
      processGeoJSON(text, fileName);
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        setError('Failed to fetch from URL: This might be due to CORS restrictions. Try uploading the file directly instead.');
      } else {
        setError(`Failed to fetch from URL: ${err.message}`);
      }
      setIsUploading(false);
    }
  };

  const processGeoJSON = (text, fileName) => {
    try {
      // Parse GeoJSON
      let geoJSON;
      try {
        geoJSON = JSON.parse(text);
      } catch (parseError) {
        throw new Error('Invalid JSON format. Please ensure the file contains valid JSON.');
      }
      
      // Validate structure through basic checks instead of using turf.valid
      if (!geoJSON || typeof geoJSON !== 'object') {
        throw new Error('Invalid GeoJSON: not a valid object');
      }
      
      if (!geoJSON.type) {
        throw new Error('Invalid GeoJSON: missing "type" property');
      }
      
      // Validate GeoJSON structure
      if (geoJSON.type === 'FeatureCollection') {
        if (!Array.isArray(geoJSON.features)) {
          throw new Error('Invalid FeatureCollection: "features" must be an array');
        }
        if (geoJSON.features.length === 0) {
          throw new Error('FeatureCollection is empty - no features to import');
        }
        // Validate first few features to ensure they're valid
        for (let i = 0; i < Math.min(3, geoJSON.features.length); i++) {
          const feature = geoJSON.features[i];
          if (!feature || typeof feature !== 'object') {
            throw new Error(`Invalid feature at index ${i}: not an object`);
          }
          if (feature.type !== 'Feature') {
            throw new Error(`Invalid feature at index ${i}: type must be "Feature"`);
          }
          if (!feature.geometry) {
            throw new Error(`Invalid feature at index ${i}: missing geometry`);
          }
        }
      } else if (geoJSON.type === 'Feature') {
        // Check if feature has geometry
        if (!geoJSON.geometry) {
          throw new Error('Feature is missing "geometry" property');
        }
        if (!geoJSON.geometry.type) {
          throw new Error('Feature geometry is missing "type" property');
        }
      } else if (['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon', 'GeometryCollection'].includes(geoJSON.type)) {
        // It's a geometry object - check if it has coordinates
        if (geoJSON.type !== 'GeometryCollection' && !geoJSON.coordinates) {
          throw new Error(`${geoJSON.type} geometry is missing "coordinates" property`);
        }
      } else {
        throw new Error(`Unsupported GeoJSON type: "${geoJSON.type}". Supported types: FeatureCollection, Feature, Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon`);
      }
      
      // Convert to FeatureCollection if it's a single geometry or feature
      let featureCollection;
      
      if (geoJSON.type === 'FeatureCollection') {
        featureCollection = geoJSON;
      } else if (geoJSON.type === 'Feature') {
        featureCollection = {
          type: 'FeatureCollection',
          features: [geoJSON]
        };
      } else {
        // Assume it's a geometry
        featureCollection = {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            properties: {},
            geometry: geoJSON
          }]
        };
      }
      
      // Pass the processed GeoJSON to the parent component
      onGeoJSONLoaded(featureCollection, fileName);
      setIsUploading(false);
      setError(null); // Clear any previous errors
      
      // Show success message briefly
      const featureCount = featureCollection.features.length;
      const tempSuccessMessage = `✅ Successfully imported ${featureCount} feature${featureCount === 1 ? '' : 's'} from ${fileName}`;
      setError(tempSuccessMessage);
      
      // Reset the form
      if (uploadMode === 'file' && fileInputRef.current) {
        fileInputRef.current.value = '';
      } else {
        setUrl('');
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    } catch (err) {
      setError(`Invalid GeoJSON: ${err.message}`);
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 rounded-lg border-4 border-indigo-500 bg-white">
      <h3 className="text-lg font-bold mb-3 text-indigo-700">Import GeoJSON</h3>
      
      {/* Toggle buttons */}
      <div className="flex mb-4 border-b-4 border-indigo-300 pb-2">
        <button
          className={`flex-1 py-2 px-4 rounded-t-lg font-bold text-white ${
            uploadMode === 'file' 
              ? 'bg-indigo-600 shadow-inner transform -translate-y-1' 
              : 'bg-indigo-400 hover:bg-indigo-500'
          }`}
          onClick={() => setUploadMode('file')}
        >
          Upload File
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-t-lg font-bold text-white ${
            uploadMode === 'url' 
              ? 'bg-indigo-600 shadow-inner transform -translate-y-1' 
              : 'bg-indigo-400 hover:bg-indigo-500'
          }`}
          onClick={() => setUploadMode('url')}
        >
          Import URL
        </button>
      </div>
      
      {/* File upload form */}
      {uploadMode === 'file' && (
        <div>
          <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-4 border-dashed border-indigo-300 rounded-md">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-indigo-500"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="flex flex-col justify-center items-center">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-indigo-600 rounded-md font-medium text-white hover:bg-indigo-500 py-2 px-4"
                >
                  <span>Select GeoJSON file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    accept=".json,.geojson"
                    className="sr-only"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    disabled={isUploading}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Only GeoJSON files (.json, .geojson) are supported
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* URL import form */}
      {uploadMode === 'url' && (
        <form onSubmit={handleUrlSubmit}>
          <div className="mt-2">
            <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-1">
              GeoJSON URL
            </label>
            <div className="flex">
              <input
                type="url"
                id="url-input"
                className="flex-grow block w-full border-4 border-indigo-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-2"
                placeholder="https://example.com/data.geojson"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isUploading}
                required
              />
              <button
                type="submit"
                className="ml-2 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                disabled={isUploading}
              >
                {isUploading ? 'Loading...' : 'Import'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter a URL to a valid GeoJSON file
            </p>
          </div>
        </form>
      )}
      
      {/* Error/Success message */}
      {error && (
        <div className={`mt-3 p-2 border-l-4 ${
          error.startsWith('✅') 
            ? 'bg-green-100 border-green-500 text-green-700' 
            : 'bg-red-100 border-red-500 text-red-700'
        }`}>
          <p>{error}</p>
        </div>
      )}
      
      {/* Loading indicator */}
      {isUploading && (
        <div className="mt-3 text-center">
          <div className="inline-block animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
          <p className="mt-2 text-indigo-600 font-medium">Processing GeoJSON...</p>
        </div>
      )}
    </div>
  );
} 