import React, { useState } from 'react';

// Exact categories directly from AMAMA EXPORTS website
const EXPORT_CATEGORIES = [
  { id: 'fruits', name: 'Fruits', icon: '🍎', description: 'Premium fresh and seasonal fruits sourced from trusted farms.' },
  { id: 'vegetables', name: 'Vegetables', icon: '🥕', description: 'Farm-fresh, high-quality vegetables inspected for global markets.' },
  { id: 'commodities', name: 'Commodities', icon: '🌴', description: 'Essential agricultural commodities and staples.' },
  { id: 'eggs', name: 'Eggs', icon: '🥚', description: 'Fresh, farm-quality table eggs.' },
  { id: 'meat', name: 'Meat', icon: '🥩', description: 'Quality meat products adhering to strict international standards.' },
  { id: 'snacks', name: 'Sweets & Snacks', icon: '🍬', description: 'Authentic Indian sweets and packaged confectionery.' },
  { id: 'herbal', name: 'Herbal Products', icon: '🌿', description: 'Natural botanical and herbal goods.' },
  { id: 'festival', name: 'Indian Festival Products', icon: '🪔', description: 'Specialized cultural and festival essentials.' },
];

// Exact 8 certifications listed on the official site
const CERTIFICATIONS = [
  'ISO 9001', 'FSSAI', 'APEDA', 'HACCP', 'Global GAP', 'ISO 22000', 'GMP Certified', 'Halal Certified'
];

// Exact sourcing origins explicitly named on the site
const SOURCING_ORIGINS = [
  { name: 'India', flag: '🇮🇳', region: 'Primary Agriculture Hub' },
  { name: 'Vietnam', flag: '🇻🇳', region: 'Southeast Asian Network' },
  { name: 'Egypt', flag: '🇪🇬', region: 'Middle East & North Africa' }
];

// Exact 4 core pillars from the "Why Choose Us" section
const OUR_PROMISE = [
  {
    step: '01',
    title: 'Global Sourcing',
    desc: 'We source premium products from trusted farms across India, Vietnam, Egypt, and beyond.'
  },
  {
    step: '02',
    title: 'Quality Inspection',
    desc: 'Rigorous multi-stage quality checks ensure every shipment meets international standards.'
  },
  {
    step: '03',
    title: 'Reliable Logistics',
    desc: 'End-to-end cold chain logistics with real-time tracking and on-time delivery.'
  },
  {
    step: '04',
    title: 'Long-Term Partnerships',
    desc: 'We build relationships, not just transactions. Your success is our priority.'
  }
];

export default function LandingPage() {
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    setInquirySubmitted(true);
    setTimeout(() => setInquirySubmitted(false), 5000);
  };

  const filteredCategories = activeTab === 'all' 
    ? EXPORT_CATEGORIES 
    : EXPORT_CATEGORIES.filter(c => c.id === activeTab);

  return (
    <div className="amama-app">
      <style>{`
        /* Reset & Base Fonts */
        .amama-app {
          background-color: #ffffff;
          color: #0f172a;
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
        }

        /* Modern Light Navbar */
        .amama-navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(12px);
          background: rgba(255, 255, 255, 0.9);
          border-bottom: 1px solid #e2e8f0;
          padding: 1.1rem 2.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .amama-logo-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.25rem;
          font-weight: 900;
          letter-spacing: -0.02em;
          color: #0f172a;
        }
        .amama-logo-badge {
          background: #059669;
          color: #ffffff;
          padding: 0.2rem 0.6rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 800;
        }
        .amama-nav-links {
          display: flex;
          gap: 2rem;
        }
        .amama-nav-item {
          color: #475569;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 600;
          transition: color 0.2s;
        }
        .amama-nav-item:hover {
          color: #059669;
        }

        /* Hero Container */
        .amama-hero-section {
          position: relative;
          padding: 6rem 1.5rem 5rem;
          text-align: center;
          background: radial-gradient(circle at 50% 0%, #f0fdf4 0%, #ffffff 75%);
        }
        .amama-pill-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
          color: #047857;
          padding: 0.4rem 1.25rem;
          border-radius: 9999px;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin-bottom: 1.5rem;
        }
        .amama-hero-heading {
          font-size: 3.5rem;
          font-weight: 900;
          line-height: 1.15;
          letter-spacing: -0.03em;
          color: #0f172a;
          max-width: 850px;
          margin: 0 auto 1.25rem;
        }
        .amama-hero-heading span {
          color: #059669;
        }
        .amama-hero-subtext {
          font-size: 1.15rem;
          color: #475569;
          max-width: 680px;
          margin: 0 auto 2.25rem;
        }
        .amama-btn-group {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        /* Buttons */
        .btn-emerald {
          background: #059669;
          color: #ffffff;
          padding: 0.85rem 2rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.95rem;
          border: none;
          cursor: pointer;
          text-decoration: none;
          box-shadow: 0 10px 20px -5px rgba(5, 150, 105, 0.3);
          transition: background 0.2s, transform 0.2s;
        }
        .btn-emerald:hover {
          background: #047857;
          transform: translateY(-2px);
        }
        .btn-outline {
          background: #ffffff;
          color: #0f172a;
          border: 1px solid #cbd5e1;
          padding: 0.85rem 2rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s, border-color 0.2s;
        }
        .btn-outline:hover {
          background: #f8fafc;
          border-color: #94a3b8;
        }

        /* Certifications Trust Bar */
        .amama-certs-wrapper {
          background: #f8fafc;
          border-y: 1px solid #e2e8f0;
          padding: 1.75rem 1.5rem;
        }
        .amama-certs-label {
          text-align: center;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #64748b;
          margin-bottom: 0.85rem;
        }
        .amama-certs-list {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          max-width: 1100px;
          margin: 0 auto;
        }
        .amama-cert-chip {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #0f172a;
          font-size: 0.825rem;
          font-weight: 700;
          padding: 0.4rem 0.9rem;
          border-radius: 6px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        /* Main Section */
        .amama-main-container {
          max-width: 1150px;
          margin: 0 auto;
          padding: 5rem 1.5rem;
        }
        .amama-sec-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        .amama-sec-tag {
          color: #059669;
          font-size: 0.8rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 0.4rem;
          display: block;
        }
        .amama-sec-title {
          font-size: 2.25rem;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.02em;
        }
        .amama-sec-sub {
          color: #64748b;
          font-size: 1rem;
          max-width: 600px;
          margin: 0.4rem auto 0;
        }

        /* Filter Tabs */
        .amama-tab-bar {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
        }
        .amama-tab-btn {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #475569;
          padding: 0.5rem 1.1rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .amama-tab-btn.active, .amama-tab-btn:hover {
          background: #059669;
          color: #ffffff;
          border-color: #059669;
        }

        /* Product Grid */
        .amama-grid-products {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        .amama-product-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 2rem 1.5rem;
          text-align: center;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
        }
        .amama-product-card:hover {
          transform: translateY(-4px);
          border-color: #34d399;
          box-shadow: 0 12px 24px -10px rgba(0, 0, 0, 0.08);
        }
        .amama-card-icon-wrapper {
          width: 56px;
          height: 56px;
          background: #f0fdf4;
          border: 1px solid #d1fae5;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.75rem;
          margin: 0 auto 1.25rem;
        }
        .amama-product-title {
          font-size: 1.15rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }
        .amama-product-desc {
          font-size: 0.875rem;
          color: #64748b;
          line-height: 1.5;
        }

        /* Origins Box */
        .amama-origins-panel {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 3.5rem 2rem;
          margin-top: 4.5rem;
          text-align: center;
        }
        .amama-origins-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
          margin-top: 2rem;
        }
        .amama-origin-card {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 12px;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          text-align: left;
        }
        .amama-origin-flag {
          font-size: 2rem;
        }
        .amama-origin-name {
          font-weight: 800;
          color: #0f172a;
          font-size: 1.05rem;
        }
        .amama-origin-sub {
          font-size: 0.78rem;
          color: #64748b;
        }

        /* Process Steps Grid */
        .amama-process-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
        }
        .amama-process-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 2rem 1.5rem;
        }
        .amama-process-num {
          font-size: 1.25rem;
          font-weight: 900;
          color: #059669;
          margin-bottom: 0.5rem;
          display: block;
        }

        /* Contact Section Box */
        .amama-contact-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 3.5rem 2.5rem;
          max-width: 800px;
          margin: 0 auto;
        }
        .amama-form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          margin-bottom: 1.25rem;
        }
        .amama-field-input {
          width: 100%;
          background: #ffffff;
          border: 1px solid #cbd5e1;
          color: #0f172a;
          padding: 0.85rem 1rem;
          border-radius: 8px;
          font-size: 0.95rem;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }
        .amama-field-input:focus {
          border-color: #059669;
        }

        /* Footer Details Bar */
        .amama-contact-strip {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-top: 2.5rem;
          padding-top: 2rem;
          border-top: 1px solid #e2e8f0;
          text-align: center;
        }
        .amama-strip-item strong {
          color: #64748b;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          display: block;
          margin-bottom: 0.25rem;
        }
        .amama-strip-item span {
          color: #0f172a;
          font-weight: 700;
          font-size: 0.95rem;
        }

        @media (max-width: 768px) {
          .amama-hero-heading { font-size: 2.25rem; }
          .amama-form-row { grid-template-columns: 1fr; }
          .amama-navbar { padding: 1rem 1.5rem; }
          .amama-nav-links { display: none; }
        }
      `}</style>


      {/* Hero Section */}
      <section className="amama-hero-section">
        <div className="amama-pill-badge">
          🌿 PURE ORIGINS. GLOBAL REACH.
        </div>
        <h1 className="amama-hero-heading">
          Global Quality. <span>Trusted Exports.</span>
        </h1>
        <p className="amama-hero-subtext">
          From farm to port — we source, inspect, and export premium agricultural products to markets across the globe.
        </p>
        <div className="amama-btn-group">
          <a href="#products" className="btn-emerald">View Products</a>
          <a href="#contact" className="btn-outline">Contact Us</a>
        </div>
      </section>

      {/* Trust & Certifications Bar */}
      <div className="amama-certs-wrapper">
        <div className="amama-certs-label">Certified Quality &amp; Export Compliance</div>
        <div className="amama-certs-list">
          {CERTIFICATIONS.map((cert) => (
            <div key={cert} className="amama-cert-chip">
              ✓ {cert}
            </div>
          ))}
        </div>
      </div>

      {/* Product Catalog Section */}
      <section id="products" className="amama-main-container">
        <div className="amama-sec-header">
          <span className="amama-sec-tag">Our Range</span>
          <h2 className="amama-sec-title">What We Export</h2>
          <p className="amama-sec-sub">Delivering certified agricultural produce and consumer goods worldwide.</p>
        </div>

        {/* Filter Tabs */}
        <div className="amama-tab-bar">
          <button 
            className={`amama-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Products
          </button>
          {EXPORT_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`amama-tab-btn ${activeTab === cat.id ? 'active' : ''}`}
              onClick={() => setActiveTab(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Category Grid */}
        <div className="amama-grid-products">
          {filteredCategories.map((cat) => (
            <div key={cat.id} className="amama-product-card">
              <div className="amama-card-icon-wrapper">{cat.icon}</div>
              <h3 className="amama-product-title">{cat.name}</h3>
              <p className="amama-product-desc">{cat.description}</p>
            </div>
          ))}
        </div>

        {/* Sourcing Origins Panel */}
        <div className="amama-origins-panel" id="about">
          <span className="amama-sec-tag">Global Presence</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Global Sourcing Origins
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.4rem' }}>
            We source premium products directly from trusted farms across key global agricultural networks.
          </p>
          <div className="amama-origins-grid">
            {SOURCING_ORIGINS.map((origin) => (
              <div key={origin.name} className="amama-origin-card">
                <span className="amama-origin-flag">{origin.flag}</span>
                <div>
                  <div className="amama-origin-name">{origin.name}</div>
                  <div className="amama-origin-sub">{origin.region}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="partners" style={{ background: '#f8fafc', borderY: '1px solid #e2e8f0', padding: '5rem 1.5rem' }}>
        <div className="amama-main-container" style={{ padding: 0 }}>
          <div className="amama-sec-header">
            <span className="amama-sec-tag">Our Promise</span>
            <h2 className="amama-sec-title">Why Choose Us</h2>
            <p className="amama-sec-sub">Building lasting relationships through quality and reliability.</p>
          </div>

          <div className="amama-process-grid">
            {OUR_PROMISE.map((item) => (
              <div key={item.title} className="amama-process-card">
                <span className="amama-process-num">{item.step}</span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.4rem' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.6 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="amama-main-container">
        <div className="amama-contact-card">
          <div className="amama-sec-header" style={{ marginBottom: '2rem' }}>
            <span className="amama-sec-tag">Get Started</span>
            <h2 className="amama-sec-title" style={{ fontSize: '2rem' }}>Ready To Partner With Us?</h2>
            <p className="amama-sec-sub">
              Let's discuss how AMAMA EXPORTS can fulfil your sourcing needs with quality and reliability.
            </p>
          </div>

          {inquirySubmitted ? (
            <div style={{ background: '#ecfdf5', border: '1px solid #059669', color: '#047857', padding: '1.25rem', borderRadius: '8px', textAlign: 'center', fontWeight: 700 }}>
              ✓ Thank you! Your message has been received. Our trade desk will contact you shortly.
            </div>
          ) : (
            <form onSubmit={handleInquirySubmit}>
              <div className="amama-form-row">
                <input className="amama-field-input" placeholder="Your Name" required />
                <input className="amama-field-input" type="email" placeholder="Your Email" required />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <textarea className="amama-field-input" rows={4} placeholder="Your Sourcing Requirement / Message" required />
              </div>
              <button className="btn-emerald" style={{ width: '100%', padding: '0.95rem' }} type="submit">
                Get In Touch
              </button>
            </form>
          )}

          {/* Contact Details Footer Strip */}
          <div className="amama-contact-strip">
            <div className="amama-strip-item">
              <strong>Phone (India)</strong>
              <span>+91 98188 67336</span>
            </div>
            <div className="amama-strip-item">
              <strong>Phone (UAE)</strong>
              <span>+971 58883 7264</span>
            </div>
            <div className="amama-strip-item">
              <strong>Email</strong>
              <span>business@amamaexports.com</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}