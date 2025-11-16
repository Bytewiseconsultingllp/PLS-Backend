-- AlterEnum: Add new PaymentType enum
CREATE TYPE "PaymentType" AS ENUM ('FULL', 'DEPOSIT', 'INSTALLMENT');

-- AlterTable: Add new fields to Payment table
ALTER TABLE "Payment" ADD COLUMN "paymentType" "PaymentType" NOT NULL DEFAULT 'FULL';
ALTER TABLE "Payment" ADD COLUMN "depositPercentage" DECIMAL(5,2);
ALTER TABLE "Payment" ADD COLUMN "fullProjectAmount" DECIMAL(10,2);

-- AlterTable: Add new fields to Project table
ALTER TABLE "Project" ADD COLUMN "totalAmountPaid" DECIMAL(10,2) DEFAULT 0;
ALTER TABLE "Project" ADD COLUMN "paymentCompletionPercentage" DECIMAL(5,2) DEFAULT 0;

-- Update existing projects to have default values
UPDATE "Project" SET "totalAmountPaid" = 0 WHERE "totalAmountPaid" IS NULL;
UPDATE "Project" SET "paymentCompletionPercentage" = 0 WHERE "paymentCompletionPercentage" IS NULL;

-- CreateIndex: Add indexes for better query performance
CREATE INDEX "Payment_paymentType_idx" ON "Payment"("paymentType");
CREATE INDEX "Project_paymentCompletionPercentage_idx" ON "Project"("paymentCompletionPercentage");

