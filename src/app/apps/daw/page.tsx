import Link from 'next/link';
import type { Metadata } from 'next';
import { StemDemo } from '@/components/daw/stem-demo';
import { HeroLanes, FlowLanes } from '@/components/daw/daw-sections';
import { DAW_WAITLIST_URL } from '@/lib/site-config';
import { SiteShell, SiteHeader, SiteFooter } from '@/components/site/site-chrome';

const TITLE = 'Zion DAW（製作中）｜分離から再ミックスまで';
const DESCRIPTION =
  '音源の分離・編集・差し替え・再ミックスをつなぐデスクトップDAWを製作中。ウェイトリスト受付準備中';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: '/apps/daw' },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://www.zion-online.com/apps/daw',
    siteName: 'Zion Online',
    locale: 'ja_JP',
    type: 'website',
    images: [{ url: '/apps/daw/og_1200x630.png', width: 1200, height: 630, alt: 'Zion DAW（製作中）' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/apps/daw/og_1200x630.png'],
  },
};

function WaitlistCta({ label = 'ウェイトリスト登録' }: { label?: string }) {
  if (!DAW_WAITLIST_URL) {
    return (
      <span
        className="inline-block rounded border border-border px-5 py-3 font-semibold text-muted-foreground"
        aria-disabled="true"
      >
        {label}(準備中)
      </span>
    );
  }
  return (
    <a
      href={DAW_WAITLIST_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block rounded bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
    >
      {label}
    </a>
  );
}

export default function ZionDawPage() {
  return (
    <SiteShell>
      <SiteHeader />
      <main className="mx-auto max-w-5xl space-y-20 px-6 py-16">
        <p className="rounded border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          このページのアプリは<strong className="text-foreground">製作中</strong>
          です。画面や仕様は変わることがあります。価格・発売日はまだ決まっていません。
        </p>

        <section className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div className="space-y-6">
            <p className="font-mono-zion flex items-center gap-2 text-xs tracking-widest">
              <span className="rounded-sm border border-foreground px-1.5 py-0.5 font-semibold">PROTOTYPE</span>
              <span className="text-muted-foreground">Zion DAW（製作中）</span>
            </p>
            <h1 className="text-4xl font-bold leading-[1.15] tracking-tight md:text-5xl">
              混ざった音を、
              <br />
              パートごとに
              <br />
              触れるように。
            </h1>
            <p className="text-muted-foreground md:text-lg">
              分離して、編集して、パートを差し替えて、もう一度ミックスする。その流れを、一つのデスクトップDAWでつなぐことを目指しています。
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <WaitlistCta />
              <Link
                href="#demo"
                className="inline-block rounded border border-border px-5 py-3 font-semibold transition hover:border-foreground"
              >
                デモを聴く ↓
              </Link>
            </div>
          </div>
          <HeroLanes />
        </section>

        <section id="demo" className="scroll-mt-8 space-y-4">
          <h2 className="text-2xl font-bold">触ってみる</h2>
          <p className="text-sm text-muted-foreground">
            1曲を4つのパートに分けたデモです。M(ミュート)とS(ソロ)で、パートごとに聴き比べられます。
          </p>
          <StemDemo />
        </section>

        <section>
          <h2 className="text-2xl font-bold">流れ</h2>
          <p className="mt-2 text-sm text-muted-foreground">取り込んでから仕上げまで、4つの段階を一つの画面でつなぎます。</p>
          <FlowLanes />
        </section>

        <section className="space-y-4 rounded border border-border bg-card p-6 text-center md:p-10">
          <h2 className="text-2xl font-bold">完成に近づいたらお知らせします</h2>
          <p className="text-sm text-muted-foreground md:text-base">
            試作の進みや先行案内を受け取りたい方は、ウェイトリストへ。
          </p>
          <WaitlistCta />
          <p className="text-xs text-muted-foreground">登録いただいた方にだけ、試作の進みと先行案内をお送りします。</p>
        </section>

        <section className="space-y-2 text-center">
          <p className="text-lg font-semibold md:text-xl">分離から再ミックスまで、一つの流れで。Zion DAWは製作中です。</p>
        </section>
      </main>
      <SiteFooter>
        <p>
          本ページは開発中サービスの一般的な紹介です。仕様・価格・提供時期は未定で、変更されることがあります。
        </p>
      </SiteFooter>
    </SiteShell>
  );
}
