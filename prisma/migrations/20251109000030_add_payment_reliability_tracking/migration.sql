-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "lastWebhookEventId" TEXT,
ADD COLUMN     "webhookEventsProcessed" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "lastCheckedAt" TIMESTAMP(3),
ADD COLUMN     "webhookRetryCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PaymentVerificationLog" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "verifiedBy" TEXT NOT NULL,
    "stripeStatus" TEXT NOT NULL,
    "ourStatus" TEXT NOT NULL,
    "matched" BOOLEAN NOT NULL,
    "eventId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentVerificationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Payment_lastCheckedAt_idx" ON "Payment"("lastCheckedAt");

-- CreateIndex
CREATE INDEX "PaymentVerificationLog_paymentId_idx" ON "PaymentVerificationLog"("paymentId");

-- CreateIndex
CREATE INDEX "PaymentVerificationLog_verifiedBy_idx" ON "PaymentVerificationLog"("verifiedBy");

-- CreateIndex
CREATE INDEX "PaymentVerificationLog_createdAt_idx" ON "PaymentVerificationLog"("createdAt");

-- CreateIndex
CREATE INDEX "PaymentVerificationLog_matched_idx" ON "PaymentVerificationLog"("matched");

-- AddForeignKey
ALTER TABLE "PaymentVerificationLog" ADD CONSTRAINT "PaymentVerificationLog_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

