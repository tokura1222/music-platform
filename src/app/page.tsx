import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteShell, SiteHeader, SiteFooter } from '@/components/site/site-chrome';
import { StemsVisual, ClipsVisual, MusicVisual } from '@/components/site/app-visuals';

export const metadata: Metadata = {
  title: { absolute: 'Zion Online｜音楽とアプリのハブ' },
  description: 'レゲエ音楽と、配信・講義の切り抜きアプリを届けるサイト',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Zion Online｜音楽とアプリのハブ',
    description: 'レゲエ音楽と、配信・講義の切り抜きアプリを届けるサイト',
    url: 'https://www.zion-online.com/',
    siteName: 'Zion Online',
    locale: 'ja_JP',
    type: 'website',
    images: [{ url: '/og/hub_1200x630.png', width: 1200, height: 630, alt: 'Zion Online' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zion Online｜音楽とアプリのハブ',
    description: 'レゲエ音楽と、配信・講義の切り抜きアプリを届けるサイト',
    images: ['/og/hub_1200x630.png'],
  },
};

const rows = [
  {
    no: '01',
    href: '/apps/daw',
    label: 'APP',
    title: 'Zion DAW',
    badge: '製作中',
    desc: '音源を分離して、差し替えて、もう一度ミックスするデスクトップDAW。',
    visual: <StemsVisual />,
  },
  {
    no: '02',
    href: '/apps/zion',
    label: 'APP',
    title: 'Zion 切り抜き',
    badge: '無料お試し',
    desc: '長い配信や講義を、字幕つきの縦型ショートにAIで切り抜きます。',
    visual: <ClipsVisual />,
  },
  {
    no: '03',
    href: '/music',
    label: 'MUSIC',
    title: 'Music',
    badge: '無料',
    desc: 'AIで制作したレゲエ楽曲・映像を無料で楽しめる音楽サイト。',
    visual: <MusicVisual />,
  },
];

export default function HubPage() {
  return (
    <SiteShell>
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-16 md:py-24">
        <p className="font-mono-zion text-xs tracking-widest text-muted-foreground">ZION ONLINE</p>
        <h1 className="mt-4 text-4xl font-bold leading-[1.15] tracking-tight md:text-6xl">
          音楽と、
          <br />
          音のためのアプリ。
        </h1>
        <p className="mt-6 max-w-xl text-muted-foreground md:text-lg">
          レゲエ音楽と、配信・講義の切り抜きアプリを届けるサイトです。
        </p>

        <ol className="mt-16 border-t border-border">
          {rows.map((r) => (
            <li key={r.href}>
              <Link
                href={r.href}
                className="group grid gap-5 border-b border-border py-8 transition hover:bg-card md:grid-cols-[6rem_1fr_18rem] md:items-center md:gap-8 md:px-4"
              >
                <div className="flex items-baseline gap-3 md:block">
                  <span className="font-mono-zion text-3xl font-bold leading-none">{r.no}</span>
                  <span className="font-mono-zion block text-[10px] tracking-widest text-muted-foreground">{r.label}</span>
                </div>
                <div>
                  <h2 className="flex flex-wrap items-center gap-3 text-2xl font-bold">
                    {r.title}
                    <span className="font-mono-zion rounded-sm border border-border px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground">
                      {r.badge}
                    </span>
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">{r.desc}</p>
                  <p className="mt-3 text-sm font-semibold underline-offset-4 group-hover:underline">見る →</p>
                </div>
                {r.visual}
              </Link>
            </li>
          ))}
        </ol>
      </main>
      <SiteFooter />
    </SiteShell>
  );
}
