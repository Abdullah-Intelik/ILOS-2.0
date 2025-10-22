"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { UserRole } from "../types"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const router = useRouter()
  const [userRole, setUserRole] = useState<UserRole>('pb')

  useEffect(() => {
    // Get user role from localStorage
    const storedRole = localStorage.getItem('userRole') as UserRole
    if (storedRole) {
      setUserRole(storedRole)
    } else {
      // If no role is set, redirect to login
      router.push('/login')
    }
  }, [router])

  // Check if the user is trying to access a role-specific page they don't have access to
  useEffect(() => {
    if (!pathname.includes('/dashboard') || !userRole) return
    
    const rolePatterns = {
      'pb': /^\/dashboard\/pb/,
      'spu': /^\/dashboard\/spu/,
      'spu_officer': /^\/dashboard\/spu_officer/,
      'cops': /^\/dashboard\/cops/,
      'eamvu': /^\/dashboard\/eamvu/,
      'ciu': /^\/dashboard\/ciu/,
      'rru': /^\/dashboard\/rru/,
      'risk': /^\/dashboard\/risk/,
      'compliance': /^\/dashboard\/compliance/,
    }

    // Check if user is accessing a role-specific page
    const isRoleSpecificPage = Object.values(rolePatterns).some(pattern => pattern.test(pathname))
    
    // If it's a role-specific page and doesn't match user's role, redirect
    if (isRoleSpecificPage) {
      const currentRole = Object.entries(rolePatterns).find(([role, pattern]) => pattern.test(pathname))?.[0]
      if (currentRole && currentRole !== userRole) {
        router.push(`/dashboard/${userRole}`)
      }
    }
  }, [pathname, userRole, router])

  return (

    <>
    
    <SidebarProvider>
      <AppSidebar userRole={userRole} />
      <SidebarInset>
        <Header userRole={userRole} />
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
    </>
  )
}
