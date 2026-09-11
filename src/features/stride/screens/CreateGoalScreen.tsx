"use client";

import { useMemo, useState } from "react";
import {
  FormField,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
  SelectInput,
  SurfaceCard,
  TextInput,
} from "@/components/stride/ui";
import { submitGoalDraft } from "@/features/stride/hooks";
import { defaultGoalForm, goalTypeOptions } from "@/features/stride/sample-data";
import type { FormResult, GoalFormInput } from "@/features/stride/types";

export function CreateGoalScreen({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [goalForm, setGoalForm] = useState<GoalFormInput>(defaultGoalForm);
  const [goalErrors, setGoalErrors] = useState<Record<string, string>>({});
  const [submissionState, setSubmissionState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [submissionCopy, setSubmissionCopy] = useState<FormResult>({
    status: "success",
    title: "",
    description: "",
  });

  const showDistance = useMemo(
    () =>
      [
        "5K",
        "10K",
        "Half Marathon",
        "Marathon",
        "Weekly Distance",
        "Monthly Distance",
        "Custom Goal",
      ].includes(goalForm.type),
    [goalForm.type],
  );

  const showPace = useMemo(
    () =>
      goalForm.type === "Target Pace" ||
      ["5K", "10K", "Half Marathon", "Marathon"].includes(goalForm.type),
    [goalForm.type],
  );

  const showTime = useMemo(
    () => ["5K", "10K", "Half Marathon", "Marathon"].includes(goalForm.type),
    [goalForm.type],
  );

  function validateGoalForm() {
    const nextErrors: Record<string, string> = {};

    if (!goalForm.title.trim()) nextErrors.title = "Goal title is required.";
    if (!goalForm.targetDate) nextErrors.targetDate = "Target date is required.";
    if (showDistance && !goalForm.targetDistanceKm.trim()) {
      nextErrors.targetDistanceKm = "Target distance is required for this goal type.";
    }
    if (goalForm.type === "Target Pace" && !goalForm.targetPace.trim()) {
      nextErrors.targetPace = "Target pace is required.";
    }

    setGoalErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validateGoalForm()) {
      setSubmissionState("error");
      setSubmissionCopy({
        status: "error",
        title: "Fix form issues",
        description: "Stride keeps goal validation in the UI boundary before API submission.",
      });
      return;
    }

    setSubmissionState("submitting");
    const result = await submitGoalDraft(goalForm);
    setSubmissionState(result.status === "success" ? "success" : "error");
    setSubmissionCopy(result);

    if (result.status === "success") {
      onSaved();
      onClose();
    }
  }

  return (
    <div className="space-y-4">
      <SurfaceCard>
        <SectionHeader eyebrow="Create goal" title="Target configuration" />
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <FormField label="Goal type">
            <SelectInput
              value={goalForm.type}
              onChange={(event) =>
                setGoalForm((current) => ({
                  ...current,
                  type: event.target.value as GoalFormInput["type"],
                }))
              }
            >
              {goalTypeOptions.map((goalType) => (
                <option key={goalType} value={goalType}>
                  {goalType}
                </option>
              ))}
            </SelectInput>
          </FormField>
          <FormField label="Title" error={goalErrors.title}>
            <TextInput
              value={goalForm.title}
              onChange={(event) =>
                setGoalForm((current) => ({ ...current, title: event.target.value }))
              }
              placeholder="10K race target"
            />
          </FormField>
          {showDistance ? (
            <FormField label="Target" error={goalErrors.targetDistanceKm}>
              <TextInput
                value={goalForm.targetDistanceKm}
                onChange={(event) =>
                  setGoalForm((current) => ({
                    ...current,
                    targetDistanceKm: event.target.value,
                  }))
                }
                placeholder="10"
              />
            </FormField>
          ) : null}
          <FormField label="Target date" error={goalErrors.targetDate}>
            <TextInput
              type="date"
              value={goalForm.targetDate}
              onChange={(event) =>
                setGoalForm((current) => ({ ...current, targetDate: event.target.value }))
              }
            />
          </FormField>
          {showPace ? (
            <FormField label="Target pace" error={goalErrors.targetPace}>
              <TextInput
                value={goalForm.targetPace}
                onChange={(event) =>
                  setGoalForm((current) => ({ ...current, targetPace: event.target.value }))
                }
                placeholder="5:00/km"
              />
            </FormField>
          ) : null}
          {showTime ? (
            <FormField label="Target time">
              <TextInput
                value={goalForm.targetTime}
                onChange={(event) =>
                  setGoalForm((current) => ({ ...current, targetTime: event.target.value }))
                }
                placeholder="50:00"
              />
            </FormField>
          ) : null}
          <FormField label="Planning cadence">
            <TextInput
              value={goalForm.frequency}
              onChange={(event) =>
                setGoalForm((current) => ({ ...current, frequency: event.target.value }))
              }
              placeholder="Weekly check-ins"
            />
          </FormField>
        </div>
        <div className="mt-4 flex gap-3">
          <SecondaryButton type="button" className="flex-1" onClick={onClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="button" className="flex-1" onClick={handleSubmit}>
            {submissionState === "submitting" ? "Saving..." : "Save goal"}
          </PrimaryButton>
        </div>
      </SurfaceCard>
      {submissionState !== "idle" ? (
        <SurfaceCard
          className={
            submissionState === "success"
              ? "border-success/20 bg-success-soft/50"
              : "border-error/20 bg-error-soft/40"
          }
        >
          <p className="font-display text-lg font-semibold text-text">{submissionCopy.title}</p>
          <p className="mt-2 text-sm leading-6 text-muted">{submissionCopy.description}</p>
        </SurfaceCard>
      ) : null}
    </div>
  );
}