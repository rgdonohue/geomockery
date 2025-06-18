/**
 * AI Processing Utilities for Geomockery
 * Handles natural language prompt parsing and contextual attribute generation
 */

import { analyzePromptWithGeography, generatePreviewData } from '@/lib/ai/geoIntelligence.js';

// Common domain-specific keywords and their associated attributes
const DOMAIN_TEMPLATES = {
  // Commercial/Business
  restaurants: {
    geometryType: 'point',
    attributes: [
      { name: 'name', type: 'identifier', format: { prefix: '', digits: 0 }, values: ['Pizza Palace', 'Burger Barn', 'Taco Time', 'Sushi Spot', 'BBQ Pit', 'Cafe Corner'] },
      { name: 'cuisine_type', type: 'nominal', values: ['Italian', 'American', 'Mexican', 'Japanese', 'BBQ', 'Cafe', 'Mediterranean', 'Chinese', 'Thai', 'Indian'] },
      { name: 'rating', type: 'quantitative', range: { min: 1.0, max: 5.0, unit: 'stars' } },
      { name: 'price_range', type: 'ordinal', values: ['$', '$$', '$$$', '$$$$'] },
      { name: 'seating_capacity', type: 'quantitative', range: { min: 20, max: 200, unit: 'seats' } },
      { name: 'outdoor_seating', type: 'nominal', values: ['Yes', 'No'] }
    ]
  },
  'coffee shops': {
    geometryType: 'point',
    attributes: [
      { name: 'name', type: 'identifier', format: { prefix: '', digits: 0 }, values: ['Brew & Bean', 'Coffee Corner', 'Espresso Express', 'The Daily Grind', 'Roast House', 'Bean There'] },
      { name: 'wifi_available', type: 'nominal', values: ['Yes', 'No'] },
      { name: 'rating', type: 'quantitative', range: { min: 2.5, max: 5.0, unit: 'stars' } },
      { name: 'price_range', type: 'ordinal', values: ['$', '$$', '$$$'] },
      { name: 'seating_capacity', type: 'quantitative', range: { min: 10, max: 80, unit: 'seats' } },
      { name: 'drive_thru', type: 'nominal', values: ['Yes', 'No'] }
    ]
  },
  stores: {
    geometryType: 'point',
    attributes: [
      { name: 'store_name', type: 'identifier', format: { prefix: '', digits: 0 }, values: ['Quick Mart', 'Corner Store', 'City Market', 'Fresh Foods', 'Daily Needs', 'Shop & Go'] },
      { name: 'store_type', type: 'nominal', values: ['Grocery', 'Convenience', 'Department', 'Specialty', 'Pharmacy', 'Electronics'] },
      { name: 'square_footage', type: 'quantitative', range: { min: 500, max: 15000, unit: 'sq_ft' } },
      { name: 'employee_count', type: 'quantitative', range: { min: 3, max: 50, unit: 'employees' } },
      { name: 'parking_spaces', type: 'quantitative', range: { min: 10, max: 200, unit: 'spaces' } }
    ]
  },
  
  // Transportation
  roads: {
    geometryType: 'line',
    attributes: [
      { name: 'road_name', type: 'identifier', format: { prefix: '', digits: 0 }, values: ['Main St', 'Oak Ave', 'Park Blvd', 'River Rd', 'Hill Dr', 'Pine St'] },
      { name: 'road_type', type: 'nominal', values: ['Street', 'Avenue', 'Boulevard', 'Road', 'Drive', 'Lane', 'Highway'] },
      { name: 'speed_limit', type: 'ordinal', values: ['25 mph', '35 mph', '45 mph', '55 mph', '65 mph'] },
      { name: 'lanes', type: 'quantitative', range: { min: 1, max: 6, unit: 'lanes' } },
      { name: 'surface_type', type: 'nominal', values: ['Asphalt', 'Concrete', 'Gravel', 'Dirt'] }
    ]
  },
  trails: {
    geometryType: 'line',
    attributes: [
      { name: 'trail_name', type: 'identifier', format: { prefix: '', digits: 0 }, values: ['Nature Trail', 'River Walk', 'Mountain Path', 'Forest Loop', 'Scenic Route', 'Historic Trail'] },
      { name: 'difficulty', type: 'ordinal', values: ['Easy', 'Moderate', 'Difficult', 'Expert'] },
      { name: 'length_miles', type: 'quantitative', range: { min: 0.5, max: 15.0, unit: 'miles' } },
      { name: 'surface', type: 'nominal', values: ['Paved', 'Gravel', 'Dirt', 'Natural'] },
      { name: 'accessibility', type: 'nominal', values: ['Wheelchair Accessible', 'Limited Access', 'Not Accessible'] }
    ]
  },
  
  // Geographic/Administrative
  parks: {
    geometryType: 'polygon',
    attributes: [
      { name: 'park_name', type: 'identifier', format: { prefix: '', digits: 0 }, values: ['Central Park', 'Riverside Park', 'Oak Grove', 'Sunset Park', 'Memorial Park', 'City Commons'] },
      { name: 'park_type', type: 'nominal', values: ['City Park', 'State Park', 'National Park', 'Recreation Area', 'Nature Preserve'] },
      { name: 'area_acres', type: 'quantitative', range: { min: 1, max: 500, unit: 'acres' } },
      { name: 'facilities', type: 'nominal', values: ['Playground', 'Sports Fields', 'Trails', 'Picnic Areas', 'Swimming', 'Camping'] },
      { name: 'entrance_fee', type: 'nominal', values: ['Free', 'Paid'] }
    ]
  },
  neighborhoods: {
    geometryType: 'polygon',
    attributes: [
      { name: 'neighborhood_name', type: 'identifier', format: { prefix: '', digits: 0 }, values: ['Downtown', 'Riverside', 'Hilltop', 'Old Town', 'Westside', 'Oak Hill'] },
      { name: 'median_income', type: 'quantitative', range: { min: 30000, max: 120000, unit: 'USD' } },
      { name: 'population_density', type: 'quantitative', range: { min: 500, max: 8000, unit: 'per_sq_mile' } },
      { name: 'primary_zoning', type: 'nominal', values: ['Residential', 'Commercial', 'Mixed Use', 'Industrial'] },
      { name: 'walkability_score', type: 'quantitative', range: { min: 20, max: 100, unit: 'score' } }
    ]
  },
  
  // Utilities/Infrastructure  
  'cell towers': {
    geometryType: 'point',
    attributes: [
      { name: 'tower_id', type: 'identifier', format: { prefix: 'CT', digits: 6 } },
      { name: 'carrier', type: 'nominal', values: ['Verizon', 'AT&T', 'T-Mobile', 'Sprint', 'US Cellular'] },
      { name: 'height_feet', type: 'quantitative', range: { min: 80, max: 250, unit: 'feet' } },
      { name: 'technology', type: 'nominal', values: ['4G LTE', '5G', '3G', 'Mixed'] },
      { name: 'coverage_radius', type: 'quantitative', range: { min: 1, max: 25, unit: 'miles' } }
    ]
  },
  hospitals: {
    geometryType: 'point',
    attributes: [
      { name: 'hospital_name', type: 'identifier', format: { prefix: '', digits: 0 }, values: ['General Hospital', 'Memorial Medical', 'City Health Center', 'Regional Medical', 'Community Hospital'] },
      { name: 'hospital_type', type: 'nominal', values: ['General', 'Specialty', 'Emergency', 'Rehabilitation', 'Psychiatric'] },
      { name: 'bed_count', type: 'quantitative', range: { min: 50, max: 800, unit: 'beds' } },
      { name: 'trauma_level', type: 'ordinal', values: ['Level I', 'Level II', 'Level III', 'Level IV', 'Not Designated'] },
      { name: 'emergency_room', type: 'nominal', values: ['Yes', 'No'] }
    ]
  }
};

// Geometry type keywords
const GEOMETRY_KEYWORDS = {
  point: ['points', 'locations', 'places', 'spots', 'sites', 'stores', 'buildings', 'facilities', 'markers'],
  line: ['roads', 'streets', 'paths', 'trails', 'routes', 'lines', 'corridors', 'pipelines', 'cables'],
  polygon: ['areas', 'regions', 'zones', 'districts', 'neighborhoods', 'parks', 'lots', 'blocks', 'parcels']
};

// Quantity keywords
const QUANTITY_KEYWORDS = {
  few: 10,
  several: 25,
  many: 100,
  lots: 250,
  hundreds: 500,
  thousands: 2000
};

/**
 * Parse an AI prompt and extract relevant information
 * @param {string} prompt - The natural language prompt
 * @returns {Object} Parsed information including geometry type, attributes, and quantity
 */
export function parsePrompt(prompt) {
  if (!prompt || prompt.trim().length === 0) {
    return null;
  }

  const lowercasePrompt = prompt.toLowerCase();
  
  // Find domain template match
  let matchedTemplate = null;
  let matchedDomain = null;
  
  for (const [domain, template] of Object.entries(DOMAIN_TEMPLATES)) {
    if (lowercasePrompt.includes(domain)) {
      matchedTemplate = template;
      matchedDomain = domain;
      break;
    }
  }
  
  // Extract geometry type
  let geometryType = matchedTemplate?.geometryType || 'point';
  for (const [geomType, keywords] of Object.entries(GEOMETRY_KEYWORDS)) {
    if (keywords.some(keyword => lowercasePrompt.includes(keyword))) {
      geometryType = geomType;
      break;
    }
  }
  
  // Extract quantity
  let quantity = 50; // default
  
  // Look for explicit numbers first
  const numberMatch = prompt.match(/(\d+)/);
  if (numberMatch) {
    quantity = parseInt(numberMatch[1]);
  } else {
    // Look for quantity keywords
    for (const [keyword, value] of Object.entries(QUANTITY_KEYWORDS)) {
      if (lowercasePrompt.includes(keyword)) {
        quantity = value;
        break;
      }
    }
  }
  
  // Clamp quantity to reasonable limits
  quantity = Math.min(Math.max(quantity, 1), 50000);
  
  // Add geographic analysis
  const geoAnalysis = analyzePromptWithGeography(prompt);
  
  return {
    geometryType,
    quantity,
    attributes: matchedTemplate?.attributes || [],
    domain: matchedDomain,
    confidence: matchedTemplate ? 0.8 : 0.3,
    originalPrompt: prompt,
    geographic: geoAnalysis.geographic,
    mapSuggestions: geoAnalysis.mapSuggestions,
    hasLocationContext: geoAnalysis.hasLocationContext,
    locationMessage: geoAnalysis.locationMessage
  };
}

/**
 * Analyze a prompt and generate clarifying questions
 * @param {string} prompt - The natural language prompt
 * @returns {Object} Analysis with questions and suggestions
 */
export function analyzePromptForClarification(prompt) {
  const parsed = parsePrompt(prompt);
  
  if (!parsed) {
    return {
      needsClarification: true,
      questions: [
        "What type of features do you want to generate? (points, lines, or areas)",
        "How many features should be generated?",
        "What attributes should each feature have?"
      ],
      suggestions: [
        "Try: 'Generate 50 restaurants with ratings'",
        "Try: 'Create hiking trails with difficulty levels'",
        "Try: 'Make parks with facilities'"
      ]
    };
  }
  
  const questions = [];
  const suggestions = [];
  const clarifications = [];
  
  // Check if domain is unclear
  if (!parsed.domain) {
    questions.push("What type of features are these? (e.g., restaurants, roads, parks)");
    suggestions.push("Be more specific about the feature type for better attributes");
  }
  
  // Check if quantity is vague
  if (!prompt.match(/(\d+)/) && parsed.quantity === 50) {
    questions.push("How many features do you need?");
    clarifications.push({
      type: 'quantity',
      options: [
        { label: 'Small dataset (10-25)', value: 20 },
        { label: 'Medium dataset (50-100)', value: 75 },
        { label: 'Large dataset (200-500)', value: 350 },
        { label: 'Very large dataset (1000+)', value: 1500 }
      ]
    });
  }
  
  // Check for missing context
  const lowercasePrompt = prompt.toLowerCase();
  if (parsed.domain && !lowercasePrompt.includes('with') && !lowercasePrompt.includes('attribute')) {
    questions.push(`What specific information should each ${parsed.domain} feature have?`);
    if (parsed.attributes.length > 0) {
      suggestions.push(`I can add: ${parsed.attributes.slice(0, 3).map(a => a.name).join(', ')}`);
    }
  }
  
  // Geographic context
  if (!lowercasePrompt.includes('area') && !lowercasePrompt.includes('region') && !lowercasePrompt.includes('city')) {
    questions.push("Should these be generated in a specific area or region?");
    clarifications.push({
      type: 'area',
      options: [
        { label: 'Current map view', value: 'viewport' },
        { label: 'Draw custom area', value: 'draw' },
        { label: 'Upload boundary file', value: 'upload' }
      ]
    });
  }
  
  return {
    needsClarification: questions.length > 0,
    questions,
    suggestions,
    clarifications,
    parsedInfo: parsed,
    confidence: parsed.confidence
  };
}

/**
 * Generate a conversational response based on prompt analysis
 * @param {string} prompt - The user's prompt
 * @returns {Object} Conversational response with questions and preview
 */
export function generateConversationalResponse(prompt) {
  const analysis = analyzePromptForClarification(prompt);
  
  if (!analysis.parsedInfo) {
    return {
      type: 'need_more_info',
      message: "I'd like to help you generate some data! Could you tell me more about what you're looking for?",
      questions: analysis.questions,
      suggestions: analysis.suggestions
    };
  }
  
  const { parsedInfo } = analysis;
  
  if (analysis.needsClarification) {
    return {
      type: 'clarification',
      message: `I understand you want to generate ${parsedInfo.quantity} ${parsedInfo.geometryType} features${parsedInfo.domain ? ` for ${parsedInfo.domain}` : ''}. I have a few questions to make this perfect:`,
      questions: analysis.questions,
      clarifications: analysis.clarifications,
      preview: {
        geometryType: parsedInfo.geometryType,
        quantity: parsedInfo.quantity,
        domain: parsedInfo.domain,
        attributes: parsedInfo.attributes.slice(0, 5)
      }
    };
  }
  
  return {
    type: 'ready_to_generate',
    message: `Perfect! I'll generate ${parsedInfo.quantity} ${parsedInfo.geometryType} features for ${parsedInfo.domain} with ${parsedInfo.attributes.length} attributes.`,
    preview: {
      geometryType: parsedInfo.geometryType,
      quantity: parsedInfo.quantity,
      domain: parsedInfo.domain,
      attributes: parsedInfo.attributes
    },
    confidence: parsedInfo.confidence
  };
}

/**
 * Generate smart defaults based on a prompt
 * @param {string} prompt - The natural language prompt
 * @returns {Object} Default values for various generation parameters
 */
export function generateSmartDefaults(prompt) {
  const parsed = parsePrompt(prompt);
  
  if (!parsed) {
    return {
      geometryType: 'point',
      quantity: 50,
      customAttributes: []
    };
  }
  
  const defaults = {
    geometryType: parsed.geometryType,
    quantity: parsed.quantity,
    customAttributes: parsed.attributes
  };
  
  // Add geometry-specific defaults
  if (parsed.geometryType === 'line') {
    if (parsed.domain === 'roads') {
      defaults.lineLength = { min: 100, max: 2000 };
    } else if (parsed.domain === 'trails') {
      defaults.lineLength = { min: 500, max: 5000 };
    }
  }
  
  if (parsed.geometryType === 'polygon') {
    if (parsed.domain === 'parks') {
      defaults.polygonArea = { min: 5000, max: 100000 };
    } else if (parsed.domain === 'neighborhoods') {
      defaults.polygonArea = { min: 50000, max: 500000 };
    }
  }
  
  return defaults;
}

/**
 * Get example prompts for different categories
 * @returns {Object} Categorized example prompts
 */
export function getExamplePrompts() {
  return {
    business: [
      "Generate 50 coffee shops in downtown with ratings and wifi info",
      "Create 100 restaurants with cuisine types and price ranges",
      "Make 25 stores with employee counts and square footage"
    ],
    transportation: [
      "Generate road network with speed limits and lane counts", 
      "Create hiking trails with difficulty levels and lengths",
      "Make 200 roads with surface types and names"
    ],
    geographic: [
      "Generate 15 parks with acreage and facility information",
      "Create neighborhoods with income and zoning data",
      "Make 50 districts with population density info"
    ],
    infrastructure: [
      "Generate 30 cell towers with carrier and coverage data",
      "Create hospitals with bed counts and trauma levels",
      "Make 100 utility points with service types"
    ]
  };
}

/**
 * Generate preview data with geographic context
 * @param {string} prompt - The user's prompt
 * @returns {Object} Preview GeoJSON data with map suggestions
 */
export function generatePreviewWithGeography(prompt) {
  const parsed = parsePrompt(prompt);
  
  if (!parsed) {
    return null;
  }
  
  const previewData = generatePreviewData(parsed, parsed.geographic);
  
  return {
    geoJSON: previewData,
    mapSuggestions: parsed.mapSuggestions,
    hasLocationContext: parsed.hasLocationContext,
    locationMessage: parsed.locationMessage,
    parsedInfo: parsed
  };
}

/**
 * Validate if a prompt can be processed
 * @param {string} prompt - The prompt to validate
 * @returns {Object} Validation result with success flag and message
 */
export function validatePrompt(prompt) {
  if (!prompt || prompt.trim().length === 0) {
    return {
      isValid: false,
      message: "Please enter a description of the dataset you want to generate"
    };
  }
  
  if (prompt.length > 500) {
    return {
      isValid: false,
      message: "Prompt is too long. Please keep it under 500 characters."
    };
  }
  
  const parsed = parsePrompt(prompt);
  
  if (!parsed || parsed.confidence < 0.3) {
    return {
      isValid: true,
      message: "Prompt will use basic generation - try including specific feature types like 'restaurants', 'roads', or 'parks' for better results",
      warning: true
    };
  }
  
  return {
    isValid: true,
    message: `Detected ${parsed.domain || 'generic'} dataset with ${parsed.quantity} ${parsed.geometryType} features`,
    confidence: parsed.confidence
  };
}

export default {
  parsePrompt,
  analyzePromptForClarification,
  generateConversationalResponse,
  generateSmartDefaults,
  getExamplePrompts,
  validatePrompt,
  generatePreviewWithGeography
}; 