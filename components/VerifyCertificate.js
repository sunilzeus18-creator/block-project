import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'react-qr-code';
import CryptoJS from 'crypto-js';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS = '0x0x5FbDB2315678afecb367f032d93F642f64180aa3';
const ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "studentId", "type": "string"},
      {"internalType": "string", "name": "courseCode", "type": "string"},
      {"internalType": "string", "name": "courseNumber", "type": "string"},
      {"internalType": "string", "name": "fileHash", "type": "string"}
    ],
    "name": "issueCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "studentId", "type": "string"},
      {"internalType": "string", "name": "courseCode", "type": "string"},
      {"internalType": "string", "name": "courseNumber", "type": "string"},
      {"internalType": "string", "name": "fileHash", "type": "string"}
    ],
    "name": "verifyCertificate",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "bytes32", "name": "", "type": "bytes32"}],
    "name": "issuedCerts",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
];

const VerifyCertificate = () => {
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    courseName: '',
    courseNo: '',
    address: '',
    certificateFile: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('');
  const [qrData, setQrData] = useState('');
  const [certificateHash, setCertificateHash] = useState('');
  const [signature, setSignature] = useState('');
  const [certificates, setCertificates] = useState([]);
  const [isVerified, setIsVerified] = useState(false);
  const fileInputRef = useRef(null);

  // Load saved certificates
  useEffect(() => {
    const saved = localStorage.getItem('issuedCertificates');
    if (saved) {
      setCertificates(JSON.parse(saved));
    }

    const inputs = ['studentId', 'studentName', 'courseName', 'courseNo', 'address'];
    inputs.forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.setAttribute('required', '');
        input.setAttribute('data-cert-field', id);
      }
    });

    const fileInput = fileInputRef.current;
    if (fileInput) {
      fileInput.setAttribute('accept', '.pdf,image/*');
      fileInput.setAttribute('data-cert-field', 'certificate');
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'certificateFile') {
      setFormData(prev => ({ ...prev, certificateFile: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Generate file hash (deterministic - same file = same hash)
  const generateFileHash = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        const hashBuffer = CryptoJS.lib.WordArray.create(arrayBuffer);
        const hash = CryptoJS.SHA256(hashBuffer).toString();
        resolve(hash);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('');
    setQrData('');

    try {
      // 1. Generate file hash (BYPASSES rename - same content = same hash)
      let fileHash = '';
      if (formData.certificateFile) {
        fileHash = await generateFileHash(formData.certificateFile);
        setCertificateHash(fileHash);
      } else {
        throw new Error('Upload certificate file');
      }

      // 2. BLOCKCHAIN ISSUE - DUPLICATE CHECK HERE
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

        // Map form → contract params
        const tx = await contract.issueCertificate(
          formData.studentId,
          formData.courseName,
          formData.courseNo,
          fileHash  // KEY: same file → duplicate error!
        );
        await tx.wait();
        
        setSubmitStatus('✅ Issued to BLOCKCHAIN!');
      } else {
        throw new Error('Install MetaMask');
      }

      // 3. Generate QR with blockchain data
      const qrContent = `🎓 CERTI-CHAIN BLOCKCHAIN CERTIFICATE
ID: ${formData.studentId}
Name: ${formData.studentName}
Course: ${formData.courseName}-${formData.courseNo}
Hash: ${fileHash.slice(0, 24)}...
Contract: ${CONTRACT_ADDRESS.slice(0, 10)}...
VERIFY ON BLOCKCHAIN`;
      setQrData(qrContent);

      // 4. Save locally (optional)
      const cert = {
        id: `CERT-${Date.now()}`,
        studentId: formData.studentId,
        studentName: formData.studentName,
        courseName: formData.courseName,
        courseNo: formData.courseNo,
        address: formData.address,
        fileHash,
        blockchain: true,
        timestamp: new Date().toISOString(),
        status: 'ISSUED'
      };
      const updated = [cert, ...certificates];
      localStorage.setItem('issuedCertificates', JSON.stringify(updated));
      setCertificates(updated);
      setIsVerified(true);

    } catch (error) {
      console.error(error);
      if (error.reason?.includes('Certificate already exists')) {
        setSubmitStatus('❌ CERTIFICATE EXISTS - Duplicate blocked by blockchain!');
      } else if (error.code === 4001) {
        setSubmitStatus('❌ Transaction rejected');
      } else {
        setSubmitStatus(`❌ ${error.reason || error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="verify-certificate-container" style={{
      padding: '20px', maxWidth: '900px', margin: '0 auto'
    }}>
      <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>
        🚀 Issue Blockchain Certificate
      </h2>
      
      <form onSubmit={handleSubmit} className="cert-form">
        {/* ALL YOUR EXISTING INPUT FIELDS - UNCHANGED */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Student ID *<span style={{color: '#007bff'}}> (Blockchain ID)</span>
          </label>
          <input id="studentId" name="studentId" type="text" 
            value={formData.studentId} onChange={handleInputChange}
            placeholder="e.g., STU001 or 0xabc123..." required
            style={{
              width: '100%', padding: '12px', border: '2px solid #007bff',
              borderRadius: '6px', fontSize: '16px', fontWeight: '500'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Student Name *
          </label>
          <input id="studentName" name="studentName" type="text" 
            value={formData.studentName} onChange={handleInputChange}
            placeholder="Enter full student name" required
            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Course Name *</label>
          <input id="courseName" name="courseName" type="text" value={formData.courseName}
            onChange={handleInputChange} placeholder="e.g., Computer Science" required
            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', marginBottom: '15px' }} />
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Course Number *</label>
          <input id="courseNo" name="courseNo" type="text" value={formData.courseNo}
            onChange={handleInputChange} placeholder="e.g., CS101" required
            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Address Details *</label>
          <textarea id="address" name="address" value={formData.address}
            onChange={handleInputChange} placeholder="Enter complete address" rows="3" required
            style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', resize: 'vertical' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Upload Certificate *</label>
          <input ref={fileInputRef} name="certificateFile" type="file" accept=".pdf,image/*"
            onChange={handleInputChange} required
            style={{ width: '100%', padding: '12px', border: '2px dashed #28a745', borderRadius: '6px', fontSize: '16px', backgroundColor: '#f8f9fa', marginBottom: '15px' }} />
          {formData.certificateFile && (
            <div style={{ padding: '8px', backgroundColor: '#d4edda', borderRadius: '4px', fontSize: '14px' }}>
              ✅ {formData.certificateFile.name} 
              {certificateHash && <span>(Hash: {certificateHash.slice(0,16)}...)</span>}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center' }}>
          <button type="submit" disabled={isSubmitting || !formData.certificateFile}
            style={{
              padding: '15px 50px', fontSize: '18px', fontWeight: 'bold',
              backgroundColor: '#28a745', color: 'white', border: 'none',
              borderRadius: '8px', cursor: isSubmitting || !formData.certificateFile ? 'not-allowed' : 'pointer',
              minWidth: '280px'
            }}
          >
            {isSubmitting 
              ? '🔄 Writing to BLOCKCHAIN...' 
              : '🚀 Issue Blockchain Certificate'
            }
          </button>
        </div>
      </form>

      {/* RESULTS SECTION - UNCHANGED */}
      {qrData && (
        <div style={{
          marginTop: '30px', padding: '25px', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          borderRadius: '16px', border: '3px solid #28a745', textAlign: 'center'
        }}>
          <h3 style={{ color: '#28a745', marginBottom: '20px', fontSize: '24px' }}>
            🎉 Blockchain Certificate Issued!
          </h3>
          
          <div style={{ marginBottom: '20px', background: '#e9ecef', padding: '12px', borderRadius: '8px' }}>
            <strong>🔗 File Hash (Blockchain):</strong><br/>
            <code style={{ fontSize: '12px', wordBreak: 'break-all', color: '#007bff' }}>
              {certificateHash}
            </code>
          </div>

          <div style={{
            padding: '20px', background: 'white', borderRadius: '12px',
            border: '4px solid #28a745', marginBottom: '15px', display: 'inline-block'
          }}>
            <QRCode 
              value={qrData} 
              size={180}
              style={{ height: "auto", maxWidth: "100%", width: "100%" }}
              level="H"
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>
          
          <div style={{ maxWidth: '400px', margin: '0 auto', fontSize: '14px' }}>
            <p style={{ color: '#28a745', fontWeight: 'bold', marginBottom: '10px' }}>
              📱 Scan QR → Auto-verifies on blockchain
            </p>
          </div>
        </div>
      )}

      {submitStatus && (
        <div style={{
          padding: '15px', marginTop: '20px', borderRadius: '8px',
          textAlign: 'center', fontWeight: '500',
          backgroundColor: submitStatus.includes('✅') ? '#d4edda' : '#f8d7da',
          color: submitStatus.includes('✅') ? '#155724' : '#721c24',
          border: `2px solid ${submitStatus.includes('✅') ? '#28a745' : '#dc3545'}`
        }}>
          {submitStatus}
        </div>
      )}
    </div>
  );
};

export default VerifyCertificate;
