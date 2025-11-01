-- AlterTable
ALTER TABLE "ProjectEstimate" ADD COLUMN     "baseCost" DECIMAL(18,2),
ADD COLUMN     "calculatedTotal" DECIMAL(18,2),
ADD COLUMN     "discountAmount" DECIMAL(18,2),
ADD COLUMN     "isManuallyAdjusted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rushFeeAmount" DECIMAL(18,2);

-- AlterTable
ALTER TABLE "VisitorEstimate" ADD COLUMN     "baseCost" DECIMAL(18,2),
ADD COLUMN     "calculatedTotal" DECIMAL(18,2),
ADD COLUMN     "discountAmount" DECIMAL(18,2),
ADD COLUMN     "isManuallyAdjusted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rushFeeAmount" DECIMAL(18,2);

-- CreateTable
CREATE TABLE "PricingServiceCategory" (
    "id" TEXT NOT NULL,
    "category" "ServiceCategory" NOT NULL,
    "basePrice" DECIMAL(18,2) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PricingServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingTechnology" (
    "id" TEXT NOT NULL,
    "technology" VARCHAR(100) NOT NULL,
    "additionalCost" DECIMAL(18,2) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PricingTechnology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PricingFeature" (
    "id" TEXT NOT NULL,
    "feature" VARCHAR(100) NOT NULL,
    "additionalCost" DECIMAL(18,2) NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PricingFeature_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PricingServiceCategory_category_key" ON "PricingServiceCategory"("category");

-- CreateIndex
CREATE INDEX "PricingServiceCategory_category_idx" ON "PricingServiceCategory"("category");

-- CreateIndex
CREATE INDEX "PricingServiceCategory_isActive_idx" ON "PricingServiceCategory"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PricingTechnology_technology_key" ON "PricingTechnology"("technology");

-- CreateIndex
CREATE INDEX "PricingTechnology_technology_idx" ON "PricingTechnology"("technology");

-- CreateIndex
CREATE INDEX "PricingTechnology_isActive_idx" ON "PricingTechnology"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PricingFeature_feature_key" ON "PricingFeature"("feature");

-- CreateIndex
CREATE INDEX "PricingFeature_feature_idx" ON "PricingFeature"("feature");

-- CreateIndex
CREATE INDEX "PricingFeature_isActive_idx" ON "PricingFeature"("isActive");
