import Link from 'next/link';

/** Wraps site pages (hub / apps / legal) in the Zion theme. Not used by the /music shell. */
export function SiteShell({ children }: { children: React.ReactNode }) {
  return <div className="zion-theme min-h-screen">{children}</div>;
}

export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 text-lg font-bold tracking-tight">
          <span aria-hidden className="flex gap-0.5">
            <i className="block h-4 w-1 bg-stem-vocal" />
            <i className="block h-4 w-1 bg-stem-bass" />
            <i className="block h-4 w-1 bg-stem-drums" />
            <i className="block h-4 w-1 bg-stem-other" />
          </span>
          Zion Online
        </Link>
        <nav className="flex gap-6 text-sm text-muted-foreground">
          <Link href="/music" className="hover:text-foreground">Music</Link>
          <Link href="/apps" className="hover:text-foreground">Apps</Link>
        </nav>
      </div>
    </header>
  );
}

const legalLinks = [
  ['/legal/tokushoho', '特定商取引法に基づく表記'],
  ['/legal/privacy', 'プライバシーポリシー'],
  ['/legal/terms', '利用規約'],
] as const;

export function SiteFooter({ children }: { children?: React.ReactNode }) {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto max-w-5xl space-y-3 px-6 py-8 text-xs text-muted-foreground">
        {children}
        <ul className="flex flex-wrap gap-x-5 gap-y-1">
          {legalLinks.map(([href, label]) => (
            <li key={href}><Link href={href} className="underline-offset-2 hover:text-foreground hover:underline">{label}</Link></li>
          ))}
        </ul>
        <p>&copy; {new Date().getFullYear()} Zion Online</p>
      </div>
    </footer>
  );
}
