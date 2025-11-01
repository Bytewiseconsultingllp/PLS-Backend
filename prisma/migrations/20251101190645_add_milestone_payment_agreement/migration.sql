-- CreateEnum
CREATE TYPE "AgreementStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "MilestonePaymentAgreement" (
    "id" TEXT NOT NULL,
    "milestoneId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "agreementDocumentUrl" VARCHAR(2048) NOT NULL,
    "milestoneAmount" DECIMAL(18,2) NOT NULL,
    "distributionDetails" JSONB NOT NULL,
    "status" "AgreementStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "MilestonePaymentAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MilestonePaymentAgreement_milestoneId_key" ON "MilestonePaymentAgreement"("milestoneId");

-- CreateIndex
CREATE INDEX "MilestonePaymentAgreement_milestoneId_idx" ON "MilestonePaymentAgreement"("milestoneId");

-- CreateIndex
CREATE INDEX "MilestonePaymentAgreement_projectId_idx" ON "MilestonePaymentAgreement"("projectId");

-- CreateIndex
CREATE INDEX "MilestonePaymentAgreement_status_idx" ON "MilestonePaymentAgreement"("status");

-- CreateIndex
CREATE INDEX "MilestonePaymentAgreement_createdBy_idx" ON "MilestonePaymentAgreement"("createdBy");

-- CreateIndex
CREATE INDEX "MilestonePaymentAgreement_deletedAt_idx" ON "MilestonePaymentAgreement"("deletedAt");

-- AddForeignKey
ALTER TABLE "MilestonePaymentAgreement" ADD CONSTRAINT "MilestonePaymentAgreement_milestoneId_fkey" FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MilestonePaymentAgreement" ADD CONSTRAINT "MilestonePaymentAgreement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
