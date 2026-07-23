import React, { useState } from 'react';

export default function Register() {
  const [role, setRole] = useState(''); // 'SUPPLIER' or 'BUYER'
  const [supplierRegion, setSupplierRegion] = useState(''); // 'DOMESTIC' or 'INTERNATIONAL'
  const [buyerRegion, setBuyerRegion] = useState(''); // 'DOMESTIC' or 'INTERNATIONAL'
  const [commodityType, setCommodityType] = useState(''); // 'PERISHABLE' or 'NON_PERISHABLE'
  
  const [formData, setFormData] = useState({
    email: '', password: '', companyName: '', iecNumber: '', adCode: '', rcmcNumber: '', fssaiNumber: '', boardRegistration: ''
  });
  
  const [uploadedFiles, setUploadedFiles] = useState({
    panCard: null, gstCert: null, bankStatement: null, incorporationCert: null,
    companyConstitution: null, taxDoc: null, passportCopy: null, addressProof: null, 
    iecDoc: null, phytosanitaryCert: null, coldChainSop: null, adCodeDoc: null, 
    rcmcDoc: null, fssaiDoc: null, commodityBoardDoc: null, qualityCert: null
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reconfigured colors: Supplier stays Amber Gold, Buyer pivots to Cyber Cyan/Teal
  const themeAccent = role === 'SUPPLIER' ? '#fbbf24' : role === 'BUYER' ? '#06b6d4' : '#3b82f6';
  const themeGlow = role === 'SUPPLIER' ? 'rgba(251, 191, 36, 0.15)' : role === 'BUYER' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(59, 130, 246, 0.15)';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, fileKey) => {
    const file = e.target.files[0];
    if (file) setUploadedFiles((prev) => ({ ...prev, [fileKey]: file }));
  };

  const handleRemoveFile = (fileKey) => {
    setUploadedFiles((prev) => ({ ...prev, [fileKey]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const RenderUploadSlot = (label, description, fileKey) => (
    <div style={{ ...styles.uploadRow, borderColor: themeAccent }} key={fileKey}>
      <div style={styles.uploadInfo}>
        <span style={styles.docTitle}>{label} *</span>
        <span style={styles.docDesc}>{description}</span>
      </div>
      <div style={styles.uploadZone}>
        {!uploadedFiles[fileKey] ? (
          <label style={{ ...styles.fileLabel, backgroundColor: themeAccent, borderColor: themeAccent, color: '#090d16' }}>
            📁 Upload File
            <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => handleFileChange(e, fileKey)} style={{ display: 'none' }} />
          </label>
        ) : (
          <div style={styles.fileSuccessBadge}>
            <span style={styles.fileName}>{uploadedFiles[fileKey].name}</span>
            <button type="button" onClick={() => handleRemoveFile(fileKey)} style={styles.removeFileBtn}>✕</button>
          </div>
        )}
      </div>
    </div>
  );

  if (isSubmitted) {
    return (
      <div style={styles.contentWrap}>
        <div style={{ ...styles.successCard, border: `2px solid ${themeAccent}`, boxShadow: `0 10px 30px ${themeGlow}` }}>
          <span style={styles.successIcon}>🛡️</span>
          <h2 style={styles.title}>Vetting Pipeline Initialized</h2>
          <p style={styles.subtitle}>Your specialized trade and regulatory credentials have been routed to the compliance verification nodes.</p>
          <div style={{ ...styles.reviewBox, borderColor: themeAccent }}>
            <p style={{ margin: 0 }}><strong>Enterprise:</strong> {formData.companyName}</p>
            <p style={{ margin: '6px 0 0' }}><strong>Tier:</strong> {role === 'SUPPLIER' ? `${supplierRegion} Supplier` : `${buyerRegion} Buyer`}</p>
            {role === 'SUPPLIER' && (
              <p style={{ margin: '6px 0 0' }}><strong>Category:</strong> {commodityType === 'PERISHABLE' ? '🍎 Perishable Fleet' : '📦 Industrial Non-Perishable'}</p>
            )}
            <p style={{ margin: '6px 0 0' }}><strong>Auth Email:</strong> {formData.email}</p>
          </div>
          <button style={{ ...styles.submitBtn, backgroundColor: themeAccent, color: '#090d16' }} onClick={() => window.location.reload()}>Return to Gateway</button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.contentWrap}>
      <div style={{ ...styles.registerCard, border: `2px solid ${themeAccent}`, boxShadow: `0 15px 40px rgba(0,0,0,0.5), 0 0 20px ${themeGlow}` }}>
        <div style={styles.brandHeader}>
          <h2 style={styles.title}>Enterprise Trade Registration</h2>
          <p style={styles.subtitle}>Provide verified regulatory credentials, licenses, and certifications to clear global escrow and customs nodes.</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          
          {/* STEP 1: Main Platform Role Selection */}
          <div style={styles.section}>
            <label style={styles.label}>Select Your Operational Trading Role</label>
            <div style={styles.roleGrid}>
              <div onClick={() => { setRole('SUPPLIER'); setBuyerRegion(''); }} style={{...styles.roleCard, ...(role === 'SUPPLIER' ? { borderColor: '#fbbf24', backgroundColor: 'rgba(251, 191, 36, 0.08)', boxShadow: '0 0 15px rgba(251, 191, 36, 0.2)' } : {})}}>
                <span style={styles.roleIcon}>🚢</span>
                <div style={styles.roleTitle}>Supplier / Vendor Entity</div>
                <div style={styles.roleDesc}>List and vend bulk goods, heavy industrial cargo items, or agricultural lines.</div>
              </div>
              <div onClick={() => { setRole('BUYER'); setSupplierRegion(''); setCommodityType(''); }} style={{...styles.roleCard, ...(role === 'BUYER' ? { borderColor: '#06b6d4', backgroundColor: 'rgba(6, 182, 212, 0.08)', boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)' } : {})}}>
                <span style={styles.roleIcon}>🛒</span>
                <div style={styles.roleTitle}>Procurement Buyer</div>
                <div style={styles.roleDesc}>Deploy corporate liquidity lines and secure programmatic payouts through escrow vaults.</div>
              </div>
            </div>
          </div>

          {/* STEP 2A: Supplier Parameters */}
          {role === 'SUPPLIER' && (
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Supplier Regional Framework</label>
                <select 
                  value={supplierRegion} 
                  onChange={(e) => setSupplierRegion(e.target.value)} 
                  style={{ ...styles.selectInput, borderColor: themeAccent }}
                  required
                >
                  <option value="">-- No Choice Selected (Reset) --</option>
                  <option value="DOMESTIC" style={styles.dropdownOption}>🇮🇳 Indian Local Exporter Terminal</option>
                  <option value="INTERNATIONAL" style={styles.dropdownOption}>🌎 International Cross-Border Node</option>
                </select>
              </div>

              {supplierRegion && (
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Commodity Stream Category</label>
                  <select 
                    value={commodityType} 
                    onChange={(e) => setCommodityType(e.target.value)} 
                    style={{ ...styles.selectInput, borderColor: themeAccent }}
                    required
                  >
                    <option value="">-- No Choice Selected (Reset) --</option>
                    <option value="PERISHABLE" style={styles.dropdownOption}>🍎 Perishable Supply (Agri, Aquaculture, Frozen Logistics)</option>
                    <option value="NON_PERISHABLE" style={styles.dropdownOption}>📦 Non-Perishable Bulk (Heavy Machinery, Ores, Textiles)</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* STEP 2B: Buyer Parameters */}
          {role === 'BUYER' && (
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Buyer Operational Jurisdiction</label>
                <select 
                  value={buyerRegion} 
                  onChange={(e) => setBuyerRegion(e.target.value)} 
                  style={{ ...styles.selectInput, borderColor: themeAccent }}
                  required
                >
                  <option value="">-- No Choice Selected (Reset) --</option>
                  <option value="INTERNATIONAL" style={styles.dropdownOption}>🌎 Offshore Procurement Conglomerate (Foreign Wire Out)</option>
                  <option value="DOMESTIC" style={styles.dropdownOption}>🇮🇳 Inshore Import Brokerage (RBI Clearing Corridor)</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: Regulatory Details Block */}
          {((role === 'SUPPLIER' && supplierRegion && commodityType) || (role === 'BUYER' && buyerRegion)) && (
            <div style={styles.animatedFadeIn}>
              <h3 style={{ ...styles.sectionHeader, color: themeAccent, borderBottomColor: themeAccent }}>Corporate Identity Profile</h3>
              
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Registered Corporate Legal Name</label>
                  <input type="text" name="companyName" required placeholder="e.g., Amama Industrial Supply Ltd" value={formData.companyName} onChange={handleInputChange} style={{ ...styles.input, borderColor: themeAccent }} />
                </div>

                {/* Conditional Indian Clearances */}
                {((role === 'SUPPLIER' && supplierRegion === 'DOMESTIC') || (role === 'BUYER' && buyerRegion === 'DOMESTIC')) && (
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Importer-Exporter Code (10-Digit DGFT IEC)</label>
                    <input type="text" name="iecNumber" required maxLength={10} placeholder="10-Digit Alphanumeric Code" value={formData.iecNumber} onChange={handleInputChange} style={{ ...styles.input, borderColor: themeAccent }} />
                  </div>
                )}

                {/* Advanced Banking Clearances for Indian Importers */}
                {role === 'BUYER' && buyerRegion === 'DOMESTIC' && (
                  <>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Authorized Dealer (AD) Code</label>
                      <input type="text" name="adCode" required placeholder="Bank-linked Forex Settlement Node" value={formData.adCode} onChange={handleInputChange} style={{ ...styles.input, borderColor: themeAccent }} />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>RCMC Certificate Number</label>
                      <input type="text" name="rcmcNumber" placeholder="FIEO / Export Promotion Reference Number" value={formData.rcmcNumber} onChange={handleInputChange} style={{ ...styles.input, borderColor: themeAccent }} />
                    </div>
                  </>
                )}

                {/* Advanced Food Safety Identifications */}
                {role === 'SUPPLIER' && commodityType === 'PERISHABLE' && (
                  <>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>FSSAI License / Registration ID</label>
                      <input type="text" name="fssaiNumber" required placeholder="14-Digit Central Food Licensing Key" value={formData.fssaiNumber} onChange={handleInputChange} style={{ ...styles.input, borderColor: themeAccent }} />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.label}>Commodity Board Registration Reference</label>
                      <select
                        name="boardRegistration"
                        required
                        value={formData.boardRegistration}
                        onChange={handleInputChange}
                        style={{ ...styles.selectInput, borderColor: themeAccent }}
                      >
                        <option value="">-- No Choice Selected (Reset Selection) --</option>
                        <option value="APEDA" style={styles.dropdownOption}>APEDA (Agricultural & Processed Foods)</option>
                        <option value="SPICES_BOARD" style={styles.dropdownOption}>Spices Board India</option>
                        <option value="MPEDA" style={styles.dropdownOption}>MPEDA (Marine Products Development)</option>
                        <option value="TEA_BOARD" style={styles.dropdownOption}>Tea Board of India</option>
                        <option value="COFFEE_BOARD" style={styles.dropdownOption}>Coffee Board of India</option>
                        <option value="OTHER" style={styles.dropdownOption}>Other Regulated Trade Registry</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <h3 style={{ ...styles.sectionHeader, color: themeAccent, borderBottomColor: themeAccent }}>Mandatory Compliance Upload Matrix</h3>
              <div style={{ ...styles.uploadContainerStack, borderColor: themeAccent }}>
                
                {/* DOMESTIC SUPPLIER BASELINE */}
                {role === 'SUPPLIER' && supplierRegion === 'DOMESTIC' && (
                  <>
                    {RenderUploadSlot("Company PAN Matrix Card", "Permanent Account Identity Ledger record.", "panCard")}
                    {RenderUploadSlot("GSTIN Registration Document", "Active Goods & Services Tax verification certificate.", "gstCert")}
                    {RenderUploadSlot("Corporate Bank Validation Ledger", "Official reference statement for escrow routing.", "bankStatement")}
                  </>
                )}

                {/* INTERNATIONAL SUPPLIER BASELINE */}
                {role === 'SUPPLIER' && supplierRegion === 'INTERNATIONAL' && (
                  <>
                    {RenderUploadSlot("Certificate of Incorporation", "Proof of standard business entity creation.", "incorporationCert")}
                    {RenderUploadSlot("Tax Residency Clearance Certificate (TRC)", "Required to cross-verify DTAA withholding percentages.", "taxDoc")}
                    {RenderUploadSlot("SWIFT Wire Reference Credentials", "Formal bank statement verifying global wire corridors.", "bankStatement")}
                  </>
                )}

                {/* SPECIALIZED PERISHABLE ADD-ONS */}
                {role === 'SUPPLIER' && commodityType === 'PERISHABLE' && (
                  <>
                    {RenderUploadSlot("FSSAI Central Operational License", "Mandatory food safety and standard validation tracking logs.", "fssaiDoc")}
                    {RenderUploadSlot("Board Registry Sheet Certificate", "Assigned commodity board tracking compliance file.", "commodityBoardDoc")}
                    {RenderUploadSlot("Phytosanitary Clearance Run", "Proves deep sanitation clearance from agricultural vectors.", "phytosanitaryCert")}
                    {RenderUploadSlot("Cold Chain Management SOP", "HACCP or ISO 22000 validated handling manual.", "qualityCert")}
                  </>
                )}

                {/* SPECIALIZED NON-PERISHABLE ADD-ONS */}
                {role === 'SUPPLIER' && commodityType === 'NON_PERISHABLE' && (
                  <>
                    {RenderUploadSlot("Industrial Quality Standard Clearances", "Standard upload block for ISO, BIS, or CE compliance files.", "qualityCert")}
                  </>
                )}

                {/* INTERNATIONAL BUYER */}
                {role === 'BUYER' && buyerRegion === 'INTERNATIONAL' && (
                  <>
                    {RenderUploadSlot("Offshore Incorporation Registry Certificate", "Official legal corporate configuration document.", "incorporationCert")}
                    {RenderUploadSlot("International Tax Residency Ledger", "Dynamic country origin identification record.", "taxDoc")}
                    {RenderUploadSlot("Foreign Liquidity Reserve Statement", "Verifiable documentation for processing high-value wire runs.", "bankStatement")}
                  </>
                )}

                {/* DOMESTIC BUYER (INDIAN IMPORTER) */}
                {role === 'BUYER' && buyerRegion === 'DOMESTIC' && (
                  <>
                    {RenderUploadSlot("DGFT Importer-Exporter Code File", "Mandatory compliance asset for customs declarations.", "iecDoc")}
                    {RenderUploadSlot("Corporate GSTIN Ledger Copy", "Required for processing inbound local tax credits.", "gstCert")}
                    {RenderUploadSlot("Bank Stamped AD Code Certificate", "Authorized Dealer code assignment letter for foreign exchange.", "adCodeDoc")}
                    {RenderUploadSlot("RCMC Promotion Council Ledger", "Membership confirmation files if claiming customs benefits.", "rcmcDoc")}
                  </>
                )}
              </div>

              <h3 style={{ ...styles.sectionHeader, color: themeAccent, borderBottomColor: themeAccent }}>Platform Security Context</h3>
              <div style={styles.formGrid}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Administrative Business Email</label>
                  <input type="email" name="email" required placeholder="ops@enterprise.com" value={formData.email} onChange={handleInputChange} style={{ ...styles.input, borderColor: themeAccent }} />
                </div>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Account Secret Password</label>
                  <input type="password" name="password" required placeholder="••••••••" value={formData.password} onChange={handleInputChange} style={{ ...styles.input, borderColor: themeAccent }} />
                </div>
              </div>

              <button 
                type="submit" 
                style={{ 
                  ...styles.submitBtn, 
                  backgroundColor: themeAccent, 
                  color: '#090d16',
                  boxShadow: `0 4px 14px ${themeGlow}`
                }}
              >
                Submit Verified Vetting Application
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

const styles = {
  contentWrap: { 
    display: 'flex', 
    alignItems: 'start', 
    justifyContent: 'center', 
    padding: '40px 32px', 
    flex: 1, 
    width: '100%', 
    boxSizing: 'border-box',
    backgroundColor: '#090d16'
  },
  registerCard: { 
    width: '100%', 
    maxWidth: '1200px', 
    backgroundColor: '#1e293b', 
    borderRadius: '16px', 
    padding: '40px',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease'
  },
  successCard: { 
    width: '100%', 
    maxWidth: '540px', 
    backgroundColor: '#1e293b', 
    borderRadius: '16px', 
    padding: '40px', 
    textAlign: 'center', 
    margin: '40px auto',
    boxSizing: 'border-box'
  },
  successIcon: { fontSize: '50px', display: 'block', marginBottom: '16px' },
  brandHeader: { textAlign: 'center', marginBottom: '32px' },
  title: { fontSize: '26px', fontWeight: '900', margin: '0 0 8px', color: '#ffffff' },
  subtitle: { fontSize: '14px', color: '#93c5fd', margin: 0, lineHeight: '1.5', fontWeight: '500' },
  form: { display: 'flex', flexDirection: 'column', gap: '24px' },
  section: { display: 'flex', flexDirection: 'column', gap: '12px' },
  sectionHeader: { 
    fontSize: '12px', 
    fontWeight: '900', 
    textTransform: 'uppercase', 
    borderBottom: '2px solid', 
    paddingBottom: '8px', 
    margin: '36px 0 16px', 
    letterSpacing: '1px',
    transition: 'all 0.3s ease'
  },
  label: { fontSize: '12px', fontWeight: '800', color: '#ffffff', marginBottom: '6px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' },
  roleGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  roleCard: { border: '2px solid #3b82f6', borderRadius: '12px', padding: '24px', cursor: 'pointer', backgroundColor: '#0f172a', transition: 'all 0.25s ease' },
  roleIcon: { fontSize: '28px', display: 'block', marginBottom: '12px' },
  roleTitle: { fontSize: '16px', fontWeight: '800', color: '#ffffff', marginBottom: '6px' },
  roleDesc: { fontSize: '12px', color: '#93c5fd', lineHeight: '1.5' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '12px' },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  input: { padding: '13px 14px', borderRadius: '8px', border: '2px solid #3b82f6', backgroundColor: '#0f172a', color: '#ffffff', fontSize: '14px', outline: 'none', width: '100%', boxSizing: 'border-box' },
  selectInput: { 
    padding: '13px 14px', 
    borderRadius: '8px', 
    border: '2px solid #3b82f6', 
    backgroundColor: '#0f172a', 
    color: '#ffffff', 
    fontSize: '14px', 
    outline: 'none',
    cursor: 'pointer',
    width: '100%',
    boxSizing: 'border-box'
  },
  dropdownOption: { backgroundColor: '#0f172a', color: '#ffffff' },
  uploadContainerStack: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', backgroundColor: '#0f172a', padding: '24px', borderRadius: '12px', border: '2px solid #3b82f6', boxSizing: 'border-box' },
  uploadRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#1e293b', border: '1px solid', borderRadius: '8px', gap: '16px', boxSizing: 'border-box' },
  uploadInfo: { display: 'flex', flexDirection: 'column', flex: 1 },
  docTitle: { fontSize: '13px', fontWeight: '800', color: '#ffffff' },
  docDesc: { fontSize: '11px', color: '#94a3b8', marginTop: '3px', lineHeight: '1.4' },
  uploadZone: { minWidth: '140px', display: 'flex', justifyContent: 'flex-end' },
  fileLabel: { border: '1px solid', padding: '8px 14px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', cursor: 'pointer', display: 'inline-block' },
  fileSuccessBadge: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(74, 222, 128, 0.1)', border: '1px solid #4ade80', padding: '6px 12px', borderRadius: '6px' },
  fileName: { fontSize: '11px', color: '#4ade80', maxWidth: '115px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '700' },
  removeFileBtn: { background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', fontSize: '11px', padding: 0, fontWeight: '800' },
  submitBtn: { width: '100%', marginTop: '32px', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '13px', fontWeight: '800', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px', transition: 'all 0.2s ease' },
  reviewBox: { backgroundColor: '#0f172a', padding: '18px', borderRadius: '8px', textAlign: 'left', margin: '24px 0', fontSize: '13px', border: '2px solid', color: '#ffffff', lineHeight: '1.6' },
  animatedFadeIn: { animation: 'fadeIn 0.25s ease-out' }
};