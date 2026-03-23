import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    const loadCertificates = () => {
      try {
        const saved = localStorage.getItem('issuedCertificates');
        if (saved) {
          const parsed = JSON.parse(saved);
          // Filter and fix invalid certs with defaults
          const validCerts = Array.isArray(parsed)
            ? parsed
                .map(cert => ({
                    id: cert?.id || `cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    studentName: cert?.studentName || 'Student Name',
                    studentId: cert?.studentId || 'STU-0000',
                    courseName: cert?.courseName || 'Course Name',
                    courseNo: cert?.courseNo || '001',
                    timestamp: cert?.timestamp || Date.now(),
                    qrContent: cert?.qrContent || 'https://example.com/verify',
                    signature: cert?.signature || '0x0000000000000000000000000000000000000000000000000000000000000000',
                    address: cert?.address || '0x742d35Cc6634C0532925a3b8D7fE6fdDEbeF78a1'
                  }))
                .filter(cert => cert.id && cert.signature)
            : [];
          setCertificates(validCerts);
          // Overwrite with cleaned data
          localStorage.setItem('issuedCertificates', JSON.stringify(validCerts));
        }
      } catch (error) {
        console.error('localStorage parse error:', error);
        localStorage.removeItem('issuedCertificates');
        setCertificates([]);
      }
    };

    loadCertificates();
  }, []);

  if (certificates.length === 0) {
    return (
      <div style={{ 
        padding: '100px 40px', 
        textAlign: 'center', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white', 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: '6rem', marginBottom: '30px' }}>📜</div>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '20px', fontWeight: '700' }}>
          No Certificates Yet
        </h1>
        <p style={{ fontSize: '1.5rem', opacity: 0.9 }}>
          Issue your first certificate to see it here
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '0', 
      margin: '0',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* HEADER */}
      <div style={{ 
        padding: '40px 60px',
        background: 'linear-gradient(90deg, #28a745 0%, #20c997 100%)',
        color: 'white',
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(40,167,69,0.3)'
      }}>
        <h1 style={{ 
          fontSize: '3.5rem', 
          margin: 0, 
          fontWeight: '800',
          textShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          📜 Issued Certificates
        </h1>
        <div style={{ 
          fontSize: '1.4rem', 
          opacity: 0.95, 
          marginTop: '10px',
          fontWeight: '500'
        }}>
          Total: <strong style={{ fontSize: '1.6rem' }}>{certificates.length}</strong>
        </div>
      </div>

      {/* CERTIFICATES GRID */}
      <div style={{ 
        padding: '60px 40px',
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(1000px, 1fr))', 
        gap: '40px', 
        justifyContent: 'center',
        minHeight: 'calc(100vh - 300px)'
      }}>
        {certificates
          ?.filter(cert => cert?.id && cert?.signature)
          ?.map((cert) => (
          <div 
            key={cert.id} 
            style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f0f9ff 100%)',
              borderRadius: '32px',
              boxShadow: '0 25px 80px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.3)',
              overflow: 'hidden',
              border: '1px solid rgba(40, 167, 69, 0.2)',
              height: '420px',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative'
            }} 
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-15px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 40px 120px rgba(0,0,0,0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 25px 80px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.3)';
            }}
          >
            {/* MAIN CONTENT */}
            <div style={{
              display: 'flex',
              height: '100%',
              overflow: 'hidden'
            }}>
              {/* LEFT: Certificate Info */}
              <div style={{
                flex: '2',
                padding: '50px 50px 50px 60px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                {/* TOP BADGE */}
                <div style={{ 
                  alignSelf: 'flex-start',
                  background: 'linear-gradient(45deg, #28a745, #20c997)', 
                  color: 'white', 
                  padding: '12px 28px', 
                  borderRadius: '50px', 
                  fontSize: '15px',
                  fontWeight: '700',
                  boxShadow: '0 8px 25px rgba(40,167,69,0.4)',
                  letterSpacing: '1px'
                }}>
                  CERT #{(cert?.id || '').slice(-6).toUpperCase()}
                </div>
                
                {/* NAME & COURSE */}
                <div>
                  <h1 style={{ 
                    fontSize: '3.2rem', 
                    color: '#1a202c', 
                    margin: '0 0 15px 0',
                    fontWeight: '900',
                    lineHeight: '1.1',
                    letterSpacing: '-1px'
                  }}>
                    {cert?.studentName || 'N/A'}
                  </h1>
                  <div style={{ 
                    fontSize: '1.6rem', 
                    color: '#4a5568', 
                    marginBottom: '30px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                  }}>
                    <span style={{ color: '#28a745', fontSize: '1.8rem' }}>🎓</span>
                    {cert?.courseName || 'N/A'}
                    <span style={{ 
                      background: 'rgba(40,167,69,0.2)', 
                      color: '#28a745', 
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '1.1rem',
                      fontWeight: '700'
                    }}>
                      {cert?.courseNo || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* DETAILS ROW */}
                <div style={{ display: 'flex', gap: '30px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: '120px' }}>
                    <span style={{ fontSize: '13px', color: '#718096', fontWeight: '500' }}>Student ID</span>
                    <span style={{ fontSize: '1.1rem', color: '#2d3748', fontWeight: '700' }}>
                      {cert?.studentId || 'N/A'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: '140px' }}>
                    <span style={{ fontSize: '13px', color: '#718096', fontWeight: '500' }}>Issue Date</span>
                    <span style={{ fontSize: '1.1rem', color: '#2d3748', fontWeight: '700' }}>
                      {cert?.timestamp 
                        ? new Date(cert.timestamp).toLocaleDateString('en-US', { 
                            year: 'numeric', month: 'long', day: 'numeric' 
                          })
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>

                {/* STATUS BADGE */}
                <div style={{ 
                  padding: '20px 32px', 
                  background: 'linear-gradient(135deg, #28a745, #20c997)',
                  borderRadius: '20px',
                  color: 'white',
                  textAlign: 'center',
                  fontSize: '1.3rem',
                  fontWeight: '800',
                  boxShadow: '0 10px 30px rgba(40,167,69,0.4)',
                  letterSpacing: '1px'
                }}>
                  ✓ BLOCKCHAIN VERIFIED CERTIFICATE
                </div>
              </div>

              {/* RIGHT: QR + Signature */}
              <div style={{
                flex: 1,
                padding: '60px 50px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(248,250,252,0.8) 0%, rgba(237,242,247,0.8) 100%)',
                backdropFilter: 'blur(20px)',
                borderLeft: '1px solid rgba(255,255,255,0.8)'
              }}>
                {/* LARGE QR CODE */}
                <div style={{
                  width: '220px',
                  height: '220px',
                  padding: '20px',
                  background: 'white',
                  borderRadius: '24px',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
                  marginBottom: '35px',
                  border: '3px solid rgba(40,167,69,0.3)'
                }}>
                  <QRCode 
                    value={cert?.qrContent || 'https://example.com/verify'} 
                    size={180}
                    level="H"
                    style={{ 
                      height: "100%", 
                      width: "100%",
                      borderRadius: '16px'
                    }}
                  />
                </div>

                {/* DIGITAL SIGNATURE */}
                <div style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.9)',
                  padding: '24px',
                  borderRadius: '20px',
                  boxShadow: '0 15px 40px rgba(0,0,0,0.1)',
                  textAlign: 'center',
                  border: '1px solid rgba(255,255,255,0.5)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ 
                    fontSize: '13px', 
                    color: '#718096', 
                    fontWeight: '600',
                    marginBottom: '12px',
                    letterSpacing: '0.5px'
                  }}>
                    DIGITAL SIGNATURE
                  </div>
                  <div style={{ 
                    fontSize: '11px', 
                    color: '#2d3748', 
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                    lineHeight: '1.3',
                    letterSpacing: '-0.5px',
                    background: 'rgba(40,167,69,0.05)',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    borderLeft: '4px solid #28a745'
                  }}>
                    {(cert?.signature || '').slice(0, 36)}...
                  </div>
                </div>
              </div>
            </div>

            {/* BOTTOM ADDRESS BAR */}
            <div style={{
              padding: '25px 60px',
              background: 'linear-gradient(90deg, rgba(40,167,69,0.95) 0%, rgba(32,201,151,0.95) 100%)',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backdropFilter: 'blur(20px)'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', opacity: 0.95, marginBottom: '6px' }}>📍 Address</div>
                <div style={{ 
                  fontSize: '15px', 
                  lineHeight: '1.5',
                  opacity: 0.98,
                  maxWidth: '600px'
                }}>
                  {(cert?.address || '').length > 100 
                    ? (cert.address || '').slice(0, 100) + '...' 
                    : (cert.address || 'N/A')
                  }
                </div>
              </div>
              <div style={{ 
                textAlign: 'right', 
                padding: '20px 30px',
                background: 'rgba(255,255,255,0.25)',
                borderRadius: '20px',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
              }}>
                <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>✓</div>
                <div style={{ fontSize: '16px', fontWeight: '700', marginTop: '5px' }}>
                  VERIFIED
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Certificates;
