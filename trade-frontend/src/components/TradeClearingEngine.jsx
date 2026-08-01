import React, { useState } from 'react';

export default function TradingPage({ onUpdateContract, onNavigate }) {
  const [commodity, setCommodity] = useState('Basmati Rice 1121');
  const [quantity, setQuantity] = useState(100); // Metric Tons
  const [pricePerTon, setPricePerTon] = useState(1240); // USD
  const [incoterm, setIncoterm] = useState('CIF - Cost, Insurance & Freight');

  // Total deal value calculated dynamically
  const dealValue = quantity * pricePerTon;

  const handleApplyToSettlement = () => {
    // Pass the contract parameters to the landing page / global state
    const contractData = {
      commodity,
      quantity,
      pricePerTon,
      dealValue,
      incoterm,
    };

    onUpdateContract?.(contractData);
    onNavigate?.('landing');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.badge}>TRADE EXECUTION & RFQ DESK</span>
        <h1 style={styles.title}>Create Export Contract Quote</h1>
        <p style={styles.subtitle}>
          Configure deal terms and export parameters. These values will drive the contract settlement console.
        </p>
      </div>

      <div style={styles.card}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Commodity</label>
          <select 
            value={commodity} 
            onChange={(e) => setCommodity(e.target.value)}
            style={styles.input}
          >
            <option value="Basmati Rice 1121">Basmati Rice 1121 (HS 1006.30)</option>
            <option value="Organic Turmeric Finger">Organic Turmeric Finger (HS 0910.30)</option>
            <option value="Non-GMO Soybeans">Non-GMO Soybeans (HS 1201.90)</option>
            <option value="Refined Palm Oil">Refined Palm Oil (HS 1511.90)</option>
          </select>
        </div>

        <div style={styles.row}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Volume (Metric Tons)</label>
            <input 
              type="number" 
              value={quantity} 
              onChange={(e) => setQuantity(Number(e.target.value))}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Unit Price (USD / MT)</label>
            <input 
              type="number" 
              value={pricePerTon} 
              onChange={(e) => setPricePerTon(Number(e.target.value))}
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Incoterm Terms</label>
          <select 
            value={incoterm} 
            onChange={(e) => setIncoterm(e.target.value)}
            style={styles.input}
          >
            <option value="FOB - Free on Board (Nhava Sheva)">FOB - Free on Board (Nhava Sheva)</option>
            <option value="CIF - Cost, Insurance & Freight (Rotterdam)">CIF - Cost, Insurance & Freight (Rotterdam)</option>
            <option value="CFR - Cost & Freight (Jebel Ali)">CFR - Cost & Freight (Jebel Ali)</option>
          </select>
        </div>

        {/* Calculated Total Summary */}
        <div style={styles.summaryBox}>
          <span style={styles.summaryLabel}>Total Contract Value:</span>
          <span style={styles.summaryValue}>${dealValue.toLocaleString()} USD</span>
        </div>

        <button style={styles.submitBtn} onClick={handleApplyToSettlement}>
          Push Parameters to Contract Settlement Console →
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '700px', margin: '2rem auto', padding: '0 1rem', fontFamily: 'system-ui, sans-serif' },
  header: { marginBottom: '1.5rem', textAlign: 'center' },
  badge: { fontSize: '0.75rem', fontWeight: '800', color: '#0284c7', letterSpacing: '0.05em' },
  title: { fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: '0.35rem 0' },
  subtitle: { color: '#64748b', fontSize: '0.95rem' },
  card: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  formGroup: { marginBottom: '1.25rem' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  label: { display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#334155', marginBottom: '0.35rem' },
  input: { width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.9rem', boxSizing: 'border-box' },
  summaryBox: { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1.5rem 0' },
  summaryLabel: { fontWeight: '700', color: '#64748b', fontSize: '0.9rem' },
  summaryValue: { fontWeight: '800', color: '#0f172a', fontSize: '1.25rem' },
  submitBtn: { width: '100%', backgroundColor: '#0284c7', color: '#ffffff', border: 'none', padding: '0.85rem', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.95rem' },
};