import React from 'react';

function LoadingState() {
  const styles = {
    container: {
      textAlign: 'center',
      padding: '40px',
      background: 'white',
      borderRadius: '16px',
      marginTop: '30px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
    },
    spinner: {
      width: '50px',
      height: '50px',
      border: '4px solid #e5e7eb',
      borderTop: '4px solid #667eea',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 20px'
    },
    text: {
      color: '#6b7280',
      fontSize: '1.1rem'
    }
  };

  return (
    <div style={styles.container}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={styles.spinner}></div>
      <p style={styles.text}>Analyzing your resume...</p>
    </div>
  );
}

export default LoadingState;
