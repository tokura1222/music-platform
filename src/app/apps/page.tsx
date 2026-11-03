import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteShell, SiteHeader, SiteFooter } from '@/components/site/site-chrome';
import { StemsVisual, ClipsVisual } from '@/components/site/app-visuals';

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

const apps = [
  {
    href: '/apps/daw',
    title: 'Zion DAW',
    badge: '製作中',
    desc: '音源を分離して編集・差し替え、もう一度ミックスするデスクトップDAWを製作中です。',
    cta: 'ウェイトリストと詳細を見る',
    visual: <StemsVisual />,
  },
  {
    href: '/apps/zion',
    title: 'Zion 切り抜き',
    badge: '無料お試し(先着3名)',
    desc: '長い配信や講義を、字幕つきの縦型ショートにAIで切り抜きます。',
    cta: 'お試しの条件を見る',
    visual: <ClipsVisual />,
  },
];

export default function AppsPage() {
  return (
    <SiteShell>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-16 md:py-20">
        <p className="font-mono-zion text-xs tracking-widest text-muted-foreground">APPS</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">Apps</h1>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
          音と映像を、AIで扱いやすくするアプリとサービス。
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {apps.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group flex flex-col justify-between gap-8 rounded border border-border bg-card p-6 transition hover:border-foreground"
            >
              <div className="flex min-h-[11rem] flex-col justify-center">{a.visual}</div>
              <div>
                <p className="font-mono-zion inline-block rounded-sm border border-border px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground">
                  {a.badge}
                </p>
                <h2 className="mt-3 text-2xl font-bold">{a.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{a.desc}</p>
                <p className="mt-4 text-sm font-semibold underline-offset-4 group-hover:underline">{a.cta} →</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </SiteShell>
  );
}
