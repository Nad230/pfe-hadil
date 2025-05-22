/*
  Warnings:

  - You are about to drop the column `invoiceId` on the `Sale` table. All the data in the column will be lost.
  - Made the column `productId` on table `Sale` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_productId_fkey";

-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "invoiceId",
ALTER COLUMN "productId" SET NOT NULL;

-- CreateTable
CREATE TABLE "SaleDegital" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SaleDegital_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleDegital" ADD CONSTRAINT "SaleDegital_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleDegital" ADD CONSTRAINT "SaleDegital_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
