import React, { useState, useEffect, useRef } from 'react';
// Reuses your premium full-screen styles

export default function TradeClearingEngine() {
  // --- Simulation States ---
  const [baseAmount, setBaseAmount] = useState(100000); // Default $100k USD
  const [liveSpotRate, setLiveSpotRate] = useState(83.52);
  const [lockedRate, setLockedRate] = useState(null);
  const [slippage, setSlippage] = useState(0.002); // 0.2% default
  const [timeLeft, setTimeLeft] = useState(0);
  const [pipelineStatus, setPipelineStatus] = useState('IDLE'); // IDLE, LOCKED, VERIFYING, SETTLED, ABORTED
  const [logMessages, setLogMessages] = useState([]);

  const timerRef = useRef(null);

  // 1. Simulate a live fluctuating global FX spot feed ticker
  useEffect(() => {
    const interval = setInterval(() => {
      if (pipelineStatus === 'IDLE' || pipelineStatus === 'LOCKED') {
        setLiveSpotRate(prev => {
          const volatility = (Math.random() - 0.5) * 0.08; // Small sub-second fluctuations
          return parseFloat((prev + volatility).toFixed(4));
        });
      }
    }, 800);
    return () => clearInterval(interval);
  }, [pipelineStatus]);

  // 2. Countdown Timer Loop for Locked Rates
  useEffect(() => {
    if (timeLeft > 0 && pipelineStatus === 'LOCKED') {
      timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0 && pipelineStatus === 'LOCKED') {
      triggerAbort('FX Quote Window Expired (60s Limit Reached).');
    }
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, pipelineStatus]);

  // --- Core Engine Workflows ---
  const addLog = (msg) => setLogMessages(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);

  const handleLockQuote = () => {
    setLockedRate(liveSpotRate);
    setTimeLeft(60);
    setPipelineStatus('LOCKED');
    setLogMessages([]);
    addLog(`Cryptographic Lock Established at 1 USD = ${liveSpotRate} INR.`);
    addLog(`Liquidity buffer locked for 60 seconds across RBI Sandbox nodes.`);
  };

  const triggerAbort = (reason) => {
    setPipelineStatus('ABORTED');
    addLog(`CRITICAL: Pipeline Execution Terminated. Reason: ${reason}`);
  };

  const handleExecuteTrade = () => {
    setPipelineStatus('VERIFYING');
    addLog('Initiating dual-signature cryptographic checks...');

    // Simulate multi-node network checking latency loops
    setTimeout(() => {
      // Calculate deviation between locked rate and the current shifting spot rate
      const deviation = Math.abs(liveSpotRate - lockedRate) / lockedRate;
      
      if (deviation > slippage) {
        triggerAbort(`Slippage threshold breached. Market shifted to ${liveSpotRate} (Dev: ${(deviation * 100).toFixed(3)}%).`);
        return;
      }

      addLog('DGFT Importer/Exporter validation status: VERIFIED (14ms)');
      
      setTimeout(() => {
        addLog('Collateral verified in USD source node.');
        addLog('Dispatched matching settlement out of pre-funded offshore INR reserve.');
        setPipelineStatus('SETTLED');
        addLog('SUCCESS: Trade clearing cycle executed successfully.');
      }, 1000);

    }, 1200);
  };

  const handleReset = () => {
    setPipelineStatus('IDLE');
    setLockedRate(null);
    setTimeLeft(0);
    setLogMessages([]);
  };

  // Calculations
  const targetINR = lockedRate ? baseAmount * lockedRate : baseAmount * liveSpotRate;

  return (
    <div className="pipeline-wrapper" style={{ marginTop: '20px', textAlign: 'left' }}>
      <h3 className="pipeline-title">⚡ Live FX Clearing Engine & Rate Lock Controller</h3>
      
      <div style={engineStyles.mainGrid}>
        {/* Left Side: Parameters Form */}
        <div style={engineStyles.panel}>
          <div style={engineStyles.inputGroup}>
            <label style={engineStyles.label}>Transaction Value (USD)</label>
            <input 
              type="number" 
              value={baseAmount} 
              disabled={pipelineStatus !== 'IDLE'} 
              onChange={(e) => setBaseAmount(Number(e.target.value))}
              style={engineStyles.input}
            />
          </div>

          <div style={engineStyles.inputGroup}>
            <label style={engineStyles.label}>Max Slippage Tolerance</label>
            <select 
              value={slippage} 
              disabled={pipelineStatus !== 'IDLE'} 
              onChange={(e) => setSlippage(Number(e.target.value))}
              style={engineStyles.input}
            >
              <option value={0.0005}>0.05% (Ultra Low Volatility)</option>
              <option value={0.002}>0.20% (Standard Enterprise Standard)</option>
              <option value={0.005}>0.50% (High Volatility Buffer)</option>
            </select>
          </div>

          <div style={engineStyles.rateDisplay}>
            <div>Live Spot Feed: <span style={{ color: '#06b6d4', fontFamily: 'var(--mono)' }}>{liveSpotRate} INR</span></div>
            {lockedRate && (
              <div style={{ marginTop: '8px', fontWeight: 'bold' }}>
                Locked Execution Rate: <span style={{ color: '#fbbf24' }}>{lockedRate} INR</span>
              </div>
            )}
          </div>

          {/* Contextual Action Button State Machine */}
          {pipelineStatus === 'IDLE' && (
            <button onClick={handleLockQuote} className="init-btn" style={{ width: '100%' }}>Lock FX Exchange Rate</button>
          )}
          {pipelineStatus === 'LOCKED' && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleExecuteTrade} className="init-btn" style={{ flex: 2, background: '#10b981', borderColor: '#10b981', color: '#fff' }}>
                Execute Settlement
              </button>
              <button onClick={handleReset} style={engineStyles.cancelBtn}>Cancel</button>
            </div>
          )}
          {(pipelineStatus === 'SETTLED' || pipelineStatus === 'ABORTED') && (
            <button onClick={handleReset} className="init-btn" style={{ width: '100%', background: '#334155', color: '#fff', borderColor: '#475569' }}>
              Reset Execution Console
            </button>
          )}
        </div>

        {/* Right Side: Live Metrics / Pipeline State Displays */}
        <div style={engineStyles.panelRight}>
          <div style={engineStyles.statusHeader}>
            <span>Status: <strong style={{ color: pipelineStatus === 'SETTLED' ? '#10b981' : pipelineStatus === 'ABORTED' ? '#f43f5e' : '#fbbf24' }}>{pipelineStatus}</strong></span>
            {pipelineStatus === 'LOCKED' && <span style={engineStyles.timerBadge}>⏳ Expiration Window: {timeLeft}s</span>}
          </div>

          <div style={engineStyles.valueMatrix}>
            <div>
              <small style={engineStyles.matrixLabel}>PAYING (Buyer Node)</small>
              <div style={engineStyles.matrixVal}>${baseAmount.toLocaleString()} <span style={{fontSize: '12px', color: '#475569'}}>USD</span></div>
            </div>
            <div style={{ fontSize: '24px', color: '#334155' }}>→</div>
            <div>
              <small style={engineStyles.matrixLabel}>RECEIVING (Supplier Node)</small>
              <div style={engineStyles.matrixVal}>₹{targetINR.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} <span style={{fontSize: '12px', color: '#475569'}}>INR</span></div>
            </div>
          </div>

          {/* Cryptographic Execution Terminal Logs */}
          <div style={engineStyles.terminalLogs}>
            <div style={{ fontSize: '10px', color: '#475569', marginBottom: '8px', letterSpacing: '0.5px' }}>SYSTEM EVENT LOG TRACKS</div>
            {pipelineStatus === 'VERIFYING' && <div className="loading-bar-simulation"></div>}
            {logMessages.map((log, i) => (
              <div key={i} style={{ color: log.includes('CRITICAL') ? '#f43f5e' : log.includes('SUCCESS') ? '#10b981' : '#94a3b8', margin: '4px 0' }}>
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline complementary design styles to keep it containerized inside your architecture
const engineStyles = {
  mainGrid: { display: 'flex', gap: '24px', flexWrap: 'wrap', marginTop: '20px' },
  panel: { flex: '1 1 340px', backgroundColor: 'var(--panel-nested)', padding: '24px', borderRadius: '6px', border: '1px solid var(--border)' },
  panelRight: { flex: '2 1 500px', backgroundColor: '#04060b', padding: '24px', borderRadius: '6px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' },
  label: { fontSize: '11px', fontWeight: '700', color: '#64748b', uppercase: 'true', letterSpacing: '0.5px' },
  input: { backgroundColor: 'var(--bg)', border: '1px solid var(--border)', padding: '10px', color: 'white', borderRadius: '4px', fontFamily: 'var(--mono)', fontSize: '14px', outline: 'none' },
  rateDisplay: { margin: '20px 0', fontSize: '13px', borderLeft: '2px solid var(--border)', paddingLeft: '12px' },
  cancelBtn: { flex: 1, backgroundColor: 'transparent', border: '1px solid #f43f5e', color: '#f43f5e', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' },
  statusHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' },
  timerBadge: { backgroundColor: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', padding: '4px 8px', borderRadius: '4px', fontWeight: '700' },
  valueMatrix: { display: 'flex', justifyContent: 'space-around', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.02)' },
  matrixLabel: { fontSize: '9px', fontWeight: '800', color: '#475569', display: 'block', marginBottom: '4px' },
  matrixVal: { fontSize: '20px', fontWeight: '800', color: 'white', fontFamily: 'var(--mono)' },
  terminalLogs: { flexGrow: 1, backgroundColor: '#020305', border: '1px solid var(--border)', padding: '12px', borderRadius: '4px', fontFamily: 'var(--mono)', fontSize: '11.5px', lineHeight: '1.5', minHeight: '120px', overflowY: 'auto' }
};