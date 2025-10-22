"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WorkingLoginPage() {
  const router = useRouter();
  const [role, setRole] = useState("pb");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("🔐 Starting login process...");
      
      // Store user role in localStorage
      localStorage.setItem("userRole", role);
      console.log("✅ Role stored in localStorage:", role);

      // Small delay to show loading state
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Redirect to the appropriate dashboard
      const targetUrl = role === 'pb' ? `/dashboard/${role}/applications` : `/dashboard/${role}`;
      console.log("🚀 Redirecting to:", targetUrl);
      
      router.push(targetUrl);
    } catch (error) {
      console.error("❌ Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', 
      backgroundColor: '#f0f2f5',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ 
          textAlign: 'center', 
          marginBottom: '10px', 
          color: '#333',
          fontSize: '24px'
        }}>
          🏦 UBL ILOS
        </h1>
        <p style={{ 
          textAlign: 'center', 
          marginBottom: '30px', 
          color: '#666',
          fontSize: '14px'
        }}>
          Intelligent Loan Origination System
        </p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              Username
            </label>
            <input
              type="text"
              placeholder="Enter username"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              defaultValue="admin"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Enter password"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px'
              }}
              defaultValue="password"
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              color: '#333'
            }}>
              Login As
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="pb">Personal Banking (PB)</option>
              <option value="spu">Sales Processing Unit (SPU)</option>
              <option value="cops">Consumer Operations (COPS)</option>
              <option value="ciu">Central Investigation Unit (CIU)</option>
              <option value="rru">Rejection Review Unit (RRU)</option>
              <option value="risk">Risk Management</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isLoading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {isLoading ? "Logging in..." : "🚀 Login"}
          </button>
        </form>

        <div style={{ 
          marginTop: '20px', 
          textAlign: 'center',
          fontSize: '12px',
          color: '#666'
        }}>
          <p>Use any username/password to login</p>
          <p>Select your department and click Login</p>
        </div>
      </div>
    </div>
  );
}
