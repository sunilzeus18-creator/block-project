import React from 'react';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo">
          <span className="logo-icon">📄</span>
          <span className="logo-text">ResumeCheck AI</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
