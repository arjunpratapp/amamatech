import React, { useState } from 'react';
import {
    Bell, CheckCircle, FileText,
    Search, ShieldAlert, ShoppingCart,
    Users, Building2, Wallet, X, Mail, Check,
    ChevronRight, ChevronDown, TrendingUp, DollarSign, LayoutDashboard,
    CreditCard, ArrowUpRight, ArrowDownRight, Truck, PackageCheck, Clock,
    ArrowRight, AlertTriangle
} from 'lucide-react';

// Freight sub-tabs under "Tracking & Logistics" — used to filter orders by mode
const FREIGHT_TABS = ["Ocean Freight", "Air Freight", "Trucking", "Booking Management", "Buyer's Consolidation"];

// --- MOCK DATA WITH DYNAMIC TIMELINE DATA PER ORDER ---
const INITIAL_VERIFICATIONS = [
    { id: 1, name: "Meridian Textiles", type: "Supplier", country: "PK", submitted: "2026-07-27", status: "Approved", docs: ["Business License", "Tax Certificate"] },
    { id: 2, name: "Northfield Grain Co.", type: "Buyer", country: "NL", submitted: "2026-07-28", status: "Pending for Approval", docs: ["KYC Document", "Proof of Address"] },
    { id: 3, name: "Vantage Cold Chain", type: "Supplier", country: "IN", submitted: "2026-07-28", status: "Pending for Approval", docs: ["GST Registration", "ISO Certificate"] },
    { id: 4, name: "Delta Foods Ltd.", type: "Buyer", country: "AE", submitted: "2026-07-25", Remarks : "", docs: ["Trade License (Expired)"] },
    { id: 5, name: "Osaka Machine Parts", type: "Supplier", country: "JP", submitted: "2026-07-29", status: "Pending for Approval", docs: ["Export Permit"] },
    { id: 6, name: "Global Food Imports", type: "Buyer", country: "US", submitted: "2026-07-20", status: "Approved", docs: ["EIN Certificate", "KYB Form"] }
];

const INITIAL_QUERIES = [
    { id: 101, user: "Northfield Grain Co.", role: "Buyer", issue: "Tax ID document re-upload stuck", status: "Pending" },
    { id: 102, user: "Delta Foods Ltd.", role: "Buyer", issue: "Rejection clarification requested", status: "Reopened" },
    { id: 103, user: "Vantage Cold Chain", role: "Supplier", issue: "Bank details verification delayed", status: "Unsolved" },
    { id: 104, user: "AgroCorp International", role: "Buyer", issue: "Address mismatch resolved", status: "Solved" }
];

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
        concerns: [{ id: 901, text: "Temperature telemetry sensor alert logged near Taiwan Strait.", date: "Jul 29", status: "Investigating" }]
    },
    {
        id: "ORD-9023",
        buyer: "Global Food Imports",
        seller: "Vantage Cold Chain",
        product: "Refrigerated Agro Produce",
        value: "$88,000",
        status: "Ready to Ship",
        mode: "Ocean Freight",
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
        mode: "Ocean Freight",
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

const parseOrderValue = (valStr) => {
    if (!valStr) return 0;
    return Number(valStr.replace(/[^0-9.-]+/g, ""));
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
};

export default function MasterAdminWorkspace() {
    const [activeTab, setActiveTab] = useState('Overview');

    // SUB-TAB STATES
    const [orderSubTab, setOrderSubTab] = useState('All');
    const [buyerSubTab, setBuyerSubTab] = useState('All');
    const [sellerSubTab, setSellerSubTab] = useState('All');
    const [concernReason, setConcernReason] = useState("Delay");

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

    const [verifications, setVerifications] = useState(INITIAL_VERIFICATIONS);
    const [queries] = useState(INITIAL_QUERIES);
    const [orders, setOrders] = useState(INITIAL_ORDERS);

    // TRACKING & CONCERNS STATE
    const [selectedTrackingOrder, setSelectedTrackingOrder] = useState("ORD-5510");
    const [isConcernModalOpen, setIsConcernModalOpen] = useState(false);
    const [isContactLogisticsOpen, setIsContactLogisticsOpen] = useState(false);
    const [concernText, setConcernText] = useState("");
    const [logisticsMessage, setLogisticsMessage] = useState("");

    // Modals & Notifications
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notifications, setNotifications] = useState([
        "New verification submitted by Osaka Machine Parts",
        "Buyer Northfield Grain Co. uploaded 2 documents",
        "Escrow balance updated for Order #ORD-9022"
    ]);

    const [selectedItem, setSelectedItem] = useState(null);
    const [missingDocs, setMissingDocs] = useState([]);
    const [toastMessage, setToastMessage] = useState(null);

    // Whenever a freight sub-tab is selected, auto-pick the first order that matches that mode
    React.useEffect(() => {
        if (FREIGHT_TABS.includes(activeTab)) {
            const match = orders.find(o => o.mode === activeTab);
            setSelectedTrackingOrder(match ? match.id : null);
        }
    }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

    // DYNAMIC FINANCIAL CALCULATIONS LINKED TO ORDERS
    const completedOrders = orders.filter(o => o.status === 'Completed');
    const activeOrders = orders.filter(o => o.status !== 'Completed');

    const completedTotalValue = completedOrders.reduce((sum, ord) => sum + parseOrderValue(ord.value), 0);
    const activeEscrowValue = activeOrders.reduce((sum, ord) => sum + parseOrderValue(ord.value), 0);
    const grandTotalValue = completedTotalValue + activeEscrowValue;

    const handleProgressOrder = (orderId, nextStatus) => {
        setOrders(prev => prev.map(ord => {
            if (ord.id !== orderId) return ord;

            // Map journey stages to timeline step completion counts
            let completedStepsCount = 1; // Default for 'Confirmed'
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

            // Automatically update timeline step statuses
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

        showToast(`Order ${orderId} moved to stage: ${nextStatus}`);
    };

    const handleUpdateStatus = (id, newStatus) => {
        setVerifications(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
        showToast(`Status updated to ${newStatus}`);
    };

    const handleToggleDoc = (doc) => {
        setMissingDocs(prev => prev.includes(doc) ? prev.filter(d => d !== doc) : [...prev, doc]);
    };

    const handleSendAutomatedEmail = () => {
        if (missingDocs.length === 0) {
            alert("Please select at least one missing document to send.");
            return;
        }
        showToast(`Automated email sent to ${selectedItem.name} detailing missing items.`);
        handleUpdateStatus(selectedItem.id, "Pending for Approval");
        setSelectedItem(null);
        setMissingDocs([]);
    };

    const handleRaiseConcern = () => {
        if (!concernText.trim()) return;
        const newConcern = {
            id: Date.now(),
            reason: concernReason,
            text: concernText,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            status: 'Open'
        };

        setOrders(prev => prev.map(ord => {
            if (ord.id === selectedTrackingOrder) {
                return { ...ord, concerns: [newConcern, ...(ord.concerns || [])] };
            }
            return ord;
        }));

        setConcernText("");
        setConcernReason("Delay");
        setIsConcernModalOpen(false);
        showToast(`Concern raised for ${selectedTrackingOrder}`);
    };

    const handleContactLogisticsSubmit = () => {
        if (!logisticsMessage.trim()) return;
        setLogisticsMessage("");
        setIsContactLogisticsOpen(false);
        showToast("Direct message dispatched to logistics carrier.");
    };

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    const currentActiveOrderData = orders.find(o => o.id === selectedTrackingOrder) || null;

    // SIDEBAR NAVIGATION CONFIGURATION WITH SUBTABS
    const sidebarNavItems = [
        {
            name: 'Overview',
            icon: <LayoutDashboard size={18} />
        },
        {
            name: 'Orders',
            icon: <ShoppingCart size={18} />,
            subTabs: ['All', 'Confirmed', 'In-Transit', 'Ready to Ship', 'Processing', 'Completed'],
            activeSub: orderSubTab,
            setSub: setOrderSubTab
        },
        {
            name: "Tracking & Logistics",
            icon: <Truck size={18} />,
            subTabs: FREIGHT_TABS
            // No activeSub/setSub here on purpose — these sub-items don't have their own
            // filter state, they ARE the tabs. Handled via the fallback branch below.
        },
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
        {
            name: 'Finance',
            icon: <CreditCard size={18} />
        }
    ];

    const filteredOrders = orderSubTab === 'All'
        ? orders
        : orders.filter(o => o.status === orderSubTab);

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
                    Main Menu
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
                                            // Items with their own filter state (Orders, Buyer/Seller Verification)
                                            // highlight via item.activeSub. Items without one (Tracking & Logistics)
                                            // highlight by directly comparing against activeTab.
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
                                                            // No dedicated sub-state (e.g. Tracking & Logistics) —
                                                            // the sub-tab name itself becomes the active tab.
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
                    <div style={styles.adminAvatar}>MA</div>
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '13px' }}>Master Admin</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>admin@trade.com</div>
                    </div>
                </div>
            </aside>

            {/* ================= MAIN WORKSPACE AREA ================= */}
            <div style={styles.mainContainer}>
                {/* TOP HEADER */}
                <header style={styles.header}>
                    <div style={styles.headerSearch}>
                        <Search size={18} color="#94a3b8" />
                        <input
                            type="text"
                            placeholder="Search companies, orders, or trade IDs..."
                            style={styles.searchInput}
                        />
                    </div>

                    <div style={styles.headerActions}>
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
                                <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>Executive Overview</h1>
                                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Real-time analytics, visual trade trends, and verification metrics.</p>
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
                                    Filter: <b>{orderSubTab} Orders</b> | Move order leads through: Confirmed → In-Transit → Ready to Ship → Processing → Completed.
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
                                    <span style={styles.pillBadge}>{filteredOrders.length} Leads Active</span>
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
                                                    No orders currently in <b>{orderSubTab}</b> stage.
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

                    {/* TRACKING & LOGISTICS TAB (and its freight sub-tabs) */}
                    {["Tracking & Logistics", ...FREIGHT_TABS].includes(activeTab) && (() => {

                        // Orders relevant to the active freight mode. On the parent tab, show all orders.
                        const relevantOrders = FREIGHT_TABS.includes(activeTab)
                            ? orders.filter(o => o.mode === activeTab)
                            : orders;

                        // Guard Clause: nothing to show for this mode, or no order selected yet
                        if (!currentActiveOrderData || !relevantOrders.some(o => o.id === currentActiveOrderData.id)) {
                            return (
                                <div>
                                    <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>
                                        {activeTab === 'Tracking & Logistics' ? 'Buyer Tracking' : activeTab}
                                    </h1>
                                    <div style={{ ...styles.card, marginTop: '16px', padding: '24px', color: '#64748b', fontSize: '14px' }}>
                                        No shipments currently in <b>{activeTab}</b>.
                                    </div>
                                </div>
                            );
                        }

                        // Safely derive values
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
                                            {activeTab === 'Tracking & Logistics' ? 'Buyer Tracking' : activeTab}
                                        </h1>
                                        <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Where each order actually is, and a way to flag a problem</p>
                                    </div>
                                    <button
                                        style={styles.secondaryBtn}
                                        onClick={() => setIsContactLogisticsOpen(true)}
                                    >
                                        <Mail size={16} /> Contact logistics
                                    </button>
                                </div>

                                {/* DROPDOWN SELECTOR — scoped to the active freight mode */}
                                <div style={{ marginBottom: '16px' }}>
                                    <select
                                        value={selectedTrackingOrder || ''}
                                        onChange={(e) => setSelectedTrackingOrder(e.target.value)}
                                        style={{ ...styles.selectInput, width: '100%', padding: '10px 12px', fontSize: '14px' }}
                                    >
                                        {relevantOrders.map(o => (
                                            <option key={`tracking-option-${o.id}`} value={o.id}>
                                                {o.id} — {o.buyer} · {o.product} ({o.status})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* DYNAMIC MAIN TRACKING CARD */}
                                <div style={{ ...styles.card, padding: '24px' }}>

                                    {/* STUCK / DELAY CONCERN HIGHLIGHT */}
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
                                                <span><b>Route:</b> {currentActiveOrderData.origin} → {currentActiveOrderData.destination}</span>
                                                <span><b>Carrier:</b> {currentActiveOrderData.carrier}</span>
                                                <span><b>Seller:</b> {currentActiveOrderData.seller}</span>
                                            </div>
                                        </div>
                                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{currentActiveOrderData.product}</span>
                                    </div>

                                    {/* CURRENTLY AT STATUS BANNER */}
                                    <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '20px' }}>
                                        Currently at: <span style={{ color: '#2563eb', fontWeight: 600 }}>{currentActiveOrderData.currentLocation}</span>
                                    </div>

                                    {/* DYNAMIC TIMELINE */}
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

                                    {/* ACTION BUTTON */}
                                    <div style={{ marginTop: '24px' }}>
                                        <button
                                            style={styles.primaryBtn}
                                            onClick={() => setIsConcernModalOpen(true)}
                                        >
                                            <AlertTriangle size={16} /> Raise a concern
                                        </button>
                                    </div>
                                </div>

                                {/* CONCERNS LIST */}
                                <div style={{ ...styles.card, marginTop: '20px', padding: '20px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: '#1e293b' }}>Your concerns</h3>
                                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>{concerns.length} total</span>
                                    </div>

                                    {concerns.length === 0 ? (
                                        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>No concerns raised for this shipment.</p>
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

                    {/* 3 & 4. BUYER & SELLER VERIFICATION TABS */}
                    {(activeTab === 'Buyer Verification' || activeTab === 'Seller Verification') && (
                        <div>
                            {(() => {
                                const entityType = activeTab === 'Buyer Verification' ? 'Buyer' : 'Supplier';
                                const currentSubTab = activeTab === 'Buyer Verification' ? buyerSubTab : sellerSubTab;

                                // Sub-tab view checks
                                const isRejectedSubTab = currentSubTab === 'Rejected';
                                const isApprovedSubTab = currentSubTab === 'Approved';

                                // Base dataset: Ensure state data takes precedence
                                const baseData = verifications && verifications.length > 0 ? verifications : [
                                    {
                                        id: "VER-B-101",
                                        name: "Northfield Grain Co.",
                                        type: "Buyer",
                                        country: "NL",
                                        submitted: "2026-07-28",
                                        status: "Pending for Approval",
                                        docs: [
                                            { name: "KYC Document", verified: true },
                                            { name: "Proof of Address", verified: true }
                                        ],
                                        remarks: ""
                                    },
                                    {
                                        id: "VER-B-102",
                                        name: "Pacific Rim Importers",
                                        type: "Buyer",
                                        country: "Japan",
                                        submitted: "2026-07-25",
                                        status: "Approved",
                                        docs: [
                                            { name: "Corporate ID", verified: true },
                                            { name: "AML Audit", verified: true }
                                        ],
                                        remarks: ""
                                    },
                                    {
                                        id: "VER-B-103",
                                        name: "Global Freight Solutions",
                                        type: "Buyer",
                                        country: "Germany",
                                        submitted: "2026-07-29",
                                        status: "Rejected",
                                        docs: [
                                            { name: "Tax Clearance", verified: false },
                                            { name: "Certificate of Inc.", verified: false }
                                        ],
                                        remarks: "Tax ID is expired and Certificate of Incorporation signature is illegible."
                                    }
                                ];

                                // Filter logic with case-insensitive status matching
                                const filteredData = baseData.filter(item => {
                                    const itemTypeMatches = item.type?.toLowerCase() === entityType.toLowerCase();
                                    if (!itemTypeMatches) return false;

                                    if (currentSubTab === 'All') return true;

                                    // Case-insensitive status match
                                    return item.status?.trim().toLowerCase() === currentSubTab.trim().toLowerCase();
                                });

                                return (
                                    <div>
                                        <div style={{ marginBottom: '20px' }}>
                                            <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>{activeTab} Management</h1>
                                            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
                                                Filter: <b>{currentSubTab}</b> | Review compliance documents, approve/reject requests, and resolve query queues.
                                            </p>
                                        </div>

                                        <div style={styles.grid3}>
                                            <MetricCard
                                                title={`Total Registered ${entityType}s`}
                                                value={baseData.filter(v => v.type?.toLowerCase() === entityType.toLowerCase()).length.toString()}
                                            />
                                            <MetricCard
                                                title="Pending for Approval"
                                                value={baseData.filter(v => v.type?.toLowerCase() === entityType.toLowerCase() && v.status === 'Pending for Approval').length.toString()}
                                            />
                                            <MetricCard
                                                title="Approved Documents"
                                                value={baseData.filter(v => v.type?.toLowerCase() === entityType.toLowerCase() && v.status === 'Approved').length.toString()}
                                            />
                                        </div>

                                        {/* Queries Sub-Queue */}
                                        <div style={{ ...styles.card, marginTop: '20px' }}>
                                            <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{entityType} Queries Sub-Queue</h3>
                                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', marginBottom: '15px' }}>
                                                {['Pending', 'Solved', 'Unsolved', 'Reopened'].map(st => (
                                                    <span key={`query-chip-${st}`} style={styles.chip}>
                                                        {st}: {queries.filter(q => q.status === st).length}
                                                    </span>
                                                ))}
                                            </div>
                                            <table style={styles.table}>
                                                <thead>
                                                    <tr>
                                                        <th style={styles.th}>ENTITY</th>
                                                        <th style={styles.th}>ISSUE DESCRIPTION</th>
                                                        <th style={styles.th}>QUERY STATUS</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {queries.filter(q => q.role.toLowerCase() === entityType.toLowerCase()).map(q => (
                                                        <tr key={`query-row-${q.id}`}>
                                                            <td style={styles.td}><b>{q.user}</b></td>
                                                            <td style={styles.td}>{q.issue}</td>
                                                            <td style={styles.td}><StatusBadge status={q.status} /></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Verification Records Table */}
                                        <div style={{ ...styles.card, marginTop: '20px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>{entityType} Verification Queue ({currentSubTab})</h3>
                                                <span style={styles.pillBadge}>{filteredData.length} Companies</span>
                                            </div>
                                            <table style={styles.table}>
                                                <thead>
                                                    <tr>
                                                        <th style={styles.th}>COMPANY NAME</th>
                                                        <th style={styles.th}>SUBMITTED DATE</th>
                                                        <th style={styles.th}>DOCUMENTS</th>
                                                        <th style={styles.th}>{isRejectedSubTab ? 'REJECTION REMARKS' : 'STATUS'}</th>
                                                        {!isApprovedSubTab && <th style={styles.th}>ACTIONS</th>}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {filteredData.length === 0 ? (
                                                        <tr>
                                                            <td colSpan={isApprovedSubTab ? "4" : "5"} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                                                                No verifications found under <b>{currentSubTab}</b>.
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        filteredData.map(item => {
                                                            const rejectionReason = item.remarks || item.reason || item.rejectionReason;
                                                            const isRejected = item.status === 'Rejected';

                                                            const docsList = item.docs || [];
                                                            const hasPendingDocs = docsList.some(d => typeof d === 'object' ? !d.verified : false);
                                                            const allDocsVerified = docsList.length > 0 && !hasPendingDocs;

                                                            return (
                                                                <tr key={`verif-${item.id}`}>
                                                                    <td style={styles.td}>
                                                                        <b>{item.name}</b>
                                                                        <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '6px' }}>({item.country})</span>
                                                                    </td>
                                                                    <td style={styles.td}>{item.submitted}</td>

                                                                    <td style={styles.td}>
                                                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                                            {docsList.map((d, i) => {
                                                                                const docName = typeof d === 'object' ? d.name : d;
                                                                                const isVerified = typeof d === 'object' ? d.verified : true;

                                                                                return (
                                                                                    <span
                                                                                        key={`doc-${item.id}-${i}`}
                                                                                        style={{
                                                                                            ...styles.docChip,
                                                                                            backgroundColor: isVerified ? '#f0fdf4' : '#fef2f2',
                                                                                            borderColor: isVerified ? '#bbf7d0' : '#fecaca',
                                                                                            color: isVerified ? '#166534' : '#991b1b',
                                                                                            display: 'inline-flex',
                                                                                            alignItems: 'center',
                                                                                            gap: '4px',
                                                                                            padding: '2px 8px',
                                                                                            borderRadius: '4px',
                                                                                            fontSize: '12px'
                                                                                        }}
                                                                                    >
                                                                                        <FileText size={12} />
                                                                                        {docName}
                                                                                        <span style={{ fontSize: '10px', fontWeight: 'bold' }}>
                                                                                            {isVerified ? '✓' : '⚠️ Unverified'}
                                                                                        </span>
                                                                                    </span>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    </td>

                                                                    <td style={styles.td}>
                                                                        {isRejectedSubTab ? (
                                                                            <span style={{
                                                                                fontSize: '12px',
                                                                                color: '#991b1b',
                                                                                backgroundColor: '#fef2f2',
                                                                                border: '1px solid #fecaca',
                                                                                padding: '4px 10px',
                                                                                borderRadius: '6px',
                                                                                display: 'inline-block',
                                                                                fontWeight: 500
                                                                            }}>
                                                                                {rejectionReason || 'Compliance document check failed.'}
                                                                            </span>
                                                                        ) : (
                                                                            <StatusBadge status={item.status} />
                                                                        )}
                                                                    </td>

                                                                    {!isApprovedSubTab && (
                                                                        <td style={styles.td}>
                                                                            <select
                                                                                defaultValue=""
                                                                                onChange={(e) => {
                                                                                    const action = e.target.value;
                                                                                    if (action === 'approve') {
                                                                                        handleUpdateStatus(item.id, 'Approved');
                                                                                    } else if (action === 'reject') {
                                                                                        setSelectedItem(item);
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

                                                                                {allDocsVerified && !isRejected && (
                                                                                    <option value="approve" style={{ color: '#166534', fontWeight: '600' }}>
                                                                                        ✓ Approve Verification
                                                                                    </option>
                                                                                )}

                                                                                <option value="reject" style={{ color: '#dc2626', fontWeight: '600' }}>
                                                                                    ✕ Reject / Request Remarks
                                                                                </option>
                                                                            </select>

                                                                            {hasPendingDocs && !isRejected && (
                                                                                <div style={{ fontSize: '10px', color: '#dc2626', marginTop: '3px' }}>
                                                                                    * Verify all docs to enable approval
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                    )}
                                                                </tr>
                                                            );
                                                        })
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* 5. FINANCE TAB */}
                    {activeTab === 'Finance' && (
                        <div>
                            <div style={{ marginBottom: '20px' }}>
                                <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>Financial Overview & Escrow Vault</h1>
                                <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Monitor trade settlements, escrow balances, and platform disbursements.</p>
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
                            {/* Dynamic Shipment ID */}
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

                            {/* Reason Dropdown */}
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

                            {/* Details Input */}
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

// --- REUSABLE COMPONENTS ---

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

    if (status === 'Approved' || status === 'Completed' || status === 'Solved') {
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

// --- STYLES OBJECT ---
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
    btnApprove: { backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' },
    btnReject: { backgroundColor: '#ffffff', color: '#dc2626', border: '1px solid #fca5a5', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' },
    btnActionTransit: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' },
    btnActionReady: { backgroundColor: '#0284c7', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' },
    btnActionProcessing: { backgroundColor: '#d97706', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' },
    btnActionComplete: { backgroundColor: '#16a34a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' },
    btnPrimaryBlue: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' },
    btnSecondary: { backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' },
    primaryBtn: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' },
    secondaryBtn: { backgroundColor: '#ffffff', border: '1px solid #cbd5e1', color: '#475569', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' },
    selectInput: { borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#1e293b', outline: 'none' },
    orderSelectDropdown: { width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '14px', fontWeight: 600, color: '#1e293b', outline: 'none' },
    trackingStatusBanner: { backgroundColor: '#eff6ff', padding: '12px 16px', borderRadius: '8px', fontSize: '14px', color: '#1e293b', marginBottom: '20px' },
    timelineContainer: { display: 'flex', flexDirection: 'column', paddingLeft: '6px' },
    timelineItem: { display: 'flex', gap: '16px', minHeight: '44px' },
    timelineLeftColumn: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '20px' },
    timelineDot: { width: '18px', height: '18px', borderRadius: '50%', border: '2px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
    timelineLine: { width: '2px', flex: 1, backgroundColor: '#e2e8f0', margin: '2px 0' },
    timelineContent: { paddingBottom: '16px' },
    roleTag: { fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '12px' },
    concernBox: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px' },
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
