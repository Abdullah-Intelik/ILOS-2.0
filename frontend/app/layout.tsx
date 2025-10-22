import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { CustomerProvider } from "@/contexts/CustomerContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "ILOS - Intelligent Loan Origination System",
  description: "Modern Loan Origination System with AI-Powered Decision Making",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <CustomerProvider>
            {children}
            <Toaster />
          </CustomerProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
