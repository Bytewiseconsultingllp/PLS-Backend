-- CreateTable
CREATE TABLE "ProjectBuilder" (
    "id" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "projectDescription" TEXT NOT NULL,
    "projectType" TEXT NOT NULL,
    "technologies" TEXT[],
    "features" TEXT[],
    "budget" INTEGER,
    "timeline" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "clientName" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "clientPhone" TEXT,
    "clientCompany" TEXT,
    "additionalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "trashedBy" TEXT,
    "trashedAt" TIMESTAMP(3),

    CONSTRAINT "ProjectBuilder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectBuilder_projectName_idx" ON "ProjectBuilder"("projectName");

-- CreateIndex
CREATE INDEX "ProjectBuilder_clientEmail_idx" ON "ProjectBuilder"("clientEmail");

-- CreateIndex
CREATE INDEX "ProjectBuilder_status_idx" ON "ProjectBuilder"("status");

-- CreateIndex
CREATE INDEX "ProjectBuilder_createdAt_idx" ON "ProjectBuilder"("createdAt");

-- CreateIndex
CREATE INDEX "ProjectBuilder_trashedAt_idx" ON "ProjectBuilder"("trashedAt");

-- CreateIndex
CREATE INDEX "ProjectBuilder_trashedBy_idx" ON "ProjectBuilder"("trashedBy");
