"use client";

import { useState } from "react";
import {
  FormField,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
  SelectInput,
  SurfaceCard,
  TextAreaInput,
  TextInput,
} from "@/components/stride/ui";
import { submitActivityDraft } from "@/features/stride/hooks";
import type { ActivityFormInput, FormResult } from "@/features/stride/types";

const initialActivityForm: ActivityFormInput = {
  title: "",
  type: "run",
  startedAt: new Date().toISOString().slice(0, 10),
  location: "",
  distanceKm: "",
  durationMinutes: "",
  heartRate: "",
  elevationM: "",
  cadenceSpm: "",
  calories: "",
  notes: "",
};

export function AddActivityScreen({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [activityForm, setActivityForm] = useState(initialActivityForm);
  const [activityErrors, setActivityErrors] = useState<Record<string, string>>({});
  const [submissionState, setSubmissionState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [submissionCopy, setSubmissionCopy] = useState<FormResult>({
    status: "success",
    title: "",
    description: "",
  });

  function validate() {
    const nextErrors: Record<string, string> = {};

    if (!activityForm.title.trim()) nextErrors.title = "Title is required.";
    if (!activityForm.startedAt) nextErrors.startedAt = "Date is required.";
    if (!activityForm.distanceKm.trim()) nextErrors.distanceKm = "Distance is required.";
    if (!activityForm.durationMinutes.trim()) nextErrors.durationMinutes = "Duration is required.";

    setActivityErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) {
      setSubmissionState("error");
      setSubmissionCopy({
        status: "error",
        title: "Fix form issues",
        description: "Complete the required activity fields before saving.",
      });
      return;
    }

    setSubmissionState("submitting");
    const result = await submitActivityDraft(activityForm);
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
        <SectionHeader eyebrow="Log activity" title="Workout details" />
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <FormField label="Title" error={activityErrors.title}>
            <TextInput
              value={activityForm.title}
              onChange={(event) => setActivityForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Morning tempo"
            />
          </FormField>
          <FormField label="Type">
            <SelectInput
              value={activityForm.type}
              onChange={(event) =>
                setActivityForm((current) => ({
                  ...current,
                  type: event.target.value as ActivityFormInput["type"],
                }))
              }
            >
              <option value="run">Run</option>
              <option value="walk">Walk</option>
              <option value="cycling">Cycling</option>
              <option value="hiking">Hiking</option>
            </SelectInput>
          </FormField>
          <FormField label="Date" error={activityErrors.startedAt}>
            <TextInput
              type="date"
              value={activityForm.startedAt}
              onChange={(event) => setActivityForm((current) => ({ ...current, startedAt: event.target.value }))}
            />
          </FormField>
          <FormField label="Location">
            <TextInput
              value={activityForm.location}
              onChange={(event) => setActivityForm((current) => ({ ...current, location: event.target.value }))}
              placeholder="City Park Loop"
            />
          </FormField>
          <FormField label="Distance (km)" error={activityErrors.distanceKm}>
            <TextInput
              value={activityForm.distanceKm}
              onChange={(event) => setActivityForm((current) => ({ ...current, distanceKm: event.target.value }))}
              placeholder="8.4"
            />
          </FormField>
          <FormField label="Duration (minutes)" error={activityErrors.durationMinutes}>
            <TextInput
              value={activityForm.durationMinutes}
              onChange={(event) => setActivityForm((current) => ({ ...current, durationMinutes: event.target.value }))}
              placeholder="43"
            />
          </FormField>
          <FormField label="Heart rate">
            <TextInput
              value={activityForm.heartRate}
              onChange={(event) => setActivityForm((current) => ({ ...current, heartRate: event.target.value }))}
              placeholder="161"
            />
          </FormField>
          <FormField label="Elevation (m)">
            <TextInput
              value={activityForm.elevationM}
              onChange={(event) => setActivityForm((current) => ({ ...current, elevationM: event.target.value }))}
              placeholder="62"
            />
          </FormField>
          <FormField label="Cadence (spm)">
            <TextInput
              value={activityForm.cadenceSpm}
              onChange={(event) => setActivityForm((current) => ({ ...current, cadenceSpm: event.target.value }))}
              placeholder="176"
            />
          </FormField>
          <FormField label="Calories">
            <TextInput
              value={activityForm.calories}
              onChange={(event) => setActivityForm((current) => ({ ...current, calories: event.target.value }))}
              placeholder="614"
            />
          </FormField>
        </div>
        <div className="mt-3">
          <FormField label="Notes">
            <TextAreaInput
              value={activityForm.notes}
              onChange={(event) => setActivityForm((current) => ({ ...current, notes: event.target.value }))}
              placeholder="Workout notes, session intent, or surface details"
            />
          </FormField>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <SecondaryButton type="button" className="flex-1" onClick={onClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="button" className="flex-1" onClick={handleSubmit}>
            {submissionState === "submitting" ? "Saving..." : "Save activity"}
          </PrimaryButton>
        </div>
      </SurfaceCard>
      {submissionState === "error" ? (
        <SurfaceCard className="border-error/20 bg-error-soft/40">
          <p className="font-display text-lg font-semibold text-text">{submissionCopy.title}</p>
          <p className="mt-2 text-sm leading-6 text-muted">{submissionCopy.description}</p>
        </SurfaceCard>
      ) : null}
    </div>
  );
}