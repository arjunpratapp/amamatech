import React from 'react';

export default function ProductCatalog() {
  const mockInventory = [
    { sku: 'SUP-COP-01', name: '99.99% Pure Copper Cathodes', hsCode: '7403.11', moq: '25 MT', price: '$8,400 / MT' },
    { sku: 'SUP-COF-88', name: 'Arabica Coffee Beans (Green)', hsCode: '0901.11', moq: '10 MT', price: '$4,250 / MT' }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px' }}>Export Product Inventory</h2>
          <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '14px' }}>Configure your catalog visible to verified buyers.</p>
        </div>
        <button style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>
          + Add Export Product
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {mockInventory.map((item) => (
          <div key={item.sku} style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>{item.name}</h3>
              <span style={{ fontSize: '11px', color: '#94a3b8', backgroundColor: '#0f172a', padding: '2px 6px', borderRadius: '4px' }}>HS {item.hsCode}</span>
            </div>
            <div style={{ fontSize: '14px', color: '#cbd5e1', spaceY: '6px' }}>
              <div style={{ margin: '4px 0' }}>📦 MOQ: <strong>{item.moq}</strong></div>
              <div style={{ margin: '4px 0' }}>💰 Target Valuation: <strong style={{ color: '#10b981' }}>{item.price}</strong></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}