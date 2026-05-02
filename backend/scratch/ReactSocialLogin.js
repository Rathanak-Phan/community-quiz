// LoginPage.js
import React from 'react';

const LoginPage = () => {
  const handleGoogleLogin = () => {
    // Redirect to backend OAuth route
    window.location.href = 'http://localhost:8000/api/auth/google/redirect';
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <button 
        onClick={handleGoogleLogin} 
        className="google-btn"
        style={{
          backgroundColor: '#4285F4',
          color: 'white',
          padding: '10px 20px',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}
      >
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" 
          alt="Google" 
          width="20"
        />
        Login with Google
      </button>
    </div>
  );
};

export default LoginPage;

// --------------------------------------------------------------------------

// SocialLoginSuccess.js
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const SocialLoginSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Get token from query string
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      // 2. Save token to localStorage
      localStorage.setItem('auth_token', token);

      // 3. Redirect to dashboard
      console.log('Login successful, redirecting...');
      navigate('/dashboard');
    } else {
      // Handle error case
      navigate('/login?error=token_not_found');
    }
  }, [location, navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <h2>Authenticating... Please wait.</h2>
    </div>
  );
};

export default SocialLoginSuccess;
