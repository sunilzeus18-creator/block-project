// src/App.js - COMPLETE UPDATED VERSION (HiringIntelligence → BlockCertificate)
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TopBar from './components/TopBar';
import AdminLogin from './components/AdminLogin';
import StudentLogin from './components/StudentLogin';
import VerifyCertificate from './components/VerifyCertificate';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import BlockCertificate from './components/BlockchainCertificates'; // ✅ Replaces HiringIntelligence
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [loginType, setLoginType] = useState('select');
  const [activeSection, setActiveSection] = useState("home");
  const [searchValue, setSearchValue] = useState('');

  const handleNav = (section) => {
    if (section === "logout") {
      setIsLoggedIn(false);
      setUserRole('');
      setActiveSection("home");
      setLoginType('select');
    } else {
      setActiveSection(section);
    }
  };

  const handleLoginSuccess = (role) => {
    setUserRole(role);
    setIsLoggedIn(true);
    setLoginType('select');
    setActiveSection("home");
  };

  const handleBackToSelect = () => {
    setLoginType('select');
  };

  const handleWalletConnect = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        alert('MetaMask connected!');
      } catch (err) {
        alert('MetaMask connection failed.');
      }
    } else {
      alert('MetaMask is not installed!');
    }
  };

  // 🔥 HERO LANDING PAGE (unchanged)
  if (!isLoggedIn) {
    return (
      <div className="hero-landing">
        <div className="particles">
          <div className="particle p1"></div>
          <div className="particle p2"></div>
          <div className="particle p3"></div>
          <div className="particle p4"></div>
          <div className="particle p5"></div>
        </div>

        <div className="hero-content">
          <div className="logo">
            <div className="block-icon">🪙</div>
            <h1>BlockCert</h1>
            <p>Decentralized Certificate Verification</p>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <span className="number" data-target="100K+">0</span>
              <span>Certificates</span>
            </div>
            <div className="stat">
              <span className="number" data-target="50+">0</span>
              <span>Institutions</span>
            </div>
            <div className="stat">
              <span className="number" data-target="99.9%">0</span>
              <span>Uptime</span>
            </div>
          </div>

          {loginType === 'select' ? (
            <div className="login-buttons-hero">
              <button 
                className="hero-btn admin-hero" 
                onClick={() => setLoginType('admin')}
              >
                <span>👨‍💼 Admin Portal</span>
                <small>Issue Certificates</small>
              </button>
              <button 
                className="hero-btn student-hero" 
                onClick={() => setLoginType('student')}
              >
                <span>👨‍🎓 Student Portal</span>
                <small>Verify Credentials</small>
              </button>
            </div>
          ) : loginType === 'admin' ? (
            <AdminLogin onLoginSuccess={() => handleLoginSuccess('admin')} onBack={handleBackToSelect} />
          ) : (
            <StudentLogin onLoginSuccess={() => handleLoginSuccess('student')} onBack={handleBackToSelect} />
          )}

          <div className="features">
            <span>🔒 Immutable</span>
            <span>⚡ Instant</span>
            <span>🌐 Decentralized</span>
          </div>
        </div>

        <div className="scroll-indicator">↓</div>
      </div>
    );
  }

  // ✅ DASHBOARD - intelligence → BlockCertificate (your replacement)
  return (
    <div className="app-container">
      <Sidebar 
        active={activeSection} 
        onNav={handleNav}
        role={userRole}
      />
      <div style={{ marginLeft: '76px', width: '100%' }}>
        <TopBar
          onWalletConnect={handleWalletConnect}
          searchValue={searchValue}
          setSearchValue={setSearchValue}
          role={userRole}
        />
        <main>
          {activeSection === 'verify' ? (
            <VerifyCertificate />
          ) : activeSection === 'issue' ? (
            <ResumeAnalyzer />
          ) : activeSection === 'intelligence' ? (
            <BlockCertificate />  // ✅ Replaces HiringIntelligence
          ) : (
            <Dashboard activeSection={activeSection} searchValue={searchValue} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
