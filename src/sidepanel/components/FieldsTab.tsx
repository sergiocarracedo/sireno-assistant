import { useState, useEffect } from 'react';
import type { FieldRef } from '../../shared/types';

export default function FieldsTab() {
  const [fields, setFields] = useState<FieldRef[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    scanFields();
  }, []);

  const scanFields = async () => {
    setLoading(true);
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab.id) return;

      const response = await chrome.tabs.sendMessage(tab.id, {
        type: 'SCAN_FIELDS',
      });

      if (response?.fields) {
        setFields(response.fields);
      }
    } catch (error) {
      console.error('Failed to scan fields:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectMode = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) return;

    if (selectMode) {
      await chrome.tabs.sendMessage(tab.id, { type: 'EXIT_SELECT_MODE' });
      setSelectMode(false);
    } else {
      await chrome.tabs.sendMessage(tab.id, { type: 'ENTER_SELECT_MODE' });
      setSelectMode(true);
    }
  };

  const toggleField = (fieldId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(fieldId)) {
        next.delete(fieldId);
      } else {
        next.add(fieldId);
      }
      return next;
    });
  };

  const focusField = async (fieldId: string) => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab.id) return;

    await chrome.tabs.sendMessage(tab.id, {
      type: 'FOCUS_FIELD',
      fieldId,
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        <button className="button button-primary" onClick={scanFields} disabled={loading}>
          {loading ? 'Scanning...' : 'Scan Fields'}
        </button>
        <button
          className={`button ${selectMode ? 'button-primary' : 'button-secondary'}`}
          onClick={toggleSelectMode}
        >
          {selectMode ? 'Exit Select Mode' : 'Enter Select Mode'}
        </button>
      </div>

      <div style={{ marginBottom: '12px', fontSize: '14px', color: '#6b7280' }}>
        {fields.length} fields found, {selectedIds.size} selected
      </div>

      <div className="field-list">
        {fields.map((field) => (
          <div key={field.id} className="field-item">
            <input
              type="checkbox"
              checked={selectedIds.has(field.id)}
              onChange={() => toggleField(field.id)}
            />
            <div className="field-info">
              <div className="field-label">{field.labelHint}</div>
              <div className="field-meta">
                {field.kind}
                {field.inputType && ` · ${field.inputType}`}
                {field.value && ` · "${field.value.slice(0, 30)}..."`}
              </div>
            </div>
            <button
              className="button button-secondary"
              onClick={() => focusField(field.id)}
              style={{ padding: '4px 8px', fontSize: '12px' }}
            >
              Focus
            </button>
          </div>
        ))}
      </div>

      {fields.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '32px', color: '#9ca3af' }}>
          No fields found. Click "Scan Fields" to start.
        </div>
      )}
    </div>
  );
}
