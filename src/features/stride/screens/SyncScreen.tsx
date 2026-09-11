"use client";

import { Badge, EmptyState, ErrorState, SectionHeader, SkeletonCard, SurfaceCard } from "@/components/stride/ui";
import { useStravaConnection } from "@/features/stride/hooks";

export function SyncScreen({ refreshKey }: { refreshKey: number }) {
  const resource = useStravaConnection(refreshKey);

  if (resource.status === "loading") {
    return <SkeletonCard lines={3} />;
  }

  if (resource.status === "empty") {
    return <EmptyState title={resource.title} description={resource.description} />;
  }

  if (resource.status === "error") {
    return <ErrorState title={resource.title} description={resource.description} />;
  }

  const strava = resource.data;

  return (
    <div className="space-y-4">
      <SurfaceCard>
        <SectionHeader eyebrow="Connected services" title="Manual tracking active" />
        <div className="mt-4 rounded-[24px] bg-surface-muted p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-[22px] font-semibold tracking-[-0.03em] text-text">
                STRIDE data source
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">{strava.summary}</p>
            </div>
            <Badge tone="accent">Active</Badge>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <DetailBlock label="Last sync" value={strava.lastSynced} />
            <DetailBlock label="Import window" value={strava.importWindow} />
            <DetailBlock label="Coverage" value={strava.coverage} />
          </div>
          <p className="mt-5 text-sm leading-6 text-muted">
            External service sync is deferred until the backend contract and policy review are approved. This V1 keeps your saved training data stable without showing dead controls.
          </p>
        </div>
      </SurfaceCard>
    </div>
  );
}

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] bg-surface px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold text-text">{value}</p>
    </div>
  );
}