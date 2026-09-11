import { StrideEntry } from "@/features/stride/app-entry";
import { getCurrentSessionUser } from "@/features/stride/persistence";

export default async function Home() {
  const user = await getCurrentSessionUser();

  return <StrideEntry initialUser={user} />;
}
