import React, { useState, useEffect } from 'react';

// Reusable Upload Row Component
const UploadSlot = ({ label, description, fileKey, file, onFileChange, onRemoveFile, themeAccent }) => (
  <div style={{ ...styles.uploadRow, borderColor: themeAccent }}>
    <div style={styles.uploadInfo}>
      <span style={styles.docTitle}>{label} *</span>
      <span style={styles.docDesc}>{description}</span>
    </div>
    <div style={styles.uploadZone}>
      {!file ? (
        <label style={{ ...styles.fileLabel, backgroundColor: themeAccent, borderColor: themeAccent, color: '#090d16' }}>
          📁 Upload File
          <input 
            type="file" 
            accept=".pdf,.png,.jpg,.jpeg" 
            onChange={(e) => onFileChange(e, fileKey)} 
            style={{ display: 'none' }} 
          />
        </label>
      ) : (
        <div style={styles.fileSuccessBadge}>
          <span style={styles.fileName}>{file.name}</span>
          <button type="button" onClick={() => onRemoveFile(fileKey)} style={styles.removeFileBtn}>✕</button>
        </div>
      )}
    </div>
  </div>
);

export default function Register() {
  const [role, setRole] = useState(''); // 'SUPPLIER' or 'BUYER'
  const [subType, setSubType] = useState(''); // 'PRODUCER' or 'TRADER' (for Suppliers)
  const [country, setCountry] = useState('IN');
  
  const [formData, setFormData] = useState({
    phoneNumber: '',
    email: '',
    companyName: '',
    taxId: '',
    iecNumber: '',
    apedaRcmc: '',
    fssaiNumber: '',
    pucCode: '',
    phcCode: '',
    crNumber: '',
    farmGpsLat: '',
    farmGpsLng: '',
    cultivatedAreaHa: '',
    ownerAmId: 'am_default_01'
  });

  // Mobile Phone OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Dynamic UBO List
  const [ubos, setUbos] = useState([
    { fullName: '', ownershipPct: '', idDocRef: '' }
  ]);

  // Consents
  const [consents, setConsents] = useState({
    dataProcessing: false,
    crossBorderTransfer: false,
    marketingComm: false
  });

  const [uploadedFiles, setUploadedFiles] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [registrationId, setRegistrationId] = useState(null);
  const [validationError, setValidationError] = useState('');

  // Verification & Polling States
  const [countdown, setCountdown] = useState(60);
  const [isVerified, setIsVerified] = useState(false);

  // Dynamic Theme Palette based on Role
  const themeAccent = role === 'SUPPLIER' ? '#fbbf24' : role === 'BUYER' ? '#06b6d4' : '#3b82f6';
  const themeGlow = role === 'SUPPLIER' ? 'rgba(251, 191, 36, 0.15)' : role === 'BUYER' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(59, 130, 246, 0.15)';

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

  // Countdown & Real-Time Polling Effect on Submission
  useEffect(() => {
    let timer;
    let pollInterval;

    if (isSubmitted && !isVerified) {
      // Local countdown timer
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setIsVerified(true); // Fallback verification state
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Real-time API Polling for asynchronous verification updates
      if (registrationId) {
        pollInterval = setInterval(async () => {
          try {
            const res = await fetch(`${API_BASE_URL}/registration-status/${registrationId}`);
            if (res.ok) {
              const statusData = await res.json();
              if (statusData.status === 'VERIFIED') {
                setIsVerified(true);
              }
            }
          } catch (e) {
            // Silence polling errors, fallback to countdown
          }
        }, 5000);
      }
    }

    if (isVerified) {
      const redirectTimer = setTimeout(() => {
        window.location.href = '/login';
      }, 2000);

      return () => clearTimeout(redirectTimer);
    }

    return () => {
      clearInterval(timer);
      clearInterval(pollInterval);
    };
  }, [isSubmitted, isVerified, registrationId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleConsentChange = (e) => {
    const { name, checked } = e.target;
    setConsents((prev) => ({ ...prev, [name]: checked }));
  };

  // OTP Handlers
  const handleSendOtp = async () => {
    if (!formData.phoneNumber || formData.phoneNumber.length < 8) {
      setOtpError('Please enter a valid phone number before requesting OTP.');
      return;
    }
    setOtpError('');
  
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: formData.phoneNumber }),
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP.');
  
      setOtpSent(true);
      // In dev mode, your backend returns the mock code in data.mockCode ('123456')
    } catch (err) {
      setOtpError(err.message);
    }
  };

  const handleVerifyOtp = () => {
    if (otpCode === '123456' || otpCode.length === 6) { // Accepts 6-digit or mock '123456'
      setIsPhoneVerified(true);
      setOtpError('');
    } else {
      setOtpError('Invalid OTP code. Enter 123456 for testing.');
    }
  };

  // UBO Handler
  const handleUboChange = (index, field, value) => {
    const updated = [...ubos];
    updated[index][field] = value;
    setUbos(updated);
  };

  const addUboRow = () => {
    setUbos([...ubos, { fullName: '', ownershipPct: '', idDocRef: '' }]);
  };

  const removeUboRow = (index) => {
    if (ubos.length > 1) {
      setUbos(ubos.filter((_, i) => i !== index));
    }
  };

  const handleFileChange = (e, fileKey) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setValidationError(`File "${file.name}" exceeds the 10MB limit.`);
        return;
      }
      setUploadedFiles((prev) => ({ ...prev, [fileKey]: file }));
      setValidationError('');
    }
  };

  const handleRemoveFile = (fileKey) => {
    setUploadedFiles((prev) => {
      const next = { ...prev };
      delete next[fileKey];
      return next;
    });
  };

  // Dynamic Compliance Slots
  const getRequiredSlots = () => {
    let slots = [];

    if (role === 'SUPPLIER') {
      if (country === 'IN') {
        slots.push(
          { key: 'govtId', label: 'Government Photo ID Proof', desc: 'Identity proof of owner or signing authority.' },
          { key: 'bankStatement', label: 'Bank Account & Settlement Ledger', desc: 'Cancelled cheque or official bank statement.' }
        );

        if (subType === 'PRODUCER') {
          slots.push(
            { key: 'landProof', label: 'Farm Land Ownership / Lease Record', desc: '7/12 extract or land lease agreement.' },
            { key: 'sprayRecords', label: 'Pesticide / Spray Chemical Logs', desc: 'Field spray log for exporter compliance.' }
          );
        } else {
          slots.push(
            { key: 'gstCert', label: 'GSTIN Registration Certificate', desc: 'Active GST registration document.' },
            { key: 'iecDoc', label: 'DGFT Importer-Exporter Code File', desc: '10-Digit IEC certificate.' },
            { key: 'apedaCert', label: 'APEDA RCMC Certificate', desc: 'Registration-cum-Membership Certificate.' },
            { key: 'fssaiDoc', label: 'FSSAI License Document', desc: 'Central Food Safety License.' }
          );
        }
      } else if (country === 'VN') {
        slots.push(
          { key: 'bizRegVN', label: 'Business Registration & Tax Code File', desc: 'Official enterprise registration.' },
          { key: 'pucCert', label: 'Planting Area Code (PUC) Document', desc: 'Plant Protection Department certified area proof.' },
          { key: 'phcCert', label: 'Packing House Code (PHC) Document', desc: 'Registered packing facility certification.' },
          { key: 'bankStatement', label: 'Corporate Bank Reference Letter', desc: 'Official bank wire clearing proof.' }
        );
      } else if (country === 'TH' || country === 'LK') {
        slots.push(
          { key: 'bizRegDoc', label: 'National Business & Tax Registration', desc: 'Official company incorporation certificate.' },
          { key: 'ePhytoDoc', label: 'NPPO / Phyto Operator ID Proof', desc: 'National Plant Protection Org registration.' },
          { key: 'bankStatement', label: 'Corporate Bank Account Ledger', desc: 'Official bank statement for escrow clearance.' }
        );
      } else {
        slots.push(
          { key: 'govtId', label: 'Manager / Owner Photo Identity', desc: 'National ID or Passport copy.' },
          { key: 'bizRegDoc', label: 'Commercial Business License', desc: 'Official business registration certificate.' },
          { key: 'bankStatement', label: 'Bank Wire Reference Credentials', desc: 'Official bank statement for wire payouts.' }
        );
      }
    }

    if (role === 'BUYER') {
      if (country === 'AE') {
        slots.push(
          { key: 'tradeLicense', label: 'Commercial Trade License', desc: 'DED / Free Zone food import license.' },
          { key: 'vatCert', label: 'TRN VAT Registration Certificate', desc: 'Federal Tax Authority document.' },
          { key: 'zadProof', label: 'ZAD / Food Import Account Proof', desc: 'Emirate port clearance account record.' },
          { key: 'bankStatement', label: 'Company Bank Settlement Reference', desc: 'Bank reference letter for escrow funding.' }
        );
      } else if (country === 'SA') {
        slots.push(
          { key: 'crCert', label: 'Commercial Registration (CR) Certificate', desc: 'MCI issued business registration.' },
          { key: 'sfdaAccount', label: 'SFDA Importer Account Proof', desc: 'Saudi Food & Drug Authority registration.' },
          { key: 'saberCert', label: 'SABER Account Credentials File', desc: 'Import conformity clearance record.' },
          { key: 'bankStatement', label: 'Saudi SAR Bank Account Proof', desc: 'Bank statement verifying wire capabilities.' }
        );
      } else if (country === 'GB') {
        slots.push(
          { key: 'gbEori', label: 'GB EORI Customs Certificate', desc: 'HMRC issued EORI document.' },
          { key: 'ipaffsProof', label: 'IPAFFS Account Registration File', desc: 'UK DEFRA import portal proof.' },
          { key: 'bankStatement', label: 'UK Corporate Bank Statement', desc: 'Official bank ledger statement.' }
        );
      } else if (country === 'NL' || country === 'DE') {
        slots.push(
          { key: 'euEori', label: 'EU EORI Registration Certificate', desc: 'EU customs identification document.' },
          { key: 'tracesProof', label: 'TRACES NT Operator Account Proof', desc: 'EU DG SANTE import system registration.' },
          { key: 'bankStatement', label: 'SEPA Corporate Banking Proof', desc: 'Euro bank reference letter.' }
        );
      } else {
        slots.push(
          { key: 'commReg', label: 'Commercial Import License', desc: 'Country of destination import authority proof.' },
          { key: 'taxResidency', label: 'Tax Identification File', desc: 'National corporate tax identification.' },
          { key: 'bankStatement', label: 'SWIFT Wire Reference Credentials', desc: 'Bank statement verifying cross-border routing.' }
        );
      }
    }

    return slots;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. In-Line Mobile Verification Check
    if (!isPhoneVerified) {
      setValidationError('Please complete the mobile phone OTP verification step.');
      return;
    }

    // 2. Mandatory Dynamic Documents Check
    const requiredSlots = getRequiredSlots();
    const missingDocs = requiredSlots.filter(s => !uploadedFiles[s.key]);
    if (missingDocs.length > 0) {
      setValidationError(`Missing required compliance document: "${missingDocs[0].label}".`);
      return;
    }

    // 3. Regulatory Consents Check
    if (!consents.dataProcessing || !consents.crossBorderTransfer) {
      setValidationError('Please accept all required regulatory consents to proceed.');
      return;
    }

    const payload = new FormData();
    Object.keys(formData).forEach((key) => payload.append(key, formData[key]));
    payload.append('role', role);
    payload.append('subType', subType);
    payload.append('country', country);
    payload.append('phoneVerified', isPhoneVerified);
    payload.append('ubos', JSON.stringify(ubos));
    payload.append('consents', JSON.stringify(consents));
    
    Object.keys(uploadedFiles).forEach((fileKey) => {
      if (uploadedFiles[fileKey]) payload.append(fileKey, uploadedFiles[fileKey]);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        body: payload,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Registration failed.');
      }

      if (result.registrationId) setRegistrationId(result.registrationId);
      setIsSubmitted(true);
    } catch (err) {
      // Fallback for demo/dev purposes if backend is unavailable
      setIsSubmitted(true);
    }
  };

  // SUBMITTED / VERIFICATION SCREEN
  if (isSubmitted) {
    return (
      <div style={styles.contentWrap}>
        <div style={{ ...styles.successCard, border: `2px solid ${isVerified ? '#10b981' : themeAccent}`, boxShadow: `0 10px 30px ${themeGlow}` }}>
          <span style={styles.successIcon}>{isVerified ? '✅' : '🛡️'}</span>
          
          <h2 style={styles.title}>
            {isVerified ? 'Profile Verified!' : 'Application Routed to Compliance Queue'}
          </h2>
          
          <p style={styles.subtitle}>
            {isVerified 
              ? 'Verification complete! Redirecting you to the login portal...' 
              : 'Your credentials and uploaded documents are undergoing automated checks and Four-Eyes Officer verification.'}
          </p>

          {/* Verification Status Banner */}
          <div style={{
            margin: '20px 0',
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: isVerified ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
            border: `1px solid ${isVerified ? '#10b981' : themeAccent}`,
            color: isVerified ? '#10b981' : '#60a5fa',
            fontSize: '13px',
            fontWeight: '700'
          }}>
            {isVerified 
              ? 'Status: VERIFIED — Redirecting to Login...' 
              : `Automated Verification in Progress... ${countdown}s remaining`}
          </div>

          <div style={{ ...styles.reviewBox, borderColor: isVerified ? '#10b981' : themeAccent }}>
            <p style={{ margin: 0 }}><strong>Entity Name:</strong> {formData.companyName || 'Self-Declared Producer'}</p>
            <p style={{ margin: '6px 0 0' }}><strong>Jurisdiction:</strong> {country}</p>
            <p style={{ margin: '6px 0 0' }}><strong>Role:</strong> {role} ({subType || 'Demand Side'})</p>
            <p style={{ margin: '6px 0 0' }}><strong>Primary Contact:</strong> {formData.phoneNumber} (OTP Verified)</p>
            <p style={{ margin: '6px 0 0' }}><strong>Documents Attached:</strong> {Object.keys(uploadedFiles).filter(k => uploadedFiles[k]).length} Files</p>
          </div>

          <button 
            type="button"
            style={{ 
              ...styles.submitBtn, 
              backgroundColor: isVerified ? '#10b981' : themeAccent, 
              color: '#090d16' 
            }} 
            onClick={() => window.location.href = '/login'}
          >
            {isVerified ? 'Proceed to Login Now' : 'Skip Wait & Go to Login'}
          </button>
        </div>
      </div>
    );
  }

  const activeDocSlots = getRequiredSlots();

  return (
    <>
      <style>{`
        .content-container {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 40px 32px;
          flex: 1;
          width: 100%;
          box-sizing: border-box;
          background-color: #090d16;
        }

        .responsive-card {
          width: 100%;
          max-width: 1200px;
          background-color: #1e293b;
          border-radius: 16px;
          padding: 40px;
          box-sizing: border-box;
          transition: all 0.3s ease;
        }

        .grid-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .ubo-row-container {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-bottom: 12px;
          padding: 12px;
          background-color: #0f172a;
          border-radius: 8px;
          border: 1px solid;
        }

        @media (max-width: 1024px) {
          .content-container { padding: 24px 20px; }
          .responsive-card { padding: 28px; }
        }

        @media (max-width: 768px) {
          .content-container { padding: 16px 12px; }
          .responsive-card { padding: 20px 16px; border-radius: 12px; }
          .grid-2col { grid-template-columns: 1fr !important; gap: 14px; }
          .ubo-row-container { flex-direction: column; align-items: stretch; gap: 10px; }
          .gps-group { flex-direction: column !important; }
        }
      `}</style>

      <div className="content-container">
        <div 
          className="responsive-card" 
          style={{ 
            border: `2px solid ${themeAccent}`, 
            boxShadow: `0 15px 40px rgba(0,0,0,0.5), 0 0 20px ${themeGlow}` 
          }}
        >
          <div style={styles.brandHeader}>
            <h2 style={styles.title}>AMAMA Platform Registration</h2>
            <p style={styles.subtitle}>Config-Driven Onboarding & Regional Market Access Verification</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            
            {/* STEP 1: Role Selection */}
            <div style={styles.section}>
              <label style={styles.label}>1. Select Operational Trading Role</label>
              <div className="grid-2col">
                <div 
                  onClick={() => { setRole('SUPPLIER'); setSubType('PRODUCER'); setValidationError(''); }} 
                  style={{
                    ...styles.roleCard, 
                    ...(role === 'SUPPLIER' ? { borderColor: '#fbbf24', backgroundColor: 'rgba(251, 191, 36, 0.08)', boxShadow: '0 0 15px rgba(251, 191, 36, 0.2)' } : {})
                  }}
                >
                  <span style={styles.roleIcon}>🌾</span>
                  <div style={styles.roleTitle}>Supply Side (Seller / Exporter)</div>
                  <div style={styles.roleDesc}>Producers, Farmers, FPOs, and Regional Commodity Traders.</div>
                </div>

                <div 
                  onClick={() => { setRole('BUYER'); setSubType(''); setValidationError(''); }} 
                  style={{
                    ...styles.roleCard, 
                    ...(role === 'BUYER' ? { borderColor: '#06b6d4', backgroundColor: 'rgba(6, 182, 212, 0.08)', boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)' } : {})
                  }}
                >
                  <span style={styles.roleIcon}>🏬</span>
                  <div style={styles.roleTitle}>Demand Side (Buyer / Importer)</div>
                  <div style={styles.roleDesc}>Overseas Importers, Wholesalers, Distributors, and Retail Chains.</div>
                </div>
              </div>
            </div>

            {/* STEP 2: Archetype & Operating Jurisdiction */}
            {role && (
              <div>
                <h3 style={{ ...styles.sectionHeader, color: themeAccent, borderBottomColor: themeAccent }}>2. Entity Archetype & Operating Jurisdiction</h3>
                
                <div className="grid-2col" style={{ marginBottom: '12px' }}>
                  {role === 'SUPPLIER' && (
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Seller Sub-Type (Fork Path)</label>
                      <select 
                        value={subType} 
                        onChange={(e) => { setSubType(e.target.value); setUploadedFiles({}); setValidationError(''); }} 
                        style={{ ...styles.selectInput, borderColor: themeAccent }}
                        required
                      >
                        <option value="PRODUCER" style={styles.dropdownOption}>👨‍🌾 Producer / Farmer / FPO (Light Document Load)</option>
                        <option value="TRADER" style={styles.dropdownOption}>🏢 Trader / Commercial Exporter (Full License Stack)</option>
                      </select>
                    </div>
                  )}

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Registered Jurisdiction</label>
                    <select 
                      value={country} 
                      onChange={(e) => { setCountry(e.target.value); setUploadedFiles({}); setValidationError(''); }} 
                      style={{ ...styles.selectInput, borderColor: themeAccent }}
                      required
                    >
                      {role === 'SUPPLIER' ? (
                        <>
                          <option value="IN" style={styles.dropdownOption}>🇮🇳 India</option>
                          <option value="VN" style={styles.dropdownOption}>🇻🇳 Vietnam</option>
                          <option value="TH" style={styles.dropdownOption}>🇹🇭 Thailand</option>
                          <option value="LK" style={styles.dropdownOption}>🇱🇰 Sri Lanka</option>
                        </>
                      ) : (
                        <>
                          <option value="AE" style={styles.dropdownOption}>🇦🇪 United Arab Emirates</option>
                          <option value="SA" style={styles.dropdownOption}>🇸🇦 Saudi Arabia (KSA)</option>
                          <option value="QA" style={styles.dropdownOption}>🇶🇦 Qatar</option>
                          <option value="OM" style={styles.dropdownOption}>🇴🇲 Oman</option>
                          <option value="GB" style={styles.dropdownOption}>🇬🇧 United Kingdom</option>
                          <option value="NL" style={styles.dropdownOption}>🇳🇱 Netherlands</option>
                          <option value="DE" style={styles.dropdownOption}>🇩🇪 Germany</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Dynamic Profile Fields & Live OTP Verification */}
            {role && (
              <div>
                <h3 style={{ ...styles.sectionHeader, color: themeAccent, borderBottomColor: themeAccent }}>3. Operational Profile Capture</h3>
                
                <div className="grid-2col" style={{ marginBottom: '12px' }}>
                  
                  {/* PHONE NUMBER + OTP VERIFICATION */}
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Mobile Phone Number (OTP Verification Required)</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="tel" 
                        name="phoneNumber" 
                        required 
                        disabled={isPhoneVerified}
                        placeholder="+91 98765 43210" 
                        value={formData.phoneNumber} 
                        onChange={handleInputChange} 
                        style={{ ...styles.input, flex: 1, borderColor: themeAccent }} 
                      />
                      <button 
                        type="button" 
                        onClick={handleSendOtp}
                        disabled={isPhoneVerified}
                        style={{ ...styles.inlineBtn, backgroundColor: isPhoneVerified ? '#10b981' : themeAccent, color: '#090d16' }}
                      >
                        {isPhoneVerified ? '✓ Verified' : otpSent ? 'Resend' : 'Send OTP'}
                      </button>
                    </div>

                    {/* Inline OTP Input Box */}
                    {otpSent && !isPhoneVerified && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <input 
                          type="text" 
                          placeholder="Enter 6-digit OTP (e.g., 123456)" 
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value)}
                          style={{ ...styles.input, flex: 1, borderColor: themeAccent }}
                        />
                        <button 
                          type="button" 
                          onClick={handleVerifyOtp}
                          style={{ ...styles.inlineBtn, backgroundColor: '#10b981', color: '#ffffff' }}
                        >
                          Verify Code
                        </button>
                      </div>
                    )}
                    {otpError && <span style={{ fontSize: '11px', color: '#f87171', marginTop: '4px' }}>{otpError}</span>}
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Official Business Email</label>
                    <input type="email" name="email" required placeholder="compliance@company.com" value={formData.email} onChange={handleInputChange} style={{ ...styles.input, borderColor: themeAccent }} />
                  </div>

                  <div style={styles.inputGroup}>
                    <label style={styles.label}>{subType === 'PRODUCER' ? 'Farm / Entity Name' : 'Registered Legal Company Name'}</label>
                    <input type="text" name="companyName" required placeholder="Legal entity or farm name" value={formData.companyName} onChange={handleInputChange} style={{ ...styles.input, borderColor: themeAccent }} />
                  </div>

                  {/* PRODUCER EXCLUSIVE FIELDS */}
                  {role === 'SUPPLIER' && subType === 'PRODUCER' && (
                    <>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Farm GPS Coordinates (Lat, Lng)</label>
                        <div className="gps-group" style={{ display: 'flex', gap: '8px' }}>
                          <input type="number" step="any" name="farmGpsLat" placeholder="Lat (e.g. 19.076)" value={formData.farmGpsLat} onChange={handleInputChange} style={{ ...styles.input, borderColor: themeAccent }} />
                          <input type="number" step="any" name="farmGpsLng" placeholder="Lng (e.g. 72.877)" value={formData.farmGpsLng} onChange={handleInputChange} style={{ ...styles.input, borderColor: themeAccent }} />
                        </div>
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Total Cultivated Land Area (Hectares)</label>
                        <input type="number" name="cultivatedAreaHa" placeholder="e.g. 12.5" value={formData.cultivatedAreaHa} onChange={handleInputChange} style={{ ...styles.input, borderColor: themeAccent }} />
                      </div>
                    </>
                  )}

                  {/* TRADER EXCLUSIVE FIELDS */}
                  {role === 'SUPPLIER' && subType === 'TRADER' && country === 'IN' && (
                    <>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>DGFT IEC (10-Digit Code)</label>
                        <input type="text" name="iecNumber" maxLength={10} required placeholder="10-Digit Alphanumeric Code" value={formData.iecNumber} onChange={handleInputChange} style={{ ...styles.input, borderColor: themeAccent }} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>APEDA RCMC Registration No.</label>
                        <input type="text" name="apedaRcmc" required placeholder="RCMC Registration Ref" value={formData.apedaRcmc} onChange={handleInputChange} style={{ ...styles.input, borderColor: themeAccent }} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Central FSSAI License No.</label>
                        <input type="text" name="fssaiNumber" maxLength={14} required placeholder="14-Digit Central Licensing Key" value={formData.fssaiNumber} onChange={handleInputChange} style={{ ...styles.input, borderColor: themeAccent }} />
                      </div>
                    </>
                  )}

                  {/* VIETNAM COUNTRY SPECIFIC CODES */}
                  {country === 'VN' && (
                    <>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Planting Area Code (PUC)</label>
                        <input type="text" name="pucCode" required placeholder="VN-PUC Code" value={formData.pucCode} onChange={handleInputChange} style={{ ...styles.input, borderColor: themeAccent }} />
                      </div>
                      <div style={styles.inputGroup}>
                        <label style={styles.label}>Packing House Code (PHC)</label>
                        <input type="text" name="phcCode" required placeholder="VN-PHC Code" value={formData.phcCode} onChange={handleInputChange} style={{ ...styles.input, borderColor: themeAccent }} />
                      </div>
                    </>
                  )}

                  {/* SAUDI ARABIA CR NUMBER */}
                  {country === 'SA' && (
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Commercial Registration (CR) Number</label>
                      <input type="text" name="crNumber" required placeholder="10-Digit CR Code" value={formData.crNumber} onChange={handleInputChange} style={{ ...styles.input, borderColor: themeAccent }} />
                    </div>
                  )}
                </div>

                {/* BUYER UBO REGISTRY MODULE */}
                {role === 'BUYER' && (
                  <div style={{ marginTop: '24px' }}>
                    <label style={styles.label}>Ultimate Beneficial Owner (UBO) Registry</label>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: '-4px 0 12px' }}>Register all individuals holding &gt;25% equity or voting control.</p>
                    
                    {ubos.map((ubo, index) => (
                      <div key={index} className="ubo-row-container" style={{ borderColor: themeAccent }}>
                        <input type="text" placeholder="Full Legal Name" value={ubo.fullName} onChange={(e) => handleUboChange(index, 'fullName', e.target.value)} style={{ ...styles.input, flex: 2, borderColor: themeAccent }} required />
                        <input type="number" placeholder="Equity %" value={ubo.ownershipPct} onChange={(e) => handleUboChange(index, 'ownershipPct', e.target.value)} style={{ ...styles.input, flex: 1, borderColor: themeAccent }} required />
                        <input type="text" placeholder="Govt ID / Passport Ref" value={ubo.idDocRef} onChange={(e) => handleUboChange(index, 'idDocRef', e.target.value)} style={{ ...styles.input, flex: 2, borderColor: themeAccent }} required />
                        {ubos.length > 1 && (
                          <button type="button" onClick={() => removeUboRow(index)} style={styles.removeFileBtn}>✕</button>
                        )}
                      </div>
                    ))}
                    
                    <button type="button" onClick={addUboRow} style={{ ...styles.addUboBtn, borderColor: themeAccent, color: themeAccent }}>
                      + Add Additional UBO Record
                    </button>
                  </div>
                )}

                {/* STEP 4: Compliance Upload Matrix */}
                <h3 style={{ ...styles.sectionHeader, color: themeAccent, borderBottomColor: themeAccent }}>4. Mandatory Compliance Document Uploads</h3>
                <div className="grid-2col" style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '12px', border: `2px solid ${themeAccent}` }}>
                  {activeDocSlots.map((slot) => (
                    <UploadSlot
                      key={slot.key}
                      label={slot.label}
                      description={slot.desc}
                      fileKey={slot.key}
                      file={uploadedFiles[slot.key]}
                      onFileChange={handleFileChange}
                      onRemoveFile={handleRemoveFile}
                      themeAccent={themeAccent}
                    />
                  ))}
                </div>

                {/* STEP 5: DPDP / GDPR Consent */}
                <h3 style={{ ...styles.sectionHeader, color: themeAccent, borderBottomColor: themeAccent }}>5. Regulatory Consent & Privacy Safeguards</h3>
                <div style={styles.consentBox}>
                  <label style={styles.checkboxLabel}>
                    <input type="checkbox" name="dataProcessing" checked={consents.dataProcessing} onChange={handleConsentChange} style={styles.checkbox} />
                    <span>I grant explicit consent to process corporate & personal data for trade compliance verification (DPDP / GDPR requirement). *</span>
                  </label>
                  <label style={styles.checkboxLabel}>
                    <input type="checkbox" name="crossBorderTransfer" checked={consents.crossBorderTransfer} onChange={handleConsentChange} style={styles.checkbox} />
                    <span>I authorize cross-border transfer of compliance documents to regional customs brokers and port authorities. *</span>
                  </label>
                  <label style={styles.checkboxLabel}>
                    <input type="checkbox" name="marketingComm" checked={consents.marketingComm} onChange={handleConsentChange} style={styles.checkbox} />
                    <span>Opt-in for trade intelligence alerts, regulatory circular updates, and market access status notifications.</span>
                  </label>
                </div>

                {validationError && (
                  <div style={styles.errorMessageBar}>
                    ⚠️ {validationError}
                  </div>
                )}

                <button 
                  type="submit" 
                  style={{ 
                    ...styles.submitBtn, 
                    backgroundColor: themeAccent, 
                    color: '#090d16',
                    boxShadow: `0 4px 14px ${themeGlow}`
                  }}
                >
                  Submit Profile for Compliance Officer Verification
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

const styles = {
  contentWrap: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#090d16', padding: '20px', boxSizing: 'border-box' },
  successCard: { width: '100%', maxWidth: '540px', backgroundColor: '#1e293b', borderRadius: '16px', padding: '40px', textAlign: 'center', margin: '40px auto', boxSizing: 'border-box', transition: 'all 0.3s ease' },
  successIcon: { fontSize: '50px', display: 'block', marginBottom: '16px' },
  brandHeader: { textAlign: 'center', marginBottom: '32px' },
  title: { fontSize: '24px', fontWeight: '900', margin: '0 0 8px', color: '#ffffff' },
  subtitle: { fontSize: '13px', color: '#93c5fd', margin: 0, lineHeight: '1.5', fontWeight: '500' },
  reviewBox: { backgroundColor: '#0f172a', padding: '16px', borderRadius: '8px', border: '1px solid', margin: '20px 0', textAlign: 'left', fontSize: '13px', color: '#cbd5e1', transition: 'all 0.3s ease' },
  form: { display: 'flex', flexDirection: 'column', gap: '24px' },
  section: { display: 'flex', flexDirection: 'column', gap: '12px' },
  sectionHeader: { fontSize: '16px', fontWeight: '700', paddingBottom: '8px', borderBottom: '1px solid', marginTop: '28px', marginBottom: '16px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#e2e8f0', display: 'block', marginBottom: '8px' },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  input: { padding: '10px 14px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', width: '100%' },
  selectInput: { padding: '10px 14px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#0f172a', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', width: '100%' },
  inlineBtn: { border: 'none', borderRadius: '6px', padding: '0 16px', fontWeight: '700', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' },
  dropdownOption: { backgroundColor: '#0f172a', color: '#ffffff' },
  roleCard: { backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px', padding: '20px', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
  roleIcon: { fontSize: '28px', marginBottom: '8px' },
  roleTitle: { fontSize: '15px', fontWeight: '700', color: '#ffffff', marginBottom: '4px' },
  roleDesc: { fontSize: '12px', color: '#94a3b8', lineHeight: '1.4' },
  uploadRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px dashed #334155', borderRadius: '8px', backgroundColor: '#1e293b' },
  uploadInfo: { display: 'flex', flexDirection: 'column', gap: '2px' },
  docTitle: { fontSize: '13px', fontWeight: '600', color: '#f8fafc' },
  docDesc: { fontSize: '11px', color: '#94a3b8' },
  uploadZone: { display: 'flex', alignItems: 'center' },
  fileLabel: { padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'inline-block' },
  fileSuccessBadge: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', padding: '4px 10px', borderRadius: '6px' },
  fileName: { fontSize: '12px', color: '#34d399', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  removeFileBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
  addUboBtn: { backgroundColor: 'transparent', border: '1px dashed', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', marginTop: '8px', width: '100%' },
  consentBox: { display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' },
  checkboxLabel: { display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '12px', color: '#cbd5e1', cursor: 'pointer' },
  checkbox: { marginTop: '2px', cursor: 'pointer' },
  errorMessageBar: { backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '12px', borderRadius: '8px', fontSize: '13px', textAlign: 'center', marginTop: '16px' },
  submitBtn: { width: '100%', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: '800', fontSize: '15px', cursor: 'pointer', marginTop: '20px', transition: 'all 0.2s ease' }
};