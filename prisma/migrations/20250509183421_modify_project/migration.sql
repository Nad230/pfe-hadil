/*
  Warnings:

  - You are about to drop the `SaleDegital` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SaleDegital" DROP CONSTRAINT "SaleDegital_invoiceId_fkey";

-- DropForeignKey
ALTER TABLE "SaleDegital" DROP CONSTRAINT "SaleDegital_userId_fkey";

-- DropTable
DROP TABLE "SaleDegital";

-- CreateTable
CREATE TABLE "SaleDigital" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SaleDigital_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SaleDigital" ADD CONSTRAINT "SaleDigital_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleDigital" ADD CONSTRAINT "SaleDigital_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
