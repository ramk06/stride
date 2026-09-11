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
import { submitGearDraft } from "@/features/stride/hooks";
import type { FormResult, GearFormInput } from "@/features/stride/types";

const initialGearForm: GearFormInput = {
  type: "running-shoes",
  brand: "",
  model: "",
  name: "",
  purchaseDate: "",
  startingMileageKm: "0",
  expectedMileageKm: "700",
  notes: "",
  imageUrl: "",
};

export function AddGearScreen({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [gearForm, setGearForm] = useState(initialGearForm);
  const [gearErrors, setGearErrors] = useState<Record<string, string>>({});
  const [submissionState, setSubmissionState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [submissionCopy, setSubmissionCopy] = useState<FormResult>({
    status: "success",
    title: "",
    description: "",
  });

  function validateGearForm() {
    const nextErrors: Record<string, string> = {};

    if (!gearForm.brand.trim()) nextErrors.brand = "Brand is required.";
    if (!gearForm.model.trim()) nextErrors.model = "Model is required.";
    if (!gearForm.name.trim()) nextErrors.name = "Name is required.";
    if (!gearForm.purchaseDate) nextErrors.purchaseDate = "Purchase date is required.";
    if (!gearForm.expectedMileageKm.trim()) {
      nextErrors.expectedMileageKm = "Expected mileage is required.";
    }

    setGearErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validateGearForm()) {
      setSubmissionState("error");
      setSubmissionCopy({
        status: "error",
        title: "Fix form issues",
        description: "Stride will not send an invalid gear payload to the future API.",
      });
      return;
    }

    setSubmissionState("submitting");
    const result = await submitGearDraft(gearForm);
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
        <SectionHeader eyebrow="Add gear" title="Gear details" />
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <FormField label="Type" error={gearErrors.type}>
            <SelectInput
              value={gearForm.type}
              onChange={(event) =>
                setGearForm((current) => ({
                  ...current,
                  type: event.target.value as GearFormInput["type"],
                }))
              }
            >
              <option value="running-shoes">Running shoes</option>
              <option value="watch">Watch</option>
              <option value="accessory">Accessory</option>
              <option value="other">Other</option>
            </SelectInput>
          </FormField>
          <FormField label="Brand" error={gearErrors.brand}>
            <TextInput
              value={gearForm.brand}
              onChange={(event) =>
                setGearForm((current) => ({ ...current, brand: event.target.value }))
              }
              placeholder="Nike"
            />
          </FormField>
          <FormField label="Model" error={gearErrors.model}>
            <TextInput
              value={gearForm.model}
              onChange={(event) =>
                setGearForm((current) => ({ ...current, model: event.target.value }))
              }
              placeholder="Pegasus 41"
            />
          </FormField>
          <FormField label="Name" error={gearErrors.name}>
            <TextInput
              value={gearForm.name}
              onChange={(event) =>
                setGearForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="Daily trainer"
            />
          </FormField>
          <FormField label="Purchase date" error={gearErrors.purchaseDate}>
            <TextInput
              type="date"
              value={gearForm.purchaseDate}
              onChange={(event) =>
                setGearForm((current) => ({ ...current, purchaseDate: event.target.value }))
              }
            />
          </FormField>
          <FormField label="Starting mileage">
            <TextInput
              value={gearForm.startingMileageKm}
              onChange={(event) =>
                setGearForm((current) => ({
                  ...current,
                  startingMileageKm: event.target.value,
                }))
              }
              placeholder="0"
            />
          </FormField>
          <FormField label="Expected mileage" error={gearErrors.expectedMileageKm}>
            <TextInput
              value={gearForm.expectedMileageKm}
              onChange={(event) =>
                setGearForm((current) => ({
                  ...current,
                  expectedMileageKm: event.target.value,
                }))
              }
              placeholder="700"
            />
          </FormField>
          <FormField label="Image URL">
            <TextInput
              value={gearForm.imageUrl}
              onChange={(event) =>
                setGearForm((current) => ({ ...current, imageUrl: event.target.value }))
              }
              placeholder="https://..."
            />
          </FormField>
        </div>
        <div className="mt-3">
          <FormField label="Notes">
            <TextAreaInput
              value={gearForm.notes}
              onChange={(event) =>
                setGearForm((current) => ({ ...current, notes: event.target.value }))
              }
              placeholder="Rotation role, surface, or fit notes"
            />
          </FormField>
        </div>
        <div className="mt-4 flex gap-3">
          <SecondaryButton type="button" className="flex-1" onClick={onClose}>
            Cancel
          </SecondaryButton>
          <PrimaryButton type="button" className="flex-1" onClick={handleSubmit}>
            {submissionState === "submitting" ? "Saving..." : "Save gear"}
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