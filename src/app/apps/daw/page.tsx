import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '@/components/site/site-chrome';

const TITLE = 'Zion DAW（製作中）｜分離から再ミックスまで';
const DESCRIPTION =
  '音源の分離・編集・差し替え・再ミックスをつなぐデスクトップDAWを製作中。ウェイトリスト受付準備中';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
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

const steps = [
  ['分離', '混ざった音源をステムに分ける'],
  ['編集', '分けたトラックを整える'],
  ['差し替え', 'パートを差し替えて試す'],
  ['再ミックス', 'もう一度まとめて聴く'],
];

function WaitlistCta() {
  return (
    <span
      className="inline-block rounded-lg border border-border px-6 py-3 font-semibold text-muted-foreground"
      aria-disabled="true"
    >
      ウェイトリストに登録する（準備中）
    </span>
  );
}

export default function ZionDawPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-4xl space-y-16 px-6 py-16">
        <p className="rounded-lg border border-border/60 bg-card px-4 py-3 text-sm text-muted-foreground">
          このページのアプリは<strong className="text-foreground">製作中</strong>
          です。画面や仕様は変わることがあります。価格・発売日はまだ決まっていません。
        </p>

        <section className="space-y-6">
          <span className="inline-block rounded-full border border-primary px-3 py-1 text-xs font-semibold text-primary">
            製作中
          </span>
          <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            音源を分離して、差し替えて、もう一度ミックスする
          </h1>
          <p className="text-sm font-medium text-primary">Zion DAW（製作中）</p>
          <p className="text-muted-foreground md:text-lg">
            混ざった音をバラし、編集して、パートを差し替え、再ミックスまで。その流れを一つのデスクトップDAWでつなぐことを目指しています。
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <WaitlistCta />
            <Link
              href="/apps"
              className="inline-block rounded-lg border border-border px-6 py-3 font-semibold transition hover:border-primary hover:text-primary"
            >
              他のアプリを見る
            </Link>
          </div>
          <Image
            unoptimized
            src="/apps/daw/apps_daw_hero_1600x900.svg"
            alt="分離・編集・差し替え・再ミックスの流れのイメージ"
            width={1600}
            height={900}
            className="h-auto w-full rounded-xl border border-border/60"
          />
        </section>

        <section>
          <h2 className="text-2xl font-bold">流れ</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-2">
            {steps.map(([t, d], i) => (
              <li key={t} className="rounded-xl border border-border/60 bg-card p-5">
                <p className="text-xs font-semibold text-muted-foreground">{i + 1}. {t}</p>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="space-y-4 rounded-xl border border-border/60 bg-card p-6 text-center md:p-10">
          <h2 className="text-2xl font-bold">完成に近づいたらお知らせします</h2>
          <p className="text-sm text-muted-foreground md:text-base">
            試作の進みや先行案内を受け取りたい方は、ウェイトリストへ。受付用のメール窓口は準備中です。
          </p>
          <WaitlistCta />
          <p className="text-xs text-muted-foreground">登録用アドレスが決まり次第、このボタンから送れます。</p>
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
    </div>
  );
}
