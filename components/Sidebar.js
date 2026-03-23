// src/components/Sidebar.js - BlockCertificate READY
import React from 'react';
import {
  FaHome,
  FaRegFileAlt,
  FaCheckCircle,
  FaUpload,
  FaBrain,
  FaCube,
  FaBell,
  FaQuestionCircle,
  FaCog,
  FaSignOutAlt
} from 'react-icons/fa';

const sidebarStyle = {
  width: '76px',
  background: '#17182a',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '18px 0',
  position: 'fixed',
  left: 0,
  top: 0,
  zIndex: 1000,
};

const iconStyle = {
  fontSize: '1.7rem',
  color: '#bfc7fb',
  margin: '28px 0',
  cursor: 'pointer',
  transition: 'color 0.2s'
};

const activeStyle = {
  color: '#3466f6',
  background: 'rgba(52,102,246,0.12)',
  borderRadius: '12px',
  padding: '10px'
};

function Sidebar({ active = "home", onNav, role }) {  // ✅ Added role prop
  return (
    <nav style={sidebarStyle}>
      <img
        alt="BlockCert Logo"
        src="down.png"
        style={{ width: 40, height: 40, marginBottom: 30 }}
      />
      
      {/* Core Navigation */}
      <FaHome style={active === "home" ? { ...iconStyle, ...activeStyle } : iconStyle}
        title="Dashboard" onClick={() => onNav("home")} />
      
      {/* ✅ BlockCertificate Flow - TOP PRIORITY */}
      <FaRegFileAlt style={active === "issue" ? { ...iconStyle, ...activeStyle } : iconStyle}
        title="Issue Certificate" onClick={() => onNav("issue")} />
      
      <FaCheckCircle style={active === "verify" ? { ...iconStyle, ...activeStyle } : iconStyle}
        title="View Certificates" onClick={() => onNav("verify")} />
      
      {/* Admin-Only: Hiring Intelligence (IPFS cert issuer) */}
      {role === 'admin' && (
        <FaBrain style={active === "intelligence" ? { ...iconStyle, ...activeStyle } : iconStyle}
          title="Issue Certificates (Admin)" onClick={() => onNav("intelligence")} />
      )}
      
      {/* Other Features */}
      <FaUpload style={active === "upload" ? { ...iconStyle, ...activeStyle } : iconStyle}
        title="Upload Resume" onClick={() => onNav("upload")} />
      
      <FaCube style={active === "blockchain" ? { ...iconStyle, ...activeStyle } : iconStyle}
        title="Blockchain Status" onClick={() => onNav("blockchain")} />
      
      <FaBell style={active === "notifications" ? { ...iconStyle, ...activeStyle } : iconStyle}
        title="Notifications" onClick={() => onNav("notifications")} />
      
      <FaQuestionCircle style={active === "support" ? { ...iconStyle, ...activeStyle } : iconStyle}
        title="Support" onClick={() => onNav("support")} />
      
      <FaCog style={active === "settings" ? { ...iconStyle, ...activeStyle } : iconStyle}
        title="Settings" onClick={() => onNav("settings")} />
      
      <div style={{ flexGrow: 1 }} />
      
      <FaSignOutAlt style={iconStyle} title="Logout" onClick={() => onNav("logout")} />
    </nav>
  );
}

export default Sidebar;
