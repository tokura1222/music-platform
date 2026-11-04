export function FaqList({ items }: { items: readonly (readonly [string, string])[] }) {
  return (
    <div className="mt-6 border-t border-border">
      {items.map(([q, a]) => (
        <details key={q} className="group border-b border-border py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
            {q}
            <span aria-hidden className="font-mono-zion text-muted-foreground transition group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 text-sm text-muted-foreground">{a}</p>
        </details>
      ))}
    </div>
  );
}
