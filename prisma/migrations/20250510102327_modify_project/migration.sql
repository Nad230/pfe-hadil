/*
  Warnings:

  - You are about to drop the column `date` on the `Profit` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profit" DROP COLUMN "date",
ADD COLUMN     "day" TEXT;
