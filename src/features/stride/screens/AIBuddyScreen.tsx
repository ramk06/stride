import { EmptyState, ErrorState, PrimaryButton, SectionHeader, SkeletonCard, SurfaceCard, TextAreaInput } from "@/components/stride/ui";
import { OfflineNotice } from "@/features/stride/feedback";
import { useConversation } from "@/features/stride/hooks";
import type { PreviewMode } from "@/features/stride/types";

export function AIBuddyScreen({
  previewMode,
  draft,
  onDraftChange,
}: {
  previewMode: PreviewMode;
  draft: string;
  onDraftChange: (value: string) => void;
}) {
  const resource = useConversation(previewMode);

  if (resource.status === "loading") {
    return <SkeletonCard lines={4} />;
  }

  if (resource.status === "empty") {
    return <EmptyState title={resource.title} description={resource.description} />;
  }

  if (resource.status === "error") {
    return <ErrorState title={resource.title} description={resource.description} />;
  }

  const data = resource.data;
  const offline = resource.status === "offline" ? resource : undefined;

  return (
    <div className="space-y-4">
      {offline ? <OfflineNotice title={offline.title} description={offline.description} /> : null}
      <SurfaceCard>
        <SectionHeader eyebrow="Optional feature" title={data.title} />
        <p className="mt-2 text-sm text-muted">{data.subtitle}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {data.suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onDraftChange(suggestion)}
              className="rounded-full bg-surface-muted px-3 py-2 text-left text-sm text-text"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </SurfaceCard>
      <SurfaceCard>
        <SectionHeader eyebrow="Conversation" title="Chat shell" />
        <div className="mt-4 rounded-[22px] bg-surface-muted p-4">
          <p className="text-sm leading-6 text-muted">
            AI Buddy is deliberately not faked here. Connect /v1/ai when the backend is ready and keep the rest of Stride fully usable without it.
          </p>
        </div>
        <div className="mt-4 space-y-3">
          <TextAreaInput
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            placeholder="Write a running question to send once the AI backend is connected"
          />
          <PrimaryButton type="button" className="w-full" disabled>
            Backend required for responses
          </PrimaryButton>
        </div>
      </SurfaceCard>
    </div>
  );
}