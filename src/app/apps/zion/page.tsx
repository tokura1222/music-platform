import Image from 'next/image';
import type { Metadata } from 'next';
import { SiteHeader, SiteFooter } from '@/components/site/site-chrome';

export const metadata: Metadata = {
  title: 'Zion 切り抜き | Zion Online',
  description: '長い配信や講義を、字幕つきの縦型ショートにAIで切り抜く',
};

const FORM_URL = 'https://best-skipjack-709.notion.site/9c4c17e758714c4fbcebaee30be64838';
const CONTACT_MAIL = 'mailto:contact@zion-online.com'; // placeholder address

const differentiators = [
  ['手間なし', '設定やアプリのインストールは不要。こちらで切り抜きまで作ります'],
  ['X向け縦型', '字幕つきの縦型ショートを前提'],
  ['権利クリア前提のお試し', '本人に権利のある60分以内の動画だけ受け付けます'],
];

const conditions = [
  '先着3名さま無料',
  'ご自身に権利のある配信・講義など、60分以内の動画1本',
  'ゲーム実況など第三者の権利が絡む映像は対象外',
  '出来上がりの切り抜きをお返しします',
];

function PrimaryCta() {
  return (
    <a href={FORM_URL} target="_blank" rel="noopener noreferrer" className="inline-block rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90">
      無料お試しに申し込む
    </a>
  );
}

function Shot({ src, alt }: { src: string; alt: string }) {
  return <Image unoptimized src={src} alt={alt} width={1600} height={900} className="h-auto w-full rounded-xl border border-border/60" />;
}

export default function ZionAppPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-4xl space-y-16 px-6 py-16">
        <section className="space-y-6">
          <h1 className="text-3xl font-bold leading-tight tracking-tight md:text-4xl">長い配信や講義を、字幕つきの縦型ショートにAIで切り抜く</h1>
          <p className="text-muted-foreground md:text-lg">見どころの選定・縦型化・字幕まで。あなたがやるのは、権利のある動画を渡すことだけです。</p>
          <div className="flex flex-wrap items-center gap-4">
            <PrimaryCta />
            <a href={CONTACT_MAIL} className="rounded-lg border border-border px-6 py-3 font-semibold transition hover:border-primary">その他のお問い合わせ</a>
          </div>
          <Shot src="/apps/zion/apps_zion_hero_1600x900.svg" alt="Zion 切り抜きのイメージ" />
        </section>

        <section><Shot src="/apps/zion/apps_zion_before_after_1600x900.svg" alt="切り抜き前と後の比較" /></section>
        <section><Shot src="/apps/zion/demo_post1_flow_1600x900.svg" alt="動画を渡してから切り抜きが届くまでの流れ" /></section>

        <section>
          <h2 className="text-2xl font-bold">3つの特長</h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {differentiators.map(([t, d]) => (
              <li key={t} className="rounded-xl border border-border/60 bg-card p-5">
                <p className="font-semibold text-primary">{t}</p>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold">無料お試しの条件</h2>
          <ul className="mt-6 list-disc space-y-2 pl-6">
            {conditions.map((c) => <li key={c}>{c}</li>)}
          </ul>
        </section>

        <section className="space-y-6 text-center">
          <p className="text-2xl font-bold md:text-3xl">切り抜き1本、いま何分かけていますか？</p>
          <PrimaryCta />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-border/60 bg-card p-6">
            <p className="font-semibold">無料お試し</p>
            <p className="mt-2 text-sm text-muted-foreground"><a href={FORM_URL} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">上のフォームから</a></p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card p-6">
            <p className="font-semibold">その他（取材・提携など）</p>
            <p className="mt-2 text-sm text-muted-foreground"><a href={CONTACT_MAIL} className="underline hover:text-primary">メール</a></p>
          </div>
        </section>
      </main>
      <SiteFooter>
        <p>本ページの内容は一般的なサービスの紹介です。個別の権利判断の助言ではありません。</p>
      </SiteFooter>
    </div>
  );
}
