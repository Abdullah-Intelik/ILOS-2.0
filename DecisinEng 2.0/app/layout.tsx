import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Credit Card Decision Engine',
  description: 'A modular credit card decision engine with real-time scoring',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}















