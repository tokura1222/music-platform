import type { Metadata } from 'next';
import { SiteShell, SiteHeader, SiteFooter } from '@/components/site/site-chrome';
import { FaqList } from '@/components/site/faq-list';
import { ClipsHero } from '@/components/site/clips-hero';
import Link from 'next/link';
import { TrackedLink } from '@/components/site/tracked-link';
import { ZION_CHECKOUT_URL } from '@/lib/site-config';
import { FORM_URL, FLOW, FEATURES, CONDITIONS, PRICING_NOTE, PLANS, FAQS } from '@/data/zion-info';

export const metadata: Metadata = {
  title: { absolute: 'Zion 切り抜き｜長い配信を字幕つき縦型ショートに' },
  description: '配信者・講義向け。権利のある動画を渡すだけで、字幕つき縦型ショートをAIが作成。無料お試しあり',
  alternates: { canonical: '/apps/zion' },
  openGraph: {
    title: 'Zion 切り抜き｜長い配信を字幕つき縦型ショートに',
    description: '配信者・講義向け。権利のある動画を渡すだけで、字幕つき縦型ショートをAIが作成。無料お試しあり',
    url: 'https://www.zion-online.com/apps/zion',
    siteName: 'Zion Online',
    locale: 'ja_JP',
    type: 'website',
    images: [{ url: '/apps/zion/og_1200x630.png', width: 1200, height: 630, alt: 'Zion 切り抜き' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zion 切り抜き｜長い配信を字幕つき縦型ショートに',
    description: '配信者・講義向け。権利のある動画を渡すだけで、字幕つき縦型ショートをAIが作成。無料お試しあり',
    images: ['/apps/zion/og_1200x630.png'],
  },
};

const PAGE_URL = 'https://www.zion-online.com/apps/zion';

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Zion 切り抜き',
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'Web',
      description: '配信者・講義向け。権利のある動画を渡すだけで、字幕つき縦型ショートをAIが作成。無料お試しあり',
      url: PAGE_URL,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY', description: '無料お試し（先着3名さま）' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQS.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    },
  ],
};

function PrimaryCta({ label = '無料お試しに申し込む' }: { label?: string }) {
  return (
    <a
      href={FORM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block rounded bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
    >
      {label}
    </a>
  );
}

export default function ZionAppPage() {
  return (
    <SiteShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <main className="mx-auto max-w-5xl space-y-20 px-6 py-16">
        <section className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div className="space-y-6">
            <p className="font-mono-zion flex items-center gap-2 text-xs tracking-widest">
              <span className="rounded-sm border border-foreground px-1.5 py-0.5 font-semibold">FREE TRIAL</span>
              <span className="text-muted-foreground">Zion 切り抜き</span>
            </p>
            <h1 className="text-4xl font-bold leading-[1.15] tracking-tight md:text-5xl">
              長い配信を、
              <br />
              字幕つきの
              <br />
              縦型ショートに。
            </h1>
            <p className="text-muted-foreground md:text-lg">
              見どころの選定・縦型化・字幕まで。あなたがやるのは、権利のある動画を渡すことだけです。
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <PrimaryCta />
              <a href="#flow" className="inline-block rounded border border-border px-5 py-3 font-semibold transition hover:border-foreground">
                流れを見る ↓
              </a>
            </div>
            <p className="text-xs text-muted-foreground">先着3名さま無料・60分以内の動画1本</p>
          </div>
          <ClipsHero />
        </section>

        <section id="flow" className="scroll-mt-8">
          <h2 className="text-2xl font-bold">流れ</h2>
          <ol className="mt-8 border-t border-border">
            {FLOW.map((f) => (
              <li key={f.no} className="grid gap-2 border-b border-border py-6 md:grid-cols-[8rem_16rem_1fr] md:items-baseline md:gap-8">
                <div className="flex items-baseline gap-3 md:block">
                  <span className="font-mono-zion text-3xl font-bold leading-none">{f.no}</span>
                  <span className="font-mono-zion block text-[10px] tracking-widest text-muted-foreground">{f.en}</span>
                </div>
                <h3 className="text-xl font-bold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold">3つの特長</h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-3">
            {FEATURES.map(([t, d], i) => (
              <li key={t} className="rounded border border-border bg-card p-5">
                <span aria-hidden className={`mb-3 block h-1 w-8 ${['bg-stem-vocal', 'bg-stem-bass', 'bg-stem-drums'][i]}`} />
                <p className="font-semibold">{t}</p>
                <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold">実例</h2>
          <p className="mt-2 text-sm text-muted-foreground">ご本人の許可をいただいた切り抜きを、準備ができ次第ここに掲載します。</p>
          <div className="mt-6 grid grid-cols-3 gap-3 md:max-w-xl">
            {[0, 1, 2].map((i) => (
              <div key={i} className="font-mono-zion flex aspect-[9/16] items-center justify-center rounded border border-dashed border-border bg-card text-[10px] tracking-widest text-muted-foreground">
                COMING SOON
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold">無料お試しの条件</h2>
          <dl className="mt-6 divide-y divide-border border-y border-border">
            {CONDITIONS.map(([k, v]) => (
              <div key={k} className="grid gap-1 py-4 md:grid-cols-[12rem_1fr] md:gap-6">
                <dt className="font-semibold">{k}</dt>
                <dd className="text-sm text-muted-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h2 className="text-2xl font-bold">
            料金
            <span className="font-mono-zion ml-3 rounded-sm border border-border px-1.5 py-0.5 align-middle text-[10px] font-semibold tracking-widest text-muted-foreground">仮</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{PRICING_NOTE}</p>
          <div className="mt-6 grid gap-4 md:max-w-2xl md:grid-cols-2">
            {PLANS.map((p) => (
              <div key={p.name} className="flex flex-col justify-between rounded border border-border bg-card p-6">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="font-mono-zion mt-3 text-2xl font-bold">{p.price}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{p.note}</p>
                </div>
                <div className="mt-6">
                  {p.paid ? (
                    ZION_CHECKOUT_URL ? (
                      <TrackedLink
                        href={ZION_CHECKOUT_URL}
                        event="begin_checkout"
                        eventParams={{ item_name: 'zion-clips' }}
                        className="inline-block rounded bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                      >
                        購入する
                      </TrackedLink>
                    ) : (
                      <span className="inline-block rounded border border-border px-5 py-3 text-sm font-semibold text-muted-foreground" aria-disabled="true">
                        販売準備中
                      </span>
                    )
                  ) : (
                    <PrimaryCta label="無料お試しに申し込む" />
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            お支払いはクレジットカード等(Stripe)です。購入前に
            <Link href="/legal/tokushoho" className="underline underline-offset-2 hover:text-foreground">特定商取引法に基づく表記</Link>
            と
            <Link href="/legal/terms" className="underline underline-offset-2 hover:text-foreground">利用規約</Link>
            をご確認ください。
          </p>
        </section>

        <section className="rounded border border-border bg-card p-8 text-center md:p-12">
          <p className="text-2xl font-bold md:text-3xl">切り抜き1本、いま何分かけていますか?</p>
          <div className="mt-6">
            <PrimaryCta />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold">よくある質問</h2>
          <FaqList items={FAQS} />
        </section>

        <p className="text-center text-sm text-muted-foreground">
          取材・提携などのご相談は、メール窓口を準備中です。
        </p>
      </main>
      <SiteFooter>
        <p>本ページの内容は一般的なサービスの紹介です。個別の権利判断の助言ではありません。</p>
      </SiteFooter>
    </SiteShell>
  );
}
