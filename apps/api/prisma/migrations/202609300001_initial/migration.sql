-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "verifiedAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "userId" UUID NOT NULL,
    "displayName" TEXT NOT NULL DEFAULT 'Runner',
    "units" TEXT NOT NULL DEFAULT 'km',
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "experience" TEXT NOT NULL DEFAULT 'beginner',
    "notifications" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "revokedAt" TIMESTAMPTZ(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "hash" TEXT NOT NULL,
    "sessionId" UUID NOT NULL,
    "consumedAt" TIMESTAMPTZ(3),

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "ActionToken" (
    "hash" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "purpose" TEXT NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "consumedAt" TIMESTAMPTZ(3),

    CONSTRAINT "ActionToken_pkey" PRIMARY KEY ("hash")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "externalId" TEXT,
    "startedAt" TIMESTAMPTZ(3) NOT NULL,
    "timezone" TEXT NOT NULL,
    "distanceMeters" INTEGER NOT NULL,
    "movingSeconds" INTEGER NOT NULL,
    "elapsedSeconds" INTEGER NOT NULL,
    "notes" TEXT NOT NULL DEFAULT '',
    "gearId" UUID,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gear" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "brand" TEXT NOT NULL DEFAULT '',
    "openingMileageMeters" INTEGER NOT NULL DEFAULT 0,
    "expectedLifeMeters" INTEGER,
    "retiredAt" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Gear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "period" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "startsOn" TEXT NOT NULL,
    "endsOn" TEXT NOT NULL,
    "archivedAt" TIMESTAMPTZ(3),
    "ruleVersion" INTEGER NOT NULL DEFAULT 1,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outbox" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "kind" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMPTZ(3),

    CONSTRAINT "Outbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataExport" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "data" JSONB,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "DataExport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Session_userId_expiresAt_idx" ON "Session"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "RefreshToken_sessionId_idx" ON "RefreshToken"("sessionId");

-- CreateIndex
CREATE INDEX "ActionToken_userId_idx" ON "ActionToken"("userId");

-- CreateIndex
CREATE INDEX "Activity_userId_startedAt_id_idx" ON "Activity"("userId", "startedAt" DESC, "id" DESC);

-- CreateIndex
CREATE INDEX "Activity_userId_sport_startedAt_idx" ON "Activity"("userId", "sport", "startedAt");

-- CreateIndex
CREATE INDEX "Activity_gearId_userId_idx" ON "Activity"("gearId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_userId_source_externalId_key" ON "Activity"("userId", "source", "externalId");

-- CreateIndex
CREATE INDEX "Gear_userId_retiredAt_idx" ON "Gear"("userId", "retiredAt");

-- CreateIndex
CREATE UNIQUE INDEX "Gear_id_userId_key" ON "Gear"("id", "userId");

-- CreateIndex
CREATE INDEX "Goal_userId_archivedAt_idx" ON "Goal"("userId", "archivedAt");

-- CreateIndex
CREATE INDEX "Outbox_sentAt_createdAt_idx" ON "Outbox"("sentAt", "createdAt");

-- CreateIndex
CREATE INDEX "DataExport_userId_createdAt_idx" ON "DataExport"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionToken" ADD CONSTRAINT "ActionToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_gearId_userId_fkey" FOREIGN KEY ("gearId", "userId") REFERENCES "Gear"("id", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gear" ADD CONSTRAINT "Gear_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outbox" ADD CONSTRAINT "Outbox_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataExport" ADD CONSTRAINT "DataExport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
