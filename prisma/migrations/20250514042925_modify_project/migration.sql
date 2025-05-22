-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('QUESTION', 'ANSWER', 'SYSTEM_NOTE');

-- CreateTable
CREATE TABLE "UserAssistantProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isNewFreelancer" BOOLEAN,
    "hasExistingWork" BOOLEAN,
    "hasTeam" BOOLEAN,
    "hasTime" BOOLEAN,
    "interestedInJob" BOOLEAN,
    "skills" TEXT[],
    "mainGoal" TEXT,
    "currentStep" TEXT,
    "plan" TEXT[],
    "aiNotes" TEXT,
    "memory" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserAssistantProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssistantMessage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "MessageType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssistantMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserAssistantProfile_userId_key" ON "UserAssistantProfile"("userId");

-- AddForeignKey
ALTER TABLE "UserAssistantProfile" ADD CONSTRAINT "UserAssistantProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssistantMessage" ADD CONSTRAINT "AssistantMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
