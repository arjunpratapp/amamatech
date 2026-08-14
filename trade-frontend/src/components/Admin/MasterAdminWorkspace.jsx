import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import {
    Bell, CheckCircle, FileText, Search, ShieldAlert,
    ShoppingCart, Users, Building2, Wallet, X, Mail, Check,
    ChevronRight, ChevronDown, TrendingUp, DollarSign, LayoutDashboard,
    CreditCard, ArrowUpRight, ArrowDownRight, Truck, PackageCheck, Clock,
    ArrowRight, AlertTriangle, UserCheck, Eye
} from 'lucide-react';

// ============================================================================
// 1. FREIGHT CONSTANTS & INITIAL STATE DATA (RETAINED FOR OTHER SECTIONS)
// ============================================================================

const FREIGHT_TABS = [
    "Ocean Freight", 
    "Air Freight", 
    "Trucking", 
    "Booking Management", 
    "Buyer's Consolidation"
];

// Master required documents checklist used for auto-verifying present/missing docs
const MASTER_REQUIRED_DOCUMENTS = [
    "Business License / KYB Form",
    "Tax Certificate / TIN",
    "Proof of Business Address",
    "Government ID / Passport",
    "Bank Account Statement",
    "Export / Quality License"
];

// Mirrors OnboardingPortal.jsx's MOCK_REQUIREMENTS — the actual document
// fields collected per role/seller-type during onboarding. Used to compute
// genuinely missing documents per entity instead of a static placeholder
// list, and to decide when an entity is truly "Complete" (every REQUIRED
// document present AND approved, not just every document that happens to
// have been uploaded).
const REQUIRED_DOCS_BY_ROLE = {
    BUYER: [
        { id: 'trade_licence', label: 'Corporate Trade Licence' },
        { id: 'vat_trn', label: 'VAT / Tax Registration Certificate' },
        { id: 'customs_code', label: 'Import Customs Code / Port Clearance' },
        { id: 'food_control', label: 'ZAD / Food Control Authority Registration' },
        { id: 'auth_signatory_id', label: 'Authorised Signatory Passport / ID' }
    ],
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
// supplier used, so infer it from which document field IDs actually showed
// up on their uploads — each schema uses a disjoint set of field IDs.
const inferRequiredDocsList = (userRole, docFieldIds) => {
    const role = (userRole || '').toUpperCase();
    if (role === 'BUYER') return REQUIRED_DOCS_BY_ROLE.BUYER;

    const producerHits = REQUIRED_DOCS_BY_ROLE.PRODUCER.filter(r => docFieldIds.includes(r.id)).length;
    const traderHits = REQUIRED_DOCS_BY_ROLE.TRADER.filter(r => docFieldIds.includes(r.id)).length;

    if (producerHits === 0 && traderHits === 0) return null; // unknown schema (e.g. test/garbage data)
    return producerHits >= traderHits ? REQUIRED_DOCS_BY_ROLE.PRODUCER : REQUIRED_DOCS_BY_ROLE.TRADER;
};

const INITIAL_QUERIES = [];

const INITIAL_ORDERS = [
    {
        id: "ORD-5510",
        buyer: "Northfield Grain Co.",
        seller: "Prairie Co-op",
        product: "Wheat, 40t",
        value: "$145,000",
        status: "Completed",
        mode: "Ocean Freight",
        date: "2026-07-18",
        origin: "Jebel Ali Port",
        destination: "Colombo Port",
        carrier: "CMA CGM",
        currentLocation: "Delivered & confirmed · delivered",
        timeline: [
            { id: 1, title: "Order confirmed", role: "Buyer & Seller", desc: "Contract signed and payment terms agreed.", date: "Jul 18", status: "completed" },
            { id: 2, title: "Harvest & quality prep", role: "Seller", desc: "Batch harvested, graded, and quality-certified for export.", date: "Jul 19", status: "completed" },
            { id: 3, title: "Inland transport to warehouse", role: "Logistics", desc: "Cargo trucked from origin to consolidation warehouse.", date: "Jul 20", status: "completed" },
            { id: 4, title: "Export customs clearance", role: "Logistics", desc: "Phytosanitary documents filed with export customs.", date: "Jul 21", status: "completed" },
            { id: 5, title: "Loaded & departed origin port", role: "Logistics", desc: "Container loaded; vessel departed Jebel Ali.", date: "Jul 22", status: "completed" },
            { id: 6, title: "In transit (ocean / air)", role: "Logistics", desc: "Ocean transit complete.", date: "Jul 25", status: "completed" },
            { id: 7, title: "Arrived & import clearance", role: "Logistics", desc: "Import declaration filed with Colombo customs.", date: "Jul 27", status: "completed" },
            { id: 8, title: "Last-mile delivery", role: "Logistics", desc: "Cargo delivered to buyer terminal.", date: "Jul 29", status: "completed" },
            { id: 9, title: "Delivered & confirmed", role: "Buyer", desc: "Buyer verified quantity & quality.", date: "Jul 30", status: "completed" }
        ],
        concerns: []
    },
    {
        id: "ORD-9021",
        buyer: "Northfield Grain Co.",
        seller: "Meridian Textiles",
        product: "Raw Cotton Bales (50MT)",
        value: "$145,000",
        status: "Confirmed",
        mode: "Ocean Freight",
        date: "2026-07-28",
        origin: "Karachi Port",
        destination: "Rotterdam Port",
        carrier: "Maersk Line",
        currentLocation: "Order confirmed · awaiting dispatch",
        timeline: [
            { id: 1, title: "Order confirmed", role: "Buyer & Seller", desc: "Escrow funded and purchase agreement signed.", date: "Jul 28", status: "completed" },
            { id: 2, title: "Harvest & quality prep", role: "Seller", desc: "Goods in preparation at Karachi facility.", date: "Jul 29", status: "in_progress" },
            { id: 3, title: "Inland transport to warehouse", role: "Logistics", desc: "Pending packing completion.", date: "Jul 30", status: "pending" },
            { id: 4, title: "Export customs clearance", role: "Logistics", desc: "Documentation pending.", date: "Aug 01", status: "pending" },
            { id: 5, title: "Loaded & departed origin port", role: "Logistics", desc: "Vessel assignment pending.", date: "Aug 03", status: "pending" },
            { id: 6, title: "In transit (ocean / air)", role: "Logistics", desc: "Scheduled.", date: "Aug 05", status: "pending" },
            { id: 7, title: "Arrived & import clearance", role: "Logistics", desc: "Scheduled.", date: "Aug 12", status: "pending" },
            { id: 8, title: "Last-mile delivery", role: "Logistics", desc: "Scheduled.", date: "Aug 14", status: "pending" },
            { id: 9, title: "Delivered & confirmed", role: "Buyer", desc: "Pending.", date: "Aug 15", status: "pending" }
        ],
        concerns: []
    },
    {
        id: "ORD-9022",
        buyer: "AgroCorp International",
        seller: "Osaka Machine Parts",
        product: "CNC Milling Components",
        value: "$320,000",
        status: "In-Transit",
        mode: "Ocean Freight",
        date: "2026-07-24",
        origin: "Tokyo Container Terminal",
        destination: "Singapore Port",
        carrier: "ONE Line",
        currentLocation: "In transit · ocean voyage active",
        timeline: [
            { id: 1, title: "Order confirmed", role: "Buyer & Seller", desc: "Trade deal finalized and down-payment locked.", date: "Jul 24", status: "completed" },
            { id: 2, title: "Harvest & quality prep", role: "Seller", desc: "Precision components certified by ISO inspection.", date: "Jul 25", status: "completed" },
            { id: 3, title: "Inland transport to warehouse", role: "Logistics", desc: "Trucked to Tokyo Port facility.", date: "Jul 26", status: "completed" },
            { id: 4, title: "Export customs clearance", role: "Logistics", desc: "Japanese export clearance granted.", date: "Jul 27", status: "completed" },
            { id: 5, title: "Loaded & departed origin port", role: "Logistics", desc: "Loaded on vessel ONE APUS.", date: "Jul 28", status: "completed" },
            { id: 6, title: "In transit (ocean / air)", role: "Logistics", desc: "Currently traversing South China Sea.", date: "Jul 29", status: "in_progress" },
            { id: 7, title: "Arrived & import clearance", role: "Logistics", desc: "ETA Singapore Aug 02.", date: "Aug 02", status: "pending" },
            { id: 8, title: "Last-mile delivery", role: "Logistics", desc: "Scheduled.", date: "Aug 03", status: "pending" },
            { id: 9, title: "Delivered & confirmed", role: "Buyer", desc: "Pending.", date: "Aug 04", status: "pending" }
        ],
        concerns: [{ id: 901, reason: "Delay", text: "Temperature telemetry sensor alert logged near Taiwan Strait.", date: "Jul 29", status: "Investigating" }]
    },
    {
        id: "ORD-9023",
        buyer: "Global Food Imports",
        seller: "Vantage Cold Chain",
        product: "Refrigerated Agro Produce",
        value: "$88,000",
        status: "Ready to Ship",
        mode: "Air Freight",
        date: "2026-07-29",
        origin: "Nhava Sheva Port, Mumbai",
        destination: "Port of Los Angeles",
        carrier: "Hapag-Lloyd",
        currentLocation: "Export customs cleared · staged for loading",
        timeline: [
            { id: 1, title: "Order confirmed", role: "Buyer & Seller", desc: "Perishable supply contract signed.", date: "Jul 25", status: "completed" },
            { id: 2, title: "Harvest & quality prep", role: "Seller", desc: "Cold storage temperature pre-conditioned.", date: "Jul 26", status: "completed" },
            { id: 3, title: "Inland transport to warehouse", role: "Logistics", desc: "Reefer trucks delivered to port terminal.", date: "Jul 27", status: "completed" },
            { id: 4, title: "Export customs clearance", role: "Logistics", desc: "Phytosanitary & export clearance complete.", date: "Jul 29", status: "completed" },
            { id: 5, title: "Loaded & departed origin port", role: "Logistics", desc: "Awaiting container gate-in at terminal.", date: "Jul 30", status: "in_progress" },
            { id: 6, title: "In transit (ocean / air)", role: "Logistics", desc: "Scheduled departure Jul 31.", date: "Jul 31", status: "pending" },
            { id: 7, title: "Arrived & import clearance", role: "Logistics", desc: "Scheduled.", date: "Aug 15", status: "pending" },
            { id: 8, title: "Last-mile delivery", role: "Logistics", desc: "Scheduled.", date: "Aug 17", status: "pending" },
            { id: 9, title: "Delivered & confirmed", role: "Buyer", desc: "Pending.", date: "Aug 18", status: "pending" }
        ],
        concerns: []
    },
    {
        id: "ORD-9024",
        buyer: "Delta Foods Ltd.",
        seller: "Meridian Textiles",
        product: "Organic Woven Fabric",
        value: "$210,000",
        status: "Processing",
        mode: "Trucking",
        date: "2026-07-30",
        origin: "Karachi Port",
        destination: "Jebel Ali Port, Dubai",
        carrier: "MSC",
        currentLocation: "Customs processing · origin documentation review",
        timeline: [
            { id: 1, title: "Order confirmed", role: "Buyer & Seller", desc: "Commercial invoice & LC verified.", date: "Jul 26", status: "completed" },
            { id: 2, title: "Harvest & quality prep", role: "Seller", desc: "Weaving and lab quality test completed.", date: "Jul 28", status: "completed" },
            { id: 3, title: "Inland transport to warehouse", role: "Logistics", desc: "Transported to port stack yard.", date: "Jul 29", status: "completed" },
            { id: 4, title: "Export customs clearance", role: "Logistics", desc: "Customs agent validating origin certificate.", date: "Jul 30", status: "in_progress" },
            { id: 5, title: "Loaded & departed origin port", role: "Logistics", desc: "Pending clearance.", date: "Aug 01", status: "pending" },
            { id: 6, title: "In transit (ocean / air)", role: "Logistics", desc: "Scheduled.", date: "Aug 02", status: "pending" },
            { id: 7, title: "Arrived & import clearance", role: "Logistics", desc: "Scheduled.", date: "Aug 06", status: "pending" },
            { id: 8, title: "Last-mile delivery", role: "Logistics", desc: "Scheduled.", date: "Aug 08", status: "pending" },
            { id: 9, title: "Delivered & confirmed", role: "Buyer", desc: "Pending.", date: "Aug 09", status: "pending" }
        ],
        concerns: []
    }
];

const REQUIRED_DOC_OPTIONS = [
    "Government ID / Passport",
    "Business Registration / KYB Form",
    "Tax Identification Number (TIN)",
    "Proof of Business Address",
    "Bank Account Statement",
    "Quality / Export License"
];

const MONTHLY_TRADE_DATA = [
    { month: 'Jan', val: 1.2 }, { month: 'Feb', val: 1.8 }, { month: 'Mar', val: 2.1 },
    { month: 'Apr', val: 1.6 }, { month: 'May', val: 2.8 }, { month: 'Jun', val: 3.2 }, { month: 'Jul', val: 4.1 }
];

const COUNTRY_SALES_DATA = [
    { country: 'USA', value: 42, color: '#2563eb' },
    { country: 'Netherlands', value: 28, color: '#0284c7' },
    { country: 'India', value: 21, color: '#059669' },
    { country: 'Japan', value: 19, color: '#d97706' },
    { country: 'UAE', value: 15, color: '#9333ea' }
];

const ORDER_STAGES = ["Confirmed", "In-Transit", "Ready to Ship", "Processing", "Completed"];

const getAuthToken = () => {
    let token = localStorage.getItem('token') || localStorage.getItem('authToken') || '';
    
    // Remove quotes, whitespace, newlines, and duplicate "Bearer" prefixes
    token = token.trim().replace(/^"|"$/g, '');
    if (token.startsWith('Bearer ')) {
        token = token.slice(7).trim();
    }
    return token;
};

const getSanitizedToken = () => {
    let token = localStorage.getItem('token') || localStorage.getItem('authToken') || '';
    
    // Remove wrapping quotes, trailing/leading whitespace, and newlines
    token = token.trim().replace(/^"|"$/g, '').replace(/[\r\n]+/g, '');
  
    // Strip duplicate 'Bearer ' prefix if stored in localStorage with one
    if (token.startsWith('Bearer ')) {
      token = token.slice(7).trim();
    }
    return token;
  };

// ============================================================================
// 2. BUYER & SELLER VERIFICATION API INTEGRATION LAYER (EMPTY DEFAULT DATA)
// ============================================================================
const getAuthHeaders = () => {
    const token = localStorage.getItem('token'); // or getAuthToken()
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      'x-user-id': 'admin@trade.com',  // Dev fallback header
      'x-user-role': 'ADMIN'
    };
  };

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api';
// Removed export keyword to fix Vite Fast Refresh warning
const VERIFICATION_API_ENDPOINT = `${API_BASE_URL}/v1/verification`;
// Socket.IO connects to the server origin, not the REST /api path prefix.
const SOCKET_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

// API INTEGRATION: Fetch Buyer & Seller verifications
const apiService = {
    // GET /api/v1/verification returns ONE FLAT RECORD PER UPLOADED FILE:
    // { id, userId, userName, userRole, roleCategory, fileName, originalName,
    // filePath, status, uploadedAt } — see verification.controller.js
    // getDocuments(). The admin-tab render below (groupedEntitiesMap) groups
    // these raw records by userId into per-buyer/per-seller rows and reads
    // doc.fileName/doc.filePath directly, so fetchVerifications() just needs
    // to hand back that flat array unmodified — no reshaping here.
    fetchVerifications: async () => {
        console.log('🚀 [apiService] Requesting verification data from:', VERIFICATION_API_ENDPOINT);
        try {
            const response = await fetch(VERIFICATION_API_ENDPOINT, {
                method: 'GET',
                headers: getAuthHeaders()
            });

            console.log(`📡 [apiService] HTTP Response Status: ${response.status} (${response.statusText})`);

            if (response.status === 401) {
                console.warn('⚠️ [apiService] Unauthorized (401). Returning empty array.');
                return [];
            }
            if (!response.ok) throw new Error(`Fetch error: ${response.status}`);

            const rawData = await response.json();

            if (Array.isArray(rawData)) return rawData;
            if (rawData && typeof rawData === 'object') {
                return rawData.documents || rawData.data || rawData.verifications || [];
            }
            return [];
        } catch (error) {
            console.error('❌ [apiService] Failed to fetch verification records:', error);
            return [];
        }
    },

    updateVerificationStatus: async (docId, status, remarks = "") => {
        console.log(`⚙️ [apiService] Updating doc ID: ${docId} -> New Status: ${status}`, { remarks });
        try {
            const token = getAuthToken();
            const response = await fetch(`${VERIFICATION_API_ENDPOINT}/${docId}/status`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ status, remarks })
            });

            if (!response.ok) throw new Error(`Update status failed with code ${response.status}`);
            console.log(`✅ [apiService] Status update successful for ${docId}`);
        } catch (e) {
            console.warn("⚠️ [apiService] API update failed, maintaining local UI state:", docId, e);
        }
        return { success: true, id: docId, status, remarks };
    },

    // Retained standard service functions for non-verification sections
    fetchOrders: async (userRole = 'Admin', userCompany = null) => {
        console.log(`📦 [apiService] Fetching orders for Role: ${userRole}`);
        return new Promise((resolve) => {
            setTimeout(() => {
                let data = [...INITIAL_ORDERS];
                if (userRole === 'Buyer') {
                    data = data.filter(o => o.buyer === userCompany);
                } else if (userRole === 'Seller') {
                    data = data.filter(o => o.seller === userCompany);
                }
                console.log(`📦 [apiService] Fetched ${data.length} orders.`);
                resolve(data);
            }, 300);
        });
    },

    updateOrderStatus: async (orderId, nextStatus) => {
        console.log(`⚙️ [apiService] Order ${orderId} state changed to: ${nextStatus}`);
        return new Promise((resolve) => setTimeout(() => resolve({ success: true, orderId, nextStatus }), 300));
    },

    postConcern: async (orderId, concernPayload) => {
        console.log(`💬 [apiService] Logging concern for Order ${orderId}:`, concernPayload);
        return new Promise((resolve) => setTimeout(() => resolve({ success: true, orderId, concern: concernPayload }), 300));
    },

    sendAutomatedDocEmail: async (companyId, missingDocsList) => {
        console.log(`✉️ [apiService] Automated doc email queued for Company: ${companyId}`, missingDocsList);
        return new Promise((resolve) => setTimeout(() => resolve({ success: true, companyId, missingDocsList }), 300));
    }
};

// Standalone Utility Helpers
const parseOrderValue = (valStr) => {
    if (!valStr) return 0;
    return Number(valStr.replace(/[^0-9.-]+/g, ""));
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};

// ============================================================================
// 3. MAIN COMPONENT: MASTER ADMIN WORKSPACE
// ============================================================================

export default function MasterAdminWorkspace() {
    // ACTIVE WORKSPACE CONTROLS
    const [activeTab, setActiveTab] = useState('Overview');
    const [viewRole, setViewRole] = useState('Admin'); // 'Admin' | 'Buyer' | 'Seller'
    const [viewCompany, setViewCompany] = useState('Northfield Grain Co.');

    // SUB-TAB STATES
    const [orderSubTab, setOrderSubTab] = useState('All');
    const [buyerSubTab, setBuyerSubTab] = useState('All');
    const [sellerSubTab, setSellerSubTab] = useState('All');
    const [concernReason, setConcernReason] = useState("Delay");
    const [selectedDocPreview, setSelectedDocPreview] = useState(null);
    // NAVIGATION EXPANSION STATES
    const [expandedNav, setExpandedNav] = useState({
        Orders: true,
        'Buyer Verification': true,
        'Seller Verification': true,
        'Tracking & Logistics': true
    });

    const toggleNavExpand = (navName) => {
        setExpandedNav(prev => ({ ...prev, [navName]: !prev[navName] }));
    };

    // CORE DOMAIN DATA STATES
    const [verifications, setVerifications] = useState([]);
    const [queries] = useState(INITIAL_QUERIES);
    const [orders, setOrders] = useState(INITIAL_ORDERS);
    const [searchQuery, setSearchQuery] = useState("");

    // TRACKING & CONCERNS STATE
    const [selectedTrackingOrder, setSelectedTrackingOrder] = useState("ORD-5510");
    const [isConcernModalOpen, setIsConcernModalOpen] = useState(false);
    const [isContactLogisticsOpen, setIsContactLogisticsOpen] = useState(false);
    const [concernText, setConcernText] = useState("");
    const [logisticsMessage, setLogisticsMessage] = useState("");

    // MODALS & NOTIFICATIONS
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([
        "System ready for real verification requests",
        "Escrow balance updated for Order #ORD-9022"
    ]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [missingDocs, setMissingDocs] = useState([]);
    const [toastMessage, setToastMessage] = useState(null);
    const [notifyModalEntity, setNotifyModalEntity] = useState(null);
    // Initial load for Buyer & Seller API Verification Data
    useEffect(() => {
        apiService.fetchVerifications().then(data => {
            setVerifications(data);
        });
    }, []);

    // Live auto-refresh: a buyer/supplier uploading a document, a new
    // account registering, or a document status changing (from THIS admin
    // session or another admin tab) all broadcast on the same
    // VERIFICATION_UPDATE_EVENT channel — re-pull the table on any of them
    // so the panel reflects reality without a manual page refresh.
    useEffect(() => {
        const adminSocket = io(SOCKET_BASE_URL, {
            query: { role: 'MASTER_ADMIN' },
            transports: ['polling', 'websocket'],
            reconnectionAttempts: 5,
            autoConnect: true
        });

        const handleLiveVerificationUpdate = (data) => {
            if (!data || !data.type) return;
            apiService.fetchVerifications().then(refreshed => {
                setVerifications(refreshed);
            });
        };

        adminSocket.on('VERIFICATION_UPDATE_EVENT', handleLiveVerificationUpdate);

        return () => {
            adminSocket.off('VERIFICATION_UPDATE_EVENT', handleLiveVerificationUpdate);
            adminSocket.disconnect();
        };
    }, []);

    // Dynamic API Data Loader on Role Switch
    useEffect(() => {
        apiService.fetchOrders(viewRole, viewCompany).then(data => {
            setOrders(data);
            if (data.length > 0) setSelectedTrackingOrder(data[0].id);
        });
    }, [viewRole, viewCompany]);

    // FREIGHT TAB FILTER
    useEffect(() => {
        if (FREIGHT_TABS.includes(activeTab)) {
            const match = orders.find(o => o.mode === activeTab);
            setSelectedTrackingOrder(match ? match.id : null);
        }
    }, [activeTab, orders]);

    // DYNAMIC FINANCIAL CALCULATIONS
    const completedOrders = orders.filter(o => o.status === 'Completed');
    const activeOrders = orders.filter(o => o.status !== 'Completed');

    const completedTotalValue = completedOrders.reduce((sum, ord) => sum + parseOrderValue(ord.value), 0);
    const activeEscrowValue = activeOrders.reduce((sum, ord) => sum + parseOrderValue(ord.value), 0);
    const grandTotalValue = completedTotalValue + activeEscrowValue;

    // EVENT HANDLERS LINKED TO API SERVICE
    const handleProgressOrder = async (orderId, nextStatus) => {
        await apiService.updateOrderStatus(orderId, nextStatus);

        setOrders(prev => prev.map(ord => {
            if (ord.id !== orderId) return ord;

            let completedStepsCount = 1;
            let locationText = "Order confirmed · awaiting dispatch";

            if (nextStatus === 'In-Transit') {
                completedStepsCount = 6;
                locationText = "In transit · ocean/air voyage active";
            } else if (nextStatus === 'Ready to Ship') {
                completedStepsCount = 4;
                locationText = "Export customs cleared · staged for loading";
            } else if (nextStatus === 'Processing') {
                completedStepsCount = 7;
                locationText = "Arrived & import clearance in progress";
            } else if (nextStatus === 'Completed') {
                completedStepsCount = 9;
                locationText = "Delivered & confirmed · delivered";
            }

            const updatedTimeline = ord.timeline.map((step, index) => {
                if (index < completedStepsCount - 1) {
                    return { ...step, status: 'completed' };
                } else if (index === completedStepsCount - 1) {
                    return { ...step, status: nextStatus === 'Completed' ? 'completed' : 'in_progress' };
                } else {
                    return { ...step, status: 'pending' };
                }
            });

            return {
                ...ord,
                status: nextStatus,
                currentLocation: locationText,
                timeline: updatedTimeline
            };
        }));

        showToast(`Order ${orderId} updated to stage: ${nextStatus}`);
    };

    const handleUpdateStatus = async (entity, newStatus, remarks = "") => {
        try {
            if (entity.docs && entity.docs.length > 0) {
                // Update each individual uploaded document ID
                await Promise.all(
                    entity.docs.map(doc =>
                        apiService.updateVerificationStatus(doc.id, newStatus, remarks)
                    )
                );
            } else {
                // Fallback to target entity ID
                const targetId = entity.userId || entity.userName;
                await apiService.updateVerificationStatus(targetId, newStatus, remarks);
            }

            // Refresh from the server so the table reflects the new status
            // immediately instead of only after a manual page reload.
            const refreshed = await apiService.fetchVerifications();
            setVerifications(refreshed);

            alert(`✅ Status updated to "${newStatus}" for ${entity.userName}`);
        } catch (error) {
            console.error('❌ Update status error:', error);
            alert(`⚠️ Failed to update status: ${error.message}`);
        }
    };

    // Per-document Approve/Reject — used by the inline buttons on each
    // uploaded document chip so admins don't have to approve/reject an
    // entity's entire document set in one bulk action. The entity-level
    // "Complete" status is derived automatically (see groupedEntitiesMap
    // roll-up above) once every one of its documents is individually
    // Approved, so there's no separate "mark entity complete" action needed.
    const handleUpdateSingleDocStatus = async (doc, entity, newStatus, remarks = "") => {
        try {
            await apiService.updateVerificationStatus(doc.id, newStatus, remarks);

            const refreshed = await apiService.fetchVerifications();
            setVerifications(refreshed);
        } catch (error) {
            console.error('❌ Update single document status error:', error);
            alert(`⚠️ Failed to update "${doc.name}": ${error.message}`);
        }
    };

    // Prompts for a rejection reason, returns null if the admin cancels
    // (callers should bail out without calling the API in that case) so a
    // reject can never go through silently without a remark on record.
    const promptRejectRemarks = (label) => {
        const reason = window.prompt(`Reason for rejecting "${label}"? (required)`, '');
        if (reason === null) return null; // cancelled
        return reason.trim() || 'No reason provided';
    };

    const handleToggleDoc = (doc) => {
        setMissingDocs(prev => prev.includes(doc) ? prev.filter(d => d !== doc) : [...prev, doc]);
    };

    const handleSendAutomatedEmail = async () => {
        if (missingDocs.length === 0) {
            alert("Please select at least one missing document to send.");
            return;
        }
        await apiService.sendAutomatedDocEmail(selectedItem.id, missingDocs);
        showToast(`Automated request email sent to ${selectedItem.name}.`);
        handleUpdateStatus(selectedItem, "Pending for Approval");
        setSelectedItem(null);
        setMissingDocs([]);
    };

    const handleRaiseConcern = async () => {
        if (!concernText.trim()) return;
        const newConcern = {
            id: Date.now(),
            reason: concernReason,
            text: concernText,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            status: 'Open'
        };

        await apiService.postConcern(selectedTrackingOrder, newConcern);

        setOrders(prev => prev.map(ord => {
            if (ord.id === selectedTrackingOrder) {
                return { ...ord, concerns: [newConcern, ...(ord.concerns || [])] };
            }
            return ord;
        }));

        setConcernText("");
        setConcernReason("Delay");
        setIsConcernModalOpen(false);
        showToast(`Concern logged for ${selectedTrackingOrder}`);
    };

    const handleContactLogisticsSubmit = () => {
        if (!logisticsMessage.trim()) return;
        setLogisticsMessage("");
        setIsContactLogisticsOpen(false);
        showToast("Carrier inquiry message dispatched successfully.");
    };

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    const currentActiveOrderData = orders.find(o => o.id === selectedTrackingOrder) || null;

    // SIDEBAR CONFIGURATION
    const sidebarNavItems = [
        { name: 'Overview', icon: <LayoutDashboard size={18} /> },
        {
            name: 'Orders',
            icon: <ShoppingCart size={18} />,
            subTabs: ['All', 'Confirmed', 'In-Transit', 'Ready to Ship', 'Processing', 'Completed'],
            activeSub: orderSubTab,
            setSub: setOrderSubTab
        },
        { name: "Tracking & Logistics", icon: <Truck size={18} />, subTabs: FREIGHT_TABS },
        {
            name: 'Buyer Verification',
            icon: <Users size={18} />,
            subTabs: ['All', 'Pending for Approval', 'Approved', 'Rejected'],
            activeSub: buyerSubTab,
            setSub: setBuyerSubTab
        },
        {
            name: 'Seller Verification',
            icon: <Building2 size={18} />,
            subTabs: ['All', 'Pending for Approval', 'Approved', 'Rejected'],
            activeSub: sellerSubTab,
            setSub: setSellerSubTab
        },
        { name: 'Finance', icon: <CreditCard size={18} /> }
    ];

    // Search and subtab filtered orders
    const filteredOrders = orders.filter(o => {
        const matchesSub = orderSubTab === 'All' ? true : o.status === orderSubTab;
        const matchesSearch = searchQuery === "" ? true : (
            o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.buyer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.seller.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.product.toLowerCase().includes(searchQuery.toLowerCase())
        );
        return matchesSub && matchesSearch;
    });

    return (
        <div style={styles.appWrapper}>
            {toastMessage && (
                <div style={styles.toast}>
                    <Check size={18} /> {toastMessage}
                </div>
            )}

            {/* ================= LEFT SIDEBAR NAVIGATION ================= */}
            <aside style={styles.sidebar}>
                <div style={styles.sidebarBrand}>
                    <ShieldAlert size={28} color="#2563eb" />
                    <div>
                        <div style={styles.brandName}>MasterAdmin</div>
                        <div style={styles.brandSub}>Workspace Portal</div>
                    </div>
                </div>

                <div style={{ padding: '12px 16px 4px 16px', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Main Menu ({viewRole} View)
                </div>

                <nav style={styles.sidebarNav}>
                    {sidebarNavItems.map((item) => {
                        const isActive = activeTab === item.name || (item.subTabs && item.subTabs.includes(activeTab));
                        const hasSubTabs = Boolean(item.subTabs);
                        const isExpanded = expandedNav[item.name];

                        return (
                            <div key={item.name} style={{ display: 'flex', flexDirection: 'column' }}>
                                <button
                                    style={{
                                        ...styles.sidebarItem,
                                        ...(isActive ? styles.sidebarItemActive : {})
                                    }}
                                    onClick={() => {
                                        setActiveTab(item.name);
                                        if (hasSubTabs) toggleNavExpand(item.name);
                                    }}
                                >
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{ color: isActive ? '#2563eb' : '#64748b' }}>{item.icon}</span>
                                        {item.name}
                                    </span>
                                    {hasSubTabs ? (
                                        isExpanded ? <ChevronDown size={15} color="#64748b" /> : <ChevronRight size={15} color="#64748b" />
                                    ) : (
                                        isActive && <ChevronRight size={16} color="#2563eb" />
                                    )}
                                </button>

                                {hasSubTabs && isExpanded && (
                                    <div style={styles.sidebarSubMenu}>
                                        {item.subTabs.map(sub => {
                                            const isSubActive = item.setSub
                                                ? (isActive && item.activeSub === sub)
                                                : activeTab === sub;

                                            return (
                                                <button
                                                    key={sub}
                                                    style={{
                                                        ...styles.sidebarSubItem,
                                                        ...(isSubActive ? styles.sidebarSubItemActive : {})
                                                    }}
                                                    onClick={() => {
                                                        if (item.setSub) {
                                                            setActiveTab(item.name);
                                                            item.setSub(sub);
                                                        } else {
                                                            setActiveTab(sub);
                                                        }
                                                    }}
                                                >
                                                    <span style={{
                                                        ...styles.sidebarSubDot,
                                                        backgroundColor: isSubActive ? '#2563eb' : '#cbd5e1'
                                                    }} />
                                                    {sub}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                <div style={styles.sidebarFooter}>
                    <div style={styles.adminAvatar}>{viewRole === 'Admin' ? 'MA' : (viewRole === 'Buyer' ? 'BY' : 'SL')}</div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{viewRole === 'Admin' ? 'Master Admin' : viewCompany}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{viewRole.toLowerCase()}@trade.com</div>
                    </div>
                </div>
            </aside>

            {/* ================= MAIN WORKSPACE AREA ================= */}
            <div style={styles.mainContainer}>
                {/* TOP HEADER WITH ROLE SIMULATOR & SEARCH */}
                <header style={styles.header}>
                    <div style={styles.headerSearch}>
                        <Search size={18} color="#94a3b8" />
                        <input
                            type="text"
                            placeholder="Search orders, companies, products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={styles.searchInput}
                        />
                    </div>

                    <div style={styles.headerActions}>
                        {/* ROLE SIMULATOR TOOLBAR */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '8px' }}>
                            <UserCheck size={16} color="#64748b" />
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>Perspective:</span>
                            <select
                                value={viewRole}
                                onChange={(e) => {
                                    setViewRole(e.target.value);
                                    if (e.target.value === 'Buyer') setViewCompany('Northfield Grain Co.');
                                    if (e.target.value === 'Seller') setViewCompany('Meridian Textiles');
                                }}
                                style={{ border: 'none', background: 'transparent', fontSize: '12px', fontWeight: 700, color: '#2563eb', cursor: 'pointer', outline: 'none' }}
                            >
                                <option value="Admin">Global Master Admin</option>
                                <option value="Buyer">Buyer Portal (Northfield)</option>
                                <option value="Seller">Seller Portal (Meridian)</option>
                            </select>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <button
                                style={styles.bellBtn}
                                onClick={() => setNotificationsOpen(!notificationsOpen)}
                            >
                                <Bell size={20} color="#475569" />
                                {notifications.length > 0 && <span style={styles.bellBadge}>{notifications.length}</span>}
                            </button>

                            {notificationsOpen && (
                                <div style={styles.notificationDropdown}>
                                    <div style={styles.notifHeader}>
                                        <strong>Notifications</strong>
                                        <span style={styles.clearNotif} onClick={() => setNotifications([])}>Clear all</span>
                                    </div>
                                    {notifications.length === 0 ? (
                                        <p style={{ padding: '16px', fontSize: '13px', color: '#64748b' }}>No unread alerts</p>
                                    ) : (
                                        notifications.map((n, idx) => (
                                            <div key={idx} style={styles.notifRow}>
                                                <span style={styles.notifDot} />
                                                {n}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        <div style={styles.statusBadgeGlobal}>
                            <span style={styles.liveDot} /> System Live
                        </div>
                    </div>
                </header>

                {/* WORKSPACE CONTENT */}
                <main style={styles.mainContent}>

                    {/* 1. OVERVIEW TAB */}
                    {activeTab === 'Overview' && (
                        <div>
                            <div style={{ marginBottom: '20px' }}>
                                <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>
                                    Executive Overview {viewRole !== 'Admin' && `(${viewRole}: ${viewCompany})`}
                                </h1>
                                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                                    Real-time analytics, visual trade trends, and verification metrics for Buyers & Sellers.
                                </p>
                            </div>

                            <div style={styles.grid4}>
                                <MetricCard title="Total Trades Value" value={formatCurrency(grandTotalValue)} trend="+12.4%" isUp={true} icon={<DollarSign color="#2563eb" />} />
                                <MetricCard title="Completed Trades Volume" value={formatCurrency(completedTotalValue)} trend="+8.1%" isUp={true} icon={<CheckCircle color="#16a34a" />} />
                                <MetricCard title="In-Transit / Active Escrow" value={formatCurrency(activeEscrowValue)} trend="-2.3%" isUp={false} icon={<FileText color="#d97706" />} />
                                <MetricCard title="Total Orders Handled" value={orders.length.toString()} trend="+15.0%" isUp={true} icon={<TrendingUp color="#0284c7" />} />
                            </div>

                            <div style={{ ...styles.grid2, marginTop: '20px' }}>
                                <div style={styles.card}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                        <div>
                                            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Total Trade Value Trend ($ Millions)</h3>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>Monthly trade volume tracking for 2026</span>
                                        </div>
                                        <span style={styles.pillBadge}>Year to Date</span>
                                    </div>

                                    <div style={{ width: '100%', height: '220px', position: 'relative' }}>
                                        <svg viewBox="0 0 500 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                            <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeDasharray="4" />
                                            <line x1="0" y1="90" x2="500" y2="90" stroke="#f1f5f9" strokeDasharray="4" />
                                            <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" strokeDasharray="4" />
                                            <line x1="0" y1="190" x2="500" y2="190" stroke="#e2e8f0" />
                                            <defs>
                                                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                                                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                                                </linearGradient>
                                            </defs>
                                            <path d="M 20 150 L 95 120 L 170 100 L 245 130 L 320 70 L 395 50 L 470 20 L 470 190 L 20 190 Z" fill="url(#areaGrad)" />
                                            <path d="M 20 150 L 95 120 L 170 100 L 245 130 L 320 70 L 395 50 L 470 20" fill="none" stroke="#2563eb" strokeWidth="3.5" strokeLinecap="round" />
                                            {[{ x: 20, y: 150 }, { x: 95, y: 120 }, { x: 170, y: 100 }, { x: 245, y: 130 }, { x: 320, y: 70 }, { x: 395, y: 50 }, { x: 470, y: 20 }].map((pt, i) => (
                                                <circle key={i} cx={pt.x} cy={pt.y} r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
                                            ))}
                                        </svg>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px', marginTop: '8px', fontSize: '12px', color: '#64748b' }}>
                                            {MONTHLY_TRADE_DATA.map((d, i) => <span key={i}>{d.month}</span>)}
                                        </div>
                                    </div>
                                </div>

                                <div style={styles.card}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                        <div>
                                            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Country-Wise Trade Distribution</h3>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>Top trading partner markets by percentage</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
                                        {COUNTRY_SALES_DATA.map((item, idx) => (
                                            <div key={idx}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 500, marginBottom: '6px' }}>
                                                    <span>{item.country}</span>
                                                    <span><b>{item.value}%</b> (${(item.value * 0.14).toFixed(1)}M)</span>
                                                </div>
                                                <div style={{ height: '10px', backgroundColor: '#f1f5f9', borderRadius: '5px', overflow: 'hidden' }}>
                                                    <div style={{ width: `${item.value * 2}%`, backgroundColor: item.color, height: '10px', borderRadius: '5px' }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. ORDERS TAB */}
                    {activeTab === 'Orders' && (
                        <div>
                            <div style={{ marginBottom: '20px' }}>
                                <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>Orders Lifecycle & Journey Flow</h1>
                                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                                    Filter: <b>{orderSubTab} Orders</b> | Track Buyer & Seller progress: Confirmed → In-Transit → Ready to Ship → Processing → Completed.
                                </p>
                            </div>

                            <div style={{ ...styles.card, marginBottom: '20px', padding: '16px 24px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px' }}>
                                    Order Journey Stages
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                    {ORDER_STAGES.map((st, i) => (
                                        <React.Fragment key={st}>
                                            <button
                                                onClick={() => setOrderSubTab(st)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    padding: '8px 14px',
                                                    borderRadius: '20px',
                                                    border: orderSubTab === st ? '1px solid #2563eb' : '1px solid #e2e8f0',
                                                    backgroundColor: orderSubTab === st ? '#eff6ff' : '#ffffff',
                                                    color: orderSubTab === st ? '#2563eb' : '#475569',
                                                    fontWeight: 600,
                                                    fontSize: '13px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <span style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    borderRadius: '50%',
                                                    backgroundColor: orderSubTab === st ? '#2563eb' : '#cbd5e1',
                                                    color: '#fff',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '11px'
                                                }}>
                                                    {orders.filter(o => o.status === st).length}
                                                </span>
                                                {st}
                                            </button>
                                            {i < ORDER_STAGES.length - 1 && <ArrowRight size={16} color="#94a3b8" />}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>

                            <div style={styles.grid4}>
                                <MetricCard title="Confirmed" value={orders.filter(o => o.status === 'Confirmed').length.toString()} icon={<ShoppingCart color="#2563eb" />} />
                                <MetricCard title="In-Transit" value={orders.filter(o => o.status === 'In-Transit').length.toString()} icon={<Truck color="#d97706" />} />
                                <MetricCard title="Ready to Ship" value={orders.filter(o => o.status === 'Ready to Ship').length.toString()} icon={<Clock color="#0284c7" />} />
                                <MetricCard title="Processing / Done" value={orders.filter(o => o.status === 'Processing' || o.status === 'Completed').length.toString()} icon={<PackageCheck color="#16a34a" />} />
                            </div>

                            <div style={{ ...styles.card, marginTop: '20px', padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>Active Orders Pipeline ({orderSubTab})</h3>
                                    <span style={styles.pillBadge}>{filteredOrders.length} Orders Active</span>
                                </div>

                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>ORDER ID</th>
                                            <th style={styles.th}>BUYER / SELLER</th>
                                            <th style={styles.th}>PRODUCT DETAILS</th>
                                            <th style={styles.th}>VALUE</th>
                                            <th style={styles.th}>JOURNEY STAGE</th>
                                            <th style={styles.th}>ACTION / MOVE STAGE</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                                                    No orders found matching filter criteria.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredOrders.map(ord => {
                                                const currentStageIdx = ORDER_STAGES.indexOf(ord.status);

                                                return (
                                                    <tr key={ord.id}>
                                                        <td style={styles.td}>
                                                            <button
                                                                style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                                                                onClick={() => {
                                                                    setSelectedTrackingOrder(ord.id);
                                                                    setActiveTab('Tracking & Logistics');
                                                                }}
                                                            >
                                                                {ord.id}
                                                            </button>
                                                            <div style={{ fontSize: '11px', color: '#64748b' }}>{ord.date}</div>
                                                        </td>
                                                        <td style={styles.td}>
                                                            <div><b>B:</b> {ord.buyer}</div>
                                                            <div style={{ color: '#64748b' }}><b>S:</b> {ord.seller}</div>
                                                        </td>
                                                        <td style={styles.td}>{ord.product}</td>
                                                        <td style={styles.td}><b>{ord.value}</b></td>
                                                        <td style={styles.td}>
                                                            <StatusBadge status={ord.status} />
                                                            <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                                                                {ORDER_STAGES.map((st, idx) => (
                                                                    <div
                                                                        key={st}
                                                                        title={st}
                                                                        style={{
                                                                            height: '4px',
                                                                            flex: 1,
                                                                            borderRadius: '2px',
                                                                            backgroundColor: idx <= currentStageIdx ? '#2563eb' : '#e2e8f0'
                                                                        }}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td style={styles.td}>
                                                            {ord.status === 'Confirmed' && (
                                                                <button
                                                                    style={styles.btnActionTransit}
                                                                    onClick={() => handleProgressOrder(ord.id, 'In-Transit')}
                                                                >
                                                                    Ship (In-Transit) <ArrowRight size={14} />
                                                                </button>
                                                            )}

                                                            {ord.status === 'In-Transit' && (
                                                                <button
                                                                    style={styles.btnActionReady}
                                                                    onClick={() => handleProgressOrder(ord.id, 'Ready to Ship')}
                                                                >
                                                                    Ready to Ship <ArrowRight size={14} />
                                                                </button>
                                                            )}

                                                            {ord.status === 'Ready to Ship' && (
                                                                <button
                                                                    style={styles.btnActionProcessing}
                                                                    onClick={() => handleProgressOrder(ord.id, 'Processing')}
                                                                >
                                                                    Move to Processing <ArrowRight size={14} />
                                                                </button>
                                                            )}

                                                            {ord.status === 'Processing' && (
                                                                <button
                                                                    style={styles.btnActionComplete}
                                                                    onClick={() => handleProgressOrder(ord.id, 'Completed')}
                                                                >
                                                                    Mark Completed <Check size={14} />
                                                                </button>
                                                            )}

                                                            {ord.status === 'Completed' && (
                                                                <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                    <CheckCircle size={14} /> Order Fulfilled
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* 3. TRACKING & LOGISTICS TAB */}
                    {["Tracking & Logistics", ...FREIGHT_TABS].includes(activeTab) && (() => {
                        const relevantOrders = FREIGHT_TABS.includes(activeTab)
                            ? orders.filter(o => o.mode === activeTab)
                            : orders;

                        if (!currentActiveOrderData || !relevantOrders.some(o => o.id === currentActiveOrderData.id)) {
                            return (
                                <div>
                                    <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>
                                        {activeTab === 'Tracking & Logistics' ? 'Logistics Tracking' : activeTab}
                                    </h1>
                                    <div style={{ ...styles.card, marginTop: '16px', padding: '24px', color: '#64748b', fontSize: '14px' }}>
                                        No active shipments currently under <b>{activeTab}</b>.
                                    </div>
                                </div>
                            );
                        }

                        const timeline = currentActiveOrderData.timeline || [];
                        const concerns = currentActiveOrderData.concerns || [];
                        const stuckStage = timeline.find(s => s.status === 'in_progress')?.title || 'Unknown Stage';
                        const hasConcerns = concerns.length > 0;
                        const latestConcern = hasConcerns ? concerns[0] : null;

                        return (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <div>
                                        <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>
                                            {activeTab === 'Tracking & Logistics' ? 'Logistics Tracking' : activeTab}
                                        </h1>
                                        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Track live shipment locations for Buyers & Sellers, and log operational alerts.</p>
                                    </div>
                                    <button
                                        style={styles.secondaryBtn}
                                        onClick={() => setIsContactLogisticsOpen(true)}
                                    >
                                        <Mail size={16} /> Contact carrier
                                    </button>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <select
                                        value={selectedTrackingOrder || ''}
                                        onChange={(e) => setSelectedTrackingOrder(e.target.value)}
                                        style={{ ...styles.selectInput, width: '100%', padding: '10px 12px', fontSize: '14px' }}
                                    >
                                        {relevantOrders.map(o => (
                                            <option key={`tracking-option-${o.id}`} value={o.id}>
                                                {o.id} — Buyer: {o.buyer} | Seller: {o.seller} · {o.product} ({o.status})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ ...styles.card, padding: '24px' }}>
                                    {hasConcerns && latestConcern && (
                                        <div style={{
                                            backgroundColor: '#fef2f2',
                                            border: '1px solid #fecaca',
                                            borderRadius: '8px',
                                            padding: '14px 16px',
                                            marginBottom: '20px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '6px'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#dc2626', fontWeight: 700, fontSize: '14px' }}>
                                                    <AlertTriangle size={18} />
                                                    <span>SHIPMENT ALERT: {latestConcern.reason || 'Issue Reported'}</span>
                                                </div>
                                                <span style={{
                                                    backgroundColor: '#fee2e2',
                                                    color: '#991b1b',
                                                    fontSize: '11px',
                                                    fontWeight: 700,
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {latestConcern.status || 'Action Required'}
                                                </span>
                                            </div>

                                            <div style={{ fontSize: '13px', color: '#1e293b', marginTop: '2px' }}>
                                                <strong>Stuck at stage:</strong> <span style={{ color: '#b91c1c', fontWeight: 600 }}>{stuckStage}</span>
                                            </div>

                                            <div style={{ fontSize: '13px', color: '#475569', backgroundColor: '#ffffff', padding: '8px 12px', borderRadius: '6px', border: '1px solid #fee2e2', marginTop: '4px' }}>
                                                <strong>Reason / Details:</strong> {latestConcern.text}
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div>
                                            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{currentActiveOrderData.id}</h2>
                                            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#475569', marginTop: '6px' }}>
                                                <span><b>Buyer:</b> {currentActiveOrderData.buyer}</span>
                                                <span><b>Seller:</b> {currentActiveOrderData.seller}</span>
                                                <span><b>Route:</b> {currentActiveOrderData.origin} → {currentActiveOrderData.destination}</span>
                                                <span><b>Carrier:</b> {currentActiveOrderData.carrier}</span>
                                            </div>
                                        </div>
                                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{currentActiveOrderData.product}</span>
                                    </div>

                                    <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '20px' }}>
                                        Currently at: <span style={{ color: '#2563eb', fontWeight: 600 }}>{currentActiveOrderData.currentLocation}</span>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {timeline.map((st, idx) => {
                                            const isLast = idx === timeline.length - 1;

                                            let tagBg = "#f1f5f9";
                                            let tagColor = "#475569";
                                            if (st.role === "Seller") { tagBg = "#fef3c7"; tagColor = "#92400e"; }
                                            else if (st.role === "Logistics") { tagBg = "#dbeafe"; tagColor = "#1e40af"; }
                                            else if (st.role === "Buyer") { tagBg = "#dcfce7"; tagColor = "#166534"; }

                                            return (
                                                <div key={st.id || idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '24px' }}>
                                                        <div style={{
                                                            width: '24px', height: '24px', borderRadius: '50%',
                                                            backgroundColor: st.status === 'completed' ? '#22c55e' : (st.status === 'in_progress' ? '#2563eb' : '#ffffff'),
                                                            border: '2px solid',
                                                            borderColor: st.status === 'completed' ? '#22c55e' : (st.status === 'in_progress' ? '#2563eb' : '#cbd5e1'),
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                        }}>
                                                            {st.status === 'completed' && <Check size={12} color="#ffffff" />}
                                                            {st.status === 'in_progress' && <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ffffff' }} />}
                                                        </div>
                                                        {!isLast && <div style={{ width: '2px', height: '32px', backgroundColor: st.status === 'completed' ? '#22c55e' : '#e2e8f0', margin: '4px 0' }} />}
                                                    </div>

                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                            <span style={{ fontWeight: 600, fontSize: '14px', color: st.status === 'pending' ? '#94a3b8' : '#1e293b' }}>
                                                                {st.title}
                                                            </span>
                                                            <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px', backgroundColor: tagBg, color: tagColor }}>
                                                                {st.role}
                                                            </span>
                                                        </div>
                                                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                                                            {st.desc} {st.date && `· ${st.date}`}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div style={{ marginTop: '24px' }}>
                                        <button
                                            style={styles.primaryBtn}
                                            onClick={() => setIsConcernModalOpen(true)}
                                        >
                                            <AlertTriangle size={16} /> Raise a concern
                                        </button>
                                    </div>
                                </div>

                                <div style={{ ...styles.card, marginTop: '20px', padding: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: '#1e293b' }}>Raised Concerns</h3>
                                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>{concerns.length} total</span>
                                    </div>

                                    {concerns.length === 0 ? (
                                        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>No active concerns logged for this shipment.</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            {concerns.map((c) => (
                                                <div key={c.id} style={{ backgroundColor: '#fff5f5', border: '1px solid #fecaca', padding: '12px', borderRadius: '6px' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <AlertTriangle size={14} /> Reported Concern ({c.date})
                                                        </span>
                                                        <span style={styles.pillBadge}>{c.status || 'Open'}</span>
                                                    </div>
                                                    <div style={{ fontSize: '13px', color: '#334155' }}>{c.text}</div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })()}

{/* BUYER & SELLER VERIFICATION TABS (REAL API DATA, CONDITIONAL DOC VISIBILITY & NOTIFY BELL POPUP) */}
{(activeTab === 'Buyer Verification' || activeTab === 'Seller Verification') && (
    <div>
        {(() => {
            const entityType = activeTab === 'Buyer Verification' ? 'Buyer' : 'Supplier';
            const currentSubTab = activeTab === 'Buyer Verification' ? buyerSubTab : sellerSubTab;
            const setSubTab = activeTab === 'Buyer Verification' ? setBuyerSubTab : setSellerSubTab;

            // Safe fallback state handlers
            const activePreview = typeof selectedDocPreview !== 'undefined' ? selectedDocPreview : null;
            const setPreview = typeof setSelectedDocPreview === 'function' ? setSelectedDocPreview : () => {};
            
            const activeNotifyModal = typeof notifyModalEntity !== 'undefined' ? notifyModalEntity : null;
            const setNotifyModal = typeof setNotifyModalEntity === 'function' ? setNotifyModalEntity : () => {};

            // 1. GROUP REAL API DOCUMENTS BY USER / ENTITY ID
            const groupedEntitiesMap = new Map();

            (verifications || []).forEach((doc) => {
                const docRoleCategory = (doc.roleCategory || doc.userRole || doc.type || '').toLowerCase();
                const isTargetType = entityType === 'Buyer'
                    ? (docRoleCategory.includes('buyer') || docRoleCategory === 'buyers')
                    : (docRoleCategory.includes('supplier') || docRoleCategory.includes('seller') || docRoleCategory === 'suppliers');

                if (!isTargetType) return;

                const uId = doc.userId || doc.userName || 'unknown-user';

                if (!groupedEntitiesMap.has(uId)) {
                    groupedEntitiesMap.set(uId, {
                        userId: uId,
                        userName: doc.userName || doc.user || 'Global Enterprise',
                        userRole: doc.userRole || entityType.toUpperCase(),
                        country: doc.country || 'Global',
                        submittedAt: doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : new Date().toLocaleDateString(),
                        // Default status stays Pending for Approval until Admin manually alters it
                        status: doc.status || 'Pending for Approval',
                        docs: [],
                        missingDocs: [] // computed for real once every doc is collected (see roll-up below)
                    });
                }

                const entity = groupedEntitiesMap.get(uId);
                const docStatusUpper = (doc.status || '').toUpperCase();

                // Append real uploaded documents fetched from backend API
                if (doc.fileName || doc.originalName) {
                    const exists = entity.docs.some(d => (d.id && d.id === doc.id) || d.fileName === doc.fileName);
                    if (!exists) {
                        // Construct file path respecting folder structure (e.g., uploads/buyers/buy_.../file.pdf)
                        const folderPath = doc.folderName ? `${doc.folderName}/` : '';
                        const docUrl = doc.url || doc.filePath || `/uploads/${docRoleCategory.includes('buyer') ? 'buyers' : 'suppliers'}/${folderPath}${doc.fileName}`;

                        entity.docs.push({
                            id: doc.id || doc.fileName,
                            name: doc.documentType || doc.originalName || doc.fileName,
                            fileName: doc.fileName,
                            url: docUrl,
                            // The requirement each upload satisfies — 'fieldName' comes from
                            // onboarding-time credential JSON, 'documentType' from the separate
                            // compliance-upload endpoint. Neither is guaranteed present (e.g.
                            // legacy/garbage records), hence the null fallback below.
                            fieldId: doc.fieldName || doc.documentType || null,
                            verified: docStatusUpper === 'VERIFIED' || docStatusUpper === 'APPROVED',
                            status: docStatusUpper
                        });
                    }
                }
            });

            const aggregatedEntities = Array.from(groupedEntitiesMap.values());

            // 1b. PER-ENTITY MISSING-DOCS + STATUS ROLL-UP. Now that every
            // uploaded document for each entity has been collected, figure
            // out which of the ACTUAL onboarding-required documents (per
            // role, and per Producer/Trader schema for suppliers) were never
            // uploaded at all, and derive the entity's overall status from
            // both that and each document's real approval state — instead of
            // a hardcoded placeholder list and "last document wins".
            // "Complete" now means every required document was both
            // submitted AND approved, not just that whatever happened to be
            // uploaded got approved.
            aggregatedEntities.forEach((entity) => {
                const uploadedFieldIds = entity.docs.map(d => d.fieldId).filter(Boolean);
                const requiredList = inferRequiredDocsList(entity.userRole, uploadedFieldIds);

                if (requiredList) {
                    entity.missingDocs = requiredList
                        .filter(req => !uploadedFieldIds.includes(req.id))
                        .map(req => req.label);
                } else {
                    // Unknown/legacy schema (e.g. test data with no recognizable
                    // field IDs) — nothing meaningful to check against, so don't
                    // claim documents are missing when we can't actually tell.
                    entity.missingDocs = [];
                }

                if (entity.docs.length === 0) return; // keep default (Pending for Approval)

                const allApproved = entity.docs.every(
                    (d) => d.status === 'APPROVED' || d.status === 'VERIFIED'
                );
                const anyRejected = entity.docs.some((d) => d.status === 'REJECTED');
                const nothingMissing = entity.missingDocs.length === 0;

                if (allApproved && nothingMissing) {
                    entity.status = 'Complete';
                } else if (anyRejected) {
                    entity.status = 'Rejected';
                } else {
                    entity.status = 'Pending for Approval';
                }
            });

            // 2. SUB-TAB FILTERING (Pending for Approval vs Approved vs Rejected)
            const filteredEntities = aggregatedEntities.filter(item => {
                if (currentSubTab === 'All') return true;
                
                const itemStatus = (item.status || '').toLowerCase().trim();
                const selectedSubTab = currentSubTab.toLowerCase().trim();

                if (selectedSubTab.includes('pending')) {
                    return itemStatus.includes('pending') || itemStatus.includes('verification');
                }
                if (selectedSubTab === 'approved') {
                    return itemStatus === 'approved' || itemStatus === 'verified' || itemStatus === 'complete';
                }
                if (selectedSubTab === 'rejected') {
                    return itemStatus === 'rejected';
                }

                return itemStatus === selectedSubTab;
            });

            // Metric Calculations
            const totalCount = aggregatedEntities.length;
            const pendingCount = aggregatedEntities.filter(v => {
                const st = (v.status || '').toLowerCase();
                return st.includes('pending') || st.includes('verification');
            }).length;
            const approvedCount = aggregatedEntities.filter(v => ['approved', 'verified', 'complete'].includes((v.status || '').toLowerCase())).length;

            // Notification Trigger
            const handleSendMissingDocsEmail = async (entity) => {
                try {
                    const response = await fetch('/api/v1/verification/notify-missing', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: entity.userId,
                            userName: entity.userName,
                            entityType: entityType,
                            missingDocuments: entity.missingDocs
                        })
                    });
            
                    if (response.ok) {
                        alert(`📧 Notification email successfully sent to ${entity.userName}!`);
                    } else {
                        const errData = await response.json().catch(() => ({}));
                        alert(`⚠️ Failed to send notification: ${errData.message || 'Server error (' + response.status + ')'}`);
                    }
                } catch (err) {
                    alert(`❌ Network error while attempting to send notification to ${entity.userName}.`);
                }
            };

            // Check if current subtab allows displaying uploaded documents
            const showUploadedDocs = currentSubTab === 'All' || currentSubTab === 'Pending for Approval';

            return (
                <div>
                    <div style={{ marginBottom: '20px' }}>
                        <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>{activeTab} Management</h1>
                        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                            Filter: <b>{currentSubTab}</b> | Live API verification stream. Uploaded documents are visible only under 'All' and 'Pending for Approval'.
                        </p>
                    </div>

                    {/* Sub-Tab Navigation Header */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        {['All', 'Pending for Approval', 'Approved', 'Rejected'].map((subTab) => (
                            <button
                                key={subTab}
                                onClick={() => setSubTab(subTab)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '6px',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    border: '1px solid #cbd5e1',
                                    backgroundColor: currentSubTab === subTab ? '#1e293b' : '#ffffff',
                                    color: currentSubTab === subTab ? '#ffffff' : '#475569',
                                    cursor: 'pointer'
                                }}
                            >
                                {subTab}
                            </button>
                        ))}
                    </div>

                    <div style={styles.grid3}>
                        <MetricCard title={`Total Registered ${entityType}s`} value={totalCount.toString()} />
                        <MetricCard title="Pending for Approval" value={pendingCount.toString()} />
                        <MetricCard title="Approved Entities" value={approvedCount.toString()} />
                    </div>

                    {/* Verification Records Table */}
                    <div style={{ ...styles.card, marginTop: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
                                {entityType} Verification Stream ({currentSubTab})
                            </h3>
                            <span style={styles.pillBadge}>{filteredEntities.length} Entities Synchronized</span>
                        </div>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>COMPANY NAME</th>
                                    <th style={styles.th}>SUBMITTED DATE</th>
                                    <th style={styles.th}>PRESENT UPLOADED DOCUMENTS</th>
                                    <th style={styles.th}>MISSING REQUIRED DOCUMENTS</th>
                                    <th style={styles.th}>STATUS</th>
                                    <th style={styles.th}>ACTIONS & NOTIFY</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEntities.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '28px', color: '#64748b' }}>
                                            No verification records currently available for <b>{entityType}s</b> under <b>{currentSubTab}</b>.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEntities.map((entity) => (
                                        <tr key={`entity-row-${entity.userId}`}>
                                            <td style={styles.td}>
                                                <b>{entity.userName}</b>
                                                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                                                    ID: {entity.userId} ({entity.country})
                                                </div>
                                            </td>
                                            <td style={styles.td}>{entity.submittedAt}</td>

                                            {/* PRESENT UPLOADED DOCUMENTS: VISIBLE ONLY IN 'ALL' & 'PENDING FOR APPROVAL' */}
                                            <td style={styles.td}>
                                                {!showUploadedDocs ? (
                                                    <span style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>
                                                        Hidden in {currentSubTab} tab
                                                    </span>
                                                ) : entity.docs.length === 0 ? (
                                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>None uploaded</span>
                                                ) : (
                                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                        {entity.docs.map((d, i) => {
                                                            const isApproved = d.status === 'APPROVED' || d.status === 'VERIFIED';
                                                            const isRejected = d.status === 'REJECTED';
                                                            const bg = isApproved ? '#f0fdf4' : isRejected ? '#fef2f2' : '#fffbeb';
                                                            const border = isApproved ? '#bbf7d0' : isRejected ? '#fecaca' : '#fde68a';
                                                            const fg = isApproved ? '#166534' : isRejected ? '#991b1b' : '#92400e';
                                                            const label = isApproved ? '✓ Approved' : isRejected ? '✕ Rejected' : '⚠️ Pending';

                                                            return (
                                                                <div
                                                                    key={`doc-${entity.userId}-${i}`}
                                                                    style={{
                                                                        backgroundColor: bg,
                                                                        borderColor: border,
                                                                        color: fg,
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        gap: '4px',
                                                                        padding: '3px 6px',
                                                                        borderRadius: '4px',
                                                                        fontSize: '12px',
                                                                        border: '1px solid',
                                                                        fontWeight: 500
                                                                    }}
                                                                >
                                                                    <span
                                                                        onClick={() => setPreview(d)}
                                                                        title="Click to open iFrame document preview"
                                                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                                                                    >
                                                                        <FileText size={12} />
                                                                        {d.name}
                                                                        <span style={{ fontSize: '10px', fontWeight: 'bold', marginLeft: '2px' }}>
                                                                            {label}
                                                                        </span>
                                                                        <Eye size={12} style={{ marginLeft: '2px' }} />
                                                                    </span>

                                                                    <button
                                                                        onClick={() => handleUpdateSingleDocStatus(d, entity, 'Approved')}
                                                                        title="Approve this document"
                                                                        disabled={isApproved}
                                                                        style={{
                                                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                                            width: '18px', height: '18px', borderRadius: '3px',
                                                                            border: '1px solid #bbf7d0', backgroundColor: isApproved ? '#dcfce7' : '#ffffff',
                                                                            color: '#166534', cursor: isApproved ? 'default' : 'pointer', padding: 0
                                                                        }}
                                                                    >
                                                                        <Check size={11} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => {
                                                                            const reason = promptRejectRemarks(d.name);
                                                                            if (reason === null) return;
                                                                            handleUpdateSingleDocStatus(d, entity, 'Rejected', reason);
                                                                        }}
                                                                        title="Reject this document"
                                                                        disabled={isRejected}
                                                                        style={{
                                                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                                            width: '18px', height: '18px', borderRadius: '3px',
                                                                            border: '1px solid #fecaca', backgroundColor: isRejected ? '#fee2e2' : '#ffffff',
                                                                            color: '#991b1b', cursor: isRejected ? 'default' : 'pointer', padding: 0
                                                                        }}
                                                                    >
                                                                        <X size={11} />
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Missing Documents Column */}
                                            <td style={styles.td}>
                                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                    {entity.missingDocs.length === 0 ? (
                                                        <span style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>
                                                            ✓ All required documents present
                                                        </span>
                                                    ) : (
                                                        entity.missingDocs.map((mDoc, idx) => (
                                                            <span
                                                                key={`missing-${entity.userId}-${idx}`}
                                                                style={{
                                                                    backgroundColor: '#fef2f2',
                                                                    color: '#991b1b',
                                                                    border: '1px solid #fecaca',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    padding: '2px 8px',
                                                                    borderRadius: '4px',
                                                                    fontSize: '11px',
                                                                    fontWeight: 500
                                                                }}
                                                            >
                                                                <X size={12} color="#dc2626" />
                                                                {mDoc}
                                                            </span>
                                                        ))
                                                    )}
                                                </div>
                                            </td>

                                            <td style={styles.td}>
                                                <StatusBadge status={entity.status} />
                                            </td>

                                            {/* Actions & Bell Icon. Three cases:
                                                1) Fully Complete (all required docs uploaded AND approved) —
                                                   terminal state, nothing to act on, just show Approved + a
                                                   Verified badge. No Reject here; once every document is
                                                   individually verified there's nothing left to reject.
                                                2) Not complete, viewed from 'All' or 'Pending for Approval' —
                                                   the only tabs where new decisions are actually being made —
                                                   show the full Bell (if something's missing) + Approve/Reject
                                                   controls.
                                                3) Not complete, viewed from 'Approved' or 'Rejected' — those
                                                   tabs are historical views, not a workspace for new actions. */}
                                            <td style={styles.td}>
                                                {entity.status === 'Complete' ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>
                                                            Approved
                                                        </span>
                                                        <span style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            gap: '4px',
                                                            backgroundColor: '#dcfce7',
                                                            color: '#166534',
                                                            border: '1px solid #bbf7d0',
                                                            borderRadius: '12px',
                                                            padding: '3px 10px',
                                                            fontSize: '11px',
                                                            fontWeight: 700
                                                        }}>
                                                            <CheckCircle size={12} />
                                                            Verified
                                                        </span>
                                                    </div>
                                                ) : (currentSubTab === 'All' || currentSubTab === 'Pending for Approval') ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        {entity.missingDocs.length > 0 && (
                                                            <button
                                                                onClick={() => setNotifyModal(entity)}
                                                                title="Click to view missing/unverified documents popup & send notification"
                                                                style={{
                                                                    position: 'relative',
                                                                    padding: '6px 10px',
                                                                    borderRadius: '6px',
                                                                    backgroundColor: '#fef3c7',
                                                                    border: '1px solid #fcd34d',
                                                                    color: '#b45309',
                                                                    cursor: 'pointer',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                }}
                                                            >
                                                                <Bell size={15} />
                                                                <span style={{
                                                                    backgroundColor: '#dc2626',
                                                                    color: '#ffffff',
                                                                    borderRadius: '50%',
                                                                    width: '16px',
                                                                    height: '16px',
                                                                    fontSize: '10px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontWeight: 'bold'
                                                                }}>
                                                                    {entity.missingDocs.length}
                                                                </span>
                                                            </button>
                                                        )}

                                                        <select
                                                            defaultValue=""
                                                            onChange={(e) => {
                                                                const action = e.target.value;
                                                                if (action === 'approve') {
                                                                    handleUpdateStatus(entity, 'Approved');
                                                                } else if (action === 'reject') {
                                                                    const reason = promptRejectRemarks(entity.userName);
                                                                    if (reason !== null) {
                                                                        handleUpdateStatus(entity, 'Rejected', reason);
                                                                    }
                                                                }
                                                                e.target.value = "";
                                                            }}
                                                            style={{
                                                                padding: '6px 10px',
                                                                borderRadius: '6px',
                                                                fontSize: '12px',
                                                                fontWeight: '600',
                                                                border: '1px solid #cbd5e1',
                                                                backgroundColor: '#ffffff',
                                                                cursor: 'pointer',
                                                                color: '#334155'
                                                            }}
                                                        >
                                                            <option value="" disabled>Select Action...</option>
                                                            <option value="approve" style={{ color: '#166534', fontWeight: '600' }}>
                                                                ✓ Approve Entity
                                                            </option>
                                                            <option value="reject" style={{ color: '#dc2626', fontWeight: '600' }}>
                                                                ✕ Reject (remarks required)
                                                            </option>
                                                        </select>
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>
                                                        No actions in {currentSubTab} tab
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* POPUP MODAL 1: MISSING & UNVERIFIED DOCUMENTS NOTIFICATION POPUP */}
                    {activeNotifyModal && (
                        <div style={{
                            position: 'fixed',
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(15, 23, 42, 0.75)',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            zIndex: 9999
                        }}>
                            <div style={{
                                backgroundColor: '#ffffff',
                                borderRadius: '12px',
                                width: '520px',
                                padding: '24px',
                                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Bell color="#d97706" size={20} /> Verification Audit: {activeNotifyModal.userName}
                                    </h3>
                                    <button
                                        onClick={() => setNotifyModal(null)}
                                        style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', color: '#64748b' }}
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <h4 style={{ fontSize: '13px', color: '#475569', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                                        Uploaded Documents ({activeNotifyModal.docs.length})
                                    </h4>
                                    {activeNotifyModal.docs.length === 0 ? (
                                        <p style={{ fontSize: '13px', color: '#94a3b8' }}>No documents uploaded yet.</p>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {activeNotifyModal.docs.map((doc, idx) => (
                                                <div key={idx} style={{
                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                    padding: '8px 12px', backgroundColor: doc.verified ? '#f0fdf4' : '#fffbeb',
                                                    border: `1px solid ${doc.verified ? '#bbf7d0' : '#fef3c7'}`, borderRadius: '6px', fontSize: '13px'
                                                }}>
                                                    <span style={{ fontWeight: 500, color: '#1e293b' }}>{doc.name}</span>
                                                    <span style={{ fontSize: '11px', fontWeight: 600, color: doc.verified ? '#166534' : '#b45309' }}>
                                                        {doc.verified ? '✓ Auto-Verified' : '⚠️ Pending Verification'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <h4 style={{ fontSize: '13px', color: '#dc2626', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                                        Missing Required Documents ({activeNotifyModal.missingDocs.length})
                                    </h4>
                                    {activeNotifyModal.missingDocs.length === 0 ? (
                                        <div style={{ padding: '10px', backgroundColor: '#f0fdf4', color: '#166534', borderRadius: '6px', fontSize: '13px', fontWeight: 600 }}>
                                            ✓ All compliance documents have been submitted!
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {activeNotifyModal.missingDocs.map((mDoc, idx) => (
                                                <div key={idx} style={{
                                                    display: 'flex', alignItems: 'center', gap: '8px',
                                                    padding: '8px 12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px',
                                                    color: '#991b1b', fontSize: '13px', fontWeight: 500
                                                }}>
                                                    <X size={14} color="#dc2626" />
                                                    {mDoc}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                                    <button
                                        onClick={() => setNotifyModal(null)}
                                        style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#475569', fontSize: '13px', cursor: 'pointer' }}
                                    >
                                        Close
                                    </button>
                                    {activeNotifyModal.missingDocs.length > 0 && (
                                        <button
                                            onClick={() => {
                                                handleSendMissingDocsEmail(activeNotifyModal);
                                                setNotifyModal(null);
                                            }}
                                            style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', backgroundColor: '#d97706', color: '#ffffff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                                        >
                                            ✉️ Send Missing Docs Email Notification
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* POPUP MODAL 2: IFRAME DOCUMENT PREVIEW MODAL */}
                    {activePreview && (
                        <div style={{
                            position: 'fixed',
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(15, 23, 42, 0.75)',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            zIndex: 9999
                        }}>
                            <div style={{
                                backgroundColor: '#ffffff', borderRadius: '12px', width: '80%', height: '85%',
                                display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                            }}>
                                <div style={{
                                    padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex',
                                    justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc'
                                }}>
                                    <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>
                                        📄 Document Preview: {activePreview.name}
                                    </h3>
                                    <button
                                        onClick={() => setPreview(null)}
                                        style={{ border: 'none', backgroundColor: '#cbd5e1', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        ✕
                                    </button>
                                </div>
                                <div style={{ flex: 1, backgroundColor: '#525659' }}>
                                    <iframe
                                        src={activePreview.url}
                                        title="Document Viewer"
                                        style={{ width: '100%', height: '100%', border: 'none' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        })()}
    </div>
)}
                    {/* 6. FINANCE TAB */}
                    {activeTab === 'Finance' && (
                        <div>
                            <div style={{ marginBottom: '20px' }}>
                                <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>Financial Overview & Escrow Vault</h1>
                                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Monitor trade settlements, escrow balances, and platform disbursements between Buyers and Sellers.</p>
                            </div>

                            <div style={styles.grid3}>
                                <MetricCard title="Total Volume Settled" value={formatCurrency(completedTotalValue)} icon={<Wallet color="#16a34a" />} />
                                <MetricCard title="Active Escrow Balance" value={formatCurrency(activeEscrowValue)} icon={<CreditCard color="#d97706" />} />
                                <MetricCard title="Platform Fees Collected (2%)" value={formatCurrency(grandTotalValue * 0.02)} icon={<DollarSign color="#2563eb" />} />
                            </div>

                            <div style={{ ...styles.card, marginTop: '20px' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '15px' }}>Escrow Ledger Accounts</h3>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>ORDER ID</th>
                                            <th style={styles.th}>BUYER</th>
                                            <th style={styles.th}>SELLER</th>
                                            <th style={styles.th}>ESCROW AMOUNT</th>
                                            <th style={styles.th}>STATUS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map(ord => (
                                            <tr key={ord.id}>
                                                <td style={styles.td}><b>{ord.id}</b></td>
                                                <td style={styles.td}>{ord.buyer}</td>
                                                <td style={styles.td}>{ord.seller}</td>
                                                <td style={styles.td}><b>{ord.value}</b></td>
                                                <td style={styles.td}>
                                                    {ord.status === 'Completed' ? (
                                                        <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '12px' }}>Disbursed to Seller</span>
                                                    ) : (
                                                        <span style={{ color: '#d97706', fontWeight: 600, fontSize: '12px' }}>Held in Escrow</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </main>
            </div>

            {/* ================= MODAL: RAISE A CONCERN ================= */}
            {isConcernModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalCard}>
                        <div style={styles.modalHeader}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Raise a concern</h3>
                            <button style={styles.closeBtn} onClick={() => setIsConcernModalOpen(false)}>
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{ ...styles.modalBody, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                                    Shipment
                                </label>
                                <input
                                    type="text"
                                    value={selectedTrackingOrder || ''}
                                    disabled
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid #cbd5e1',
                                        backgroundColor: '#f8fafc',
                                        color: '#334155',
                                        fontSize: '13px',
                                        fontWeight: 600
                                    }}
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                                    Reason
                                </label>
                                <select
                                    value={concernReason}
                                    onChange={(e) => setConcernReason(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        borderRadius: '6px',
                                        border: '1px solid #cbd5e1',
                                        backgroundColor: '#ffffff',
                                        fontSize: '13px',
                                        color: '#0f172a',
                                        outline: 'none'
                                    }}
                                >
                                    <option value="Delay">Delay</option>
                                    <option value="Damaged Goods">Damaged Goods</option>
                                    <option value="Documentation Error">Documentation Error</option>
                                    <option value="Customs Hold">Customs Hold</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                                    Details
                                </label>
                                <textarea
                                    rows="3"
                                    placeholder="Describe what's happening..."
                                    value={concernText}
                                    onChange={(e) => setConcernText(e.target.value)}
                                    style={styles.modalTextarea}
                                />
                            </div>
                        </div>

                        <div style={styles.modalFooter}>
                            <button style={styles.btnSecondary} onClick={() => setIsConcernModalOpen(false)}>
                                Cancel
                            </button>
                            <button style={styles.btnPrimaryBlue} onClick={handleRaiseConcern}>
                                Submit to logistics
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= MODAL: CONTACT LOGISTICS ================= */}
            {isContactLogisticsOpen && currentActiveOrderData && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalCard}>
                        <div style={styles.modalHeader}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Contact Carrier / Logistics Provider</h3>
                            <button style={styles.closeBtn} onClick={() => setIsContactLogisticsOpen(false)}><X size={18} /></button>
                        </div>
                        <div style={styles.modalBody}>
                            <p style={{ fontSize: '13px', color: '#64748b', marginTop: 0 }}>
                                Direct inquiry to carrier assigned to <b>{currentActiveOrderData.id}</b> ({currentActiveOrderData.carrier}).
                            </p>
                            <textarea
                                rows="4"
                                placeholder="Ask for updated ETA, container position, or customs release status..."
                                value={logisticsMessage}
                                onChange={(e) => setLogisticsMessage(e.target.value)}
                                style={styles.modalTextarea}
                            />
                        </div>
                        <div style={styles.modalFooter}>
                            <button style={styles.btnSecondary} onClick={() => setIsContactLogisticsOpen(false)}>Cancel</button>
                            <button style={styles.btnPrimaryBlue} onClick={handleContactLogisticsSubmit}>Send Message</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= MODAL: MISSING DOCUMENTS AUTOMATED EMAIL ================= */}
            {selectedItem && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalCard}>
                        <div style={styles.modalHeader}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Request Missing Information</h3>
                            <button style={styles.closeBtn} onClick={() => setSelectedItem(null)}><X size={18} /></button>
                        </div>

                        <div style={styles.modalBody}>
                            <p style={{ fontSize: '13px', color: '#64748b', marginTop: 0 }}>
                                Select missing documents for <b>{selectedItem.name}</b>. An automated notification email will be sent to request re-submission.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                                {REQUIRED_DOC_OPTIONS.map((doc, idx) => {
                                    const isChecked = missingDocs.includes(doc);
                                    return (
                                        <label key={idx} style={styles.checkboxLabel}>
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => handleToggleDoc(doc)}
                                            />
                                            <span style={{ fontSize: '13px', color: '#334155' }}>{doc}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={styles.modalFooter}>
                            <button style={styles.btnSecondary} onClick={() => setSelectedItem(null)}>Cancel</button>
                            <button style={styles.btnPrimaryBlue} onClick={handleSendAutomatedEmail}>
                                <Mail size={15} /> Send Automated Request
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

// ============================================================================
// 4. REUSABLE UI SUB-COMPONENTS & STYLES (RETAINED)
// ============================================================================

function MetricCard({ title, value, trend, isUp, icon }) {
    return (
        <div style={styles.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>{title}</span>
                {icon && <div>{icon}</div>}
            </div>
            <div style={{ fontSize: '22px', fontWeight: 700, margin: '10px 0 4px 0', color: '#0f172a' }}>{value}</div>
            {trend && (
                <div style={{ fontSize: '12px', fontWeight: 600, color: isUp ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {trend} vs last month
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }) {
    let bg = '#f1f5f9';
    let color = '#475569';

    if (status === 'Complete') {
        bg = '#166534'; color = '#ffffff';
    } else if (status === 'Approved' || status === 'Completed' || status === 'Solved') {
        bg = '#dcfce7'; color = '#166534';
    } else if (status === 'Pending for Approval' || status === 'Pending' || status === 'Processing' || status === 'Ready to Ship') {
        bg = '#fef3c7'; color = '#92400e';
    } else if (status === 'Rejected' || status === 'Unsolved') {
        bg = '#fee2e2'; color = '#991b1b';
    } else if (status === 'In-Transit' || status === 'Reopened' || status === 'Confirmed') {
        bg = '#dbeafe'; color = '#1e40af';
    }

    return (
        <span style={{
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 600,
            backgroundColor: bg,
            color: color,
            display: 'inline-block'
        }}>
            {status}
        </span>
    );
}

const styles = {
    appWrapper: { display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif', color: '#0f172a', overflow: 'hidden' },
    sidebar: { width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', height: '100%' },
    sidebarBrand: { padding: '20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #f1f5f9' },
    brandName: { fontWeight: 700, fontSize: '16px', color: '#0f172a' },
    brandSub: { fontSize: '11px', color: '#64748b' },
    sidebarNav: { flex: 1, padding: '12px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' },
    sidebarItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textAlign: 'left', width: '100%' },
    sidebarItemActive: { backgroundColor: '#eff6ff', color: '#2563eb' },
    sidebarSubMenu: { display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '24px', margin: '4px 0' },
    sidebarSubItem: { display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: 'transparent', color: '#64748b', fontSize: '12px', cursor: 'pointer', textAlign: 'left' },
    sidebarSubItemActive: { color: '#2563eb', fontWeight: 600 },
    sidebarSubDot: { width: '6px', height: '6px', borderRadius: '50%' },
    sidebarFooter: { padding: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' },
    adminAvatar: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 },
    mainContainer: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    header: { height: '64px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' },
    headerSearch: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', padding: '8px 12px', borderRadius: '8px', width: '320px' },
    searchInput: { border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', width: '100%' },
    headerActions: { display: 'flex', alignItems: 'center', gap: '16px' },
    bellBtn: { background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '4px' },
    bellBadge: { position: 'absolute', top: '0', right: '0', backgroundColor: '#ef4444', color: '#fff', fontSize: '10px', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 },
    statusBadgeGlobal: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f0fdf4', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 },
    liveDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' },
    mainContent: { flex: 1, padding: '24px', overflowY: 'auto' },
    card: { backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' },
    grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' },
    grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
    grid2: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' },
    pillBadge: { backgroundColor: '#f1f5f9', color: '#475569', fontSize: '11px', fontWeight: 600, padding: '4px 8px', borderRadius: '12px' },
    chip: { backgroundColor: '#f1f5f9', color: '#475569', fontSize: '12px', padding: '4px 10px', borderRadius: '6px' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' },
    th: { padding: '10px 12px', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' },
    td: { padding: '12px', borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle' },
    docChip: { display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', marginRight: '6px', marginTop: '4px' },
    btnActionTransit: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' },
    btnActionReady: { backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' },
    btnActionProcessing: { backgroundColor: '#d97706', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' },
    btnActionComplete: { backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' },
    btnPrimaryBlue: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' },
    btnSecondary: { backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' },
    primaryBtn: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' },
    secondaryBtn: { backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' },
    selectInput: { borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#1e293b', outline: 'none' },
    notificationDropdown: { position: 'absolute', right: 0, top: '35px', width: '300px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 100 },
    notifHeader: { display: 'flex', justifyContent: 'space-between', padding: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '13px' },
    clearNotif: { color: '#2563eb', cursor: 'pointer', fontSize: '12px' },
    notifRow: { padding: '10px 12px', fontSize: '12px', borderBottom: '1px solid #f8fafc', display: 'flex', alignItems: 'center', gap: '8px' },
    notifDot: { width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#2563eb' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalCard: { backgroundColor: '#ffffff', borderRadius: '12px', width: '480px', maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden' },
    modalHeader: { padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' },
    modalBody: { padding: '20px' },
    modalTextarea: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13px', fontFamily: 'inherit', boxSizing: 'border-box' },
    checkboxLabel: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' },
    modalFooter: { padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', backgroundColor: '#f8fafc' },
    toast: { position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#0f172a', color: '#ffffff', padding: '12px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 500, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)', zIndex: 2000 }
};