import React, { useState } from 'react';
import { COUNTRY_DOCUMENT_MATRIX } from './countryDocumentRules';

export default function CountryOnboarding() {
  const [step, setStep] = useState(1);
  const [country, setCountry] = useState('IN');
  const [role, setRole] = useState('SUPPLIER'); // 'SUPPLIER' or 'BUYER'
  const [tradeType, setTradeType] = useState('EXPORT_SUPPLIER'); // e.g., 'DOMESTIC_SUPPLIER', 'EXPORT_SUPPLIER', 'IMPORT_BUYER', 'DOMESTIC_BUYER'
  const [commodity, setCommodity] = useState('NON_PERISHABLE');

  const [formData, setFormData] = useState({
    companyName: '', taxId: '', email: '', phone: '', signatoryName: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState({});
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Helper: Retrieve Country Rules
  const activeCountryRule = COUNTRY_DOCUMENT_MATRIX[country] || COUNTRY_DOCUMENT_MATRIX['DEFAULT_INTL'];

  // Helper: Get Required Documents Dynamically
  const getRequiredDocuments = () => {
    const docsByRole = activeCountryRule.documents[tradeType] || activeCountryRule.documents.DEFAULT || [];
    let requiredDocs = [...docsByRole];

    // Add Special Commodity Documents (e.g., Perishables for India)
    if (activeCountryRule.specialAddons && activeCountryRule.specialAddons[commodity]) {
      requiredDocs = [...requiredDocs, ...activeCountryRule.specialAddons[commodity]];
    }

    return requiredDocs;
  };

  const handleCountryChange = (e) => {
    const selectedCountry = e.target.value;
    setCountry(selectedCountry);
    // Reset trade types based on country
    if (selectedCountry === 'IN') {
      setTradeType('EXPORT_SUPPLIER');
    } else {
      setTradeType('DEFAULT');
    }
    setUploadedFiles({});
    setErrorMsg('');
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e, fileKey) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg(`File exceeds 10MB limit: ${file.name}`);
        return;
      }
      setUploadedFiles(prev => ({ ...prev, [fileKey]: file }));
      setErrorMsg('');
    }
  };

  const handleRemoveFile = (fileKey) => {
    setUploadedFiles(prev => ({ ...prev, [fileKey]: null }));
  };

  const handleNextStep = () => {
    if (step === 1 && !country) {
      setErrorMsg('Please select your country of registration.');
      return;
    }
    setErrorMsg('');
    setStep(prev => prev + 1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const requiredDocs = getRequiredDocuments();
    const missingDocs = requiredDocs.filter(d => d.required && !uploadedFiles[d.key]);

    if (missingDocs.length > 0) {
      setErrorMsg(`Missing required documents (${missingDocs.length} pending).`);
      return;
    }

    setIsSubmitted(true);
  };

  const themeAccent = role === 'SUPPLIER' ? '#fbbf24' : '#06b6d4';

  if (isSubmitted) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.card, borderColor: themeAccent, textAlign: 'center' }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🛡️</span>
          <h2 style={styles.title}>Country Verification Initialized</h2>
          <p style={styles.subtitle}>Your entity onboarding request for <strong>{activeCountryRule.countryName}</strong> has been transmitted to compliance clearing nodes.</p>
          <div style={styles.summaryBox}>
            <p><strong>Entity:</strong> {formData.companyName}</p>
            <p><strong>Jurisdiction:</strong> {activeCountryRule.countryName} ({activeCountryRule.regulatoryBody})</p>
            <p><strong>Trade Model:</strong> {tradeType.replace('_', ' ')}</p>
            <p><strong>Documents Uploaded:</strong> {Object.keys(uploadedFiles).filter(k => uploadedFiles[k]).length} Files</p>
          </div>
          <button style={{ ...styles.primaryBtn, backgroundColor: themeAccent }} onClick={() => window.location.reload()}>
            Back to Gateway
          </button>
        </div>
      </div>
    );
  }

  const activeDocs = getRequiredDocuments();

  return (
    <div style={styles.container}>
      <div style={{ ...styles.card, borderColor: themeAccent }}>
        
        {/* Progress Tracker Bar */}
        <div style={styles.progressBar}>
          <div style={{ ...styles.stepIndicator, backgroundColor: step >= 1 ? themeAccent : '#334155', color: '#0f172a' }}>1</div>
          <div style={{ ...styles.stepLine, backgroundColor: step >= 2 ? themeAccent : '#334155' }} />
          <div style={{ ...styles.stepIndicator, backgroundColor: step >= 2 ? themeAccent : '#334155', color: '#0f172a' }}>2</div>
          <div style={{ ...styles.stepLine, backgroundColor: step >= 3 ? themeAccent : '#334155' }} />
          <div style={{ ...styles.stepIndicator, backgroundColor: step >= 3 ? themeAccent : '#334155', color: '#0f172a' }}>3</div>
        </div>

        <div style={styles.header}>
          <h2 style={styles.title}>Global Trade Entity Onboarding</h2>
          <p style={styles.subtitle}>Dynamic country-wise compliance & regulatory clearance pipeline.</p>
        </div>

        {/* STEP 1: Country & Jurisdiction Selection */}
        {step === 1 && (
          <div style={styles.stepBlock}>
            <h3 style={{ ...styles.sectionHeader, color: themeAccent }}>Step 1: Jurisdiction & Operational Role</h3>
            
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>1. Select Country of Corporate Registration</label>
                <select value={country} onChange={handleCountryChange} style={styles.selectInput}>
                  <option value="IN">🇮🇳 India (DGFT / RBI / GSTIN)</option>
                  <option value="AE">🇦🇪 United Arab Emirates (DED / FTA)</option>
                  <option value="US">🇺🇸 United States (IRS / CBP)</option>
                  <option value="DEFAULT_INTL">🌎 Other International Jurisdiction</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>2. Operational Platform Role</label>
                <select value={role} onChange={(e) => { setRole(e.target.value); }} style={styles.selectInput}>
                  <option value="SUPPLIER">🚢 Vendor / Supplier (Exporter)</option>
                  <option value="BUYER">🛒 Procurement Buyer (Importer)</option>
                </select>
              </div>
            </div>

            {/* Sub-Framework Selection for India */}
            {country === 'IN' && (
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Trade Framework Category</label>
                  <select value={tradeType} onChange={(e) => setTradeType(e.target.value)} style={styles.selectInput}>
                    {role === 'SUPPLIER' ? (
                      <>
                        <option value="EXPORT_SUPPLIER">🇮🇳 Indian Cross-Border Exporter (IEC + AD Code)</option>
                        <option value="DOMESTIC_SUPPLIER">🇮🇳 Indian Domestic Vendor (GSTIN + PAN)</option>
                      </>
                    ) : (
                      <>
                        <option value="IMPORT_BUYER">🇮🇳 Indian Import Brokerage (IEC + AD Code)</option>
                        <option value="DOMESTIC_BUYER">🇮🇳 Indian Inland Procurement (GSTIN)</option>
                      </>
                    )}
                  </select>
                </div>

                {role === 'SUPPLIER' && (
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Commodity Stream</label>
                    <select value={commodity} onChange={(e) => setCommodity(e.target.value)} style={styles.selectInput}>
                      <option value="NON_PERISHABLE">📦 Non-Perishable Bulk / Industrial Goods</option>
                      <option value="PERISHABLE">🍎 Perishable Food & Agri (FSSAI + Phytosanitary)</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            <button style={{ ...styles.primaryBtn, backgroundColor: themeAccent }} onClick={handleNextStep}>
              Continue to Corporate Profile ➔
            </button>
          </div>
        )}

        {/* STEP 2: Basic Corporate Information */}
        {step === 2 && (
          <div style={styles.stepBlock}>
            <h3 style={{ ...styles.sectionHeader, color: themeAccent }}>Step 2: Corporate Profile ({activeCountryRule.countryName})</h3>
            
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Registered Corporate Legal Name</label>
                <input type="text" name="companyName" placeholder="e.g. Apex Global Trade Ltd" value={formData.companyName} onChange={handleInputChange} style={styles.input} required />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Tax Identity / Business Reg No ({activeCountryRule.countryName})</label>
                <input type="text" name="taxId" placeholder="e.g., Tax ID, EIN, GSTIN, or TRN" value={formData.taxId} onChange={handleInputChange} style={styles.input} required />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Authorized Signatory Email</label>
                <input type="email" name="email" placeholder="ops@company.com" value={formData.email} onChange={handleInputChange} style={styles.input} required />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Corporate Contact Number</label>
                <input type="tel" name="phone" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={handleInputChange} style={styles.input} required />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={styles.secondaryBtn} onClick={() => setStep(1)}>← Back</button>
              <button style={{ ...styles.primaryBtn, backgroundColor: themeAccent }} onClick={handleNextStep}>
                Proceed to Document Matrix ➔
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Country-Wise Dynamic Compliance Upload Matrix */}
        {step === 3 && (
          <form onSubmit={handleSubmit} style={styles.stepBlock}>
            <h3 style={{ ...styles.sectionHeader, color: themeAccent }}>
              Step 3: {activeCountryRule.countryName} Regulatory Document Matrix
            </h3>
            <p style={styles.matrixNotice}>
              Compliance Node Authority: <strong>{activeCountryRule.regulatoryBody}</strong>
            </p>

            <div style={styles.uploadGrid}>
              {activeDocs.map((doc) => {
                const uploadedFile = uploadedFiles[doc.key];
                return (
                  <div key={doc.key} style={{ ...styles.docRow, borderColor: uploadedFile ? '#4ade80' : '#334155' }}>
                    <div style={styles.docMeta}>
                      <span style={styles.docName}>{doc.label} {doc.required && <strong style={{ color: '#f43f5e' }}>*</strong>}</span>
                      <span style={styles.docDesc}>{doc.desc}</span>
                    </div>

                    <div style={styles.docAction}>
                      {!uploadedFile ? (
                        <label style={{ ...styles.uploadBtn, backgroundColor: themeAccent }}>
                          📁 Select File
                          <input type="file" accept={doc.format} onChange={(e) => handleFileUpload(e, doc.key)} style={{ display: 'none' }} />
                        </label>
                      ) : (
                        <div style={styles.fileBadge}>
                          <span style={styles.fileName}>{uploadedFile.name}</span>
                          <button type="button" onClick={() => handleRemoveFile(doc.key)} style={styles.removeBtn}>✕</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {errorMsg && <div style={styles.errorBar}>⚠️ {errorMsg}</div>}

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button type="button" style={styles.secondaryBtn} onClick={() => setStep(2)}>← Back</button>
              <button type="submit" style={{ ...styles.primaryBtn, backgroundColor: themeAccent, flex: 1 }}>
                Submit Complete Application
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

// Styling Theme matching the dark cyber-aesthetic
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    padding: '40px 20px',
    backgroundColor: '#090d16',
    minHeight: '100vh',
    boxSizing: 'border-box'
  },
  card: {
    width: '100%',
    maxWidth: '900px',
    backgroundColor: '#1e293b',
    border: '2px solid #3b82f6',
    borderRadius: '16px',
    padding: '36px',
    boxSizing: 'border-box'
  },
  progressBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '30px'
  },
  stepIndicator: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '900',
    fontSize: '14px'
  },
  stepLine: {
    height: '3px',
    width: '80px',
    margin: '0 8px'
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '900',
    color: '#ffffff',
    margin: '0 0 6px 0'
  },
  subtitle: {
    fontSize: '13px',
    color: '#93c5fd',
    margin: 0
  },
  stepBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  sectionHeader: {
    fontSize: '14px',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 10px 0'
  },
  matrixNotice: {
    fontSize: '12px',
    color: '#94a3b8',
    backgroundColor: '#0f172a',
    padding: '10px 14px',
    borderRadius: '6px',
    margin: '-10px 0 10px 0'
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column'
  },
  label: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#ffffff',
    textTransform: 'uppercase',
    marginBottom: '6px'
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontSize: '13px',
    outline: 'none'
  },
  selectInput: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontSize: '13px',
    outline: 'none',
    cursor: 'pointer'
  },
  uploadGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  docRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    border: '1px solid',
    borderRadius: '8px',
    padding: '14px 18px'
  },
  docMeta: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1
  },
  docName: {
    fontSize: '13px',
    fontWeight: '800',
    color: '#ffffff'
  },
  docDesc: {
    fontSize: '11px',
    color: '#94a3b8',
    marginTop: '2px'
  },
  docAction: {
    minWidth: '140px',
    display: 'flex',
    justifyContent: 'flex-end'
  },
  uploadBtn: {
    color: '#090d16',
    padding: '8px 14px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '800',
    cursor: 'pointer'
  },
  fileBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'rgba(74, 222, 128, 0.1)',
    border: '1px solid #4ade80',
    padding: '6px 10px',
    borderRadius: '6px'
  },
  fileName: {
    fontSize: '11px',
    color: '#4ade80',
    fontWeight: '700',
    maxWidth: '120px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: '#f43f5e',
    cursor: 'pointer',
    fontWeight: '800'
  },
  primaryBtn: {
    padding: '14px',
    border: 'none',
    borderRadius: '8px',
    color: '#090d16',
    fontWeight: '800',
    fontSize: '13px',
    cursor: 'pointer',
    textTransform: 'uppercase'
  },
  secondaryBtn: {
    padding: '14px 24px',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    borderRadius: '8px',
    fontWeight: '800',
    fontSize: '13px',
    cursor: 'pointer'
  },
  errorBar: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    border: '1px solid #f43f5e',
    color: '#f43f5e',
    padding: '12px',
    borderRadius: '6px',
    fontSize: '12px',
    textAlign: 'center',
    fontWeight: '700'
  },
  summaryBox: {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'left',
    margin: '20px 0',
    fontSize: '13px',
    color: '#cbd5e1',
    lineHeight: '1.6'
  }
};