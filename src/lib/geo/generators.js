import * as turf from '@turf/turf';
import { getRandomFloat, getRandomInt, getRandomBoolean, getRandomArrayItem, getRandomId } from '@/lib/utils/random';

/**
 * Generate a random point within bounds and optionally within a constraining polygon
 */
export function generatePoint(bounds, attributes = [], constrainingPolygon = null) {
  let point;
  let attempts = 0;
  const maxAttempts = 100;
  
  do {
    const lon = getRandomFloat(bounds[0], bounds[2]);
    const lat = getRandomFloat(bounds[1], bounds[3]);
    point = turf.point([lon, lat]);
    attempts++;
    
    // If no constraining polygon or point is within it, we're done
    if (!constrainingPolygon) {
      break;
    } else {
      try {
        // Validate constraining polygon structure before using it
        if (!constrainingPolygon.geometry || !constrainingPolygon.geometry.coordinates) {
          console.warn('Constraining polygon missing geometry or coordinates, skipping constraint');
          break;
        }
        
        if (turf.booleanPointInPolygon(point, constrainingPolygon)) {
          break;
        }
      } catch (error) {
        console.warn('Error checking point in polygon:', error, 'Polygon:', constrainingPolygon);
        // If there's an error with the constraining polygon, just use the point
        break;
      }
    }
    
    // Avoid infinite loops
    if (attempts >= maxAttempts) {
      console.warn('Could not generate point within constraining polygon after', maxAttempts, 'attempts');
      return null;
    }
  } while (true);
  
  // Add custom properties
  point.properties = generateProperties(attributes);
  
  return point;
}

/**
 * Generate a random line within bounds and with specified length constraints
 */
export function generateLine(bounds, attributes = [], options = {}) {
  const {
    minLength = 100,
    maxLength = 1000,
    constrainingPolygon = null
  } = options;
  
  let line;
  let attempts = 0;
  const maxAttempts = 100;
  
  do {
    // Generate a random starting point
    const startPoint = generatePoint(bounds, [], constrainingPolygon);
    if (!startPoint) return null;
    
    // Generate random angle and length
    const angle = getRandomFloat(0, 360);
    const length = getRandomFloat(minLength, maxLength);
    
    // Calculate end point using turf.destination
    const endPoint = turf.destination(startPoint, length / 1000, angle); // length in km
    
    // Create line
    line = turf.lineString([
      startPoint.geometry.coordinates,
      endPoint.geometry.coordinates
    ]);
    
    attempts++;
    
    // If no constraining polygon or line is valid within it, we're done
    if (!constrainingPolygon || turf.booleanIntersects(line, constrainingPolygon)) {
      // Verify length is within constraints
      const lineLength = turf.length(line) * 1000; // Convert km to m
      if (lineLength >= minLength && lineLength <= maxLength) {
        break;
      }
    }
    
    // Avoid infinite loops
    if (attempts >= maxAttempts) {
      console.warn('Could not generate line with specified constraints after', maxAttempts, 'attempts');
      return null;
    }
  } while (true);
  
  // Add custom properties
  line.properties = generateProperties(attributes);
  
  // Add length property
  line.properties.length = turf.length(line) * 1000; // length in meters
  
  return line;
}

/**
 * Generate a random polygon within bounds and with specified area constraints
 */
export function generatePolygon(bounds, attributes = [], options = {}) {
  const {
    minArea = 1000,
    maxArea = 10000,
    constrainingPolygon = null
  } = options;
  
  let polygon;
  let attempts = 0;
  const maxAttempts = 100;
  
  do {
    // Generate a random center point
    const center = generatePoint(bounds, [], constrainingPolygon);
    if (!center) return null;
    
    // Calculate radius based on desired area (assuming roughly circular shape)
    // A = πr², so r = √(A/π)
    const targetArea = getRandomFloat(minArea, maxArea);
    const radius = Math.sqrt(targetArea / Math.PI);
    
    // Generate vertices around the center point
    const vertices = [];
    const numVertices = getRandomInt(6, 12); // Random number of vertices for natural look
    
    for (let i = 0; i < numVertices; i++) {
      const angle = (i * 360 / numVertices) + getRandomFloat(-10, 10); // Add some randomness
      const distance = radius * (1 + getRandomFloat(-0.2, 0.2)) / 1000; // Convert to km and add variation
      const vertex = turf.destination(center, distance, angle);
      vertices.push(vertex.geometry.coordinates);
    }
    
    // Close the polygon
    vertices.push(vertices[0]);
    
    // Create polygon
    polygon = turf.polygon([vertices]);
    
    attempts++;
    
    // Calculate area
    const area = turf.area(polygon);
    
    // Check if polygon meets constraints
    if (area >= minArea && area <= maxArea) {
      if (!constrainingPolygon || turf.booleanIntersects(polygon, constrainingPolygon)) {
        break;
      }
    }
    
    // Avoid infinite loops
    if (attempts >= maxAttempts) {
      console.warn('Could not generate polygon with specified constraints after', maxAttempts, 'attempts');
      return null;
    }
  } while (true);
  
  // Add custom properties
  polygon.properties = generateProperties(attributes);
  
  // Add area property
  polygon.properties.area = turf.area(polygon);
  
  return polygon;
}

/**
 * Generate properties based on attribute definitions
 */
function generateProperties(attributes) {
  const properties = {};
  
  for (const attr of attributes) {
    switch (attr.type) {
      case 'nominal':
        properties[attr.name] = getRandomArrayItem(attr.values);
        break;
        
      case 'ordinal':
        properties[attr.name] = getRandomArrayItem(attr.values);
        break;
        
      case 'quantitative':
        properties[attr.name] = getRandomFloat(attr.range.min, attr.range.max);
        if (attr.range.unit) {
          properties[`${attr.name}_unit`] = attr.range.unit;
        }
        break;
        
      case 'temporal':
        const startDate = new Date(attr.range.start);
        const endDate = new Date(attr.range.end);
        const randomDate = new Date(
          startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime())
        );
        properties[attr.name] = randomDate.toISOString();
        break;
        
      case 'identifier':
        properties[attr.name] = getRandomId(
          attr.format.digits || 6,
          attr.format.prefix || ''
        );
        break;
    }
  }
  
  return properties;
}

/**
 * Generates a batch of random features
 * @param {string} geometryType - The type of geometry to generate ('point', 'line', or 'polygon')
 * @param {number} count - Number of features to generate
 * @param {Object} options - Generation options
 * @param {Array} customAttributes - Custom attributes to apply to the features
 * @returns {Array} - Array of GeoJSON features
 */
export function generateFeatures(geometryType, count, options = {}, customAttributes = []) {
  const { 
    boundingBox, 
    minLength = 100, 
    maxLength = 1000,
    minArea = 1000,
    maxArea = 10000,
    constrainingPolygon 
  } = options;
  
  // Default bounding box if none provided (world extent)
  const bbox = boundingBox || [-180, -90, 180, 90];
  
  const features = [];
  
  for (let i = 0; i < count; i++) {
    let feature;
    
    if (geometryType === 'point') {
      feature = generatePoint(bbox, customAttributes, constrainingPolygon);
    } else if (geometryType === 'line') {
      feature = generateLine(bbox, customAttributes, {
        minLength,
        maxLength,
        constrainingPolygon
      });
    } else if (geometryType === 'polygon') {
      feature = generatePolygon(bbox, customAttributes, {
        minArea,
        maxArea,
        constrainingPolygon
      });
    }
    
    if (feature) {
      features.push(feature);
    }
  }
  
  return features;
} 