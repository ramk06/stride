import { SurfaceCard } from "@/components/stride/ui";

export function OfflineNotice({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <SurfaceCard className="rounded-[22px] border-accent/15 bg-accent-soft/40 p-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent">
        {title}
      </p>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </SurfaceCard>
  );
}