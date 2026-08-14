import React, { useState, useMemo } from 'react';

// MULTI-ORDER DATASET WITH DUMMY DOCUMENT URLS FOR INTERACTIVITY
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
          { id: 'd101', name: 'Lot Record Certificate', status: 'VERIFIED', issuer: 'Farm Mgmt', hash: '0x8f2a...4b12', fileName: 'LOT_REC_8891.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', reviewNote: 'Approved by Logistics Desk', verifiedAt: '2026-08-01 07:00 IST' },
          { id: 'd102', name: 'Farm Origin Invoice', status: 'VERIFIED', issuer: 'Producer Desk', hash: '0x3c11...889e', fileName: 'FARM_INV_8891.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', reviewNote: 'Invoice verified', verifiedAt: '2026-08-01 07:15 IST' },
          { id: 'd103', name: 'Animal Health & Traceability Pass', status: 'VERIFIED', issuer: 'District Vet Officer', hash: '0x1a98...33ee', fileName: 'VET_PASS_8891.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', reviewNote: 'Primary vet clearance confirmed', verifiedAt: '2026-08-01 07:45 IST' }
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
          { id: 'd201', name: 'FSSAI License Certificate', status: 'VERIFIED', issuer: 'FSSAI Authority', hash: '0x99a1...11bc', fileName: 'FSSAI_8891.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', reviewNote: 'License verified & active', verifiedAt: '2026-08-01 11:00 IST' },
          { id: 'd202', name: 'Batch Code & QC Inspection Sheet', status: 'VERIFIED', issuer: 'QC Packhouse Unit', hash: '0x7e22...55da', fileName: 'QC_8891.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', reviewNote: 'Batch inspection clear', verifiedAt: '2026-08-01 11:30 IST' }
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
          { id: 'd301', name: 'RCMC Certificate (APEDA)', status: 'VERIFIED', issuer: 'APEDA India', hash: '0x12a4...998f', fileName: 'APEDA_RCMC.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', reviewNote: 'Registration active', verifiedAt: '2026-08-01 14:00 IST' },
          { id: 'd302', name: 'NABL Lab Test Report (Residue)', status: 'PENDING_REVIEW', issuer: 'NABL Testing Lab', hash: '0x88d1...22ef', fileName: 'NABL_REPORT.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', reviewNote: 'Awaiting Logistics Admin signoff', verifiedAt: null }
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
          { id: 'd401', name: 'Meat.Net / EIC e-Health Certificate', status: 'MISSING', issuer: 'EIC Portal', hash: null, fileName: null, url: null, reviewNote: '', verifiedAt: null }
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
          { id: 'd501', name: 'Reefer E-Way Bill & GPS Temp Log', status: 'MISSING', issuer: 'Transporters', hash: null, fileName: null, url: null, reviewNote: '', verifiedAt: null }
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
          { id: 'd101', name: 'Lot Record Certificate', status: 'VERIFIED', issuer: 'Farm Mgmt', hash: '0xa11b...9902', fileName: 'LOT_SPICE_8892.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', reviewNote: 'Approved', verifiedAt: '2026-08-01 08:30 IST' }
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
          { id: 'd201', name: 'FSSAI Spice License', status: 'VERIFIED', issuer: 'FSSAI Authority', hash: '0x33b1...776a', fileName: 'FSSAI_SPICE_8892.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', reviewNote: 'Approved', verifiedAt: '2026-08-01 12:30 IST' },
          { id: 'd202', name: 'Aflatoxin QC Test Sheet', status: 'PENDING_REVIEW', issuer: 'QC Unit', hash: '0x9911...4400', fileName: 'AFLATOXIN_TEST.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', reviewNote: 'Awaiting laboratory verification', verifiedAt: null }
        ]
      },
      {
        id: 'step-3',
        stageNumber: '03',
        stageName: 'APEDA Reg. + Lab Test',
        location: 'Spice Lab Facility',
        status: 'LOCKED',
        isManualLocked: false,
        requiredDocs: [{ id: 'd301', name: 'APEDA RCMC Registration', status: 'MISSING', issuer: 'APEDA', hash: null, fileName: null, url: null, reviewNote: '', verifiedAt: null }]
      },
      {
        id: 'step-4',
        stageNumber: '04',
        stageName: 'Health / Phytosanitary Cert',
        location: 'Plant Quarantine Station',
        status: 'LOCKED',
        isManualLocked: false,
        requiredDocs: [{ id: 'd401', name: 'Phytosanitary Clearance', status: 'MISSING', issuer: 'Phyto Dept', hash: null, fileName: null, url: null, reviewNote: '', verifiedAt: null }]
      },
      {
        id: 'step-5',
        stageNumber: '05',
        stageName: 'Transport to Port',
        location: 'Mumbai Port Gate 4',
        status: 'LOCKED',
        isManualLocked: false,
        requiredDocs: [{ id: 'd501', name: 'Port Gate Pass & E-Way Bill', status: 'MISSING', issuer: 'Transporter', hash: null, fileName: null, url: null, reviewNote: '', verifiedAt: null }]
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
        requiredDocs: [{ id: 'd101', name: 'Mango Orchard Traceability Cert', status: 'VERIFIED', issuer: 'State Horticulture', hash: '0x712a...1100', fileName: 'ORCHARD_TRACE_8893.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', reviewNote: 'Verified', verifiedAt: '2026-08-01 05:00 IST' }]
      },
      {
        id: 'step-2',
        stageNumber: '02',
        stageName: 'Processing & Packing',
        location: 'Vapour Heat Treatment Facility',
        status: 'COMPLETED',
        isManualLocked: false,
        requiredDocs: [{ id: 'd201', name: 'VHT / Irradiation Treatment Record', status: 'VERIFIED', issuer: 'MSAMB Facility', hash: '0x9922...44bb', fileName: 'IRRADIATION_CERT.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', reviewNote: 'Treatment confirmed', verifiedAt: '2026-08-01 10:00 IST' }]
      },
      {
        id: 'step-3',
        stageNumber: '03',
        stageName: 'APEDA Reg. + Lab Test',
        location: 'APEDA Export Certification Unit',
        status: 'COMPLETED',
        isManualLocked: false,
        requiredDocs: [{ id: 'd301', name: 'APEDA Mango.Net Traceability Pass', status: 'VERIFIED', issuer: 'APEDA Portal', hash: '0x5544...11aa', fileName: 'MANGONET_PASS.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', reviewNote: 'Traceability validated', verifiedAt: '2026-08-01 14:30 IST' }]
      },
      {
        id: 'step-4',
        stageNumber: '04',
        stageName: 'Health / Phytosanitary Cert',
        location: 'NPQS Quarantine Office',
        status: 'IN_PROGRESS',
        isManualLocked: false,
        requiredDocs: [{ id: 'd401', name: 'Phytosanitary Export Health Certificate', status: 'PENDING_REVIEW', issuer: 'NPQS Authority', hash: '0x8877...22cc', fileName: 'PHYTO_UK_EXPORT.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', reviewNote: 'Awaiting final signoff', verifiedAt: null }]
      },
      {
        id: 'step-5',
        stageNumber: '05',
        stageName: 'Cold-Chain Transport to Airport',
        location: 'Mumbai Airport Gate 2',
        status: 'LOCKED',
        isManualLocked: false,
        requiredDocs: [{ id: 'd501', name: 'Air Waybill (AWB) & Customs Pass', status: 'MISSING', issuer: 'Air India Cargo', hash: null, fileName: null, url: null, reviewNote: '', verifiedAt: null }]
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
          { id: 'd101', name: 'GMP Manufacturing Batch Record', status: 'VERIFIED', issuer: 'BioHealth QC', hash: '0x1234...5678', fileName: 'GMP_BATCH_8894.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', reviewNote: 'Passed QC', verifiedAt: '2026-08-01 11:30 IST' }
        ]
      },
      {
        id: 'step-2',
        stageNumber: '02',
        stageName: 'Cold Vault Packaging',
        location: 'CryoVault Bengaluru',
        status: 'LOCKED',
        isManualLocked: false,
        requiredDocs: [{ id: 'd201', name: 'Cryo Validation Report', status: 'MISSING', issuer: 'CryoShield', hash: null, fileName: null, url: null, reviewNote: '', verifiedAt: null }]
      },
      {
        id: 'step-3',
        stageNumber: '03',
        stageName: 'CDSCO & Lab Clearance',
        location: 'CDSCO Inspection Office',
        status: 'LOCKED',
        isManualLocked: false,
        requiredDocs: [{ id: 'd301', name: 'CDSCO Export NOC', status: 'MISSING', issuer: 'CDSCO', hash: null, fileName: null, url: null, reviewNote: '', verifiedAt: null }]
      },
      {
        id: 'step-4',
        stageNumber: '04',
        stageName: 'Export Health Certificate',
        location: 'DCGI Office',
        status: 'LOCKED',
        isManualLocked: false,
        requiredDocs: [{ id: 'd401', name: 'DCGI Clearance Pass', status: 'MISSING', issuer: 'DCGI', hash: null, fileName: null, url: null, reviewNote: '', verifiedAt: null }]
      },
      {
        id: 'step-5',
        stageNumber: '05',
        stageName: 'Reef-Air Express',
        location: 'Changi Cold Freight Hub',
        status: 'LOCKED',
        isManualLocked: false,
        requiredDocs: [{ id: 'd501', name: 'Air Freight Reefer Manifest', status: 'MISSING', issuer: 'Singapore Freight', hash: null, fileName: null, url: null, reviewNote: '', verifiedAt: null }]
      }
    ]
  },
  {
    orderId: 'ORD-2026-8895',
    cargo: 'Fresh Marine Seafood (300 kg)',
    serviceType: 'Ocean Freight',
    destinationCountry: 'Japan',
    destination: 'Tokyo Port, Japan',
    driver: 'K. Parthiban (TN-02-CC-8812)',
    tempTelemetry: '-2.4 °C (Iced Slurry)',
    originLocation: 'Kochi Harbor Cold Storage, Kerala',
    currentLocation: 'Chennai Port Container Yard',
    finalLocation: 'Kochi Ocean Port Terminal',
    trackingProgressPct: 100,
    eta: 'Delivered @ Tokyo Port (Completed)',
    vendorChain: [
      { stage: '01 - Marine Harvest Dock', vendorName: 'Kochi Harbor Fisheries Co-Op', handler: 'K. Parthiban', contact: '+91-9844112233', timestamp: '2026-07-28 05:00 IST', status: 'HANDOFF_COMPLETE' },
      { stage: '02 - Processing & Packing', vendorName: 'Kerala CryoSeafood Packers', handler: 'M. Nair', contact: '+91-9855223344', timestamp: '2026-07-28 10:00 IST', status: 'HANDOFF_COMPLETE' },
      { stage: '03 - MPEDA Reg. & Testing', vendorName: 'MPEDA Export Quality Lab', handler: 'Dr. C. Joseph', contact: '+91-9866334455', timestamp: '2026-07-29 14:00 IST', status: 'HANDOFF_COMPLETE' },
      { stage: '04 - Health & Catch Certificate', vendorName: 'Export Inspection Agency Kochi', handler: 'Officer T. George', contact: '+91-9877445566', timestamp: '2026-07-30 09:00 IST', status: 'HANDOFF_COMPLETE' },
      { stage: '05 - Reef Ocean Freight', vendorName: 'Pacific Express Lines', handler: 'Capt. Tanaka', contact: '+81-9011223344', timestamp: '2026-08-01 08:00 JST', status: 'HANDOFF_COMPLETE' }
    ],
    milestones: [
      {
        id: 'step-1',
        stageNumber: '01',
        stageName: 'Marine Harvest Dock',
        location: 'Kochi Harbor Terminal',
        status: 'COMPLETED',
        isManualLocked: false,
        requiredDocs: [{ id: 'd101', name: 'Catch Log & Harbor Origin Pass', status: 'VERIFIED', issuer: 'Kochi Harbor Auth', hash: '0x9001...22ff', fileName: 'CATCH_LOG_8895.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', reviewNote: 'Verified origin', verifiedAt: '2026-07-28 06:00 IST' }]
      },
      {
        id: 'step-2',
        stageNumber: '02',
        stageName: 'Processing & Packing',
        location: 'Kerala Processing Center',
        status: 'COMPLETED',
        isManualLocked: false,
        requiredDocs: [{ id: 'd201', name: 'Seafood EU/Japan Hygiene Cert', status: 'VERIFIED', issuer: 'Packhouse QC', hash: '0x8002...33ee', fileName: 'HYGIENE_CERT.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', reviewNote: 'Clear', verifiedAt: '2026-07-28 11:00 IST' }]
      },
      {
        id: 'step-3',
        stageNumber: '03',
        stageName: 'MPEDA Reg. & Testing',
        location: 'MPEDA Testing Facility',
        status: 'COMPLETED',
        isManualLocked: false,
        requiredDocs: [{ id: 'd301', name: 'MPEDA Catch Quality Clearance', status: 'VERIFIED', issuer: 'MPEDA India', hash: '0x7003...44dd', fileName: 'MPEDA_PASS.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', reviewNote: 'Lab cleared', verifiedAt: '2026-07-29 15:00 IST' }]
      },
      {
        id: 'step-4',
        stageNumber: '04',
        stageName: 'Health & Catch Certificate',
        location: 'EIA Office Kochi',
        status: 'COMPLETED',
        isManualLocked: false,
        requiredDocs: [{ id: 'd401', name: 'Health Certificate for Japan Export', status: 'VERIFIED', issuer: 'EIA Authority', hash: '0x6004...55cc', fileName: 'HEALTH_JAPAN.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', reviewNote: 'Export clearance complete', verifiedAt: '2026-07-30 10:00 IST' }]
      },
      {
        id: 'step-5',
        stageNumber: '05',
        stageName: 'Reef Ocean Freight',
        location: 'Tokyo Ocean Freight Berth',
        status: 'COMPLETED',
        isManualLocked: false,
        requiredDocs: [{ id: 'd501', name: 'Bill of Lading & Custom Discharge', status: 'VERIFIED', issuer: 'Pacific Lines', hash: '0x5005...66bb', fileName: 'BL_TOKYO.pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', reviewNote: 'Delivered & Escrow Settled', verifiedAt: '2026-08-01 09:00 JST' }]
      }
    ]
  }
];

export default function LogisticsWorkspace({ user }) {
  const [orders, setOrders] = useState(INITIAL_ORDERS_DATA);
  const [selectedOrderId, setSelectedOrderId] = useState('ORD-2026-8891');
  const [selectedStageId, setSelectedStageId] = useState('step-3');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServiceFilter, setSelectedServiceFilter] = useState('ALL');
  const [selectedCountryFilter, setSelectedCountryFilter] = useState('ALL');

  // Toast / Banner
  const [toastMessage, setToastMessage] = useState('');

  // Upload modal state
  const [uploadModalState, setUploadModalState] = useState({
    isOpen: false,
    orderId: null,
    milestoneId: null,
    docId: null,
    docName: ''
  });
  const [uploadFileName, setUploadFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Derived Active Order & Milestone
  const activeOrder = useMemo(() => {
    return orders.find(o => o.orderId === selectedOrderId) || orders[0];
  }, [orders, selectedOrderId]);

  const activeMilestone = useMemo(() => {
    if (!activeOrder) return null;
    return activeOrder.milestones.find(m => m.id === selectedStageId) || activeOrder.milestones[0];
  }, [activeOrder, selectedStageId]);

  // Derived Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchesSearch = o.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            o.cargo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            o.destination.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesService = selectedServiceFilter === 'ALL' || o.serviceType === selectedServiceFilter;
      const matchesCountry = selectedCountryFilter === 'ALL' || o.destinationCountry === selectedCountryFilter;
      return matchesSearch && matchesService && matchesCountry;
    });
  }, [orders, searchQuery, selectedServiceFilter, selectedCountryFilter]);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // HANDLER: Review / Approve Document
  const handleApproveDocument = (orderId, milestoneId, docId) => {
    setOrders(prevOrders => {
      return prevOrders.map(ord => {
        if (ord.orderId !== orderId) return ord;

        const updatedMilestones = ord.milestones.map(ms => {
          if (ms.id !== milestoneId) return ms;

          const updatedDocs = ms.requiredDocs.map(doc => {
            if (doc.id !== docId) return doc;
            return {
              ...doc,
              status: 'VERIFIED',
              reviewNote: 'Approved by Logistics Admin',
              verifiedAt: new Date().toLocaleDateString('en-US') + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ' IST',
              hash: doc.hash || '0x' + Math.random().toString(16).substr(2, 8) + '...' + Math.random().toString(16).substr(2, 4)
            };
          });

          // Check if all documents in this stage are now VERIFIED
          const allDocsVerified = updatedDocs.every(d => d.status === 'VERIFIED');
          const newStageStatus = allDocsVerified ? 'COMPLETED' : ms.status;

          return {
            ...ms,
            status: newStageStatus,
            requiredDocs: updatedDocs
          };
        });

        // Auto-unlock next milestone if current is COMPLETED
        let newlyUnlockedMilestones = [...updatedMilestones];
        const currentIdx = newlyUnlockedMilestones.findIndex(m => m.id === milestoneId);
        if (currentIdx !== -1 && newlyUnlockedMilestones[currentIdx].status === 'COMPLETED' && currentIdx + 1 < newlyUnlockedMilestones.length) {
          if (newlyUnlockedMilestones[currentIdx + 1].status === 'LOCKED' && !newlyUnlockedMilestones[currentIdx + 1].isManualLocked) {
            newlyUnlockedMilestones[currentIdx + 1] = {
              ...newlyUnlockedMilestones[currentIdx + 1],
              status: 'IN_PROGRESS'
            };
          }
        }

        // Recalculate progress percentage
        const completedCount = newlyUnlockedMilestones.filter(m => m.status === 'COMPLETED').length;
        const newProgress = Math.round((completedCount / newlyUnlockedMilestones.length) * 100);

        return {
          ...ord,
          trackingProgressPct: newProgress,
          milestones: newlyUnlockedMilestones
        };
      });
    });

    triggerToast(`✅ Document verified on cryptographic ledger! Stage updated.`);
  };

  // HANDLER: Toggle Manual Lock / Freeze
  const handleToggleStageLock = (orderId, milestoneId) => {
    setOrders(prevOrders => {
      return prevOrders.map(ord => {
        if (ord.orderId !== orderId) return ord;

        const updatedMilestones = ord.milestones.map(ms => {
          if (ms.id !== milestoneId) return ms;

          const willLock = !ms.isManualLocked;
          return {
            ...ms,
            isManualLocked: willLock,
            status: willLock ? 'LOCKED' : (ms.requiredDocs.every(d => d.status === 'VERIFIED') ? 'COMPLETED' : 'IN_PROGRESS')
          };
        });

        return {
          ...ord,
          milestones: updatedMilestones
        };
      });
    });

    triggerToast(`🔒 Milestone manual lock state toggled! Control updated.`);
  };

  // HANDLER: Local File Selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!uploadFileName) {
        setUploadFileName(file.name);
      }
    }
  };

  // HANDLER: Upload File Submission
  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadFileName) return;

    const { orderId, milestoneId, docId } = uploadModalState;
    // Create clickable preview/download URL from uploaded File or fallback
    const generatedUrl = selectedFile ? URL.createObjectURL(selectedFile) : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

    setOrders(prevOrders => {
      return prevOrders.map(ord => {
        if (ord.orderId !== orderId) return ord;

        const updatedMilestones = ord.milestones.map(ms => {
          if (ms.id !== milestoneId) return ms;

          const updatedDocs = ms.requiredDocs.map(doc => {
            if (doc.id !== docId) return doc;
            return {
              ...doc,
              fileName: uploadFileName,
              url: generatedUrl,
              status: 'PENDING_REVIEW',
              hash: '0x' + Math.random().toString(16).substr(2, 8) + '...upload'
            };
          });

          return {
            ...ms,
            status: ms.status === 'LOCKED' ? 'IN_PROGRESS' : ms.status,
            requiredDocs: updatedDocs
          };
        });

        return {
          ...ord,
          milestones: updatedMilestones
        };
      });
    });

    setUploadModalState({ isOpen: false, orderId: null, milestoneId: null, docId: null, docName: '' });
    setUploadFileName('');
    setSelectedFile(null);
    triggerToast(`📄 File "${uploadFileName}" uploaded successfully! Sent for review.`);
  };

  return (
    <div style={styles.appContainer}>
      <style>{`
        @keyframes greenPulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .animated-card { transition: all 0.2s ease-in-out; }
        .animated-card:hover { transform: translateY(-2px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.1); }
        .interactive-btn { transition: all 0.2s ease; cursor: pointer; }
        .interactive-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .interactive-btn:active { transform: translateY(1px); }
      `}</style>

      {/* TOAST NOTIFICATION BANNER */}
      {toastMessage && (
        <div style={styles.toastBanner}>
          <span style={styles.toastDot}></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP BRAND HEADER */}
      <header style={styles.topHeader}>
        <div style={styles.brandGroup}>
          <div style={styles.brandIcon}>🚛</div>
          <div>
            <div style={styles.brandTitle}>PERISHABLE CARGO LOGISTICS &amp; COMPLIANCE CONTROL</div>
            <div style={styles.brandSub}>Cross-Border Document Gatekeeper &amp; Cold-Chain Telemetry</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={styles.liveBadge}>
            <span style={styles.liveDot}></span>
            <span>APEDA &amp; ICEGATE LEDGER: <strong>SYNCED</strong></span>
          </div>

          <div style={styles.userChip}>
            <span>👮</span>
            <div>
              <div style={{ fontSize: '11px', fontWeight: '800' }}>{user?.email || 'Logistics Admin Desk'}</div>
              <div style={{ fontSize: '9px', color: '#38bdf8' }}>{user?.role || 'CUSTOMS CLEARANCE OFFICER'}</div>
            </div>
          </div>
        </div>
      </header>

      {/* FILTER & CONTROL BAR */}
      <div style={styles.filterBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={styles.searchBox}>
            <span style={{ fontSize: '13px' }}>🔍</span>
            <input
              type="text"
              placeholder="Search Order ID, Cargo, Port..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {/* SERVICE TYPE FILTER */}
          <select
            value={selectedServiceFilter}
            onChange={(e) => setSelectedServiceFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="ALL">All Service Types</option>
            <option value="Ocean Freight">Ocean Freight 🚢</option>
            <option value="Air Freight">Air Freight ✈️</option>
            <option value="Trucking">Trucking 🚚</option>
            <option value="Booking Management">Booking Management 📋</option>
          </select>

          {/* DESTINATION COUNTRY FILTER */}
          <select
            value={selectedCountryFilter}
            onChange={(e) => setSelectedCountryFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="ALL">All Destination Countries 🌍</option>
            <option value="United Arab Emirates">United Arab Emirates (UAE)</option>
            <option value="Netherlands">Netherlands (EU)</option>
            <option value="United Kingdom">United Kingdom (UK)</option>
            <option value="Singapore">Singapore</option>
            <option value="Japan">Japan</option>
          </select>
        </div>

        <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b' }}>
          Showing <strong>{filteredOrders.length}</strong> of {orders.length} Active Consignments
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE */}
      <div style={styles.workspaceGrid}>
        
        {/* LEFT COLUMN: ORDER SELECTION & TELEMETRY */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* CARGO CONSIGNMENT LIST */}
          <div style={styles.cardBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '900', margin: 0, color: '#0f172a' }}>
                📦 Active Cold-Chain Orders
              </h3>
              <span style={{ fontSize: '10px', fontWeight: '800', color: '#0284c7', backgroundColor: '#e0f2fe', padding: '2px 8px', borderRadius: '10px' }}>
                LIVE DISPATCH
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
              {filteredOrders.map(ord => {
                const isSelected = ord.orderId === activeOrder.orderId;

                return (
                  <div
                    key={ord.orderId}
                    style={{
                      ...styles.orderCardItem,
                      borderColor: isSelected ? '#0284c7' : '#e2e8f0',
                      backgroundColor: isSelected ? '#f0f9ff' : '#ffffff'
                    }}
                    className="interactive-btn animated-card"
                    onClick={() => {
                      setSelectedOrderId(ord.orderId);
                      setSelectedStageId(ord.milestones[0].id);
                      triggerToast(`Selected Order: ${ord.orderId} (${ord.cargo})`);
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: '900', color: '#0f172a' }}>{ord.orderId}</div>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#0284c7', marginTop: '2px' }}>{ord.cargo}</div>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', color: '#475569' }}>
                        {ord.serviceType}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '10px', color: '#64748b' }}>
                      <span>📍 {ord.destinationCountry}</span>
                      <span style={{ fontWeight: '800', color: ord.trackingProgressPct === 100 ? '#10b981' : '#0f172a' }}>
                        Progress: {ord.trackingProgressPct}%
                      </span>
                    </div>

                    <div style={{ width: '100%', height: '4px', backgroundColor: '#e2e8f0', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                      <div style={{ width: `${ord.trackingProgressPct}%`, height: '100%', backgroundColor: ord.trackingProgressPct === 100 ? '#10b981' : '#0284c7' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTIVE CONSIGNMENT TELEMETRY CARD */}
          <div style={{ ...styles.cardBox, borderLeft: '5px solid #0284c7' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '10px', fontWeight: '900', color: '#0284c7', letterSpacing: '0.5px' }}>
                  CONSIGNMENT TELEMETRY &amp; HANDOFF
                </span>
                <h2 style={{ fontSize: '16px', fontWeight: '900', margin: '2px 0 0 0', color: '#0f172a' }}>
                  {activeOrder.cargo}
                </h2>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  Order ID: <strong>{activeOrder.orderId}</strong> | Driver: <strong>{activeOrder.driver}</strong>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '10px', fontWeight: '800', color: '#64748b' }}>TEMPERATURE SENSOR</div>
                <div style={{ fontSize: '13px', fontWeight: '900', color: '#0369a1', backgroundColor: '#e0f2fe', padding: '4px 8px', borderRadius: '6px', marginTop: '2px' }}>
                  🌡️ {activeOrder.tempTelemetry}
                </div>
              </div>
            </div>

            {/* ROUTE INFO */}
            <div style={styles.routeBox}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11px' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '9px', fontWeight: '800' }}>CURRENT GPS LOCATION</span>
                  <div style={{ fontWeight: '800', color: '#0f172a' }}>📍 {activeOrder.currentLocation}</div>
                </div>
                <div>
                  <span style={{ color: '#64748b', fontSize: '9px', fontWeight: '800' }}>FINAL DESTINATION</span>
                  <div style={{ fontWeight: '800', color: '#0f172a' }}>⚓ {activeOrder.destination}</div>
                </div>
              </div>
              <div style={{ fontSize: '10px', color: '#0369a1', marginTop: '6px', fontWeight: '700' }}>
                ⏱️ Estimated Port Arrival: {activeOrder.eta}
              </div>
            </div>

            {/* CHAIN OF CUSTODY HANDOFF LOG */}
            <div style={{ marginTop: '14px' }}>
              <div style={{ fontSize: '10px', fontWeight: '900', color: '#64748b', marginBottom: '8px' }}>
                🔗 CUSTODY HANDOFF LOG (5 MANDATORY VENDORS)
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {activeOrder.vendorChain.map((v, idx) => (
                  <div key={idx} style={styles.vendorRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '900', color: '#0284c7' }}>{v.stage.split(' - ')[0]}</span>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a' }}>{v.vendorName}</div>
                        <div style={{ fontSize: '9.5px', color: '#64748b' }}>Handler: {v.handler} ({v.contact})</div>
                      </div>
                    </div>

                    <span style={{
                      fontSize: '9px',
                      fontWeight: '900',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: v.status === 'HANDOFF_COMPLETE' ? '#dcfce7' : v.status === 'IN_CUSTODY' ? '#e0f2fe' : '#f1f5f9',
                      color: v.status === 'HANDOFF_COMPLETE' ? '#15803d' : v.status === 'IN_CUSTODY' ? '#0369a1' : '#64748b'
                    }}>
                      {v.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: 5-STEP MILESTONE PIPELINE & DOCUMENT REVIEW */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* STEPPER NAVIGATOR */}
          <div style={styles.cardBox}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '900', margin: 0, color: '#0f172a' }}>
                🚀 Cross-Border Compliance Milestone Pipeline
              </h3>
              <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '700' }}>Select stage to review documents</span>
            </div>

            <div style={styles.stepperContainer}>
              {activeOrder.milestones.map((m) => {
                const isSelected = m.id === selectedStageId;
                const isCompleted = m.status === 'COMPLETED';
                const isInProgress = m.status === 'IN_PROGRESS';
                const isLocked = m.status === 'LOCKED' || m.isManualLocked;

                return (
                  <div
                    key={m.id}
                    style={{
                      ...styles.stepperTab,
                      borderColor: isSelected ? '#0284c7' : '#e2e8f0',
                      backgroundColor: isSelected ? '#0284c7' : isCompleted ? '#f0fdf4' : isInProgress ? '#f0f9ff' : '#f8fafc',
                      color: isSelected ? '#ffffff' : '#0f172a'
                    }}
                    className="interactive-btn"
                    onClick={() => {
                      setSelectedStageId(m.id);
                      triggerToast(`Switched to Milestone ${m.stageNumber}: ${m.stageName}`);
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: '900' }}>
                      {isCompleted ? '✓' : isLocked ? '🔒' : '●'} Stage {m.stageNumber}
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '90px' }}>
                      {m.stageName.split(' ')[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTIVE MILESTONE DETAIL & DOCUMENT AUDIT PANEL */}
          {activeMilestone && (
            <div style={styles.cardBox}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', pb: '10px', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: '900', color: '#0284c7' }}>
                    STAGE {activeMilestone.stageNumber} OF 05 COMPLIANCE GATEWAY
                  </div>
                  <h2 style={{ fontSize: '16px', fontWeight: '900', margin: '2px 0 0 0', color: '#0f172a' }}>
                    {activeMilestone.stageName}
                  </h2>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>📍 Node Location: {activeMilestone.location}</div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    style={{
                      ...styles.lockToggleBtn,
                      backgroundColor: activeMilestone.isManualLocked ? '#ef4444' : '#ffffff',
                      color: activeMilestone.isManualLocked ? '#ffffff' : '#334155'
                    }}
                    className="interactive-btn"
                    onClick={() => handleToggleStageLock(activeOrder.orderId, activeMilestone.id)}
                  >
                    {activeMilestone.isManualLocked ? '🔒 STAGE LOCKED MANUALLY' : '🔓 LOCK STAGE'}
                  </button>

                  <span style={{
                    fontSize: '11px',
                    fontWeight: '900',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    backgroundColor: activeMilestone.status === 'COMPLETED' ? '#dcfce7' : activeMilestone.status === 'IN_PROGRESS' ? '#e0f2fe' : '#fee2e2',
                    color: activeMilestone.status === 'COMPLETED' ? '#15803d' : activeMilestone.status === 'IN_PROGRESS' ? '#0369a1' : '#b91c1c'
                  }}>
                    {activeMilestone.status}
                  </span>
                </div>
              </div>

              {/* REQUIRED DOCUMENTS GATEKEEPER LIST */}
              <div>
                <div style={{ fontSize: '11px', fontWeight: '900', color: '#0f172a', marginBottom: '10px' }}>
                  📋 Mandatory Documents Required to Clear Stage {activeMilestone.stageNumber}:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activeMilestone.requiredDocs.map(doc => {
                    const isVerified = doc.status === 'VERIFIED';
                    const isPending = doc.status === 'PENDING_REVIEW';
                    const isMissing = doc.status === 'MISSING';

                    return (
                      <div key={doc.id} style={{
                        ...styles.docAuditCard,
                        borderColor: isVerified ? '#bbf7d0' : isPending ? '#bae6fd' : '#fecaca',
                        backgroundColor: isVerified ? '#f0fdf4' : isPending ? '#f0f9ff' : '#fef2f2'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span style={{ fontSize: '20px' }}>{isVerified ? '📜' : isPending ? '⏳' : '⚠️'}</span>
                            <div>
                              {/* CLICKABLE DOCUMENT TITLE LINK */}
                              {doc.url ? (
                                <a 
                                  href={doc.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  style={styles.clickableDocTitle}
                                  title="Click to preview file"
                                >
                                  📄 {doc.name} ↗
                                </a>
                              ) : (
                                <div style={{ fontSize: '12px', fontWeight: '900', color: '#0f172a' }}>{doc.name}</div>
                              )}
                              <div style={{ fontSize: '10px', color: '#64748b' }}>Authority Issuer: <strong>{doc.issuer}</strong></div>
                              {doc.fileName && (
                                <div style={{ fontSize: '10px', color: '#0284c7', fontWeight: '800', marginTop: '2px' }}>
                                  📎 File: {doc.fileName} | Hash: <code style={{ fontSize: '9px' }}>{doc.hash}</code>
                                </div>
                              )}
                            </div>
                          </div>

                          <span style={{
                            fontSize: '9.5px',
                            fontWeight: '900',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            backgroundColor: isVerified ? '#dcfce7' : isPending ? '#e0f2fe' : '#fee2e2',
                            color: isVerified ? '#15803d' : isPending ? '#0369a1' : '#b91c1c'
                          }}>
                            {doc.status}
                          </span>
                        </div>

                        {/* REVIEW NOTE & ACTION BUTTONS */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                          <div style={{ fontSize: '10px', color: '#475569', fontStyle: 'italic' }}>
                            {doc.reviewNote ? `Note: "${doc.reviewNote}"` : 'Awaiting document upload/verification.'}
                            {doc.verifiedAt && <span style={{ color: '#16a34a', fontWeight: '800' }}> · Verified at {doc.verifiedAt}</span>}
                          </div>

                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            {/* CLICKABLE VIEW & DOWNLOAD BUTTONS */}
                            {doc.url && (
                              <>
                                <a
                                  href={doc.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={styles.viewSmallBtn}
                                  className="interactive-btn"
                                >
                                  👁️ View
                                </a>
                                <a
                                  href={doc.url}
                                  download={doc.fileName || `${doc.name}.pdf`}
                                  style={styles.downloadSmallBtn}
                                  className="interactive-btn"
                                >
                                  ⬇️ Download
                                </a>
                              </>
                            )}

                            {isMissing && (
                              <button
                                style={styles.uploadSmallBtn}
                                className="interactive-btn"
                                onClick={() => setUploadModalState({
                                  isOpen: true,
                                  orderId: activeOrder.orderId,
                                  milestoneId: activeMilestone.id,
                                  docId: doc.id,
                                  docName: doc.name
                                })}
                              >
                                Upload Document 📤
                              </button>
                            )}

                            {isPending && (
                              <button
                                style={styles.approveSmallBtn}
                                className="interactive-btn"
                                onClick={() => handleApproveDocument(activeOrder.orderId, activeMilestone.id, doc.id)}
                              >
                                Approve & Sign Ledger ✓
                              </button>
                            )}

                            {isVerified && (
                              <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '900', marginLeft: '4px' }}>
                                LOCKED ON-CHAIN 🔒
                              </span>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* UPLOAD DOCUMENT POPUP MODAL */}
      {uploadModalState.isOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <span style={{ fontWeight: '900', fontSize: '12px' }}>📤 Upload Compliance Document</span>
              <button style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }} onClick={() => setUploadModalState({ isOpen: false, orderId: null, milestoneId: null, docId: null, docName: '' })}>✕</button>
            </div>

            <form onSubmit={handleUploadSubmit} style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '11px', color: '#334155' }}>
                Uploading required document for <strong>{uploadModalState.docName}</strong> ({uploadModalState.orderId})
              </div>

              <div>
                <label style={{ fontSize: '9px', fontWeight: '800', color: '#64748b' }}>FILE NAME / CERTIFICATE REFERENCE</label>
                <input
                  type="text"
                  placeholder="e.g. MEAT_NET_HEALTH_CERT_2026.pdf"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  style={styles.modalInput}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '9px', fontWeight: '800', color: '#64748b' }}>SELECT ATTACHMENT (PDF / IMAGE)</label>
                <input type="file" onChange={handleFileChange} style={styles.modalInput} />
              </div>

              <button type="submit" style={styles.modalSubmitBtn} className="interactive-btn">
                Submit for Verification 🚀
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// STYLES OBJECT
const styles = {
  appContainer: { width: '100%', minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  toastBanner: { position: 'fixed', top: '16px', right: '20px', backgroundColor: '#0f172a', color: '#ffffff', padding: '10px 18px', borderRadius: '30px', fontSize: '12px', fontWeight: '800', zIndex: 10000, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' },
  toastDot: { width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', animation: 'greenPulse 1.5s infinite ease-in-out' },

  topHeader: { background: 'linear-gradient(135deg, #0f172a, #0369a1)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff' },
  brandGroup: { display: 'flex', alignItems: 'center', gap: '10px' },
  brandIcon: { width: '32px', height: '32px', backgroundColor: '#0284c7', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' },
  brandTitle: { fontSize: '12px', fontWeight: '900', letterSpacing: '0.5px' },
  brandSub: { fontSize: '9.5px', color: '#7dd3fc' },

  liveBadge: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '20px', fontSize: '10px' },
  liveDot: { width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#10b981' },
  userChip: { backgroundColor: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' },

  filterBar: { backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '10px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f1f5f9', padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '220px' },
  searchInput: { border: 'none', background: 'transparent', outline: 'none', fontSize: '11px', width: '100%' },
  filterSelect: { padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', fontWeight: '700', backgroundColor: '#ffffff', color: '#334155' },

  workspaceGrid: { padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '20px' },
  cardBox: { backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' },
  orderCardItem: { padding: '10px', borderRadius: '8px', border: '1px solid', cursor: 'pointer' },

  routeBox: { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '8px', marginTop: '12px' },
  vendorRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9' },

  stepperContainer: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' },
  stepperTab: { padding: '8px 6px', borderRadius: '6px', border: '1px solid', textAlign: 'center', cursor: 'pointer' },

  lockToggleBtn: { border: '1px solid #cbd5e1', padding: '4px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '800' },
  docAuditCard: { padding: '12px', borderRadius: '8px', border: '1px solid' },

  clickableDocTitle: { fontSize: '12px', fontWeight: '900', color: '#0284c7', textDecoration: 'underline', cursor: 'pointer' },
  viewSmallBtn: { backgroundColor: '#e0f2fe', color: '#0369a1', textDecoration: 'none', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800', display: 'inline-block' },
  downloadSmallBtn: { backgroundColor: '#0284c7', color: '#ffffff', textDecoration: 'none', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800', display: 'inline-block' },

  uploadSmallBtn: { backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: '800' },
  approveSmallBtn: { backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '10px', fontWeight: '800' },

  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(3px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  modalCard: { backgroundColor: '#ffffff', borderRadius: '10px', width: '360px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' },
  modalHeader: { backgroundColor: '#0f172a', color: '#ffffff', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  modalInput: { width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '11px', marginTop: '4px', boxSizing: 'border-box' },
  modalSubmitBtn: { width: '100%', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '10px', borderRadius: '6px', fontSize: '12px', fontWeight: '800', marginTop: '8px' }
};