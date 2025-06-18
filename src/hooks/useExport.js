import { useState, useCallback } from 'react';
import { exportAsGeoJSON, exportAsShapefile, exportAsGeoPackage } from '@/lib/geo/exporters';
import { EXPORT_FORMATS } from '@/config/constants';

/**
 * Custom hook for managing data export operations
 * @returns {Object} Hook state and methods
 */
export function useExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);
  const [exportFormat, setExportFormat] = useState(EXPORT_FORMATS.GEOJSON);
  const [fileName, setFileName] = useState('generated_features');

  /**
   * Export features in the specified format
   * @param {Array} features - Features to export
   * @param {string} format - Export format (optional, uses current format if not provided)
   * @param {string} name - File name (optional, uses current fileName if not provided)
   */
  const exportFeatures = useCallback(async (features, format = null, name = null) => {
    if (!features || features.length === 0) {
      const error = 'No features to export. Please generate features first.';
      setExportError(error);
      throw new Error(error);
    }

    const exportFormat_ = format || exportFormat;
    const exportFileName = name || fileName || 'generated_features';
    
    setIsExporting(true);
    setExportError(null);

    try {
      console.log(`Exporting ${features.length} features as ${exportFormat_}`);
      
      switch (exportFormat_) {
        case EXPORT_FORMATS.GEOJSON:
          exportAsGeoJSON(features, exportFileName);
          break;
        case EXPORT_FORMATS.SHAPEFILE:
          await exportAsShapefile(features, exportFileName);
          break;
        case EXPORT_FORMATS.GEOPACKAGE:
          await exportAsGeoPackage(features, exportFileName);
          break;
        default:
          throw new Error(`Unsupported export format: ${exportFormat_}`);
      }
      
      console.log(`Successfully exported ${features.length} features as ${exportFormat_}`);
      return true;
    } catch (error) {
      console.error('Export error:', error);
      setExportError(error.message);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, [exportFormat, fileName]);

  /**
   * Quick export as GeoJSON
   * @param {Array} features - Features to export
   * @param {string} name - File name (optional)
   */
  const exportAsJSON = useCallback(async (features, name = null) => {
    return exportFeatures(features, EXPORT_FORMATS.GEOJSON, name);
  }, [exportFeatures]);

  /**
   * Quick export as Shapefile
   * @param {Array} features - Features to export
   * @param {string} name - File name (optional)
   */
  const exportAsShp = useCallback(async (features, name = null) => {
    return exportFeatures(features, EXPORT_FORMATS.SHAPEFILE, name);
  }, [exportFeatures]);

  /**
   * Quick export as GeoPackage
   * @param {Array} features - Features to export
   * @param {string} name - File name (optional)
   */
  const exportAsGpkg = useCallback(async (features, name = null) => {
    return exportFeatures(features, EXPORT_FORMATS.GEOPACKAGE, name);
  }, [exportFeatures]);

  /**
   * Clear export error
   */
  const clearError = useCallback(() => {
    setExportError(null);
  }, []);

  /**
   * Reset export state
   */
  const reset = useCallback(() => {
    setIsExporting(false);
    setExportError(null);
  }, []);

  return {
    // State
    isExporting,
    exportError,
    exportFormat,
    fileName,
    
    // Actions
    exportFeatures,
    exportAsJSON,
    exportAsShp,
    exportAsGpkg,
    setExportFormat,
    setFileName,
    clearError,
    reset,
    
    // Computed properties
    hasError: !!exportError,
    availableFormats: Object.values(EXPORT_FORMATS)
  };
} 