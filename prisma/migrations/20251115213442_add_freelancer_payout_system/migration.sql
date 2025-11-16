/*
  Warnings:

  - A unique constraint covering the columns `[stripeAccountId]` on the table `Freelancer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "StripeAccountStatus" AS ENUM ('NOT_CONNECTED', 'PENDING', 'ACTIVE', 'RESTRICTED', 'DISABLED');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayoutType" AS ENUM ('MILESTONE', 'PROJECT', 'BONUS', 'MANUAL');

-- DropIndex
DROP INDEX "Payment_paymentType_idx";

-- DropIndex
DROP INDEX "Project_paymentCompletionPercentage_idx";

-- AlterTable
ALTER TABLE "Freelancer" ADD COLUMN     "paymentDetailsVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stripeAccountId" TEXT,
ADD COLUMN     "stripeAccountStatus" "StripeAccountStatus" NOT NULL DEFAULT 'NOT_CONNECTED';

-- CreateTable
CREATE TABLE "FreelancerPayout" (
    "id" TEXT NOT NULL,
    "freelancerId" TEXT NOT NULL,
    "projectId" TEXT,
    "milestoneId" TEXT,
    "initiatedBy" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "payoutType" "PayoutType" NOT NULL DEFAULT 'MANUAL',
    "stripeTransferId" TEXT,
    "stripePayoutId" TEXT,
    "description" TEXT,
    "notes" TEXT,
    "failureReason" TEXT,
    "failureCode" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "FreelancerPayout_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FreelancerPayout_stripeTransferId_key" ON "FreelancerPayout"("stripeTransferId");

-- CreateIndex
CREATE UNIQUE INDEX "FreelancerPayout_stripePayoutId_key" ON "FreelancerPayout"("stripePayoutId");

-- CreateIndex
CREATE INDEX "FreelancerPayout_freelancerId_idx" ON "FreelancerPayout"("freelancerId");

-- CreateIndex
CREATE INDEX "FreelancerPayout_projectId_idx" ON "FreelancerPayout"("projectId");

-- CreateIndex
CREATE INDEX "FreelancerPayout_milestoneId_idx" ON "FreelancerPayout"("milestoneId");

-- CreateIndex
CREATE INDEX "FreelancerPayout_initiatedBy_idx" ON "FreelancerPayout"("initiatedBy");

-- CreateIndex
CREATE INDEX "FreelancerPayout_status_idx" ON "FreelancerPayout"("status");

-- CreateIndex
CREATE INDEX "FreelancerPayout_payoutType_idx" ON "FreelancerPayout"("payoutType");

-- CreateIndex
CREATE INDEX "FreelancerPayout_createdAt_idx" ON "FreelancerPayout"("createdAt");

-- CreateIndex
CREATE INDEX "FreelancerPayout_stripeTransferId_idx" ON "FreelancerPayout"("stripeTransferId");

-- CreateIndex
CREATE INDEX "FreelancerPayout_stripePayoutId_idx" ON "FreelancerPayout"("stripePayoutId");

-- CreateIndex
CREATE UNIQUE INDEX "Freelancer_stripeAccountId_key" ON "Freelancer"("stripeAccountId");

-- CreateIndex
CREATE INDEX "Freelancer_stripeAccountId_idx" ON "Freelancer"("stripeAccountId");

-- CreateIndex
CREATE INDEX "Freelancer_stripeAccountStatus_idx" ON "Freelancer"("stripeAccountStatus");

-- AddForeignKey
ALTER TABLE "FreelancerPayout" ADD CONSTRAINT "FreelancerPayout_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreelancerPayout" ADD CONSTRAINT "FreelancerPayout_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreelancerPayout" ADD CONSTRAINT "FreelancerPayout_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreelancerPayout" ADD CONSTRAINT "FreelancerPayout_initiatedBy_fkey" FOREIGN KEY ("initiatedBy") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;
