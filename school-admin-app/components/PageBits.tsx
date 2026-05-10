import ActionLauncher from "./ActionLauncher";

export function ActionGroup({ items }: { items: { label: string; title: string; description: string; variant?: "modal" | "drawer" | "panel"; confirmLabel?: string }[] }) {
  return (
    <div className="action-row">
      {items.map((item) => (
        <ActionLauncher key={item.label} {...item} />
      ))}
    </div>
  );
}

export function DemoFallbackPill() {
  return <span className="badge amber">Demo fallback</span>;
}
