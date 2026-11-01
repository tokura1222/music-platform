import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'レゲエ音楽を無料で聴く｜Zion Online Music' },
  description: 'AIで制作したレゲエ楽曲・映像を無料で聴ける音楽サイト。',
  openGraph: {
    title: 'レゲエ音楽を無料で聴く｜Zion Online Music',
    description: 'AIで制作したレゲエ楽曲・映像を無料で聴ける音楽サイト。',
    siteName: 'Zion Online',
    locale: 'ja_JP',
    type: 'website',
    images: [{ url: '/og/music_1200x630.png', width: 1200, height: 630, alt: 'Zion Online Music' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'レゲエ音楽を無料で聴く｜Zion Online Music',
    description: 'AIで制作したレゲエ楽曲・映像を無料で聴ける音楽サイト。',
    images: ['/og/music_1200x630.png'],
  },
};

export default function MusicLayout({ children }: { children: React.ReactNode }) {
  return children;
}
