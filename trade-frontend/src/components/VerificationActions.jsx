// src/components/VerificationActions.jsx
import React, { useState } from 'react';

export const VerificationActions = ({ documentRecord, currentUser, onVerified }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Local check: Four-Eyes rule UI condition
  const isCreator = currentUser?.id === documentRecord?.createdByUserId;
  const isVerifier = currentUser?.role === 'COMPLIANCE_VERIFIER';
  const canApprove = isVerifier && !isCreator;

  const handleVerify = async (action) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:5000/api/v1/documents/${documentRecord.id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-role': currentUser.role,
        },
        body: JSON.stringify({
          action, // 'APPROVE' or 'REJECT'
          comments: `${action}d by ${currentUser.name || currentUser.role}`
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      if (onVerified) onVerified(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {error && <div style={styles.errorBar}>⚠️ {error}</div>}

      {isCreator && (
        <div style={styles.warningText}>
          ℹ️ Four-Eyes Rule: You created this record and cannot verify it.
        </div>
      )}

      <div style={styles.btnRow}>
        <button
          onClick={() => handleVerify('APPROVE')}
          disabled={!canApprove || loading}
          style={{ ...styles.approveBtn, opacity: !canApprove || loading ? 0.5 : 1 }}
        >
          {loading ? 'Processing...' : 'Approve'}
        </button>

        <button
          onClick={() => handleVerify('REJECT')}
          disabled={!canApprove || loading}
          style={{ ...styles.rejectBtn, opacity: !canApprove || loading ? 0.5 : 1 }}
        >
          Reject
        </button>
      </div>
    </div>
  );
};

// Styling styled to match your Register.jsx dark palette
const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' },
  errorBar: { backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '8px 12px', borderRadius: '6px', fontSize: '12px' },
  warningText: { color: '#fbbf24', fontSize: '11px' },
  btnRow: { display: 'flex', gap: '8px' },
  approveBtn: { padding: '8px 16px', borderRadius: '6px', backgroundColor: '#10b981', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '12px' },
  rejectBtn: { padding: '8px 16px', borderRadius: '6px', backgroundColor: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '12px' },
};