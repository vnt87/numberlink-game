import type { Metadata } from 'next';
import { Geist } from 'next/font/google'; // Geist Sans is imported by default
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import GameHeader from '@/components/game-header';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

// Geist Mono not explicitly used for now, but keep if needed for other text styles.
// const geistMono = Geist_Mono({
//   variable: '--font-geist-mono',
//   subsets: ['latin'],
// });

export const metadata: Metadata = {
  title: 'Connectify',
  description: 'A fun and challenging line-drawing puzzle game.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body className="antialiased flex flex-col">
        <GameHeader />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
