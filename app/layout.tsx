// app/layout.tsx
import type { Metadata } from 'next';
import { JetBrains_Mono, Inter } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';
import { ThemeProvider } from '@/lib/ThemeProvider';

// Font for code and technical elements
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

// Font for UI and general text
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GitHubFolio | Developer Portfolio',
  description: 'Developer portfolio generated from GitHub profile',
  other: {
    'google-site-verification': 'nuCl9b7zW3D9gHLY2i0bTUAsUuelQXWQZDKsw0MpaNQ',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className='font-sans min-h-screen flex flex-col relative'>
        <ThemeProvider>
          <div className='fixed top-4 right-4 text-xs font-mono text-[var(--text-secondary)]'>
            {new Date()
              .toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
              .toUpperCase()}
          </div>

          <main className='flex-grow container mx-auto max-w-[800px] px-4 py-8'>
            {children}
            <Analytics />
          </main>

          <div className='fixed bottom-4 right-4'>
            <div className='bg-[var(--primary)] bg-opacity-10 backdrop-blur-sm border border-[var(--primary)] border-opacity-30 rounded-lg px-3 py-2 text-xs text-white'>
              <span>Made with </span>
              <span className='font-bold'>GitHubFolio</span>
            </div>
          </div>

          {/* Grid decorations */}
          <div className='grid-marker top-[25%] left-[10%]'></div>
          <div className='grid-marker bottom-[15%] right-[10%]'></div>
          <div className='grid-marker top-[10%] right-[30%]'></div>
          <div className='grid-marker bottom-[30%] left-[20%]'></div>
        </ThemeProvider>
      </body>
    </html>
  );
}
