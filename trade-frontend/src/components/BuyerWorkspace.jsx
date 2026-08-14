import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';

// SAFE FALLBACK FOR VITE ENVIRONMENTS WHERE NODE'S 'process' IS NOT POLYFILLED
if (typeof process === 'undefined') {
  window.process = { env: {} };
}

// CONFIGURE API BASE URL (Vite environment variables primary, fallback to Node env or localhost)
const API_BASE_URL =
  import.meta.env?.VITE_BACKEND_URL ||
  process.env?.REACT_APP_API_URL ||
  'http://localhost:5000';

// Mirrors OnboardingPortal.jsx's MOCK_REQUIREMENTS.BUYER. Used to render one
// upload slot per actual required document (instead of a single generic
// "Step 1 File" blob) so each upload can be matched back to its own
// requirement, and so a rejected document can be individually replaced
// without touching the others.
const BUYER_REQUIRED_DOCS = [
    { id: 'trade_licence', label: 'Corporate Trade Licence' },
    { id: 'vat_trn', label: 'VAT / Tax Registration Certificate' },
    { id: 'customs_code', label: 'Import Customs Code / Port Clearance' },
    { id: 'food_control', label: 'ZAD / Food Control Authority Registration' },
    { id: 'auth_signatory_id', label: 'Authorised Signatory Passport / ID' }
];

// --- SEED DATA: TOP 5 SUPPLIERS VERIFIED BY AMAMA ---
// AMAMA Gateway only trades in perishable goods — no grains/rice/other
// non-perishable commodities belong in this list.
// TOP_5_SELLERS used to be hardcoded demo data here. It's now fetched
// live from GET /api/v1/directory/sellers (see the useEffect below) so
// the Exporters Directory reflects real onboarded supplier accounts.

const DEFAULT_INITIAL_DOCS = {
  onboardingDocs: [
    { id: 'trade_licence', label: 'Corporate Trade Licence', status: 'VERIFIED' },
    { id: 'vat_trn', label: 'VAT / Tax Registration Certificate', status: 'VERIFIED' },
    { id: 'customs_code', label: 'Import Customs Code / Port Clearance', status: 'VERIFIED' },
    { id: 'food_control', label: 'ZAD / Food Control Registration', status: 'VERIFIED' },
    { id: 'auth_signatory_id', label: 'Authorised Signatory Passport / ID', status: 'VERIFIED' }
  ]
};

function DocumentRoadmapPanel({ stepDocuments, currentStepNum, isLoadingDocs, isDirectoryUnlocked }) {
  const roadmapItems = [
    { stepNum: 1, step: 'Step 1: KYC', doc: 'Certificate of Incorporation', auth: 'Corporate Registry', ready: !!stepDocuments.step1 },
    { stepNum: 2, step: 'Step 2: RFQ', doc: 'Exporters Directory Unlock Fee ($5,000)', auth: 'AMAMA Gateway Billing', ready: isDirectoryUnlocked },
    { stepNum: 3, step: 'Step 3: Contract', doc: 'AMAMA Generated Sales Contract', auth: 'Legal Team / Both Parties', ready: !!stepDocuments.step3 },
    { stepNum: 4, step: 'Step 4: Escrow', doc: 'Bank Escrow Wire Advice', auth: 'Issuing Bank', ready: !!stepDocuments.step4 },
    { stepNum: 5, step: 'Step 5: QC', doc: 'SGS / BV QC Report', auth: 'SGS Inspection Authority', ready: !!stepDocuments.step5_qc },
    { stepNum: 5, step: 'Step 5: BL Settlement', doc: 'Original Bill of Lading', auth: 'Carrier / Shipping Line', ready: !!stepDocuments.step5_bl }
  ];

  return (
    <div style={styles.cardBox}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <span style={{ fontSize: '16px' }}>📑</span>
        <h3 style={styles.cardHeading}>Upfront Document Preparation Roadmap</h3>
      </div>
      <p style={styles.cardSub}>Request authority issuance in advance for seamless execution across all steps.</p>

      {isLoadingDocs ? (
        <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '11px' }}>
          ⌛ Synchronizing compliance documents...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
          {roadmapItems.map((r, i) => {
            const isCurrentStep = r.stepNum === currentStepNum;
            const isPastStep = r.stepNum < currentStepNum;

            return (
              <div
                key={i}
                style={{
                  ...styles.roadmapTile,
                  borderLeft: isCurrentStep ? '4px solid #0f766e' : '1px solid #e2e8f0',
                  backgroundColor: isCurrentStep ? '#f0fdf4' : '#f8fafc'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '900', color: isCurrentStep ? '#0f766e' : '#64748b' }}>
                      {r.step}
                    </span>
                    {isCurrentStep && (
                      <span style={{ fontSize: '8px', fontWeight: '900', color: '#0f766e', backgroundColor: '#ccfbf1', padding: '1px 5px', borderRadius: '3px' }}>
                        CURRENT STEP
                      </span>
                    )}
                    {isPastStep && r.ready && (
                      <span style={{ fontSize: '8px', fontWeight: '900', color: '#15803d', backgroundColor: '#dcfce7', padding: '1px 5px', borderRadius: '3px' }}>
                        VERIFIED ✓
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>{r.doc}</div>
                  <div style={{ fontSize: '9.5px', color: '#64748b' }}>Authority: {r.auth}</div>
                </div>

                <span style={r.ready ? styles.badgeSuccess : styles.badgeInactive}>
                  {r.ready ? 'READY ✓' : 'PREPARE'}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function BuyerWorkspace({ user }) {
  const currentUserId = user?.id || 'usr_buyer_99';
  const currentUserRole = user?.role || 'BUYER';
  const currentUserName = user?.companyName || 'Global Trade Enterprise LLC';

  const [activeTab, setActiveTab] = useState('kyc');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [sellersList, setSellersList] = useState([]);
  const [isLoadingSellers, setIsLoadingSellers] = useState(true);
  const [sellersLoadError, setSellersLoadError] = useState('');

  // Real Exporters Directory — replaces the old hardcoded TOP_5_SELLERS demo
  // list with genuine onboarded SUPPLIER accounts from the backend. Pulled
  // into a stable function so it can be re-run live (see the socket effect
  // below) whenever a new supplier registers, not just on mount.
  const fetchSellersList = useCallback(() => {
    let cancelled = false;
    setIsLoadingSellers(true);
    fetch(`${API_BASE_URL}/api/v1/directory/sellers`)
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        setSellersList(Array.isArray(data.sellers) ? data.sellers : []);
        setSellersLoadError('');
      })
      .catch(err => {
        if (cancelled) return;
        console.error('Failed to load exporters directory:', err);
        setSellersLoadError('Unable to load the exporters directory. Please check your connection and try again.');
        setSellersList([]);
      })
      .finally(() => { if (!cancelled) setIsLoadingSellers(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const cancel = fetchSellersList();
    return cancel;
  }, [fetchSellersList]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [workflowStep, setWorkflowStep] = useState(1);

  const [stepDocuments, setStepDocuments] = useState({
    step1: null,
    step2: null,
    step3: null,
    step4: null,
    step5_qc: null,
    step5_bl: null
  });

  const [onboardingDocs, setOnboardingDocs] = useState(DEFAULT_INITIAL_DOCS.onboardingDocs);
  const [uploadedDocs, setUploadedDocs] = useState([]);

  // FIX: admin-set statuses arrive as 'Approved'/'Rejected' (mixed case)
  // while freshly-uploaded docs default to 'PENDING_VERIFICATION' (upper
  // case) -- a strict-case allowlist here meant an admin approval could
  // NEVER satisfy this check, so the Complete-Step-1 button stayed disabled
  // even after every document was approved. Normalize case and only block
  // on an actual rejection.
  const isOnboardingVerified = onboardingDocs.every(
    d => (d.status || '').toUpperCase() !== 'REJECTED'
  );

  const [kycData, setKycData] = useState({
    companyName: user?.companyName || 'Global Trade Enterprise LLC',
    taxId: 'US-99882211',
    country: 'United States'
  });

  const [extraDocName, setExtraDocName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // --- STEP 2: EXPORTERS DIRECTORY UNLOCK (PAYWALL, mirrors the supplier's
  // buyer-directory unlock) + COMMODITY CATEGORY FILTER ---
  const [isDirectoryUnlocked, setIsDirectoryUnlocked] = useState(false);
  const [directoryUnlockStatus, setDirectoryUnlockStatus] = useState('idle');
  const DIRECTORY_UNLOCK_FEE = 5000;
  const [selectedCommodityFilter, setSelectedCommodityFilter] = useState('ALL');
  const perishableGoodsOptions = Array.from(new Set(sellersList.map(s => s.commodity)));

  const [selectedSeller, setSelectedSeller] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(40);
  const [negotiatedPrice, setNegotiatedPrice] = useState(0);

  // Default to the first loaded seller once the directory arrives (or the
  // user hasn't picked one yet) — TOP_5_SELLERS[0] used to be available
  // synchronously; now it only exists after the fetch above resolves.
  useEffect(() => {
    if (!selectedSeller && sellersList.length > 0) {
      setSelectedSeller(sellersList[0]);
      setOrderQuantity(sellersList[0].moq || 40);
      setNegotiatedPrice(sellersList[0].unitPrice || 0);
    }
  }, [sellersList, selectedSeller]);

  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSellerTyping, setIsSellerTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isDealClosed, setIsDealClosed] = useState(false);

  const chatBottomRef = useRef(null);

  // Refs so the long-lived socket listeners always see the latest tab/seller
  // without needing to re-subscribe on every render.
  const activeTabRef = useRef(activeTab);
  const selectedSellerRef = useRef(selectedSeller);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => { selectedSellerRef.current = selectedSeller; }, [selectedSeller]);

  const fileInputRef1 = useRef(null);
  const fileInputRef4 = useRef(null);

  // --- SOCKET.IO CHAT (backend-authoritative, live, and persisted) ---
  // Mirrors the same rewrite done on the Supplier Workspace: the server is
  // the single source of truth for every conversation. This client never
  // appends a message locally on send — it only renders what the server
  // broadcasts back, so it stays in sync with the seller's own app and any
  // other open tab.
  useEffect(() => {
    const newSocket = io(API_BASE_URL, {
      query: { userId: currentUserId, role: 'BUYER' },
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
      autoConnect: true
    });

    setSocket(newSocket);

    // Sent by the server right after chat:join, scoped to the seller the
    // client asked to open. Guard against a stale response landing after
    // the user has already switched to a different seller.
    const handleHistory = ({ supplierId, messages }) => {
      if (selectedSellerRef.current && supplierId === selectedSellerRef.current.id) {
        setChatMessages(Array.isArray(messages) ? messages : []);
      }
    };

    const handleIncomingMessage = (incomingMsg) => {
      const isForOpenConversation = selectedSellerRef.current && incomingMsg.supplierId === selectedSellerRef.current.id;
      const isCurrentlyViewing = isForOpenConversation && activeTabRef.current === 'contract';

      if (isCurrentlyViewing) {
        setChatMessages((prev) => [...prev, incomingMsg]);
      }
      // Notifications-on-a-different-tab aren't part of this workspace's UI
      // (there's no bell/notifications menu here, unlike the supplier side)
      // — if one gets added later, hook it in right here using the same
      // isCurrentlyViewing gate the supplier side uses.
    };

    const handleTyping = ({ supplierId, isTyping }) => {
      if (selectedSellerRef.current && supplierId === selectedSellerRef.current.id) {
        setIsSellerTyping(!!isTyping);
      }
    };

    newSocket.on('chat:history', handleHistory);
    newSocket.on('chat:receive_message', handleIncomingMessage);
    newSocket.on('chat:typing', handleTyping);

    // Admin approves/rejects a compliance document, or a document gets
    // (re)uploaded — reflect it live for this buyer if it's their own
    // document (server broadcasts globally, so filter to this user's own
    // uploads) by actually refetching, not just toasting. Also pick up a
    // brand-new supplier registering elsewhere by refreshing the Exporters
    // Directory, so this buyer sees them without a manual page refresh.
    const handleVerificationUpdate = (data) => {
      if (!data || !data.type) return;

      if (data.type === 'USER_REGISTERED') {
        if (data.roleCategory === 'suppliers') fetchSellersList();
        return;
      }

      if (data.type !== 'DOCUMENT_STATUS_CHANGED' && data.type !== 'DOCUMENTS_UPLOADED') return;
      const doc = data.document || (Array.isArray(data.documents) ? data.documents[0] : null) || {};
      const ownerId = data.userId || doc.userId;
      if (ownerId !== currentUserId) return;

      fetchDocumentsData();

      if (data.type === 'DOCUMENT_STATUS_CHANGED') {
        const label = doc.originalName || doc.fileName || 'Document';
        triggerToast(`📄 "${label}" was marked ${data.status} by AMAMA Admin${data.remarks ? `: ${data.remarks}` : ''}`);
      }
    };

    newSocket.on('VERIFICATION_UPDATE_EVENT', handleVerificationUpdate);

    return () => {
      newSocket.off('chat:history', handleHistory);
      newSocket.off('chat:receive_message', handleIncomingMessage);
      newSocket.off('chat:typing', handleTyping);
      newSocket.off('VERIFICATION_UPDATE_EVENT', handleVerificationUpdate);
      newSocket.disconnect();
    };
  }, [currentUserId]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isSellerTyping]);

  // Joins the persistent chat room for this buyer+seller pair on the
  // backend and clears the local view while we wait for that room's
  // history to arrive.
  const joinSellerChatRoom = (seller) => {
    setSelectedSeller(seller);
    selectedSellerRef.current = seller; // keep the ref in sync synchronously so the
    // chat:history / chat:receive_message listeners (which read the ref, not
    // React state) accept the very next server event for this seller.
    setChatMessages([]);

    if (socket && socket.connected) {
      socket.emit('chat:join', {
        supplierId: seller.id,
        buyerId: currentUserId
      });
    } else {
      triggerToast('❌ Not connected to chat server — reconnecting...');
    }
  };

  // Backend-authoritative send: the server persists the message and
  // broadcasts it back over chat:receive_message, which is what actually
  // renders it — this keeps every open tab, and the seller's own app,
  // showing the exact same live thread.
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isDealClosed || !selectedSeller) return;

    if (!socket || !socket.connected) {
      triggerToast('❌ Not connected to chat server. Please check your connection.');
      return;
    }

    socket.emit('chat:send_message', {
      supplierId: selectedSeller?.id,
      buyerId: currentUserId,
      senderId: currentUserId,
      senderRole: 'BUYER',
      sender: currentUserName,
      text: newMessage.trim(),
      context: { negotiatedPrice, orderQuantity }
    });

    setNewMessage('');
  };

  // --- SAFE DOCUMENT FETCHING FROM API ---
  const fetchDocumentsData = useCallback(async () => {
    setIsLoadingDocs(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/verification/user/${currentUserId}`);
      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Non-JSON response received');
      }

      const data = await response.json();
      if (data.success && Array.isArray(data.documents)) {
        setUploadedDocs(data.documents);

        const mappedOnboardingDocs = data.documents.map((doc, i) => ({
          id: doc.id || `backend_doc_${i}`,
          label: doc.originalName || doc.fileName || `Verified Document ${i + 1}`,
          status: doc.status || 'VERIFIED'
        }));

        if (mappedOnboardingDocs.length > 0) {
          setOnboardingDocs(mappedOnboardingDocs);
        }

        const mappedSteps = {};
        data.documents.forEach(doc => {
          if (doc.stepKey) {
            mappedSteps[doc.stepKey] = {
              name: doc.originalName || doc.fileName,
              size: doc.size ? (doc.size / 1024).toFixed(1) + ' KB' : 'N/A',
              date: doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleTimeString() : new Date().toLocaleTimeString()
            };
          }
        });
        if (Object.keys(mappedSteps).length > 0) {
          setStepDocuments(prev => ({ ...prev, ...mappedSteps }));
        }
      }
    } catch (error) {
      console.warn('Backend documents fetch notice:', error.message);
    } finally {
      setIsLoadingDocs(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchDocumentsData();
  }, [fetchDocumentsData]);

  // Per-slot status for each real required document, derived from the raw
  // fetched documents (uploadedDocs here is stored unmodified from the API,
  // so fieldName/adminRemarks are already present on each entry).
  const getDocSlotStatus = (docId) => {
    const matches = (uploadedDocs || []).filter(d => (d.fieldName || d.documentType) === docId);
    if (matches.length === 0) return { state: 'missing' };
    const doc = matches[matches.length - 1];
    const statusUpper = (doc.status || '').toUpperCase();
    if (statusUpper === 'REJECTED') return { state: 'rejected', reason: doc.adminRemarks, doc };
    if (statusUpper === 'APPROVED' || statusUpper === 'VERIFIED') return { state: 'approved', doc };
    return { state: 'pending', doc };
  };

  // Derive stepDocuments.step1 from REAL per-document status instead of a
  // single generic file — only advances, never regresses, workflowStep.
  // (isOnboardingVerified, defined above, independently blocks Step 1
  // completion whenever any onboarding document is REJECTED, so that gate
  // and this one reinforce each other rather than duplicating logic.)
  useEffect(() => {
    const allReady = BUYER_REQUIRED_DOCS.every(rd => {
      const s = getDocSlotStatus(rd.id).state;
      return s === 'pending' || s === 'approved';
    });

    setStepDocuments(prev => {
      if (allReady && !prev.step1) {
        return { ...prev, step1: { name: `${BUYER_REQUIRED_DOCS.length} KYC document(s) submitted`, date: new Date().toLocaleTimeString() } };
      }
      if (!allReady && prev.step1) {
        return { ...prev, step1: null };
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedDocs]);

  const [paymentStatus, setPaymentStatus] = useState('idle');

  const [liveTradeData, setLiveTradeData] = useState({
    vesselName: 'MV OCEAN PHOENIX V-402',
    lat: '24.8607° N',
    lng: '67.0011° E',
    tempC: '18.0°C',
    humidityPct: '52%',
    etaDays: 6,
    routeProgress: 52,
    containerId: 'CONT-892011-X'
  });

  const [liveLogs, setLiveLogs] = useState([]);
  const [escrowTranches, setEscrowTranches] = useState([
    { id: 1, name: 'Tranche 1: Advance Deposit', percent: 25, status: 'LOCKED', reqDocKey: 'step4', triggerLabel: 'PO Signing & Initial Wire Deposit' },
    { id: 2, name: 'Tranche 2: Inspection Approval', percent: 35, status: 'LOCKED', reqDocKey: 'step5_qc', triggerLabel: 'Requires Verified SGS / BV QC Report' },
    { id: 3, name: 'Tranche 3: Bill of Lading Settlement', percent: 40, status: 'LOCKED', reqDocKey: 'step5_bl', triggerLabel: 'Requires Original Bill of Lading Delivery' }
  ]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const totalPrice = orderQuantity * negotiatedPrice;

  const isStep1Completed = workflowStep > 1;
  const isStep2Completed = workflowStep > 2;
  const isStep3Completed = workflowStep > 3;
  const isStep4Completed = workflowStep > 4;
  const isStep5Completed = workflowStep === 5;
  const is100PercentCompleted = isStep1Completed && isStep2Completed && isStep3Completed && isStep4Completed && isStep5Completed;

  const currentStepNum = activeTab === 'kyc' ? 1
    : activeTab === 'sellers' ? 2
    : activeTab === 'contract' ? 3
    : activeTab === 'escrow' ? 4
    : activeTab === 'live' ? 5 : workflowStep;

  useEffect(() => {
    if (workflowStep !== 5) return;
    const interval = setInterval(() => {
      setLiveTradeData(prev => ({
        ...prev,
        routeProgress: Math.min(prev.routeProgress + 1, 100),
        tempC: (18 + Math.random() * 0.8).toFixed(1) + '°C',
        humidityPct: Math.floor(52 + Math.random() * 4) + '%'
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, [workflowStep]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // --- SAFE MULTIPART UPLOAD WITH CORRECT ENDPOINT FIX ---
  // fieldName defaults to 'files' for existing callers (Steps 2-5, which
  // aren't broken out into per-document requirement slots). The per-document
  // Step 1 slots pass their own requirement id (e.g. 'trade_licence')
  // instead, so the backend's multer upload.any() records it as that exact
  // documentType/fieldName — letting the admin's missing-docs check (and
  // this component's own getDocSlotStatus) match the upload back to the
  // specific requirement it satisfies.
  const uploadFileToBackend = async (file, customRole = currentUserRole, stepKey = '', fieldName = 'files') => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('userId', currentUserId);
      formData.append('userName', currentUserName);
      formData.append('userRole', customRole);
      if (stepKey) formData.append('stepKey', stepKey);
      formData.append(fieldName, file);

      // FIX: Directed to registered POST /api/v1/verification/upload endpoint
      const response = await fetch(`${API_BASE_URL}/api/v1/verification/upload`, {
        method: 'POST',
        headers: {
          'x-user-role': 'BUYER',
          'x-user-id': currentUserId
        },
        body: formData
      });

      if (!response.ok) {
        const errTxt = await response.text();
        throw new Error(`HTTP ${response.status}: ${errTxt.slice(0, 100)}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'Upload rejected by server');
        triggerToast(`📄 Document "${file.name}" uploaded to server storage!`);
        fetchDocumentsData();
        return data;
      } else {
        triggerToast(`📄 Document attached locally (Server non-JSON response)`);
        return { success: true };
      }
    } catch (err) {
      console.error('Backend Upload Error:', err);
      triggerToast(`⚠️ Local attach ready (${err.message})`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSimulateOnboardingApproval = () => {
    setOnboardingDocs(prev => prev.map(doc => ({ ...doc, status: 'VERIFIED' })));
    triggerToast('✅ Portal Documents Synced & Fully Verified!');
  };

  const handleVerifyKYC = (e) => {
    e.preventDefault();
    if (!isOnboardingVerified) {
      triggerToast('❌ BLOCKED: Portal verification pending.');
      return;
    }
    if (!stepDocuments.step1) {
      triggerToast('❌ BLOCKED: Certificate of Incorporation required.');
      return;
    }
    setWorkflowStep(2);
    setActiveTab('sellers');
    setLiveLogs(prev => [{ id: Date.now(), time: 'Just now', text: `Step 1 Completed: Incorporation Verified.`, type: 'KYC' }, ...prev]);
    triggerToast('✅ Step 1 Completed! Sellers Unlocked.');
  };

  // Pay-to-unlock the exporters directory, mirroring the supplier side's
  // buyer-directory unlock fee.
  const handleUnlockDirectory = () => {
    setDirectoryUnlockStatus('processing');
    setTimeout(() => {
      setIsDirectoryUnlocked(true);
      setDirectoryUnlockStatus('unlocked');
      setLiveLogs(prev => [{ id: Date.now(), time: 'Just now', text: `Exporters Directory unlocked for $${DIRECTORY_UNLOCK_FEE.toLocaleString()} USD.`, type: 'PAYMENT' }, ...prev]);
      triggerToast(`✅ Exporters Directory Unlocked! $${DIRECTORY_UNLOCK_FEE.toLocaleString()} USD fee processed.`);
    }, 1800);
  };

  const handleSelectSeller = (seller) => {
    if (!isDirectoryUnlocked) {
      triggerToast('❌ BLOCKED: Unlock the Exporters Directory first ($5,000).');
      return;
    }
    setNegotiatedPrice(seller.unitPrice);
    setOrderQuantity(seller.moq);
    joinSellerChatRoom(seller);

    setWorkflowStep(3);
    setActiveTab('contract');
    setLiveLogs(prev => [{ id: Date.now(), time: 'Just now', text: `Step 2 Completed: Connected with ${seller.name} via unlocked Exporters Directory.`, type: 'RFQ' }, ...prev]);
    triggerToast(`✅ Step 2 Completed! Connected with ${seller.name}. Step 3 Unlocked.`);
  };

  // Auto-generated, downloadable contract — replaces the old "upload a
  // signed contract PDF" gate, mirroring the same change on the supplier
  // side. AMAMA builds the standard contract from the negotiated terms
  // instead of asking the buyer to source and upload one themselves.
  const handleGenerateContract = () => {
    const contractText = `AMAMA GATEWAY — STANDARD BILATERAL SALES CONTRACT
Generated: ${new Date().toLocaleString()}

BUYER (Importer): ${kycData.companyName}
Country: ${kycData.country}

SELLER (Exporter): ${selectedSeller?.name}
Location: ${selectedSeller?.location}
Origin Port: ${selectedSeller?.originPort}

COMMODITY: ${selectedSeller?.commodity}
QUANTITY: ${orderQuantity} MT
PRICE: $${negotiatedPrice} / MT
TOTAL CONTRACT VALUE: $${totalPrice.toLocaleString()} USD
Destination Port: ${selectedSeller?.destPort}

This contract was generated automatically by AMAMA Gateway on behalf of the Buyer
and is subject to AMAMA's standard escrow-backed trade terms.
`;
    const blob = new Blob([contractText], { type: 'text/plain' });
    const downloadUrl = URL.createObjectURL(blob);
    const fileName = `AMAMA-Sales-Contract-${selectedSeller?.id}-${Date.now()}.txt`;

    const docObj = { name: fileName, size: (blob.size / 1024).toFixed(1) + ' KB', date: new Date().toLocaleTimeString(), downloadUrl };
    setStepDocuments(prev => ({ ...prev, step3: docObj }));

    triggerToast(`📄 AMAMA generated contract "${fileName}" — ready to download.`);
  };

  const handleCloseDeal = () => {
    if (!stepDocuments.step3) {
      triggerToast('❌ BLOCKED: Generate the AMAMA standard contract first.');
      return;
    }
    setIsDealClosed(true);
    setWorkflowStep(4);
    setActiveTab('escrow');
    setLiveLogs(prev => [{ id: Date.now(), time: 'Just now', text: `Step 3 Completed: Contract Signed with ${selectedSeller?.name}.`, type: 'CONTRACT' }, ...prev]);
    triggerToast('✅ Step 3 Completed! Contract Signed. Step 4 Unlocked.');
  };

  const handleExecutePayment = () => {
    if (!stepDocuments.step4) {
      triggerToast('❌ BLOCKED: Bank Authorization Form required.');
      return;
    }
    setPaymentStatus('processing');
    setTimeout(() => {
      setPaymentStatus('success');
      setTimeout(() => {
        setEscrowTranches(prev => prev.map(t => t.id === 1 ? { ...t, status: 'RELEASED' } : t));
        setWorkflowStep(5);
        setActiveTab('live');
        setLiveLogs(prev => [
          { id: Date.now(), time: 'Just now', text: `Step 4 Completed: $${(totalPrice * 0.25).toLocaleString()} deposited to Escrow.`, type: 'FINANCE' },
          ...prev
        ]);
        triggerToast('🎉 ALL STAGES 100% COMPLETED! Real-Time Live Monitoring Active.');
      }, 1000);
    }, 1500);
  };

  const handleBuyerReleaseTranche = (trancheId) => {
    const trancheToRelease = escrowTranches.find(t => t.id === trancheId);
    if (!trancheToRelease) return;

    setEscrowTranches(prev =>
      prev.map(t => (t.id === trancheId ? { ...t, status: 'RELEASED' } : t))
    );

    const releasedAmount = (totalPrice * (trancheToRelease.percent / 100)).toLocaleString();

    setLiveLogs(prev => [
      { id: Date.now(), time: 'Just now', text: `Buyer Released ${trancheToRelease.name}: $${releasedAmount} USD.`, type: 'FINANCE' },
      ...prev
    ]);

    triggerToast(`💰 ${trancheToRelease.name} funds approved & released to Exporter!`);
  };

  const handleSimulateAdminDocUpload = async (docType) => {
    const mockBlob = new Blob(["Demo document content"], { type: "application/pdf" });

    if (docType === 'step5_qc') {
      const file = new File([mockBlob], "SGS_Quality_Inspection_Report.pdf", { type: "application/pdf" });
      await uploadFileToBackend(file, 'SUPPLIER', 'step5_qc');
      setStepDocuments(prev => ({ ...prev, step5_qc: { name: file.name, date: 'Just now' } }));
      triggerToast('📄 [Admin Simulation] SGS QC Inspection Report Uploaded!');
    } else if (docType === 'step5_bl') {
      const file = new File([mockBlob], "Original_Bill_Of_Lading_CAVAN402.pdf", { type: "application/pdf" });
      await uploadFileToBackend(file, 'SUPPLIER', 'step5_bl');
      setStepDocuments(prev => ({ ...prev, step5_bl: { name: file.name, date: 'Just now' } }));
      triggerToast('📄 [Admin Simulation] Original Bill of Lading Uploaded!');
    }
  };

  const handleStepDocAttach = async (stepKey, file) => {
    if (!file) return;
    const docObj = { name: file.name, size: (file.size / 1024).toFixed(1) + ' KB', date: new Date().toLocaleTimeString() };
    setStepDocuments(prev => ({ ...prev, [stepKey]: docObj }));
    await uploadFileToBackend(file, currentUserRole, stepKey);
  };

  // Per-document Step 1 upload — used by each individual requirement slot
  // (e.g. "Corporate Trade Licence", "VAT / Tax Registration") instead of
  // the old single generic file. uploadFileToBackend already refetches real
  // server state via fetchDocumentsData() on success, so a fresh upload
  // correctly shows as Pending Review rather than being fabricated as
  // pre-verified locally.
  const handleDocSlotAttach = async (docId, docLabel, file) => {
    if (!file) return;
    await uploadFileToBackend(file, currentUserRole, '', docId);
    triggerToast(`📎 "${docLabel}" uploaded — pending admin review.`);
  };

  const handleGenericFileUpload = async (file) => {
    if (!file) return;
    await uploadFileToBackend(file);
    setExtraDocName('');
  };

  const stepsList = [
    { key: 'kyc', num: 1, label: 'Step 1: KYC', completed: isStep1Completed, req: !!stepDocuments.step1 },
    { key: 'sellers', num: 2, label: 'Step 2: Sellers', completed: isStep2Completed, req: isDirectoryUnlocked },
    { key: 'contract', num: 3, label: 'Step 3: Contract', completed: isStep3Completed, req: !!stepDocuments.step3 },
    { key: 'escrow', num: 4, label: 'Step 4: Escrow', completed: isStep4Completed, req: !!stepDocuments.step4 },
    { key: 'live', num: 5, label: 'Step 5: Tracking', completed: isStep5Completed, req: workflowStep === 5 }
  ];

  return (
    <div style={styles.appShell}>
      {/* TOAST BANNER */}
      {toastMessage && (
        <div style={{
          ...styles.toastBanner,
          backgroundColor: toastMessage.includes('❌') ? '#991b1b' : '#0f172a'
        }}>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MOBILE OVERLAY */}
      <div
        style={{ ...styles.mobileOverlay, display: isMobileSidebarOpen ? 'block' : 'none' }}
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      {/* LEFT NAVIGATION BAR / SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.brandHeader}>
          <div style={styles.brandBadge}>🛡️</div>
          <div>
            <div style={styles.brandTitle}>AMAMA GATEWAY</div>
            <div style={styles.brandSub}>Trade & Settlement Portal</div>
          </div>
        </div>

        <div style={styles.sidebarSectionLabel}>NAVIGATION PORTAL</div>

        <nav style={styles.navStack}>
          <div
            style={{ ...styles.navItem, ...(activeTab === 'kyc' ? styles.navItemActive : {}) }}
            onClick={() => { setActiveTab('kyc'); setIsMobileSidebarOpen(false); }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>📋</span> Step 1: Corporate KYC
            </div>
            {isStep1Completed ? <span style={styles.navCompletedTag}>COMPLETED ✓</span> : null}
          </div>

          <div
            style={{
              ...styles.navItem,
              ...(activeTab === 'sellers' ? styles.navItemActive : {}),
              ...(workflowStep < 2 ? styles.navItemDisabled : {})
            }}
            onClick={() => { if (workflowStep >= 2) { setActiveTab('sellers'); setIsMobileSidebarOpen(false); } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>🏢</span> Step 2: Sellers
            </div>
            {isStep2Completed ? <span style={styles.navCompletedTag}>COMPLETED ✓</span> : workflowStep < 2 ? <span>🔒</span> : null}
          </div>

          <div
            style={{
              ...styles.navItem,
              ...(activeTab === 'contract' ? styles.navItemActive : {}),
              ...(workflowStep < 3 ? styles.navItemDisabled : {})
            }}
            onClick={() => { if (workflowStep >= 3) { setActiveTab('contract'); setIsMobileSidebarOpen(false); } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>📝</span> Step 3: Sales Contract
            </div>
            {isStep3Completed ? <span style={styles.navCompletedTag}>COMPLETED ✓</span> : workflowStep < 3 ? <span>🔒</span> : null}
          </div>

          <div
            style={{
              ...styles.navItem,
              ...(activeTab === 'escrow' ? styles.navItemActive : {}),
              ...(workflowStep < 4 ? styles.navItemDisabled : {})
            }}
            onClick={() => { if (workflowStep >= 4) { setActiveTab('escrow'); setIsMobileSidebarOpen(false); } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>💳</span> Step 4: Stripe Escrow
            </div>
            {isStep4Completed ? <span style={styles.navCompletedTag}>COMPLETED ✓</span> : workflowStep < 4 ? <span>🔒</span> : null}
          </div>

          <div
            style={{
              ...styles.navItem,
              ...(activeTab === 'live' ? styles.navItemActive : {}),
              ...(workflowStep < 5 ? styles.navItemDisabled : {})
            }}
            onClick={() => { if (workflowStep >= 5) { setActiveTab('live'); setIsMobileSidebarOpen(false); } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>🚢</span> Step 5: Live Tracking
            </div>
            {isStep5Completed ? <span style={styles.navCompletedTag}>COMPLETED ✓</span> : workflowStep < 5 ? <span>🔒</span> : null}
          </div>

          <div style={{ ...styles.sidebarSectionLabel, marginTop: '20px' }}>DOCUMENT CONTROL</div>

          <div
            style={{ ...styles.navItem, ...(activeTab === 'docs' ? styles.navItemActive : {}) }}
            onClick={() => { setActiveTab('docs'); setIsMobileSidebarOpen(false); }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>📂</span> Document Vault
            </div>
          </div>
        </nav>

        <div style={styles.sidebarFooterCard}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#38bdf8' }}>PORTAL PROGRESS</div>
          <div style={{ fontSize: '12px', fontWeight: '900', color: is100PercentCompleted ? '#4ade80' : '#ffffff', marginTop: '4px' }}>
            {is100PercentCompleted ? '🎉 100% COMPLETED' : `Stage ${workflowStep} / 5 Active`}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={styles.mainWrapper}>
        <header style={styles.topHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              style={styles.hamburgerBtn}
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              ☰
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={styles.pageTitle}>
                  {activeTab === 'kyc' && 'Step 1: Corporate Onboarding'}
                  {activeTab === 'sellers' && 'Step 2: Verified Exporters Directory'}
                  {activeTab === 'contract' && 'Step 3: Contract Terms & Negotiations'}
                  {activeTab === 'escrow' && 'Step 4: Secure Escrow Deposit'}
                  {activeTab === 'live' && 'Step 5: Live Shipment & Telemetry'}
                  {activeTab === 'docs' && 'Document Vault & Required Roadmap'}
                </h1>
                {isOnboardingVerified && (
                  <span style={styles.verifiedBuyerBadge} title="Corporate KYC documents verified by AMAMA">
                    🛡️ Verified Buyer
                  </span>
                )}
              </div>
              <p style={styles.pageSubtitle}>Document-gated trade portal with real-time verification status</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {is100PercentCompleted && (
              <div style={styles.completed100Badge}>
                🎉 ALL STAGES 100% COMPLETED
              </div>
            )}
            <span style={styles.stepCounterBadge}>Stage {workflowStep} / 5</span>
          </div>
        </header>

        {/* WORKFLOW PROGRESS TRACKER BAR */}
        <div style={styles.progressTrackerBar}>
          {stepsList.map((s) => (
            <div
              key={s.num}
              style={{
                ...styles.trackerSegment,
                borderBottomColor: activeTab === s.key ? '#0f766e' : s.completed ? '#10b981' : '#e2e8f0'
              }}
              onClick={() => {
                if (workflowStep >= s.num) setActiveTab(s.key);
              }}
            >
              <div style={{
                ...styles.trackerCircle,
                backgroundColor: s.completed ? '#10b981' : activeTab === s.key ? '#0f766e' : '#cbd5e1',
                color: '#ffffff'
              }}>
                {s.completed ? '✓' : s.num}
              </div>
              <div style={styles.trackerTextGroup}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: activeTab === s.key ? '#0f172a' : '#64748b' }}>{s.label}</span>
                  {s.completed && <span style={styles.stepCompletedBadgeInline}>COMPLETED ✓</span>}
                </div>
                <span style={{ fontSize: '9px', color: s.req ? '#16a34a' : '#dc2626', fontWeight: '700' }}>
                  {s.req ? 'Doc Attached ✓' : 'Doc Required 🔒'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* DYNAMIC VIEW CONTAINER */}
        <div style={styles.contentContainer}>

          {/* VIEW 1: KYC */}
          {activeTab === 'kyc' && (
            <div style={styles.gridTwoCol}>
              <div style={styles.cardBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={styles.cardHeading}>📋 Corporate KYC & Portal Sync</h3>
                    <p style={styles.cardSub}>Synchronize onboarding documents to finalize corporate verification.</p>
                  </div>
                  {isStep1Completed && <span style={styles.cardCompletedBadge}>STEP 1 COMPLETED ✓</span>}
                </div>

                {/* Rejected-document alert — surfaces admin's rejection reason so the
                    buyer knows exactly what to fix. Uploading a replacement is already
                    possible below (the file input is never disabled after a first
                    submission), this just makes sure they actually see why it matters. */}
                {(uploadedDocs || []).filter(d => (d.status || '').toUpperCase() === 'REJECTED').length > 0 && (
                    <div style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                        padding: '14px 16px',
                        marginBottom: '16px'
                    }}>
                        <div style={{ color: '#991b1b', fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>
                            ⚠️ Document(s) Rejected — Re-upload Required
                        </div>
                        {(uploadedDocs || [])
                            .filter(d => (d.status || '').toUpperCase() === 'REJECTED')
                            .map((d, i) => (
                                <div key={`rejected-${d.id || i}`} style={{ fontSize: '12px', color: '#7f1d1d', marginBottom: '4px' }}>
                                    <b>{d.originalName || d.fileName || 'Document'}</b>
                                    {d.adminRemarks ? `: ${d.adminRemarks}` : ' — no reason provided'}
                                </div>
                            ))}
                        <div style={{ fontSize: '11px', color: '#b91c1c', marginTop: '6px' }}>
                            Attach a corrected file below to resubmit.
                        </div>
                    </div>
                )}

                <div style={styles.syncCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '900', color: '#0f766e' }}>🔄 PORTAL COMPLIANCE STATUS</span>
                    <span style={isOnboardingVerified ? styles.badgeSuccess : styles.badgePending}>
                      {isOnboardingVerified ? 'PORTAL APPROVED ✓' : 'PENDING APPROVAL'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {onboardingDocs.map(doc => (
                      <div key={doc.id} style={styles.docRowItem}>
                        <span>{doc.label}</span>
                        <span style={{ fontWeight: '800', color: (doc.status || '').toUpperCase() !== 'REJECTED' ? '#16a34a' : '#d97706' }}>
                          {doc.status || 'VERIFIED'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {!isOnboardingVerified && (
                    <button type="button" onClick={handleSimulateOnboardingApproval} style={styles.demoLinkBtn}>
                      [Demo: Auto-Approve Portal Compliance]
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
                  <div>
                    <label style={styles.inputLabel}>COMPANY LEGAL NAME</label>
                    <input type="text" value={kycData.companyName} onChange={e => setKycData({...kycData, companyName: e.target.value})} style={styles.inputField} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={styles.inputLabel}>TAX ID / EIN</label>
                      <input type="text" value={kycData.taxId} onChange={e => setKycData({...kycData, taxId: e.target.value})} style={styles.inputField} />
                    </div>
                    <div>
                      <label style={styles.inputLabel}>COUNTRY</label>
                      <input type="text" value={kycData.country} onChange={e => setKycData({...kycData, country: e.target.value})} style={styles.inputField} />
                    </div>
                  </div>

                  {/* One upload slot per REAL required document instead of a single
                      generic "Step 1 File" blob, so each requirement — especially a
                      rejected one — can be individually identified and replaced. */}
                  {BUYER_REQUIRED_DOCS.map((rd) => {
                      const slot = getDocSlotStatus(rd.id);
                      const boxStyle = slot.state === 'rejected'
                          ? { ...styles.docGateBox, border: '1.5px solid #fecaca', backgroundColor: '#fef2f2' }
                          : slot.state === 'approved'
                          ? { ...styles.docGateBox, border: '1.5px solid #bbf7d0', backgroundColor: '#f0fdf4' }
                          : styles.docGateBox;

                      return (
                          <div key={rd.id} style={boxStyle}>
                              <div style={styles.docGateHeader}>
                                  {slot.state === 'approved' ? '✓' : '🔒'} {rd.label}
                              </div>
                              <input
                                  type="file"
                                  disabled={isUploading}
                                  onChange={e => handleDocSlotAttach(rd.id, rd.label, e.target.files[0])}
                                  style={styles.fileInput}
                              />
                              {slot.state === 'approved' ? (
                                  <div style={styles.badgeSuccess}>✓ Verified{slot.doc?.originalName || slot.doc?.fileName ? `: ${slot.doc.originalName || slot.doc.fileName}` : ''}</div>
                              ) : slot.state === 'rejected' ? (
                                  <div style={{ fontSize: '10px', fontWeight: '800', color: '#991b1b', backgroundColor: '#fee2e2', padding: '3px 8px', borderRadius: '4px' }}>
                                      ✕ Rejected{slot.reason ? `: ${slot.reason}` : ''} — please re-upload
                                  </div>
                              ) : slot.state === 'pending' ? (
                                  <div style={styles.badgePending}>⏳ Pending Review{slot.doc?.originalName || slot.doc?.fileName ? `: ${slot.doc.originalName || slot.doc.fileName}` : ''}</div>
                              ) : (
                                  <div style={styles.badgePending}>⚠️ Not yet uploaded</div>
                              )}
                          </div>
                      );
                  })}

                  <button
                    style={{
                      ...styles.actionBtnFull,
                      backgroundColor: isStep1Completed ? '#15803d' : '#0f766e',
                      opacity: (!stepDocuments.step1 || !isOnboardingVerified || isUploading) ? 0.5 : 1,
                      cursor: (!stepDocuments.step1 || !isOnboardingVerified || isUploading) ? 'not-allowed' : 'pointer'
                    }}
                    disabled={!stepDocuments.step1 || !isOnboardingVerified || isUploading}
                    onClick={handleVerifyKYC}
                  >
                    {isUploading ? 'Uploading to Server...' : isStep1Completed ? 'Step 1 Completed ✓ (Re-verify)' : !isOnboardingVerified ? '🔒 Complete Portal Sync First' : 'Complete Step 1 & Unlock Sellers 🚀'}
                  </button>
                </div>
              </div>

              <DocumentRoadmapPanel stepDocuments={stepDocuments} currentStepNum={currentStepNum} isLoadingDocs={isLoadingDocs} isDirectoryUnlocked={isDirectoryUnlocked} />
            </div>
          )}

          {/* VIEW 2: TOP 5 SELLERS */}
          {activeTab === 'sellers' && (
            <div style={styles.gridTwoCol}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={styles.bannerBlue}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '900', color: '#1e40af' }}>🛡️ EXPORTERS GATEWAY</div>
                    <div style={{ fontSize: '10.5px', color: '#3b82f6' }}>Direct access to vetted perishable goods suppliers with guaranteed MOQs — AMAMA Gateway trades perishables only.</div>
                  </div>
                  {isStep2Completed && (
                    <span style={styles.cardCompletedBadge}>STEP 2 COMPLETED ✓</span>
                  )}
                </div>

                <div style={styles.docGateBox}>
                  <label style={styles.inputLabel}>FILTER BY PERISHABLE GOODS CATEGORY</label>
                  <select
                    value={selectedCommodityFilter}
                    onChange={e => setSelectedCommodityFilter(e.target.value)}
                    style={styles.inputField}
                  >
                    <option value="ALL">🥭 All Perishable Goods Categories</option>
                    {perishableGoodsOptions.map(commodity => (
                      <option key={commodity} value={commodity}>{commodity}</option>
                    ))}
                  </select>
                </div>

                {!isDirectoryUnlocked ? (
                  <div style={styles.directoryPaywallBox}>
                    <span style={{ fontSize: '30px' }}>🔒</span>
                    <div style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
                      Unlock the Verified Exporters Directory
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', maxWidth: '360px' }}>
                      Access to AMAMA's escrow-ready exporter leads for{' '}
                      {selectedCommodityFilter === 'ALL' ? 'every category' : `"${selectedCommodityFilter}"`} requires a one-time directory unlock fee.
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f766e', marginTop: '10px' }}>
                      $5,000 USD
                    </div>
                    <button
                      style={{ ...styles.actionBtnFull, width: '280px', marginTop: '12px', backgroundColor: directoryUnlockStatus === 'processing' ? '#94a3b8' : '#0f766e', cursor: directoryUnlockStatus === 'processing' ? 'not-allowed' : 'pointer' }}
                      disabled={directoryUnlockStatus === 'processing'}
                      onClick={handleUnlockDirectory}
                    >
                      {directoryUnlockStatus === 'processing' ? 'Processing Payment...' : 'Pay $5,000 & Unlock Exporters 🔓'}
                    </button>
                  </div>
                ) : isLoadingSellers ? (
                  <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                    <span style={{ fontSize: '24px' }}>⏳</span>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>Loading Verified Exporters…</div>
                  </div>
                ) : sellersLoadError ? (
                  <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px dashed #fca5a5' }}>
                    <span style={{ fontSize: '24px' }}>⚠️</span>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#991b1b', marginTop: '6px' }}>{sellersLoadError}</div>
                  </div>
                ) : sellersList.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                    <span style={{ fontSize: '24px' }}>🥭</span>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>No Exporters Onboarded Yet</div>
                    <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>Once suppliers complete onboarding, they'll appear here automatically.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(selectedCommodityFilter === 'ALL' ? sellersList : sellersList.filter(s => s.commodity === selectedCommodityFilter)).length === 0 && (
                      <div style={{ padding: '30px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                        <span style={{ fontSize: '24px' }}>🥭</span>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>No Exporters Found for This Category</div>
                        <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>Try selecting "All Perishable Goods Categories" to see every verified exporter.</div>
                      </div>
                    )}
                    {(selectedCommodityFilter === 'ALL' ? sellersList : sellersList.filter(s => s.commodity === selectedCommodityFilter)).map((seller, idx) => (
                      <div key={seller.id} style={styles.sellerCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={styles.avatarBox}>{seller.avatar}</div>
                            <div>
                              <div style={{ fontSize: '10px', fontWeight: '900', color: '#0f766e' }}>RANK #{idx + 1} SUPPLIER</div>
                              <div style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a' }}>{seller.name}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>📍 {seller.location} • ⚓ {seller.originPort}</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '16px', fontWeight: '900', color: '#0f766e' }}>${seller.unitPrice} / MT</div>
                            <span style={styles.sellerBadge}>{seller.badge}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                          <span style={{ fontSize: '12px', fontWeight: '800', color: '#334155' }}>📦 Commodity: {seller.commodity}</span>
                          <button
                            style={{
                              ...styles.actionBtnCompact,
                              backgroundColor: selectedSeller?.id === seller.id && isStep2Completed ? '#15803d' : '#0f766e',
                              cursor: 'pointer'
                            }}
                            onClick={() => handleSelectSeller(seller)}
                          >
                            {selectedSeller?.id === seller.id && isStep2Completed ? 'Step 2 Completed ✓ (Selected)' : 'Select Exporter & Complete Step 2 🚀'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <DocumentRoadmapPanel stepDocuments={stepDocuments} currentStepNum={currentStepNum} isLoadingDocs={isLoadingDocs} isDirectoryUnlocked={isDirectoryUnlocked} />
            </div>
          )}

          {/* VIEW 3: CONTRACT & NEGOTIATIONS */}
          {activeTab === 'contract' && (
            <div style={styles.gridTwoCol}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={styles.cardBox}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={styles.cardHeading}>📝 Executed Contract Terms</h3>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>Exporter: <strong>{selectedSeller?.name}</strong></div>
                    </div>
                    {isStep3Completed && <span style={styles.cardCompletedBadge}>STEP 3 COMPLETED ✓</span>}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={styles.inputLabel}>ORDER QUANTITY (METRIC TONS)</label>
                      <input type="number" value={orderQuantity} onChange={e => setOrderQuantity(Number(e.target.value))} style={styles.inputField} />
                    </div>
                    <div>
                      <label style={styles.inputLabel}>AGREED PRICE PER MT ($)</label>
                      <input type="number" value={negotiatedPrice} onChange={e => setNegotiatedPrice(Number(e.target.value))} style={styles.inputField} />
                    </div>

                    <div style={styles.summaryBox}>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>TOTAL TRADE CONTRACT VALUE</div>
                      <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f766e' }}>${totalPrice.toLocaleString()} USD</div>
                    </div>

                    <div style={styles.docGateBox}>
                      <div style={styles.docGateHeader}>📄 STEP 3: AMAMA Standard Sales Contract</div>
                      <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                        AMAMA generates a standard bilateral sales contract from your negotiated terms — no manual upload needed.
                      </div>
                      {stepDocuments.step3 ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                          <div style={styles.badgeSuccess}>✓ Generated: {stepDocuments.step3.name}</div>
                          <a
                            href={stepDocuments.step3.downloadUrl}
                            download={stepDocuments.step3.name}
                            style={styles.downloadLink}
                          >
                            ⬇ Download Contract
                          </a>
                        </div>
                      ) : (
                        <button
                          type="button"
                          style={{ ...styles.actionBtnCompact, alignSelf: 'flex-start', cursor: 'pointer' }}
                          onClick={handleGenerateContract}
                          disabled={isDealClosed}
                        >
                          Generate AMAMA Standard Contract 📄
                        </button>
                      )}
                    </div>

                    <button
                      style={{
                        ...styles.actionBtnFull,
                        backgroundColor: isStep3Completed ? '#15803d' : '#0f766e',
                        opacity: (!stepDocuments.step3 || isUploading) ? 0.5 : 1,
                        cursor: (!stepDocuments.step3 || isUploading) ? 'not-allowed' : 'pointer'
                      }}
                      disabled={!stepDocuments.step3 || isUploading}
                      onClick={handleCloseDeal}
                    >
                      {isUploading ? 'Uploading Contract...' : !stepDocuments.step3 ? '🔒 Generate Contract First' : isStep3Completed ? 'Step 3 Completed ✓ (Proceed to Escrow)' : 'Lock Terms & Complete Step 3 🤝'}
                    </button>
                  </div>
                </div>

                {/* LIVE CHAT (backend-persisted, real-time via Socket.IO) */}
                <div style={styles.cardBox}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h3 style={styles.cardHeading}>💬 Live Negotiator Chat</h3>
                    <span style={{ fontSize: '10px', color: '#0f766e', fontWeight: '800' }}>● Connected to {selectedSeller?.name}</span>
                  </div>

                  <div style={styles.chatContainer}>
                    {chatMessages.length === 0 ? (
                      <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', margin: 'auto' }}>
                        No messages yet. Send an inquiry below to begin terms negotiation.
                      </div>
                    ) : (
                      chatMessages.map((m, i) => {
                        const isMe = m.senderId === currentUserId;
                        return (
                          <div key={m.id || i} style={{
                            ...styles.chatBubble,
                            alignSelf: m.isSystem ? 'center' : isMe ? 'flex-end' : 'flex-start',
                            backgroundColor: m.isSystem ? '#f1f5f9' : isMe ? '#0f766e' : '#ffffff',
                            color: m.isSystem ? '#475569' : isMe ? '#ffffff' : '#0f172a',
                            border: m.isSystem ? '1px dashed #cbd5e1' : '1px solid #e2e8f0',
                            maxWidth: m.isSystem ? '95%' : '85%'
                          }}>
                            {!m.isSystem && (
                              <div style={{ fontSize: '9px', fontWeight: '800', opacity: 0.8 }}>
                                {isMe ? 'You' : (m.senderName || m.sender)}
                              </div>
                            )}
                            <div style={{ fontSize: '11.5px', marginTop: '2px' }}>{m.text}</div>
                          </div>
                        );
                      })
                    )}

                    {isSellerTyping && (
                      <div style={{ ...styles.chatBubble, alignSelf: 'flex-start', backgroundColor: '#ffffff', color: '#64748b' }}>
                        <div style={{ fontSize: '9px', fontWeight: '800', marginBottom: '2px' }}>{selectedSeller?.name}</div>
                        <div style={{ fontSize: '10px', fontStyle: 'italic' }}>typing…</div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="Type negotiation message..."
                      style={styles.inputField}
                      disabled={isDealClosed}
                    />
                    <button
                      type="submit"
                      style={{
                        ...styles.actionBtnCompact,
                        opacity: isDealClosed ? 0.5 : 1,
                        cursor: isDealClosed ? 'not-allowed' : 'pointer'
                      }}
                      disabled={isDealClosed || !newMessage.trim()}
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>

              <DocumentRoadmapPanel stepDocuments={stepDocuments} currentStepNum={currentStepNum} isLoadingDocs={isLoadingDocs} isDirectoryUnlocked={isDirectoryUnlocked} />
            </div>
          )}

          {/* VIEW 4: STRIPE ESCROW DEPOSIT */}
          {activeTab === 'escrow' && (
            <div style={styles.gridTwoCol}>
              <div style={styles.cardBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h3 style={styles.cardHeading}>💳 Step 4: Stripe Escrow Funding</h3>
                    <p style={styles.cardSub}>Deposit initial tranche to activate live vessel shipment & tracking.</p>
                  </div>
                  {isStep4Completed && <span style={styles.cardCompletedBadge}>STEP 4 COMPLETED ✓</span>}
                </div>

                <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f5f3ff', borderRadius: '8px', margin: '14px 0' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '800' }}>TRANCHE 1 INITIAL DEPOSIT (25%)</div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#6366f1' }}>${(totalPrice * 0.25).toLocaleString()} USD</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={styles.docGateBox}>
                    <div style={{ ...styles.docGateHeader, color: '#4338ca' }}>🔒 MANDATORY STEP 4 FILE: Bank Wire / Authorization Form</div>
                    <input
                      ref={fileInputRef4}
                      type="file"
                      onChange={e => handleStepDocAttach('step4', e.target.files[0])}
                      style={styles.fileInput}
                    />
                    {stepDocuments.step4 ? (
                      <div style={styles.badgeSuccess}>✓ Attached: {stepDocuments.step4.name}</div>
                    ) : (
                      <div style={styles.badgePending}>⚠️ Upload bank wire advice to unlock deposit button.</div>
                    )}
                  </div>

                  <button
                    style={{
                      ...styles.actionBtnFull,
                      backgroundColor: isStep4Completed ? '#15803d' : '#6366f1',
                      opacity: (!stepDocuments.step4 || isUploading) ? 0.5 : 1,
                      cursor: (!stepDocuments.step4 || isUploading) ? 'not-allowed' : 'pointer'
                    }}
                    disabled={!stepDocuments.step4 || isUploading}
                    onClick={handleExecutePayment}
                  >
                    {isUploading ? 'Uploading File...' : !stepDocuments.step4 ? '🔒 Upload Authorization Form First' : isStep4Completed ? 'Step 4 Completed ✓ (Escrow Active)' : `Deposit $${(totalPrice * 0.25).toLocaleString()} & Complete Step 4 🚀`}
                  </button>
                </div>
              </div>

              <DocumentRoadmapPanel stepDocuments={stepDocuments} currentStepNum={currentStepNum} isLoadingDocs={isLoadingDocs} isDirectoryUnlocked={isDirectoryUnlocked} />
            </div>
          )}

          {/* VIEW 5: LIVE SHIPMENT TELEMETRY */}
          {activeTab === 'live' && (
            <div style={styles.gridTwoCol}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={styles.liveBanner}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '30px' }}>🚢</span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '10px', fontWeight: '900', color: '#166534' }}>● SATELLITE LIVE TELEMETRY DISPATCHED</span>
                          <span style={styles.cardCompletedBadge}>STEP 5 COMPLETED ✓</span>
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#064e3b' }}>Container #{liveTradeData.containerId}</div>
                        <div style={{ fontSize: '11px', color: '#15803d' }}>Vessel: {liveTradeData.vesselName} | Exporter: {selectedSeller?.name}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '10px', color: '#15803d', fontWeight: '800' }}>TOTAL CONTRACT VALUE</div>
                      <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f766e' }}>${totalPrice.toLocaleString()} USD</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '800', color: '#166534', marginBottom: '4px' }}>
                      <span>📍 Origin: {selectedSeller?.originPort}</span>
                      <span>Progress: {liveTradeData.routeProgress}%</span>
                      <span>⚓ Destination: {selectedSeller?.destPort}</span>
                    </div>
                    <div style={styles.progressBarBg}>
                      <div style={{ ...styles.progressBarFill, width: `${liveTradeData.routeProgress}%` }}></div>
                    </div>
                  </div>
                </div>

                <div style={styles.sensorGrid}>
                  <div style={styles.sensorTile}>
                    <span>🌐</span>
                    <div>
                      <div style={styles.sensorLabel}>GPS COORDINATES</div>
                      <div style={styles.sensorVal}>{liveTradeData.lat}, {liveTradeData.lng}</div>
                    </div>
                  </div>
                  <div style={styles.sensorTile}>
                    <span>🌡️</span>
                    <div>
                      <div style={styles.sensorLabel}>CONTAINER TEMP</div>
                      <div style={styles.sensorVal}>{liveTradeData.tempC}</div>
                    </div>
                  </div>
                  <div style={styles.sensorTile}>
                    <span>💧</span>
                    <div>
                      <div style={styles.sensorLabel}>GRAIN HUMIDITY</div>
                      <div style={styles.sensorVal}>{liveTradeData.humidityPct} RH</div>
                    </div>
                  </div>
                  <div style={styles.sensorTile}>
                    <span>⏱️</span>
                    <div>
                      <div style={styles.sensorLabel}>ESTIMATED ETA</div>
                      <div style={styles.sensorVal}>{liveTradeData.etaDays} Days</div>
                    </div>
                  </div>
                </div>

                <div style={styles.cardBox}>
                  <h3 style={styles.cardHeading}>💳 Escrow Tranches & Settlement</h3>
                  <p style={styles.cardSub}>Tranches unlock for Buyer approval once authority documents are issued.</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    {escrowTranches.map(t => {
                      const docVerified = !!stepDocuments[t.reqDocKey];
                      const isReleased = t.status === 'RELEASED';

                      return (
                        <div
                          key={t.id}
                          style={{
                            ...styles.trancheTile,
                            borderColor: isReleased ? '#10b981' : docVerified ? '#3b82f6' : '#cbd5e1',
                            backgroundColor: isReleased ? '#f0fdf4' : docVerified ? '#f0f9ff' : '#ffffff'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>{t.name}</div>
                              <div style={{ fontSize: '10px', color: '#64748b' }}>Trigger: {t.triggerLabel}</div>
                              <div style={{ fontSize: '14px', fontWeight: '900', color: '#0f766e', marginTop: '2px' }}>
                                ${(totalPrice * (t.percent / 100)).toLocaleString()} USD ({t.percent}%)
                              </div>
                            </div>

                            <div>
                              {isReleased ? (
                                <span style={styles.badgeSuccess}>RELEASED ✓</span>
                              ) : docVerified ? (
                                <button
                                  style={{ ...styles.actionBtnCompact, backgroundColor: '#059669', cursor: 'pointer' }}
                                  onClick={() => handleBuyerReleaseTranche(t.id)}
                                >
                                  Review & Release Funds 🔓
                                </button>
                              ) : (
                                <span style={styles.badgePending}>🔒 Pending Admin Doc Verification</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={styles.adminSimBox}>
                    <div style={{ fontSize: '10px', fontWeight: '900', color: '#1e3a8a', marginBottom: '6px' }}>
                      🛠️ ADMIN / CARRIER SIMULATION CONTROLS
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => handleSimulateAdminDocUpload('step5_qc')}
                        style={{ ...styles.demoSimBtn, backgroundColor: stepDocuments.step5_qc ? '#15803d' : '#2563eb' }}
                        disabled={isUploading}
                      >
                        {stepDocuments.step5_qc ? '✓ SGS QC Report Uploaded' : '+ Attach SGS QC Report (Unlocks Tranche 2)'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSimulateAdminDocUpload('step5_bl')}
                        style={{ ...styles.demoSimBtn, backgroundColor: stepDocuments.step5_bl ? '#15803d' : '#2563eb' }}
                        disabled={isUploading}
                      >
                        {stepDocuments.step5_bl ? '✓ Bill of Lading Uploaded' : '+ Attach Original BL (Unlocks Tranche 3)'}
                      </button>
                    </div>
                  </div>
                </div>

                <div style={styles.cardBox}>
                  <h3 style={styles.cardHeading}>📜 Real-Time Audit Feed</h3>
                  <div style={styles.auditLogBox}>
                    {liveLogs.map(l => (
                      <div key={l.id} style={styles.logTile}>
                        <div style={{ fontSize: '9px', fontWeight: '800', color: '#0f766e' }}>{l.time} • [{l.type}]</div>
                        <div style={{ fontSize: '11px', color: '#334155' }}>{l.text}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              <DocumentRoadmapPanel stepDocuments={stepDocuments} currentStepNum={currentStepNum} isLoadingDocs={isLoadingDocs} isDirectoryUnlocked={isDirectoryUnlocked} />
            </div>
          )}

          {/* VIEW 6: DOCUMENT VAULT */}
          {activeTab === 'docs' && (
            <div style={styles.gridTwoCol}>
              <div style={styles.cardBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                  <div>
                    <h3 style={styles.cardHeading}>📂 Master Document Vault</h3>
                    <p style={styles.cardSub}>All pre-uploaded and stage-required documents fetched from API repository.</p>
                  </div>
                  <button style={{ ...styles.actionBtnCompact, cursor: 'pointer' }} onClick={() => setShowUploadModal(true)}>+ Upload Any File</button>
                </div>

                {isLoadingDocs ? (
                  <div style={{ padding: '24px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
                    ⌛ Fetching document repository from server...
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                    {uploadedDocs.length === 0 ? (
                      <div style={{ fontSize: '11px', color: '#64748b' }}>No uploaded files currently in repository.</div>
                    ) : (
                      uploadedDocs.map((doc, idx) => (
                        <div key={doc.id || idx} style={styles.vaultDocTile}>
                          <div style={{ fontSize: '20px' }}>📄</div>
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {doc.originalName || doc.fileName || doc.filename || doc.name}
                            </div>
                            <div style={{ fontSize: '9.5px', color: '#0f766e' }}>
                              {doc.roleCategory || doc.userRole || 'Doc'} • {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleTimeString() : 'Just now'}
                            </div>
                            <div style={{ fontSize: '8.5px', color: (doc.status === 'APPROVED' || doc.status === 'VERIFIED') ? '#16a34a' : '#d97706', fontWeight: '800' }}>
                              {doc.status || 'VERIFIED'}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <DocumentRoadmapPanel stepDocuments={stepDocuments} currentStepNum={currentStepNum} isLoadingDocs={isLoadingDocs} isDirectoryUnlocked={isDirectoryUnlocked} />
            </div>
          )}

        </div>
      </main>

      {/* GENERIC FILE UPLOAD MODAL */}
      {showUploadModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '12px 16px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '800', fontSize: '12px' }}>📎 Pre-Upload Compliance Document</span>
              <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => setShowUploadModal(false)}>✕</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!selectedFile) return;
              await handleGenericFileUpload(selectedFile);
              setSelectedFile(null);
              setShowUploadModal(false);
            }} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={styles.inputLabel}>DOCUMENT DESCRIPTION / LABEL</label>
                <input type="text" placeholder="e.g. Phytosanitary Cert" value={extraDocName} onChange={e => setExtraDocName(e.target.value)} style={styles.inputField} />
              </div>
              <div>
                <label style={styles.inputLabel}>SELECT FILE</label>
                <input type="file" onChange={e => setSelectedFile(e.target.files[0])} style={styles.fileInput} required />
              </div>
              <button
                type="submit"
                style={{
                  ...styles.actionBtnFull,
                  opacity: isUploading ? 0.5 : 1,
                  cursor: isUploading ? 'not-allowed' : 'pointer'
                }}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload Document 🚀'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// INLINE STYLES OBJECT
const styles = {
  appShell: { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'sans-serif' },
  toastBanner: { position: 'fixed', top: '16px', right: '20px', color: '#ffffff', padding: '10px 18px', borderRadius: '30px', fontSize: '12px', fontWeight: '800', zIndex: 10000, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' },
  mobileOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.6)', zIndex: 9998 },
  sidebar: { width: '260px', backgroundColor: '#0f172a', color: '#ffffff', display: 'flex', flexDirection: 'column', padding: '16px', boxSizing: 'border-box', flexShrink: 0 },
  brandHeader: { display: 'flex', alignItems: 'center', gap: '10px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  brandBadge: { width: '32px', height: '32px', backgroundColor: '#0f766e', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  brandTitle: { fontSize: '12px', fontWeight: '900', letterSpacing: '0.5px' },
  brandSub: { fontSize: '9.5px', color: '#2dd4bf' },
  sidebarSectionLabel: { fontSize: '9px', fontWeight: '900', color: '#64748b', letterSpacing: '0.8px', margin: '16px 0 8px 4px' },
  navStack: { display: 'flex', flexDirection: 'column', gap: '4px' },
  navItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '8px', color: '#94a3b8', fontWeight: '700', fontSize: '13px', cursor: 'pointer' },
  navItemActive: { backgroundColor: '#0f766e', color: '#ffffff' },
  navItemDisabled: { opacity: 0.4, cursor: 'not-allowed' },
  navCompletedTag: { fontSize: '8.5px', fontWeight: '900', color: '#4ade80', backgroundColor: 'rgba(74, 222, 128, 0.15)', padding: '2px 6px', borderRadius: '4px' },
  sidebarFooterCard: { marginTop: 'auto', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px' },
  mainWrapper: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  topHeader: { backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  hamburgerBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: 0 },
  pageTitle: { fontSize: '16px', fontWeight: '900', margin: 0, color: '#0f172a' },
  pageSubtitle: { fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' },
  verifiedBuyerBadge: {
    fontSize: '10px',
    fontWeight: '900',
    color: '#7c5a00',
    background: 'linear-gradient(135deg, #fde68a, #f5c542)',
    border: '1px solid #ca9a04',
    padding: '3px 10px',
    borderRadius: '12px',
    whiteSpace: 'nowrap'
  },
  stepCounterBadge: { fontSize: '11px', fontWeight: '800', backgroundColor: '#f1f5f9', color: '#334155', padding: '4px 10px', borderRadius: '12px' },
  completed100Badge: { backgroundColor: '#dcfce7', border: '1px solid #86efac', color: '#15803d', fontSize: '10px', fontWeight: '900', padding: '4px 10px', borderRadius: '12px' },
  progressTrackerBar: { backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '0 24px', display: 'flex', overflowX: 'auto' },
  trackerSegment: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderBottom: '3px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap' },
  trackerCircle: { width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '900' },
  trackerTextGroup: { display: 'flex', flexDirection: 'column' },
  stepCompletedBadgeInline: { fontSize: '8px', fontWeight: '900', color: '#15803d', backgroundColor: '#dcfce7', padding: '1px 5px', borderRadius: '3px' },
  contentContainer: { padding: '24px', maxWidth: '1200px', width: '100%', boxSizing: 'border-box' },
  gridTwoCol: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' },
  cardBox: { backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '18px' },
  cardHeading: { fontSize: '15px', fontWeight: '900', margin: '0 0 4px 0', color: '#0f172a' },
  cardSub: { fontSize: '11px', color: '#64748b', margin: '0 0 12px 0' },
  cardCompletedBadge: { fontSize: '9.5px', fontWeight: '900', color: '#15803d', backgroundColor: '#dcfce7', border: '1px solid #86efac', padding: '3px 8px', borderRadius: '6px' },
  syncCard: { backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '8px', marginBottom: '12px' },
  badgeSuccess: { fontSize: '10px', fontWeight: '800', color: '#15803d', backgroundColor: '#dcfce7', padding: '3px 8px', borderRadius: '4px' },
  badgePending: { fontSize: '10px', fontWeight: '800', color: '#b91c1c', backgroundColor: '#fee2e2', padding: '3px 8px', borderRadius: '4px' },
  badgeInactive: { fontSize: '10px', fontWeight: '800', color: '#475569', backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '4px' },
  docRowItem: { display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', padding: '3px 0', borderBottom: '1px solid #f1f5f9' },
  demoLinkBtn: { background: 'none', border: 'none', color: '#2563eb', fontSize: '10px', fontWeight: '800', cursor: 'pointer', marginTop: '6px', padding: 0, textDecoration: 'underline' },
  inputLabel: { fontSize: '9px', fontWeight: '800', color: '#64748b', marginBottom: '3px', display: 'block' },
  inputField: { width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' },
  fileInput: { width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', backgroundColor: '#ffffff' },
  docGateBox: { backgroundColor: '#f8fafc', border: '1.5px dashed #0f766e', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px' },
  docGateHeader: { fontSize: '10px', fontWeight: '900', color: '#0f766e' },
  actionBtnFull: { width: '100%', backgroundColor: '#0f766e', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '6px', fontSize: '12px', fontWeight: '900' },
  actionBtnCompact: { backgroundColor: '#0f766e', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' },
  roadmapTile: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 10px', borderRadius: '6px' },
  bannerBlue: { backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px 16px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  directoryPaywallBox: { backgroundColor: '#ffffff', border: '1.5px dashed #0f766e', borderRadius: '10px', padding: '28px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
  sellerCard: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' },
  avatarBox: { fontSize: '24px', width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  sellerBadge: { fontSize: '9px', fontWeight: '900', color: '#0f766e', backgroundColor: '#ccfbf1', padding: '3px 8px', borderRadius: '8px' },
  summaryBox: { padding: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px' },
  chatContainer: { height: '180px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' },
  chatBubble: { maxWidth: '85%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' },
  downloadLink: { fontSize: '10px', fontWeight: '900', color: '#0f766e', textDecoration: 'none', border: '1px solid #99f6e4', backgroundColor: '#f0fdfa', padding: '4px 10px', borderRadius: '6px' },
  liveBanner: { backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderLeft: '6px solid #10b981', borderRadius: '10px', padding: '16px' },
  progressBarBg: { width: '100%', height: '8px', backgroundColor: '#dcfce7', borderRadius: '4px', overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#10b981', transition: 'width 0.5s ease' },
  sensorGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' },
  sensorTile: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' },
  sensorLabel: { fontSize: '9px', fontWeight: '800', color: '#64748b' },
  sensorVal: { fontSize: '12px', fontWeight: '900', color: '#0f172a' },
  trancheTile: { border: '1px solid', padding: '12px', borderRadius: '8px', backgroundColor: '#ffffff' },
  adminSimBox: { marginTop: '16px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' },
  demoSimBtn: { border: 'none', color: '#ffffff', padding: '6px 12px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', cursor: 'pointer' },
  auditLogBox: { height: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' },
  logTile: { backgroundColor: '#ffffff', padding: '6px', borderRadius: '4px', borderLeft: '3px solid #0f766e' },
  vaultDocTile: { display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '8px', backgroundColor: '#f8fafc' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(3px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  modalCard: { backgroundColor: '#ffffff', borderRadius: '10px', width: '360px', overflow: 'hidden' }
};