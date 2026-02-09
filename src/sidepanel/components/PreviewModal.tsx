import type { LLMResponse } from '../../shared/types';

interface Props {
  response: LLMResponse;
  onApply: (response: LLMResponse) => void;
  onClose: () => void;
}

export default function PreviewModal({ response, onApply, onClose }: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Preview Changes</h2>

        {response.globalNotes && (
          <div className="success" style={{ marginBottom: '16px' }}>
            {response.globalNotes}
          </div>
        )}

        <table className="preview-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Action</th>
              <th>New Value</th>
            </tr>
          </thead>
          <tbody>
            {response.changes.map((change, idx) => (
              <tr key={idx}>
                <td>Field {change.fieldIndex}</td>
                <td style={{ textTransform: 'capitalize' }}>{change.action}</td>
                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {change.value || '(empty)'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: '24px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button className="button button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button button-primary" onClick={() => onApply(response)}>
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  );
}
