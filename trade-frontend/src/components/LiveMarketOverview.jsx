import React, { useState, useEffect, useRef, useCallback } from 'react';

const TOKENS = {
  surface: '#fcfcfb',
  pagePlane: '#f9f9f7',
  ink: '#0b0b0b',
  inkSecondary: '#52514e',
  inkMuted: '#898781',
  gridline: '#e1e0d9',
  baseline: '#c3c2b7',
  border: 'rgba(11,11,11,0.10)',
  // Diverging pair (blue <-> red), categorical slots 1 and 8.
  positive: '#2a78d6',
  negative: '#e34948',
  successText: '#006300'
};

// Representative emoji per HS chapter — mirrors the backend's CHAPTER_ICONS
// map, used only as a client-side fallback if an older API response doesn't
// include product.icon.
const CHAPTER_ICON_FALLBACK = {
  '02': '🥩', '03': '🐟', '04': '🥛', '06': '🌸', '07': '🥬', '08': '🍎'
};

// ============================================================================
// Small stat tile — label + value, per the dataviz skill's figure contract.
// ============================================================================
function StatTile({ label, value, compact }) {
  return (
    <div style={compact ? styles.statTileCompact : styles.statTile}>
      <span style={styles.statLabel}>{label}</span>
      <span style={styles.statValue}>{value || '—'}</span>
    </div>
  );
}

// ============================================================================
// Diverging YoY bar chart — replaces the inert map placeholder. Built from
// the same marketInsight.topYoyShifts array the page already renders as
// text, so nothing here is fabricated: it's a real visualization of the
// exact data the copy above it describes. Bars diverge from a zero baseline
// (blue = positive, red = negative, per the diverging pair) since the
// copy explicitly promises "positive and negative YoY shifts" even though
// today's demo values happen to all be positive.
// ============================================================================
function YoyDivergingChart({ shifts }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!shifts || shifts.length === 0) {
    return (
      <div style={styles.chartEmpty}>No YoY shift data available for this product yet.</div>
    );
  }

  const parsed = shifts.map((s) => ({ ...s, value: parseFloat(s.change) || 0 }));
  const maxAbs = Math.max(...parsed.map((s) => Math.abs(s.value)), 1);

  return (
    <div style={styles.chartRoot} role="img" aria-label="Year-over-year change in supplier transactions by country">
      {parsed.map((s, idx) => {
        const isPositive = s.value >= 0;
        const widthPct = (Math.abs(s.value) / maxAbs) * 100;
        const isHovered = hoveredIdx === idx;
        const barColor = isPositive ? TOKENS.positive : TOKENS.negative;

        return (
          <div key={s.country} style={styles.chartRow}>
            <span style={styles.chartCountryLabel}>{s.country}</span>

            <div style={styles.chartTrackWrap}>
              <div style={styles.chartHalf}>
                {!isPositive && (
                  <div
                    tabIndex={0}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    onFocus={() => setHoveredIdx(idx)}
                    onBlur={() => setHoveredIdx(null)}
                    title={`${s.country}: ${s.change} year-over-year`}
                    style={{
                      ...styles.barNeg,
                      width: `${widthPct}%`,
                      opacity: isHovered ? 0.82 : 1,
                      backgroundColor: barColor
                    }}
                  />
                )}
              </div>

              <div style={styles.chartBaseline} />

              <div style={{ ...styles.chartHalf, justifyContent: 'flex-start' }}>
                {isPositive && (
                  <div
                    tabIndex={0}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    onFocus={() => setHoveredIdx(idx)}
                    onBlur={() => setHoveredIdx(null)}
                    title={`${s.country}: ${s.change} year-over-year`}
                    style={{
                      ...styles.barPos,
                      width: `${widthPct}%`,
                      opacity: isHovered ? 0.82 : 1,
                      backgroundColor: barColor
                    }}
                  />
                )}
              </div>
            </div>

            <span style={styles.chartValueLabel}>{s.change}</span>
          </div>
        );
      })}
      <div style={styles.chartLegend}>
        <span style={styles.chartLegendItem}>
          <span style={{ ...styles.chartLegendSwatch, backgroundColor: TOKENS.positive }} />
          Growth
        </span>
        <span style={styles.chartLegendItem}>
          <span style={{ ...styles.chartLegendSwatch, backgroundColor: TOKENS.negative }} />
          Decline
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// Product search — wired to the real GET /api/v1/hs-codes?search= endpoint.
// Lets the page actually browse the perishable-goods HS reference instead of
// only ever showing whatever hsCode the parent happened to pass in.
// ============================================================================
function ProductSearch({ onSelect }) {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (term.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      setIsLoading(true);
      fetch(`/api/v1/hs-codes?search=${encodeURIComponent(term.trim())}`)
        .then((res) => res.json())
        .then((payload) => {
          setResults(Array.isArray(payload.data) ? payload.data : []);
          setIsOpen(true);
        })
        .catch(() => {
          setResults([]);
        })
        .finally(() => setIsLoading(false));
    }, 300);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [term]);

  // Close the dropdown on outside click.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (result) => {
    onSelect(result);
    setTerm('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={styles.searchRoot}>
      <div style={styles.searchInputWrap}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          placeholder="Search perishable-goods commodities (e.g. mango, beef, grapes)…"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          onKeyDown={(e) => { if (e.key === 'Escape') setIsOpen(false); }}
          style={styles.searchInput}
        />
        {isLoading && <span style={styles.searchSpinner}>⏳</span>}
      </div>

      {isOpen && (
        <div role="listbox" style={styles.searchDropdown}>
          {results.length === 0 && !isLoading && (
            <div style={styles.searchEmptyState}>
              No match in the perishable-goods reference (meat, fish, dairy, flowers, vegetables, fruit &amp; nuts only).
            </div>
          )}
          {results.map((r) => (
            <button
              key={r.code}
              role="option"
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(r); }}
              style={styles.searchResultRow}
            >
              <span style={styles.searchResultCode}>{r.code}</span>
              <span style={styles.searchResultText}>
                <span style={styles.searchResultDesc}>{r.description}</span>
                <span style={styles.searchResultChapter}>{r.chapterTitle}</span>
              </span>
              <span style={styles.searchResultPerish}>{r.perishability}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Main page
// ============================================================================
export default function LiveMarketOverview({ hsCode = '080510', onNavigate }) {
  const [activeCode, setActiveCode] = useState(hsCode);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [justRefreshed, setJustRefreshed] = useState(false);

  // Keep in sync when the parent passes a different hsCode (external
  // navigation) — local search selections take over from there until the
  // parent changes it again.
  useEffect(() => {
    setActiveCode(hsCode);
  }, [hsCode]);

  useEffect(() => {
    let isMounted = true;
    if (refreshTick > 0) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    fetch(`/api/v1/market-overview?hsCode=${encodeURIComponent(activeCode)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load market data');
        return res.json();
      })
      .then((payload) => {
        if (!isMounted) return;
        setData(payload);
        setLoading(false);
        setIsRefreshing(false);
        if (refreshTick > 0) {
          setJustRefreshed(true);
          setTimeout(() => { if (isMounted) setJustRefreshed(false); }, 2000);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message);
        setLoading(false);
        setIsRefreshing(false);
      });

    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCode, refreshTick]);

  const handleSelectProduct = useCallback((result) => {
    setActiveCode(result.code);
    onNavigate?.('search', { hsCode: result.code });
  }, [onNavigate]);

  const handleRefreshClick = () => {
    if (isRefreshing) return;
    setRefreshTick((t) => t + 1);
  };

  if (loading) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner} />
          Loading Market Overview…
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={styles.pageContainer}>
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>⚠️</div>
          <div style={styles.errorTitle}>Couldn't load market data</div>
          <div style={styles.errorDetail}>{error || 'Unknown error'}</div>
          <button style={styles.errorRetryBtn} onClick={() => setRefreshTick((t) => t + 1)}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { product, marketInsight, sidebar } = data;
  const icon = product.icon || CHAPTER_ICON_FALLBACK['08'] || '🍊';

  return (
    <div style={styles.pageOuter}>
      <div style={styles.pageContainer}>
        {/* 1. Header Metadata Section */}
        <div style={styles.headerArea}>
          <div style={styles.titleRow}>
            <div style={styles.titleWithIcon}>
              <span style={styles.icon}>{icon}</span>
              <h1 style={styles.pageTitle}>{product.title}</h1>
            </div>
            <button
              style={{ ...styles.ctaButton, ...(isRefreshing ? styles.ctaButtonBusy : {}) }}
              onClick={handleRefreshClick}
              disabled={isRefreshing}
            >
              {isRefreshing ? 'Refreshing…' : justRefreshed ? '✓ Updated' : (product.ctaLabel || 'Get Market Intelligence')}
            </button>
          </div>

          <ProductSearch onSelect={handleSelectProduct} />

          <div style={styles.metaGrid}>
            <StatTile label="Sub Product" value={product.subProducts} />
            <StatTile label="Derived Products" value={product.derivedProducts} />
            <StatTile label="HS Code" value={product.hsCode} compact />
            <StatTile label="Last Updated" value={product.lastUpdated} compact />
          </div>
        </div>

        {/* 2. Main Layout */}
        <div style={{ ...styles.contentLayout, opacity: isRefreshing ? 0.6 : 1 }}>

          {/* Left Content Track */}
          <div style={styles.leftColumn}>
            <div style={styles.card}>
              <h2 style={styles.sectionHeadline}>{marketInsight.headline}</h2>
              <p style={styles.descriptionText}>{marketInsight.description}</p>
            </div>

            <div style={styles.card}>
              <h3 style={styles.subHeadline}>{marketInsight.yoySectionTitle}</h3>
              <p style={styles.descriptionText}>{marketInsight.yoyDescription}</p>
              <YoyDivergingChart shifts={marketInsight.topYoyShifts} />
            </div>

            <div style={styles.card}>
              <h3 style={styles.subHeadline}>{marketInsight.tableSummaryTitle}</h3>
              <p style={styles.descriptionText}>{marketInsight.tableSummaryText}</p>
            </div>
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

              {/* These agronomy blocks are curated orange-specific facts with
                  no HS-reference equivalent yet for other products — the API
                  sends empty data for a matched non-citrus product, so each
                  block hides itself instead of showing wrong/empty content. */}
              {sidebar.growingConditions?.length > 0 && (
                <div style={styles.sidebarBlock}>
                  <span style={styles.sidebarLabel}>Growing Conditions</span>
                  <ul style={styles.sidebarList}>
                    {sidebar.growingConditions.map((cond, idx) => (
                      <li key={idx}>{cond}</li>
                    ))}
                  </ul>
                </div>
              )}

              {sidebar.mainVarieties && (
                <div style={styles.sidebarBlock}>
                  <span style={styles.sidebarLabel}>Main Varieties</span>
                  <p style={styles.sidebarText}>{sidebar.mainVarieties}</p>
                </div>
              )}

              {sidebar.consumptionForms?.length > 0 && (
                <div style={styles.sidebarBlock}>
                  <span style={styles.sidebarLabel}>Consumption Forms</span>
                  <ul style={styles.sidebarList}>
                    {sidebar.consumptionForms.map((form, idx) => (
                      <li key={idx}>{form}</li>
                    ))}
                  </ul>
                </div>
              )}

              {sidebar.gradingFactors?.length > 0 && (
                <div style={styles.sidebarBlock}>
                  <span style={styles.sidebarLabel}>Grading Factors</span>
                  <ul style={styles.sidebarList}>
                    {sidebar.gradingFactors.map((factor, idx) => (
                      <li key={idx}>{factor}</li>
                    ))}
                  </ul>
                </div>
              )}

              {sidebar.plantingToHarvest && (
                <div style={styles.sidebarBlock}>
                  <span style={styles.sidebarLabel}>Planting to Harvest</span>
                  <p style={styles.sidebarText}>{sidebar.plantingToHarvest}</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  pageOuter: { backgroundColor: TOKENS.pagePlane, minHeight: '100%' },
  pageContainer: { maxWidth: '1280px', margin: '0 auto', padding: '30px 20px 60px', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', color: TOKENS.ink },

  loadingContainer: { padding: '80px 20px', textAlign: 'center', color: TOKENS.inkSecondary, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', fontSize: '0.9rem' },
  loadingSpinner: { width: '28px', height: '28px', borderRadius: '50%', border: `3px solid ${TOKENS.gridline}`, borderTopColor: TOKENS.positive, animation: 'lmo-spin 0.8s linear infinite' },

  errorContainer: { padding: '80px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  errorIcon: { fontSize: '1.8rem' },
  errorTitle: { fontSize: '1rem', fontWeight: '700', color: TOKENS.ink },
  errorDetail: { fontSize: '0.82rem', color: TOKENS.inkMuted, marginBottom: '10px' },
  errorRetryBtn: { backgroundColor: TOKENS.ink, color: '#ffffff', border: 'none', padding: '8px 16px', fontWeight: '600', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem' },

  headerArea: { marginBottom: '24px' },
  titleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '16px', flexWrap: 'wrap' },
  titleWithIcon: { display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 },
  icon: { fontSize: '2rem', flexShrink: 0 },
  pageTitle: { fontSize: '1.6rem', fontWeight: '700', margin: 0, color: TOKENS.ink, lineHeight: 1.25 },
  ctaButton: { backgroundColor: TOKENS.ink, color: '#ffffff', border: 'none', padding: '10px 20px', fontWeight: '600', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap', transition: 'opacity 0.15s ease' },
  ctaButtonBusy: { opacity: 0.65, cursor: 'wait' },

  searchRoot: { position: 'relative', marginBottom: '18px' },
  searchInputWrap: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: '8px', padding: '10px 14px' },
  searchIcon: { fontSize: '0.9rem', opacity: 0.6 },
  searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: '0.85rem', backgroundColor: 'transparent', color: TOKENS.ink },
  searchSpinner: { fontSize: '0.8rem', opacity: 0.6 },
  searchDropdown: { position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, backgroundColor: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: '8px', boxShadow: '0 8px 24px rgba(11,11,11,0.12)', zIndex: 20, maxHeight: '320px', overflowY: 'auto', padding: '6px' },
  searchEmptyState: { padding: '14px', fontSize: '0.78rem', color: TOKENS.inkMuted, textAlign: 'center' },
  searchResultRow: { display: 'flex', alignItems: 'center', gap: '10px', width: '100%', textAlign: 'left', padding: '9px 10px', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '6px', fontFamily: 'inherit' },
  searchResultCode: { fontSize: '0.72rem', fontWeight: '700', color: TOKENS.inkSecondary, backgroundColor: TOKENS.pagePlane, padding: '2px 6px', borderRadius: '4px', flexShrink: 0 },
  searchResultText: { display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 },
  searchResultDesc: { fontSize: '0.82rem', fontWeight: '600', color: TOKENS.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  searchResultChapter: { fontSize: '0.7rem', color: TOKENS.inkMuted },
  searchResultPerish: { fontSize: '0.7rem', fontWeight: '700', color: TOKENS.inkSecondary, flexShrink: 0 },

  metaGrid: { display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr', gap: '12px' },
  statTile: { backgroundColor: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: '8px', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 },
  statTileCompact: { backgroundColor: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: '8px', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '4px' },
  statLabel: { fontSize: '0.7rem', color: TOKENS.inkMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.03em' },
  statValue: { fontSize: '0.85rem', color: TOKENS.ink, lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis' },

  contentLayout: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', transition: 'opacity 0.2s ease' },
  leftColumn: { display: 'flex', flexDirection: 'column', gap: '16px' },
  card: { backgroundColor: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: '10px', padding: '20px' },
  sectionHeadline: { fontSize: '1.2rem', fontWeight: '700', margin: '0 0 10px' },
  subHeadline: { fontSize: '1rem', fontWeight: '700', margin: '0 0 8px' },
  descriptionText: { fontSize: '0.87rem', color: TOKENS.inkSecondary, lineHeight: '1.6', margin: 0 },

  // Diverging YoY chart
  chartRoot: { marginTop: '18px', display: 'flex', flexDirection: 'column', gap: '10px' },
  chartEmpty: { fontSize: '0.8rem', color: TOKENS.inkMuted, padding: '20px', textAlign: 'center' },
  chartRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  chartCountryLabel: { width: '84px', flexShrink: 0, fontSize: '0.78rem', fontWeight: '600', color: TOKENS.inkSecondary },
  chartTrackWrap: { flex: 1, display: 'flex', alignItems: 'center', height: '20px', position: 'relative' },
  chartHalf: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
  chartBaseline: { width: '1px', height: '100%', backgroundColor: TOKENS.baseline, flexShrink: 0 },
  barPos: { height: '18px', minWidth: '2px', borderRadius: '0 4px 4px 0', cursor: 'pointer', outline: 'none' },
  barNeg: { height: '18px', minWidth: '2px', borderRadius: '4px 0 0 4px', cursor: 'pointer', outline: 'none' },
  chartValueLabel: { width: '52px', flexShrink: 0, textAlign: 'right', fontSize: '0.78rem', fontWeight: '700', color: TOKENS.ink },
  chartLegend: { display: 'flex', gap: '16px', marginTop: '4px', paddingLeft: '94px' },
  chartLegendItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: TOKENS.inkMuted },
  chartLegendSwatch: { width: '10px', height: '10px', borderRadius: '2px', display: 'inline-block' },

  rightSidebar: { display: 'flex', flexDirection: 'column', gap: '16px' },
  sidebarSection: { backgroundColor: TOKENS.surface, border: `1px solid ${TOKENS.border}`, borderRadius: '10px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' },
  sidebarHeader: { fontSize: '0.72rem', fontWeight: '800', color: TOKENS.inkSecondary, letterSpacing: '0.06em', margin: '0 0 2px' },
  sidebarRow: { display: 'flex', flexDirection: 'column', marginBottom: '2px', paddingBottom: '8px', borderBottom: `1px solid ${TOKENS.gridline}` },
  sidebarLabel: { fontSize: '0.72rem', color: TOKENS.inkMuted, fontWeight: '600' },
  sidebarVal: { fontSize: '0.83rem', color: TOKENS.ink, fontWeight: '500' },
  sidebarBlock: { marginTop: '2px' },
  sidebarList: { margin: '4px 0 0 16px', padding: 0, fontSize: '0.8rem', color: TOKENS.inkSecondary, lineHeight: '1.5' },
  sidebarText: { fontSize: '0.8rem', color: TOKENS.inkSecondary, margin: '4px 0 0', lineHeight: '1.4' }
};
