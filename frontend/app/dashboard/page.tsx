"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { UserRole } from "../types"

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    // Get user role from localStorage
    const userRole = localStorage.getItem("userRole") as UserRole
    
    if (userRole) {
      // Redirect to appropriate dashboard based on role
      router.push(`/dashboard/${userRole}`)
    } else {
      // If no role is set, redirect to login
      router.push("/login")
    }
  }, [router])

  // This page will never be shown as we redirect immediately
  return null
}
