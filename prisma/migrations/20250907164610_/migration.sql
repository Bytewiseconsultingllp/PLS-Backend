/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Profile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `WhoYouAre` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `workingHours` on the `AvailabilityWorkflow` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `collaborationTools` on the `AvailabilityWorkflow` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `teamStyle` on table `AvailabilityWorkflow` required. This step will fail if there are existing NULL values in that column.
  - Made the column `screenSharing` on table `AvailabilityWorkflow` required. This step will fail if there are existing NULL values in that column.
  - Made the column `availabilityExceptions` on table `AvailabilityWorkflow` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `certificates` on the `Certifications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `primaryDomain` on table `CoreRole` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `roles` on the `DomainExperience` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `selectedSkills` on the `EliteSkillCards` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `idType` on table `IdentityVerification` required. This step will fail if there are existing NULL values in that column.
  - Made the column `taxDocType` on table `IdentityVerification` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `selectedIndustries` on the `IndustryExperience` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `agreements` on the `LegalAgreements` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `whoYouAreId` on table `Profile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `compensationPreference` on table `ProjectQuoting` required. This step will fail if there are existing NULL values in that column.
  - Made the column `milestoneTerms` on table `ProjectQuoting` required. This step will fail if there are existing NULL values in that column.
  - Made the column `willSubmitProposals` on table `ProjectQuoting` required. This step will fail if there are existing NULL values in that column.
  - Made the column `collaborationStyle` on table `SoftSkills` required. This step will fail if there are existing NULL values in that column.
  - Made the column `communicationFrequency` on table `SoftSkills` required. This step will fail if there are existing NULL values in that column.
  - Made the column `conflictResolution` on table `SoftSkills` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `languages` on the `SoftSkills` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `teamVsSolo` on table `SoftSkills` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `selectedTools` on the `ToolstackProficiency` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `fullName` on table `WhoYouAre` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `WhoYouAre` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_whoYouAreId_fkey";

-- DropIndex
DROP INDEX "Profile_userId_key";

-- AlterTable
ALTER TABLE "AvailabilityWorkflow" DROP COLUMN "workingHours",
ADD COLUMN     "workingHours" JSONB NOT NULL,
DROP COLUMN "collaborationTools",
ADD COLUMN     "collaborationTools" JSONB NOT NULL,
ALTER COLUMN "teamStyle" SET NOT NULL,
ALTER COLUMN "screenSharing" SET NOT NULL,
ALTER COLUMN "availabilityExceptions" SET NOT NULL;

-- AlterTable
ALTER TABLE "Certifications" DROP COLUMN "certificates",
ADD COLUMN     "certificates" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "CoreRole" ALTER COLUMN "primaryDomain" SET NOT NULL;

-- AlterTable
ALTER TABLE "DomainExperience" DROP COLUMN "roles",
ADD COLUMN     "roles" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "EliteSkillCards" DROP COLUMN "selectedSkills",
ADD COLUMN     "selectedSkills" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "IdentityVerification" ALTER COLUMN "idType" SET NOT NULL,
ALTER COLUMN "taxDocType" SET NOT NULL;

-- AlterTable
ALTER TABLE "IndustryExperience" DROP COLUMN "selectedIndustries",
ADD COLUMN     "selectedIndustries" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "LegalAgreements" DROP COLUMN "agreements",
ADD COLUMN     "agreements" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "createdAt",
ALTER COLUMN "whoYouAreId" SET NOT NULL;

-- AlterTable
ALTER TABLE "ProjectQuoting" ALTER COLUMN "compensationPreference" SET NOT NULL,
ALTER COLUMN "milestoneTerms" SET NOT NULL,
ALTER COLUMN "willSubmitProposals" SET NOT NULL;

-- AlterTable
ALTER TABLE "SoftSkills" ALTER COLUMN "collaborationStyle" SET NOT NULL,
ALTER COLUMN "communicationFrequency" SET NOT NULL,
ALTER COLUMN "conflictResolution" SET NOT NULL,
DROP COLUMN "languages",
ADD COLUMN     "languages" JSONB NOT NULL,
ALTER COLUMN "teamVsSolo" SET NOT NULL;

-- AlterTable
ALTER TABLE "ToolstackProficiency" DROP COLUMN "selectedTools",
ADD COLUMN     "selectedTools" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "WhoYouAre" ALTER COLUMN "fullName" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "WhoYouAre_email_key" ON "WhoYouAre"("email");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_whoYouAreId_fkey" FOREIGN KEY ("whoYouAreId") REFERENCES "WhoYouAre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
