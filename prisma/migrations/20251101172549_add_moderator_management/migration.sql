-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "assignedModeratorId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Project_assignedModeratorId_idx" ON "Project"("assignedModeratorId");

-- CreateIndex
CREATE INDEX "User_role_isActive_idx" ON "User"("role", "isActive");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_assignedModeratorId_fkey" FOREIGN KEY ("assignedModeratorId") REFERENCES "User"("uid") ON DELETE SET NULL ON UPDATE CASCADE;
