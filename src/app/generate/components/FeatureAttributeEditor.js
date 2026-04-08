'use client';

import { useState, useRef, useEffect } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/outline';

// Define available attribute types and their options
const ATTRIBUTE_TYPES = [
  {
    id: 'nominal',
    name: 'Nominal (Categorical)',
    description: 'Discrete categories without order (e.g., land use types)'
  },
  {
    id: 'ordinal',
    name: 'Ordinal',
    description: 'Ordered categories (e.g., small/medium/large)'
  },
  {
    id: 'quantitative',
    name: 'Quantitative',
    description: 'Numerical values with range (e.g., population)'
  },
  {
    id: 'temporal',
    name: 'Temporal',
    description: 'Date and time values (e.g., construction date)'
  },
  {
    id: 'identifier',
    name: 'Identifier',
    description: 'Unique IDs or reference codes'
  }
];

/**
 * Component for creating and managing attributes for geospatial features
 */
export default function FeatureAttributeEditor({ 
  geometryType, 
  attributes = [], 
  onAttributesChange 
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [attributeName, setAttributeName] = useState('');
  const [attributeType, setAttributeType] = useState(ATTRIBUTE_TYPES[0].id);
  const [attributeDescription, setAttributeDescription] = useState('');
  const [attributeValues, setAttributeValues] = useState('');
  const [attributeMin, setAttributeMin] = useState(0);
  const [attributeMax, setAttributeMax] = useState(100);
  const [attributeUnit, setAttributeUnit] = useState('');
  const [attributeStartDate, setAttributeStartDate] = useState('');
  const [attributeEndDate, setAttributeEndDate] = useState('');
  const [attributePrefix, setAttributePrefix] = useState('');
  const [attributeDigits, setAttributeDigits] = useState(4);
  
  const formRef = useRef(null);

  // Initialize form with default values
  useEffect(() => {
    // Set default dates when the type changes to temporal
    if (attributeType === 'temporal' && !attributeStartDate && !attributeEndDate) {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      setAttributeStartDate(today.toISOString().split('T')[0]);
      setAttributeEndDate(tomorrow.toISOString().split('T')[0]);
    }
    
    // Set default values for nominal or ordinal attributes
    if ((attributeType === 'nominal' || attributeType === 'ordinal') && !attributeValues) {
      if (attributeType === 'nominal') {
        setAttributeValues('value1, value2, value3');
      } else {
        setAttributeValues('low, medium, high');
      }
    }
  }, [attributeType]);
  
  // Initialize form with values from an existing attribute
  const initializeFormWithAttribute = (attribute) => {
    setAttributeName(attribute.name);
    setAttributeType(attribute.type);
    setAttributeDescription(attribute.description || '');
    
    if (attribute.type === 'nominal' || attribute.type === 'ordinal') {
      setAttributeValues(attribute.values.join(', '));
    } else if (attribute.type === 'quantitative') {
      setAttributeMin(attribute.range.min);
      setAttributeMax(attribute.range.max);
      setAttributeUnit(attribute.range.unit || '');
    } else if (attribute.type === 'temporal') {
      setAttributeStartDate(attribute.range.start);
      setAttributeEndDate(attribute.range.end);
    } else if (attribute.type === 'identifier') {
      setAttributePrefix(attribute.format.prefix || '');
      setAttributeDigits(attribute.format.digits || 4);
    }
  };
  
  // Reset form fields
  const resetForm = () => {
    setAttributeName('');
    setAttributeType(ATTRIBUTE_TYPES[0].id);
    setAttributeDescription('');
    setAttributeValues('');
    setAttributeMin(0);
    setAttributeMax(100);
    setAttributeUnit('');
    
    // Reset dates to empty strings to trigger the useEffect when type changes
    setAttributeStartDate('');
    setAttributeEndDate('');
    
    setAttributePrefix('');
    setAttributeDigits(4);
    setEditingIndex(null);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    let attributeData = {
      name: attributeName,
      type: attributeType,
      description: attributeDescription
    };
    
    // Add type-specific data
    if (attributeType === 'nominal' || attributeType === 'ordinal') {
      attributeData.values = attributeValues
        .split(',')
        .map(val => val.trim())
        .filter(val => val !== '');
    } else if (attributeType === 'quantitative') {
      attributeData.range = {
        min: parseFloat(attributeMin),
        max: parseFloat(attributeMax),
        unit: attributeUnit
      };
    } else if (attributeType === 'temporal') {
      attributeData.range = {
        start: attributeStartDate,
        end: attributeEndDate
      };
    } else if (attributeType === 'identifier') {
      attributeData.format = {
        prefix: attributePrefix,
        digits: parseInt(attributeDigits)
      };
    }
    
    // Update attributes list
    let newAttributes = [...attributes];
    
    if (editingIndex !== null) {
      // Update existing attribute
      newAttributes[editingIndex] = attributeData;
    } else {
      // Add new attribute
      newAttributes.push(attributeData);
    }
    
    // Notify parent component
    onAttributesChange(newAttributes);
    
    // Reset form
    resetForm();
    setShowAddForm(false);
  };
  
  // Handle attribute removal
  const handleRemoveAttribute = (index) => {
    const newAttributes = [...attributes];
    newAttributes.splice(index, 1);
    onAttributesChange(newAttributes);
  };
  
  // Handle editing an attribute
  const handleEditAttribute = (index) => {
    setEditingIndex(index);
    initializeFormWithAttribute(attributes[index]);
    setShowAddForm(true);
    
    // Scroll to form
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  return (
    <div className="space-y-4 rounded-sm border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h3 className="text-base font-bold text-indigo-900">
            Custom attributes
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Optional. Define the properties each generated {geometryType} feature should include.
          </p>
        </div>
        {!showAddForm && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white font-medium text-sm border border-green-700 transition-colors flex items-center rounded-sm"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Attribute
            </button>
          </div>
        )}
      </div>
      
      {/* Attribute List */}
      {attributes.length > 0 ? (
        <ul className="space-y-3">
          {attributes.map((attribute, index) => (
            <li key={index} className="border border-indigo-200 bg-white p-4 hover:bg-indigo-50/40">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <div className="flex items-center flex-wrap gap-2">
                    <h4 className="font-semibold text-indigo-950">
                      {attribute.name}
                    </h4>
                    <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-sm">
                      {ATTRIBUTE_TYPES.find(t => t.id === attribute.type)?.name || attribute.type}
                    </span>
                  </div>
                  {attribute.description && (
                    <p className="text-sm text-indigo-700 mt-1">
                      {attribute.description}
                    </p>
                  )}
                  <div className="mt-2 text-xs text-slate-500">
                    {attribute.type === 'nominal' || attribute.type === 'ordinal' ? (
                      <span>Values: {attribute.values.join(', ')}</span>
                    ) : attribute.type === 'quantitative' ? (
                      <span>Range: {attribute.range.min} - {attribute.range.max} {attribute.range.unit}</span>
                    ) : attribute.type === 'temporal' ? (
                      <span>Period: {attribute.range.start} to {attribute.range.end}</span>
                    ) : attribute.type === 'identifier' ? (
                      <span>Format: {attribute.format.prefix}XXXXXX ({attribute.format.digits} digits)</span>
                    ) : null}
                  </div>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleEditAttribute(index)}
                    className="px-3 py-2 text-indigo-700 hover:text-indigo-900 font-medium border border-indigo-200 hover:border-indigo-400 bg-white rounded-sm"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttribute(index)}
                    className="p-2 text-red-600 hover:text-red-800 border border-red-200 hover:border-red-400 hover:bg-red-50 rounded-sm"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="border border-dashed border-indigo-300 p-5 text-center bg-slate-50">
          <p className="text-indigo-900 font-medium">No custom attributes yet</p>
          <p className="text-sm text-slate-500 mt-1">
            Add fields like `name`, `status`, `rating`, or `opened_date` to shape the output dataset.
          </p>
          {!showAddForm && (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="mt-4 inline-flex items-center rounded-sm border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Add first attribute
            </button>
          )}
        </div>
      )}
      
      {/* Add/Edit Attribute Form */}
      {showAddForm && (
        <div ref={formRef} className="mt-4 border border-indigo-200 p-4 bg-indigo-50">
          <h4 className="font-semibold text-indigo-950 mb-4">
            {editingIndex !== null ? 'Edit attribute' : 'Add attribute'}
          </h4>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="attribute-name" className="block text-sm font-medium text-indigo-900">
                  Attribute Name
                </label>
                <input
                  type="text"
                  id="attribute-name"
                  value={attributeName}
                  onChange={(e) => setAttributeName(e.target.value)}
                  className="mt-1 block w-full border border-indigo-200 p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="attribute-type" className="block text-sm font-medium text-indigo-900">
                  Attribute Type
                </label>
                <select
                  id="attribute-type"
                  value={attributeType}
                  onChange={(e) => setAttributeType(e.target.value)}
                  className="mt-1 block w-full border border-indigo-200 p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  {ATTRIBUTE_TYPES.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="attribute-description" className="block text-sm font-medium text-indigo-900">
                Description (optional)
              </label>
              <input
                type="text"
                id="attribute-description"
                value={attributeDescription}
                onChange={(e) => setAttributeDescription(e.target.value)}
                className="mt-1 block w-full border border-indigo-200 p-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            {/* Type-specific fields */}
            {(attributeType === 'nominal' || attributeType === 'ordinal') && (
              <div>
                <label htmlFor="attribute-values" className="block text-sm font-medium text-indigo-900">
                  Possible Values (comma-separated)
                </label>
                <textarea
                  id="attribute-values"
                  value={attributeValues}
                  onChange={(e) => setAttributeValues(e.target.value)}
                  className="mt-1 block w-full border border-indigo-200 p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  required
                  placeholder={attributeType === 'nominal' ? 'e.g. residential, commercial, industrial' : 'e.g. low, medium, high'}
                />
                <p className="text-xs text-indigo-500 mt-1">Enter comma-separated values</p>
              </div>
            )}
            
            {attributeType === 'quantitative' && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label htmlFor="attribute-min" className="block text-sm font-medium text-indigo-900">
                    Minimum Value
                  </label>
                  <input
                    type="number"
                    id="attribute-min"
                    value={attributeMin}
                    onChange={(e) => setAttributeMin(e.target.value)}
                    className="mt-1 block w-full border border-indigo-200 p-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="attribute-max" className="block text-sm font-medium text-indigo-900">
                    Maximum Value
                  </label>
                  <input
                    type="number"
                    id="attribute-max"
                    value={attributeMax}
                    onChange={(e) => setAttributeMax(e.target.value)}
                    className="mt-1 block w-full border border-indigo-200 p-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="attribute-unit" className="block text-sm font-medium text-indigo-900">
                    Unit (optional)
                  </label>
                  <input
                    type="text"
                    id="attribute-unit"
                    value={attributeUnit}
                    onChange={(e) => setAttributeUnit(e.target.value)}
                    className="mt-1 block w-full border border-indigo-200 p-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. km, m²"
                  />
                </div>
              </div>
            )}
            
            {attributeType === 'temporal' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="attribute-start-date" className="block text-sm font-medium text-indigo-900">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="attribute-start-date"
                    value={attributeStartDate}
                    onChange={(e) => setAttributeStartDate(e.target.value)}
                    className="mt-1 block w-full border border-indigo-200 p-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="attribute-end-date" className="block text-sm font-medium text-indigo-900">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="attribute-end-date"
                    value={attributeEndDate}
                    onChange={(e) => setAttributeEndDate(e.target.value)}
                    className="mt-1 block w-full border border-indigo-200 p-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
            )}
            
            {attributeType === 'identifier' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="attribute-prefix" className="block text-sm font-medium text-indigo-900">
                    Prefix (optional)
                  </label>
                  <input
                    type="text"
                    id="attribute-prefix"
                    value={attributePrefix}
                    onChange={(e) => setAttributePrefix(e.target.value)}
                    className="mt-1 block w-full border border-indigo-200 p-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g. ID-, POINT-"
                  />
                </div>
                
                <div>
                  <label htmlFor="attribute-digits" className="block text-sm font-medium text-indigo-900">
                    Number of Digits
                  </label>
                  <input
                    type="number"
                    id="attribute-digits"
                    value={attributeDigits}
                    onChange={(e) => setAttributeDigits(e.target.value)}
                    min="1"
                    max="12"
                    className="mt-1 block w-full border border-indigo-200 p-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
            )}
            
            {/* Form Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowAddForm(false);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 rounded-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white font-medium border border-indigo-700 hover:bg-indigo-500 transition-colors rounded-sm"
              >
                {editingIndex !== null ? 'Update attribute' : 'Add attribute'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 
