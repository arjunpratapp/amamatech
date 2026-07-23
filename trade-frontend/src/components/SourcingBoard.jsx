import React from 'react';

export default function SourcingBoard() {
  const activeIncomingRFQs = [
    { id: 'RFQ-AMAMA-091', buyer: 'EuroFood Import SpA', product: 'Non-GMO Yellow Maize', volume: '500 MT', terms: 'CIF Hamburg', payment: 'Escrow Confirmed' },
    { id: 'RFQ-AMAMA-088', buyer: 'Mideast Grain Trading', product: 'Premium Basmati Rice (Long Grain)', volume: '120 MT', terms: 'FOB Mumbai', payment: 'Awaiting Lock' }
  ];

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ margin: 0, fontSize: '26px', fontWeight: '700' }}>Inbound Global Demand Pipeline</h2>
        <p style={{ margin: '6px 0 0', color: '#9ca3af', fontSize: '14px' }}>International procurement offers addressed to Amama Exporters.</p>
      </div>

      <div style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #1f2937', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#1f2937', color: '#9ca3af', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '18px' }}>Transaction ID</th>
              <th style={{ padding: '18px' }}>Issuing Entity</th>
              <th style={{ padding: '18px' }}>Commodity Specification</th>
              <th style={{ padding: '18px' }}>Allocation</th>
              <th style={{ padding: '18px' }}>Incoterms Mapping</th>
              <th style={{ padding: '18px' }}>Escrow Status</th>
            </tr>
          </thead>
          <tbody>
            {activeIncomingRFQs.map((rfq) => (
              <tr key={rfq.id} style={{ borderBottom: '1px solid #1f2937', fontSize: '14px', transition: 'background 0.2s' }}>
                <td style={{ padding: '18px', fontWeight: '600', color: '#d97706' }}>{rfq.id}</td>
                <td style={{ padding: '18px', fontWeight: '500' }}>{rfq.buyer}</td>
                <td style={{ padding: '18px' }}>{rfq.product}</td>
                <td style={{ padding: '18px', color: '#cbd5e1' }}>{rfq.volume}</td>
                <td style={{ padding: '18px', color: '#f3f4f6' }}>{rfq.terms}</td>
                <td style={{ padding: '18px' }}> 
                  <span style={{ 
                    backgroundColor: rfq.payment === 'Escrow Confirmed' ? 'rgba(16,185,129,0.1)' : 'rgba(217,119,6,0.1)', 
                    color: rfq.payment === 'Escrow Confirmed' ? '#10b981' : '#d97706', 
                    padding: '6px 12px', 
                    borderRadius: '6px', 
                    fontSize: '12px',
                    fontWeight: '600',
                    border: rfq.payment === 'Escrow Confirmed' ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(217,119,6,0.2)'
                  }}>
                    {rfq.payment}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}