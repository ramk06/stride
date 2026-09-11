import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import type { PreviewMode, TabId } from "@/features/stride/types";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function SurfaceCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cx(
        "rounded-[24px] border border-border bg-surface p-4 shadow-[0_14px_38px_rgba(13,27,47,0.06)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        {eyebrow ? (
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-display text-[22px] font-semibold tracking-[-0.03em] text-text">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "primary" | "accent" | "warning" | "success" | "error";
}) {
  const toneClasses = {
    default: "bg-surface-muted text-muted",
    primary: "bg-primary-soft text-primary",
    accent: "bg-accent-soft text-accent",
    warning: "bg-warning-soft text-warning",
    success: "bg-success-soft text-success",
    error: "bg-error-soft text-error",
  };

  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.12em]",
        toneClasses[tone],
      )}
    >
      {children}
    </span>
  );
}

export function IconChip({
  icon,
  tone = "primary",
}: {
  icon: string;
  tone?: "primary" | "accent" | "warning" | "success";
}) {
  const toneClasses = {
    primary: "bg-primary-soft text-primary",
    accent: "bg-accent-soft text-accent",
    warning: "bg-warning-soft text-warning",
    success: "bg-success-soft text-success",
  };

  return (
    <div
      className={cx(
        "flex h-10 w-10 items-center justify-center rounded-2xl",
        toneClasses[tone],
      )}
    >
      <span className="material-symbols-outlined text-[20px]">{icon}</span>
    </div>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 rounded-full bg-surface-muted">
      <div
        className="h-full rounded-full bg-gradient-to-r from-accent to-primary"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <SurfaceCard className="border-dashed bg-surface/90 text-center">
      <div className="flex flex-col items-center gap-3 py-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-muted">
          <span className="material-symbols-outlined">inbox</span>
        </div>
        <div className="space-y-1">
          <h3 className="font-display text-lg font-semibold text-text">{title}</h3>
          <p className="text-sm leading-6 text-muted">{description}</p>
        </div>
      </div>
    </SurfaceCard>
  );
}

export function ErrorState({ title, description }: { title: string; description: string }) {
  return (
    <SurfaceCard className="border-error/20 bg-error-soft/50">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-error-soft text-error">
          <span className="material-symbols-outlined">error</span>
        </div>
        <div className="space-y-1">
          <h3 className="font-display text-lg font-semibold text-text">{title}</h3>
          <p className="text-sm leading-6 text-muted">{description}</p>
        </div>
      </div>
    </SurfaceCard>
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <SurfaceCard>
      <div className="space-y-3 animate-pulse">
        <div className="h-4 w-24 rounded-full bg-surface-muted" />
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="h-12 rounded-2xl bg-surface-muted" />
        ))}
      </div>
    </SurfaceCard>
  );
}

export function PreviewModePicker({
  value,
  onChange,
}: {
  value: PreviewMode;
  onChange: (mode: PreviewMode) => void;
}) {
  const items: PreviewMode[] = ["success", "loading", "empty", "error", "offline"];

  return (
    <SurfaceCard className="rounded-[22px] p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
            Preview state
          </p>
          <p className="text-sm text-muted">
            Switch UI states without fabricating a backend implementation.
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={cx(
              "rounded-full px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition",
              item === value
                ? "bg-text text-surface"
                : "bg-surface-muted text-muted",
            )}
          >
            {item}
          </button>
        ))}
      </div>
    </SurfaceCard>
  );
}

export function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
        {label}
      </span>
      {children}
      {error ? <span className="text-xs text-error">{error}</span> : null}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cx(
        "w-full rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm text-text outline-none transition focus:border-accent focus:bg-surface",
        props.className,
      )}
    />
  );
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cx(
        "w-full rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm text-text outline-none transition focus:border-accent focus:bg-surface",
        props.className,
      )}
    />
  );
}

export function TextAreaInput(
  props: TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={cx(
        "min-h-24 w-full rounded-2xl border border-border bg-surface-muted px-4 py-3 text-sm text-text outline-none transition focus:border-accent focus:bg-surface",
        props.className,
      )}
    />
  );
}

export function PrimaryButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cx(
        "inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-5 py-3 font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cx(
        "inline-flex min-h-12 items-center justify-center rounded-full bg-surface-muted px-5 py-3 font-semibold text-text transition disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function BottomNav({
  activeTab,
  onChange,
}: {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}) {
  const items: Array<{ id: TabId; label: string; icon: string }> = [
    { id: "dashboard", label: "Home", icon: "home" },
    { id: "activities", label: "Activities", icon: "ecg_heart" },
    { id: "gear", label: "Gear", icon: "steps" },
    { id: "goals", label: "Goals", icon: "flag" },
    { id: "profile", label: "Profile", icon: "person" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 px-4 pb-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl rounded-[30px] border border-white/70 bg-surface/94 p-2 shadow-[0_18px_44px_rgba(13,27,47,0.12)] backdrop-blur">
        <div className="grid grid-cols-5 gap-1 rounded-[24px] bg-background/90 p-1.5">
        {items.map((item) => {
          const active = item.id === activeTab;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={cx(
                "flex min-h-14 flex-col items-center justify-center rounded-[20px] px-1 text-[11px] font-medium transition",
                active ? "bg-surface text-primary" : "text-muted",
              )}
            >
              <span className="material-symbols-outlined text-[21px]">{item.icon}</span>
              <span className="mt-1">{item.label}</span>
            </button>
          );
        })}
        </div>
      </div>
    </nav>
  );
}