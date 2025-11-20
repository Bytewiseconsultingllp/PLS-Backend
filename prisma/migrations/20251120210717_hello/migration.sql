-- AlterTable
ALTER TABLE "FreelancerPayout" ADD COLUMN     "exchangeRate" DECIMAL(12,6),
ADD COLUMN     "freelancerCurrency" TEXT,
ADD COLUMN     "platformAmount" DECIMAL(12,2),
ADD COLUMN     "platformCurrency" TEXT NOT NULL DEFAULT 'usd';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "exchangeRate" DECIMAL(12,6),
ADD COLUMN     "originalAmount" DECIMAL(12,2),
ADD COLUMN     "originalCurrency" TEXT,
ADD COLUMN     "platformAmount" DECIMAL(12,2),
ADD COLUMN     "platformCurrency" TEXT NOT NULL DEFAULT 'usd';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "preferredCurrency" TEXT DEFAULT 'usd';
