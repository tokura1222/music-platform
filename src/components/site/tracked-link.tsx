'use client';

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & { event: string; eventParams?: Record<string, string> };

/** External link that reports a GA4 event on click (no-op if gtag is not loaded). */
export function TrackedLink({ event, eventParams, onClick, ...rest }: Props) {
  return (
    <a
      {...rest}
      onClick={(e) => {
        const w = window as unknown as { gtag?: (...a: unknown[]) => void };
        w.gtag?.('event', event, eventParams ?? {});
        onClick?.(e);
      }}
    />
  );
}
