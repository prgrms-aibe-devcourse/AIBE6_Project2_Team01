import { AuthProvider } from '@/components/auth/AuthProvider'
import { NavBar } from '@/components/layout/NavBar'
import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {
  title: 'Modle',
  description: '모델과 의뢰인을 잇는 매칭 플랫폼',
  icons: {
    icon: '/icon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <NavBar />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
