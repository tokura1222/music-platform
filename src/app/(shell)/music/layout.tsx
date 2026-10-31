import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Zion Online - Reggae Music Platform',
  description: 'Listen and download the best Reggae music.',
};

export default function MusicLayout({ children }: { children: React.ReactNode }) {
  return children;
}
