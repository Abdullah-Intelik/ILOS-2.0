'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AutoLogin() {
  const router = useRouter();
  
  useEffect(() => {
    // Auto-login as PB user for development
    localStorage.setItem("userRole", "pb");
    console.log("Auto-login: Set role to PB");
    
    // Small delay to ensure localStorage is set
    setTimeout(() => {
      router.push("/dashboard/pb/applications");
    }, 100);
  }, [router]);

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
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #0066cc',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 20px'
        }}></div>
        <p style={{color: '#666'}}>Auto-logging you in as Personal Banking...</p>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
