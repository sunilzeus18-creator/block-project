// src/components/BlockchainCertificates.js
import React, { useState } from 'react';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Update post-deploy

const CONTRACT_ABI = [
  "function admin() view returns (address)",
  "function issueCertificate(bytes,string,string,string,string,string)",
  "function certificateExists(bytes32) view returns (bool)",
  "function generateHash(bytes,string,string,string,string,string) pure returns (bytes32)",
  "function verifyHash(bytes32) public view returns (bool,string)",
  "event CertificateIssued(bytes32,string)"
];

const BlockCertificate = () => {
  const [file, setFile] = useState(null);
  const [studentData, setStudentData] = useState({
    name: '', rollNumber: '', course: '', year: '', institution: ''
  });
  const [hashKey, setHashKey] = useState('');
  const [status, setStatus] = useState('Connect MetaMask to issue certificates');
  const [isUploading, setIsUploading] = useState(false);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setStatus('📄 File selected. Fill student details.');
  };

  const handleStudentDataChange = (e) => {
    setStudentData({ ...studentData, [e.target.name]: e.target.value });
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = await provider.getSigner();
        const addr = await signer.getAddress();
        setAccount(addr);

        const cont = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        setContract(cont);

        const admin = await cont.admin();
        if (addr.toLowerCase() === admin.toLowerCase()) {
          setStatus('✅ Admin connected! Ready to issue certificates');
        } else {
          setStatus('❌ Only admin can issue certificates');
        }
      } catch (error) {
        setStatus('❌ Wallet connection failed');
      }
    } else {
      setStatus('❌ MetaMask required');
    }
  };

  const generateAndStoreHash = async () => {
    const missingFields = Object.entries(studentData).filter(([_, value]) => !value);
    if (missingFields.length > 0 || !file || !contract) {
      setStatus(`❌ Complete form & connect as admin`);
      return;
    }

    setIsUploading(true);
    setStatus('🔍 Checking for duplicates...');

    try {
      // Convert file to bytes (exact Solidity match)
      const arrayBuffer = await file.arrayBuffer();
      const certBytes = ethers.getBytes(ethers.hexlify(new Uint8Array(arrayBuffer)));

      // PRE-FLIGHT: Generate & check hash (FREE view calls)
      const hashKeyPreview = await contract.generateHash(
        certBytes, studentData.name, studentData.rollNumber,
        studentData.course, studentData.year, studentData.institution
      );
      const [exists] = await contract.verifyHash(hashKeyPreview);
      if (exists) {
        setStatus('⚠️ Certificate already exists on blockchain!');
        setIsUploading(false);
        return;
      }
      setHashKey(hashKeyPreview); // Show preview

      setStatus('🔐 Calling smart contract...');
      
      // Issue txn
      const tx = await contract.issueCertificate(
        certBytes, studentData.name, studentData.rollNumber,
        studentData.course, studentData.year, studentData.institution
      );

      setStatus('⛓️ Mining transaction...');
      const receipt = await tx.wait();

      // Parse event for confirmation
      const iface = contract.interface;
      const event = receipt.logs.find(log => {
        try { return iface.parseLog(log).name === 'CertificateIssued'; } catch { return false; }
      });
      const finalHash = event ? iface.parseLog(event).args.hashKey : hashKeyPreview;
      setHashKey(finalHash);

      setStatus(`✅ SUCCESS! Tx: ${tx.hash.slice(0, 20)}... Issued on blockchain!`);
      setFile(null);
      setStudentData({ name: '', rollNumber: '', course: '', year: '', institution: '' });
    } catch (error) {
      if (error.reason?.includes('already exists')) {
        setStatus('⚠️ Certificate already exists on blockchain!');
      } else if (error.reason?.includes('Only admin')) {
        setStatus('❌ Connect as ADMIN account');
      } else {
        setStatus('❌ ' + (error.reason || error.message));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const isFormComplete = file && 
    studentData.name && studentData.rollNumber && 
    studentData.course && studentData.year && 
    studentData.institution && contract;

  return (
    <div className="blockcert-container">
      <div className="blockcert-header">
        <div className="header-icon">🪙</div>
        <h1>Issue Blockchain Certificates</h1>
        <p>Live on Hardhat blockchain - {CONTRACT_ADDRESS}</p>
      </div>

      <div className="upload-card">
        {!account ? (
          <button className="connect-wallet-btn" onClick={connectWallet}>
            🔗 Connect MetaMask (Account #0 Admin)
          </button>
        ) : (
          <div className="wallet-info">
            <span>Connected: {account.slice(0, 6)}...{account.slice(-4)}</span>
            <span className="admin-badge">ADMIN</span>
          </div>
        )}

        <div className="upload-zone" onClick={() => document.getElementById('fileInput').click()}>
          <input id="fileInput" type="file" onChange={handleFileChange} accept=".pdf,.jpg,.png" style={{ display: 'none' }} />
          {!file ? (
            <>
              <div className="upload-icon">📄</div>
              <p>Click to upload certificate</p>
            </>
          ) : (
            <div className="file-preview">
              <span className="file-icon">📎</span>
              <span>{file.name}</span>
              <button className="remove-file" onClick={(e) => { e.stopPropagation(); setFile(null); }}>×</button>
            </div>
          )}
        </div>

        <div className="student-form">
          <h3>👤 Student Details</h3>
          <div className="form-grid">
            <div className="form-group"><label>Name *</label><input name="name" placeholder="Smeer" value={studentData.name} onChange={handleStudentDataChange} /></div>
            <div className="form-group"><label>Roll # *</label><input name="rollNumber" placeholder="268" value={studentData.rollNumber} onChange={handleStudentDataChange} /></div>
            <div className="form-group"><label>Course *</label><input name="course" placeholder="B.E CSE" value={studentData.course} onChange={handleStudentDataChange} /></div>
            <div className="form-group"><label>Year *</label><input name="year" placeholder="2024" value={studentData.year} onChange={handleStudentDataChange} /></div>
            <div className="form-group full-width"><label>Institution *</label><input name="institution" placeholder="SREC" value={studentData.institution} onChange={handleStudentDataChange} /></div>
          </div>
        </div>

        <button 
          className={`upload-btn ${isFormComplete && !isUploading ? 'ready' : ''}`}
          onClick={generateAndStoreHash}
          disabled={!isFormComplete || isUploading}
        >
          {isUploading ? <><span className="spinner"></span>Issuing...</> : '🚀 Issue Certificate'}
        </button>

        {status && <div className={`status-message ${status.includes('SUCCESS') ? 'success' : status.includes('exists') ? 'warning' : 'error'}`}>{status}</div>}
      </div>

      {hashKey && (
        <div className="hash-display">
          <h3>✅ Blockchain Hash</h3>
          <div className="hash-box">
            <code>{hashKey}</code>
            <button className="copy-btn" onClick={() => navigator.clipboard.writeText(hashKey)}>Copy</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockCertificate;
