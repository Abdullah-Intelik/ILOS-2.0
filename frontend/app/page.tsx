"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserRole } from "./types";

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    // Check if user is already logged in
    const userRole = localStorage.getItem("userRole") as UserRole;
    
    if (userRole) {
      // Redirect to appropriate dashboard based on role
      router.push(`/dashboard/${userRole}`);
    } else {
      // If no role is set, redirect to login
      router.push("/login");
    }
  }, [router]);
  
  // This page should never be shown as we redirect immediately
  // Show a loading state while redirecting
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold">Loading...</h1>
        <p className="text-muted-foreground mt-2">Redirecting to dashboard</p>
      </div>
    </main>
  );
}


