import React from 'react';
import IssueCertificate from './ResumeAnalyzer';
import VerifyCertificate from './VerifyCertificate';
import UploadResume from './UploadResume';

// Accept activeSection as a prop from App.js
export default function Dashboard({ activeSection }) {
  return (
    <div className="dashboard-content">
      {activeSection === 'home' && (
        <div className="home-main-flex">
          <div className="hero-block">
            <div className="hero-title">Welcome to CertiChain Dashboard</div>
            <div className="hero-desc">
              Securely create, manage, and verify digital certificates with blockchain.<br />
              Start by issuing certificates or verify credentials below.
            </div>
            <div className="hero-actions">
              {/* Optionally, for a button in Home that also activates 'issue' via the sidebar handler, trigger the parent's navigation function */}
              {/* Remove the following button if you only want sidebar navigation: */}
              {/* <button className="button-primary" onClick={() => setActiveSection('issue')}>Get Started</button> */}
            </div>
          </div>
          <div className="home-center-section">
            <div className="welcome-quote">
              <svg width="36" height="36" fill="none">
                <circle cx="18" cy="18" r="18" fill="#a259ff" opacity="0.16"/>
              </svg>
              <p>
                “Empowering institutions and learners.<br/>
                <span className="quote-highlight">Verified. Secure. Global.</span>”
              </p>
            </div>
            <div className="features-flex-grid">
              <div className="feature-item">
                <span role="img" aria-label="Fast" className="feature-icon" style={{background:'#823aff'}}>⚡</span>
                <div>
                  <strong>Instant Issuance</strong>
                  <p>Issue verifiable certificates instantly and securely.</p>
                </div>
              </div>
              <div className="feature-item">
                <span role="img" aria-label="Verify" className="feature-icon" style={{background:'#206efd'}}>✔️</span>
                <div>
                  <strong>One-Click Verification</strong>
                  <p>Anyone can verify authenticity in seconds.</p>
                </div>
              </div>
              <div className="feature-item">
                <span role="img" aria-label="Global" className="feature-icon" style={{background:'#09d2d4'}}>🌐</span>
                <div>
                  <strong>Globally Trusted</strong>
                  <p>Cross-border recognition and tamper-proof security.</p>
                </div>
              </div>
              <div className="feature-item">
                <span role="img" aria-label="Privacy" className="feature-icon" style={{background:'#ffd23c'}}>🔒</span>
                <div>
                  <strong>Private &amp; Secure</strong>
                  <p>Your data and credentials NEVER shared or sold.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {activeSection === 'issue' && <IssueCertificate />}
      {activeSection === 'verify' && <VerifyCertificate />}
      {activeSection === 'upload' && <UploadResume />}
    </div>
  );
}
