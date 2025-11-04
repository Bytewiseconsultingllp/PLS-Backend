-- CreateTable
CREATE TABLE "ClientProjectDraft" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "isFinalized" BOOLEAN NOT NULL DEFAULT false,
    "finalizedAt" TIMESTAMP(3),
    "projectId" TEXT,
    "ipAddress" VARCHAR(45),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ClientProjectDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientProjectDraftDetails" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "fullName" VARCHAR(200) NOT NULL,
    "businessEmail" VARCHAR(254) NOT NULL,
    "phoneNumber" VARCHAR(32),
    "companyName" VARCHAR(200) NOT NULL,
    "companyWebsite" VARCHAR(2048),
    "businessAddress" TEXT,
    "businessType" VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ClientProjectDraftDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientProjectDraftService" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "name" "ServiceCategory" NOT NULL,
    "childServices" TEXT[],
    "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ClientProjectDraftService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientProjectDraftIndustries" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "category" "IndustryCategory" NOT NULL,
    "subIndustries" "IndustrySubIndustry"[],
    "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ClientProjectDraftIndustries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientProjectDraftTechnologies" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "category" "TechnologyCategory" NOT NULL,
    "technologies" "TechnologyItem"[],
    "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ClientProjectDraftTechnologies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientProjectDraftFeatures" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "category" "FeatureCategory" NOT NULL,
    "features" "FeatureItem"[],
    "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ClientProjectDraftFeatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientProjectDraftDiscount" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "type" "DiscountType" NOT NULL,
    "percent" SMALLINT NOT NULL,
    "notes" TEXT,
    "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ClientProjectDraftDiscount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientProjectDraftTimeline" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "option" "TimelineOption" NOT NULL,
    "rushFeePercent" SMALLINT NOT NULL,
    "estimatedDays" SMALLINT NOT NULL,
    "description" TEXT,
    "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ClientProjectDraftTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientProjectDraftEstimate" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "estimateAccepted" BOOLEAN NOT NULL,
    "estimateFinalPriceMin" DECIMAL(18,2) NOT NULL,
    "estimateFinalPriceMax" DECIMAL(18,2) NOT NULL,
    "isManuallyAdjusted" BOOLEAN NOT NULL DEFAULT false,
    "baseCost" DECIMAL(18,2),
    "discountAmount" DECIMAL(18,2),
    "rushFeeAmount" DECIMAL(18,2),
    "calculatedTotal" DECIMAL(18,2),
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ClientProjectDraftEstimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientProjectDraftServiceAgreement" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "documentUrl" VARCHAR(2048) NOT NULL,
    "agreementVersion" VARCHAR(100),
    "accepted" BOOLEAN NOT NULL DEFAULT true,
    "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "locale" VARCHAR(35),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ClientProjectDraftServiceAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClientProjectDraft_clientId_idx" ON "ClientProjectDraft"("clientId");

-- CreateIndex
CREATE INDEX "ClientProjectDraft_isFinalized_idx" ON "ClientProjectDraft"("isFinalized");

-- CreateIndex
CREATE INDEX "ClientProjectDraft_createdAt_idx" ON "ClientProjectDraft"("createdAt");

-- CreateIndex
CREATE INDEX "ClientProjectDraft_deletedAt_idx" ON "ClientProjectDraft"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClientProjectDraftDetails_draftId_key" ON "ClientProjectDraftDetails"("draftId");

-- CreateIndex
CREATE INDEX "ClientProjectDraftDetails_businessEmail_idx" ON "ClientProjectDraftDetails"("businessEmail");

-- CreateIndex
CREATE INDEX "ClientProjectDraftDetails_phoneNumber_idx" ON "ClientProjectDraftDetails"("phoneNumber");

-- CreateIndex
CREATE INDEX "ClientProjectDraftDetails_companyName_idx" ON "ClientProjectDraftDetails"("companyName");

-- CreateIndex
CREATE INDEX "ClientProjectDraftService_draftId_idx" ON "ClientProjectDraftService"("draftId");

-- CreateIndex
CREATE INDEX "ClientProjectDraftService_deletedAt_idx" ON "ClientProjectDraftService"("deletedAt");

-- CreateIndex
CREATE INDEX "ClientProjectDraftIndustries_draftId_idx" ON "ClientProjectDraftIndustries"("draftId");

-- CreateIndex
CREATE INDEX "ClientProjectDraftIndustries_deletedAt_idx" ON "ClientProjectDraftIndustries"("deletedAt");

-- CreateIndex
CREATE INDEX "ClientProjectDraftIndustries_category_idx" ON "ClientProjectDraftIndustries"("category");

-- CreateIndex
CREATE INDEX "ClientProjectDraftTechnologies_draftId_idx" ON "ClientProjectDraftTechnologies"("draftId");

-- CreateIndex
CREATE INDEX "ClientProjectDraftTechnologies_deletedAt_idx" ON "ClientProjectDraftTechnologies"("deletedAt");

-- CreateIndex
CREATE INDEX "ClientProjectDraftTechnologies_category_idx" ON "ClientProjectDraftTechnologies"("category");

-- CreateIndex
CREATE UNIQUE INDEX "ClientProjectDraftTechnologies_draftId_category_key" ON "ClientProjectDraftTechnologies"("draftId", "category");

-- CreateIndex
CREATE INDEX "ClientProjectDraftFeatures_draftId_idx" ON "ClientProjectDraftFeatures"("draftId");

-- CreateIndex
CREATE INDEX "ClientProjectDraftFeatures_deletedAt_idx" ON "ClientProjectDraftFeatures"("deletedAt");

-- CreateIndex
CREATE INDEX "ClientProjectDraftFeatures_category_idx" ON "ClientProjectDraftFeatures"("category");

-- CreateIndex
CREATE UNIQUE INDEX "ClientProjectDraftFeatures_draftId_category_key" ON "ClientProjectDraftFeatures"("draftId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "ClientProjectDraftDiscount_draftId_key" ON "ClientProjectDraftDiscount"("draftId");

-- CreateIndex
CREATE INDEX "ClientProjectDraftDiscount_deletedAt_idx" ON "ClientProjectDraftDiscount"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClientProjectDraftTimeline_draftId_key" ON "ClientProjectDraftTimeline"("draftId");

-- CreateIndex
CREATE INDEX "ClientProjectDraftTimeline_deletedAt_idx" ON "ClientProjectDraftTimeline"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClientProjectDraftEstimate_draftId_key" ON "ClientProjectDraftEstimate"("draftId");

-- CreateIndex
CREATE INDEX "ClientProjectDraftEstimate_deletedAt_idx" ON "ClientProjectDraftEstimate"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ClientProjectDraftServiceAgreement_draftId_key" ON "ClientProjectDraftServiceAgreement"("draftId");

-- CreateIndex
CREATE INDEX "ClientProjectDraftServiceAgreement_acceptedAt_idx" ON "ClientProjectDraftServiceAgreement"("acceptedAt");

-- CreateIndex
CREATE INDEX "ClientProjectDraftServiceAgreement_deletedAt_idx" ON "ClientProjectDraftServiceAgreement"("deletedAt");

-- AddForeignKey
ALTER TABLE "ClientProjectDraft" ADD CONSTRAINT "ClientProjectDraft_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("uid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProjectDraftDetails" ADD CONSTRAINT "ClientProjectDraftDetails_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ClientProjectDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProjectDraftService" ADD CONSTRAINT "ClientProjectDraftService_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ClientProjectDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProjectDraftIndustries" ADD CONSTRAINT "ClientProjectDraftIndustries_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ClientProjectDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProjectDraftTechnologies" ADD CONSTRAINT "ClientProjectDraftTechnologies_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ClientProjectDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProjectDraftFeatures" ADD CONSTRAINT "ClientProjectDraftFeatures_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ClientProjectDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProjectDraftDiscount" ADD CONSTRAINT "ClientProjectDraftDiscount_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ClientProjectDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProjectDraftTimeline" ADD CONSTRAINT "ClientProjectDraftTimeline_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ClientProjectDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProjectDraftEstimate" ADD CONSTRAINT "ClientProjectDraftEstimate_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ClientProjectDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientProjectDraftServiceAgreement" ADD CONSTRAINT "ClientProjectDraftServiceAgreement_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "ClientProjectDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;
