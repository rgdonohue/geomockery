'use client';

import { useState, useRef, useEffect } from 'react';

const ATTRIBUTE_TYPES = [
  { id: 'nominal',      name: 'Nominal',      short: 'nom' },
  { id: 'ordinal',      name: 'Ordinal',      short: 'ord' },
  { id: 'quantitative', name: 'Quantitative', short: 'num' },
  { id: 'temporal',     name: 'Temporal',     short: 'date' },
  { id: 'identifier',   name: 'Identifier',   short: 'id' },
];

const inputCls = 'w-full bg-slate-800 border border-slate-700 text-white px-2.5 py-1.5 text-sm focus:border-indigo-500 focus:outline-none';
const labelCls = 'block text-xs text-slate-500 mb-1';

export default function FeatureAttributeEditor({ geometryType, attributes = [], onAttributesChange }) {
  const [isOpen, setIsOpen]               = useState(false);
  const [showAddForm, setShowAddForm]     = useState(false);
  const [editingIndex, setEditingIndex]   = useState(null);

  // Form fields
  const [attributeName, setAttributeName]           = useState('');
  const [attributeType, setAttributeType]           = useState(ATTRIBUTE_TYPES[0].id);
  const [attributeDescription, setAttributeDescription] = useState('');
  const [attributeValues, setAttributeValues]       = useState('');
  const [attributeMin, setAttributeMin]             = useState(0);
  const [attributeMax, setAttributeMax]             = useState(100);
  const [attributeUnit, setAttributeUnit]           = useState('');
  const [attributeStartDate, setAttributeStartDate] = useState('');
  const [attributeEndDate, setAttributeEndDate]     = useState('');
  const [attributePrefix, setAttributePrefix]       = useState('');
  const [attributeDigits, setAttributeDigits]       = useState(4);

  const formRef = useRef(null);

  // Auto-open when attributes exist
  useEffect(() => {
    if (attributes.length > 0) setIsOpen(true);
  }, [attributes.length]);

  useEffect(() => {
    if (attributeType === 'temporal' && !attributeStartDate && !attributeEndDate) {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setAttributeStartDate(today.toISOString().split('T')[0]);
      setAttributeEndDate(tomorrow.toISOString().split('T')[0]);
    }
    if ((attributeType === 'nominal' || attributeType === 'ordinal') && !attributeValues) {
      setAttributeValues(attributeType === 'nominal' ? 'value1, value2, value3' : 'low, medium, high');
    }
  }, [attributeType]);

  const resetForm = () => {
    setAttributeName('');
    setAttributeType(ATTRIBUTE_TYPES[0].id);
    setAttributeDescription('');
    setAttributeValues('');
    setAttributeMin(0);
    setAttributeMax(100);
    setAttributeUnit('');
    setAttributeStartDate('');
    setAttributeEndDate('');
    setAttributePrefix('');
    setAttributeDigits(4);
    setEditingIndex(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let data = { name: attributeName, type: attributeType, description: attributeDescription };
    if (attributeType === 'nominal' || attributeType === 'ordinal') {
      data.values = attributeValues.split(',').map(v => v.trim()).filter(Boolean);
    } else if (attributeType === 'quantitative') {
      data.range = { min: parseFloat(attributeMin), max: parseFloat(attributeMax), unit: attributeUnit };
    } else if (attributeType === 'temporal') {
      data.range = { start: attributeStartDate, end: attributeEndDate };
    } else if (attributeType === 'identifier') {
      data.format = { prefix: attributePrefix, digits: parseInt(attributeDigits) };
    }
    const next = [...attributes];
    if (editingIndex !== null) next[editingIndex] = data;
    else next.push(data);
    onAttributesChange(next);
    resetForm();
    setShowAddForm(false);
  };

  const handleRemove = (index) => {
    const next = [...attributes];
    next.splice(index, 1);
    onAttributesChange(next);
  };

  const handleEdit = (index) => {
    const attr = attributes[index];
    setEditingIndex(index);
    setAttributeName(attr.name);
    setAttributeType(attr.type);
    setAttributeDescription(attr.description || '');
    if (attr.type === 'nominal' || attr.type === 'ordinal') setAttributeValues(attr.values.join(', '));
    else if (attr.type === 'quantitative') { setAttributeMin(attr.range.min); setAttributeMax(attr.range.max); setAttributeUnit(attr.range.unit || ''); }
    else if (attr.type === 'temporal') { setAttributeStartDate(attr.range.start); setAttributeEndDate(attr.range.end); }
    else if (attr.type === 'identifier') { setAttributePrefix(attr.format.prefix || ''); setAttributeDigits(attr.format.digits || 4); }
    setShowAddForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const attrSummary = (attr) => {
    if (attr.type === 'nominal' || attr.type === 'ordinal') return attr.values?.join(', ') || '—';
    if (attr.type === 'quantitative') return `${attr.range?.min}–${attr.range?.max}${attr.range?.unit ? ' ' + attr.range.unit : ''}`;
    if (attr.type === 'temporal') return `${attr.range?.start} → ${attr.range?.end}`;
    if (attr.type === 'identifier') return `${attr.format?.prefix || ''}${'0'.repeat(attr.format?.digits || 4)}`;
    return '';
  };

  return (
    <div>
      {/* Section header — always visible */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            Attributes
          </span>
          {attributes.length > 0 && (
            <span className="bg-indigo-900/60 border border-indigo-800 text-indigo-300 text-[9px] font-bold px-1.5 py-0.5">
              {attributes.length}
            </span>
          )}
        </div>
        <span className="text-slate-600 text-sm">{isOpen ? '−' : '+'}</span>
      </button>

      {isOpen && (
        <div className="mt-3 space-y-2">
          {/* Existing attributes */}
          {attributes.map((attr, i) => (
            <div key={i} className="flex items-start justify-between gap-2 bg-slate-800 border border-slate-700 px-3 py-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-200">{attr.name}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600 bg-slate-900 px-1.5 py-0.5">
                    {ATTRIBUTE_TYPES.find(t => t.id === attr.type)?.short || attr.type}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 truncate">{attrSummary(attr)}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleEdit(i)}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  className="text-xs text-slate-600 hover:text-red-400 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          {/* Add form */}
          {showAddForm ? (
            <div ref={formRef} className="bg-slate-800 border border-slate-700 p-3 space-y-3">
              <p className="text-xs font-semibold text-slate-400">
                {editingIndex !== null ? 'Edit attribute' : 'New attribute'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>Name</label>
                    <input type="text" value={attributeName} onChange={e => setAttributeName(e.target.value)}
                      className={inputCls} required placeholder="e.g. rating" />
                  </div>
                  <div>
                    <label className={labelCls}>Type</label>
                    <select value={attributeType} onChange={e => setAttributeType(e.target.value)} className={inputCls} required>
                      {ATTRIBUTE_TYPES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>

                {(attributeType === 'nominal' || attributeType === 'ordinal') && (
                  <div>
                    <label className={labelCls}>Values (comma-separated)</label>
                    <input type="text" value={attributeValues} onChange={e => setAttributeValues(e.target.value)}
                      className={inputCls} required
                      placeholder={attributeType === 'nominal' ? 'retail, office, industrial' : 'low, medium, high'} />
                  </div>
                )}

                {attributeType === 'quantitative' && (
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className={labelCls}>Min</label>
                      <input type="number" value={attributeMin} onChange={e => setAttributeMin(e.target.value)} className={inputCls} required />
                    </div>
                    <div>
                      <label className={labelCls}>Max</label>
                      <input type="number" value={attributeMax} onChange={e => setAttributeMax(e.target.value)} className={inputCls} required />
                    </div>
                    <div>
                      <label className={labelCls}>Unit</label>
                      <input type="text" value={attributeUnit} onChange={e => setAttributeUnit(e.target.value)}
                        className={inputCls} placeholder="km" />
                    </div>
                  </div>
                )}

                {attributeType === 'temporal' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={labelCls}>Start</label>
                      <input type="date" value={attributeStartDate} onChange={e => setAttributeStartDate(e.target.value)} className={inputCls} required />
                    </div>
                    <div>
                      <label className={labelCls}>End</label>
                      <input type="date" value={attributeEndDate} onChange={e => setAttributeEndDate(e.target.value)} className={inputCls} required />
                    </div>
                  </div>
                )}

                {attributeType === 'identifier' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className={labelCls}>Prefix</label>
                      <input type="text" value={attributePrefix} onChange={e => setAttributePrefix(e.target.value)}
                        className={inputCls} placeholder="ID-" />
                    </div>
                    <div>
                      <label className={labelCls}>Digits</label>
                      <input type="number" value={attributeDigits} min="1" max="12" onChange={e => setAttributeDigits(e.target.value)} className={inputCls} required />
                    </div>
                  </div>
                )}

                <div>
                  <label className={labelCls}>Description (optional)</label>
                  <input type="text" value={attributeDescription} onChange={e => setAttributeDescription(e.target.value)}
                    className={inputCls} placeholder="Short note about this field" />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button type="button"
                    onClick={() => { resetForm(); setShowAddForm(false); }}
                    className="text-xs text-slate-500 hover:text-slate-300 px-2 py-1.5 transition-colors">
                    Cancel
                  </button>
                  <button type="submit"
                    className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 transition-colors">
                    {editingIndex !== null ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="w-full text-left text-xs text-slate-600 hover:text-indigo-400 transition-colors py-1"
            >
              + Add attribute
            </button>
          )}
        </div>
      )}
    </div>
  );
}
