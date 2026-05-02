import type { Metadata } from 'next';
import { Fredoka, Nunito, Press_Start_2P } from 'next/font/google';
import './globals.css';

const fredoka = Fredoka({
  weight: ['400', '600'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

const nunito = Nunito({
  weight: ['400', '600', '700', '800'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

const pressStart = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pixel',
});

export const metadata: Metadata = {
  title: 'StockQuest — Navigate the Market Maze',
  description: 'Learn investing by playing. A forest-adventure stock portfolio game.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable} ${pressStart.variable}`}>
      <body className="min-h-screen bg-forest-dark antialiased font-body">{children}</body>
    </html>
  );
}
