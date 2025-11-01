-- AlterTable
ALTER TABLE "Milestone" ADD COLUMN     "assignedFreelancerId" TEXT,
ADD COLUMN     "moderatorApprovalRequired" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "moderatorApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "moderatorApprovedAt" TIMESTAMP(3),
ADD COLUMN     "moderatorApprovedBy" TEXT,
ADD COLUMN     "moderatorNotes" TEXT;

-- CreateIndex
CREATE INDEX "Milestone_assignedFreelancerId_idx" ON "Milestone"("assignedFreelancerId");

-- CreateIndex
CREATE INDEX "Milestone_moderatorApproved_idx" ON "Milestone"("moderatorApproved");

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_assignedFreelancerId_fkey" FOREIGN KEY ("assignedFreelancerId") REFERENCES "Freelancer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
