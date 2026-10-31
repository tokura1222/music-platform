import Link from 'next/link';

export function SiteHeader() {
  return (
    <header className="border-b border-border/60">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-bold tracking-tight">Zion Online</Link>
        <nav className="flex gap-6 text-sm text-muted-foreground">
          <Link href="/music" className="hover:text-foreground">Music</Link>
          <Link href="/apps" className="hover:text-foreground">Apps</Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter({ children }: { children?: React.ReactNode }) {
  return (
    <footer className="mt-16 border-t border-border/60">
      <div className="mx-auto max-w-5xl space-y-2 px-6 py-8 text-xs text-muted-foreground">
        {children}
        <p>&copy; {new Date().getFullYear()} Zion Online</p>
      </div>
    </footer>
  );
}
