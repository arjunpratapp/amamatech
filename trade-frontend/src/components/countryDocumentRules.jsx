// countryDocumentRules.js
export const COUNTRY_DOCUMENT_MATRIX = {
    IN: {
      countryName: 'India',
      regulatoryBody: 'DGFT / RBI / GST Council',
      currency: 'INR / USD',
      documents: {
        DOMESTIC_SUPPLIER: [
          { key: 'panCard', label: 'Company PAN Card', desc: 'Permanent Account Number for corporate tax verification', required: true, format: '.pdf,.jpg' },
          { key: 'gstCert', label: 'GSTIN Registration', desc: 'Goods and Services Tax Identification Certificate', required: true, format: '.pdf' },
          { key: 'bankStatement', label: 'Bank Validation Ledger', desc: 'Cancelled cheque / Bank statement for escrow payouts', required: true, format: '.pdf' }
        ],
        EXPORT_SUPPLIER: [
          { key: 'panCard', label: 'Company PAN Card', desc: '10-digit tax identity card', required: true, format: '.pdf' },
          { key: 'gstCert', label: 'GSTIN Registration', desc: 'Active GST clearance certificate', required: true, format: '.pdf' },
          { key: 'iecDoc', label: 'DGFT IEC Certificate', desc: '10-digit Importer-Exporter Code clearance', required: true, format: '.pdf' },
          { key: 'adCodeDoc', label: 'Bank Stamped AD Code Letter', desc: 'Authorized Dealer code for foreign exchange routing', required: true, format: '.pdf' },
          { key: 'bankStatement', label: 'Escrow Settlement Bank Ledger', desc: 'Verified forex account statement', required: true, format: '.pdf' }
        ],
        DOMESTIC_BUYER: [
          { key: 'panCard', label: 'Company PAN Card', desc: 'Tax ID record', required: true, format: '.pdf' },
          { key: 'gstCert', label: 'GSTIN Certificate', desc: 'Input Tax Credit registration record', required: true, format: '.pdf' }
        ],
        IMPORT_BUYER: [
          { key: 'iecDoc', label: 'DGFT IEC File', desc: 'Importer-Exporter Code for customs clearance', required: true, format: '.pdf' },
          { key: 'gstCert', label: 'GSTIN Certificate', desc: 'Corporate tax identity', required: true, format: '.pdf' },
          { key: 'adCodeDoc', label: 'AD Code Authorization Letter', desc: 'Bank-linked forex transaction authorization', required: true, format: '.pdf' },
          { key: 'rcmcDoc', label: 'RCMC Promotion Council Ledger', desc: 'Export/Import incentive registration (Optional)', required: false, format: '.pdf' }
        ]
      },
      specialAddons: {
        PERISHABLE: [
          { key: 'fssaiDoc', label: 'Central FSSAI Operational License', desc: '14-digit food safety certification', required: true, format: '.pdf' },
          { key: 'phytosanitaryCert', label: 'Phytosanitary Clearance Run', desc: 'Agricultural sanitation clearance', required: true, format: '.pdf' },
          { key: 'commodityBoardDoc', label: 'Commodity Board Registry', desc: 'APEDA / Spices Board / MPEDA certificate', required: true, format: '.pdf' }
        ]
      }
    },
  
    AE: {
      countryName: 'United Arab Emirates',
      regulatoryBody: 'UAE Ministry of Economy / Customs Authorities',
      currency: 'AED / USD',
      documents: {
        DEFAULT: [
          { key: 'tradeLicense', label: 'Commercial / Trade License', desc: 'DED / Free Zone Trade License (e.g., JAFZA, DMCC)', required: true, format: '.pdf' },
          { key: 'taxDoc', label: 'VAT Registration Certificate', desc: 'Federal Tax Authority (FTA) TRN certificate', required: true, format: '.pdf' },
          { key: 'passportCopy', label: 'Manager / Owner Passport & Emirates ID', desc: 'KYC proof for designated signatory', required: true, format: '.pdf' },
          { key: 'bankStatement', label: 'Company Bank Reference Letter', desc: 'Official bank statement verifying SWIFT capabilities', required: true, format: '.pdf' }
        ]
      }
    },
  
    US: {
      countryName: 'United States',
      regulatoryBody: 'IRS / US Customs & Border Protection',
      currency: 'USD',
      documents: {
        DEFAULT: [
          { key: 'w9Form', label: 'IRS Form W-9 / W-8BEN-E', desc: 'Taxpayer Identification Number (EIN) and Certification', required: true, format: '.pdf' },
          { key: 'incorporationCert', label: 'Certificate of Incorporation / Articles of Org', desc: 'State filing incorporation proof', required: true, format: '.pdf' },
          { key: 'customsBond', label: 'Continuous Customs Bond (Imports)', desc: 'CBP Entry Authorization Bond for ocean cargo', required: false, format: '.pdf' },
          { key: 'bankStatement', label: 'Corporate Banking Verification Letter', desc: 'US FedWire / ACH routing ledger proof', required: true, format: '.pdf' }
        ]
      }
    },
  
    DEFAULT_INTL: {
      countryName: 'Rest of World (International Cross-Border)',
      regulatoryBody: 'International Trade Chamber / Local Tax Authority',
      currency: 'USD / EUR',
      documents: {
        DEFAULT: [
          { key: 'incorporationCert', label: 'Certificate of Incorporation', desc: 'Official registration from local corporate registry', required: true, format: '.pdf' },
          { key: 'taxDoc', label: 'Tax Residency Certificate (TRC)', desc: 'National tax registration proof', required: true, format: '.pdf' },
          { key: 'passportCopy', label: 'Authorized Signatory Passport Copy', desc: 'Identity proof of corporate representative', required: true, format: '.pdf' },
          { key: 'bankStatement', label: 'SWIFT Wire Bank Reference', desc: 'Corporate bank statement showing SWIFT/BIC code', required: true, format: '.pdf' }
        ]
      }
    }
  };