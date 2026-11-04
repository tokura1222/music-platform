/** Illustrative hero figure for Zion 切り抜き: long source -> picked highlights -> vertical clips. Not a screenshot. */

const HIGHLIGHTS: { left: number; width: number; bg: string }[] = [
  { left: 12, width: 9, bg: 'bg-stem-vocal' },
  { left: 44, width: 6, bg: 'bg-stem-bass' },
  { left: 71, width: 11, bg: 'bg-stem-drums' },
];

const CLIPS = ['bg-stem-vocal', 'bg-stem-bass', 'bg-stem-drums'];

export function ClipsHero() {
  return (
    <figure className="rounded border border-border bg-card p-4 md:p-6">
      <div className="font-mono-zion flex justify-between border-b border-border pb-1 text-[10px] text-muted-foreground" aria-hidden>
        <span>0:00</span>
        <span>15:00</span>
        <span>30:00</span>
        <span>45:00</span>
        <span>60:00</span>
      </div>

      <div className="mt-3 grid grid-cols-[4.5rem_1fr] items-center gap-x-3" aria-hidden>
        <span className="font-mono-zion text-[10px] font-semibold tracking-wider">SOURCE</span>
        <div className="relative h-9 rounded-[2px] bg-foreground/80">
          {HIGHLIGHTS.map((h) => (
            <span key={h.left} className={`absolute inset-y-0 ${h.bg}`} style={{ left: `${h.left}%`, width: `${h.width}%` }} />
          ))}
        </div>
      </div>

      <div className="font-mono-zion my-4 flex items-center gap-3 text-[10px] tracking-widest text-muted-foreground" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        ▼ PICK &amp; CUT
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="flex justify-center gap-4" aria-hidden>
        {CLIPS.map((bg, i) => (
          <div key={bg} className="w-[5.5rem]">
            <div className={`relative aspect-[9/16] rounded-[2px] ${bg}`}>
              <span className="absolute inset-x-2 bottom-5 h-1.5 rounded-full bg-background/90" />
              <span className="absolute inset-x-4 bottom-2.5 h-1.5 rounded-full bg-background/70" />
            </div>
            <p className="font-mono-zion mt-1.5 text-center text-[10px] text-muted-foreground">CLIP {i + 1}</p>
          </div>
        ))}
      </div>
      <figcaption className="mt-4 text-[11px] text-muted-foreground">
        ※ 仕組みを示すイメージ図です。実際の出力ではありません。
      </figcaption>
    </figure>
  );
}
