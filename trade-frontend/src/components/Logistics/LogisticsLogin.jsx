// src/components/LogisticsLoginForm.jsx
import React, { useState } from 'react';
import { loginLogisticsUser } from '../../services/logisticsAuthService';
import './LogisticsPortal.css'; // Styled below

export default function LogisticsLoginForm({ onLoginSuccess }) {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    deskRole: 'DRIVER'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await loginLogisticsUser(formData);
      if (res.success) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Failed to authenticate logistics portal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="card-header">
          <div className="badge">Logistics Division</div>
          <h2>Operational Gateway</h2>
          <p>Access your desk management terminal</p>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Logistics Desk Role</label>
            <select 
              value={formData.deskRole} 
              onChange={(e) => setFormData({ ...formData, deskRole: e.target.value })}
            >
              <option value="DRIVER">Driver Desk</option>
              <option value="DISPATCHER">Dispatcher Desk</option>
              <option value="FLEET_MANAGER">Fleet Manager Desk</option>
              <option value="CARRIER">Carrier Partner</option>
            </select>
          </div>

          <div className="form-group">
            <label>User ID / Email / Phone</label>
            <input 
              type="text" 
              required 
              placeholder="driver@trade.com or LOG-3002"
              value={formData.identifier}
              onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              required 
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Access Logistics Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}