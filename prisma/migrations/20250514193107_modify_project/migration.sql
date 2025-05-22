/*
  Warnings:

  - The `type` column on the `AssistantMessage` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "AssistantMessage" DROP COLUMN "type",
ADD COLUMN     "type" TEXT;

-- DropEnum
DROP TYPE "MessageType";
