-- AlterTable
ALTER TABLE "Visitor" ADD COLUMN     "convertedAt" TIMESTAMP(3),
ADD COLUMN     "isConverted" BOOLEAN NOT NULL DEFAULT false;
