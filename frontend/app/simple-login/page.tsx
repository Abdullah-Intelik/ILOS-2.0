'use client';

export default function SimpleLogin() {
  const handleLogin = () => {
    // Set user role in localStorage
    localStorage.setItem('userRole', 'pb');
    
    // Redirect to dashboard
    window.location.href = '/dashboard/pb/applications';
  };

  return (
    <div style={{
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <h1 style={{color: '#333', marginBottom: '20px'}}>UBL ILOS</h1>
        <p style={{color: '#666', marginBottom: '30px'}}>Simple Login Test</p>
        
        <button 
          onClick={handleLogin}
          style={{
            padding: '12px 24px',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            marginBottom: '20px'
          }}
        >
          Login as Personal Banking
        </button>
        
        <br />
        
        <small style={{color: '#888'}}>
          This will set your role and redirect to the dashboard
        </small>
      </div>
    </div>
  );
}
