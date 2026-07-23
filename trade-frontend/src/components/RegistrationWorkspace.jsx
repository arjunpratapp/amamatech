import React, { useState } from 'react';

export default function RegistrationWorkspace({ onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    companyName: '',
    registrationType: 'Supplier', // Supplier / Buyer
    iecNumber: '', // Import Export Code
    gstin: '', // GST Identification Number
  });

  const [verificationStatus, setVerificationStatus] = useState('idle'); // idle | verifying | verified | failed
  const [authoritySignature, setAuthoritySignature] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const triggerAuthorityValidation = (e) => {
    e.preventDefault();
    if (!formData.companyName || !formData.iecNumber || !formData.gstin) {
      alert("Please fill out all authority registration fields.");
      return;
    }

    setVerificationStatus('verifying');

    // Simulate cryptographic verification call to DGFT & GSTIN registries
    setTimeout(() => {
      const generatedSignature = `SIG-DGFT-${Math.random().toString(36).substring(2, 10).toUpperCase()}-2026`;
      setAuthoritySignature(generatedSignature);
      setVerificationStatus('verified');
    }, 2200);
  };

  const handleCompleteRegistration = () => {
    if (onRegisterSuccess) {
      onRegisterSuccess({
        ...formData,
        authoritySignature,
        isVerified: true
      });
    }
  };

  return (
    <div style={styles.registrationContainer}>
      {/* Visual Progress/Status Header */}
      <div style={styles.headerZone}>
        <span style={styles.stepIndicator}>STEP 01 // IDENTITY PROVISIONING</span>
        <h2 style={styles.titleText}>Sovereign Registry Node</h2>
        <p style={styles.subtitleText}>
          Register your entity to the decentralized trade pipeline. All nodes undergo mandatory multi-registry verification.
        </p>
      </div>

      <div style={styles.splitLayout}>
        {/* Registration Form Panel */}
        <form onSubmit={triggerAuthorityValidation} style={styles.formPanel}>
          <h3 style={styles.panelTitle}>Corporate &amp; Trade Identifiers</h3>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>LEGAL ENTITY NAME</label>
            <input 
              type="text" 
              name="companyName"
              placeholder="e.g. Amama Exporters Pvt Ltd" 
              value={formData.companyName}
              onChange={handleInputChange}
              disabled={verificationStatus === 'verified' || verificationStatus === 'verifying'}
              style={styles.inputField} 
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>NODE OPERATIONAL PROFILE</label>
            <select 
              name="registrationType"
              value={formData.registrationType}
              onChange={handleInputChange}
              disabled={verificationStatus === 'verified' || verificationStatus === 'verifying'}
              style={styles.selectField}
            >
              <option value="Supplier">Supplier (Exporter / Production Facility)</option>
              <option value="Buyer">Buyer (Importer / Clearing House)</option>
            </select>
          </div>

          <div style={styles.gridRow}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>DGFT IMPORT EXPORT CODE (IEC)</label>
              <input 
                type="text" 
                name="iecNumber"
                placeholder="10-digit IEC Code" 
                maxLength="10"
                value={formData.iecNumber}
                onChange={handleInputChange}
                disabled={verificationStatus === 'verified' || verificationStatus === 'verifying'}
                style={styles.inputField} 
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>GSTIN IDENTIFICATION NUMBER</label>
              <input 
                type="text" 
                name="gstin"
                placeholder="15-character GSTIN" 
                maxLength="15"
                value={formData.gstin}
                onChange={handleInputChange}
                disabled={verificationStatus === 'verified' || verificationStatus === 'verifying'}
                style={styles.inputField} 
              />
            </div>
          </div>

          {verificationStatus !== 'verified' && (
            <button 
              type="submit" 
              disabled={verificationStatus === 'verifying'}
              style={verificationStatus === 'verifying' ? styles.verifyingBtn : styles.submitBtn}
            >
              {verificationStatus === 'verifying' ? 'Connecting National Registries...' : '⚡ Request Authority Validation'}
            </button>
          )}
        </form>

        {/* Live Validation Tag Status Board */}
        <div style={styles.statusPanel}>
          <h3 style={styles.panelTitle}>Authority Verification Engine</h3>
          
          <div style={styles.statusCard}>
            {verificationStatus === 'idle' && (
              <div style={styles.stateContainer}>
                <div style={styles.statusPulseAmber}>● PENDING SUBMISSION</div>
                <p style={styles.stateBodyText}>
                  Please input your DGFT &amp; GSTIN credentials on the left. The registry engine is listening for outbound routing.
                </p>
              </div>
            )}

            {verificationStatus === 'verifying' && (
              <div style={styles.stateContainer}>
                <div style={styles.statusPulseBlue}>⚙️ VERIFICATION IN PROGRESS</div>
                <div style={styles.progressTrack}>
                  <div style={styles.progressActivePulse}></div>
                </div>
                <p style={styles.stateBodyText}>
                  Validating records with Government of India API endpoints (DGFT Database &amp; GSTN Clearing Hub)...
                </p>
              </div>
            )}

            {verificationStatus === 'verified' && (
              <div style={styles.stateContainer}>
                {/* 🌟 CRITICAL ENHANCEMENT: HIGH VISIBILITY CRITICAL VALIDATION TAG */}
                <div style={styles.verifiedAuthorityBadge}>
                  <span style={styles.badgeShieldIcon}>🛡️</span>
                  <div>
                    <div style={styles.badgeTitle}>AUTHORITY VERIFIED NODE</div>
                    <div style={styles.badgeSubtitle}>FEDERAL DGFT &amp; GSTIN RECORD MATCHED</div>
                  </div>
                </div>

                <div style={styles.verifiedMetaBox}>
                  <div style={styles.metaRow}>
                    <span style={styles.metaLabel}>CLEARING AUTHORITY:</span>
                    <span style={styles.metaValue}>Union Ministry of Commerce</span>
                  </div>
                  <div style={styles.metaRow}>
                    <span style={styles.metaLabel}>DGFT VALIDATION:</span>
                    <span style={{...styles.metaValue, color: '#4ade80'}}>PASS ✓</span>
                  </div>
                  <div style={styles.metaRow}>
                    <span style={styles.metaLabel}>SECURE HASH ID:</span>
                    <span style={{...styles.metaValue, color: '#f59e0b'}}>{authoritySignature}</span>
                  </div>
                </div>

                <button onClick={handleCompleteRegistration} style={styles.completeBtn}>
                  Deploy Node to Live Network 🚀
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  registrationContainer: {
    backgroundColor: '#05080f',
    padding: '40px',
    borderRadius: '16px',
    border: '1px solid #1e293b',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    maxWidth: '1200px',
    margin: '0 auto',
    boxSizing: 'border-box'
  },
  headerZone: {
    borderBottom: '1px solid #1e293b',
    paddingBottom: '24px'
  },
  stepIndicator: {
    fontSize: '11px',
    fontWeight: '900',
    color: '#3b82f6',
    letterSpacing: '1.5px'
  },
  titleText: {
    fontSize: '28px',
    fontWeight: '900',
    color: '#ffffff',
    margin: '8px 0'
  },
  subtitleText: {
    fontSize: '13.5px',
    color: '#64748b',
    margin: 0,
    lineHeight: '1.6'
  },
  splitLayout: {
    display: 'grid',
    gridTemplateColumns: '3fr 2fr',
    gap: '32px',
    alignItems: 'start'
  },
  formPanel: {
    backgroundColor: '#0b1120',
    border: '1px solid #1e293b',
    borderRadius: '12px',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  panelTitle: {
    fontSize: '15px',
    fontWeight: '900',
    color: '#ffffff',
    margin: '0 0 10px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    width: '100%'
  },
  gridRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px'
  },
  label: {
    fontSize: '10px',
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: '0.5px'
  },
  inputField: {
    backgroundColor: '#070a13',
    border: '1px solid #1e293b',
    borderRadius: '6px',
    padding: '12px 16px',
    color: '#ffffff',
    fontSize: '13.5px',
    outline: 'none',
    fontFamily: 'ui-monospace, monospace'
  },
  selectField: {
    backgroundColor: '#070a13',
    border: '1px solid #1e293b',
    borderRadius: '6px',
    padding: '12px 16px',
    color: '#ffffff',
    fontSize: '13.5px',
    outline: 'none',
    cursor: 'pointer'
  },
  submitBtn: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '14px',
    fontWeight: '800',
    fontSize: '12.5px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    marginTop: '12px',
    transition: 'background-color 0.2s'
  },
  verifyingBtn: {
    backgroundColor: '#1e3a8a',
    color: '#93c5fd',
    border: 'none',
    borderRadius: '6px',
    padding: '14px',
    fontWeight: '800',
    fontSize: '12.5px',
    textTransform: 'uppercase',
    cursor: 'not-allowed',
    marginTop: '12px'
  },
  statusPanel: {
    backgroundColor: '#0b1120',
    border: '1px solid #1e293b',
    borderRadius: '12px',
    padding: '32px',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    boxSizing: 'border-box'
  },
  statusCard: {
    backgroundColor: '#070a13',
    border: '1px solid #1e293b',
    borderRadius: '8px',
    padding: '24px',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stateContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  statusPulseAmber: {
    color: '#f59e0b',
    fontWeight: '900',
    fontSize: '12px',
    fontFamily: 'ui-monospace, monospace',
    letterSpacing: '0.5px'
  },
  statusPulseBlue: {
    color: '#3b82f6',
    fontWeight: '900',
    fontSize: '12px',
    fontFamily: 'ui-monospace, monospace',
    letterSpacing: '0.5px'
  },
  stateBodyText: {
    fontSize: '12.5px',
    color: '#64748b',
    lineHeight: '1.6',
    margin: 0
  },
  progressTrack: {
    width: '100%',
    height: '4px',
    backgroundColor: '#1e293b',
    borderRadius: '2px',
    overflow: 'hidden'
  },
  progressActivePulse: {
    width: '50%',
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: '2px',
    animation: 'pulseBar 1.5s infinite ease-in-out'
  },

  /* Verified Authority Badge & Layout Components */
  verifiedAuthorityBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    border: '2px solid #10b981',
    borderRadius: '8px',
    padding: '16px',
    boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)'
  },
  badgeShieldIcon: {
    fontSize: '24px'
  },
  badgeTitle: {
    fontSize: '13px',
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: '0.5px'
  },
  badgeSubtitle: {
    fontSize: '9.5px',
    fontWeight: '800',
    color: '#10b981',
    marginTop: '2px',
    letterSpacing: '0.5px'
  },
  verifiedMetaBox: {
    backgroundColor: '#0b1120',
    border: '1px solid #1e293b',
    borderRadius: '6px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    fontFamily: 'ui-monospace, monospace'
  },
  metaLabel: {
    color: '#475569',
    fontWeight: '800'
  },
  metaValue: {
    color: '#ffffff',
    fontWeight: '800'
  },
  completeBtn: {
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    padding: '14px',
    fontWeight: '900',
    fontSize: '12px',
    textTransform: 'uppercase',
    cursor: 'pointer',
    width: '100%',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
  }
};