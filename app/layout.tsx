import type { Metadata } from 'next';
import { JetBrains_Mono, Inter } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';

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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className='bg-black text-white font-sans min-h-screen flex flex-col'>
        <main className='flex-grow container mx-auto max-w-[700px] px-4 py-8'>
          {children}
          <Analytics />
        </main>

        <div className='fixed bottom-4 right-4'>
          <div className='bg-[#8976EA] bg-opacity-10 backdrop-blur-sm border border-[#8976EA] border-opacity-30 rounded-lg px-3 py-2 text-xs text-[#8976EA]'>
            <span>Made with </span>
            <span className='font-bold'>GitHubFolio</span>
          </div>
        </div>
      </body>
    </html>
  );
}
