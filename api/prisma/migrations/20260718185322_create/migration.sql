-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Sale" (
    "id" SERIAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "total" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Sale" ADD CONSTRAINT "Sale_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
