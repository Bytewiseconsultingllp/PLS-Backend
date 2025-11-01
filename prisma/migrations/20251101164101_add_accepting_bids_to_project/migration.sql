-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "acceptingBids" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Project_acceptingBids_idx" ON "Project"("acceptingBids");
