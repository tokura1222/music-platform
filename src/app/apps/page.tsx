import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '@/components/site/site-chrome';

export const metadata: Metadata = {
  title: 'Apps',
  description: '配信・講義の切り抜きや、分離・差し替え・再ミックスのDAW（製作中）など、AIを使ったアプリ一覧',
  alternates: { canonical: '/apps' },
  openGraph: {
    title: 'Apps｜Zion Online',
    description: '配信・講義の切り抜きや、分離・差し替え・再ミックスのDAW（製作中）など、AIを使ったアプリ一覧',
    url: 'https://www.zion-online.com/apps',
    siteName: 'Zion Online',
    locale: 'ja_JP',
    type: 'website',
    images: [{ url: '/og/apps_1200x630.png', width: 1200, height: 630, alt: 'Zion Online Apps' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apps｜Zion Online',
    description: '配信・講義の切り抜きや、分離・差し替え・再ミックスのDAW（製作中）など、AIを使ったアプリ一覧',
    images: ['/og/apps_1200x630.png'],
  },
};

export default function AppsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight">Apps</h1>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Link
            href="/apps/zion"
            className="group overflow-hidden rounded-xl border border-border/60 bg-card transition hover:border-primary"
          >
            <Image
              unoptimized
              src="/apps/zion/apps_zion_hero_1600x900.svg"
              alt="Zion 切り抜き"
              width={1600}
              height={900}
              className="h-auto w-full"
            />
            <div className="p-6">
              <h2 className="text-xl font-semibold group-hover:text-primary">Zion 切り抜き →</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                長い配信や講義を、字幕つきの縦型ショートにAIで切り抜きます。
              </p>
            </div>
          </Link>
          <Link
            href="/apps/daw"
            className="group overflow-hidden rounded-xl border border-border/60 bg-card transition hover:border-primary"
          >
            <Image
              unoptimized
              src="/apps/daw/apps_daw_hero_1600x900.svg"
              alt="Zion DAW（製作中）"
              width={1600}
              height={900}
              className="h-auto w-full"
            />
            <div className="p-6">
              <h2 className="text-xl font-semibold group-hover:text-primary">Zion DAW（製作中） →</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                音源を分離して編集・差し替え、もう一度ミックスするDAWを製作中です。
              </p>
            </div>
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
