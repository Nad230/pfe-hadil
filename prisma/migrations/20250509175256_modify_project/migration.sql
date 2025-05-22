-- DropForeignKey
ALTER TABLE "Sale" DROP CONSTRAINT "Sale_productId_fkey";

-- AlterTable
ALTER TABLE "Sale" ADD COLUMN     "invoiceId" TEXT,
ALTER COLUMN "productId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
