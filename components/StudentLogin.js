import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';  // Backend URL

const StudentLogin = ({ onLoginSuccess, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const demoCreds = { username: 'student', password: 'student@123' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // ✅ CONNECT TO BACKEND /api/login
      const response = await axios.post(`${API_BASE}/login`, {
        username,
        password
      });
      
      console.log('✅ Backend login success:', response.data);
      onLoginSuccess();  // Go to dashboard
      
    } catch (err) {
      console.error('❌ Backend login error:', err.response?.data);
      setError(err.response?.data?.error || 'Login failed. Check backend server.');
    }
    
    setLoading(false);
  };

  return (
    <div className="login-form">
      <h2>🎓 Student Portal</h2>
      <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.9)' }}>
        Verify Certificates via Blockchain
      </p>
      
      <form onSubmit={handleSubmit}>
        <input
          className="login-input"
          type="text"
          placeholder="👨‍🎓 Student Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className="login-input"
          type="password"
          placeholder="🔒 Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="login-btn student-login-btn" disabled={loading}>
          {loading ? '⏳ Connecting...' : '✅ Login to Backend'}
        </button>
      </form>
      
      {error && <p style={{ color: '#ff6b6b', textAlign: 'center' }}>{error}</p>}
      
      <div className="demo-creds">
        <strong>🔑 Backend Demo:</strong><br/>
        Username: <code>{demoCreds.username}</code><br/>
        Password: <code>{demoCreds.password}</code>
      </div>
      
      <button className="back-btn" onClick={onBack} style={{ width: '100%' }}>
        ← Back to Home
      </button>
    </div>
  );
};

export default StudentLogin;
