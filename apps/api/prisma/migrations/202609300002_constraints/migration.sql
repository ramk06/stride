ALTER TABLE "Activity" ADD CONSTRAINT "Activity_valid_metrics" CHECK (
  "distanceMeters" BETWEEN 0 AND 1000000 AND "movingSeconds" BETWEEN 1 AND 604800
  AND "elapsedSeconds" BETWEEN "movingSeconds" AND 604800 AND "version" > 0
);
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_permitted_source" CHECK ("source" = 'manual' AND "externalId" IS NULL);
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_sport" CHECK ("sport" IN ('run', 'trail', 'walk'));
ALTER TABLE "Gear" ADD CONSTRAINT "Gear_valid_values" CHECK (
  "type" IN ('shoe', 'equipment') AND "openingMileageMeters" BETWEEN 0 AND 100000000
  AND ("expectedLifeMeters" IS NULL OR "expectedLifeMeters" BETWEEN 1 AND 100000000)
  AND ("type" = 'shoe' OR ("openingMileageMeters" = 0 AND "expectedLifeMeters" IS NULL)) AND "version" > 0
);
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_valid_values" CHECK (
  "target" BETWEEN 1 AND 100000000 AND "type" IN ('distance', 'count', 'longest')
  AND "period" IN ('week', 'month', 'custom') AND "startsOn" <= "endsOn" AND "version" > 0 AND "ruleVersion" = 1
);
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_valid_values" CHECK (
  "units" IN ('km', 'mi') AND "experience" IN ('beginner', 'regular', 'experienced') AND "version" > 0
);
ALTER TABLE "User" ADD CONSTRAINT "User_normalized_email" CHECK ("email" = lower(btrim("email")));
CREATE INDEX "Outbox_userId_idx" ON "Outbox"("userId");