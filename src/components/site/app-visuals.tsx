import { Lane } from '@/components/daw/daw-sections';

/** Illustrative CSS visuals for app cards. Not screenshots. */

export function StemsVisual() {
  return (
    <div className="space-y-1" aria-hidden>
      <Lane stem="mix" seed={5} density={1.1} dim />
      <Lane stem="vocal" seed={3} density={0.9} />
      <Lane stem="bass" seed={7} />
      <Lane stem="drums" seed={11} density={1.15} />
      <Lane stem="other" seed={17} density={0.85} />
    </div>
  );
}

/** one long horizontal clip -> several short vertical clips */
export function ClipsVisual() {
  return (
    <div className="flex items-center gap-4" aria-hidden>
      <div className="h-14 flex-1 rounded-[2px] bg-foreground/80" />
      <span className="font-mono-zion text-xs text-muted-foreground">▶</span>
      <div className="flex gap-1.5">
        {['bg-stem-vocal', 'bg-stem-bass', 'bg-stem-drums'].map((c) => (
          <div key={c} className={`relative h-16 w-9 rounded-[2px] ${c}`}>
            <span className="absolute inset-x-1.5 bottom-2 h-1 rounded-full bg-background/80" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MusicVisual() {
  return (
    <div className="flex h-16 items-end gap-1" aria-hidden>
      {[40, 70, 55, 90, 35, 80, 60, 100, 45, 75, 50, 85].map((h, i) => (
        <span
          key={i}
          className={['bg-stem-vocal', 'bg-stem-bass', 'bg-stem-drums', 'bg-stem-other'][i % 4]}
          style={{ height: `${h}%`, width: '0.5rem' }}
        />
      ))}
    </div>
  );
}
