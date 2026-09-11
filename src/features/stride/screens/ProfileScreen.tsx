import { Badge, IconChip, SectionHeader, SecondaryButton, SurfaceCard } from "@/components/stride/ui";
import { OfflineNotice } from "@/features/stride/feedback";
import type { ProfileData } from "@/features/stride/types";

export function ProfileScreen({
  data,
  offline,
  onOpenStrava,
  onSignOut,
}: {
  data: ProfileData;
  offline?: { title: string; description: string };
  onOpenStrava: () => void;
  onSignOut: () => Promise<void>;
}) {
  return (
    <div className="space-y-4">
      {offline ? <OfflineNotice title={offline.title} description={offline.description} /> : null}
      <SurfaceCard>
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft font-display text-xl font-bold text-accent">
            {data.initials}
          </div>
          <div>
            <h2 className="font-display text-[24px] font-semibold tracking-[-0.04em] text-text">
              {data.name}
            </h2>
            <p className="text-sm text-muted">{data.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={onOpenStrava}>
                <Badge tone="accent">Connected apps</Badge>
              </button>
              <SecondaryButton type="button" className="min-h-9 px-4 py-2 text-sm" onClick={onSignOut}>
                Sign out
              </SecondaryButton>
            </div>
          </div>
        </div>
      </SurfaceCard>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {data.stats.map((metric) => (
          <SurfaceCard key={metric.label} className="rounded-[22px] p-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              {metric.label}
            </p>
            <p className="mt-2 font-mono text-[20px] font-semibold tracking-[-0.04em] text-text">
              {metric.value}
            </p>
            <p className="mt-2 text-xs leading-5 text-muted">{metric.detail}</p>
          </SurfaceCard>
        ))}
      </div>
      <SurfaceCard>
        <SectionHeader eyebrow="Runner profile" title="Training preferences" />
        <div className="mt-4 space-y-3">
          {data.profileItems.map((item) => (
            <div key={item.label} className="rounded-[22px] bg-surface-muted px-4 py-3">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                {item.label}
              </p>
              <p className="mt-1 text-sm text-text">{item.value}</p>
            </div>
          ))}
        </div>
      </SurfaceCard>
      <SurfaceCard>
        <SectionHeader eyebrow="Settings" title="Account and app" />
        <div className="mt-4 space-y-2">
          {data.settings.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-[22px] bg-surface-muted px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <IconChip icon={item.icon} tone="accent" />
                <div>
                  <p className="text-sm font-semibold text-text">{item.label}</p>
                  <p className="text-sm text-muted">{item.value}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[18px] text-muted">
                chevron_right
              </span>
            </div>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}