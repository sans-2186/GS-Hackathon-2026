import type { Metadata } from 'next';
import { Press_Start_2P } from 'next/font/google';
import './globals.css';

const pressStart = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pixel',
});

export const metadata: Metadata = {
  title: 'StockQuest — GS Hackathon 2026',
  description: 'Master the market through play. A pixel-art stock portfolio runner game.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={pressStart.variable}>
      <body className="min-h-screen bg-pixel-dark antialiased">{children}</body>
    </html>
  );
}
