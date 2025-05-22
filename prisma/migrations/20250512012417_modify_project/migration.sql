/*
  Warnings:

  - You are about to drop the column `assignedToId` on the `tasks` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_assignedToId_fkey";

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "assignedToId";

-- CreateTable
CREATE TABLE "TaskAssignment" (
    "taskId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,

    CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("taskId","memberId")
);

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "team_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
