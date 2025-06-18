import { useState, useCallback } from 'react';
import { generatePoint, generateLine, generatePolygon } from '@/lib/geo/generators';

/**
 * Custom hook for managing feature generation state and operations
 * @returns {Object} Hook state and methods
 */
export function useFeatureGeneration() {
  const [generatedFeatures, setGeneratedFeatures] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Generate features based on provided options
   * @param {Object} options - Generation options
   * @param {string} options.geometryType - Type of geometry to generate
   * @param {number} options.quantity - Number of features to generate
   * @param {Array} options.customAttributes - Custom attribute definitions
   * @param {Object} options.lineLength - Line length constraints
   * @param {Object} options.polygonArea - Polygon area constraints
   * @param {string} options.generationArea - Area type for generation
   * @param {Object} options.drawnArea - Custom drawn area
   * @param {string} options.aiPrompt - AI prompt for contextual generation
   */
  const generate = useCallback(async (options) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      console.log('Starting feature generation with options:', options);
      
      const {
        geometryType,
        quantity = 50,
        customAttributes = [],
        lineLength = { min: 100, max: 1000 },
        polygonArea = { min: 1000, max: 10000 },
        generationArea = 'viewport',
        drawnArea = null,
        aiPrompt = ''
      } = options;

      let features = [];
      
      // Generate features based on geometry type
      switch (geometryType) {
        case 'point':
          features = generatePoint({
            quantity: Math.min(quantity, 50000),
            customAttributes,
            generationArea,
            drawnArea,
            aiPrompt
          });
          break;
        case 'line':
          features = generateLine({
            quantity: Math.min(quantity, 50000),
            customAttributes,
            lineLength,
            generationArea,
            drawnArea,
            aiPrompt
          });
          break;
        case 'polygon':
          features = generatePolygon({
            quantity: Math.min(quantity, 50000),
            customAttributes,
            polygonArea,
            generationArea,
            drawnArea,
            aiPrompt
          });
          break;
        default:
          throw new Error(`Unsupported geometry type: ${geometryType}`);
      }
      
      if (features && features.length > 0) {
        setGeneratedFeatures(features);
        console.log(`Successfully generated ${features.length} features`);
        return features;
      } else {
        throw new Error('No features were generated. Please check your settings and try again.');
      }
    } catch (err) {
      console.error('Error during feature generation:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * Clear all generated features
   */
  const clear = useCallback(() => {
    setGeneratedFeatures(null);
    setError(null);
  }, []);

  /**
   * Reset the generation state
   */
  const reset = useCallback(() => {
    setGeneratedFeatures(null);
    setError(null);
    setIsGenerating(false);
  }, []);

  return {
    generatedFeatures,
    isGenerating,
    error,
    generate,
    clear,
    reset,
    // Computed properties
    hasFeatures: generatedFeatures && generatedFeatures.length > 0,
    featureCount: generatedFeatures?.length || 0
  };
} 