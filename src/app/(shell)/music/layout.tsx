import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'レゲエ音楽を無料で聴く｜Zion Online Music' },
  description: 'AIで制作したレゲエ楽曲・映像を無料で聴ける音楽サイト。',
};

export default function MusicLayout({ children }: { children: React.ReactNode }) {
  return children;
}
