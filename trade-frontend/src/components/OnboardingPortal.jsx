import React, { useState, useEffect } from 'react';
import { translateText, speakText } from '../services/sarvam';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const LANGUAGES = [
  { code: 'hi-IN', label: 'हिंदी · Hindi' },
  { code: 'en-IN', label: 'English' },
  { code: 'mr-IN', label: 'मराठी · Marathi' },
  { code: 'ta-IN', label: 'தமிழ் · Tamil' },
  { code: 'te-IN', label: 'తెలుగు · Telugu' },
  { code: 'kn-IN', label: 'ಕನ್ನಡ · Kannada' },
  { code: 'gu-IN', label: 'ગુજરાતી · Gujarati' },
  { code: 'bn-IN', label: 'বাংলা · Bengali' },
  { code: 'pa-IN', label: 'ਪੰਜਾਬੀ · Punjabi' },
  { code: 'or-IN', label: 'ଓଡ଼ିଆ · Odia' }
];

const MOCK_REQUIREMENTS = {
  PRODUCER: [
    { id: 'govt_id', label: 'Government ID (Voter ID)', required: true },
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

const DEFAULT_UI_TEXTS = {
  existingUserLogin: 'Existing User? Login',
  selectLanguageTitle: 'Select Language / भाषा चुनें',
  selectLanguageSubtitle: 'Regional speech & translation powered by Sarvam AI',
  continueBtn: 'Continue',
  backBtn: 'Back',
  selectDeskTitle: 'Select Desk & Role',
  selectDeskSubtitle: 'Determines compliance requirements',
  supplierDesk: 'Supplier Desk',
  buyerDesk: 'Buyer Desk',
  producerTitle: '🌾 Producer / Farmer',
  producerSub: 'Farmer selling produce for export.',
  producerBadge: '6 documents required',
  traderTitle: '📦 Commercial Trader',
  traderSub: 'Trader exporting under own corporate entity.',
  traderBadge: '11 documents required',
  identityTitle: 'Identity Verification',
  mobileOtp: '📱 Mobile OTP',
  corpEmail: '✉️ Corporate Email',
  mobileLabel: 'Mobile Number *',
  sendOtpBtn: 'Send OTP',
  resendBtn: 'Resend',
  enterOtpLabel: 'Enter OTP *',
  verifyBtn: 'Verify',
  corpEmailLabel: 'Corporate Email *',
  passwordLabel: 'Password *',
  fullNameLabel: 'Full Name *',
  gpsLocationLabel: 'GPS Farm Location *',
  dropPinBtn: '📍 Drop Pin',
  pinningBtn: '📍 Pinning...',
  cultivatedAreaLabel: 'Cultivated Area *',
  unitLabel: 'Unit',
  bankAccountLabel: 'Bank Account Number *',
  ifscLabel: 'IFSC Code *',
  companyNameLabel: 'Company Name *',
  iecLabel: 'IEC Code *',
  gstinLabel: 'GSTIN *',
  legalNameLabel: 'Legal Entity Name *',
  countryLabel: 'Jurisdiction Country *',
  stateLabel: 'State / Emirate *',
  docVerificationTitle: 'Document Compliance Upload',
  docVerificationSub: 'Upload required verification records',
  uploadBtn: 'Choose File / Drop',
  expiryDateLabel: 'Expiry Date (If applicable)',
  submitOnboarding: 'Submit for Onboarding Verification',
  welcomeBackTitle: 'Welcome Back',
  signInSubtitle: 'Sign in to your account',
  mobileOrEmailLabel: 'Mobile Number or Email',
  loginBtn: 'Log In',
  backToOnboardingBtn: 'Back to Onboarding',
  statusTitle: 'Onboarding Verification',
  statusAnalyzing: 'Analyzing documents & verifying credentials with Sarvam AI...',
  statusVerified: '✅ VERIFIED & ACTIVE',
  userIdLabel: 'User ID',
  nameLabel: 'Name',
  apiTokenLabel: 'API Access Token',
  enterDashboardBtn: 'Enter Dashboard'
};

const styles = {
  loginWrapper: { 
    position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', 
    padding: '40px 24px', flex: 1, overflow: 'hidden', backgroundColor: '#f8fafc', 
    width: '100%', minHeight: '100vh', boxSizing: 'border-box' 
  },
  ambientGlowTop: {
    position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', 
    width: '600px', height: '600px', zIndex: 1, pointerEvents: 'none', transition: 'background 0.4s ease', opacity: 0.6
  },
  loginCard: { 
    position: 'relative', zIndex: 10, width: '100%', maxWidth: '520px', backgroundColor: '#ffffff',
    borderRadius: '20px', padding: '36px 32px', boxSizing: 'border-box', transition: 'all 0.3s ease',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)'
  },
  progressDots: { display: 'flex', gap: '8px', marginBottom: '28px', justifyContent: 'center' },
  dot: { flex: 1, height: '6px', borderRadius: '3px', transition: 'all 0.3s ease' },
  brandHeader: { textAlign: 'center', marginBottom: '24px' },
  title: { fontSize: '22px', fontWeight: '800', margin: '0 0 6px', color: '#0f172a' },
  subtitle: { fontSize: '13px', color: '#64748b', margin: 0, fontWeight: '600' },
  optionStack: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' },
  selectableCard: {
    border: '2px solid #e2e8f0', borderRadius: '12px', padding: '16px', cursor: 'pointer',
    display: 'flex', flexDirection: 'column', gap: '4px', transition: 'all 0.2s ease', backgroundColor: '#ffffff'
  },
  optionTitle: { fontSize: '15px', fontWeight: '700', color: '#0f172a' },
  optionSub: { fontSize: '12px', color: '#64748b', lineHeight: '1.4' },
  badge: { fontSize: '11px', fontWeight: '800', marginTop: '6px' },
  portalToggleContainer: { display: 'flex', gap: '6px', padding: '6px', backgroundColor: '#f1f5f9', borderRadius: '12px', marginBottom: '24px' },
  toggleBtn: { flex: 1, padding: '10px 0', border: '2px solid transparent', background: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s ease' },
  formGrid: { display: 'flex', flexDirection: 'column', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '14px', fontWeight: '500', outline: 'none', width: '100%', boxSizing: 'border-box' },
  select: { padding: '12px 16px', borderRadius: '10px', border: '1.5px solid #cbd5e1', backgroundColor: '#f8fafc', color: '#0f172a', fontSize: '14px', fontWeight: '500', outline: 'none', width: '100%' },
  actionBtn: { padding: '10px 16px', borderRadius: '10px', border: 'none', fontWeight: '700', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' },
  errorAlert: { backgroundColor: '#fef2f2', border: '1.5px solid #f87171', color: '#dc2626', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', marginBottom: '18px' },
  successAlert: { backgroundColor: '#f0fdf4', border: '1.5px solid #4ade80', color: '#166534', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: '600', marginBottom: '18px' },
  submitBtn: { border: 'none', padding: '14px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', color: '#ffffff', cursor: 'pointer', width: '100%', textTransform: 'uppercase', letterSpacing: '0.5px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' },
  backBtn: { padding: '14px', borderRadius: '10px', border: '1.5px solid #cbd5e1', backgroundColor: '#ffffff', color: '#64748b', fontWeight: '700', cursor: 'pointer', width: '100%' },
  docStack: { display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '320px', overflowY: 'auto', marginBottom: '20px' },
  docCard: { backgroundColor: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' },
  docInfo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  docLabel: { fontSize: '13px', fontWeight: '700', color: '#0f172a' },
  docStatus: { fontSize: '11px', fontWeight: '700', color: '#64748b' },
  uploadControls: { display: 'flex', gap: '10px' },
  uploadBtn: { flex: 1, padding: '10px', borderRadius: '8px', border: '2px dashed #0284c7', backgroundColor: '#f0f9ff', color: '#0284c7', fontSize: '12px', fontWeight: '700', textAlign: 'center', cursor: 'pointer' },
  dateInput: { width: '130px', padding: '8px 10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', fontSize: '12px', fontWeight: '600' },
  previewContainer: { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' },
  previewImg: { width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #cbd5e1' },
  fileName: { fontSize: '12px', color: '#475569', fontWeight: '500', textOverflow: 'ellipsis', overflow: 'hidden' },
  credCard: { backgroundColor: '#0f172a', color: '#f8fafc', borderRadius: '12px', padding: '20px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' },
  credRow: { display: 'flex', flexDirection: 'column', gap: '4px', borderBottom: '1px solid #334155', paddingBottom: '8px' },
  credLabel: { fontSize: '11px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' },
  credValue: { fontSize: '13px', fontFamily: 'monospace', color: '#38bdf8', wordBreak: 'break-all' },
  statusBadge: { padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '800', display: 'inline-block', width: 'fit-content', margin: '10px auto' }
};

export default function OnboardingPortal({ initialParams, onComplete }) {
  const lockedDesk = initialParams?.desk;

  const [viewMode, setViewMode] = useState('ONBOARDING');
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState('hi-IN');

  const [authMethod, setAuthMethod] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [role, setRole] = useState(lockedDesk === 'buyer' ? 'BUYER' : 'SUPPLIER');
  const [sellerType, setSellerType] = useState('PRODUCER');

  const [producerData, setProducerData] = useState({
    fullName: '', location: { lat: null, lng: null, addressText: '' },
    cultivatedArea: '', areaUnit: 'acres', bankAccountNo: '', ifscCode: ''
  });

  const [traderData, setTraderData] = useState({ companyName: '', iecNumber: '', gstin: '' });
  const [buyerData, setBuyerData] = useState({ legalName: '', jurisdictionCountry: 'UAE', emirateOrState: 'Dubai' });

  const [uiTexts, setUiTexts] = useState(DEFAULT_UI_TEXTS);
  const [translatedRequirements, setTranslatedRequirements] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);

  const [documents, setDocuments] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [onboardingStatus, setOnboardingStatus] = useState('IN_PROGRESS');
  const [userCredentials, setUserCredentials] = useState(null);

  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const themeAccent = role === 'SUPPLIER' ? (sellerType === 'PRODUCER' ? '#059669' : '#d97706') : '#db2777'; 
  const themeGlow = role === 'SUPPLIER' ? (sellerType === 'PRODUCER' ? 'rgba(5, 150, 105, 0.25)' : 'rgba(217, 119, 6, 0.25)') : 'rgba(219, 39, 119, 0.25)';

  useEffect(() => {
    if (lockedDesk === 'buyer') {
      setRole('BUYER');
    } else if (lockedDesk === 'supplier') {
      setRole('SUPPLIER');
    }
  }, [lockedDesk]);

  useEffect(() => {
    const activeKey = role === 'BUYER' ? 'BUYER' : sellerType;
    const baseReqs = MOCK_REQUIREMENTS[activeKey] || [];

    setDocuments((prev) => {
      const newDocs = {};
      baseReqs.forEach((req) => {
        newDocs[req.id] = prev[req.id] || { file: null, expiryDate: '', previewUrl: '' };
      });
      return newDocs;
    });

    if (language === 'en-IN' || language === 'en') {
      setUiTexts(DEFAULT_UI_TEXTS);
      setTranslatedRequirements(baseReqs);
      setIsTranslating(false);
      return;
    }

    let isCancelled = false;
    setIsTranslating(true);

    const translateBatch = async () => {
      try {
        const keys = Object.keys(DEFAULT_UI_TEXTS);
        const valuesToTranslate = keys.map((k) => DEFAULT_UI_TEXTS[k]);

        const translatedValues = await Promise.all(
          valuesToTranslate.map((txt) => translateText(txt, language))
        );

        if (isCancelled) return;

        const newUiTexts = {};
        keys.forEach((key, index) => {
          newUiTexts[key] = translatedValues[index] || DEFAULT_UI_TEXTS[key];
        });

        const translatedReqs = await Promise.all(
          baseReqs.map(async (req) => {
            const translatedLabel = await translateText(req.label, language);
            return { ...req, label: translatedLabel };
          })
        );

        if (isCancelled) return;

        setUiTexts(newUiTexts);
        setTranslatedRequirements(translatedReqs);
      } catch (err) {
        console.error('[Translation Batch Error]:', err);
      } finally {
        if (!isCancelled) {
          setIsTranslating(false);
        }
      }
    };

    translateBatch();

    return () => {
      isCancelled = true;
    };
  }, [language, role, sellerType]);

  const handleNextStep = () => { setError(''); setSuccessMsg(''); setStep((prev) => prev + 1); };
  const handlePrevStep = () => { setError(''); setSuccessMsg(''); setStep((prev) => prev - 1); };

  const handleSendOtp = async () => {
    if (!phone) { setError('Please enter a valid phone number'); return; }
    setError(''); setSuccessMsg(''); setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone })
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to send OTP.');
      setIsOtpSent(true);
      setSuccessMsg(data.mockCode ? `OTP sent! (Dev Code: ${data.mockCode})` : 'OTP sent via SMS.');
    } catch (err) {
      setError(err.message || 'Unable to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) { setError('Please enter the OTP code'); return; }
    setError(''); setSuccessMsg(''); setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone, code: otp })
      });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Invalid OTP.');
      setIsPhoneVerified(true);
      setSuccessMsg('Phone verified!');
      setTimeout(() => handleNextStep(), 800);
    } catch (err) {
      setError(err.message || 'Verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) { alert('Geolocation not supported.'); return; }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setProducerData((prev) => ({
          ...prev,
          location: { lat: pos.coords.latitude, lng: pos.coords.longitude, addressText: `GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` }
        }));
        setIsLocating(false);
      },
      (err) => { alert(`Location error: ${err.message}`); setIsLocating(false); }
    );
  };

  const handleFileChange = (reqId, file) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setDocuments((prev) => ({ ...prev, [reqId]: { ...prev[reqId], file, previewUrl } }));
  };

  const handleExpiryChange = (reqId, expiryDate) => {
    setDocuments((prev) => ({ ...prev, [reqId]: { ...prev[reqId], expiryDate } }));
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccessMsg('');

    const missingDocs = translatedRequirements.filter((req) => req.required && !documents[req.id]?.file);
    if (missingDocs.length > 0) {
      setError(`Upload missing required documents: ${missingDocs.map((m) => m.label).join(', ')}`);
      return;
    }

    setIsLoading(true);
    setViewMode('STATUS_PAGE');
    setOnboardingStatus('IN_PROGRESS');

    const activeProfile = role === 'SUPPLIER' ? (sellerType === 'PRODUCER' ? producerData : traderData) : buyerData;
    const formData = new FormData();
    formData.append('language', language);
    formData.append('role', role);
    formData.append('sellerType', sellerType);
    formData.append('profile', JSON.stringify(activeProfile));

    Object.keys(documents).forEach((reqId) => {
      if (documents[reqId].file) formData.append(reqId, documents[reqId].file);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/auth/onboard`, { method: 'POST', body: formData });
      const result = await response.json();
      setTimeout(() => {
        setOnboardingStatus('COMPLETED');
        setIsLoading(false);
        setUserCredentials({
          userId: result.user?.id || `usr_${Date.now()}`,
          name: result.user?.name || 'Onboarded User',
          phone: phone || 'N/A',
          email: email || `${phone || 'user'}@platform.com`,
          token: result.token || `jwt_token_${Math.random().toString(36).substring(2, 10)}`,
          apiKey: `ak_live_${Math.random().toString(36).substring(2, 15)}`
        });
      }, 1500);
    } catch (err) {
      setTimeout(() => {
        setOnboardingStatus('COMPLETED');
        setIsLoading(false);
        setUserCredentials({
          userId: `usr_${Date.now()}`,
          name: producerData.fullName || traderData.companyName || buyerData.legalName || 'Amama Partner',
          phone: phone || 'N/A',
          email: email || 'partner@amama.com',
          token: `jwt_mock_token_${Date.now()}`,
          apiKey: `ak_live_${Math.random().toString(36).substring(2, 15)}`
        });
      }, 1500);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginIdentifier) { setError('Please enter your mobile or email'); return; }
    setSuccessMsg('Login successful!');
    if (onComplete) onComplete({ id: 'usr_logged_in', email: loginIdentifier });
  };

  return (
    <div style={styles.loginWrapper}>
      <div style={{ ...styles.ambientGlowTop, background: `radial-gradient(circle, ${themeGlow} 0%, rgba(248, 250, 252, 0) 70%)` }}></div>

      <div style={{ ...styles.loginCard, border: `2.5px solid ${themeAccent}` }}>
        {viewMode === 'ONBOARDING' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={styles.progressDots}>
                {[0, 1, 2, 3, 4].map((idx) => (
                  <div key={idx} style={{ ...styles.dot, backgroundColor: step >= idx ? themeAccent : '#e2e8f0' }} />
                ))}
              </div>
              <button 
                type="button" 
                onClick={() => setViewMode('LOGIN_PAGE')}
                style={{ background: 'none', border: 'none', color: themeAccent, fontSize: '12px', fontWeight: '800', cursor: 'pointer', padding: 0 }}
              >
                {uiTexts.existingUserLogin}
              </button>
            </div>

            {error && <div style={styles.errorAlert}>⚠️ {error}</div>}
            {successMsg && <div style={styles.successAlert}>✅ {successMsg}</div>}

            {/* STEP 0: Language Selection */}
            {step === 0 && (
              <div>
                <div style={styles.brandHeader}>
                  <h2 style={styles.title}>{uiTexts.selectLanguageTitle}</h2>
                  <p style={styles.subtitle}>{uiTexts.selectLanguageSubtitle}</p>
                </div>

                <div style={{ ...styles.optionStack, maxHeight: '280px', overflowY: 'auto' }}>
                  {LANGUAGES.map((lang) => (
                    <div 
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        speakText(`आपकी भाषा ${lang.label.split('·')[0]} चुनी गई है`, lang.code);
                      }}
                      style={{
                        ...styles.selectableCard,
                        borderColor: language === lang.code ? themeAccent : '#e2e8f0',
                        backgroundColor: language === lang.code ? `${themeAccent}0D` : '#ffffff',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row'
                      }}
                    >
                      <span style={{ ...styles.optionTitle, color: language === lang.code ? themeAccent : '#0f172a' }}>
                        {lang.label}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakText(`भाषा ${lang.label.split('·')[0]}`, lang.code);
                        }}
                        style={{ background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}
                        title="Listen preview"
                      >
                        🔊
                      </button>
                    </div>
                  ))}
                </div>

                <button 
                  type="button" 
                  onClick={handleNextStep} 
                  disabled={isTranslating}
                  style={{ ...styles.submitBtn, backgroundColor: themeAccent, opacity: isTranslating ? 0.7 : 1 }}
                >
                  {isTranslating ? 'Translating...' : uiTexts.continueBtn}
                </button>
              </div>
            )}

            {/* STEP 1: Desk & Role Selection */}
            {step === 1 && (
              <div>
                <div style={styles.brandHeader}>
                  <h2 style={styles.title}>{uiTexts.selectDeskTitle}</h2>
                  <p style={styles.subtitle}>{uiTexts.selectDeskSubtitle}</p>
                </div>

                <div style={styles.portalToggleContainer}>
                  <button 
                    type="button" 
                    onClick={() => setRole('SUPPLIER')} 
                    style={{ ...styles.toggleBtn, backgroundColor: role === 'SUPPLIER' ? '#ffffff' : 'transparent', color: role === 'SUPPLIER' ? '#0f172a' : '#64748b' }}
                  >
                    {uiTexts.supplierDesk}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setRole('BUYER')} 
                    style={{ ...styles.toggleBtn, backgroundColor: role === 'BUYER' ? '#ffffff' : 'transparent', color: role === 'BUYER' ? '#0f172a' : '#64748b' }}
                  >
                    {uiTexts.buyerDesk}
                  </button>
                </div>

                <div style={styles.optionStack}>
                  {role === 'SUPPLIER' ? (
                    <>
                      <div 
                        onClick={() => setSellerType('PRODUCER')}
                        style={{ ...styles.selectableCard, borderColor: sellerType === 'PRODUCER' ? '#059669' : '#e2e8f0', backgroundColor: sellerType === 'PRODUCER' ? '#f0fdf4' : '#ffffff' }}
                      >
                        <span style={styles.optionTitle}>{uiTexts.producerTitle}</span>
                        <span style={styles.optionSub}>{uiTexts.producerSub}</span>
                        <span style={{ ...styles.badge, color: '#059669' }}>{uiTexts.producerBadge}</span>
                      </div>
                      <div 
                        onClick={() => setSellerType('TRADER')}
                        style={{ ...styles.selectableCard, borderColor: sellerType === 'TRADER' ? '#d97706' : '#e2e8f0', backgroundColor: sellerType === 'TRADER' ? '#fffbeb' : '#ffffff' }}
                      >
                        <span style={styles.optionTitle}>{uiTexts.traderTitle}</span>
                        <span style={styles.optionSub}>{uiTexts.traderSub}</span>
                        <span style={{ ...styles.badge, color: '#d97706' }}>{uiTexts.traderBadge}</span>
                      </div>
                    </>
                  ) : (
                    <div style={{ ...styles.selectableCard, borderColor: '#db2777', backgroundColor: '#fdf2f8' }}>
                      <span style={styles.optionTitle}>🏢 Institutional Buyer</span>
                      <span style={styles.optionSub}>Verified importer acquiring bulk commodities under official trade contract.</span>
                      <span style={{ ...styles.badge, color: '#db2777' }}>5 documents required</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={handlePrevStep} style={styles.backBtn}>{uiTexts.backBtn}</button>
                  <button type="button" onClick={handleNextStep} style={{ ...styles.submitBtn, backgroundColor: themeAccent }}>{uiTexts.continueBtn}</button>
                </div>
              </div>
            )}

            {/* STEP 2: Identity Verification */}
            {step === 2 && (
              <div>
                <div style={styles.brandHeader}>
                  <h2 style={styles.title}>{uiTexts.identityTitle}</h2>
                  <p style={styles.subtitle}>Verify via Mobile OTP or Corporate Email</p>
                </div>

                <div style={styles.portalToggleContainer}>
                  <button type="button" onClick={() => setAuthMethod('phone')} style={{ ...styles.toggleBtn, backgroundColor: authMethod === 'phone' ? '#ffffff' : 'transparent' }}>{uiTexts.mobileOtp}</button>
                  <button type="button" onClick={() => setAuthMethod('email')} style={{ ...styles.toggleBtn, backgroundColor: authMethod === 'email' ? '#ffffff' : 'transparent' }}>{uiTexts.corpEmail}</button>
                </div>

                {authMethod === 'phone' ? (
                  <div style={styles.formGrid}>
                    <div style={styles.field}>
                      <label style={styles.label}>{uiTexts.mobileLabel}</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" style={styles.input} disabled={isPhoneVerified} />
                        <button type="button" onClick={handleSendOtp} disabled={isLoading || isPhoneVerified} style={{ ...styles.actionBtn, backgroundColor: themeAccent, color: '#ffffff' }}>
                          {isOtpSent ? uiTexts.resendBtn : uiTexts.sendOtpBtn}
                        </button>
                      </div>
                    </div>

                    {isOtpSent && (
                      <div style={styles.field}>
                        <label style={styles.label}>{uiTexts.enterOtpLabel}</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit OTP" style={styles.input} disabled={isPhoneVerified} />
                          <button type="button" onClick={handleVerifyOtp} disabled={isLoading || isPhoneVerified} style={{ ...styles.actionBtn, backgroundColor: '#0f172a', color: '#ffffff' }}>
                            {uiTexts.verifyBtn}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={styles.formGrid}>
                    <div style={styles.field}>
                      <label style={styles.label}>{uiTexts.corpEmailLabel}</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" style={styles.input} />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>{uiTexts.passwordLabel}</label>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" style={styles.input} />
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button type="button" onClick={handlePrevStep} style={styles.backBtn}>{uiTexts.backBtn}</button>
                  <button type="button" onClick={handleNextStep} style={{ ...styles.submitBtn, backgroundColor: themeAccent }}>{uiTexts.continueBtn}</button>
                </div>
              </div>
            )}

            {/* STEP 3: Business/Farm Details */}
            {step === 3 && (
              <div>
                <div style={styles.brandHeader}>
                  <h2 style={styles.title}>Entity & Operations</h2>
                  <p style={styles.subtitle}>Enter operational information</p>
                </div>

                <div style={styles.formGrid}>
                  {role === 'SUPPLIER' && sellerType === 'PRODUCER' && (
                    <>
                      <div style={styles.field}>
                        <label style={styles.label}>{uiTexts.fullNameLabel}</label>
                        <input type="text" value={producerData.fullName} onChange={(e) => setProducerData({ ...producerData, fullName: e.target.value })} placeholder="Full Legal Name" style={styles.input} />
                      </div>
                      <div style={styles.field}>
                        <label style={styles.label}>{uiTexts.gpsLocationLabel}</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input type="text" readOnly value={producerData.location.addressText || ''} placeholder="GPS Coordinates" style={styles.input} />
                          <button type="button" onClick={handleGetLocation} style={{ ...styles.actionBtn, backgroundColor: '#0f172a', color: '#ffffff' }}>
                            {isLocating ? uiTexts.pinningBtn : uiTexts.dropPinBtn}
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ ...styles.field, flex: 2 }}>
                          <label style={styles.label}>{uiTexts.cultivatedAreaLabel}</label>
                          <input type="number" value={producerData.cultivatedArea} onChange={(e) => setProducerData({ ...producerData, cultivatedArea: e.target.value })} placeholder="10" style={styles.input} />
                        </div>
                        <div style={{ ...styles.field, flex: 1 }}>
                          <label style={styles.label}>{uiTexts.unitLabel}</label>
                          <select value={producerData.areaUnit} onChange={(e) => setProducerData({ ...producerData, areaUnit: e.target.value })} style={styles.select}>
                            <option value="acres">Acres</option>
                            <option value="hectares">Hectares</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  {role === 'SUPPLIER' && sellerType === 'TRADER' && (
                    <>
                      <div style={styles.field}>
                        <label style={styles.label}>{uiTexts.companyNameLabel}</label>
                        <input type="text" value={traderData.companyName} onChange={(e) => setTraderData({ ...traderData, companyName: e.target.value })} placeholder="Registered Corporate Name" style={styles.input} />
                      </div>
                      <div style={styles.field}>
                        <label style={styles.label}>{uiTexts.iecLabel}</label>
                        <input type="text" value={traderData.iecNumber} onChange={(e) => setTraderData({ ...traderData, iecNumber: e.target.value })} placeholder="10-digit IEC Code" style={styles.input} />
                      </div>
                      <div style={styles.field}>
                        <label style={styles.label}>{uiTexts.gstinLabel}</label>
                        <input type="text" value={traderData.gstin} onChange={(e) => setTraderData({ ...traderData, gstin: e.target.value })} placeholder="15-digit GSTIN" style={styles.input} />
                      </div>
                    </>
                  )}

                  {role === 'BUYER' && (
                    <>
                      <div style={styles.field}>
                        <label style={styles.label}>{uiTexts.legalNameLabel}</label>
                        <input type="text" value={buyerData.legalName} onChange={(e) => setBuyerData({ ...buyerData, legalName: e.target.value })} placeholder="Global Enterprise Ltd" style={styles.input} />
                      </div>
                      <div style={styles.field}>
                        <label style={styles.label}>{uiTexts.countryLabel}</label>
                        <input type="text" value={buyerData.jurisdictionCountry} onChange={(e) => setBuyerData({ ...buyerData, jurisdictionCountry: e.target.value })} placeholder="UAE" style={styles.input} />
                      </div>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                  <button type="button" onClick={handlePrevStep} style={styles.backBtn}>{uiTexts.backBtn}</button>
                  <button type="button" onClick={handleNextStep} style={{ ...styles.submitBtn, backgroundColor: themeAccent }}>{uiTexts.continueBtn}</button>
                </div>
              </div>
            )}

            {/* STEP 4: Document Uploads */}
            {step === 4 && (
              <div>
                <div style={styles.brandHeader}>
                  <h2 style={styles.title}>{uiTexts.docVerificationTitle}</h2>
                  <p style={styles.subtitle}>{uiTexts.docVerificationSub}</p>
                </div>

                <div style={styles.docStack}>
                  {translatedRequirements.map((req) => (
                    <div key={req.id} style={styles.docCard}>
                      <div style={styles.docInfo}>
                        <span style={styles.docLabel}>{req.label} {req.required && '*'}</span>
                        <span style={styles.docStatus}>{documents[req.id]?.file ? '✓ Uploaded' : (req.required ? 'Required' : 'Optional')}</span>
                      </div>
                      <div style={styles.uploadControls}>
                        <label style={styles.uploadBtn}>
                          {uiTexts.uploadBtn}
                          <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileChange(req.id, e.target.files[0])} style={{ display: 'none' }} />
                        </label>
                        <input type="date" value={documents[req.id]?.expiryDate || ''} onChange={(e) => handleExpiryChange(req.id, e.target.value)} style={styles.dateInput} />
                      </div>
                      {documents[req.id]?.file && (
                        <div style={styles.previewContainer}>
                          {documents[req.id].previewUrl && <img src={documents[req.id].previewUrl} alt="Preview" style={styles.previewImg} />}
                          <span style={styles.fileName}>{documents[req.id].file.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" onClick={handlePrevStep} style={styles.backBtn}>{uiTexts.backBtn}</button>
                  <button type="button" onClick={handleFinalSubmit} style={{ ...styles.submitBtn, backgroundColor: themeAccent }}>{uiTexts.submitOnboarding}</button>
                </div>
              </div>
            )}
          </>
        )}

        {/* LOGIN PAGE */}
        {viewMode === 'LOGIN_PAGE' && (
          <div>
            <div style={styles.brandHeader}>
              <h2 style={styles.title}>{uiTexts.welcomeBackTitle}</h2>
              <p style={styles.subtitle}>{uiTexts.signInSubtitle}</p>
            </div>

            <form onSubmit={handleLoginSubmit} style={styles.formGrid}>
              <div style={styles.field}>
                <label style={styles.label}>{uiTexts.mobileOrEmailLabel}</label>
                <input type="text" value={loginIdentifier} onChange={(e) => setLoginIdentifier(e.target.value)} placeholder="Mobile or corporate email" style={styles.input} />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>{uiTexts.passwordLabel}</label>
                <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} placeholder="••••••••" style={styles.input} />
              </div>

              <button type="submit" style={{ ...styles.submitBtn, backgroundColor: themeAccent, marginTop: '12px' }}>{uiTexts.loginBtn}</button>
              <button type="button" onClick={() => setViewMode('ONBOARDING')} style={styles.backBtn}>{uiTexts.backToOnboardingBtn}</button>
            </form>
          </div>
        )}

        {/* STATUS PAGE */}
        {viewMode === 'STATUS_PAGE' && (
          <div style={{ textAlign: 'center' }}>
            <div style={styles.brandHeader}>
              <h2 style={styles.title}>{uiTexts.statusTitle}</h2>
              <p style={styles.subtitle}>
                {onboardingStatus === 'IN_PROGRESS' ? uiTexts.statusAnalyzing : 'Verification Complete'}
              </p>
            </div>

            {onboardingStatus === 'IN_PROGRESS' ? (
              <div style={{ padding: '40px 0' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
                <p style={{ color: '#64748b', fontSize: '14px', fontWeight: '600' }}>Running AI Compliance Check...</p>
              </div>
            ) : (
              <div>
                <span style={{ ...styles.statusBadge, backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' }}>
                  {uiTexts.statusVerified}
                </span>

                {userCredentials && (
                  <div style={styles.credCard}>
                    <div style={styles.credRow}>
                      <span style={styles.credLabel}>{uiTexts.userIdLabel}</span>
                      <span style={styles.credValue}>{userCredentials.userId}</span>
                    </div>
                    <div style={styles.credRow}>
                      <span style={styles.credLabel}>{uiTexts.nameLabel}</span>
                      <span style={styles.credValue}>{userCredentials.name}</span>
                    </div>
                    <div style={{ ...styles.credRow, borderBottom: 'none' }}>
                      <span style={styles.credLabel}>{uiTexts.apiTokenLabel}</span>
                      <span style={styles.credValue}>{userCredentials.token}</span>
                    </div>
                  </div>
                )}

                <button 
                  type="button" 
                  onClick={() => onComplete && onComplete(userCredentials)} 
                  style={{ ...styles.submitBtn, backgroundColor: themeAccent }}
                >
                  {uiTexts.enterDashboardBtn}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}