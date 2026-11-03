import Link from 'next/link';
import { FaqList } from '@/components/site/faq-list';
import { COMPANION_DAWS, FAQS, FEATURES, PLANS, ROADMAP, SPECS } from '@/data/daw-info';

const Provisional = () => (
  <span className="font-mono-zion ml-3 rounded-sm border border-border px-1.5 py-0.5 align-middle text-[10px] font-semibold tracking-widest text-muted-foreground">
    仮
  </span>
);

const H2 = ({ children, provisional }: { children: React.ReactNode; provisional?: boolean }) => (
  <h2 className="text-2xl font-bold">
    {children}
    {provisional && <Provisional />}
  </h2>
);

export function FeatureTable() {
  return (
    <section>
      <H2>機能</H2>
      <ul className="mt-6 border-t border-border">
        {FEATURES.map((f) => (
          <li key={f.name} className="grid gap-1 border-b border-border py-4 md:grid-cols-[14rem_1fr_6rem] md:items-baseline md:gap-6">
            <span className="font-semibold">{f.name}</span>
            <span className="text-sm text-muted-foreground">{f.desc}</span>
            <span className="font-mono-zion text-xs text-muted-foreground md:text-right">{f.status}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function CompanionSection() {
  return (
    <section className="grid gap-8 md:grid-cols-[1fr_1.2fr] md:items-start">
      <div>
        <H2>いつものDAWと一緒に</H2>
        <p className="mt-3 text-sm text-muted-foreground">
          置き換えではなく併用を想定しています。分けたステムを書き出して、普段お使いのDAWで続きの作業へ。
        </p>
      </div>
      <div className="rounded border border-border bg-card p-6">
        <p className="font-mono-zion text-[10px] tracking-widest text-muted-foreground">DESIGNED TO SIT ALONGSIDE</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {COMPANION_DAWS.map((d) => (
            <li key={d} className="rounded border border-border px-3 py-1.5 text-sm font-semibold">{d}</li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted-foreground">
          併用を想定した設計の例です。各DAWでの動作確認は今後行い、確認できた範囲だけを掲載します。各製品名は各社の商標または登録商標です。
        </p>
      </div>
    </section>
  );
}

export function SpecsSection() {
  return (
    <section>
      <H2 provisional>動作環境</H2>
      <dl className="mt-6 divide-y divide-border border-y border-border">
        {SPECS.map(([k, v]) => (
          <div key={k} className="grid gap-1 py-4 md:grid-cols-[14rem_1fr] md:gap-6">
            <dt className="font-semibold">{k}</dt>
            <dd className="text-sm text-muted-foreground">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function PricingSection() {
  return (
    <section>
      <H2 provisional>価格</H2>
      <p className="mt-2 text-sm text-muted-foreground">金額・販売形態は仮です。確定までに変わります。</p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {PLANS.map((p) => (
          <div key={p.name} className="rounded border border-border bg-card p-6">
            <p className="font-semibold">{p.name}</p>
            <p className="font-mono-zion mt-3 text-3xl font-bold">{p.price}</p>
            <p className="mt-1 text-xs text-muted-foreground">{p.note}</p>
            <ul className="mt-4 space-y-1 text-sm text-muted-foreground">
              {p.points.map((pt) => (
                <li key={pt} className="before:mr-2 before:content-['—']">{pt}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        販売はクレジットカード等の決済(Stripe)を予定しています。販売条件は
        <Link href="/legal/tokushoho" className="underline underline-offset-2 hover:text-foreground">特定商取引法に基づく表記</Link>
        をご覧ください。
      </p>
    </section>
  );
}

export function RoadmapSection() {
  return (
    <section>
      <H2 provisional>ロードマップ</H2>
      <p className="mt-2 text-sm text-muted-foreground">時期は未定です。順番も変わる場合があります。</p>
      <ol className="mt-6 grid gap-px overflow-hidden rounded border border-border bg-border md:grid-cols-4">
        {ROADMAP.map((r, i) => (
          <li key={r.stage} className={`p-5 ${r.current ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
            <p className="font-mono-zion text-[10px] tracking-widest opacity-70">{String(i + 1).padStart(2, '0')}{r.current ? ' · NOW' : ''}</p>
            <p className="mt-2 font-bold">{r.stage}</p>
            <p className={`mt-1 text-xs ${r.current ? 'opacity-80' : 'text-muted-foreground'}`}>{r.desc}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function FaqSection() {
  return (
    <section>
      <H2>よくある質問</H2>
      <FaqList items={FAQS} />
    </section>
  );
}
