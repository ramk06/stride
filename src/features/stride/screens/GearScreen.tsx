"use client";

import { useMemo, useState } from "react";
import { Badge, IconChip, PrimaryButton, ProgressBar, SectionHeader, SurfaceCard, cx } from "@/components/stride/ui";
import { OfflineNotice } from "@/features/stride/feedback";
import type { GearData, GearSummary } from "@/features/stride/types";

type GearCategory = "all" | "running-shoes" | "watch" | "accessory" | "other";

export function GearScreen({
  data,
  offline,
  onAddGear,
}: {
  data: GearData;
  offline?: { title: string; description: string };
  onAddGear: () => void;
}) {
  const [gearCategory, setGearCategory] = useState<GearCategory>("all");

  const filteredGear = useMemo(() => {
    return data.gear.filter((item) => (gearCategory === "all" ? true : item.type === gearCategory));
  }, [data.gear, gearCategory]);

  return (
    <div className="space-y-4">
      {offline ? <OfflineNotice title={offline.title} description={offline.description} /> : null}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {data.metrics.map((metric) => (
          <SurfaceCard key={metric.label} className="rounded-[24px] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
                  {metric.label}
                </p>
                <p className="mt-2 font-mono text-[28px] font-semibold tracking-[-0.05em] text-text">
                  {metric.value}
                </p>
                <p className="mt-2 text-sm text-muted">{metric.detail}</p>
              </div>
              <IconChip icon={metric.icon} tone={metric.tone ?? "primary"} />
            </div>
          </SurfaceCard>
        ))}
      </div>
      <SurfaceCard>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SectionHeader eyebrow="Categories" title="Gear locker" />
          <PrimaryButton type="button" className="min-h-10 px-4 py-2 text-sm" onClick={onAddGear}>
            Add gear
          </PrimaryButton>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { id: "all", label: "All" },
            { id: "running-shoes", label: "Running shoes" },
            { id: "watch", label: "Watches" },
            { id: "accessory", label: "Accessories" },
            { id: "other", label: "Other" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setGearCategory(item.id as GearCategory)}
              className={cx(
                "rounded-full px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em]",
                gearCategory === item.id ? "bg-text text-surface" : "bg-surface-muted text-muted",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </SurfaceCard>
      <div className="grid gap-4 xl:grid-cols-2">
        {filteredGear.map((item) => (
          <GearItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function GearItemCard({ item }: { item: GearSummary }) {
  const percent = item.targetMileageKm > 0 ? (item.mileageKm / item.targetMileageKm) * 100 : 0;
  const tone = item.statusLabel.includes("Approaching") ? "warning" : "accent";

  return (
    <SurfaceCard>
      <div className="flex items-start gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-surface-muted font-display text-lg font-bold text-primary">
          {item.brand.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-display text-[20px] font-semibold tracking-[-0.03em] text-text">
                {item.name}
              </p>
              <p className="text-sm text-muted">{item.categoryLabel}</p>
            </div>
            <Badge tone={tone === "warning" ? "warning" : "accent"}>{item.statusLabel}</Badge>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm text-muted">
              <span>
                {item.mileageKm} / {item.targetMileageKm || 0} km
              </span>
              <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-text">
                {item.targetMileageKm > 0 ? `${Math.round(percent)}% used` : "Tracked"}
              </span>
            </div>
            {item.targetMileageKm > 0 ? <ProgressBar value={percent} /> : null}
            <p className="text-sm leading-6 text-muted">{item.notes}</p>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}