import React, { useState, useMemo } from 'react';

// MULTI-ORDER DATASET (5 PERISHABLE ORDERS WITH SERVICE TYPES & COUNTRIES)
const INITIAL_ORDERS_DATA = [
  {
    orderId: 'ORD-2026-8891',
    cargo: 'Frozen Meat Products (200 kg)',
    serviceType: 'Ocean Freight',
    destinationCountry: 'United Arab Emirates',
    destination: 'Jebel Ali, UAE',
    driver: 'Rajesh Kumar (MH-12-VT-9901)',
    tempTelemetry: '-18.2 °C (Optimal)',
    originLocation: 'Origin Meat Processing Unit, Pune',
    currentLocation: 'Panvel Highway Checkpoint (En Route to JNPT Port)',
    finalLocation: 'JNPT Freight Station, Navi Mumbai',
    trackingProgressPct: 68,
    eta: 'Today, 2026-08-01 @ 20:30 IST',
    vendorChain: [
      { stage: '01 - Farm Processing Unit', vendorName: 'AgroFarm Logistics Pvt Ltd', handler: 'Ramesh Shah', contact: '+91-9823011223', timestamp: '2026-08-01 06:30 IST', status: 'HANDOFF_COMPLETE' },
      { stage: '02 - Processing & Packing', vendorName: 'CryoPack Express India', handler: 'Sanjay Patil', contact: '+91-9890123456', timestamp: '2026-08-01 10:15 IST', status: 'HANDOFF_COMPLETE' },
      { stage: '03 - APEDA Reg. & Lab Test', vendorName: 'Apex NABL Testing Lab', handler: 'Dr. V. Sharma', contact: '+91-9765432109', timestamp: '2026-08-01 13:45 IST', status: 'IN_CUSTODY' },
      { stage: '04 - Health / Phytosanitary Cert', vendorName: 'Central Meat Quarantine Dept', handler: 'Officer K. Verma', contact: '+91-9123456780', timestamp: 'Pending Arrival', status: 'SCHEDULED' },
      { stage: '05 - Cold-Chain Transport to Port', vendorName: 'Navi Mumbai Cold Transporters', handler: 'Rajesh Kumar', contact: '+91-9988776655', timestamp: 'Pending Arrival', status: 'SCHEDULED' }
    ],
    milestones: [
      {
        id: 'step-1',
        stageNumber: '01',
        stageName: 'Farm Processing Unit',
        location: 'Origin Processing Facility, Pune',
        status: 'COMPLETED',
        isManualLocked: false,
        requiredDocs: [
          { id: 'd101', name: 'Lot Record Certificate', status: 'VERIFIED', issuer: 'Farm Mgmt', hash: '0x8f2a...4b12', fileName: 'LOT_REC_8891.pdf', reviewNote: 'Approved by Logistics Desk', verifiedAt: '2026-08-01 07:00 IST' },
          { id: 'd102', name: 'Farm Origin Invoice', status: 'VERIFIED', issuer: 'Producer Desk', hash: '0x3c11...889e', fileName: 'FARM_INV_8891.pdf', reviewNote: 'Invoice verified', verifiedAt: '2026-08-01 07:15 IST' },
          { id: 'd103', name: 'Animal Health & Traceability Pass', status: 'VERIFIED', issuer: 'District Vet Officer', hash: '0x1a98...33ee', fileName: 'VET_PASS_8891.pdf', reviewNote: 'Primary vet clearance confirmed', verifiedAt: '2026-08-01 07:45 IST' }
        ]
      },
      {
        id: 'step-2',
        stageNumber: '02',
        stageName: 'Processing & Packing',
        location: 'Central Cold Packhouse, Pune',
        status: 'COMPLETED',
        isManualLocked: false,
        requiredDocs: [
          { id: 'd201', name: 'FSSAI License Certificate', status: 'VERIFIED', issuer: 'FSSAI Authority', hash: '0x99a1...11bc', fileName: 'FSSAI_8891.pdf', reviewNote: 'License verified & active', verifiedAt: '2026-08-01 11:00 IST' },
          { id: 'd202', name: 'Batch Code & QC Inspection Sheet', status: 'VERIFIED', issuer: 'QC Packhouse Unit', hash: '0x7e22...55da', fileName: 'QC_8891.pdf', reviewNote: 'Batch inspection clear', verifiedAt: '2026-08-01 11:30 IST' }
        ]
      },
      {
        id: 'step-3',
        stageNumber: '03',
        stageName: 'APEDA Reg. + Lab Test',
        location: 'NABL Accredited Test Lab',
        status: 'IN_PROGRESS',
        isManualLocked: false,
        requiredDocs: [
          { id: 'd301', name: 'RCMC Certificate (APEDA)', status: 'VERIFIED', issuer: 'APEDA India', hash: '0x12a4...998f', fileName: 'APEDA_RCMC.pdf', reviewNote: 'Registration active', verifiedAt: '2026-08-01 14:00 IST' },
          { id: 'd302', name: 'NABL Lab Test Report (Residue)', status: 'PENDING_REVIEW', issuer: 'NABL Testing Lab', hash: '0x88d1...22ef', fileName: 'NABL_REPORT.pdf', reviewNote: 'Awaiting Logistics Admin signoff', verifiedAt: null }
        ]
      },
      {
        id: 'step-4',
        stageNumber: '04',
        stageName: 'Health / Phytosanitary Cert',
        location: 'EIC / Meat.Net Portal Clearance',
        status: 'LOCKED',
        isManualLocked: false,
        requiredDocs: [
          { id: 'd401', name: 'Meat.Net / EIC e-Health Certificate', status: 'MISSING', issuer: 'EIC Portal', hash: null, fileName: null, reviewNote: '', verifiedAt: null }
        ]
      },
      {
        id: 'step-5',
        stageNumber: '05',
        stageName: 'Cold-Chain Transport to Port',
        location: 'JNPT Freight Station, Gate 2',
        status: 'LOCKED',
        isManualLocked: false,
        requiredDocs: [
          { id: 'd501', name: 'Reefer E-Way Bill & GPS Temp Log', status: 'MISSING', issuer: 'Transporters', hash: null, fileName: null, reviewNote: '', verifiedAt: null }
        ]
      }
    ]
  },
  {
    orderId: 'ORD-2026-8892',
    cargo: 'Organic Spices & Pepper (500 kg)',
    serviceType: 'Trucking',
    destinationCountry: 'Netherlands',
    destination: 'Rotterdam, Netherlands',
    driver: 'Suresh Patil (KA-04-AB-3312)',
    tempTelemetry: '+22.0 °C (Ambient Control)',
    originLocation: 'Agri Processing Warehouse, Nashik',
    currentLocation: 'Nashik Highway Toll Plaza (Transit to Port)',
    finalLocation: 'Mumbai Container Terminal',
    trackingProgressPct: 35,
    eta: 'Tomorrow, 2026-08-02 @ 10:00 IST',
    vendorChain: [
      { stage: '01 - Farm Processing Unit', vendorName: 'Nashik Farmers Co-Op', handler: 'Anil Deshmukh', contact: '+91-9822334455', timestamp: '2026-08-01 08:00 IST', status: 'HANDOFF_COMPLETE' },
      { stage: '02 - Processing & Packing', vendorName: 'AgriPack Hub Nashik', handler: 'Pravin Zope', contact: '+91-9877665544', timestamp: '2026-08-01 12:00 IST', status: 'IN_CUSTODY' },
      { stage: '03 - APEDA Reg. & Lab Test', vendorName: 'Nashik Spice Testing Center', handler: 'M. Kulkarni', contact: '+91-9833445566', timestamp: 'Pending Arrival', status: 'SCHEDULED' },
      { stage: '04 - Health / Phytosanitary Cert', vendorName: 'Phyto Dept Maharashtra', handler: 'Officer R. Joshi', contact: '+91-9811223344', timestamp: 'Pending Arrival', status: 'SCHEDULED' },
      { stage: '05 - Transport to Port', vendorName: 'Western Freight Carriers', handler: 'Suresh Patil', contact: '+91-9866778899', timestamp: 'Pending Arrival', status: 'SCHEDULED' }
    ],
    milestones: [
      {
        id: 'step-1',
        stageNumber: '01',
        stageName: 'Farm Processing Unit',
        location: 'Origin Farm Facility, Nashik',
        status: 'COMPLETED',
        isManualLocked: false,
        requiredDocs: [
          { id: 'd101', name: 'Lot Record Certificate', status: 'VERIFIED', issuer: 'Farm Mgmt', hash: '0xa11b...9902', fileName: 'LOT_SPICE_8892.pdf', reviewNote: 'Approved', verifiedAt: '2026-08-01 08:30 IST' }
        ]
      },
      {
        id: 'step-2',
        stageNumber: '02',
        stageName: 'Processing & Packing',
        location: 'Nashik Packhouse',
        status: 'IN_PROGRESS',
        isManualLocked: false,
        requiredDocs: [
          { id: 'd201', name: 'FSSAI Spice License', status: 'VERIFIED', issuer: 'FSSAI Authority', hash: '0x33b1...776a', fileName: 'FSSAI_SPICE_8892.pdf', reviewNote: 'Approved', verifiedAt: '2026-08-01 12:30 IST' },
          { id: 'd202', name: 'Aflatoxin QC Test Sheet', status: 'PENDING_REVIEW', issuer: 'QC Unit', hash: '0x9911...4400', fileName: 'AFLATOXIN_TEST.pdf', reviewNote: 'Awaiting laboratory verification', verifiedAt: null }
        ]
      },
      {
        id: 'step-3',
        stageNumber: '03',
        stageName: 'APEDA Reg. + Lab Test',
        location: 'Spice Lab Facility',
        status: 'LOCKED',
        isManualLocked: false,
        requiredDocs: [{ id: 'd301', name: 'APEDA RCMC Registration', status: 'MISSING', issuer: 'APEDA', hash: null, fileName: null, reviewNote: '', verifiedAt: null }]
      },
      {
        id: 'step-4',
        stageNumber: '04',
        stageName: 'Health / Phytosanitary Cert',
        location: 'Plant Quarantine Station',
        status: 'LOCKED',
        isManualLocked: false,
        requiredDocs: [{ id: 'd401', name: 'Phytosanitary Clearance', status: 'MISSING', issuer: 'Phyto Dept', hash: null, fileName: null, reviewNote: '', verifiedAt: null }]
      },
      {
        id: 'step-5',
        stageNumber: '05',
        stageName: 'Transport to Port',
        location: 'Mumbai Port Gate 4',
        status: 'LOCKED',
        isManualLocked: false,
        requiredDocs: [{ id: 'd501', name: 'Port Gate Pass & E-Way Bill', status: 'MISSING', issuer: 'Transporter', hash: null, fileName: null, reviewNote: '', verifiedAt: null }]
      }
    ]
  },
  {
    orderId: 'ORD-2026-8893',
    cargo: 'Fresh Alphonso Mangoes (120 Crate)',
    serviceType: 'Air Freight',
    destinationCountry: 'United Kingdom',
    destination: 'London Heathrow (LHR), UK',
    driver: 'Manoj Shinde (MH-09-EQ-1102)',
    tempTelemetry: '+12.5 °C (Chilled Air Flow)',
    originLocation: 'Ratnagiri Orchards, Maharashtra',
    currentLocation: 'Hyderabad Expressway Hub',
    finalLocation: 'Mumbai Air Cargo Terminal (BOM)',
    trackingProgressPct: 82,
    eta: 'Today, 2026-08-01 @ 23:00 IST',
    vendorChain: [
      { stage: '01 - Farm Processing Unit', vendorName: 'Ratnagiri Mango Producer Co', handler: 'Ganesh Sawant', contact: '+91-9711223344', timestamp: '2026-08-01 04:00 IST', status: 'HANDOFF_COMPLETE' },
      { stage: '02 - Processing & Packing', vendorName: 'Irradiation Treatment Hub', handler: 'Dr. K. Kadam', contact: '+91-9722334455', timestamp: '2026-08-01 09:30 IST', status: 'HANDOFF_COMPLETE' },
      { stage: '03 - APEDA Reg. & Lab Test', vendorName: 'APEDA VHT & Gamma Lab', handler: 'Inspector Mehta', contact: '+91-9733445566', timestamp: '2026-08-01 14:00 IST', status: 'HANDOFF_COMPLETE' },
      { stage: '04 - Health / Phytosanitary Cert', vendorName: 'National Plant Quarantine Service', handler: 'Officer S. Nair', contact: '+91-9744556677', timestamp: '2026-08-01 16:30 IST', status: 'IN_CUSTODY' },
      { stage: '05 - Cold-Chain Transport to Airport', vendorName: 'Air Cargo Cold Express', handler: 'Manoj Shinde', contact: '+91-9755667788', timestamp: 'Pending Arrival', status: 'SCHEDULED' }
    ],
    milestones: [
      {
        id: 'step-1',
        stageNumber: '01',
        stageName: 'Farm Processing Unit',
        location: 'Ratnagiri Orchard Packhouse',
        status: 'COMPLETED',
        isManualLocked: false,
        requiredDocs: [{ id: 'd101', name: 'Mango Orchard Traceability Cert', status: 'VERIFIED', issuer: 'State Horticulture', hash: '0x712a...1100', fileName: 'ORCHARD_TRACE_8893.pdf', reviewNote: 'Verified', verifiedAt: '2026-08-01 05:00 IST' }]
      },
      {
        id: 'step-2',
        stageNumber: '02',
        stageName: 'Processing & Packing',
        location: 'Vapour Heat Treatment Facility',
        status: 'COMPLETED',
        isManualLocked: false,
        requiredDocs: [{ id: 'd201', name: 'VHT / Irradiation Treatment Record', status: 'VERIFIED', issuer: 'MSAMB Facility', hash: '0x9922...44bb', fileName: 'IRRADIATION_CERT.pdf', reviewNote: 'Treatment confirmed', verifiedAt: '2026-08-01 10:00 IST' }]
      },
      {
        id: 'step-3',
        stageNumber: '03',
        stageName: 'APEDA Reg. + Lab Test',
        location: 'APEDA Export Certification Unit',
        status: 'COMPLETED',
        isManualLocked: false,
        requiredDocs: [{ id: 'd301', name: 'APEDA Mango.Net Traceability Pass', status: 'VERIFIED', issuer: 'APEDA Portal', hash: '0x5544...11aa', fileName: 'MANGONET_PASS.pdf', reviewNote: 'Traceability validated', verifiedAt: '2026-08-01 14:30 IST' }]
      },
      {
        id: 'step-4',
        stageNumber: '04',
        stageName: 'Health / Phytosanitary Cert',
        location: 'NPQS Quarantine Office',
        status: 'IN_PROGRESS',
        isManualLocked: false,
        requiredDocs: [{ id: 'd401', name: 'Phytosanitary Export Health Certificate', status: 'PENDING_REVIEW', issuer: 'NPQS Authority', hash: '0x8877...22cc', fileName: 'PHYTO_UK_EXPORT.pdf', reviewNote: 'Awaiting final signoff', verifiedAt: null }]
      },
      {
        id: 'step-5',
        stageNumber: '05',
        stageName: 'Cold-Chain Transport to Airport',
        location: 'Mumbai Airport Gate 2',
        status: 'LOCKED',
        isManualLocked: false,
        requiredDocs: [{ id: 'd501', name: 'Air Waybill (AWB) & Customs Pass', status: 'MISSING', issuer: 'Air India Cargo', hash: null, fileName: null, reviewNote: '', verifiedAt: null }]
      }
    ]
  },
  {
    orderId: 'ORD-2026-8894',
    cargo: 'Temperature Sensitive Vaccines (50 kg)',
    serviceType: 'Booking Management',
    destinationCountry: 'Singapore',
    destination: 'Singapore (Changi Airport)',
    driver: 'Vikram Singh (KA-01-MJ-5544)',
    tempTelemetry: '+4.1 °C (Ultra Strict Cold Chain)',
    originLocation: 'Pharma Manufacturing Park, Bengaluru',
    currentLocation: 'Bengaluru Logistics Hub Checkpoint',
    finalLocation: 'Bengaluru Air Cargo Complex',
    trackingProgressPct: 15,
    eta: '2026-08-03 @ 06:00 IST',
    vendorChain: [
      { stage: '01 - Bio-Processing Unit', vendorName: 'BioHealth Labs India', handler: 'Dr. A. Rao', contact: '+91-9111223344', timestamp: '2026-08-01 11:00 IST', status: 'IN_CUSTODY' },
      { stage: '02 - Cold Vault Packaging', vendorName: 'CryoShield Packaging', handler: 'V. Nair', contact: '+91-9222334455', timestamp: 'Pending Arrival', status: 'SCHEDULED' },
      { stage: '03 - CDSCO & Lab Clearance', vendorName: 'Central Drugs Standard Control Org', handler: 'Dr. B. Das', contact: '+91-9333445566', timestamp: 'Pending Arrival', status: 'SCHEDULED' },
      { stage: '04 - Export Health Certificate', vendorName: 'Drug Controller General India', handler: 'Officer P. Sen', contact: '+91-9444556677', timestamp: 'Pending Arrival', status: 'SCHEDULED' },
      { stage: '05 - Reef-Air Express', vendorName: 'Apex Pharma Transporters', handler: 'Vikram Singh', contact: '+91-9555667788', timestamp: 'Pending Arrival', status: 'SCHEDULED' }
    ],
    milestones: [
      {
        id: 'step-1',
        stageNumber: '01',
        stageName: 'Bio-Processing Unit',
        location: 'Bengaluru Bio Tech Park',
        status: 'IN_PROGRESS',
        isManualLocked: false,
        requiredDocs: [
          { id: 'd101', name: 'GMP Manufacturing Batch Record', status: 'VERIFIED', issuer: 'BioHealth Quality Unit', hash: '0x1122...3344', fileName: 'GMP_BATCH_8894.pdf', reviewNote: 'GMP compliant', verifiedAt: '2026-08-01 11:30 IST' },
          { id: 'd102', name: 'Cold-Chain Validation Certificate', status: 'PENDING_REVIEW', issuer: 'Bio-Calibration Desk', hash: '0x5566...7788', fileName: 'COLD_VAL_8894.pdf', reviewNote: 'Under calibration audit', verifiedAt: null }
        ]
      },
      {
        id: 'step-2',
        stageNumber: '02',
        stageName: 'Cold Vault Packaging',
        location: 'Cold Storage Vault Gate 1',
        status: 'LOCKED',
        isManualLocked: false,
        requiredDocs: [{ id: 'd201', name: 'Vacuum Insulation Packaging Log', status: 'MISSING', issuer: 'CryoShield', hash: null, fileName: null, reviewNote: '', verifiedAt: null }]
      },
      {
        id: 'step-3',
        stageNumber: '03',
        stageName: 'CDSCO & Lab Clearance',
        location: 'Central Drug Lab Office',
        status: 'LOCKED',
        isManualLocked: false,
        requiredDocs: [{ id: 'd301', name: 'CDSCO Export No-Objection Cert', status: 'MISSING', issuer: 'CDSCO', hash: null, fileName: null, reviewNote: '', verifiedAt: null }]
      },
      {
        id: 'step-4',
        stageNumber: '04',
        stageName: 'Export Health Certificate',
        location: 'Customs Health Desk',
        status: 'LOCKED',
        isManualLocked: false,
        requiredDocs: [{ id: 'd401', name: 'DGFT Export License (Pharma)', status: 'MISSING', issuer: 'DGFT', hash: null, fileName: null, reviewNote: '', verifiedAt: null }]
      },
      {
        id: 'step-5',
        stageNumber: '05',
        stageName: 'Reef-Air Express',
        location: 'Bengaluru Cargo Gate 3',
        status: 'LOCKED',
        isManualLocked: false,
        requiredDocs: [{ id: 'd501', name: 'Temperature Log Manifest & Airway Pass', status: 'MISSING', issuer: 'Airlines Cargo', hash: null, fileName: null, reviewNote: '', verifiedAt: null }]
      }
    ]
  },
  {
    orderId: 'ORD-2026-8895',
    cargo: 'Chilled Seafood & Tiger Prawns (450 kg)',
    serviceType: "Buyer's Consolidation",
    destinationCountry: 'Japan',
    destination: 'Tokyo (NRT), Japan',
    driver: 'K. Parthiban (KL-07-CX-8822)',
    tempTelemetry: '+1.8 °C (Strict Chilled Storage)',
    originLocation: 'Kochi Seafood Processing Hub, Kerala',
    currentLocation: 'Kochi Port Terminal Checkpost',
    finalLocation: 'Cochin International Airport Air Cargo',
    trackingProgressPct: 92,
    eta: 'Today, 2026-08-01 @ 21:00 IST',
    vendorChain: [
      { stage: '01 - Coastal Aquaculture Unit', vendorName: 'Kerala Ocean Farms Co-Op', handler: 'K. V. Thomas', contact: '+91-9847011223', timestamp: '2026-08-01 04:00 IST', status: 'HANDOFF_COMPLETE' },
      { stage: '02 - Cold Sorting & Vacuum Pack', vendorName: 'Cochin Marine Packers', handler: 'M. S. Menon', contact: '+91-9847022334', timestamp: '2026-08-01 09:00 IST', status: 'HANDOFF_COMPLETE' },
      { stage: '03 - MPEDA & Microbiological Testing', vendorName: 'MPEDA Quality Control Lab', handler: 'Dr. S. Pillai', contact: '+91-9847033445', timestamp: '2026-08-01 13:00 IST', status: 'HANDOFF_COMPLETE' },
      { stage: '04 - Health & Export Sanitize Cert', vendorName: 'EIC Marine Export Authority', handler: 'Officer George', contact: '+91-9847044556', timestamp: '2026-08-01 16:00 IST', status: 'IN_CUSTODY' },
      { stage: '05 - Reef-Air Express Transport', vendorName: 'Kochi Air Reefer Express', handler: 'K. Parthiban', contact: '+91-9847055667', timestamp: 'Pending Arrival', status: 'SCHEDULED' }
    ],
    milestones: [
      {
        id: 'step-1',
        stageNumber: '01',
        stageName: 'Coastal Aquaculture Unit',
        location: 'Kochi Coastal Processing Hub',
        status: 'COMPLETED',
        isManualLocked: false,
        requiredDocs: [{ id: 'd101', name: 'Aquaculture Origin Pass', status: 'VERIFIED', issuer: 'Coastal Aquaculture Authority', hash: '0x8899...1122', fileName: 'AQUA_ORIGIN_8895.pdf', reviewNote: 'Origin verified', verifiedAt: '2026-08-01 05:00 IST' }]
      },
      {
        id: 'step-2',
        stageNumber: '02',
        stageName: 'Cold Sorting & Vacuum Pack',
        location: 'Cochin Chilled Packhouse',
        status: 'COMPLETED',
        isManualLocked: false,
        requiredDocs: [{ id: 'd201', name: 'HACCP Compliance Certificate', status: 'VERIFIED', issuer: 'Food Safety Board', hash: '0x4455...6677', fileName: 'HACCP_SEAFOOD.pdf', reviewNote: 'HACCP verified', verifiedAt: '2026-08-01 10:00 IST' }]
      },
      {
        id: 'step-3',
        stageNumber: '03',
        stageName: 'MPEDA & Lab Testing',
        location: 'MPEDA NABL Marine Lab',
        status: 'COMPLETED',
        isManualLocked: false,
        requiredDocs: [{ id: 'd301', name: 'Antibiotic & Heavy Metal Test Report', status: 'VERIFIED', issuer: 'MPEDA Lab', hash: '0x1122...3344', fileName: 'MPEDA_TEST_PASS.pdf', reviewNote: 'Residue-free pass', verifiedAt: '2026-08-01 13:30 IST' }]
      },
      {
        id: 'step-4',
        stageNumber: '04',
        stageName: 'Health & Export Sanitize Cert',
        location: 'Export Inspection Council (EIC) Desk',
        status: 'IN_PROGRESS',
        isManualLocked: false,
        requiredDocs: [{ id: 'd401', name: 'EIC Health Certificate for Japan Export', status: 'PENDING_REVIEW', issuer: 'EIC Officer', hash: '0x7788...9900', fileName: 'EIC_JAPAN_HEALTH.pdf', reviewNote: 'Awaiting inspector approval', verifiedAt: null }]
      },
      {
        id: 'step-5',
        stageNumber: '05',
        stageName: 'Reef-Air Express Transport',
        location: 'Cochin Cargo Terminal Airside',
        status: 'LOCKED',
        isManualLocked: false,
        requiredDocs: [{ id: 'd501', name: 'Airlines Cold-Chain Waybill & Customs Clearance', status: 'MISSING', issuer: 'Air Cargo Freight', hash: null, fileName: null, reviewNote: '', verifiedAt: null }]
      }
    ]
  }
];

export default function LogisticsPortalDocumentGated() {
  const [orders, setOrders] = useState(INITIAL_ORDERS_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  
  // NEW FILTER STATES
  const [selectedService, setSelectedService] = useState('ALL');
  const [selectedCountry, setSelectedCountry] = useState('ALL');

  const [activeOrderId, setActiveOrderId] = useState('ORD-2026-8891');
  const [activeStepId, setActiveStepId] = useState('step-1');
  const [isLogisticsAdminMode, setIsLogisticsAdminMode] = useState(true);
  const [reviewModalDoc, setReviewModalDoc] = useState(null);
  const [previewDocModal, setPreviewDocModal] = useState(null);
  const [reviewNoteInput, setReviewNoteInput] = useState('');
  const [toast, setToast] = useState('');

  const triggerToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // DYNAMIC COUNTRY LIST CREATION
  const availableCountries = useMemo(() => {
    const countries = new Set(orders.map(o => o.destinationCountry));
    return ['ALL', ...Array.from(countries)];
  }, [orders]);

  // COMBINED SEARCH AND FILTER FUNCTIONALITY
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = 
        o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) || 
        o.cargo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.currentLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.destination.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesService = selectedService === 'ALL' || o.serviceType === selectedService;
      const matchesCountry = selectedCountry === 'ALL' || o.destinationCountry === selectedCountry;

      return matchesSearch && matchesService && matchesCountry;
    });
  }, [orders, searchQuery, selectedService, selectedCountry]);

  const currentOrder = useMemo(() => {
    return orders.find(o => o.orderId === activeOrderId) || filteredOrders[0] || orders[0];
  }, [orders, activeOrderId, filteredOrders]);

  const currentStep = useMemo(() => {
    return currentOrder.milestones.find(m => m.id === activeStepId) || currentOrder.milestones[0];
  }, [currentOrder, activeStepId]);

  const toggleStageLock = (stageId) => {
    setOrders(prevOrders => prevOrders.map(ord => {
      if (ord.orderId !== activeOrderId) return ord;

      const updatedMilestones = ord.milestones.map(ms => {
        if (ms.id !== stageId) return ms;

        const willBeLocked = ms.status !== 'LOCKED';
        return {
          ...ms,
          status: willBeLocked ? 'LOCKED' : 'IN_PROGRESS',
          isManualLocked: willBeLocked
        };
      });

      return { ...ord, milestones: updatedMilestones };
    }));

    const isNowLocked = currentStep.status !== 'LOCKED';
    triggerToast(isNowLocked ? `🔒 Stage ${currentStep.stageNumber} manually LOCKED by Logistics Desk` : `🔓 Stage ${currentStep.stageNumber} UNLOCKED by Logistics Desk`);
  };

  const handleForceReReview = (e, doc) => {
    e.stopPropagation();
    setReviewModalDoc({ ...doc, forceOverride: true });
    setReviewNoteInput(doc.reviewNote || '');
  };

  const handleReviewDecision = (docId, newStatus) => {
    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    setOrders(prevOrders => prevOrders.map(ord => {
      if (ord.orderId !== activeOrderId) return ord;

      const updatedMilestones = ord.milestones.map(ms => {
        if (ms.id !== activeStepId) return ms;

        const updatedDocs = ms.requiredDocs.map(doc => {
          if (doc.id !== docId) return doc;

          return {
            ...doc,
            status: newStatus,
            verifiedAt: newStatus === 'VERIFIED' ? timestamp : null,
            reviewNote: reviewNoteInput || (
              newStatus === 'VERIFIED' 
                ? `Approved by Logistics Manager @ ${timestamp}` 
                : `STATUS REVERTED TO RE-REVIEW BY LOGISTICS MANAGER @ ${timestamp}`
            )
          };
        });

        const allDone = updatedDocs.every(d => d.status === 'VERIFIED');

        return {
          ...ms,
          requiredDocs: updatedDocs,
          status: allDone ? 'COMPLETED' : 'IN_PROGRESS'
        };
      });

      return { ...ord, milestones: updatedMilestones };
    }));

    setReviewModalDoc(null);
    setReviewNoteInput('');

    if (newStatus === 'PENDING_REVIEW') {
      triggerToast(`⚠️ Document status reverted to RE-REVIEW. Stage unlocked for re-inspection.`);
    } else if (newStatus === 'VERIFIED') {
      triggerToast(`✅ Document APPROVED & Verified by Logistics Manager.`);
    } else {
      triggerToast(`❌ Document REJECTED. Submitter / Carrier notified.`);
    }
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedService('ALL');
    setSelectedCountry('ALL');
  };

  return (
    <div style={styles.dashboardWrapper}>
      <style>{`
        html, body, #root {
          height: 100%;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
        .order-nav-card { transition: all 0.2s ease; cursor: pointer; border: 1px solid #e2e8f0; }
        .order-nav-card:hover { border-color: #0f766e; background-color: #f0fdf4; }
        .order-nav-card.active { border-color: #0f766e; background-color: #ffffff; box-shadow: 0 4px 12px rgba(15, 118, 110, 0.15); }
        .vendor-row { transition: all 0.2s ease; }
        .vendor-row:hover { background-color: #f1f5f9; }
        
        .doc-clickable-card { transition: all 0.2s ease; cursor: pointer; border: 1px solid #e2e8f0; }
        .doc-clickable-card:hover { border-color: #0f766e; background-color: #f0fdf4; transform: translateY(-1px); box-shadow: 0 4px 10px rgba(15, 118, 110, 0.1); }
        
        .btn-override { transition: all 0.2s ease; cursor: pointer; }
        .btn-override:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .pulse-marker { animation: pulse 1.8s infinite; }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div style={styles.toast}>
          <span>🛡️</span>
          <span>{toast}</span>
        </div>
      )}

      {/* TOP COMMAND BAR */}
      <div style={styles.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={styles.logoBadge}>LOGISTICS HUB</div>
          <div>
            <h1 style={styles.mainTitle}>Perishable Cargo Telemetry & Stage Clearance Portal</h1>
            <p style={styles.mainSubtitle}>Real-Time GPS Telemetry + Timestamped Vendor Custody + Document Override Controls</p>
          </div>
        </div>

        <label style={styles.toggleContainer}>
          <span style={{ fontSize: '11px', fontWeight: '800', color: isLogisticsAdminMode ? '#0f766e' : '#64748b' }}>
            {isLogisticsAdminMode ? 'LOGISTICS MANAGER OVERRIDE: ACTIVE' : 'VIEW-ONLY MODE'}
          </span>
          <input 
            type="checkbox" 
            checked={isLogisticsAdminMode} 
            onChange={(e) => setIsLogisticsAdminMode(e.target.checked)}
            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#0f766e' }}
          />
        </label>
      </div>

      {/* THREE-COLUMN DASHBOARD GRID */}
      <div style={styles.gridContainer}>
        
        {/* LEFT COLUMN 1: SEARCH & MULTI-FILTER PANEL */}
        <div style={styles.leftCol}>
          
          {/* SEARCH & FILTERS BOX */}
          <div style={styles.filterCard}>
            <div style={styles.searchBox}>
              <span style={{ fontSize: '14px' }}>🔍</span>
              <input 
                type="text" 
                placeholder="Search Order ID, Cargo, City..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#64748b' }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* SERVICE TYPE FILTER */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>SERVICE TYPE</label>
              <select 
                value={selectedService} 
                onChange={(e) => setSelectedService(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="ALL">All Services</option>
                <option value="Ocean Freight">Ocean Freight</option>
                <option value="Air Freight">Air Freight</option>
                <option value="Trucking">Trucking</option>
                <option value="Booking Management">Booking Management</option>
                <option value="Buyer's Consolidation">Buyer's Consolidation</option>
              </select>
            </div>

            {/* DESTINATION COUNTRY FILTER */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>DESTINATION COUNTRY</label>
              <select 
                value={selectedCountry} 
                onChange={(e) => setSelectedCountry(e.target.value)}
                style={styles.filterSelect}
              >
                {availableCountries.map((c) => (
                  <option key={c} value={c}>
                    {c === 'ALL' ? 'All Countries' : c}
                  </option>
                ))}
              </select>
            </div>

            {(searchQuery || selectedService !== 'ALL' || selectedCountry !== 'ALL') && (
              <button onClick={resetAllFilters} style={styles.resetBtn}>
                🔄 Reset All Filters
              </button>
            )}
          </div>

          <div style={styles.searchSummaryBar}>
            <span>Showing <strong>{filteredOrders.length}</strong> of {orders.length} Consignments</span>
          </div>

          <div style={styles.orderList}>
            {filteredOrders.length > 0 ? (
              filteredOrders.map(ord => {
                const isActive = ord.orderId === currentOrder.orderId;

                return (
                  <div 
                    key={ord.orderId}
                    className={`order-nav-card ${isActive ? 'active' : ''}`}
                    onClick={() => { setActiveOrderId(ord.orderId); setActiveStepId('step-1'); }}
                    style={styles.orderCard}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>{ord.orderId}</strong>
                      <span style={styles.statusPill}>LIVE EN ROUTE</span>
                    </div>
                    
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f766e', marginTop: '4px' }}>
                      {ord.cargo}
                    </div>

                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                      <span style={styles.serviceTag}>🚢 {ord.serviceType}</span>
                      <span style={styles.countryTag}>🌐 {ord.destinationCountry}</span>
                    </div>

                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                      📍 {ord.currentLocation}
                    </div>

                    <div style={styles.miniProgressBg}>
                      <div style={{ ...styles.miniProgressFill, width: `${ord.trackingProgressPct}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={styles.noResultsBox}>
                <span>🚫 No matching consignments found</span>
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Try resetting filters or expanding your search scope</span>
                <button onClick={resetAllFilters} style={{ ...styles.resetBtn, marginTop: '8px' }}>Reset Filters</button>
              </div>
            )}
          </div>
        </div>

        {/* MIDDLE COLUMN 2: VENDOR CUSTODY TIMELINE & TIMESTAMPS */}
        <div style={styles.midCol}>
          <div style={styles.vendorCard}>
            <div style={styles.vendorCardHeader}>
              <span style={{ fontSize: '16px' }}>🏬</span>
              <strong style={{ fontSize: '13px', color: '#0f172a' }}>VENDOR CUSTODY TIMELINE</strong>
            </div>

            <div style={styles.vendorChainList}>
              {currentOrder.vendorChain.map((v, idx) => (
                <div key={idx} className="vendor-row" style={styles.vendorBox}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', fontWeight: '900', color: '#0f766e' }}>{v.stage}</span>
                    <span style={{
                      fontSize: '9px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px',
                      backgroundColor: v.status === 'HANDOFF_COMPLETE' ? '#dcfce7' : v.status === 'IN_CUSTODY' ? '#fef3c7' : '#f1f5f9',
                      color: v.status === 'HANDOFF_COMPLETE' ? '#166534' : v.status === 'IN_CUSTODY' ? '#92400e' : '#64748b'
                    }}>
                      {v.status}
                    </span>
                  </div>

                  <div style={{ fontSize: '12px', fontWeight: '800', color: '#1e293b', marginTop: '4px' }}>
                    {v.vendorName}
                  </div>

                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
                    👤 Handler: <strong>{v.handler}</strong> ({v.contact})
                  </div>

                  <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>🕒 Timestamp:</span>
                    <strong>{v.timestamp}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN 3: REAL-TIME TRACKING MAP & GATED STAGE DOCUMENTS */}
        <div style={styles.rightCol}>
          
          {/* REAL-TIME GPS TRACKING PANEL */}
          <div style={styles.trackingCard}>
            <div style={styles.cardHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🛰️</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '14px', color: '#0f172a', fontWeight: '900' }}>
                    REAL-TIME CONSIGNMENT TRACKING — {currentOrder.orderId}
                  </h3>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Assigned Driver: <strong>{currentOrder.driver}</strong></span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '6px' }}>
                <div style={styles.serviceModeBadge}>
                  📦 {currentOrder.serviceType}
                </div>
                <div style={styles.telemetryBadge}>
                  ❄️ Cold-Chain: <strong>{currentOrder.tempTelemetry}</strong>
                </div>
              </div>
            </div>

            <div style={styles.routeContainer}>
              <div style={styles.routeHeader}>
                <div><strong>Origin:</strong> {currentOrder.originLocation}</div>
                <div><strong>ETA:</strong> <span style={{ color: '#0f766e', fontWeight: '800' }}>{currentOrder.eta}</span></div>
                <div><strong>Port / Country:</strong> {currentOrder.destination}</div>
              </div>

              <div style={styles.routeTrackBg}>
                <div style={{ ...styles.routeTrackFill, width: `${currentOrder.trackingProgressPct}%` }} />
                <div 
                  className="pulse-marker"
                  style={{ ...styles.routeMarker, left: `${currentOrder.trackingProgressPct}%` }}
                >
                  🚚
                </div>
              </div>

              <div style={styles.currentLocBanner}>
                <span>📍 CURRENT GPS POSITION:</span>
                <strong style={{ color: '#0f766e' }}>{currentOrder.currentLocation}</strong>
                <span style={{ fontSize: '11px', color: '#64748b' }}>({currentOrder.trackingProgressPct}% Route Completed)</span>
              </div>
            </div>
          </div>

          {/* GATED STAGE DOCUMENT COMPLIANCE CONTROL */}
          <div style={styles.stageCard}>
            
            <div style={styles.stageCardHeader}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={styles.stageNumBadge}>{currentStep.stageNumber}</span>
                  <h2 style={styles.stageTitle}>{currentStep.stageName}</h2>
                </div>
                <span style={styles.locationText}>📍 Facility Location: {currentStep.location}</span>
              </div>

              {/* LOGISTICS DESK STAGE LOCK / UNLOCK BUTTON */}
              {isLogisticsAdminMode && (
                <button 
                  onClick={() => toggleStageLock(currentStep.id)}
                  style={{
                    ...styles.lockToggleBtn,
                    backgroundColor: currentStep.status === 'LOCKED' ? '#0f766e' : '#ef4444',
                    color: '#fff'
                  }}
                >
                  {currentStep.status === 'LOCKED' ? '🔓 Unlock Stage Gate' : '🔒 Lock Portal Stage'}
                </button>
              )}
            </div>

            {/* STAGE SELECTOR TABS (5 FULL STAGES) */}
            <div style={styles.stepperBar}>
              {currentOrder.milestones.map((step) => {
                const isActive = step.id === activeStepId;
                const isCompleted = step.status === 'COMPLETED';
                const isInProgress = step.status === 'IN_PROGRESS';
                const isLocked = step.status === 'LOCKED';

                return (
                  <div 
                    key={step.id} 
                    onClick={() => setActiveStepId(step.id)}
                    style={{
                      ...styles.stepTab,
                      backgroundColor: isActive ? '#0f766e' : isCompleted ? '#ecfdf5' : isInProgress ? '#fef3c7' : '#f8fafc',
                      color: isActive ? '#ffffff' : isCompleted ? '#166534' : isInProgress ? '#92400e' : '#64748b',
                      borderColor: isActive ? '#0f766e' : isCompleted ? '#a7f3d0' : '#e2e8f0'
                    }}
                  >
                    <span>{step.stageNumber}. {step.stageName}</span>
                    {isLocked && <span>🔒</span>}
                  </div>
                );
              })}
            </div>

            {/* MANDATORY DOCUMENTS */}
            <div style={styles.docSection}>
              <div style={styles.docSectionHeader}>
                <span>STAGE COMPLIANCE DOCUMENTS (CLICK ANY DOC TO VIEW / INSPECT)</span>
                <span>MANAGER AUDIT & RE-REVIEW DESK</span>
              </div>

              <div style={styles.docListScrollable}>
                {currentStep.requiredDocs.map((doc) => {
                  const isVerified = doc.status === 'VERIFIED';
                  const isPending = doc.status === 'PENDING_REVIEW';
                  const isRejected = doc.status === 'REJECTED';
                  const isMissing = doc.status === 'MISSING';

                  return (
                    <div 
                      key={doc.id} 
                      className="doc-clickable-card"
                      onClick={() => setPreviewDocModal(doc)}
                      style={styles.docRow}
                    >
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={styles.docIconBadge}>📄</div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontSize: '13px', color: '#1e293b' }}>{doc.name}</strong>
                            {doc.fileName && <span style={styles.fileNamePill}>👁️ View {doc.fileName}</span>}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            Issuer: <strong>{doc.issuer}</strong> {doc.verifiedAt && `| Verified: ${doc.verifiedAt}`}
                          </div>
                          {doc.reviewNote && (
                            <div style={{ fontSize: '10px', color: '#0f766e', fontStyle: 'italic', marginTop: '2px' }}>
                              💬 Audit Log: "{doc.reviewNote}"
                            </div>
                          )}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {isVerified && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={styles.verifiedTag}>✓ VERIFIED</span>
                            {isLogisticsAdminMode && (
                              <button 
                                className="btn-override"
                                onClick={(e) => handleForceReReview(e, doc)}
                                style={styles.reReviewBtn}
                                title="Revert status back to Re-Review mode"
                              >
                                ⚠️ Force Re-Review
                              </button>
                            )}
                          </div>
                        )}

                        {isPending && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={styles.pendingTag}>⏳ PENDING REVIEW</span>
                            {isLogisticsAdminMode && (
                              <button 
                                style={styles.reviewBtn}
                                onClick={(e) => handleForceReReview(e, doc)}
                              >
                                🔍 Audit & Decide
                              </button>
                            )}
                          </div>
                        )}

                        {isRejected && (
                          <span style={styles.rejectedTag}>❌ REJECTED</span>
                        )}

                        {isMissing && (
                          <span style={styles.missingTag}>⚠️ UPLOAD PENDING</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* DOCUMENT PREVIEW & INSPECTOR MODAL */}
      {previewDocModal && (
        <div style={styles.modalOverlay} onClick={() => setPreviewDocModal(null)}>
          <div style={{ ...styles.modalContent, maxWidth: '650px' }} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>📄</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px' }}>{previewDocModal.name}</h3>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Issuing Authority: {previewDocModal.issuer}</span>
                </div>
              </div>
              <button style={styles.closeBtn} onClick={() => setPreviewDocModal(null)}>✕</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>FILE NAME</span>
                  <strong style={{ fontSize: '12px', color: '#0f766e' }}>{previewDocModal.fileName || 'N/A (Pending Upload)'}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>VERIFICATION STATUS</span>
                  <strong style={{ fontSize: '12px', color: previewDocModal.status === 'VERIFIED' ? '#166534' : '#b45309' }}>
                    {previewDocModal.status}
                  </strong>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>CRYPTOGRAPHIC SHA-256 HASH</span>
                  <code style={styles.codeBlock}>{previewDocModal.hash || 'Hash Not Generated Yet'}</code>
                </div>
              </div>

              <div style={styles.docViewerPaper}>
                <div style={{ textAlign: 'center', borderBottom: '1px border #cbd5e1', paddingBottom: '12px', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, color: '#0f172a', fontSize: '14px' }}>PERISHABLE GOODS SANITARY CERTIFICATE</h4>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>Official Digital Copy • Verified via Cold-Chain Logistics Portal</span>
                </div>
                
                <p style={{ fontSize: '11px', color: '#334155', lineHeight: '1.6' }}>
                  This certifies that consignment <strong>{currentOrder.orderId}</strong> containing <strong>{currentOrder.cargo}</strong> bound for <strong>{currentOrder.destinationCountry}</strong> via <strong>{currentOrder.serviceType}</strong> has undergone mandatory temperature-controlled compliance inspection under stage <strong>{currentStep.stageName}</strong>.
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1', fontSize: '10px', color: '#64748b' }}>
                  <div>Verified At: {previewDocModal.verifiedAt || 'Pending Signoff'}</div>
                  <div>Digitally Signed by: {previewDocModal.issuer}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                {previewDocModal.fileName && (
                  <button 
                    onClick={() => triggerToast(`📥 Downloading official copy: ${previewDocModal.fileName}`)}
                    style={styles.approveBtn}
                  >
                    ⬇️ Download Official PDF
                  </button>
                )}
                <button 
                  onClick={() => setPreviewDocModal(null)}
                  style={{ ...styles.rejectBtn, backgroundColor: '#64748b' }}
                >
                  Close Viewer
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* LOGISTICS MANAGER RE-REVIEW & DECISION MODAL */}
      {reviewModalDoc && (
        <div style={styles.modalOverlay} onClick={() => setReviewModalDoc(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3>🛠️ Logistics Authority Review & Override Desk</h3>
              <button style={styles.closeBtn} onClick={() => setReviewModalDoc(null)}>✕</button>
            </div>
            
            <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div><strong>Document Name:</strong> {reviewModalDoc.name}</div>
              <div><strong>Current Status:</strong> <span style={{ fontWeight: '800', color: '#0f766e' }}>{reviewModalDoc.status}</span></div>
              <div><strong>Issuing Authority:</strong> {reviewModalDoc.issuer}</div>
              {reviewModalDoc.hash && <div><strong>Cryptographic Hash:</strong> <code style={styles.codeBlock}>{reviewModalDoc.hash}</code></div>}

              <div>
                <label style={{ fontWeight: '800', display: 'block', marginBottom: '4px' }}>Logistics Manager Audit Remark:</label>
                <textarea 
                  rows={3} 
                  placeholder="Enter explicit reason for approval, rejection, or why re-review was forced..."
                  value={reviewNoteInput}
                  onChange={(e) => setReviewNoteInput(e.target.value)}
                  style={styles.reviewTextarea}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                <button 
                  onClick={() => handleReviewDecision(reviewModalDoc.id, 'VERIFIED')}
                  style={styles.approveBtn}
                >
                  ✅ Approve & Verify
                </button>
                <button 
                  onClick={() => handleReviewDecision(reviewModalDoc.id, 'PENDING_REVIEW')}
                  style={styles.forceReReviewActionBtn}
                >
                  ⚠️ Revert to Re-Review Status
                </button>
                <button 
                  onClick={() => handleReviewDecision(reviewModalDoc.id, 'REJECTED')}
                  style={styles.rejectBtn}
                >
                  ❌ Reject Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// STYLES
const styles = {
  dashboardWrapper: { 
    width: '100vw', 
    height: '100vh', 
    maxHeight: '100vh',
    backgroundColor: '#f8fafc', 
    padding: '16px', 
    fontFamily: 'system-ui, -apple-system, sans-serif', 
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  toast: { position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#0f172a', color: '#fff', padding: '12px 20px', borderRadius: '30px', fontSize: '12px', fontWeight: '700', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' },

  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', padding: '12px 20px', borderRadius: '12px', marginBottom: '14px', flexShrink: 0 },
  logoBadge: { backgroundColor: '#0f766e', color: '#fff', fontSize: '11px', fontWeight: '900', padding: '6px 12px', borderRadius: '6px' },
  mainTitle: { fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0 },
  mainSubtitle: { fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' },

  toggleContainer: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', backgroundColor: '#ecfdf5', padding: '8px 14px', borderRadius: '20px', border: '1px solid #a7f3d0' },

  gridContainer: { 
    display: 'grid', 
    gridTemplateColumns: '290px 310px 1fr', 
    gap: '16px', 
    flex: 1, 
    minHeight: 0, 
    height: '100%' 
  },
  
  // LEFT COLUMN FILTERS
  leftCol: { display: 'flex', flexDirection: 'column', gap: '8px', height: '100%', minHeight: 0 },
  filterCard: { backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 },
  searchBox: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', padding: '8px 10px', borderRadius: '6px' },
  searchInput: { border: 'none', outline: 'none', width: '100%', fontSize: '12px', backgroundColor: 'transparent' },
  
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '3px' },
  filterLabel: { fontSize: '9px', fontWeight: '900', color: '#475569', letterSpacing: '0.5px' },
  filterSelect: { padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', color: '#0f172a', backgroundColor: '#ffffff', cursor: 'pointer', outline: 'none' },
  resetBtn: { padding: '5px', backgroundColor: '#f1f5f9', color: '#0f766e', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '10px', fontWeight: '800', cursor: 'pointer', textAlign: 'center' },

  searchSummaryBar: { fontSize: '11px', color: '#64748b', padding: '0 4px', flexShrink: 0 },
  orderList: { display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1, paddingRight: '4px' },
  orderCard: { backgroundColor: '#fff', padding: '12px', borderRadius: '10px' },
  statusPill: { fontSize: '9px', fontWeight: '900', backgroundColor: '#dcfce7', color: '#166534', padding: '2px 6px', borderRadius: '4px' },
  serviceTag: { fontSize: '9px', fontWeight: '800', backgroundColor: '#f0fdf4', color: '#0f766e', border: '1px solid #bbf7d0', padding: '2px 5px', borderRadius: '4px' },
  countryTag: { fontSize: '9px', fontWeight: '800', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', padding: '2px 5px', borderRadius: '4px' },
  
  miniProgressBg: { height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', marginTop: '10px', overflow: 'hidden' },
  miniProgressFill: { height: '100%', backgroundColor: '#0f766e' },
  noResultsBox: { padding: '20px', textAlign: 'center', color: '#334155', backgroundColor: '#fff', borderRadius: '8px', border: '1px dashed #cbd5e1', display: 'flex', flexDirection: 'column', alignItems: 'center' },

  // MIDDLE COLUMN
  midCol: { display: 'flex', flexDirection: 'column', gap: '12px', height: '100%', minHeight: 0 },
  vendorCard: { backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, boxSizing: 'border-box' },
  vendorCardHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', flexShrink: 0 },
  vendorChainList: { display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1, paddingRight: '4px' },
  vendorBox: { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px' },

  // RIGHT COLUMN
  rightCol: { display: 'flex', flexDirection: 'column', gap: '14px', height: '100%', minHeight: 0 },

  // TRACKING CARD
  trackingCard: { backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '14px', flexShrink: 0 },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  serviceModeBadge: { backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800' },
  telemetryBadge: { backgroundColor: '#f0fdf4', color: '#166534', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: '20px', fontSize: '11px' },
  routeContainer: { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' },
  routeHeader: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#334155', marginBottom: '10px' },
  routeTrackBg: { position: 'relative', height: '8px', backgroundColor: '#cbd5e1', borderRadius: '4px', margin: '14px 0' },
  routeTrackFill: { height: '100%', backgroundColor: '#0f766e', borderRadius: '4px' },
  routeMarker: { position: 'absolute', top: '-11px', transform: 'translateX(-50%)', width: '28px', height: '28px', backgroundColor: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px' },
  currentLocBanner: { display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11px', fontWeight: '800', color: '#1e293b', marginTop: '6px' },

  // STAGE CARD
  stageCard: { backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '14px', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', boxSizing: 'border-box' },
  stageCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexShrink: 0 },
  stageNumBadge: { backgroundColor: '#0f766e', color: '#fff', fontSize: '11px', fontWeight: '900', padding: '2px 8px', borderRadius: '4px' },
  stageTitle: { fontSize: '15px', fontWeight: '900', color: '#0f172a', margin: 0 },
  locationText: { fontSize: '11px', color: '#64748b' },
  lockToggleBtn: { padding: '6px 14px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', cursor: 'pointer', border: 'none' },

  stepperBar: { display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap', flexShrink: 0 },
  stepTab: { padding: '6px 12px', borderRadius: '6px', border: '1px solid', fontSize: '11px', fontWeight: '800', cursor: 'pointer', display: 'flex', gap: '6px', alignItems: 'center' },

  docSection: { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' },
  docSectionHeader: { display: 'flex', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: '#f8fafc', fontSize: '10px', fontWeight: '800', color: '#475569', flexShrink: 0, borderBottom: '1px solid #e2e8f0' },
  docListScrollable: { flex: 1, overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '8px' },
  docRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '8px', backgroundColor: '#ffffff' },
  docIconBadge: { width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 },
  fileNamePill: { fontSize: '9px', fontWeight: '700', color: '#0f766e', backgroundColor: '#ccfbf1', padding: '2px 6px', borderRadius: '4px' },

  verifiedTag: { fontSize: '10px', fontWeight: '800', color: '#15803d', backgroundColor: '#dcfce7', padding: '3px 8px', borderRadius: '4px' },
  pendingTag: { fontSize: '10px', fontWeight: '800', color: '#b45309', backgroundColor: '#fef3c7', padding: '3px 8px', borderRadius: '4px' },
  rejectedTag: { fontSize: '10px', fontWeight: '800', color: '#991b1b', backgroundColor: '#fee2e2', padding: '3px 8px', borderRadius: '4px' },
  missingTag: { fontSize: '10px', fontWeight: '800', color: '#475569', backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '4px' },

  reviewBtn: { padding: '5px 10px', backgroundColor: '#0f766e', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', fontWeight: '800', cursor: 'pointer' },
  reReviewBtn: { padding: '4px 8px', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px', fontWeight: '800' },

  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
  modalContent: { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', width: '90%', maxWidth: '480px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' },
  closeBtn: { background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer', color: '#64748b' },
  codeBlock: { display: 'block', backgroundColor: '#f1f5f9', padding: '6px', borderRadius: '4px', wordBreak: 'break-all', marginTop: '4px', fontSize: '10px', color: '#334155' },
  reviewTextarea: { width: '100%', padding: '8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', boxSizing: 'border-box' },

  docViewerPaper: { border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#ffffff', padding: '20px', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.02)' },

  approveBtn: { flex: 1, padding: '8px 14px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '800', fontSize: '11px', cursor: 'pointer' },
  forceReReviewActionBtn: { flex: 1, padding: '8px 14px', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '800', fontSize: '11px', cursor: 'pointer' },
  rejectBtn: { flex: 1, padding: '8px 14px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '800', fontSize: '11px', cursor: 'pointer' }
};