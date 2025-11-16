-- CreateEnum: Add RefundStatus enum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- AlterTable: Add refund tracking fields to Payment table
ALTER TABLE "Payment" ADD COLUMN "totalRefundedAmount" DECIMAL(10,2) DEFAULT 0;
ALTER TABLE "Payment" ADD COLUMN "lastRefundedAt" TIMESTAMP(3);

-- AlterTable: Add refund tracking field to Project table
ALTER TABLE "Project" ADD COLUMN "totalRefunded" DECIMAL(10,2) DEFAULT 0;

-- CreateTable: Create Refund table
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "refundedBy" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT,
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "stripeRefundId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Refund_stripeRefundId_key" ON "Refund"("stripeRefundId");
CREATE INDEX "Refund_paymentId_idx" ON "Refund"("paymentId");
CREATE INDEX "Refund_projectId_idx" ON "Refund"("projectId");
CREATE INDEX "Refund_refundedBy_idx" ON "Refund"("refundedBy");
CREATE INDEX "Refund_status_idx" ON "Refund"("status");
CREATE INDEX "Refund_createdAt_idx" ON "Refund"("createdAt");

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_refundedBy_fkey" FOREIGN KEY ("refundedBy") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Update existing data
UPDATE "Payment" SET "totalRefundedAmount" = 0 WHERE "totalRefundedAmount" IS NULL;
UPDATE "Project" SET "totalRefunded" = 0 WHERE "totalRefunded" IS NULL;

