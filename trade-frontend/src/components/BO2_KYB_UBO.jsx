import React, { useState } from 'react';

export default function BO2_KYB_UBO({ onSubmit, onBack }) {
  // Form State
  const [tradeLicenceNo, setTradeLicenceNo] = useState('');
  const [tradeLicenceExpiry, setTradeLicenceExpiry] = useState('');
  const [tradeLicenceDoc, setTradeLicenceDoc] = useState(null);

  const [vatTrn, setVatTrn] = useState('');
  const [vatDoc, setVatDoc] = useState(null);

  const [signatoryName, setSignatoryName] = useState('');
  const [signatoryPosition, setSignatoryPosition] = useState('');
  const [proofOfAuthDoc, setProofOfAuthDoc] = useState(null);

  // UBO array (repeating entity, initialised with 1 default entry)
  const [ubos, setUbos] = useState([
    { id: Date.now(), name: '', shareholdingPercent: '', idDocument: null }
  ]);

  const [error, setError] = useState('');

  // UBO Array Handlers
  const handleAddUbo = () => {
    setUbos([...ubos, { id: Date.now(), name: '', shareholdingPercent: '', idDocument: null }]);
  };

  const handleRemoveUbo = (id) => {
    if (ubos.length === 1) return;
    setUbos(ubos.filter((ubo) => ubo.id !== id));
  };

  const handleUboChange = (id, field, value) => {
    setUbos(ubos.map((ubo) => (ubo.id === id ? { ...ubo, [field]: value } : ubo)));
  };

  // Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Verification Checks
    if (!tradeLicenceExpiry) {
      setError('Trade licence expiry date is required for compliance tracking.');
      return;
    }

    const payload = {
      tradeLicence: {
        number: tradeLicenceNo,
        expiryDate: tradeLicenceExpiry,
        document: tradeLicenceDoc
      },
      vatTrn: {
        number: vatTrn,
        document: vatDoc
      },
      authorisedSignatory: {
        name: signatoryName,
        position: signatoryPosition,
        proofOfAuthorityDoc: proofOfAuthDoc
      },
      ultimateBeneficialOwners: ubos
    };

    if (onSubmit) onSubmit(payload);
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.stepBadge}>BUYER ONBOARDING · STEP 2 OF 6</span>
        <h2 style={styles.title}>BO-2 · KYB & Ultimate Beneficial Ownership (UBO)</h2>
        <p style={styles.subtitle}>Capturing structural ownership, trade licensing, and authority verification.</p>
      </div>

      {error && <div style={styles.errorAlert}>⚠️ {error}</div>}

      <form onSubmit={handleSubmit} style={styles.formStack}>
        {/* Section 1: Trade Licence & Tax */}
        <div style={styles.sectionGroup}>
          <h3 style={styles.sectionTitle}>1. Corporate Trade Licence & VAT</h3>
          
          <div style={styles.rowTwoCol}>
            <div style={styles.field}>
              <label style={styles.label}>Trade Licence No. *</label>
              <input
                type="text"
                required
                placeholder="e.g. ADGM-TRD-2026-9901"
                value={tradeLicenceNo}
                onChange={(e) => setTradeLicenceNo(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Licence Expiry Date *</label>
              <input
                type="date"
                required
                value={tradeLicenceExpiry}
                onChange={(e) => setTradeLicenceExpiry(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Upload Trade Licence Document *</label>
            <input
              type="file"
              required
              accept="image/*,application/pdf"
              onChange={(e) => setTradeLicenceDoc(e.target.files[0])}
              style={styles.fileInput}
            />
          </div>

          <div style={styles.rowTwoCol}>
            <div style={styles.field}>
              <label style={styles.label}>VAT / TRN Registration *</label>
              <input
                type="text"
                required
                placeholder="Tax Registration Number"
                value={vatTrn}
                onChange={(e) => setVatTrn(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Upload VAT/TRN Cert *</label>
              <input
                type="file"
                required
                accept="image/*,application/pdf"
                onChange={(e) => setVatDoc(e.target.files[0])}
                style={styles.fileInput}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Ultimate Beneficial Owners (UBO) */}
        <div style={styles.sectionGroup}>
          <div style={styles.sectionHeaderFlex}>
            <h3 style={styles.sectionTitle}>2. Ultimate Beneficial Owners (UBO)</h3>
            <span style={styles.helperBadge}>All holders above threshold</span>
          </div>

          {ubos.map((ubo, index) => (
            <div key={ubo.id} style={styles.uboBox}>
              <div style={styles.uboBoxHeader}>
                <span style={styles.uboIndex}>Owner #{index + 1}</span>
                {ubos.length > 1 && (
                  <button type="button" onClick={() => handleRemoveUbo(ubo.id)} style={styles.removeBtn}>
                    ✕ Remove
                  </button>
                )}
              </div>

              <div style={styles.rowTwoCol}>
                <div style={styles.field}>
                  <label style={styles.label}>Owner Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="As listed on Passport / ID"
                    value={ubo.name}
                    onChange={(e) => handleUboChange(ubo.id, 'name', e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Ownership % *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    placeholder="e.g. 51"
                    value={ubo.shareholdingPercent}
                    onChange={(e) => handleUboChange(ubo.id, 'shareholdingPercent', e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Upload Passport / ID Document *</label>
                <input
                  type="file"
                  required
                  accept="image/*,application/pdf"
                  onChange={(e) => handleUboChange(ubo.id, 'idDocument', e.target.files[0])}
                  style={styles.fileInput}
                />
              </div>
            </div>
          ))}

          <button type="button" onClick={handleAddUbo} style={styles.addUboBtn}>
            + Add Beneficial Owner
          </button>
        </div>

        {/* Section 3: Authorised Signatory */}
        <div style={styles.sectionGroup}>
          <h3 style={styles.sectionTitle}>3. Authorised Signatory & Proof of Authority</h3>

          <div style={styles.rowTwoCol}>
            <div style={styles.field}>
              <label style={styles.label}>Signatory Full Name *</label>
              <input
                type="text"
                required
                placeholder="Name of authorised official"
                value={signatoryName}
                onChange={(e) => setSignatoryName(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Position / Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Managing Director / CEO"
                value={signatoryPosition}
                onChange={(e) => setSignatoryPosition(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Proof of Authority (Board Resolution / Power of Attorney) *</label>
            <input
              type="file"
              required
              accept="image/*,application/pdf"
              onChange={(e) => setProofOfAuthDoc(e.target.files[0])}
              style={styles.fileInput}
            />
          </div>
        </div>

        {/* Navigation Actions */}
        <div style={styles.actionRow}>
          {onBack && (
            <button type="button" onClick={onBack} style={styles.backBtn}>
              Back
            </button>
          )}
          <button type="submit" style={styles.submitBtn}>
            Continue to Import Auth (Step 3) →
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '12px',
    padding: '24px',
    color: '#ffffff',
    maxWidth: '680px',
    margin: '0 auto',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    border: '1px solid #334155'
  },
  header: { marginBottom: '20px' },
  stepBadge: { fontSize: '11px', fontWeight: '800', color: '#ec4899', letterSpacing: '0.5px' },
  title: { fontSize: '20px', fontWeight: '800', margin: '4px 0', color: '#ffffff' },
  subtitle: { fontSize: '12px', color: '#94a3b8', margin: 0 },
  errorAlert: {
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    border: '1px solid #f43f5e',
    color: '#f43f5e',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '16px'
  },
  formStack: { display: 'flex', flexDirection: 'column', gap: '20px' },
  sectionGroup: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  sectionHeaderFlex: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: '13px', fontWeight: '800', color: '#93c5fd', margin: 0, textTransform: 'uppercase' },
  helperBadge: { fontSize: '11px', color: '#94a3b8', fontWeight: '500' },
  rowTwoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  field: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '11px', fontWeight: '700', color: '#cbd5e1' },
  input: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #334155',
    backgroundColor: '#1e293b',
    color: '#ffffff',
    fontSize: '13px',
    outline: 'none'
  },
  fileInput: {
    padding: '8px',
    borderRadius: '6px',
    border: '1px dashed #334155',
    backgroundColor: '#1e293b',
    color: '#94a3b8',
    fontSize: '12px',
    cursor: 'pointer'
  },
  uboBox: {
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  uboBoxHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  uboIndex: { fontSize: '12px', fontWeight: '700', color: '#ec4899' },
  removeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#f43f5e',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  addUboBtn: {
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    border: '1px solid #ec4899',
    color: '#ec4899',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    width: '100%'
  },
  actionRow: { display: 'flex', gap: '10px', marginTop: '10px' },
  backBtn: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    fontWeight: '700',
    cursor: 'pointer',
    flex: 1
  },
  submitBtn: {
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#ec4899',
    color: '#ffffff',
    fontWeight: '800',
    fontSize: '13px',
    cursor: 'pointer',
    flex: 2,
    textTransform: 'uppercase'
  }
};