import React, { useState, useEffect } from 'react';

export default function LiveMarketOverview({ hsCode = '080510', onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`/api/v1/market-overview?hsCode=${hsCode}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load market data');
        return res.json();
      })
      .then((payload) => {
        if (isMounted) {
          setData(payload);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [hsCode]);

  if (loading) return <div style={styles.loadingContainer}>Loading Market Overview...</div>;
  if (error || !data) return <div style={styles.errorContainer}>Error loading data.</div>;

  const { product, marketInsight, sidebar } = data;

  return (
    <div style={styles.pageContainer}>
      {/* 1. Header Metadata Section */}
      <div style={styles.headerArea}>
        <div style={styles.titleRow}>
          <div style={styles.titleWithIcon}>
            <span style={styles.icon}>🍊</span>
            <h1 style={styles.pageTitle}>{product.title}</h1>
          </div>
          <button style={styles.ctaButton}>Get Fresh Orange Intelligence</button>
        </div>

        <div style={styles.metaGrid}>
          <div style={styles.metaCol}>
            <span style={styles.metaLabel}>Sub Product</span>
            <span style={styles.metaValue}>{product.subProducts}</span>
          </div>
          <div style={styles.metaCol}>
            <span style={styles.metaLabel}>Derived Products</span>
            <span style={styles.metaValue}>{product.derivedProducts}</span>
          </div>
          <div style={styles.metaColShort}>
            <span style={styles.metaLabel}>HS Code</span>
            <span style={styles.metaValue}>{product.hsCode}</span>
          </div>
          <div style={styles.metaColShort}>
            <span style={styles.metaLabel}>Last Updated</span>
            <span style={styles.metaValue}>{product.lastUpdated}</span>
          </div>
        </div>
      </div>

      <hr style={styles.divider} />

      {/* 2. Main Layout */}
      <div style={styles.contentLayout}>
        
        {/* Left Content Track */}
        <div style={styles.leftColumn}>
          <h2 style={styles.sectionHeadline}>{marketInsight.headline}</h2>
          <p style={styles.descriptionText}>{marketInsight.description}</p>

          <h3 style={styles.subHeadline}>{marketInsight.yoySectionTitle}</h3>
          <p style={styles.descriptionText}>{marketInsight.yoyDescription}</p>

          <div style={styles.topShiftsNote}>
            Top YoY shifts for Fresh Orange: {marketInsight.topYoyShifts.map(s => `${s.country} (${s.change})`).join(', ')}.
          </div>

          {/* SVG Map Container matching Keystone chart SVG */}
          <div style={styles.mapContainer}>
            <svg 
              viewBox="0 0 730.65625 500" 
              style={{ width: '100%', height: '100%', borderRadius: '4px' }}
            >
              <rect 
                className="keystonechart-worldmap-background" 
                x="0" 
                y="0" 
                width="730.65625" 
                height="500" 
                style={{ fill: 'rgb(240, 242, 244)' }} 
              />
              <text x="365" y="250" textAnchor="middle" fill="#9ca3af" fontSize="14" fontWeight="600">
                [ Interactive World Export Map Canvas ]
              </text>
            </svg>
          </div>

          <h3 style={styles.subHeadline}>{marketInsight.tableSummaryTitle}</h3>
          <p style={styles.descriptionText}>{marketInsight.tableSummaryText}</p>
        </div>

        {/* Right Classification Sidebar */}
        <div style={styles.rightSidebar}>
          <div style={styles.sidebarSection}>
            <h4 style={styles.sidebarHeader}>CLASSIFICATION</h4>
            {sidebar.classification.map((item, idx) => (
              <div key={idx} style={styles.sidebarRow}>
                <span style={styles.sidebarLabel}>{item.label}</span>
                <span style={styles.sidebarVal}>{item.value}</span>
              </div>
            ))}
          </div>

          <div style={styles.sidebarSection}>
            <h4 style={styles.sidebarHeader}>RAW MATERIAL</h4>
            {sidebar.rawMaterial.map((item, idx) => (
              <div key={idx} style={styles.sidebarRow}>
                <span style={styles.sidebarLabel}>{item.label}</span>
                <span style={styles.sidebarVal}>{item.value}</span>
              </div>
            ))}

            <div style={styles.sidebarBlock}>
              <span style={styles.sidebarLabel}>Growing Conditions</span>
              <ul style={styles.sidebarList}>
                {sidebar.growingConditions.map((cond, idx) => (
                  <li key={idx}>{cond}</li>
                ))}
              </ul>
            </div>

            <div style={styles.sidebarBlock}>
              <span style={styles.sidebarLabel}>Main Varieties</span>
              <p style={styles.sidebarText}>{sidebar.mainVarieties}</p>
            </div>

            <div style={styles.sidebarBlock}>
              <span style={styles.sidebarLabel}>Consumption Forms</span>
              <ul style={styles.sidebarList}>
                {sidebar.consumptionForms.map((form, idx) => (
                  <li key={idx}>{form}</li>
                ))}
              </ul>
            </div>

            <div style={styles.sidebarBlock}>
              <span style={styles.sidebarLabel}>Grading Factors</span>
              <ul style={styles.sidebarList}>
                {sidebar.gradingFactors.map((factor, idx) => (
                  <li key={idx}>{factor}</li>
                ))}
              </ul>
            </div>

            <div style={styles.sidebarBlock}>
              <span style={styles.sidebarLabel}>Planting to Harvest</span>
              <p style={styles.sidebarText}>{sidebar.plantingToHarvest}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const styles = {
  pageContainer: { maxWidth: '1280px', margin: '0 auto', padding: '30px 20px', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: '#111827', backgroundColor: '#ffffff' },
  loadingContainer: { padding: '60px', textAlign: 'center', color: '#6b7280' },
  errorContainer: { padding: '60px', textAlign: 'center', color: '#ef4444' },
  headerArea: { marginBottom: '20px' },
  titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  titleWithIcon: { display: 'flex', alignItems: 'center', gap: '12px' },
  icon: { fontSize: '2rem' },
  pageTitle: { fontSize: '1.8rem', fontWeight: '700', margin: 0, color: '#111827' },
  ctaButton: { backgroundColor: '#090d16', color: '#ffffff', border: 'none', padding: '10px 18px', fontWeight: '600', borderRadius: '4px', cursor: 'pointer' },
  metaGrid: { display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr', gap: '20px' },
  metaCol: { display: 'flex', flexDirection: 'column' },
  metaColShort: { display: 'flex', flexDirection: 'column' },
  metaLabel: { fontSize: '0.75rem', color: '#6b7280', fontWeight: '600', marginBottom: '4px' },
  metaValue: { fontSize: '0.85rem', color: '#111827', lineHeight: '1.4' },
  divider: { border: 'none', borderTop: '1px solid #e5e7eb', margin: '20px 0 30px' },
  contentLayout: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '40px' },
  leftColumn: { display: 'flex', flexDirection: 'column' },
  sectionHeadline: { fontSize: '1.35rem', fontWeight: '700', marginBottom: '10px' },
  subHeadline: { fontSize: '1.1rem', fontWeight: '700', marginTop: '25px', marginBottom: '8px' },
  descriptionText: { fontSize: '0.9rem', color: '#4b5563', lineHeight: '1.6', marginBottom: '12px' },
  topShiftsNote: { fontSize: '0.85rem', color: '#6b7280', marginBottom: '16px' },
  mapContainer: { width: '100%', height: '340px', backgroundColor: '#f0f2f4', borderRadius: '8px', border: '1px solid #e5e7eb', margin: '15px 0' },
  rightSidebar: { display: 'flex', flexDirection: 'column', gap: '25px', borderLeft: '1px solid #f3f4f6', paddingLeft: '25px' },
  sidebarSection: { display: 'flex', flexDirection: 'column', gap: '12px' },
  sidebarHeader: { fontSize: '0.75rem', fontWeight: '800', color: '#374151', letterSpacing: '0.05em', margin: '0 0 5px' },
  sidebarRow: { display: 'flex', flexDirection: 'column', marginBottom: '6px' },
  sidebarLabel: { fontSize: '0.75rem', color: '#6b7280', fontWeight: '600' },
  sidebarVal: { fontSize: '0.85rem', color: '#111827', fontWeight: '500' },
  sidebarBlock: { marginTop: '8px' },
  sidebarList: { margin: '4px 0 0 16px', padding: 0, fontSize: '0.8rem', color: '#374151', lineHeight: '1.5' },
  sidebarText: { fontSize: '0.8rem', color: '#374151', margin: '4px 0 0', lineHeight: '1.4' }
};