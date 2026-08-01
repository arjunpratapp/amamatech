import React, { useState } from 'react';

const PRODUCT_CATALOG = [
  { crop: 'Organic Basmati Rice', code: '1006.30', category: 'Grains & Rice', origin: 'India', status: 'In Season' },
  { crop: 'Fresh Alphonsos & Mangoes', code: '0804.50', category: 'Fresh Fruits', origin: 'India', status: 'In Season' },
  { crop: 'Ceylon Cinnamon & Spices', code: '0906.11', category: 'Spices', origin: 'Sri Lanka', status: 'Available' },
  { crop: 'Arabica & Robusta Coffee Beans', code: '0901.11', category: 'Commodities', origin: 'Vietnam', status: 'Available' },
  { crop: 'Fresh Egyptian Citrus & Garlic', code: '0805.10', category: 'Fresh Produce', origin: 'Egypt', status: 'In Season' },
  { crop: 'Desiccated Coconut & Peat', code: '0801.11', category: 'Coconut Products', origin: 'Sri Lanka', status: 'Available' },
];

const SOURCING_HUBS = [
  { country: 'India', flag: '🇮🇳', items: 'Basmati Rice, Alphonso Mangoes, Spices, Grapes' },
  { country: 'Sri Lanka', flag: '🇱🇰', items: 'Ceylon Tea, Cinnamon, Coconut Products, Snacks' },
  { country: 'Vietnam', flag: '🇻🇳', items: 'Coffee Beans, Cashews, Dragon Fruit' },
  { country: 'Egypt', flag: '🇪🇬', items: 'Citrus Fruits, Fresh Garlic, Onions' },
];

const PROCESS_STEPS = [
  { step: '01', title: 'Farm Harvest & Selection', desc: 'Direct sourcing from partner farmers with strict seasonal quality inspection.' },
  { step: '02', title: 'Cold-Chain & Grading', desc: 'Temperature-controlled sorting, packaging, and phytosanitary verification.' },
  { step: '03', title: 'Export & Port Clearance', desc: 'Customs documentation, APEDA/ISO certifications, and seamless container loading.' },
  { step: '04', title: 'Global Delivery', desc: 'Timely vessel dispatch ensuring peak freshness upon arrival at destination ports.' }
];

export default function LandingPage({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  const categories = ['All', 'Fresh Fruits', 'Fresh Produce', 'Grains & Rice', 'Spices', 'Commodities', 'Coconut Products'];

  const filteredCatalog = PRODUCT_CATALOG.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.code.includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    setInquirySubmitted(true);
    setTimeout(() => setInquirySubmitted(false), 4000);
  };

  return (
    <div className="amama-container">
      <style>{`
        .amama-container { background-color: #ffffff; color: #0f172a; font-family: 'Plus Jakarta Sans', system-ui, sans-serif; min-height: 100vh; }
        .amama-hero { text-align: center; padding: 5rem 1.5rem 4rem; background: radial-gradient(circle at 50% 10%, #f0fdf4 0%, #ffffff 70%); }
        .amama-badge { display: inline-flex; align-items: center; gap: 0.5rem; background: #dcfce7; border: 1px solid #bbf7d0; padding: 0.4rem 1.1rem; border-radius: 30px; font-size: 0.78rem; font-weight: 800; color: #166534; margin-bottom: 1.5rem; }
        .amama-title { font-size: 3.2rem; font-weight: 900; line-height: 1.15; color: #0f172a; max-width: 880px; margin: 0 auto 1.25rem; letter-spacing: -0.02em; }
        .amama-title span { color: #059669; }
        .amama-sub { font-size: 1.15rem; color: #475569; max-width: 740px; margin: 0 auto 2.5rem; line-height: 1.6; }

        /* Search & Filter Bar */
        .amama-search-bar { max-width: 760px; margin: 0 auto 2rem; display: flex; gap: 0.5rem; background: #ffffff; border: 2px solid #0f172a; border-radius: 12px; padding: 6px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .amama-input { flex: 1; border: none; padding: 0.8rem 1rem; font-size: 0.95rem; outline: none; }
        .amama-btn { background: #059669; color: #ffffff; border: none; padding: 0.8rem 1.5rem; border-radius: 8px; font-weight: 800; cursor: pointer; }
        .amama-btn:hover { background: #047857; }

        /* Stats Bar */
        .amama-stats { display: flex; justify-content: center; gap: 2.5rem; margin-top: 3rem; flex-wrap: wrap; }
        .amama-stat-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 1.2rem 2rem; border-radius: 12px; text-align: center; }
        .amama-stat-num { font-size: 1.8rem; font-weight: 900; color: #059669; display: block; }
        .amama-stat-lbl { font-size: 0.8rem; font-weight: 700; color: #64748b; margin-top: 4px; }

        /* Story Section */
        .amama-section { padding: 5rem 1.5rem; max-width: 1100px; margin: 0 auto; }
        .amama-sec-title { font-size: 2.2rem; font-weight: 900; color: #0f172a; margin-bottom: 1rem; text-align: center; }
        .amama-sec-sub { text-align: center; color: #64748b; max-width: 650px; margin: 0 auto 3rem; font-size: 1rem; }
        .amama-story-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; padding: 3rem; }
        .amama-quote { font-size: 1.25rem; font-weight: 800; color: #0f172a; border-left: 4px solid #059669; padding-left: 1rem; margin-bottom: 1.5rem; }

        /* Catalog Grid */
        .amama-cat-pills { display: flex; justify-content: center; gap: 0.5rem; margin-bottom: 2rem; flex-wrap: wrap; }
        .amama-pill { background: #ffffff; border: 1px solid #cbd5e1; padding: 0.5rem 1.2rem; border-radius: 20px; font-weight: 700; font-size: 0.85rem; cursor: pointer; color: #475569; }
        .amama-pill-active { background: #0f172a; color: #ffffff; border-color: #0f172a; }
        .amama-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
        .amama-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 1.5rem; transition: transform 0.2s, border-color 0.2s; }
        .amama-card:hover { transform: translateY(-3px); border-color: #059669; box-shadow: 0 10px 20px rgba(0,0,0,0.04); }

        /* Sourcing Hubs */
        .amama-hubs-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; }
        .amama-hub-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; }

        /* Contact / Inquiry Form */
        .amama-form-wrap { background: #0f172a; color: #ffffff; border-radius: 20px; padding: 3rem; max-width: 800px; margin: 0 auto; }
        .amama-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem; }
        .amama-form-input { width: 100%; border: 1px solid #334155; background: #1e293b; color: #ffffff; padding: 0.8rem; border-radius: 8px; font-size: 0.9rem; box-sizing: border-box; }
      `}</style>

      {/* Hero Section */}
      <section className="amama-hero">
        <div className="amama-badge">🌿 AMAMA EXPORTS — FARM TO GLOBAL MARKET</div>
        <h1 className="amama-title">
          Connecting World's Finest Growers <span>With International Markets</span>
        </h1>
        <p className="amama-sub">
          We don't just export produce — we build end-to-end supply bridges. Delivering uncompromised freshness, batch-by-batch inspection, and reliable cold-chain logistics across global ports.
        </p>

        {/* Catalog Search */}
        <div className="amama-search-bar">
          <input
            type="text"
            className="amama-input"
            placeholder="Search produce (e.g. Basmati Rice, Mangoes, Coffee, Spices)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="amama-btn">Search Catalog</button>
        </div>

        {/* Real Operational Metrics */}
        <div className="amama-stats">
          <div className="amama-stat-card">
            <span className="amama-stat-num">5+</span>
            <span className="amama-stat-lbl">Primary Sourcing Hubs</span>
          </div>
          <div className="amama-stat-card">
            <span className="amama-stat-num">100%</span>
            <span className="amama-stat-lbl">Farm-Inspected Produce</span>
          </div>
          <div className="amama-stat-card">
            <span className="amama-stat-num">APEDA / ISO</span>
            <span className="amama-stat-lbl">Export Compliant</span>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="amama-section">
        <div className="amama-story-card">
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            ABOUT AMAMA EXPORTS
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1.5rem' }}>
            More Than An Exporter — A Dedicated Supply Partner
          </h2>
          <div className="amama-quote">
            "We didn't start with a grand vision. We started with a simple belief: that the best produce in the world deserves the best journey to market."
          </div>
          <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: '1rem' }}>
            Over the years, we've built relationships — not just supply chains. We know our farmers by name, visit their fields, and understand their seasons. Because of that, we promise our buyers consistency in quality, freshness, and delivery.
          </p>
          <p style={{ color: '#475569', lineHeight: 1.7 }}>
            When you work with AMAMA Exports, you're partnering with people who care about freshness the way you care about your customers. We inspect every batch, monitor cold chains personally, and treat every shipment as if our reputation depends on it — because it does.
          </p>
        </div>
      </section>

      {/* Product Catalog Section */}
      <section className="amama-section" style={{ background: '#f8fafc', borderRadius: '24px' }}>
        <h2 className="amama-sec-title">Our Export Catalog</h2>
        <p className="amama-sec-sub">Sourced directly from certified growers in India, Sri Lanka, Vietnam, Egypt, and beyond.</p>

        {/* Category Filters */}
        <div className="amama-cat-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`amama-pill ${selectedCategory === cat ? 'amama-pill-active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="amama-grid">
          {filteredCatalog.map((item, index) => (
            <div key={index} className="amama-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#e2e8f0', color: '#334155', padding: '2px 8px', borderRadius: '4px' }}>
                  HS {item.code}
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px' }}>
                  {item.status}
                </span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.25rem' }}>{item.crop}</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>Origin: <strong>{item.origin}</strong></p>
              <button 
                className="amama-btn" 
                style={{ width: '100%', fontSize: '0.82rem', padding: '0.6rem' }}
                onClick={() => onNavigate?.('inquiry', { item: item.crop })}
              >
                Request Quote &amp; Samples
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Sourcing Hubs Section */}
      <section className="amama-section">
        <h2 className="amama-sec-title">Global Sourcing Origins</h2>
        <p className="amama-sec-sub">Direct farm networks ensuring peak seasonality and geographic authenticity.</p>

        <div className="amama-hubs-grid">
          {SOURCING_HUBS.map((hub, idx) => (
            <div key={idx} className="amama-hub-card">
              <div style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>{hub.flag}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>{hub.country}</h3>
              <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>{hub.items}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process / How We Work */}
      <section className="amama-section" style={{ background: '#f8fafc', borderRadius: '24px' }}>
        <h2 className="amama-sec-title">How We Guarantee Quality</h2>
        <p className="amama-sec-sub">Four stages of rigorous quality control from farm harvest to export shipment.</p>

        <div className="amama-grid">
          {PROCESS_STEPS.map((p) => (
            <div key={p.step} style={{ background: '#ffffff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#059669', display: 'block', marginBottom: '0.5rem' }}>{p.step}</span>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem' }}>{p.title}</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact / Buyer Inquiry Form */}
      <section className="amama-section">
        <div className="amama-form-wrap">
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.5rem', textAlign: 'center' }}>
            Partner With AMAMA Exports
          </h2>
          <p style={{ color: '#94a3b8', textAlign: 'center', fontSize: '0.9rem' }}>
            Looking for regular shipments or customized produce packaging? Submit your requirements below.
          </p>

          {inquirySubmitted ? (
            <div style={{ background: '#166534', color: '#ffffff', padding: '1rem', borderRadius: '8px', textAlign: 'center', marginTop: '1.5rem' }}>
              ✓ Thank you! Our export team will contact you within 24 hours with catalog pricing.
            </div>
          ) : (
            <form onSubmit={handleInquirySubmit}>
              <div className="amama-form-grid">
                <input className="amama-form-input" placeholder="Full Name *" required />
                <input className="amama-form-input" type="email" placeholder="Business Email *" required />
                <input className="amama-form-input" placeholder="Company Name *" required />
                <input className="amama-form-input" placeholder="Destination Port / Country *" required />
              </div>
              <div style={{ marginTop: '1rem' }}>
                <textarea 
                  className="amama-form-input" 
                  rows={4} 
                  placeholder="Required produce, quantity, or specific packaging standards..." 
                  required 
                />
              </div>
              <button className="amama-btn" style={{ width: '100%', marginTop: '1rem', padding: '0.9rem' }} type="submit">
                Submit Export Inquiry
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}