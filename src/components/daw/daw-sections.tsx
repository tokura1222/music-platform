/**
 * Illustrative (non-screenshot) visuals for the Zion DAW page.
 * Pure CSS / deterministic data so server and client render identically.
 * Replace with real app screenshots when available.
 */

type Stem = 'vocal' | 'bass' | 'drums' | 'other';

const STEM_BG: Record<Stem, string> = {
  vocal: 'bg-stem-vocal',
  bass: 'bg-stem-bass',
  drums: 'bg-stem-drums',
  other: 'bg-stem-other',
};

const STEM_LABEL: Record<Stem, string> = {
  vocal: 'VOCAL',
  bass: 'BASS',
  drums: 'DRUMS',
  other: 'OTHER',
};

/** deterministic pseudo-random bar heights (no Math.random => no hydration mismatch) */
const bars = (seed: number, n: number, density = 1): number[] => {
  let s = seed;
  return Array.from({ length: n }, (_, i) => {
    s = (s * 1103515245 + 12345) % 2147483648;
    const r = s / 2147483648;
    const swell = 0.55 + 0.45 * Math.sin((i / n) * Math.PI * 3 + seed);
    return Math.max(0.1, Math.min(1, r * swell * density + 0.12));
  });
};

const Ruler = () => (
  <div className="font-mono-zion flex justify-between border-b border-border pb-1 text-[10px] text-muted-foreground" aria-hidden>
    {['1', '5', '9', '13', '17'].map((n) => (
      <span key={n}>{n}</span>
    ))}
  </div>
);

const Lane = ({ stem, seed, density, dim }: { stem: Stem | 'mix'; seed: number; density?: number; dim?: boolean }) => (
  <div className="flex h-9 items-center gap-px" aria-hidden>
    {bars(seed, 72, density).map((h, i) => (
      <span
        key={i}
        className={`flex-1 rounded-[1px] ${stem === 'mix' ? 'bg-foreground' : STEM_BG[stem]} ${dim ? 'opacity-30' : ''}`}
        style={{ height: `${h * 100}%` }}
      />
    ))}
  </div>
);

export function HeroLanes() {
  const stems: [Stem, number, number][] = [
    ['vocal', 3, 0.9],
    ['bass', 7, 1],
    ['drums', 11, 1.15],
    ['other', 17, 0.85],
  ];
  return (
    <figure className="rounded border border-border bg-card p-4 md:p-6">
      <Ruler />
      <div className="mt-3 grid grid-cols-[4.5rem_1fr] items-center gap-x-3">
        <span className="font-mono-zion text-[10px] font-semibold tracking-wider">MIX</span>
        <Lane stem="mix" seed={5} density={1.1} />
      </div>

      <div className="font-mono-zion my-3 flex items-center gap-3 text-[10px] tracking-widest text-muted-foreground" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        ▼ SEPARATE
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="space-y-1">
        {stems.map(([stem, seed, density]) => (
          <div key={stem} className="grid grid-cols-[4.5rem_1fr] items-center gap-x-3">
            <span className="font-mono-zion flex items-center gap-1.5 text-[10px] font-semibold tracking-wider">
              <i className={`block h-2 w-2 rounded-full ${STEM_BG[stem]}`} />
              {STEM_LABEL[stem]}
            </span>
            <Lane stem={stem} seed={seed} density={density} />
          </div>
        ))}
      </div>
      <figcaption className="mt-4 text-[11px] text-muted-foreground">
        ※ 仕組みを示すイメージ図です。実際のアプリ画面ではありません。
      </figcaption>
    </figure>
  );
}

type Block = { left: number; width: number; stem: Stem; ghost?: boolean };

const STEPS: { no: string; title: string; en: string; desc: string; blocks: Block[] }[] = [
  {
    no: '01',
    title: '分離',
    en: 'SEPARATE',
    desc: '混ざった音源を、ボーカル・ベース・ドラムなどのステムに分けます。',
    blocks: [
      { left: 0, width: 100, stem: 'vocal' },
      { left: 0, width: 100, stem: 'bass' },
      { left: 0, width: 100, stem: 'drums' },
      { left: 0, width: 100, stem: 'other' },
    ],
  },
  {
    no: '02',
    title: '編集',
    en: 'EDIT',
    desc: '分けたトラックを切って、並べ替えて、整えます。',
    blocks: [
      { left: 0, width: 38, stem: 'vocal' },
      { left: 46, width: 54, stem: 'vocal' },
      { left: 0, width: 100, stem: 'bass' },
      { left: 8, width: 36, stem: 'drums' },
      { left: 52, width: 40, stem: 'drums' },
    ],
  },
  {
    no: '03',
    title: '差し替え',
    en: 'REPLACE',
    desc: 'パートを別の音に差し替えて、聴き比べます。',
    blocks: [
      { left: 0, width: 100, stem: 'vocal' },
      { left: 0, width: 100, stem: 'bass' },
      { left: 0, width: 100, stem: 'drums', ghost: true },
      { left: 0, width: 100, stem: 'other' },
    ],
  },
  {
    no: '04',
    title: '再ミックス',
    en: 'REMIX',
    desc: 'もう一度まとめて、仕上がりを聴きます。',
    blocks: [
      { left: 0, width: 100, stem: 'vocal' },
      { left: 0, width: 100, stem: 'bass' },
      { left: 0, width: 100, stem: 'drums' },
      { left: 0, width: 100, stem: 'other' },
    ],
  },
];

const MiniTimeline = ({ blocks, merged }: { blocks: Block[]; merged?: boolean }) => (
  <div className="space-y-1" aria-hidden>
    {blocks.map((b, i) => (
      <div key={i} className="relative h-2 rounded-[1px] bg-border/40">
        <span
          className={`absolute inset-y-0 rounded-[1px] ${STEM_BG[b.stem]} ${b.ghost ? 'opacity-35' : ''} ${merged ? 'opacity-90' : ''}`}
          style={{ left: `${b.left}%`, width: `${b.width}%` }}
        />
      </div>
    ))}
  </div>
);

export function FlowLanes() {
  return (
    <ol className="mt-8 border-t border-border">
      {STEPS.map((s, i) => (
        <li key={s.no} className="grid gap-4 border-b border-border py-6 md:grid-cols-[8rem_1fr_16rem] md:items-center md:gap-8">
          <div className="flex items-baseline gap-3 md:block">
            <span className="font-mono-zion text-3xl font-bold leading-none">{s.no}</span>
            <span className="font-mono-zion block text-[10px] tracking-widest text-muted-foreground">{s.en}</span>
          </div>
          <div>
            <h3 className="text-xl font-bold">{s.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
          </div>
          <MiniTimeline blocks={s.blocks} merged={i === STEPS.length - 1} />
        </li>
      ))}
    </ol>
  );
}
