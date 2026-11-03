import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteShell, SiteHeader, SiteFooter } from '@/components/site/site-chrome';
import { FORM_URL } from '@/data/zion-info';
import { ZION_DELIVERY_NOTE } from '@/lib/site-config';

export const metadata: Metadata = {
  title: 'ご購入ありがとうございます',
  robots: { index: false, follow: false },
};

const steps: [string, string][] = [
  ['領収メールを確認', 'Stripe から、ご入力のメールアドレスに領収書(レシート)が届きます。届かない場合は迷惑メールフォルダもご確認ください。'],
  ['動画の情報を送る', '下のフォームから、切り抜きたい動画(ご自身に権利のあるもの)の情報をお送りください。'],
  ['納品', '字幕つきの縦型ショートを、ご指定の方法でお返しします。'],
];

export default function ThanksPage() {
  return (
    <SiteShell>
      <SiteHeader />
      <main className="mx-auto max-w-3xl space-y-12 px-6 py-16">
        <section className="space-y-4">
          <p className="font-mono-zion text-xs tracking-widest text-muted-foreground">THANK YOU</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">ご購入ありがとうございます</h1>
          <p className="text-muted-foreground">お支払いが完了しました。続けて、次の手順をお願いします。</p>
        </section>

        <ol className="border-t border-border">
          {steps.map(([t, d], i) => (
            <li key={t} className="grid gap-2 border-b border-border py-5 md:grid-cols-[4rem_14rem_1fr] md:items-baseline md:gap-6">
              <span className="font-mono-zion text-2xl font-bold">{String(i + 1).padStart(2, '0')}</span>
              <h2 className="font-bold">{t}</h2>
              <p className="text-sm text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>

        <div className="space-y-3">
          <a
            href={FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
          >
            動画の情報を送る
          </a>
          <p className="text-xs text-muted-foreground">お届けの目安: {ZION_DELIVERY_NOTE}</p>
        </div>

        <p className="text-xs text-muted-foreground">
          お預かりする動画は、ご自身に権利があるものに限ります。詳しくは
          <Link href="/legal/terms" className="underline underline-offset-2 hover:text-foreground">利用規約</Link>
          をご覧ください。
        </p>
      </main>
      <SiteFooter />
    </SiteShell>
  );
}
