let currentRate = 96.5200; 
const listeners = new Set();

// Simulate real-time currency volatility every 800ms
setInterval(() => {
  const volatility = (Math.random() - 0.5) * 0.06; 
  currentRate = parseFloat((currentRate + volatility).toFixed(4));
  listeners.forEach(callback => callback(currentRate));
}, 800);

const liveRateService = {
  getCurrentRate: () => currentRate,
  subscribe: (callback) => {
    listeners.add(callback);
    callback(currentRate); 
    return () => listeners.delete(callback); 
  }
};

export default liveRateService;