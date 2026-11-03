'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Interactive stem demo.
 * Expects equal-length, aligned files at /apps/daw/demo/{id}.mp3
 * (vocal / bass / drums / other). Missing files => "preparing" state, no errors.
 */
const BASE = '/apps/daw/demo';
const BARS = 160;

const STEMS = [
  { id: 'vocal', label: 'ボーカル', bar: 'bg-stem-vocal', dot: 'bg-stem-vocal' },
  { id: 'bass', label: 'ベース', bar: 'bg-stem-bass', dot: 'bg-stem-bass' },
  { id: 'drums', label: 'ドラム', bar: 'bg-stem-drums', dot: 'bg-stem-drums' },
  { id: 'other', label: 'その他', bar: 'bg-stem-other', dot: 'bg-stem-other' },
] as const;
type StemId = (typeof STEMS)[number]['id'];
type Status = 'loading' | 'ready' | 'missing';

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

const computePeaks = (buf: AudioBuffer): number[] => {
  const data = buf.getChannelData(0);
  const block = Math.max(1, Math.floor(data.length / BARS));
  const peaks: number[] = [];
  for (let i = 0; i < BARS; i++) {
    let max = 0;
    for (let j = i * block; j < Math.min(data.length, (i + 1) * block); j += 16) max = Math.max(max, Math.abs(data[j]));
    peaks.push(max);
  }
  const top = Math.max(...peaks, 0.001);
  return peaks.map((p) => p / top);
};

export function StemDemo() {
  const [status, setStatus] = useState<Status>('loading');
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState<Set<StemId>>(new Set());
  const [solo, setSolo] = useState<Set<StemId>>(new Set());
  const [peaks, setPeaks] = useState<Partial<Record<StemId, number[]>>>({});
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const ctxRef = useRef<AudioContext | null>(null);
  const buffersRef = useRef<Partial<Record<StemId, AudioBuffer>>>({});
  const gainsRef = useRef<Partial<Record<StemId, GainNode>>>({});
  const sourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const startedAtRef = useRef(0);
  const offsetRef = useRef(0);
  const rafRef = useRef(0);
  const playheadRef = useRef<HTMLDivElement>(null);
  const durationRef = useRef(0);

  const gainFor = useCallback(
    (id: StemId) => (solo.size > 0 ? (solo.has(id) ? 1 : 0) : muted.has(id) ? 0 : 1),
    [muted, solo],
  );

  // load & decode
  useEffect(() => {
    let cancelled = false;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    ctxRef.current = ctx;
    (async () => {
      try {
        const decoded = await Promise.all(
          STEMS.map(async ({ id }) => {
            const res = await fetch(`${BASE}/${id}.mp3`);
            if (!res.ok) throw new Error(`missing ${id}`);
            return [id, await ctx.decodeAudioData(await res.arrayBuffer())] as const;
          }),
        );
        if (cancelled) return;
        const nextPeaks: Partial<Record<StemId, number[]>> = {};
        for (const [id, buf] of decoded) {
          buffersRef.current[id] = buf;
          nextPeaks[id] = computePeaks(buf);
          const g = ctx.createGain();
          g.connect(ctx.destination);
          gainsRef.current[id] = g;
        }
        durationRef.current = Math.min(...decoded.map(([, b]) => b.duration));
        setDuration(durationRef.current);
        setPeaks(nextPeaks);
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('missing');
      }
    })();
    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      sourcesRef.current.forEach((s) => { try { s.stop(); } catch { /* already stopped */ } });
      void ctx.close();
    };
  }, []);

  // apply mute/solo
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    for (const { id } of STEMS) gainsRef.current[id]?.gain.setTargetAtTime(gainFor(id), ctx.currentTime, 0.015);
  }, [gainFor, status]);

  const position = () => {
    const ctx = ctxRef.current;
    const d = durationRef.current;
    if (!ctx || !d) return 0;
    return playing ? (ctx.currentTime - startedAtRef.current) % d : offsetRef.current;
  };

  const stopSources = () => {
    sourcesRef.current.forEach((s) => { try { s.stop(); } catch { /* already stopped */ } });
    sourcesRef.current = [];
  };

  const startSources = (offset: number) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    stopSources();
    const when = ctx.currentTime + 0.05; // same start time for every stem => sample-aligned
    sourcesRef.current = STEMS.flatMap(({ id }) => {
      const buffer = buffersRef.current[id];
      const gain = gainsRef.current[id];
      if (!buffer || !gain) return [];
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      src.loopEnd = durationRef.current;
      src.connect(gain);
      src.start(when, offset);
      return [src];
    });
    startedAtRef.current = when - offset;
  };

  // playhead / clock loop, only while playing
  useEffect(() => {
    if (!playing) return;
    const loop = () => {
      const ctx = ctxRef.current;
      const d = durationRef.current;
      if (ctx && d) {
        const pos = Math.max(0, (ctx.currentTime - startedAtRef.current) % d);
        if (playheadRef.current) playheadRef.current.style.left = `${(pos / d) * 100}%`;
        setTime(pos);
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing]);

  const toggle = async () => {
    const ctx = ctxRef.current;
    if (!ctx || status !== 'ready') return;
    if (playing) {
      offsetRef.current = position();
      stopSources();
      setPlaying(false);
    } else {
      await ctx.resume();
      startSources(offsetRef.current);
      setPlaying(true);
    }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (status !== 'ready') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    offsetRef.current = frac * durationRef.current;
    setTime(offsetRef.current);
    if (playheadRef.current) playheadRef.current.style.left = `${frac * 100}%`;
    if (playing) startSources(offsetRef.current);
  };

  const flip = (set: Set<StemId>, id: StemId) => {
    const next = new Set(set);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  };

  const disabled = status !== 'ready';

  return (
    <div className="rounded border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={toggle}
            disabled={disabled}
            className="rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {playing ? '一時停止' : '再生'}
          </button>
          <span className="font-mono-zion text-xs text-muted-foreground">
            {fmt(time)} / {fmt(duration)}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {status === 'loading' && '読み込み中…'}
          {status === 'missing' && 'デモ音源は準備中です'}
          {status === 'ready' && '波形をクリックでシーク'}
        </span>
      </div>

      <div className="relative">
        <div className="divide-y divide-border">
          {STEMS.map(({ id, label, bar, dot }) => {
            const audible = gainFor(id) > 0;
            const p = peaks[id];
            return (
              <div key={id} className="grid grid-cols-[6.5rem_1fr]">
                <div className="flex flex-col justify-center gap-2 border-r border-border px-3 py-2">
                  <span className="flex items-center gap-2 whitespace-nowrap text-sm font-semibold">
                    <i className={`block h-2.5 w-2.5 rounded-full ${dot}`} />
                    {label}
                  </span>
                  <span className="flex gap-1">
                    <button
                      type="button"
                      disabled={disabled}
                      aria-pressed={muted.has(id)}
                      aria-label={`${label}をミュート`}
                      onClick={() => setMuted((s) => flip(s, id))}
                      className={`font-mono-zion h-6 w-6 rounded border text-xs disabled:opacity-40 ${muted.has(id) ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}
                    >
                      M
                    </button>
                    <button
                      type="button"
                      disabled={disabled}
                      aria-pressed={solo.has(id)}
                      aria-label={`${label}をソロ`}
                      onClick={() => setSolo((s) => flip(s, id))}
                      className={`font-mono-zion h-6 w-6 rounded border text-xs disabled:opacity-40 ${solo.has(id) ? 'border-primary bg-primary text-primary-foreground' : 'border-border'}`}
                    >
                      S
                    </button>
                  </span>
                </div>
                <div
                  onClick={seek}
                  className={`flex h-16 cursor-pointer items-center gap-px px-2 transition-opacity ${audible ? 'opacity-100' : 'opacity-25'} ${disabled ? 'cursor-default' : ''}`}
                >
                  {(p ?? Array.from({ length: BARS }, () => 0.08)).map((v, i) => (
                    <span key={i} className={`flex-1 rounded-sm ${p ? bar : 'bg-border'}`} style={{ height: `${Math.max(6, v * 100)}%` }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {/* playhead */}
        <div className="pointer-events-none absolute inset-y-0 left-[6.5rem] right-0 px-2">
          <div className="relative h-full">
            <div ref={playheadRef} className="absolute inset-y-0 w-px bg-foreground" style={{ left: '0%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
