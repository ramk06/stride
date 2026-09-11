"use client";

import { useMemo, useState, useTransition } from "react";
import { FormField, PrimaryButton, SecondaryButton, SurfaceCard, TextInput } from "@/components/stride/ui";
import { registerSession, signInSession } from "@/features/stride/hooks";

type Mode = "login" | "register";

export function AccessScreen({
  pending,
  onAuthenticated,
}: {
  pending?: boolean;
  onAuthenticated: () => Promise<void>;
}) {
  const [mode, setMode] = useState<Mode>("register");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [isSubmitting, startTransition] = useTransition();

  const heroTitle = useMemo(
    () => (mode === "register" ? "Build your training system" : "Return to your training system"),
    [mode],
  );

  function validate() {
    const nextErrors: Record<string, string> = {};

    if (mode === "register" && !form.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    }

    if (form.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters long.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) {
      setMessage({ kind: "error", text: "Complete the required fields before continuing." });
      return;
    }

    setMessage(null);
    startTransition(async () => {
      try {
        if (mode === "register") {
          await registerSession(form);
        } else {
          await signInSession({ email: form.email, password: form.password });
        }

        setMessage({ kind: "success", text: "Account ready. Loading your workspace..." });
        await onAuthenticated();
      } catch (error) {
        setMessage({
          kind: "error",
          text: error instanceof Error ? error.message : "Authentication failed.",
        });
      }
    });
  }

  const busy = isSubmitting || Boolean(pending);

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,480px)] lg:items-stretch">
        <section className="relative overflow-hidden rounded-[32px] border border-white/60 bg-[radial-gradient(circle_at_top_left,rgba(13,113,169,0.16),transparent_45%),linear-gradient(160deg,rgba(255,255,255,0.82),rgba(240,245,249,0.92))] p-6 shadow-[0_22px_70px_rgba(13,27,47,0.08)] sm:p-8 lg:p-10">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/70 px-4 py-2 shadow-sm backdrop-blur">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary font-display text-lg font-bold text-white">
                S
              </div>
              <div>
                <p className="font-display text-lg font-semibold tracking-[-0.04em] text-text">STRIDE</p>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Running system</p>
              </div>
            </div>
            <div className="space-y-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">Production-ready V1</p>
              <h1 className="max-w-xl font-display text-[40px] font-semibold tracking-[-0.06em] text-text sm:text-[56px]">
                {heroTitle}
              </h1>
              <p className="max-w-xl text-base leading-7 text-muted sm:text-lg">
                Track real activities, manage gear mileage, and keep goal progress visible from one responsive workspace built for mobile-first daily use.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <FeatureCard title="Live dashboard" description="Weekly distance, current goal, and gear health update from saved data." />
              <FeatureCard title="Manual logging" description="Create activities directly in the app without a fake backend handoff." />
              <FeatureCard title="Persistent gear" description="Mileage and activity assignment stay available between sessions." />
            </div>
          </div>
        </section>
        <SurfaceCard className="rounded-[32px] p-5 sm:p-6 lg:p-8">
          <div className="space-y-5">
            <div className="flex rounded-full bg-surface-muted p-1">
              {(["register", "login"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={
                    mode === item
                      ? "flex-1 rounded-full bg-surface px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-primary shadow-sm"
                      : "flex-1 rounded-full px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted"
                  }
                >
                  {item === "register" ? "Create account" : "Sign in"}
                </button>
              ))}
            </div>
            <div>
              <h2 className="font-display text-[28px] font-semibold tracking-[-0.05em] text-text">
                {mode === "register" ? "Create your account" : "Sign in"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                {mode === "register"
                  ? "New accounts start with seeded training data so you can verify the full flow immediately."
                  : "Use the account you already created on this device."}
              </p>
            </div>
            <div className="space-y-3">
              {mode === "register" ? (
                <FormField label="Full name" error={errors.fullName}>
                  <TextInput
                    value={form.fullName}
                    onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                    placeholder="Alex Rivera"
                  />
                </FormField>
              ) : null}
              <FormField label="Email" error={errors.email}>
                <TextInput
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  placeholder="alex@stride.app"
                />
              </FormField>
              <FormField label="Password" error={errors.password}>
                <TextInput
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="At least 8 characters"
                />
              </FormField>
            </div>
            {message ? (
              <div
                className={
                  message.kind === "error"
                    ? "rounded-[24px] border border-error/20 bg-error-soft/40 px-4 py-3 text-sm text-muted"
                    : "rounded-[24px] border border-success/20 bg-success-soft/50 px-4 py-3 text-sm text-muted"
                }
              >
                {message.text}
              </div>
            ) : null}
            <PrimaryButton type="button" onClick={handleSubmit} disabled={busy} className="w-full">
              {busy ? "Working..." : mode === "register" ? "Create account" : "Sign in"}
            </PrimaryButton>
            <SecondaryButton
              type="button"
              className="w-full"
              onClick={() =>
                setForm({
                  fullName: "Alex Rivera",
                  email: "alex@stride.app",
                  password: "stridepass",
                })
              }
            >
              Fill example data
            </SecondaryButton>
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[24px] border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur">
      <p className="font-display text-lg font-semibold tracking-[-0.03em] text-text">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
    </div>
  );
}