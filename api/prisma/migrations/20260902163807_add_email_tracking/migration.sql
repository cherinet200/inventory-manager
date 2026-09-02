-- CreateTable
CREATE TABLE "Email" (
    "id" TEXT NOT NULL,
    "resendId" TEXT NOT NULL,
    "recipien" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "event" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Email_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Email_resendId_key" ON "Email"("resendId");
