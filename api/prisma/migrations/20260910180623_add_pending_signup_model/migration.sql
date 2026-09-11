/*
  Warnings:

  - You are about to drop the `VerificationNumber` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "VerificationNumber";

-- CreateTable
CREATE TABLE "PendingSignUp" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "verificationCodeHash" TEXT NOT NULL,
    "verificationCodeExpiresAt" TIMESTAMP(3) NOT NULL,
    "verificationCodeUsedAt" TIMESTAMP(3),
    "verificationAttempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PendingSignUp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingSignUp_email_key" ON "PendingSignUp"("email");
