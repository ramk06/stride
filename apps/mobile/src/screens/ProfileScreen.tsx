import { useProfile } from "../hooks/use-stride-data";
import { HeroCard, Screen, SectionCard, StatRow } from "../ui/stride-ui";

export function ProfileScreen() {
  const { data } = useProfile();

  if (!data) {
    return null;
  }

  return (
    <Screen>
      <HeroCard title={data.name} subtitle={`${data.trainingFocus} focus for ${data.targetRace}.`}>
        <StatRow label="Preferred units" value="Metric" />
        <StatRow label="Timezone" value="Asia/Kolkata" />
      </HeroCard>

      <SectionCard title="Account setup">
        <StatRow label="Backend status" value="Pending API wiring" />
        <StatRow label="Mobile state" value="Expo scaffold ready" />
      </SectionCard>
    </Screen>
  );
}
