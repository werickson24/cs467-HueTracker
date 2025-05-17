import type { Metadata } from 'next'
import './globals.css'
import theme from './theme';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import { Analytics } from '@vercel/analytics/next';

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
          <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
              {children}
              <Analytics />
            </ThemeProvider>
          </AppRouterCacheProvider>
      </body>
    </html>
  )
}
