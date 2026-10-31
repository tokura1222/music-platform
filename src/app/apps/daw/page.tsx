import Image from 'next/image';
import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '@/components/site/site-chrome';

const TITLE = 'Zion DAW（製作中）｜分離・差し替え・再ミックス';
const DESCRIPTION = 'トラックを分離し、差し替え・再ミックスまで進められる音楽制作ツール「Zion DAW」。現在製作中です。';

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
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: DESCRIPTION,
  },
};

const steps = [
  ['分離', '1つの音源を、パートごとのトラックに分けます'],
  ['編集', '分けたトラックを、必要な範囲で整えます'],
  ['差し替え', '一部のパートを、手持ちの素材に入れ替えます'],
  ['再ミックス', '組み直したトラックを、もう一度まとめます'],
];

const faqs = [
  ['いつ使えますか？', '現在製作中です。準備が整いしだい、このページでお知らせします。'],
  ['どんな機能がありますか？', '分離・差し替え・再ミックスの流れを中心に開発しています。内容は開発の進み具合によって変わることがあります。'],
  ['ウェイトリストはありますか？', 'ウェイトリストの受付は準備中です。'],
];

function WaitlistLabel() {
  return (
    <span className="inline-block rounded-lg border border-border px-6 py-3 font-semibold text-muted-foreground" aria-disabled="true">
      ウェイトリスト登録（準備中）
    </span>
  );
}

export default function ZionDawPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-4xl space-y-16 px-6 py-16">
        <section className="space-y-6">
          <span className="inline-block rounded-full border border-primary px-3 py-1 text-xs font-semibold text-primary">製作中</span>
          <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl">分離 → 差し替え → 再ミックス — Zion DAW（製作中）</h1>
          <p className="text-muted-foreground md:text-lg">トラックを分離し、編集・差し替え・再ミックスまで進められるDAW（製作中）</p>
          <p className="text-muted-foreground">音源の分離から編集、素材の差し替え、再ミックスまでを一つの流れで。いまは製作中です。</p>
          <div className="flex flex-wrap items-center gap-4">
            <WaitlistLabel />
          </div>
          <Image unoptimized src="/apps/daw/apps_daw_hero_1600x900.svg" alt="分離・編集・差し替え・再ミックスの流れのイメージ" width={1600} height={900} className="h-auto w-full rounded-xl border border-border/60" />
        </section>

        <section>
          <h2 className="text-2xl font-bold">できること（予定）</h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {steps.map(([t, d]) => (
              <li key={t} className="rounded-xl border border-border/60 bg-card p-5">
                <p className="font-semibold text-primary">{t}</p>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">画面・機能は開発中のため変更されることがあります。</p>
        </section>

        <section className="space-y-6 text-center">
          <p className="text-2xl font-bold md:text-3xl">公開の準備ができたらお知らせします</p>
          <WaitlistLabel />
        </section>

        <section>
          <h2 className="text-2xl font-bold">よくある質問</h2>
          <div className="mt-6 space-y-6">
            {faqs.map(([q, a]) => (
              <div key={q}>
                <h3 className="font-semibold">{q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter>
        <p>画面・機能は開発中のため変更されることがあります。</p>
      </SiteFooter>
    </div>
  );
}
