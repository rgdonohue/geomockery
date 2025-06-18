/**
 * Geographic Intelligence for Geomockery
 * Extracts locations from prompts and provides map coordinates
 */

// Common place types and their typical geographic patterns
const PLACE_PATTERNS = {
  cities: [
    'new york', 'los angeles', 'chicago', 'houston', 'phoenix', 'philadelphia', 
    'san antonio', 'san diego', 'dallas', 'san jose', 'austin', 'jacksonville',
    'fort worth', 'columbus', 'charlotte', 'san francisco', 'indianapolis',
    'seattle', 'denver', 'washington', 'boston', 'el paso', 'detroit', 'nashville',
    'portland', 'memphis', 'oklahoma city', 'las vegas', 'louisville', 'baltimore',
    'milwaukee', 'albuquerque', 'tucson', 'fresno', 'mesa', 'sacramento',
    'atlanta', 'kansas city', 'colorado springs', 'omaha', 'raleigh', 'miami',
    'virginia beach', 'oakland', 'minneapolis', 'tulsa', 'arlington', 'tampa',
    'new orleans', 'wichita', 'cleveland', 'bakersfield', 'aurora', 'anaheim',
    'honolulu', 'santa ana', 'riverside', 'corpus christi', 'lexington', 'stockton',
    'henderson', 'saint paul', 'st paul', 'cincinnati', 'pittsburgh'
  ],
  states: [
    'alabama', 'alaska', 'arizona', 'arkansas', 'california', 'colorado', 'connecticut',
    'delaware', 'florida', 'georgia', 'hawaii', 'idaho', 'illinois', 'indiana', 'iowa',
    'kansas', 'kentucky', 'louisiana', 'maine', 'maryland', 'massachusetts', 'michigan',
    'minnesota', 'mississippi', 'missouri', 'montana', 'nebraska', 'nevada', 'new hampshire',
    'new jersey', 'new mexico', 'new york', 'north carolina', 'north dakota', 'ohio',
    'oklahoma', 'oregon', 'pennsylvania', 'rhode island', 'south carolina', 'south dakota',
    'tennessee', 'texas', 'utah', 'vermont', 'virginia', 'washington', 'west virginia',
    'wisconsin', 'wyoming'
  ],
  neighborhoods: [
    'downtown', 'city center', 'central', 'midtown', 'uptown', 'old town', 'historic district',
    'financial district', 'arts district', 'warehouse district', 'waterfront', 'riverside',
    'hillside', 'westside', 'eastside', 'northside', 'southside', 'suburbs', 'suburban'
  ],
  regions: [
    'bay area', 'silicon valley', 'wine country', 'pacific northwest', 'new england',
    'great lakes', 'gulf coast', 'east coast', 'west coast', 'midwest', 'southwest',
    'southeast', 'northeast', 'mountain west', 'central valley', 'inland empire'
  ]
};

// Approximate bounding boxes for major US cities (for demo purposes)
const CITY_BOUNDS = {
  'seattle': [-122.4596, 47.4810, -122.2247, 47.7341],
  'portland': [-122.7658, 45.4215, -122.4787, 45.6509],
  'san francisco': [-122.5366, 37.7071, -122.3516, 37.8085],
  'los angeles': [-118.6681, 33.7037, -117.9143, 34.3373],
  'san diego': [-117.2713, 32.5343, -116.9325, 32.9853],
  'denver': [-105.1178, 39.6143, -104.8656, 39.9142],
  'austin': [-97.9383, 30.0986, -97.5753, 30.5168],
  'dallas': [-96.9991, 32.6177, -96.5991, 32.9177],
  'houston': [-95.6890, 29.5003, -95.0890, 30.1003],
  'chicago': [-87.9073, 41.6441, -87.5073, 42.0441],
  'new york': [-74.2591, 40.4774, -73.7004, 40.9176],
  'boston': [-71.1912, 42.2279, -70.9112, 42.4279],
  'washington': [-77.1198, 38.8016, -76.9098, 39.0016],
  'atlanta': [-84.6378, 33.6490, -84.2378, 33.8490],
  'miami': [-80.4376, 25.6586, -80.1376, 25.8586],
  'phoenix': [-112.3740, 33.2106, -111.8740, 33.7106],
  'las vegas': [-115.3738, 36.0395, -114.8738, 36.2895]
};

// State bounding boxes (simplified)
const STATE_BOUNDS = {
  'california': [-124.409591, 32.534156, -114.131211, 42.009518],
  'texas': [-106.645646, 25.837377, -93.508292, 36.500704],
  'florida': [-87.634938, 24.396308, -79.974306, 31.000888],
  'new york': [-79.762152, 40.496103, -71.856214, 45.015865],
  'washington': [-124.848974, 45.543541, -116.915989, 49.002494],
  'oregon': [-124.703541, 41.991794, -116.463504, 46.292035],
  'colorado': [-109.060253, 36.992426, -102.041524, 41.003444],
  'arizona': [-114.81651, 31.332177, -109.045223, 37.00426],
  'nevada': [-120.005746, 35.001857, -114.039648, 42.002207],
  'utah': [-114.052962, 36.997968, -109.041058, 42.001567]
};

/**
 * Extract geographic information from a prompt
 * @param {string} prompt - The user's prompt
 * @returns {Object} Geographic information including locations and bounds
 */
export function extractGeographicInfo(prompt) {
  const lowercasePrompt = prompt.toLowerCase();
  const locations = [];
  
  // Extract cities
  for (const city of PLACE_PATTERNS.cities) {
    if (lowercasePrompt.includes(city)) {
      locations.push({
        type: 'city',
        name: city,
        bounds: CITY_BOUNDS[city] || null,
        confidence: 0.8
      });
    }
  }
  
  // Extract states
  for (const state of PLACE_PATTERNS.states) {
    if (lowercasePrompt.includes(state)) {
      locations.push({
        type: 'state',
        name: state,
        bounds: STATE_BOUNDS[state] || null,
        confidence: 0.7
      });
    }
  }
  
  // Extract neighborhoods/districts
  for (const neighborhood of PLACE_PATTERNS.neighborhoods) {
    if (lowercasePrompt.includes(neighborhood)) {
      locations.push({
        type: 'neighborhood',
        name: neighborhood,
        bounds: null, // Would need city context
        confidence: 0.6
      });
    }
  }
  
  // Extract regions
  for (const region of PLACE_PATTERNS.regions) {
    if (lowercasePrompt.includes(region)) {
      locations.push({
        type: 'region',
        name: region,
        bounds: null, // Would need broader geographic data
        confidence: 0.5
      });
    }
  }
  
  // Sort by confidence and specificity (cities first, then states, etc.)
  locations.sort((a, b) => {
    const typeOrder = { city: 4, state: 3, neighborhood: 2, region: 1 };
    if (typeOrder[a.type] !== typeOrder[b.type]) {
      return typeOrder[b.type] - typeOrder[a.type];
    }
    return b.confidence - a.confidence;
  });
  
  return {
    locations,
    hasGeographicContext: locations.length > 0,
    primaryLocation: locations[0] || null,
    suggestedBounds: locations[0]?.bounds || null
  };
}

/**
 * Generate map suggestions based on geographic context
 * @param {Object} geoInfo - Geographic information from extractGeographicInfo
 * @returns {Object} Map configuration suggestions
 */
export function generateMapSuggestions(geoInfo) {
  if (!geoInfo.hasGeographicContext) {
    return {
      shouldSetLocation: false,
      bounds: null,
      zoomLevel: null,
      centerPoint: null,
      message: null
    };
  }
  
  const primary = geoInfo.primaryLocation;
  
  if (primary.bounds) {
    const bounds = primary.bounds;
    const centerLon = (bounds[0] + bounds[2]) / 2;
    const centerLat = (bounds[1] + bounds[3]) / 2;
    
    // Suggest zoom level based on location type
    let zoomLevel = 10; // default
    switch (primary.type) {
      case 'city':
        zoomLevel = 11;
        break;
      case 'state':
        zoomLevel = 7;
        break;
      case 'neighborhood':
        zoomLevel = 13;
        break;
      case 'region':
        zoomLevel = 6;
        break;
    }
    
    return {
      shouldSetLocation: true,
      bounds,
      zoomLevel,
      centerPoint: [centerLon, centerLat],
      message: `I'll focus the map on ${primary.name} (${primary.type})`
    };
  }
  
  return {
    shouldSetLocation: false,
    bounds: null,
    zoomLevel: null,
    centerPoint: null,
    message: `I detected "${primary.name}" but need more specific location data for map positioning`
  };
}

/**
 * Generate a preview dataset based on prompt analysis
 * @param {Object} promptAnalysis - Parsed prompt information
 * @param {Object} geoInfo - Geographic information
 * @param {number} previewCount - Number of preview features (default 5-10)
 * @returns {Object} Preview GeoJSON data
 */
export function generatePreviewData(promptAnalysis, geoInfo, previewCount = 8) {
  if (!promptAnalysis || !geoInfo.suggestedBounds) {
    return null;
  }
  
  const bounds = geoInfo.suggestedBounds;
  const features = [];
  
  // Generate a small number of preview features
  for (let i = 0; i < previewCount; i++) {
    const lon = bounds[0] + Math.random() * (bounds[2] - bounds[0]);
    const lat = bounds[1] + Math.random() * (bounds[3] - bounds[1]);
    
    let feature;
    
    switch (promptAnalysis.geometryType) {
      case 'point':
        feature = {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [lon, lat]
          },
          properties: {
            preview: true,
            ...generatePreviewProperties(promptAnalysis)
          }
        };
        break;
        
      case 'line':
        const endLon = lon + (Math.random() - 0.5) * 0.01;
        const endLat = lat + (Math.random() - 0.5) * 0.01;
        feature = {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [[lon, lat], [endLon, endLat]]
          },
          properties: {
            preview: true,
            ...generatePreviewProperties(promptAnalysis)
          }
        };
        break;
        
      case 'polygon':
        const size = 0.002 + Math.random() * 0.003;
        const points = [];
        for (let j = 0; j < 6; j++) {
          const angle = (j / 6) * 2 * Math.PI;
          const pLon = lon + Math.cos(angle) * size;
          const pLat = lat + Math.sin(angle) * size;
          points.push([pLon, pLat]);
        }
        points.push(points[0]); // Close the polygon
        
        feature = {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [points]
          },
          properties: {
            preview: true,
            ...generatePreviewProperties(promptAnalysis)
          }
        };
        break;
        
      default:
        continue;
    }
    
    if (feature) {
      features.push(feature);
    }
  }
  
  return {
    type: 'FeatureCollection',
    features,
    metadata: {
      preview: true,
      location: geoInfo.primaryLocation,
      bounds: geoInfo.suggestedBounds
    }
  };
}

/**
 * Generate preview properties based on prompt analysis
 * @param {Object} promptAnalysis - Parsed prompt information
 * @returns {Object} Sample properties
 */
function generatePreviewProperties(promptAnalysis) {
  const properties = {};
  
  if (promptAnalysis.attributes && promptAnalysis.attributes.length > 0) {
    // Generate sample values for the first few attributes
    promptAnalysis.attributes.slice(0, 3).forEach(attr => {
      switch (attr.type) {
        case 'nominal':
          properties[attr.name] = attr.values ? 
            attr.values[Math.floor(Math.random() * attr.values.length)] : 
            'Sample Value';
          break;
        case 'quantitative':
          if (attr.range) {
            const value = attr.range.min + Math.random() * (attr.range.max - attr.range.min);
            properties[attr.name] = Math.round(value * 10) / 10;
          } else {
            properties[attr.name] = Math.round(Math.random() * 100);
          }
          break;
        case 'ordinal':
          properties[attr.name] = attr.values ? 
            attr.values[Math.floor(Math.random() * attr.values.length)] : 
            'Medium';
          break;
        case 'identifier':
          properties[attr.name] = attr.values ? 
            attr.values[Math.floor(Math.random() * attr.values.length)] : 
            `Sample-${Math.floor(Math.random() * 1000)}`;
          break;
        default:
          properties[attr.name] = 'Preview';
      }
    });
  }
  
  return properties;
}

/**
 * Analyze a prompt for geographic and feature intelligence
 * @param {string} prompt - The user's prompt
 * @returns {Object} Combined analysis with geography and features
 */
export function analyzePromptWithGeography(prompt) {
  const geoInfo = extractGeographicInfo(prompt);
  const mapSuggestions = generateMapSuggestions(geoInfo);
  
  return {
    geographic: geoInfo,
    mapSuggestions,
    hasLocationContext: geoInfo.hasGeographicContext,
    locationMessage: mapSuggestions.message
  };
}

export default {
  extractGeographicInfo,
  generateMapSuggestions,
  generatePreviewData,
  analyzePromptWithGeography
}; 