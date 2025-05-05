import type { Metadata } from 'next'
import './globals.css'
import ThemeRegistry from './ThemeRegistry'


export const metadata: Metadata = {
  title: 'HueTracker',
  description: 'Track and manage your 3D printing filaments',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
          <ThemeRegistry>
          {children}
          </ThemeRegistry>
      </body>
    </html>
  )
}