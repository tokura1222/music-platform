import Link from 'next/link';
import type { Metadata } from 'next';
import { Music, AppWindow } from 'lucide-react';
import { SiteHeader, SiteFooter } from '@/components/site/site-chrome';

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

const entries = [
  { href: '/music', title: 'Music', desc: 'AIで制作したレゲエ楽曲・映像を無料で楽しめる音楽サイト。', Icon: Music },
  { href: '/apps', title: 'Apps', desc: '配信・講義の切り抜きなど、AIを活用したアプリとサービス。', Icon: AppWindow },
];

export default function HubPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-20">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Zion Online</h1>
        <p className="mt-4 text-muted-foreground">音楽とアプリを届けるサイトです。</p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {entries.map(({ href, title, desc, Icon }) => (
            <Link key={href} href={href} className="group rounded-xl border border-border/60 bg-card p-8 transition hover:border-primary">
              <Icon className="h-8 w-8 text-primary" />
              <h2 className="mt-4 text-2xl font-semibold group-hover:text-primary">{title} →</h2>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
