import React, { useState } from 'react';

export default function ProfileCapture({ role, sellerType, onNext, onBack }) {
  // PRODUCER State (SO-3)
  const [producerData, setProducerData] = useState({
    fullName: '',
    location: { lat: null, lng: null, addressText: '' },
    cultivatedArea: '',
    areaUnit: 'acres',
    crops: [],
    harvestMonths: [],
    seasonalVolumeTonnes: '',
    bankAccountNo: '',
    ifscCode: ''
  });

  // TRADER State (SO-3 Trader Branch)
  const [traderData, setTraderData] = useState({
    companyName: '',
    registrationNo: '',
    exportCapacityTonnes: '',
    existingMarkets: [],
    gstin: '',
    iecNumber: ''
  });

  // BUYER State (BO-1)
  const [buyerData, setBuyerData] = useState({
    legalName: '',
    buyerClass: 'importer', // importer, distributor, retail
    entityType: 'llc',
    jurisdictionCountry: 'UAE',
    emirateOrState: 'Dubai',
    portsOfEntry: [],
    registeredAddress: ''
  });

  const [isLocating, setIsLocating] = useState(false);

  // Capture GPS coordinates for Producer Farm Location (SO-3)
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setProducerData((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            addressText: `GPS: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`
          }
        }));
        setIsLocating(false);
      },
      (err) => {
        alert(`Location error: ${err.message}`);
        setIsLocating(false);
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (role === 'SUPPLIER') {
      const payload = sellerType === 'PRODUCER' ? producerData : traderData;
      onNext(payload);
    } else {
      onNext(buyerData);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>
          {role === 'SUPPLIER' 
            ? (sellerType === 'PRODUCER' ? 'SO-3 · Farm Profile' : 'SO-3 · Trader Capacity')
            : 'BO-1 · Buyer Legal Entity'}
        </h3>
        <p style={styles.subtitle}>
          {role === 'SUPPLIER' && sellerType === 'PRODUCER'
            ? 'GPS location & crop details for container matching'
            : 'Entity details for market clearance'}
        </p>
      </div>

      {/* ================= 1. PRODUCER FORM (SO-3) ================= */}
      {role === 'SUPPLIER' && sellerType === 'PRODUCER' && (
        <div style={styles.formGrid}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name (as on ID) *</label>
            <input 
              type="text" 
              required 
              style={styles.input} 
              value={producerData.fullName}
              onChange={(e) => setProducerData({ ...producerData, fullName: e.target.value })}
              placeholder="e.g. Ramesh Patel"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Farm Location (GPS Pin Required) *</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                readOnly 
                required
                style={{ ...styles.input, flex: 1 }} 
                value={producerData.location.addressText}
                placeholder="Click to drop pin"
              />
              <button 
                type="button" 
                onClick={handleGetLocation} 
                disabled={isLocating}
                style={styles.actionBtn}
              >
                {isLocating ? '📍 Pinning...' : '📍 Drop Pin'}
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ ...styles.field, flex: 2 }}>
              <label style={styles.label}>Cultivated Area *</label>
              <input 
                type="number" 
                required 
                style={styles.input} 
                value={producerData.cultivatedArea}
                onChange={(e) => setProducerData({ ...producerData, cultivatedArea: e.target.value })}
                placeholder="e.g. 15"
              />
            </div>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Unit</label>
              <select 
                style={styles.select}
                value={producerData.areaUnit}
                onChange={(e) => setProducerData({ ...producerData, areaUnit: e.target.value })}
              >
                <option value="acres">Acres</option>
                <option value="hectares">Hectares</option>
              </select>
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Bank Account + IFSC *</label>
            <input 
              type="text" 
              required 
              style={styles.input} 
              placeholder="Account Number"
              value={producerData.bankAccountNo}
              onChange={(e) => setProducerData({ ...producerData, bankAccountNo: e.target.value })}
            />
            <input 
              type="text" 
              required 
              style={{ ...styles.input, marginTop: '8px' }} 
              placeholder="IFSC Code (e.g. SBIN0001234)"
              value={producerData.ifscCode}
              onChange={(e) => setProducerData({ ...producerData, ifscCode: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* ================= 2. TRADER FORM (SO-3) ================= */}
      {role === 'SUPPLIER' && sellerType === 'TRADER' && (
        <div style={styles.formGrid}>
          <div style={styles.field}>
            <label style={styles.label}>Company Legal Name *</label>
            <input 
              type="text" 
              required 
              style={styles.input}
              value={traderData.companyName}
              onChange={(e) => setTraderData({ ...traderData, companyName: e.target.value })}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>IEC (Import Export Code) *</label>
            <input 
              type="text" 
              required 
              style={styles.input}
              value={traderData.iecNumber}
              onChange={(e) => setTraderData({ ...traderData, iecNumber: e.target.value })}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>GSTIN *</label>
            <input 
              type="text" 
              required 
              style={styles.input}
              value={traderData.gstin}
              onChange={(e) => setTraderData({ ...traderData, gstin: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* ================= 3. BUYER FORM (BO-1) ================= */}
      {role === 'BUYER' && (
        <div style={styles.formGrid}>
          <div style={styles.field}>
            <label style={styles.label}>Destination Country *</label>
            <select 
              style={styles.select}
              value={buyerData.jurisdictionCountry}
              onChange={(e) => setBuyerData({ ...buyerData, jurisdictionCountry: e.target.value })}
            >
              <option value="UAE">United Arab Emirates</option>
              <option value="KSA">Saudi Arabia</option>
              <option value="UK">United Kingdom</option>
              <option value="NL">Netherlands</option>
              <option value="DE">Germany</option>
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Emirate / State / Jurisdiction *</label>
            <input 
              type="text" 
              required 
              style={styles.input}
              placeholder="e.g. Dubai, Abu Dhabi, London"
              value={buyerData.emirateOrState}
              onChange={(e) => setBuyerData({ ...buyerData, emirateOrState: e.target.value })}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Legal Entity Name *</label>
            <input 
              type="text" 
              required 
              style={styles.input}
              value={buyerData.legalName}
              onChange={(e) => setBuyerData({ ...buyerData, legalName: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* Navigation Controls */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
        <button type="button" onClick={onBack} style={styles.backBtn}>Back</button>
        <button type="submit" style={styles.submitBtn}>Continue to Documents →</button>
      </div>
    </form>
  );
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '16px' },
  header: { marginBottom: '8px' },
  title: { fontSize: '16px', fontWeight: '800', color: '#ffffff', margin: '0 0 4px' },
  subtitle: { fontSize: '12px', color: '#94a3b8', margin: 0 },
  formGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  field: { display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '11px', fontWeight: '800', color: '#cbd5e1', textTransform: 'uppercase' },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontSize: '13px',
    outline: 'none'
  },
  select: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: '#0f172a',
    color: '#ffffff',
    fontSize: '13px',
    outline: 'none'
  },
  actionBtn: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid #10b981',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
    fontWeight: '700',
    fontSize: '12px',
    cursor: 'pointer'
  },
  backBtn: {
    flex: 1,
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: 'transparent',
    color: '#94a3b8',
    fontWeight: '700',
    cursor: 'pointer'
  },
  submitBtn: {
    flex: 2,
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    fontWeight: '800',
    cursor: 'pointer'
  }
};