/*
  Warnings:

  - You are about to drop the column `photo` on the `Client` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Client" DROP COLUMN "photo",
ADD COLUMN     "visibility" TEXT;
