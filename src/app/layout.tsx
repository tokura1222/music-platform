import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Music Platform',
  description: 'Listen and download free music.',
};

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AudioPlayer from '@/components/AudioPlayer';
import { AudioProvider } from '@/context/AudioContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <AudioProvider>
          <Header />
          <main style={{ minHeight: 'calc(100vh - 140px)' }}>
            {children}
          </main>
          <AudioPlayer />
          <Footer />
        </AudioProvider>
      </body>
    </html>
  );
}
