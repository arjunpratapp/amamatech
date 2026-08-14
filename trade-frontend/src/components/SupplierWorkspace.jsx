import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:5000'; // Replace with your Socket.io backend URL

// Mirrors OnboardingPortal.jsx's MOCK_REQUIREMENTS for supplier roles. Used
// to render one upload slot per actual required document (instead of a
// single generic "Step 1 File" blob) so each upload can be matched back to
// its own requirement, and so a rejected document can be individually
// replaced without touching the others.
const SUPPLIER_REQUIRED_DOCS = {
    PRODUCER: [
        { id: 'govt_id', label: 'Government ID (Voter ID)' },
        { id: 'land_proof', label: 'Land Ownership Proof / 7/12 Extract' },
        { id: 'bank_passbook', label: 'Bank Passbook / Cancelled Cheque' },
        { id: 'farm_photo', label: 'Farm Photo (Camera Capture)' }
    ],
    TRADER: [
        { id: 'iec_license', label: 'Import Export Code (IEC)' },
        { id: 'gst_cert', label: 'GST Registration Certificate' },
        { id: 'apeda_cert', label: 'APEDA Registration (RCMC)' },
        { id: 'fssai_license', label: 'FSSAI Export License' },
        { id: 'trade_license', label: 'Municipal Trade License' },
        { id: 'pan_card', label: 'Company PAN Card' },
        { id: 'bank_cert', label: 'Bank AD Code Letter' },
        { id: 'phyto_cert', label: 'Phytosanitary Protocol Declaration' }
    ]
};

// Onboarding never persists which seller-type schema (Producer vs Trader) a
// supplier used, so infer it from which document field IDs have actually
// shown up on their account — each schema uses a disjoint set of field IDs.
// Defaults to TRADER (the broader/more common schema) when nothing has been
// uploaded yet at all.
const inferSupplierRequiredDocs = (docFieldIds) => {
    const producerHits = SUPPLIER_REQUIRED_DOCS.PRODUCER.filter(r => docFieldIds.includes(r.id)).length;
    const traderHits = SUPPLIER_REQUIRED_DOCS.TRADER.filter(r => docFieldIds.includes(r.id)).length;
    if (producerHits === 0 && traderHits === 0) return { type: 'TRADER', docs: SUPPLIER_REQUIRED_DOCS.TRADER };
    return producerHits > traderHits
        ? { type: 'PRODUCER', docs: SUPPLIER_REQUIRED_DOCS.PRODUCER }
        : { type: 'TRADER', docs: SUPPLIER_REQUIRED_DOCS.TRADER };
};

// --- SEED DATA: TOP 5 VERIFIED BUYER LEADS FOR SELLERS ---
// TOP_5_BUYERS (hardcoded demo data) used to live here. It's now fetched
// live from GET /api/v1/directory/buyers into the buyersList state below,
// so the Buyer Directory reflects real onboarded buyer accounts.

// --- REUSABLE PERSISTENT COMPONENT: UPFRONT SUPPLIER DOCUMENT ROADMAP ---
function SupplierDocumentRoadmapPanel({ stepDocuments, currentStepNum, isDirectoryUnlocked }) {
  const roadmapItems = [
    { stepNum: 1, step: 'Step 1: KYC', docType: 'Phytosanitary & Export Licence', auth: 'Ministry of Agriculture / CFIA', attachedDoc: stepDocuments.step1 },
    { stepNum: 2, step: 'Step 2: Leads', docType: 'Buyer Directory Unlock Fee ($5,000)', auth: 'AMAMA Gateway Billing', attachedDoc: isDirectoryUnlocked ? { name: 'Directory Unlock Fee — $5,000 Paid' } : null },
    { stepNum: 3, step: 'Step 3: Contract', docType: 'AMAMA Generated Sales Contract', auth: 'Legal Team / Both Parties', attachedDoc: stepDocuments.step3 },
    { stepNum: 4, step: 'Step 4: Escrow', docType: 'Exporter Wire & Payout Advice', auth: 'Beneficiary Bank', attachedDoc: stepDocuments.step4 },
    { stepNum: 5, step: 'Step 5: QC', docType: 'SGS / BV Quality Audit Report', auth: 'SGS Inspection Agency', attachedDoc: stepDocuments.step5_qc },
    { stepNum: 5, step: 'Step 5: BL Delivery', docType: 'Original Bill of Lading', auth: 'Carrier / Shipping Line', attachedDoc: stepDocuments.step5_bl }
  ];

  return (
    <div style={styles.cardBox}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <span style={{ fontSize: '16px' }}>📑</span>
        <h3 style={styles.cardHeading}>Upfront Supplier Document Roadmap</h3>
      </div>
      <p style={styles.cardSub}>Prepare required export authorities and compliance documents to unlock escrow payouts.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
        {roadmapItems.map((r, i) => {
          const isCurrentStep = r.stepNum === currentStepNum;
          const isPastStep = r.stepNum < currentStepNum;
          const isReady = !!r.attachedDoc;

          return (
            <div
              key={i}
              style={{
                ...styles.roadmapTile,
                borderLeft: isCurrentStep ? '4px solid #059669' : '1px solid #e2e8f0',
                backgroundColor: isCurrentStep ? '#ecfdf5' : '#f8fafc'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '900', color: isCurrentStep ? '#059669' : '#64748b' }}>
                    {r.step}
                  </span>
                  {isCurrentStep && (
                    <span style={{ fontSize: '8px', fontWeight: '900', color: '#047857', backgroundColor: '#a7f3d0', padding: '1px 5px', borderRadius: '3px' }}>
                      CURRENT STEP
                    </span>
                  )}
                  {isPastStep && isReady && (
                    <span style={{ fontSize: '8px', fontWeight: '900', color: '#15803d', backgroundColor: '#dcfce7', padding: '1px 5px', borderRadius: '3px' }}>
                      VERIFIED ✓
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '11px', fontWeight: '800', color: isReady ? '#059669' : '#0f172a', marginTop: '2px', wordBreak: 'break-all' }}>
                  {isReady ? `📎 ${r.attachedDoc.name}` : r.docType}
                </div>
                <div style={{ fontSize: '9.5px', color: '#64748b' }}>Authority: {r.auth}</div>
              </div>

              <span style={isReady ? styles.badgeSuccess : styles.badgeInactive}>
                {isReady ? 'READY ✓' : 'NOT UPLOADED'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SupplierWorkspaceReplicated({ user, onboardingData }) {
  // --- UI & NAVIGATION STATE ---
  const [activeTab, setActiveTab] = useState('kyc');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // --- DYNAMIC ONBOARDING DOCUMENTS ---
  const [onboardingDocs, setOnboardingDocs] = useState(
    onboardingData?.documents || []
  );

  // FIX: admin-set statuses arrive as 'Approved'/'Rejected' (mixed case),
  // not the upper-case 'VERIFIED'/'APPROVED' this strict-case allowlist
  // expected -- so the "Verified Seller" / ACCREDITED badge never lit up
  // even after every document was approved. Normalize case and only block
  // on an actual rejection.
  const isOnboardingVerified = onboardingDocs.length > 0 && onboardingDocs.every(d => (d.status || '').toUpperCase() !== 'REJECTED');

  // --- WORKFLOW STEP TRACKING ---
  const [workflowStep, setWorkflowStep] = useState(1);

  // --- STEP DOCUMENTS TRACKER ---
  const [stepDocuments, setStepDocuments] = useState({
    step1: null,
    step2: null,
    step3: null,
    step4: null,
    step5_qc: null,
    step5_bl: null
  });

  // --- STEP 1: KYC STATE ---
  const [kycData, setKycData] = useState({
    companyName: user?.companyName || 'Prairie Co-op Agriculture Inc.',
    taxId: user?.taxId || '',
    country: user?.country || 'Canada'
  });

  // --- EXTRA DOCUMENT UPLOAD STATE ---
  const [extraDocName, setExtraDocName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // --- BUYER DIRECTORY UNLOCK (STEP 2 PAYWALL) ---
  const [isDirectoryUnlocked, setIsDirectoryUnlocked] = useState(false);
  const [directoryUnlockStatus, setDirectoryUnlockStatus] = useState('idle');
  const DIRECTORY_UNLOCK_FEE = 5000;

  // --- REAL BUYER DIRECTORY — replaces the old hardcoded buyersList demo
  // list with genuine onboarded BUYER accounts from the backend. ---
  const [buyersList, setBuyersList] = useState([]);
  const [isLoadingBuyers, setIsLoadingBuyers] = useState(true);
  const [buyersLoadError, setBuyersLoadError] = useState('');

  // Pulled into a stable function so it can be re-run live (see the socket
  // effect below) whenever a new buyer registers, not just on mount.
  const fetchBuyersList = useCallback(() => {
    let cancelled = false;
    setIsLoadingBuyers(true);
    fetch('/api/v1/directory/buyers')
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        setBuyersList(Array.isArray(data.buyers) ? data.buyers : []);
        setBuyersLoadError('');
      })
      .catch(err => {
        if (cancelled) return;
        console.error('Failed to load buyer directory:', err);
        setBuyersLoadError('Unable to load the buyer directory. Please check your connection and try again.');
        setBuyersList([]);
      })
      .finally(() => { if (!cancelled) setIsLoadingBuyers(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const cancel = fetchBuyersList();
    return cancel;
  }, [fetchBuyersList]);

  // --- STEP 2: PERISHABLE GOODS CATEGORY FILTER ---
  const [selectedCommodityFilter, setSelectedCommodityFilter] = useState('ALL');
  const perishableGoodsOptions = Array.from(new Set(buyersList.map(b => b.commodity)));

  // --- BUYER SELECTION & DEAL NEGOTIATION ---
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(40);
  const [negotiatedPrice, setNegotiatedPrice] = useState(0);
  const [isDealClosed, setIsDealClosed] = useState(false);

  // Default to the first loaded buyer once the directory arrives —
  // buyersList[0] used to be available synchronously; now it only exists
  // after the fetch above resolves.
  useEffect(() => {
    if (!selectedBuyer && buyersList.length > 0) {
      setSelectedBuyer(buyersList[0]);
      setOrderQuantity(buyersList[0].requiredQty || 40);
      setNegotiatedPrice(buyersList[0].offeredPrice || 0);
    }
  }, [buyersList, selectedBuyer]);

  // --- REAL-TIME CONVERSATION & NOTIFICATIONS STATE ---
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isBuyerTyping, setIsBuyerTyping] = useState(false);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const chatBottomRef = useRef(null);

  // Refs so the long-lived socket listeners always see the latest tab/buyer
  // without having to re-subscribe on every render.
  const activeTabRef = useRef(activeTab);
  const selectedBuyerRef = useRef(selectedBuyer);
  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => { selectedBuyerRef.current = selectedBuyer; }, [selectedBuyer]);
  const buyersListRef = useRef(buyersList);
  useEffect(() => { buyersListRef.current = buyersList; }, [buyersList]);

  // --- REAL-TIME TRANSACTION ENGINE STATE ---
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [activeTransaction, setActiveTransaction] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('SWIFT_WIRE');

  // --- LIVE TELEMETRY SIMULATION STATE ---
  const [liveTradeData, setLiveTradeData] = useState({
    status: 'TRANSIT_IN_PROGRESS',
    vesselName: 'MV OCEAN PHOENIX V-402',
    lat: '24.8607° N',
    lng: '67.0011° E',
    speedKnots: '18.4 kts',
    tempC: '18.0°C',
    humidityPct: '52%',
    etaDays: 6,
    routeProgress: 52,
    containerId: 'CONT-892011-X'
  });

  const [liveLogs, setLiveLogs] = useState([]);
  const [escrowTranches, setEscrowTranches] = useState([
    { id: 1, name: 'Tranche 1: Advance Deposit Payout', percent: 25, status: 'LOCKED', reqDocKey: 'step4', triggerLabel: 'Contract Signing & Buyer Initial Wire' },
    { id: 2, name: 'Tranche 2: SGS Quality Approval Payout', percent: 35, status: 'LOCKED', reqDocKey: 'step5_qc', triggerLabel: 'Requires Verified SGS / BV QC Audit Report' },
    { id: 3, name: 'Tranche 3: Bill of Lading Settlement Payout', percent: 40, status: 'LOCKED', reqDocKey: 'step5_bl', triggerLabel: 'Requires Original Bill of Lading Upload' }
  ]);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  const activeUserId = user?.id || 'usr_772';
  const totalPrice = orderQuantity * negotiatedPrice;

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // --- SOCKET.IO & NOTIFICATION INITIALIZATION ---
  // Chat is now backend-authoritative: the server persists every message and
  // is the single source of truth. This client never appends a message
  // locally on send — it only renders what the server broadcasts back, so
  // every open tab (and a future buyer-side client) stays in sync in real time.
  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL, {
      query: { userId: activeUserId, role: 'SUPPLIER' },
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 5,
      autoConnect: true
    });

    setSocket(newSocket);

    // Sent by the server right after chat:join, scoped to the buyer the
    // client asked to open. Guard against a stale response landing after
    // the user has already switched to a different buyer.
    const handleHistory = ({ buyerId, messages }) => {
      if (selectedBuyerRef.current && buyerId === selectedBuyerRef.current.id) {
        setChatMessages(Array.isArray(messages) ? messages : []);
      }
    };

    // Broadcast to every socket joined to that supplier+buyer room —
    // covers the supplier's own message echoed back, and the buyer's
    // (simulated or real) reply, so state never drifts from the backend.
    const handleIncomingMessage = (incomingMsg) => {
      const isForOpenConversation = selectedBuyerRef.current && incomingMsg.buyerId === selectedBuyerRef.current.id;
      const isCurrentlyViewing = isForOpenConversation && activeTabRef.current === 'contract';

      if (isCurrentlyViewing) {
        setChatMessages((prev) => [...prev, incomingMsg]);
      }

      const isOwnMessage = incomingMsg.senderId === activeUserId;
      if (isOwnMessage) return;

      if (!isCurrentlyViewing) {
        const senderBuyer = buyersListRef.current.find(b => b.id === incomingMsg.buyerId) || { name: incomingMsg.sender || 'Buyer' };

        setNotifications((prev) => [
          {
            id: Date.now(),
            buyerId: incomingMsg.buyerId,
            buyerName: senderBuyer.name,
            text: incomingMsg.text,
            time: incomingMsg.time || new Date().toLocaleTimeString(),
            read: false
          },
          ...prev
        ]);
        setUnreadCount((prev) => prev + 1);

        triggerToast(`💬 New Message from ${senderBuyer.name}: "${incomingMsg.text}"`);
      }
    };

    const handleTyping = ({ buyerId, isTyping }) => {
      if (selectedBuyerRef.current && buyerId === selectedBuyerRef.current.id) {
        setIsBuyerTyping(!!isTyping);
      }
    };

    newSocket.on('chat:history', handleHistory);
    newSocket.on('chat:receive_message', handleIncomingMessage);
    newSocket.on('chat:typing', handleTyping);

    // Admin approves/rejects a compliance document, or a document gets
    // (re)uploaded — reflect it live for this supplier if it's their own
    // document (server broadcasts globally, so filter to this user's own
    // uploads) by actually refetching, not just toasting. Also pick up a
    // brand-new buyer registering elsewhere by refreshing the Buyer
    // Directory, so this supplier sees them without a manual page refresh.
    const handleVerificationUpdate = (data) => {
      if (!data || !data.type) return;

      if (data.type === 'USER_REGISTERED') {
        if (data.roleCategory === 'buyers') fetchBuyersList();
        return;
      }

      if (data.type !== 'DOCUMENT_STATUS_CHANGED' && data.type !== 'DOCUMENTS_UPLOADED') return;
      const doc = data.document || (Array.isArray(data.documents) ? data.documents[0] : null) || {};
      const ownerId = data.userId || doc.userId;
      if (ownerId !== activeUserId) return;

      fetchUserDocuments();

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
  }, [activeUserId]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isBuyerTyping]);

  // Clear unread count when switching to chat tab
  useEffect(() => {
    if (activeTab === 'contract') {
      setUnreadCount(0);
    }
  }, [activeTab]);

  // API Integration: Fetch user documents & Hydrate Workflow State. Pulled
  // out of the effect body (still invoked by it below) so a per-document
  // upload can call this directly afterward to refresh real server state,
  // instead of fabricating a fake local "VERIFIED" doc the way the old
  // single-slot upload flow used to.
  const fetchUserDocuments = async () => {
    setIsLoadingDocs(true);
    try {
      const response = await fetch(`/api/v1/verification/user/${activeUserId}`, {
        headers: { 'x-user-role': 'SUPPLIER', 'x-user-id': activeUserId }
      });
      if (!response.ok) return;

      const data = await response.json();
      if (data && data.success && Array.isArray(data.documents)) {
        const formatted = data.documents.map(doc => ({
          id: doc.id,
          name: doc.originalName || doc.filename || doc.name || 'Uploaded Document',
          type: doc.documentType || 'Export Document',
          status: doc.status || 'VERIFIED',
          time: doc.createdAt ? new Date(doc.createdAt).toLocaleTimeString() : 'Uploaded',
          path: doc.path,
          // Dropped previously — needed so a rejected-document alert can
          // actually show the admin's reason instead of just "Rejected".
          adminRemarks: doc.adminRemarks || '',
          // The specific requirement this upload satisfies (e.g. 'iec_license')
          // — 'fieldName' from onboarding-time credential JSON, 'documentType'
          // from the compliance-upload endpoint. Powers the per-document Step 1
          // upload slots below; NOT the same as the human-readable `type` above.
          fieldId: doc.fieldName || doc.documentType || null
        }));

        setUploadedDocs(formatted);
        if (formatted.length > 0) {
          setOnboardingDocs(formatted.map(d => ({ id: d.id, name: d.name, status: d.status })));

          setStepDocuments(prev => {
            const newStepDocs = { ...prev };
            formatted.forEach(d => {
              // step1 is now derived separately from real per-document
              // required-doc completion (see the requiredDocs effect below)
              // instead of this brittle text-matching heuristic.
              if (d.type.includes('Step step2') || d.type.includes('Quotation') || d.type.includes('Quote')) newStepDocs.step2 = d;
              if (d.type.includes('Step step3') || d.type.includes('Contract')) newStepDocs.step3 = d;
              if (d.type.includes('Step step4') || d.type.includes('Wire') || d.type.includes('Bank')) newStepDocs.step4 = d;
              if (d.type.includes('Step step5_qc') || d.type.includes('SGS') || d.type.includes('QC')) newStepDocs.step5_qc = d;
              if (d.type.includes('Step step5_bl') || d.type.includes('Lading') || d.type.includes('BL')) newStepDocs.step5_bl = d;
            });

            if (newStepDocs.step4) setWorkflowStep(5);
            else if (newStepDocs.step3) setWorkflowStep(4);
            else if (newStepDocs.step2) setWorkflowStep(3);

            return newStepDocs;
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch verification documents:', err);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  // API Integration: Fetch user documents on mount
  useEffect(() => {
    if (activeUserId) {
      fetchUserDocuments();
    }
  }, [activeUserId]);

  // Required-docs schema for this supplier (inferred from whatever field IDs
  // have shown up on their account so far), and the derived per-slot status
  // used to render the Step 1 upload list.
  const supplierDocSchema = inferSupplierRequiredDocs(
    (uploadedDocs || []).map(d => d.fieldId).filter(Boolean)
  );
  const requiredDocs = supplierDocSchema.docs;

  const getDocSlotStatus = (docId) => {
    const matches = (uploadedDocs || []).filter(d => d.fieldId === docId);
    if (matches.length === 0) return { state: 'missing' };
    const doc = matches[matches.length - 1];
    const statusUpper = (doc.status || '').toUpperCase();
    if (statusUpper === 'REJECTED') return { state: 'rejected', reason: doc.adminRemarks, doc };
    if (statusUpper === 'APPROVED' || statusUpper === 'VERIFIED') return { state: 'approved', doc };
    return { state: 'pending', doc };
  };

  // Derive stepDocuments.step1 (used by the roadmap panel, the "Complete
  // Step 1" button, and handleVerifyKYC) from REAL per-document status
  // instead of the old single generic file. Only advances workflowStep —
  // never regresses it if the user already moved on.
  useEffect(() => {
    const allReady = requiredDocs.every(rd => {
      const s = getDocSlotStatus(rd.id).state;
      return s === 'pending' || s === 'approved';
    });

    setStepDocuments(prev => {
      if (allReady && !prev.step1) {
        return { ...prev, step1: { name: `${requiredDocs.length} KYC document(s) submitted`, date: new Date().toLocaleTimeString() } };
      }
      if (!allReady && prev.step1) {
        return { ...prev, step1: null };
      }
      return prev;
    });

    if (allReady) {
      setWorkflowStep(prev => (prev < 2 ? 2 : prev));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploadedDocs]);

  // fieldName defaults to 'file' for existing callers (Steps 2-5, which
  // aren't broken out into per-document requirement slots). The per-document
  // Step 1 slots pass their own requirement id (e.g. 'iec_license') instead,
  // so the backend's multer upload.any() records it as that exact
  // documentType/fieldName — letting the admin's missing-docs check (and
  // this component's own getDocSlotStatus) match the upload back to the
  // specific requirement it satisfies.
  const uploadDocumentToBackend = async (file, docTypeLabel, fieldName = 'file') => {
    if (!file) return null;
    setIsUploading(true);

    const formData = new FormData();
    formData.append(fieldName, file);
    formData.append('userId', activeUserId);
    formData.append('userName', kycData?.companyName || 'Supplier User');
    formData.append('userRole', 'SUPPLIER');
    formData.append('sellerType', supplierDocSchema.type);
    formData.append('documentType', docTypeLabel);

    try {
      const response = await fetch('/api/v1/verification/upload', {
        method: 'POST',
        headers: {
          'x-user-role': 'SUPPLIER',
          'x-user-id': activeUserId,
        },
        body: formData,
      });

      if (!response.ok) throw new Error(`Upload failed with status: ${response.status}`);

      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Document upload failed:', err);
      triggerToast('❌ Error uploading document to server.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const isStep1Completed = workflowStep > 1;
  const isStep2Completed = workflowStep > 2;
  const isStep3Completed = workflowStep > 3;
  const isStep4Completed = workflowStep > 4;
  const isStep5Completed = workflowStep === 5;
  const is100PercentCompleted = isStep1Completed && isStep2Completed && isStep3Completed && isStep4Completed && isStep5Completed;

  const currentStepNum = activeTab === 'kyc' ? 1
    : activeTab === 'buyers' ? 2
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

  const handleVerifyKYC = (e) => {
    e.preventDefault();
    if (!stepDocuments.step1) {
      triggerToast('❌ BLOCKED: Agricultural Export Licence upload required.');
      return;
    }
    setWorkflowStep(2);
    setActiveTab('buyers');
    setLiveLogs(prev => [{ id: Date.now(), time: new Date().toLocaleTimeString(), text: `Step 1 Completed: ${stepDocuments.step1.name} Verified.`, type: 'KYC' }, ...prev]);
    triggerToast('✅ Step 1 Completed! Buyer Leads Unlocked.');
  };

  const handleUnlockDirectory = () => {
    setDirectoryUnlockStatus('processing');
    setTimeout(() => {
      setIsDirectoryUnlocked(true);
      setDirectoryUnlockStatus('unlocked');
      setLiveLogs(prev => [{ id: Date.now(), time: new Date().toLocaleTimeString(), text: `Buyer Directory unlocked for $${DIRECTORY_UNLOCK_FEE.toLocaleString()} USD.`, type: 'PAYMENT' }, ...prev]);
      triggerToast(`✅ Buyer Directory Unlocked! $${DIRECTORY_UNLOCK_FEE.toLocaleString()} USD fee processed.`);
    }, 1800);
  };

  // Joins the persistent chat room for supplier+buyer on the backend and
  // clears the local view while we wait for that room's history to arrive.
  // Shared by buyer selection and by clicking a notification for a buyer
  // whose thread isn't currently open.
  const joinBuyerChatRoom = (buyer) => {
    setSelectedBuyer(buyer);
    selectedBuyerRef.current = buyer; // keep the ref in sync synchronously so the
    // chat:history / chat:receive_message listeners (which read the ref, not
    // React state) accept the very next server event for this buyer.
    setChatMessages([]);

    if (socket && socket.connected) {
      socket.emit('chat:join', {
        supplierId: activeUserId,
        buyerId: buyer.id,
        supplierName: kycData.companyName
      });
    } else {
      triggerToast('❌ Not connected to chat server — reconnecting...');
    }
  };

  const handleSelectBuyer = (buyer) => {
    if (!isDirectoryUnlocked) {
      triggerToast('❌ BLOCKED: Unlock the Buyer Directory first ($5,000).');
      return;
    }
    setNegotiatedPrice(buyer.offeredPrice);
    setOrderQuantity(buyer.requiredQty);
    joinBuyerChatRoom(buyer);

    setWorkflowStep(3);
    setActiveTab('contract');
    setLiveLogs(prev => [{ id: Date.now(), time: new Date().toLocaleTimeString(), text: `Step 2 Completed: Connected with ${buyer.name} via unlocked Buyer Directory.`, type: 'BID' }, ...prev]);
    triggerToast(`✅ Step 2 Completed! Connected with ${buyer.name}. Step 3 Unlocked.`);
  };

  // Backend-authoritative send: the server persists the message and
  // broadcasts it back over chat:receive_message, which is what actually
  // renders it (see the socket effect above) — this keeps every open tab,
  // and any future buyer-side client, showing the exact same live thread.
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isDealClosed || !selectedBuyer) return;

    if (!socket || !socket.connected) {
      triggerToast('❌ Not connected to chat server. Please check your connection.');
      return;
    }

    socket.emit('chat:send_message', {
      supplierId: activeUserId,
      buyerId: selectedBuyer?.id,
      senderId: activeUserId,
      senderRole: 'SUPPLIER',
      sender: kycData.companyName || 'You (Exporter)',
      text: newMessage.trim(),
      context: { negotiatedPrice, orderQuantity }
    });

    setNewMessage('');
  };

  const handleGenerateContract = () => {
    const contractText = `AMAMA GATEWAY — STANDARD BILATERAL SALES CONTRACT
Generated: ${new Date().toLocaleString()}

SELLER (Exporter): ${kycData.companyName}
Country of Origin: ${kycData.country}

BUYER: ${selectedBuyer?.name}
Location: ${selectedBuyer?.location}
Destination Port: ${selectedBuyer?.destPort}

COMMODITY: ${selectedBuyer?.commodity}
QUANTITY: ${orderQuantity} MT
PRICE: $${negotiatedPrice} / MT
TOTAL CONTRACT VALUE: $${totalPrice.toLocaleString()} USD
Origin Port: ${selectedBuyer?.originPort}

This contract was generated automatically by AMAMA Gateway on behalf of the Seller
and is subject to AMAMA's standard escrow-backed trade terms.
`;
    const blob = new Blob([contractText], { type: 'text/plain' });
    const downloadUrl = URL.createObjectURL(blob);
    const fileName = `AMAMA-Sales-Contract-${selectedBuyer?.id}-${Date.now()}.txt`;

    const docObj = { name: fileName, size: (blob.size / 1024).toFixed(1) + ' KB', date: new Date().toLocaleTimeString(), downloadUrl };
    setStepDocuments(prev => ({ ...prev, step3: docObj }));

    const newDoc = { id: `doc-${Date.now()}`, name: fileName, type: 'Step step3 Document (AMAMA Generated Contract)', time: 'Just now', status: 'VERIFIED' };
    setUploadedDocs(prev => [newDoc, ...prev]);
    setOnboardingDocs(prev => [...prev, { id: newDoc.id, name: fileName, status: 'VERIFIED' }]);

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

    setChatMessages(prev => [
      ...prev,
      {
        id: `sys-${Date.now()}`,
        sender: 'System',
        text: `🤝 CONTRACT LOCKED: Sales contract ${stepDocuments.step3.name} signed. Escrow stage enabled.`,
        time: new Date().toLocaleTimeString(),
        isSystem: true
      }
    ]);

    setLiveLogs(prev => [{ id: Date.now(), time: new Date().toLocaleTimeString(), text: `Step 3 Completed: Contract Signed (${stepDocuments.step3.name}) with ${selectedBuyer?.name}.`, type: 'CONTRACT' }, ...prev]);
    triggerToast('✅ Step 3 Completed! Contract Signed. Step 4 Unlocked.');
  };

  const handleOpenPaymentModal = () => {
    if (!stepDocuments.step4) {
      triggerToast('❌ BLOCKED: Bank Payout Authorization Form required.');
      return;
    }
    setPaymentStatus('modal_open');
  };

  const handleProcessRealTimeTransaction = async () => {
    setPaymentStatus('processing');
    const txId = `TXN-AMAMA-${Math.floor(100000 + Math.random() * 900000)}-${Date.now().toString().slice(-4)}`;

    setTimeout(() => {
      setPaymentStatus('verifying_bank');

      setTimeout(() => {
        const completedTxn = {
          id: txId,
          amount: totalPrice * 0.25,
          totalContractValue: totalPrice,
          trancheName: 'Tranche 1: Advance Deposit (25%)',
          timestamp: new Date().toISOString(),
          paymentMethod: selectedPaymentMethod,
          buyerName: selectedBuyer?.name,
          sellerName: kycData.companyName,
          status: 'SUCCESSFUL',
          swiftCode: 'AMAMUS33XXX',
          escrowRef: `ESCROW-REF-${Math.floor(Math.random() * 888888 + 111111)}`
        };

        setActiveTransaction(completedTxn);
        setPaymentStatus('success');
        setEscrowTranches(prev => prev.map(t => t.id === 1 ? { ...t, status: 'RELEASED' } : t));
        setWorkflowStep(5);

        setLiveLogs(prev => [
          { id: Date.now(), time: new Date().toLocaleTimeString(), text: `Real-time Transaction ${txId} APPROVED. $${(totalPrice * 0.25).toLocaleString()} USD released to escrow balance.`, type: 'FINANCE' },
          ...prev
        ]);
        triggerToast('⚡ REAL-TIME TRANSACTION EXECUTED! Escrow Deposit Active.');
      }, 2000);
    }, 1800);
  };

  const handleFinishTransactionAndMove = () => {
    setPaymentStatus('idle');
    setActiveTab('live');
    triggerToast('🎉 ALL STAGES 100% COMPLETED! Live Dispatch & Telemetry Active.');
  };

  const handleStepDocAttach = async (stepKey, file) => {
    if (!file) return;

    const docType = `Step ${stepKey} Document`;
    const docObj = { name: file.name, size: (file.size / 1024).toFixed(1) + ' KB', date: new Date().toLocaleTimeString() };
    setStepDocuments(prev => ({ ...prev, [stepKey]: docObj }));

    const res = await uploadDocumentToBackend(file, docType);

    const exactName = file.name;
    const newDoc = {
      id: res?.documents?.[0]?.id || `doc-${Date.now()}`,
      name: exactName,
      type: docType,
      time: 'Just now',
      status: 'VERIFIED'
    };

    setUploadedDocs(prev => [newDoc, ...prev]);
    setOnboardingDocs(prev => [...prev, { id: newDoc.id, name: exactName, status: 'VERIFIED' }]);

    triggerToast(`📎 File "${exactName}" uploaded and attached!`);
  };

  // Per-document Step 1 upload — used by each individual requirement slot
  // (e.g. "IEC License", "GST Certificate") instead of the old single
  // generic file. Uploads under the requirement's own field id so it maps
  // back to that specific document, then refetches real server state rather
  // than fabricating a fake local "VERIFIED" status the way the generic
  // handler above does — a fresh upload should show as Pending Review, not
  // pre-verified.
  const handleDocSlotAttach = async (docId, docLabel, file) => {
    if (!file) return;

    await uploadDocumentToBackend(file, docLabel, docId);
    await fetchUserDocuments();

    triggerToast(`📎 "${docLabel}" uploaded — pending admin review.`);
  };

  const handleGenericFileUpload = async (file) => {
    if (!file) return;
    const label = extraDocName.trim() || 'General Export File';
    const exactName = file.name;

    const res = await uploadDocumentToBackend(file, label);

    const newDoc = {
      id: res?.documents?.[0]?.id || `doc-${Date.now()}`,
      name: exactName,
      type: label,
      time: 'Just now',
      status: 'VERIFIED'
    };

    setUploadedDocs(prev => [newDoc, ...prev]);
    setOnboardingDocs(prev => [...prev, { id: newDoc.id, name: exactName, status: 'VERIFIED' }]);

    setExtraDocName('');
    triggerToast(`📄 File "${exactName}" uploaded to Repository!`);
  };

  const handleNotificationClick = (notif) => {
    const targetBuyer = buyersList.find(b => b.id === notif.buyerId);
    // Only re-join if this is actually a different conversation — the room
    // (and its history) is already loaded if the supplier is switching back
    // to a buyer they were just chatting with.
    if (targetBuyer && targetBuyer.id !== selectedBuyer?.id) {
      joinBuyerChatRoom(targetBuyer);
    }
    if (workflowStep < 3) {
      setWorkflowStep(3);
    }
    setActiveTab('contract');
    setShowNotificationMenu(false);
  };

  const stepsList = [
    { key: 'kyc', num: 1, label: 'Step 1: KYC', completed: isStep1Completed, docObj: stepDocuments.step1 },
    { key: 'buyers', num: 2, label: 'Step 2: Buyers', completed: isStep2Completed, docObj: isDirectoryUnlocked ? { name: 'Directory Unlock Fee — $5,000 Paid' } : null },
    { key: 'contract', num: 3, label: 'Step 3: Contract', completed: isStep3Completed, docObj: stepDocuments.step3 },
    { key: 'escrow', num: 4, label: 'Step 4: Escrow', completed: isStep4Completed, docObj: stepDocuments.step4 },
    { key: 'live', num: 5, label: 'Step 5: Dispatch', completed: isStep5Completed, docObj: stepDocuments.step5_bl || stepDocuments.step5_qc }
  ];

  return (
    <div style={styles.appShell}>
      <style>{`
        @keyframes pulseGlow {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
          70% { box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        @keyframes typingDots {
          0% { opacity: 0.2; }
          20% { opacity: 1; }
          100% { opacity: 0.2; }
        }
        @keyframes spinner {
          to { transform: rotate(360deg); }
        }

        .spinner-icon {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #ffffff;
          animation: spinner 0.8s linear infinite;
        }

        .typing-dot {
          animation: typingDots 1.4s infinite fill-mode;
          width: 5px;
          height: 5px;
          background-color: #64748b;
          border-radius: 50%;
          display: inline-block;
        }

        .nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border-radius: 8px;
          color: #94a3b8;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .nav-item:hover {
          background-color: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }
        .nav-item.active {
          background-color: #059669;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(5, 150, 105, 0.35);
        }
        .nav-item.disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .action-btn {
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .action-btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.1);
        }
        .action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .live-pulse-dot {
          width: 8px;
          height: 8px;
          background-color: #10b981;
          border-radius: 50%;
          animation: pulseGlow 1.8s infinite;
        }

        .notif-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background-color: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: 900;
          border-radius: 10px;
          padding: 2px 6px;
          border: 2px solid #ffffff;
        }

        @media (max-width: 900px) {
          .mobile-header { display: flex !important; }
          .left-sidebar {
            position: fixed !important;
            top: 0;
            left: ${isMobileSidebarOpen ? '0' : '-280px'} !important;
            height: 100vh !important;
            z-index: 9999 !important;
            transition: left 0.3s ease !important;
          }
          .sidebar-overlay {
            display: ${isMobileSidebarOpen ? 'block' : 'none'} !important;
          }
          .content-container {
            padding: 16px !important;
          }
          .grid-two-col {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* TOAST BANNER */}
      {toastMessage && (
        <div style={{
          ...styles.toastBanner,
          backgroundColor: toastMessage.includes('❌') ? '#991b1b' : '#0f172a'
        }}>
          <span className="live-pulse-dot"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MOBILE OVERLAY */}
      <div
        className="sidebar-overlay"
        style={styles.mobileOverlay}
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      {/* LEFT SIDEBAR */}
      <aside className="left-sidebar" style={styles.sidebar}>
        <div style={styles.brandHeader}>
          <div style={styles.brandBadge}>🌾</div>
          <div>
            <div style={styles.brandTitle}>AMAMA GATEWAY</div>
            <div style={styles.brandSub}>Supplier &amp; Export Terminal</div>
          </div>
        </div>

        <div style={styles.sidebarSectionLabel}>SUPPLIER NAVIGATION</div>

        <nav style={styles.navStack}>
          <div
            className={`nav-item ${activeTab === 'kyc' ? 'active' : ''}`}
            onClick={() => { setActiveTab('kyc'); setIsMobileSidebarOpen(false); }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>📜</span> Step 1: Accreditation
            </div>
            {isStep1Completed ? <span style={styles.navCompletedTag}>COMPLETED ✓</span> : null}
          </div>

          <div
            className={`nav-item ${activeTab === 'buyers' ? 'active' : ''} ${workflowStep < 2 ? 'disabled' : ''}`}
            onClick={() => { if (workflowStep >= 2) { setActiveTab('buyers'); setIsMobileSidebarOpen(false); } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>🏢</span> Step 2: Buyer Leads
            </div>
            {isStep2Completed ? <span style={styles.navCompletedTag}>COMPLETED ✓</span> : workflowStep < 2 ? <span>🔒</span> : null}
          </div>

          <div
            className={`nav-item ${activeTab === 'contract' ? 'active' : ''} ${workflowStep < 3 ? 'disabled' : ''}`}
            onClick={() => { if (workflowStep >= 3) { setActiveTab('contract'); setIsMobileSidebarOpen(false); } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>💬</span> Step 3: Live Buyer Chat
              {unreadCount > 0 && (
                <span style={{ backgroundColor: '#ef4444', color: '#fff', borderRadius: '10px', padding: '1px 6px', fontSize: '10px', fontWeight: '900' }}>
                  {unreadCount}
                </span>
              )}
            </div>
            {isStep3Completed ? <span style={styles.navCompletedTag}>COMPLETED ✓</span> : workflowStep < 3 ? <span>🔒</span> : null}
          </div>

          <div
            className={`nav-item ${activeTab === 'escrow' ? 'active' : ''} ${workflowStep < 4 ? 'disabled' : ''}`}
            onClick={() => { if (workflowStep >= 4) { setActiveTab('escrow'); setIsMobileSidebarOpen(false); } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>💳</span> Step 4: Live Payment
            </div>
            {isStep4Completed ? <span style={styles.navCompletedTag}>COMPLETED ✓</span> : workflowStep < 4 ? <span>🔒</span> : null}
          </div>

          <div
            className={`nav-item ${activeTab === 'live' ? 'active' : ''} ${workflowStep < 5 ? 'disabled' : ''}`}
            onClick={() => { if (workflowStep >= 5) { setActiveTab('live'); setIsMobileSidebarOpen(false); } }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>🚢</span> Step 5: Cargo Tracking
            </div>
            {isStep5Completed ? <span style={styles.navCompletedTag}>COMPLETED ✓</span> : workflowStep < 5 ? <span>🔒</span> : null}
          </div>

          <div style={{ ...styles.sidebarSectionLabel, marginTop: '20px' }}>DOCUMENT CONTROL</div>

          <div
            className={`nav-item ${activeTab === 'docs' ? 'active' : ''}`}
            onClick={() => { setActiveTab('docs'); setIsMobileSidebarOpen(false); }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>📂</span> Document Vault {uploadedDocs.length > 0 && `(${uploadedDocs.length})`}
            </div>
          </div>
        </nav>

        <div style={styles.sidebarFooterCard}>
          <div style={{ fontSize: '11px', fontWeight: '800', color: '#34d399' }}>EXPORTER STATUS</div>
          <div style={{ fontSize: '12px', fontWeight: '900', color: is100PercentCompleted ? '#4ade80' : '#ffffff', marginTop: '4px' }}>
            {is100PercentCompleted ? '🎉 100% DISPATCH COMPLETED' : `Stage ${workflowStep} / 5 Active`}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={styles.mainWrapper}>
        <header style={styles.topHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              className="mobile-header"
              style={styles.hamburgerBtn}
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              ☰
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={styles.pageTitle}>
                  {activeTab === 'kyc' && 'Step 1: Supplier Accreditation'}
                  {activeTab === 'buyers' && 'Step 2: Verified Buyer Leads'}
                  {activeTab === 'contract' && 'Step 3: Live Real-Time Negotiation'}
                  {activeTab === 'escrow' && 'Step 4: Real-Time Transaction Engine'}
                  {activeTab === 'live' && 'Step 5: Cargo Telemetry & Waybill'}
                  {activeTab === 'docs' && 'Document Vault & Required Roadmap'}
                </h1>
                {isOnboardingVerified && (
                  <span style={styles.verifiedSellerBadge} title="Accreditation documents verified by AMAMA">
                    🛡️ Verified Seller
                  </span>
                )}
              </div>
              <p style={styles.pageSubtitle}>Document-gated supplier portal showing live supplier uploads</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
            {/* NOTIFICATION BELL ICON WITH DROPDOWN */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => {
                  setShowNotificationMenu(!showNotificationMenu);
                  setUnreadCount(0);
                }}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                title="Buyer Notifications"
              >
                🔔
                {unreadCount > 0 && (
                  <span className="notif-badge">{unreadCount}</span>
                )}
              </button>

              {/* NOTIFICATIONS DROPDOWN MENU */}
              {showNotificationMenu && (
                <div style={{
                  position: 'absolute',
                  top: '46px',
                  right: '0',
                  width: '320px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
                  zIndex: 9999,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '12px 16px',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '12px', fontWeight: '900' }}>🔔 BUYER MESSAGES &amp; ALERTS</span>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>Real-Time</span>
                  </div>

                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', fontSize: '11px', color: '#64748b' }}>
                        No buyer notifications received yet.
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => handleNotificationClick(n)}
                          style={{
                            padding: '10px 14px',
                            borderBottom: '1px solid #f1f5f9',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease',
                            backgroundColor: '#ffffff'
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f8fafc'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#ffffff'}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '900', color: '#059669' }}>{n.buyerName}</span>
                            <span style={{ fontSize: '9px', color: '#94a3b8' }}>{n.time}</span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            "{n.text}"
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {is100PercentCompleted && (
              <div style={styles.completed100Badge}>
                🎉 ALL STAGES 100% COMPLETED
              </div>
            )}
            <span style={styles.stepCounterBadge}>Stage {workflowStep} / 5</span>
          </div>
        </header>

        {is100PercentCompleted && (
          <div style={styles.fullCompletionBanner}>
            <span style={{ fontSize: '18px' }}>🎉</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '900', color: '#065f46' }}>ALL STAGES 100% COMPLETED</div>
              <div style={{ fontSize: '11px', color: '#047857' }}>
                Every step from exporter accreditation to real-time transaction release has been fully executed.
              </div>
            </div>
          </div>
        )}

        {/* WORKFLOW TRACKER */}
        <div style={styles.progressTrackerBar}>
          {stepsList.map((s) => (
            <div
              key={s.num}
              style={{
                ...styles.trackerSegment,
                borderBottomColor: activeTab === s.key ? '#059669' : s.completed ? '#10b981' : '#e2e8f0'
              }}
              onClick={() => {
                if (workflowStep >= s.num) setActiveTab(s.key);
              }}
            >
              <div style={{
                ...styles.trackerCircle,
                backgroundColor: s.completed ? '#10b981' : activeTab === s.key ? '#059669' : '#cbd5e1',
                color: '#ffffff'
              }}>
                {s.completed ? '✓' : s.num}
              </div>
              <div style={styles.trackerTextGroup}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: activeTab === s.key ? '#0f172a' : '#64748b' }}>{s.label}</span>
                  {s.completed && <span style={styles.stepCompletedBadgeInline}>COMPLETED ✓</span>}
                </div>

                <span style={{ fontSize: '9px', color: s.docObj ? '#16a34a' : '#dc2626', fontWeight: '700', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.docObj ? `📄 ${s.docObj.name}` : 'Doc Required 🔒'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* VIEW CONTAINER */}
        <div className="content-container" style={styles.contentContainer}>

          {/* VIEW 1: KYC */}
          {activeTab === 'kyc' && (
            <div className="grid-two-col" style={styles.gridTwoCol}>
              <div style={styles.cardBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={styles.cardHeading}>📋 SUPPLIER DOCUMENTS LIST</h3>
                    <p style={styles.cardSub}>Synchronize origin certificates and export licenses to unlock buyer leads.</p>
                  </div>
                  {isStep1Completed && <span style={styles.cardCompletedBadge}>STEP 1 COMPLETED ✓</span>}
                </div>

                {/* Rejected-document alert — surfaces admin's rejection reason so the
                    supplier knows exactly what to fix. Uploading a replacement is
                    already possible below (the file input is never disabled after a
                    first submission), this just makes sure they actually see why it
                    matters. */}
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
                                    <b>{d.name || 'Document'}</b>
                                    {d.adminRemarks ? `: ${d.adminRemarks}` : ' — no reason provided'}
                                </div>
                            ))}
                        <div style={{ fontSize: '11px', color: '#b91c1c', marginTop: '6px' }}>
                            Attach a corrected file below to resubmit.
                        </div>
                    </div>
                )}

                <div style={styles.syncCard}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '900', color: '#059669' }}>🔄 EXPORTER COMPLIANCE DOCUMENTS</span>
                    <span style={isOnboardingVerified ? styles.badgeSuccess : styles.badgePending}>
                      {isOnboardingVerified ? 'ACCREDITED ✓' : 'VERIFICATION REQUIRED'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {onboardingDocs.length === 0 ? (
                      <div style={{ fontSize: '10.5px', color: '#64748b', fontStyle: 'italic', padding: '6px 0' }}>
                        No compliance documents uploaded yet. Please upload your Agricultural Export License below to proceed.
                      </div>
                    ) : (
                      onboardingDocs.map(doc => (
                        <div key={doc.id} style={styles.docRowItem}>
                          <span style={{ fontWeight: '800', color: '#0f172a' }}>📄 {doc.name || doc.label}</span>
                          <span style={{ fontWeight: '800', color: (doc.status || '').toUpperCase() !== 'REJECTED' ? '#16a34a' : '#d97706' }}>
                            {doc.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
                  <div>
                    <label style={styles.inputLabel}>EXPORTER ORGANISATION NAME</label>
                    <input type="text" value={kycData.companyName} onChange={e => setKycData({...kycData, companyName: e.target.value})} style={styles.inputField} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={styles.inputLabel}>EXPORT / AGRI LICENSE ID</label>
                      <input type="text" placeholder="Enter Registration No." value={kycData.taxId} onChange={e => setKycData({...kycData, taxId: e.target.value})} style={styles.inputField} />
                    </div>
                    <div>
                      <label style={styles.inputLabel}>COUNTRY OF ORIGIN</label>
                      <input type="text" value={kycData.country} onChange={e => setKycData({...kycData, country: e.target.value})} style={styles.inputField} />
                    </div>
                  </div>

                  {/* One upload slot per REAL required document (inferred Producer/Trader
                      schema) instead of a single generic "Step 1 File" blob, so each
                      requirement — especially a rejected one — can be individually
                      identified and replaced. */}
                  {requiredDocs.map((rd) => {
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
                                  <div style={styles.badgeSuccess}>✓ Verified{slot.doc?.name ? `: ${slot.doc.name}` : ''}</div>
                              ) : slot.state === 'rejected' ? (
                                  <div style={{ fontSize: '10px', fontWeight: '800', color: '#991b1b', backgroundColor: '#fee2e2', padding: '3px 8px', borderRadius: '4px' }}>
                                      ✕ Rejected{slot.reason ? `: ${slot.reason}` : ''} — please re-upload
                                  </div>
                              ) : slot.state === 'pending' ? (
                                  <div style={styles.badgePending}>⏳ Pending Review{slot.doc?.name ? `: ${slot.doc.name}` : ''}</div>
                              ) : (
                                  <div style={styles.badgePending}>⚠️ Not yet uploaded</div>
                              )}
                          </div>
                      );
                  })}

                  <button
                    className="action-btn"
                    style={{
                      ...styles.actionBtnFull,
                      backgroundColor: isStep1Completed ? '#15803d' : '#059669'
                    }}
                    disabled={!stepDocuments.step1 || isUploading}
                    onClick={handleVerifyKYC}
                  >
                    {isUploading ? 'Uploading to Server...' : isStep1Completed ? 'Step 1 Completed ✓ (Re-verify)' : 'Complete Step 1 & Unlock Buyer Leads 🚀'}
                  </button>
                </div>
              </div>

              <SupplierDocumentRoadmapPanel stepDocuments={stepDocuments} currentStepNum={currentStepNum} isDirectoryUnlocked={isDirectoryUnlocked} />
            </div>
          )}

          {/* VIEW 2: BUYERS */}
          {activeTab === 'buyers' && (
            <div className="grid-two-col" style={styles.gridTwoCol}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={styles.bannerBlue}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '900', color: '#1e40af' }}>🏢 BUYERS DIRECTORY</div>
                    <div style={{ fontSize: '10.5px', color: '#3b82f6' }}>Direct access to vetted commodity buyers with verified escrow capacity.</div>
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
                    <option value="ALL">🥥 All Perishable Goods Categories</option>
                    {perishableGoodsOptions.map(commodity => (
                      <option key={commodity} value={commodity}>{commodity}</option>
                    ))}
                  </select>
                </div>

                {!isDirectoryUnlocked ? (
                  <div style={styles.directoryPaywallBox}>
                    <span style={{ fontSize: '30px' }}>🔒</span>
                    <div style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a', marginTop: '8px' }}>
                      Unlock the Verified Buyer Directory
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', maxWidth: '360px' }}>
                      Access to AMAMA's escrow-ready buyer leads for{' '}
                      {selectedCommodityFilter === 'ALL' ? 'every category' : `"${selectedCommodityFilter}"`} requires a one-time directory unlock fee.
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#059669', marginTop: '10px' }}>
                      $5,000 USD
                    </div>
                    <button
                      className="action-btn"
                      style={{ ...styles.actionBtnFull, width: '280px', marginTop: '12px', backgroundColor: directoryUnlockStatus === 'processing' ? '#94a3b8' : '#059669' }}
                      disabled={directoryUnlockStatus === 'processing'}
                      onClick={handleUnlockDirectory}
                    >
                      {directoryUnlockStatus === 'processing' ? 'Processing Payment...' : 'Pay $5,000 & Unlock Buyer Leads 🔓'}
                    </button>
                  </div>
                ) : isLoadingBuyers ? (
                  <div style={styles.emptyVaultBox}>
                    <span style={{ fontSize: '24px' }}>⏳</span>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>Loading Verified Buyers…</div>
                  </div>
                ) : buyersLoadError ? (
                  <div style={{ ...styles.emptyVaultBox, backgroundColor: '#fef2f2', border: '1px dashed #fca5a5' }}>
                    <span style={{ fontSize: '24px' }}>⚠️</span>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#991b1b', marginTop: '6px' }}>{buyersLoadError}</div>
                  </div>
                ) : buyersList.length === 0 ? (
                  <div style={styles.emptyVaultBox}>
                    <span style={{ fontSize: '24px' }}>🥥</span>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>No Buyers Onboarded Yet</div>
                    <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>Once buyers complete onboarding, they'll appear here automatically.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {(selectedCommodityFilter === 'ALL' ? buyersList : buyersList.filter(b => b.commodity === selectedCommodityFilter)).length === 0 && (
                      <div style={styles.emptyVaultBox}>
                        <span style={{ fontSize: '24px' }}>🥥</span>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>No Buyers Found for This Category</div>
                        <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>Try selecting "All Perishable Goods Categories" to see every verified buyer.</div>
                      </div>
                    )}
                    {(selectedCommodityFilter === 'ALL' ? buyersList : buyersList.filter(b => b.commodity === selectedCommodityFilter)).map((buyer, idx) => (
                      <div key={buyer.id} style={styles.sellerCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={styles.avatarBox}>{buyer.avatar}</div>
                            <div>
                              <div style={{ fontSize: '10px', fontWeight: '900', color: '#059669' }}>VERIFIED BUYER #{idx + 1}</div>
                              <div style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a' }}>{buyer.name}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>📍 {buyer.location} • ⚓ Destination: {buyer.destPort}</div>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '16px', fontWeight: '900', color: '#059669' }}>${buyer.offeredPrice} / MT</div>
                            <span style={styles.sellerBadge}>{buyer.badge}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                          <span style={{ fontSize: '12px', fontWeight: '800', color: '#334155' }}>📦 Request: {buyer.commodity} ({buyer.requiredQty} MT)</span>
                          <button
                            className="action-btn"
                            style={{
                              ...styles.actionBtnCompact,
                              backgroundColor: selectedBuyer?.id === buyer.id && isStep2Completed ? '#15803d' : '#059669'
                            }}
                            disabled={isUploading}
                            onClick={() => handleSelectBuyer(buyer)}
                          >
                            {selectedBuyer?.id === buyer.id && isStep2Completed ? 'Step 2 Completed ✓ (Selected)' : 'Select Buyer & Start Live Chat 🚀'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <SupplierDocumentRoadmapPanel stepDocuments={stepDocuments} currentStepNum={currentStepNum} isDirectoryUnlocked={isDirectoryUnlocked} />
            </div>
          )}

          {/* VIEW 3: CONTRACT & REAL-TIME CHAT */}
          {activeTab === 'contract' && (
            <div className="grid-two-col" style={styles.gridTwoCol}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={styles.cardBox}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '10px', borderBottom: '1px solid #e2e8f0', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="live-pulse-dot"></span>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '900', color: '#0f172a' }}>{selectedBuyer?.name}</div>
                        <div style={{ fontSize: '9.5px', color: '#059669', fontWeight: '800' }}>● ONLINE • DIRECT WEBSOCKET SESSION</div>
                      </div>
                    </div>
                    <span style={styles.sellerBadge}>{selectedBuyer?.location}</span>
                  </div>

                  <div style={styles.chatContainer}>
                    {chatMessages.map((m) => (
                      <div key={m.id} style={{
                        ...styles.chatBubble,
                        alignSelf: m.isSystem ? 'center' : (m.isUser || !m.isBuyer) ? 'flex-end' : 'flex-start',
                        backgroundColor: m.isSystem ? '#f1f5f9' : (m.isUser || !m.isBuyer) ? '#059669' : '#ffffff',
                        color: m.isSystem ? '#475569' : (m.isUser || !m.isBuyer) ? '#ffffff' : '#0f172a',
                        border: m.isSystem ? '1px dashed #cbd5e1' : '1px solid #e2e8f0',
                        maxWidth: m.isSystem ? '95%' : '80%'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '2px' }}>
                          <span style={{ fontSize: '9px', fontWeight: '900', opacity: 0.85 }}>{m.sender}</span>
                          <span style={{ fontSize: '8px', opacity: 0.7 }}>{m.time || m.timestamp}</span>
                        </div>
                        <div style={{ fontSize: '11.5px', lineHeight: '1.4' }}>{m.text}</div>
                      </div>
                    ))}

                    {isBuyerTyping && (
                      <div style={{ ...styles.chatBubble, alignSelf: 'flex-start', backgroundColor: '#ffffff', color: '#64748b' }}>
                        <div style={{ fontSize: '9px', fontWeight: '800', marginBottom: '2px' }}>{selectedBuyer?.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 0' }}>
                          <span style={{ fontSize: '10px', fontStyle: 'italic' }}>typing response</span>
                          <span className="typing-dot" style={{ animationDelay: '0s' }}></span>
                          <span className="typing-dot" style={{ animationDelay: '0.2s' }}></span>
                          <span className="typing-dot" style={{ animationDelay: '0.4s' }}></span>
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder={isDealClosed ? "Contract locked - conversation closed" : "Message buyer in real-time..."}
                      style={styles.inputField}
                      disabled={isDealClosed}
                    />
                    <button
                      type="submit"
                      className="action-btn"
                      style={styles.actionBtnCompact}
                      disabled={isDealClosed || !newMessage.trim()}
                    >
                      Send 💬
                    </button>
                  </form>
                </div>

                <div style={styles.cardBox}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h3 style={styles.cardHeading}>📝 Bilateral Contract Terms</h3>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>Target Commodity: <strong>{selectedBuyer?.commodity}</strong></div>
                    </div>
                    {isStep3Completed && <span style={styles.cardCompletedBadge}>STEP 3 COMPLETED ✓</span>}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={styles.inputLabel}>ORDER QUANTITY (MT)</label>
                        <input type="number" value={orderQuantity} onChange={e => setOrderQuantity(Number(e.target.value))} style={styles.inputField} disabled={isDealClosed} />
                      </div>
                      <div>
                        <label style={styles.inputLabel}>PRICE PER MT ($)</label>
                        <input type="number" value={negotiatedPrice} onChange={e => setNegotiatedPrice(Number(e.target.value))} style={styles.inputField} disabled={isDealClosed} />
                      </div>
                    </div>

                    <div style={styles.summaryBox}>
                      <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '800' }}>TOTAL CONTRACT VALUE</div>
                      <div style={{ fontSize: '20px', fontWeight: '900', color: '#059669' }}>${totalPrice.toLocaleString()} USD</div>
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
                          className="action-btn"
                          style={{ ...styles.actionBtnCompact, alignSelf: 'flex-start' }}
                          onClick={handleGenerateContract}
                          disabled={isDealClosed}
                        >
                          Generate AMAMA Standard Contract 📄
                        </button>
                      )}
                    </div>

                    <button
                      className="action-btn"
                      style={{
                        ...styles.actionBtnFull,
                        backgroundColor: isStep3Completed ? '#15803d' : '#059669'
                      }}
                      disabled={!stepDocuments.step3 || isUploading}
                      onClick={handleCloseDeal}
                    >
                      {isUploading ? 'Uploading Contract...' : !stepDocuments.step3 ? '🔒 Generate Contract First' : isStep3Completed ? 'Step 3 Completed ✓ (Proceed to Real-time Payment)' : 'Sign Contract & Move to Step 4 🤝'}
                    </button>
                  </div>
                </div>

              </div>

              <SupplierDocumentRoadmapPanel stepDocuments={stepDocuments} currentStepNum={currentStepNum} isDirectoryUnlocked={isDirectoryUnlocked} />
            </div>
          )}

          {/* VIEW 4: ESCROW PAYMENT */}
          {activeTab === 'escrow' && (
            <div className="grid-two-col" style={styles.gridTwoCol}>
              <div style={styles.cardBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <h3 style={styles.cardHeading}>💳 Step 4: Real-Time Payment Execution</h3>
                    <p style={styles.cardSub}>Execute real-time trade settlement for advance deposit payout.</p>
                  </div>
                  {isStep4Completed && <span style={styles.cardCompletedBadge}>STEP 4 COMPLETED ✓</span>}
                </div>

                <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#ecfdf5', borderRadius: '8px', margin: '14px 0', border: '1px solid #a7f3d0' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '800' }}>INITIAL ESCROW PAYOUT (25%)</div>
                  <div style={{ fontSize: '26px', fontWeight: '900', color: '#059669' }}>${(totalPrice * 0.25).toLocaleString()} USD</div>
                  <div style={{ fontSize: '10px', color: '#047857', marginTop: '4px' }}>Beneficiary: {kycData.companyName}</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={styles.docGateBox}>
                    <div style={{ ...styles.docGateHeader, color: '#047857' }}>🔒 MANDATORY STEP 4 FILE: Bank Wire Authorization Advice</div>
                    <input type="file" disabled={isUploading} onChange={e => handleStepDocAttach('step4', e.target.files[0])} style={styles.fileInput} />
                    {stepDocuments.step4 ? (
                      <div style={styles.badgeSuccess}>✓ Attached File: {stepDocuments.step4.name}</div>
                    ) : (
                      <div style={styles.badgePending}>⚠️ Upload bank payout advice to unlock verification button.</div>
                    )}
                  </div>

                  <button
                    className="action-btn"
                    style={{
                      ...styles.actionBtnFull,
                      backgroundColor: isStep4Completed ? '#15803d' : '#059669'
                    }}
                    disabled={!stepDocuments.step4 || isUploading}
                    onClick={handleOpenPaymentModal}
                  >
                    {isUploading ? 'Uploading Bank Advice...' : !stepDocuments.step4 ? '🔒 Upload Payout Form First' : isStep4Completed ? 'Step 4 Completed ✓ (View Receipt)' : `Launch Real-Time Payment Gateway ⚡`}
                  </button>
                </div>
              </div>

              <SupplierDocumentRoadmapPanel stepDocuments={stepDocuments} currentStepNum={currentStepNum} isDirectoryUnlocked={isDirectoryUnlocked} />
            </div>
          )}

          {/* VIEW 5: DISPATCH */}
          {activeTab === 'live' && (
            <div className="grid-two-col" style={styles.gridTwoCol}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={styles.liveBanner}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '30px' }}>🚢</span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '10px', fontWeight: '900', color: '#166534' }}>● SATELLITE CARGO TELEMETRY ACTIVE</span>
                          <span style={styles.cardCompletedBadge}>STEP 5 COMPLETED ✓</span>
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: '900', color: '#064e3b' }}>Container #{liveTradeData.containerId}</div>
                        <div style={{ fontSize: '11px', color: '#15803d' }}>Vessel: {liveTradeData.vesselName} | Buyer: {selectedBuyer?.name}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '10px', color: '#15803d', fontWeight: '800' }}>TOTAL CONTRACT VALUE</div>
                      <div style={{ fontSize: '20px', fontWeight: '900', color: '#059669' }}>${totalPrice.toLocaleString()} USD</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '800', color: '#166534', marginBottom: '4px' }}>
                      <span>📍 Origin Port: {selectedBuyer?.originPort}</span>
                      <span>Progress: {liveTradeData.routeProgress}%</span>
                      <span>⚓ Dest Port: {selectedBuyer?.destPort}</span>
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
                      <div style={styles.sensorLabel}>CARGO HOLD TEMP</div>
                      <div style={styles.sensorVal}>{liveTradeData.tempC}</div>
                    </div>
                  </div>
                  <div style={styles.sensorTile}>
                    <span>💧</span>
                    <div>
                      <div style={styles.sensorLabel}>GRAIN MOISTURE</div>
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
                  <h3 style={styles.cardHeading}>💳 Escrow Payout Tranches</h3>
                  <p style={styles.cardSub}>Tranches release automatically into supplier balance as proof documents are attached.</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                    {escrowTranches.map(t => {
                      const isReleased = t.status === 'RELEASED';

                      return (
                        <div
                          key={t.id}
                          style={{
                            ...styles.trancheTile,
                            borderColor: isReleased ? '#10b981' : '#cbd5e1',
                            backgroundColor: isReleased ? '#f0fdf4' : '#ffffff'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>{t.name}</div>
                              <div style={{ fontSize: '10px', color: '#64748b' }}>Trigger: {t.triggerLabel}</div>
                              <div style={{ fontSize: '14px', fontWeight: '900', color: '#059669', marginTop: '2px' }}>
                                ${(totalPrice * (t.percent / 100)).toLocaleString()} USD ({t.percent}%)
                              </div>
                            </div>

                            <div>
                              {isReleased ? (
                                <span style={styles.badgeSuccess}>RELEASED TO SUPPLIER ✓</span>
                              ) : (
                                <span style={styles.badgePending}>🔒 Awaiting Document Upload</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={styles.adminSimBox}>
                    <div style={{ fontSize: '10px', fontWeight: '900', color: '#1e3a8a', marginBottom: '6px' }}>
                      🛠️ STEP 5 SUPPLIER DOCUMENT UPLOADS (RELEASE REMAINING TRANCHES)
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <label style={{ ...styles.demoSimBtn, backgroundColor: stepDocuments.step5_qc ? '#15803d' : '#2563eb', cursor: 'pointer', display: 'inline-block' }}>
                        {stepDocuments.step5_qc ? `✓ Attached: ${stepDocuments.step5_qc.name}` : '+ Attach SGS QC Report'}
                        <input
                          type="file"
                          disabled={isUploading}
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleStepDocAttach('step5_qc', e.target.files[0]);
                              setEscrowTranches(prev => prev.map(t => t.id === 2 ? { ...t, status: 'RELEASED' } : t));
                              triggerToast(`📄 Attached "${e.target.files[0].name}"! Tranche 2 Released.`);
                            }
                          }}
                        />
                      </label>

                      <label style={{ ...styles.demoSimBtn, backgroundColor: stepDocuments.step5_bl ? '#15803d' : '#2563eb', cursor: 'pointer', display: 'inline-block' }}>
                        {stepDocuments.step5_bl ? `✓ Attached: ${stepDocuments.step5_bl.name}` : '+ Attach Original BL'}
                        <input
                          type="file"
                          disabled={isUploading}
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleStepDocAttach('step5_bl', e.target.files[0]);
                              setEscrowTranches(prev => prev.map(t => t.id === 3 ? { ...t, status: 'RELEASED' } : t));
                              triggerToast(`📄 Attached "${e.target.files[0].name}"! Final Tranche Released.`);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div style={styles.cardBox}>
                  <h3 style={styles.cardHeading}>📜 Supplier Real-Time Audit Feed</h3>
                  <div style={styles.auditLogBox}>
                    {liveLogs.length === 0 ? (
                      <div style={{ fontSize: '10.5px', color: '#64748b', padding: '6px' }}>Audit log entries will record here as actions are taken.</div>
                    ) : (
                      liveLogs.map(l => (
                        <div key={l.id} style={styles.logTile}>
                          <div style={{ fontSize: '9px', fontWeight: '800', color: '#059669' }}>{l.time} • [{l.type}]</div>
                          <div style={{ fontSize: '11px', color: '#334155' }}>{l.text}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              <SupplierDocumentRoadmapPanel stepDocuments={stepDocuments} currentStepNum={currentStepNum} isDirectoryUnlocked={isDirectoryUnlocked} />
            </div>
          )}

          {/* VIEW 6: DOCUMENT VAULT */}
          {activeTab === 'docs' && (
            <div className="grid-two-col" style={styles.gridTwoCol}>
              <div style={styles.cardBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                  <div>
                    <h3 style={styles.cardHeading}>📂 Exporter Document Vault</h3>
                    <p style={styles.cardSub}>Repository showing exact uploaded supplier file names.</p>
                  </div>
                  <button className="action-btn" style={styles.actionBtnCompact} onClick={() => setShowUploadModal(true)}>+ Upload Export Document</button>
                </div>

                {isLoadingDocs ? (
                  <div style={{ fontSize: '11px', color: '#64748b', padding: '12px 0' }}>Fetching documents from server...</div>
                ) : (
                  <div>
                    {uploadedDocs.length === 0 ? (
                      <div style={styles.emptyVaultBox}>
                        <span style={{ fontSize: '28px' }}>📂</span>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', marginTop: '6px' }}>No Uploaded Documents Found</div>
                        <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>
                          Upload export licenses or attachments during workflow steps to populate your vault.
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                        {uploadedDocs.map(doc => (
                          <div key={doc.id} style={styles.vaultDocTile}>
                            <div style={{ fontSize: '20px' }}>📄</div>
                            <div style={{ overflow: 'hidden' }}>
                              <div style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a', wordBreak: 'break-all' }}>
                                {doc.name}
                              </div>
                              <div style={{ fontSize: '9.5px', color: '#059669', marginTop: '2px' }}>
                                {doc.type} • {doc.time}
                              </div>
                              {doc.status && (
                                <span style={{
                                  fontSize: '8px',
                                  fontWeight: '900',
                                  color: doc.status === 'APPROVED' || doc.status === 'VERIFIED' ? '#15803d' : '#b91c1c',
                                  backgroundColor: doc.status === 'APPROVED' || doc.status === 'VERIFIED' ? '#dcfce7' : '#fee2e2',
                                  padding: '1px 4px',
                                  borderRadius: '3px',
                                  display: 'inline-block',
                                  marginTop: '4px'
                                }}>
                                  {doc.status}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <SupplierDocumentRoadmapPanel stepDocuments={stepDocuments} currentStepNum={currentStepNum} isDirectoryUnlocked={isDirectoryUnlocked} />
            </div>
          )}

        </div>
      </main>

      {/* TRANSACTION MODAL */}
      {paymentStatus !== 'idle' && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, width: '420px' }}>
            <div style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="live-pulse-dot"></span>
                <span style={{ fontWeight: '900', fontSize: '13px' }}>AMAMA REAL-TIME PAYMENTS</span>
              </div>
              {paymentStatus === 'modal_open' && (
                <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => setPaymentStatus('idle')}>✕</button>
              )}
            </div>

            {paymentStatus === 'modal_open' && (
              <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '800' }}>TRANSACTION AMOUNT</div>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#059669' }}>${(totalPrice * 0.25).toLocaleString()} USD</div>
                  <div style={{ fontSize: '10.5px', color: '#334155', marginTop: '2px' }}>25% Escrow Advance • Buyer: {selectedBuyer?.name}</div>
                </div>

                <div>
                  <label style={styles.inputLabel}>SETTLEMENT METHOD</label>
                  <div style={styles.fixedSettlementBox}>
                    🏦 SWIFT Real-Time Interbank Wire
                  </div>
                </div>

                <div style={{ fontSize: '10.5px', color: '#64748b', backgroundColor: '#ecfdf5', padding: '8px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                  🔒 Verified by Attached Wire Advice: <strong>{stepDocuments.step4?.name}</strong>
                </div>

                <button className="action-btn" style={styles.actionBtnFull} onClick={handleProcessRealTimeTransaction}>
                  Execute Real-Time Transaction ⚡
                </button>
              </div>
            )}

            {(paymentStatus === 'processing' || paymentStatus === 'verifying_bank') && (
              <div style={{ padding: '36px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                <div className="spinner-icon" style={{ width: '36px', height: '36px', borderWidth: '3px', borderColor: '#059669', borderTopColor: 'transparent' }}></div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a' }}>
                    {paymentStatus === 'processing' ? 'Connecting to Banking Network...' : 'Verifying SWIFT Settlement & Escrow Reserve...'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Please do not close this window. Executing real-time ledger entries.</div>
                </div>
              </div>
            )}

            {paymentStatus === 'success' && activeTransaction && (
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '32px' }}>✅</span>
                  <div style={{ fontSize: '16px', fontWeight: '900', color: '#15803d', marginTop: '4px' }}>Transaction Approved!</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Real-time settlement finalized on the AMAMA Ledger</div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Transaction Ref:</span>
                    <strong style={{ color: '#0f172a' }}>{activeTransaction.id}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Escrow Reference:</span>
                    <strong style={{ color: '#059669' }}>{activeTransaction.escrowRef}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Amount Settled:</span>
                    <strong style={{ color: '#0f172a' }}>${activeTransaction.amount.toLocaleString()} USD</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Payment Mode:</span>
                    <strong style={{ color: '#0f172a' }}>{activeTransaction.paymentMethod}</strong>
                  </div>
                </div>

                <button className="action-btn" style={styles.actionBtnFull} onClick={handleFinishTransactionAndMove}>
                  Proceed to Live Cargo Dispatch 🚀
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DOCUMENT UPLOAD MODAL */}
      {showUploadModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '12px 16px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: '800', fontSize: '12px' }}>📎 Upload Export Document</span>
              <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => setShowUploadModal(false)}>✕</button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!selectedFile) return;
              handleGenericFileUpload(selectedFile);
              setSelectedFile(null);
              setShowUploadModal(false);
            }} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={styles.inputLabel}>DOCUMENT DESCRIPTION / LABEL</label>
                <input type="text" placeholder="e.g. Origin Storage Certificate" value={extraDocName} onChange={e => setExtraDocName(e.target.value)} style={styles.inputField} />
              </div>
              <div>
                <label style={styles.inputLabel}>SELECT FILE</label>
                <input type="file" onChange={e => setSelectedFile(e.target.files[0])} style={styles.fileInput} required />
              </div>
              <button type="submit" disabled={isUploading} className="action-btn" style={styles.actionBtnFull}>
                {isUploading ? 'Uploading File...' : 'Upload File 🚀'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// --- STYLES OBJECT ---
const styles = {
  appShell: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    color: '#0f172a',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  toastBanner: {
    position: 'fixed',
    top: '16px',
    right: '20px',
    color: '#ffffff',
    padding: '10px 18px',
    borderRadius: '30px',
    fontSize: '12px',
    fontWeight: '800',
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'
  },
  mobileOverlay: {
    display: 'none',
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    zIndex: 9998
  },
  sidebar: {
    width: '260px',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    boxSizing: 'border-box',
    flexShrink: 0
  },
  brandHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    paddingBottom: '16px',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  },
  brandBadge: {
    width: '32px',
    height: '32px',
    backgroundColor: '#059669',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  brandTitle: { fontSize: '12px', fontWeight: '900', letterSpacing: '0.5px' },
  brandSub: { fontSize: '9.5px', color: '#34d399' },
  sidebarSectionLabel: { fontSize: '9px', fontWeight: '900', color: '#64748b', letterSpacing: '0.8px', margin: '16px 0 8px 4px' },
  navStack: { display: 'flex', flexDirection: 'column', gap: '4px' },
  navCompletedTag: { fontSize: '8.5px', fontWeight: '900', color: '#4ade80', backgroundColor: 'rgba(74, 222, 128, 0.15)', padding: '2px 6px', borderRadius: '4px' },
  sidebarFooterCard: {
    marginTop: 'auto',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    padding: '10px'
  },
  mainWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0
  },
  topHeader: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '14px 24px',
    display: 'flex',
    justify: 'space-between',
    alignItems: 'center'
  },
  hamburgerBtn: {
    display: 'none',
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: 0
  },
  pageTitle: { fontSize: '16px', fontWeight: '900', margin: 0, color: '#0f172a' },
  pageSubtitle: { fontSize: '11px', color: '#64748b', margin: '2px 0 0 0' },
  verifiedSellerBadge: {
    fontSize: '10px',
    fontWeight: '900',
    color: '#7c5a00',
    background: 'linear-gradient(135deg, #fde68a, #f5c542)',
    border: '1px solid #ca9a04',
    padding: '3px 10px',
    borderRadius: '12px',
    whiteSpace: 'nowrap'
  },
  stepCounterBadge: {
    fontSize: '11px',
    fontWeight: '800',
    backgroundColor: '#f1f5f9',
    color: '#334155',
    padding: '4px 10px',
    borderRadius: '12px'
  },
  completed100Badge: {
    backgroundColor: '#dcfce7',
    border: '1px solid #86efac',
    color: '#15803d',
    fontSize: '10px',
    fontWeight: '900',
    padding: '4px 10px',
    borderRadius: '12px'
  },
  fullCompletionBanner: {
    backgroundColor: '#ecfdf5',
    borderBottom: '1px solid #a7f3d0',
    padding: '10px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  progressTrackerBar: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '0 24px',
    display: 'flex',
    overflowX: 'auto'
  },
  trackerSegment: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderBottom: '3px solid transparent',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  },
  trackerCircle: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: '900'
  },
  trackerTextGroup: { display: 'flex', flexDirection: 'column' },
  stepCompletedBadgeInline: { fontSize: '8px', fontWeight: '900', color: '#15803d', backgroundColor: '#dcfce7', padding: '1px 5px', borderRadius: '3px' },
  contentContainer: { padding: '24px', maxWidth: '1200px', width: '100%', boxSizing: 'border-box' },
  gridTwoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' },
  cardBox: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    border: '1px solid #e2e8f0',
    padding: '18px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
  },
  cardHeading: { fontSize: '15px', fontWeight: '900', margin: '0 0 4px 0', color: '#0f172a' },
  cardSub: { fontSize: '11px', color: '#64748b', margin: '0 0 12px 0' },
  cardCompletedBadge: { fontSize: '9.5px', fontWeight: '900', color: '#15803d', backgroundColor: '#dcfce7', border: '1px solid #86efac', padding: '3px 8px', borderRadius: '6px' },
  syncCard: { backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '12px', borderRadius: '8px', marginBottom: '12px' },
  badgeSuccess: { fontSize: '10px', fontWeight: '800', color: '#15803d', backgroundColor: '#dcfce7', padding: '3px 8px', borderRadius: '4px' },
  badgePending: { fontSize: '10px', fontWeight: '800', color: '#b91c1c', backgroundColor: '#fee2e2', padding: '3px 8px', borderRadius: '4px' },
  badgeInactive: { fontSize: '10px', fontWeight: '800', color: '#475569', backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '4px' },
  docRowItem: { display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', padding: '4px 0', borderBottom: '1px solid #f1f5f9' },
  inputLabel: { fontSize: '9px', fontWeight: '800', color: '#64748b', marginBottom: '3px', display: 'block' },
  inputField: { width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' },
  fileInput: { width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', backgroundColor: '#ffffff' },
  docGateBox: { backgroundColor: '#f8fafc', border: '1.5px dashed #059669', padding: '10px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px' },
  docGateHeader: { fontSize: '10px', fontWeight: '900', color: '#059669' },
  actionBtnFull: { width: '100%', backgroundColor: '#059669', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '6px', fontSize: '12px', fontWeight: '900' },
  actionBtnCompact: { backgroundColor: '#059669', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' },
  roadmapTile: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 10px', borderRadius: '6px' },
  bannerBlue: { backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px 16px', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  directoryPaywallBox: { backgroundColor: '#ffffff', border: '1.5px dashed #059669', borderRadius: '10px', padding: '28px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
  sellerCard: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' },
  avatarBox: { fontSize: '24px', width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  sellerBadge: { fontSize: '9px', fontWeight: '900', color: '#059669', backgroundColor: '#d1fae5', padding: '3px 8px', borderRadius: '8px' },
  summaryBox: { padding: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px' },
  chatContainer: { height: '220px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' },
  chatBubble: { padding: '8px 12px', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.03)' },
  downloadLink: { fontSize: '10px', fontWeight: '900', color: '#059669', textDecoration: 'none', border: '1px solid #a7f3d0', backgroundColor: '#ecfdf5', padding: '4px 10px', borderRadius: '6px' },
  fixedSettlementBox: { padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', backgroundColor: '#f8fafc', fontWeight: '800', color: '#0f172a' },
  liveBanner: { backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderLeft: '6px solid #10b981', borderRadius: '10px', padding: '16px' },
  progressBarBg: { width: '100%', height: '8px', backgroundColor: '#dcfce7', borderRadius: '4px', overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#10b981', transition: 'width 0.5s ease' },
  sensorGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' },
  sensorTile: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' },
  sensorLabel: { fontSize: '9px', fontWeight: '800', color: '#64748b' },
  sensorVal: { fontSize: '12px', fontWeight: '900', color: '#0f172a' },
  trancheTile: { border: '1px solid', padding: '12px', borderRadius: '8px', backgroundColor: '#ffffff' },
  adminSimBox: { marginTop: '16px', padding: '12px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' },
  demoSimBtn: { border: 'none', color: '#ffffff', padding: '6px 12px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', cursor: 'pointer' },
  auditLogBox: { height: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', backgroundColor: '#f8fafc', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0' },
  logTile: { backgroundColor: '#ffffff', padding: '6px', borderRadius: '4px', borderLeft: '3px solid #059669' },
  vaultDocTile: { display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '8px', backgroundColor: '#f8fafc' },
  emptyVaultBox: { padding: '30px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(3px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  modalCard: { backgroundColor: '#ffffff', borderRadius: '10px', width: '360px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }
};