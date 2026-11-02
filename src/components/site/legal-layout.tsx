import { SiteShell, SiteHeader, SiteFooter } from '@/components/site/site-chrome';

export function LegalLayout({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <SiteShell>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="font-mono-zion mt-2 text-xs text-muted-foreground">最終更新: {updated}</p>
        <div className="mt-10 space-y-8 text-sm leading-relaxed">{children}</div>
      </main>
      <SiteFooter />
    </SiteShell>
  );
}

export function Clause({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold">{title}</h2>
      <div className="space-y-2 text-muted-foreground">{children}</div>
    </section>
  );
}
