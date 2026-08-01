import React, { useState, useEffect } from 'react';

// Default dynamic fallback requirement sets (SO-4 / BO-2)
const MOCK_REQUIREMENTS = {
  PRODUCER: [
    { id: 'govt_id', label: 'Government ID (Aadhaar / Voter ID)', required: true },
    { id: 'land_proof', label: 'Land Ownership Proof / 7/12 Extract', required: true },
    { id: 'bank_passbook', label: 'Bank Passbook / Cancelled Cheque', required: true },
    { id: 'farm_photo', label: 'Farm Photo (Camera Capture)', required: true },
    { id: 'fpo_cert', label: 'FPO Membership Certificate', required: false },
    { id: 'puc_cert', label: 'Produce Quality Cert (PUC)', required: false }
  ],
  TRADER: [
    { id: 'iec_license', label: 'Import Export Code (IEC)', required: true },
    { id: 'gst_cert', label: 'GST Registration Certificate', required: true },
    { id: 'apeda_cert', label: 'APEDA Registration (RCMC)', required: true },
    { id: 'fssai_license', label: 'FSSAI Export License', required: true },
    { id: 'trade_license', label: 'Municipal Trade License', required: true },
    { id: 'pan_card', label: 'Company PAN Card', required: true },
    { id: 'bank_cert', label: 'Bank AD Code Letter', required: true },
    { id: 'phyto_cert', label: 'Phytosanitary Protocol Declaration', required: true },
    { id: 'warehouse_proof', label: 'Warehouse / Packhouse Lease', required: false },
    { id: 'board_res', label: 'Board Resolution / Auth Signatory', required: false },
    { id: 'poll_cert', label: 'Pollution Control NOC', required: false }
  ],
  BUYER: [
    { id: 'trade_licence', label: 'Corporate Trade Licence', required: true },
    { id: 'vat_trn', label: 'VAT / Tax Registration Certificate', required: true },
    { id: 'customs_code', label: 'Import Customs Code / Port Clearance', required: true },
    { id: 'food_control', label: 'ZAD / Food Control Authority Registration', required: true },
    { id: 'auth_signatory_id', label: 'Authorised Signatory Passport / ID', required: true }
  ]
};

export default function DocumentChecklist({ role, sellerType, profileData, onSubmit, onBack }) {
  const [requirements, setRequirements] = useState([]);
  const [documents, setDocuments] = useState({});
  const [ubos, setUbos] = useState([{ name: '', shareholdingPercent: '', idDocument: null }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine active document set key
  const activeKey = role === 'BUYER' ? 'BUYER' : sellerType;

  useEffect(() => {
    // Dynamic RequirementSet lookup (Simulating API fetch based on Role / Region / Type)
    const requiredList = MOCK_REQUIREMENTS[activeKey] || [];
    setRequirements(requiredList);

    // Initialize document state
    const initialDocState = {};
    requiredList.forEach((req) => {
      initialDocState[req.id] = { file: null, expiryDate: '', previewUrl: '' };
    });
    setDocuments(initialDocState);
  }, [activeKey]);

  // File Upload / Camera Capture Handler
  const handleFileChange = (reqId, file) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setDocuments((prev) => ({
      ...prev,
      [reqId]: {
        ...prev[reqId],
        file,
        previewUrl
      }
    }));
  };

  // Expiry Date Handler (SO-4 / Dynamic Compliance Alerting Engine)
  const handleExpiryChange = (reqId, expiryDate) => {
    setDocuments((prev) => ({
      ...prev,
      [reqId]: {
        ...prev[reqId],
        expiryDate
      }
    }));
  };

  // UBO (Ultimate Beneficial Owner) Repeaters for Buyers (BO-2)
  const handleAddUbo = () => {
    setUbos([...ubos, { name: '', shareholdingPercent: '', idDocument: null }]);
  };

  const handleUboChange = (index, field, value) => {
    const updated = [...ubos];
    updated[index][field] = value;
    setUbos(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check required documents
    const missingDocs = requirements.filter(
      (req) => req.required && !documents[req.id]?.file
    );

    if (missingDocs.length > 0) {
      alert(`Please upload all required documents: ${missingDocs.map((m) => m.label).join(', ')}`);
      return;
    }

    setIsSubmitting(true);

    const payload = {
      role,
      sellerType,
      profileData,
      documents,
      ubos: role === 'BUYER' ? ubos : undefined
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          {role === 'BUYER' ? 'BO-2 · KYB & UBO Checklist' : `SO-4 · Document Checklist (${requirements.length} Items)`}
        </h3>
        <p style={styles.subtitle}>
          {role === 'BUYER'
            ? 'Upload trade licenses & declare ultimate beneficial owners'
            : `Compliance verification set for ${sellerType === 'PRODUCER' ? 'Farmers / Producers' : 'Commercial Traders'}`}
        </p>
      </div>

      {/* Document Upload Stack */}
      <div style={styles.docStack}>
        {requirements.map((req) => {
          const docState = documents[req.id] || {};
          return (
            <div key={req.id} style={styles.docCard}>
              <div style={styles.docInfo}>
                <span style={styles.docLabel}>
                  {req.label} {req.required && <span style={{ color: '#ef4444' }}>*</span>}
                </span>
                <span style={styles.docStatus}>
                  {docState.file ? '✅ Uploaded' : req.required ? '⚠️ Required' : 'Optional'}
                </span>
              </div>

              <div style={styles.uploadControls}>
                {/* File / Camera Input */}
                <input
                  type="file"
                  id={`file-${req.id}`}
                  accept="image/*,application/pdf"
                  capture="environment" // Enables direct camera on mobile (SO-4)
                  onChange={(e) => handleFileChange(req.id, e.target.files[0])}
                  style={{ display: 'none' }}
                />
                <label htmlFor={`file-${req.id}`} style={styles.uploadBtn}>
                  {docState.file ? '📸 Replace Document' : '📷 Take Photo / Upload'}
                </label>

                {/* Document Expiry Date Input (Feeds 60/30/7 day auto-suspend engine) */}
                <input
                  type="date"
                  placeholder="Expiry Date"
                  value={docState.expiryDate || ''}
                  onChange={(e) => handleExpiryChange(req.id, e.target.value)}
                  style={styles.dateInput}
                  title="Document Expiry Date"
                />
              </div>

              {/* Preview Thumbnail */}
              {docState.previewUrl && (
                <div style={styles.previewContainer}>
                  <img src={docState.previewUrl} alt="Preview" style={styles.previewImg} />
                  <span style={styles.fileName}>{docState.file?.name}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* UBO Section for Corporate Buyers (BO-2) */}
      {role === 'BUYER' && (
        <div style={styles.uboSection}>
          <h4 style={styles.uboTitle}>Ultimate Beneficial Owners (UBO)</h4>
          {ubos.map((ubo, idx) => (
            <div key={idx} style={styles.uboRow}>
              <input
                type="text"
                placeholder="Full Legal Name"
                required
                value={ubo.name}
                onChange={(e) => handleUboChange(idx, 'name', e.target.value)}
                style={{ ...styles.input, flex: 2 }}
              />
              <input
                type="number"
                placeholder="% Shareholding"
                required
                min="1"
                max="100"
                value={ubo.shareholdingPercent}
                onChange={(e) => handleUboChange(idx, 'shareholdingPercent', e.target.value)}
                style={{ ...styles.input, flex: 1 }}
              />
            </div>
          ))}
          <button type="button" onClick={handleAddUbo} style={styles.addUboBtn}>
            + Add Another Beneficial Owner
          </button>
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
        <button type="button" onClick={onBack} style={styles.backBtn}>
          Back
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ ...styles.submitBtn, opacity: isSubmitting ? 0.6 : 1 }}
        >
          {isSubmitting ? 'SUBMITTING FOR REVIEW...' : 'Complete Registration 🎉'}
        </button>
      </div>
    </form>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '16px' },
  header: { marginBottom: '8px' },
  title: { fontSize: '16px', fontWeight: '800', color: '#ffffff', margin: '0 0 4px' },
  subtitle: { fontSize: '12px', color: '#94a3b8', margin: 0 },
  docStack: { display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '360px', overflowY: 'auto' },
  docCard: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  docInfo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  docLabel: { fontSize: '12px', fontWeight: '700', color: '#ffffff' },
  docStatus: { fontSize: '11px', fontWeight: '600', color: '#94a3b8' },
  uploadControls: { display: 'flex', gap: '8px' },
  uploadBtn: {
    flex: 1,
    padding: '8px',
    borderRadius: '6px',
    border: '1px dashed #3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    color: '#60a5fa',
    fontSize: '11px',
    fontWeight: '700',
    textAlign: 'center',
    cursor: 'pointer'
  },
  dateInput: {
    width: '130px',
    padding: '6px 8px',
    borderRadius: '6px',
    border: '1px solid #334155',
    backgroundColor: '#1e293b',
    color: '#ffffff',
    fontSize: '11px',
    outline: 'none'
  },
  previewContainer: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' },
  previewImg: { width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' },
  fileName: { fontSize: '11px', color: '#94a3b8', textOverflow: 'ellipsis', overflow: 'hidden' },
  uboSection: { borderTop: '1px solid #334155', paddingTop: '12px', marginTop: '12px' },
  uboTitle: { fontSize: '13px', fontWeight: '700', color: '#ffffff', margin: '0 0 8px' },
  uboRow: { display: 'flex', gap: '8px', marginBottom: '8px' },
  input: {
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #334155',
    backgroundColor: '#1e293b',
    color: '#ffffff',
    fontSize: '12px',
    outline: 'none'
  },
  addUboBtn: {
    background: 'none',
    border: 'none',
    color: '#3b82f6',
    fontSize: '11px',
    fontWeight: '700',
    cursor: 'pointer',
    padding: 0
  },
  backBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    fontWeight: '700',
    cursor: 'pointer'
  },
  submitBtn: {
    flex: 2,
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#10b981',
    color: '#090d16',
    fontWeight: '800',
    cursor: 'pointer',
    textTransform: 'uppercase'
  }
};