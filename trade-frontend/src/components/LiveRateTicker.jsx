import React, { useState, useEffect } from 'react';
import liveRateService from '../utils/liveRateService';

export default function LiveRateTicker() {
  const [rate, setRate] = useState(liveRateService.getCurrentRate());

  useEffect(() => {
    return liveRateService.subscribe((newRate) => setRate(newRate));
  }, []);

  return (
    <div style={styles.tickerStrip}>
      <span style={styles.pulseIndicator}>● LIVE MARKET</span>
      <span style={styles.tickerText}>
        Sovereign Smart Escrow Route Vector: 
        <strong style={styles.rateHighlight}> 1 USD = {rate.toFixed(4)} INR</strong>
      </span>
      <span style={styles.timestamp}>System Time [2026 UTC]</span>
    </div>
  );
}

const styles = {
  tickerStrip: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#090d16',
    border: '1px solid #1e293b',
    borderRadius: '6px',
    padding: '10px 18px',
    fontSize: '12px',
    color: '#94a3b8',
    fontFamily: 'ui-monospace, monospace'
  },
  pulseIndicator: {
    color: '#10b981',
    fontWeight: '800',
    letterSpacing: '0.5px'
  },
  rateHighlight: {
    color: '#fbbf24',
    marginLeft: '6px'
  },
  timestamp: {
    color: '#475569',
    fontSize: '11px'
  }
};