/*
  Warnings:

  - You are about to drop the column `clientId` on the `projects` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_clientId_fkey";

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "clientId";

-- CreateTable
CREATE TABLE "ClientProject" (
    "clientId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ClientProject_pkey" PRIMARY KEY ("clientId","projectId")
);

-- AddForeignKey
ALTER TABLE "ClientProject" ADD CONSTRAINT "ClientProject_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProject" ADD CONSTRAINT "ClientProject_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
