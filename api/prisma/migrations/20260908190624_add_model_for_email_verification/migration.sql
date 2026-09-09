-- CreateTable
CREATE TABLE "VerificationNumber" (
    "id" SERIAL NOT NULL,
    "numberHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "user" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationNumber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationNumber_numberHash_key" ON "VerificationNumber"("numberHash");

-- CreateIndex
CREATE INDEX "VerificationNumber_expiresAt_idx" ON "VerificationNumber"("expiresAt");
