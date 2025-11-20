import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import logo from '../components/logo.png';

const TermsConditions = () => {
  const navigate = useNavigate();
  const { currentColors } = useTheme();

  return (
    <div style={{ background: currentColors?.background || "#f8f9fa", minHeight: "100vh" }}>
      {/* Header */}
      <div 
        style={{
          padding: "1rem 2rem",
          background: currentColors?.cardBackground || "#fff",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", cursor: "pointer" }} onClick={() => navigate('/')}>
          <img src={logo} alt="Logo" style={{ width: 64, height: 64, objectFit: 'contain' }} />
          <h2 style={{ margin: 0, fontWeight: 'bold', letterSpacing: '2px', color: '#007bff', fontSize: '1.3rem' }}>
            RecyConnect
          </h2>
        </div>
        <button 
          onClick={() => navigate('/')}
          style={{
            background: "#007bff",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Back to Home
        </button>
      </div>

      {/* Content */}
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
        <div className="card shadow-sm" style={{ borderRadius: '12px' }}>
          <div className="card-body" style={{ padding: '40px' }}>
            <h1 style={{ color: '#007bff', marginBottom: '30px', textAlign: 'center' }}>
              Terms and Conditions
            </h1>
            
            <p style={{ color: '#666', fontSize: '14px', textAlign: 'center', marginBottom: '40px' }}>
              Last Updated: November 18, 2025
            </p>

            <div style={{ lineHeight: '1.8', color: '#333' }}>
              <section style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#007bff', marginBottom: '15px' }}>1. Acceptance of Terms</h3>
                <p>
                  By accessing and using RecyConnect, you accept and agree to be bound by the terms and provision of this agreement. 
                  If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#007bff', marginBottom: '15px' }}>2. Use of Service</h3>
                <p>
                  RecyConnect is a platform for college students to buy, sell, donate, and exchange items within their campus community. 
                  You agree to use the service only for lawful purposes and in accordance with these Terms.
                </p>
                <ul style={{ marginTop: '10px' }}>
                  <li>You must be at least 18 years old or have parental consent to use this service</li>
                  <li>You are responsible for maintaining the confidentiality of your account</li>
                  <li>You agree not to post prohibited items or engage in fraudulent activities</li>
                  <li>You will provide accurate and complete information in all listings</li>
                </ul>
              </section>

              <section style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#007bff', marginBottom: '15px' }}>3. User Responsibilities</h3>
                <p>As a user of RecyConnect, you agree to:</p>
                <ul style={{ marginTop: '10px' }}>
                  <li>Provide accurate descriptions and photos of items you list</li>
                  <li>Honor your commitments to buy, sell, or donate items</li>
                  <li>Communicate respectfully with other users</li>
                  <li>Report any suspicious activity or violations</li>
                  <li>Not engage in price gouging or unfair trade practices</li>
                  <li>Meet in safe, public locations for exchanges</li>
                </ul>
              </section>

              <section style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#007bff', marginBottom: '15px' }}>4. Prohibited Items</h3>
                <p>The following items are strictly prohibited on RecyConnect:</p>
                <ul style={{ marginTop: '10px' }}>
                  <li>Illegal drugs, weapons, or hazardous materials</li>
                  <li>Stolen goods or counterfeit items</li>
                  <li>Adult content or services</li>
                  <li>Live animals (except fish and small pets with proper documentation)</li>
                  <li>Prescription medications or medical devices</li>
                  <li>Items that violate intellectual property rights</li>
                </ul>
              </section>

              <section style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#007bff', marginBottom: '15px' }}>5. Transactions and Payments</h3>
                <p>
                  RecyConnect facilitates connections between users but does not handle payments directly. 
                  All transactions are between individual users. We are not responsible for:
                </p>
                <ul style={{ marginTop: '10px' }}>
                  <li>Quality, safety, or legality of items advertised</li>
                  <li>Truth or accuracy of user listings</li>
                  <li>Ability of sellers to sell items or buyers to pay for items</li>
                  <li>Payment disputes between users</li>
                </ul>
              </section>

              <section style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#007bff', marginBottom: '15px' }}>6. Lost and Found</h3>
                <p>
                  Our Lost & Found section helps connect people who have lost items with those who have found them. 
                  Users must make reasonable efforts to return found items to their rightful owners. 
                  Claiming a found item that doesn't belong to you is considered theft.
                </p>
              </section>

              <section style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#007bff', marginBottom: '15px' }}>7. Privacy and Data</h3>
                <p>
                  We collect and use your personal information as described in our Privacy Policy. By using RecyConnect, you consent to:
                </p>
                <ul style={{ marginTop: '10px' }}>
                  <li>Collection of your registration and profile information</li>
                  <li>Storage of your transaction history and messages</li>
                  <li>Display of your username and select information on public listings</li>
                  <li>Use of cookies and tracking technologies to improve service</li>
                </ul>
              </section>

              <section style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#007bff', marginBottom: '15px' }}>8. Content and Intellectual Property</h3>
                <p>
                  You retain ownership of content you post on RecyConnect, but grant us a license to use, 
                  display, and distribute it for the purpose of operating the platform. You must not:
                </p>
                <ul style={{ marginTop: '10px' }}>
                  <li>Post content that infringes on others' intellectual property</li>
                  <li>Use RecyConnect's branding or design elements without permission</li>
                  <li>Copy or scrape content from the platform for commercial purposes</li>
                </ul>
              </section>

              <section style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#007bff', marginBottom: '15px' }}>9. Moderation and Enforcement</h3>
                <p>
                  RecyConnect reserves the right to:
                </p>
                <ul style={{ marginTop: '10px' }}>
                  <li>Remove listings that violate these terms</li>
                  <li>Suspend or terminate accounts for violations</li>
                  <li>Report illegal activity to law enforcement</li>
                  <li>Modify or discontinue any aspect of the service</li>
                  <li>Flag suspicious content for review</li>
                </ul>
              </section>

              <section style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#007bff', marginBottom: '15px' }}>10. Limitation of Liability</h3>
                <p>
                  RecyConnect is provided "as is" without warranties of any kind. We are not liable for:
                </p>
                <ul style={{ marginTop: '10px' }}>
                  <li>Direct or indirect damages from use of the platform</li>
                  <li>Loss of data or profits</li>
                  <li>Service interruptions or technical issues</li>
                  <li>Actions or content of other users</li>
                  <li>Third-party claims related to transactions</li>
                </ul>
              </section>

              <section style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#007bff', marginBottom: '15px' }}>11. Dispute Resolution</h3>
                <p>
                  In case of disputes between users, we encourage direct communication and resolution. 
                  For unresolved issues, you agree to first attempt mediation before pursuing legal action.
                </p>
              </section>

              <section style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#007bff', marginBottom: '15px' }}>12. Changes to Terms</h3>
                <p>
                  We reserve the right to modify these terms at any time. Continued use of RecyConnect 
                  after changes constitutes acceptance of the updated terms. We will notify users of 
                  significant changes via email or platform notification.
                </p>
              </section>

              <section style={{ marginBottom: '30px' }}>
                <h3 style={{ color: '#007bff', marginBottom: '15px' }}>13. Contact Information</h3>
                <p>
                  For questions about these Terms and Conditions, please contact us at:
                </p>
                <p style={{ marginTop: '10px', paddingLeft: '20px' }}>
                  <strong>Email:</strong> support@recyconnect.com<br />
                  <strong>Campus:</strong> RecyConnect Support Office
                </p>
              </section>

              <div style={{ 
                marginTop: '40px', 
                padding: '20px', 
                background: '#f0f8ff', 
                borderRadius: '8px',
                borderLeft: '4px solid #007bff'
              }}>
                <p style={{ margin: 0, fontWeight: '500' }}>
                  By using RecyConnect, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
