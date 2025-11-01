-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "_SelectedFreelancers" ADD CONSTRAINT "_SelectedFreelancers_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_SelectedFreelancers_AB_unique";

-- CreateIndex
CREATE INDEX "Project_paymentStatus_idx" ON "Project"("paymentStatus");
