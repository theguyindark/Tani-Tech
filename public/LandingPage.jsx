import React from 'react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', marginTop: '20vh' }}>
      <h1>Welcome to TADW</h1>
      <p>Your trusted digital wallet for farmers</p>
      <button
        style={{
          padding: '1em 2em',
          fontSize: '1.2em',
          background: '#219653',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '2em'
        }}
        onClick={() => navigate('/dashboard')}
      >
        Start
      </button>
    </div>
  );
}

export default LandingPage;