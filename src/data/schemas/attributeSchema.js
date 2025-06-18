import { ATTRIBUTE_TYPES } from '@/config/constants';

/**
 * Schema definition for feature attributes
 */
export const AttributeSchema = {
  name: {
    type: 'string',
    required: true,
    minLength: 1,
    maxLength: 100
  },
  type: {
    type: 'string',
    required: true,
    enum: Object.values(ATTRIBUTE_TYPES)
  },
  options: {
    type: 'array',
    required: false,
    description: 'Available options for nominal/ordinal types'
  },
  range: {
    type: 'object',
    required: false,
    properties: {
      min: { type: 'number' },
      max: { type: 'number' }
    },
    description: 'Range for quantitative types'
  },
  format: {
    type: 'string',
    required: false,
    description: 'Format pattern for identifiers and temporal types'
  }
};

/**
 * Validate an attribute configuration
 * @param {Object} attribute - Attribute to validate
 * @returns {Object} Validation result
 */
export function validateAttribute(attribute) {
  const errors = [];
  
  // Required fields
  if (!attribute.name || typeof attribute.name !== 'string') {
    errors.push('Attribute name is required and must be a string');
  }
  
  if (!attribute.type || !Object.values(ATTRIBUTE_TYPES).includes(attribute.type)) {
    errors.push(`Attribute type must be one of: ${Object.values(ATTRIBUTE_TYPES).join(', ')}`);
  }
  
  // Type-specific validation
  if (attribute.type === ATTRIBUTE_TYPES.NOMINAL || attribute.type === ATTRIBUTE_TYPES.ORDINAL) {
    if (!attribute.options || !Array.isArray(attribute.options) || attribute.options.length === 0) {
      errors.push(`${attribute.type} attributes must have at least one option`);
    }
  }
  
  if (attribute.type === ATTRIBUTE_TYPES.QUANTITATIVE) {
    if (attribute.range && (typeof attribute.range.min !== 'number' || typeof attribute.range.max !== 'number')) {
      errors.push('Quantitative attributes must have numeric min and max values');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate a default attribute configuration
 * @param {string} type - Attribute type
 * @returns {Object} Default attribute configuration
 */
export function createDefaultAttribute(type) {
  const base = {
    name: `attribute_${Date.now()}`,
    type
  };
  
  switch (type) {
    case ATTRIBUTE_TYPES.NOMINAL:
      return {
        ...base,
        options: ['Option 1', 'Option 2', 'Option 3']
      };
    
    case ATTRIBUTE_TYPES.ORDINAL:
      return {
        ...base,
        options: ['Low', 'Medium', 'High']
      };
    
    case ATTRIBUTE_TYPES.QUANTITATIVE:
      return {
        ...base,
        range: { min: 0, max: 100 }
      };
    
    case ATTRIBUTE_TYPES.TEMPORAL:
      return {
        ...base,
        format: 'YYYY-MM-DD'
      };
    
    case ATTRIBUTE_TYPES.IDENTIFIER:
      return {
        ...base,
        format: 'ID_{####}'
      };
    
    default:
      return base;
  }
} 