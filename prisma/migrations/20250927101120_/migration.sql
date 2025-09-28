-- CreateTable
CREATE TABLE "Visitors" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "businessEmail" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "companyName" TEXT,
    "companyWebsite" TEXT,
    "businessAddress" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "referralSource" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "trashedBy" TEXT,
    "trashedAt" TIMESTAMP(3),

    CONSTRAINT "Visitors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Visitors_businessEmail_key" ON "Visitors"("businessEmail");

-- CreateIndex
CREATE INDEX "Visitors_businessEmail_idx" ON "Visitors"("businessEmail");

-- CreateIndex
CREATE INDEX "Visitors_businessType_idx" ON "Visitors"("businessType");

-- CreateIndex
CREATE INDEX "Visitors_referralSource_idx" ON "Visitors"("referralSource");

-- CreateIndex
CREATE INDEX "Visitors_createdAt_idx" ON "Visitors"("createdAt");

-- CreateIndex
CREATE INDEX "Visitors_trashedAt_idx" ON "Visitors"("trashedAt");

-- CreateIndex
CREATE INDEX "Visitors_trashedBy_idx" ON "Visitors"("trashedBy");
