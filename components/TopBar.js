import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';

// onWalletConnect is a prop you pass from App.js
export default function TopBar({ onWalletConnect }) {
  const [searchValue, setSearchValue] = useState('');

  return (
    <header className="topbar">
      <div className="topbar-left">
        {/* Logo should be placed in public folder, e.g. public/logo.png */}
        <img src="/logoo.png" alt="CertiChain logo" className="topbar-logo" />
        <span className="topbar-title">CertiChain Dashboard</span>
      </div>
      <div className="topbar-center">
        <div className="topbar-search">
          <FiSearch className="topbar-search-icon" />
          <input
            type="text"
            placeholder="Search certificates…"
            className="topbar-search-input"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
          />
        </div>
      </div>
      <div className="topbar-right">
        <button className="metamask-connect-btn" onClick={onWalletConnect}>
          Meta Wallet Connect
        </button>
        {/* Avatar should be placed in public folder, e.g. public/avatar.png */}
        <img src="/avatar.jpg" alt="profile" className="topbar-avatar" />
      </div>
    </header>
  );
}
