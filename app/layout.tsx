import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GitHub Profile Analyzer',
  description: 'Analyze GitHub profiles and visualize user activity',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <header className='bg-gray-800 text-white p-6'>
          <div className='container mx-auto'>
            <h1 className='text-3xl font-bold'>GitHub Profile Analyzer</h1>
            <p className='mt-2'>Visualize GitHub activity and statistics</p>
          </div>
        </header>

        <main className='container mx-auto p-6 min-h-screen'>{children}</main>

        <footer className='bg-gray-800 text-white p-6'>
          <div className='container mx-auto text-center'>
            <p>GitHub Profile Analyzer © {new Date().getFullYear()}</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
