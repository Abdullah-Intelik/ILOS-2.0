'use client';

export default function QuickAccess() {
  const handleRoleLogin = (role: string) => {
    localStorage.setItem("userRole", role);
    window.location.href = `/dashboard/${role}`;
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
        textAlign: 'center',
        maxWidth: '400px'
      }}>
        <h1 style={{color: '#333', marginBottom: '10px'}}>🏦 UBL ILOS</h1>
        <p style={{color: '#666', marginBottom: '30px'}}>Quick Access Dashboard</p>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
          <button 
            onClick={() => handleRoleLogin('pb')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            🏛️ Personal Banking (PB)
          </button>
          
          <button 
            onClick={() => handleRoleLogin('rru')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#cc6600',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            ⚠️ Risk & Recovery (RRU)
          </button>
          
          <button 
            onClick={() => handleRoleLogin('ciu')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#006600',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            🕵️ Credit Investigation (CIU)
          </button>
          
          <a 
            href="http://localhost:3001"
            target="_blank"
            style={{
              padding: '12px 24px',
              backgroundColor: '#660066',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              textDecoration: 'none',
              display: 'block'
            }}
          >
            ⛓️ Blockchain Monitor
          </a>
        </div>
        
        <br />
        
        <small style={{color: '#888', display: 'block', marginTop: '20px'}}>
          💡 This bypasses the login issue in WSL environment
        </small>
      </div>
    </div>
  );
}
