/*
  Warnings:

  - You are about to drop the column `agreements` on the `LegalAgreements` table. All the data in the column will be lost.
  - You are about to drop the column `identityVerificationId` on the `LegalAgreements` table. All the data in the column will be lost.
  - You are about to drop the column `workAuthorizationId` on the `LegalAgreements` table. All the data in the column will be lost.
  - The primary key for the `Milestone` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `mileStoneName` on the `Milestone` table. All the data in the column will be lost.
  - You are about to drop the column `priorityRank` on the `Milestone` table. All the data in the column will be lost.
  - You are about to drop the column `totalProgressPoints` on the `Milestone` table. All the data in the column will be lost.
  - The primary key for the `Project` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `bounty` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `clientWhoPostedThisProjectForeignId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `commentByClientAfterProjectCompletion` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `deadline` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `detail` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `difficultyLevel` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `isDeadlineNeedToBeExtend` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `niche` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `progressPercentage` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `projectCompletedOn` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `projectSlug` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `projectStatus` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `projectType` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `starsByClientAfterProjectCompletion` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `trashedAt` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `trashedBy` on the `Project` table. All the data in the column will be lost.
  - The primary key for the `_InterestedFreelancers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_SelectedFreelancers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `AvailabilityWorkflow` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Certifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CoreRole` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CreateServicesForQuote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DomainExperience` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EliteSkillCards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Feature` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FreeLancersRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IdentityVerification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Industry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IndustryExperience` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NichesForFreelancers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Profile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectBuilder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectQuoting` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProjectRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Service` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SoftSkills` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Technology` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ToolstackProficiency` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Visitors` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WhoYouAre` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkAuthorization` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_InterestedProjectBuilderFreelancers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_SelectedProjectBuilderFreelancers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[freelancerId]` on the table `LegalAgreements` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[projectId,milestoneName]` on the table `Milestone` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `codeOfConductUrl` to the `LegalAgreements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `freelancerId` to the `LegalAgreements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nonSolicitationUrl` to the `LegalAgreements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentTermsUrl` to the `LegalAgreements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectIpBoundariesUrl` to the `LegalAgreements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectScopeDeliverablesUrl` to the `LegalAgreements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectSpecificNdaUrl` to the `LegalAgreements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `LegalAgreements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workForHireUrl` to the `LegalAgreements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `milestoneName` to the `Milestone` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Milestone` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clientId` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('SOFTWARE_DEVELOPMENT', 'DATA_AND_ANALYTICS', 'CLOUD_AND_DEVOPS', 'EMERGING_TECHNOLOGIES', 'CREATIVE_AND_DESIGN', 'DIGITAL_MARKETING');

-- CreateEnum
CREATE TYPE "IndustryCategory" AS ENUM ('HEALTHCARE_AND_LIFE_SCIENCES', 'FINANCIAL_SERVICES', 'RETAIL_AND_ECOMMERCE', 'MANUFACTURING', 'EDUCATION', 'GOVERNMENT_AND_PUBLIC_SECTOR');

-- CreateEnum
CREATE TYPE "IndustrySubIndustry" AS ENUM ('HEALTHCARE_PROVIDERS', 'PHARMACEUTICALS', 'MEDICAL_DEVICES', 'BIOTECHNOLOGY', 'HEALTH_INSURANCE', 'BANKING', 'INSURANCE', 'INVESTMENT_MANAGEMENT', 'PAYMENTS', 'LENDING', 'BLOCKCHAIN_AND_CRYPTO', 'ONLINE_RETAIL', 'BRICK_AND_MORTAR', 'OMNICHANNEL', 'FASHION_AND_APPAREL', 'CONSUMER_GOODS', 'AUTOMOTIVE', 'INDUSTRIAL_EQUIPMENT', 'ELECTRONICS', 'AEROSPACE_AND_DEFENSE', 'CHEMICAL_AND_MATERIALS', 'SMART_MANUFACTURING', 'K_12_EDUCATION', 'HIGHER_EDUCATION', 'PROFESSIONAL_TRAINING', 'EDTECH', 'RESEARCH_AND_DEVELOPMENT', 'FEDERAL_GOVERNMENT', 'STATE_AND_LOCAL', 'PUBLIC_HEALTHCARE', 'PUBLIC_INFRASTRUCTURE', 'CIVIC_TECHNOLOGY');

-- CreateEnum
CREATE TYPE "TechnologyCategory" AS ENUM ('FRONTEND', 'BACKEND', 'DATABASE', 'AI_AND_DATA_SCIENCE', 'DEVOPS_AND_INFRASTRUCTURE', 'MOBILE');

-- CreateEnum
CREATE TYPE "TechnologyItem" AS ENUM ('REACT', 'ANGULAR', 'VUE_JS', 'NEXT_JS', 'SVELTE', 'JQUERY', 'NODE_JS', 'PYTHON_DJANGO', 'JAVA_SPRING', 'PHP_LARAVEL', 'RUBY_ON_RAILS', 'DOTNET_CORE', 'POSTGRESQL', 'MONGODB', 'MYSQL', 'REDIS', 'FIREBASE', 'SQL_SERVER', 'TENSORFLOW', 'PYTORCH', 'OPENAI_API', 'SCIKIT_LEARN', 'PANDAS', 'COMPUTER_VISION', 'AWS', 'DOCKER', 'KUBERNETES', 'GITHUB_ACTIONS', 'TERRAFORM', 'JENKINS', 'REACT_NATIVE', 'FLUTTER', 'SWIFT_IOS', 'KOTLIN_ANDROID', 'XAMARIN', 'IONIC');

-- CreateEnum
CREATE TYPE "FeatureCategory" AS ENUM ('USER_MANAGEMENT', 'CONTENT_MANAGEMENT', 'ECOMMERCE', 'ANALYTICS_AND_REPORTING', 'COMMUNICATION', 'INTEGRATION_AND_API');

-- CreateEnum
CREATE TYPE "FeatureItem" AS ENUM ('AUTHENTICATION', 'ROLE_BASED_ACCESS_CONTROL', 'USER_PROFILES', 'SOCIAL_LOGIN', 'RICH_TEXT_EDITOR', 'MEDIA_LIBRARY', 'CONTENT_VERSIONING', 'CONTENT_SCHEDULING', 'PRODUCT_CATALOG', 'SHOPPING_CART', 'PAYMENT_PROCESSING', 'INVENTORY_MANAGEMENT', 'DASHBOARD', 'CUSTOM_REPORTS', 'USER_ANALYTICS', 'PERFORMANCE_METRICS', 'EMAIL_NOTIFICATIONS', 'IN_APP_MESSAGING', 'PUSH_NOTIFICATIONS', 'COMMENTS_AND_FEEDBACK', 'RESTFUL_API', 'WEBHOOKS', 'THIRD_PARTY_INTEGRATIONS', 'DATA_IMPORT_EXPORT');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('STARTUP_FOUNDER', 'VETERAN_OWNED_BUSINESS', 'NONPROFIT_ORGANIZATION', 'NOT_ELIGIBLE');

-- CreateEnum
CREATE TYPE "TimelineOption" AS ENUM ('STANDARD_BUILD', 'PRIORITY_BUILD', 'ACCELERATED_BUILD', 'RAPID_BUILD', 'FAST_TRACK_BUILD');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MilestonePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "MilestonePhase" AS ENUM ('DISCOVERY', 'DESIGN', 'IMPLEMENTATION', 'TESTING', 'DEPLOYMENT');

-- CreateEnum
CREATE TYPE "MilestoneRiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "AvailabilityWindow" AS ENUM ('EIGHT_AM_TO_TWELVE_PM', 'TWELVE_PM_TO_FOUR_PM', 'FOUR_PM_TO_EIGHT_PM', 'EIGHT_PM_TO_TWELVE_AM', 'TWELVE_AM_TO_SIX_AM');

-- CreateEnum
CREATE TYPE "CollaborationTool" AS ENUM ('SLACK', 'NOTION', 'GITHUB', 'JIRA', 'ZOOM', 'GOOGLE_MEET', 'DISCORD', 'TRELLO', 'ASANA', 'FIGMA', 'MIRO');

-- CreateEnum
CREATE TYPE "PreferredTeamStyle" AS ENUM ('ASYNC_ONLY', 'SCHEDULED_STANDUPS', 'REAL_TIME_RESPONSIVE');

-- CreateEnum
CREATE TYPE "LiveScreenSharingPreference" AS ENUM ('YES_COMFORTABLE', 'YES_SPECIFIC_HOURS', 'NO_OFFLINE_ASYNC');

-- CreateEnum
CREATE TYPE "ToolstackItem" AS ENUM ('PROJECT_MANAGEMENT', 'COMMUNICATION', 'DOCUMENTATION', 'DESIGN', 'PRODUCTIVITY', 'VERSION_CONTROL', 'ANALYTICS', 'CRM', 'OTHER', 'JIRA', 'ASANA', 'TRELLO', 'MONDAY_COM', 'CLICKUP', 'SLACK', 'MICROSOFT_TEAMS', 'DISCORD', 'ZOOM', 'GOOGLE_MEET', 'NOTION', 'CONFLUENCE', 'GOOGLE_DOCS', 'CODA', 'OBSIDIAN', 'FIGMA', 'ADOBE_CREATIVE_SUITE', 'CANVA', 'SKETCH', 'MIRO', 'TODOIST', 'EVERNOTE', 'ROAM_RESEARCH', 'GIT', 'GITHUB', 'GITLAB', 'BITBUCKET', 'AZURE_DEVOPS', 'GOOGLE_ANALYTICS', 'MIXPANEL', 'AMPLITUDE', 'HOTJAR', 'LOOKER', 'SALESFORCE', 'HUBSPOT', 'ZOHO', 'PIPEDRIVE', 'MONDAY_SALES_CRM');

-- CreateEnum
CREATE TYPE "FreelancerIndustry" AS ENUM ('FINTECH', 'HEALTHTECH', 'GOVTECH_FEMA_DEFENSE', 'E_COMMERCE', 'SAAS_B2B_B2C', 'EDTECH', 'AI_AND_MACHINE_LEARNING', 'REAL_ESTATE_PROPTECH', 'BLOCKCHAIN_WEB3', 'MEDIA_PUBLISHING', 'CLIMATETECH_ENERGY', 'MANUFACTURING_IOT', 'LEGALTECH', 'NGOS_NONPROFITS', 'MARKETING_ADTECH', 'TRANSPORTATION_LOGISTICS', 'TRAVEL_HOSPITALITY', 'SPORTSTECH_GAMING');

-- CreateEnum
CREATE TYPE "PreferredCollaborationStyle" AS ENUM ('AGILE_SCRUM', 'ASYNC_DOCUMENT_FIRST', 'STRUCTURED_PROCESS_ORIENTED', 'FLEXIBLE_CONTEXT_DRIVEN');

-- CreateEnum
CREATE TYPE "CommunicationFrequencyPreference" AS ENUM ('DAILY_CHECK_INS', 'WEEKLY_MILESTONE_REVIEWS', 'AD_HOC_ONLY', 'ADAPT_TO_PREFERENCE');

-- CreateEnum
CREATE TYPE "ConflictResolutionStyle" AS ENUM ('DIRECT_CLEAR', 'EMPATHIC_REFLECTIVE', 'NEUTRAL_SYSTEMIC', 'ADAPTIVE');

-- CreateEnum
CREATE TYPE "LanguageFluency" AS ENUM ('ENGLISH', 'HINDI_URDU', 'SPANISH', 'ARABIC', 'MANDARIN', 'FRENCH', 'GERMAN', 'KASHMIRI');

-- CreateEnum
CREATE TYPE "TeamVsSoloPreference" AS ENUM ('INDEPENDENT', 'TEAM_ORIENTED', 'FLEXIBLE_BOTH');

-- CreateEnum
CREATE TYPE "ProjectCompensationPreference" AS ENUM ('FIXED_PRICE', 'OPEN_TO_BIDDING', 'HOURLY_OR_RETAINER_ONLY');

-- CreateEnum
CREATE TYPE "MilestonePaymentTerms" AS ENUM ('FIFTY_FIFTY', 'THIRTY_FORTY_THIRTY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ProposalSubmissionPreference" AS ENUM ('YES_HAVE_TEMPLATE', 'YES_NEED_HELP_FROM_PLS', 'NO_PRICING_ONLY');

-- CreateEnum
CREATE TYPE "LegalIdentityDocType" AS ENUM ('PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE', 'UTILITY_BILL');

-- CreateEnum
CREATE TYPE "LegalTaxDocType" AS ENUM ('W9', 'W8BEN');

-- DropForeignKey
ALTER TABLE "Feature" DROP CONSTRAINT "Feature_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "Industry" DROP CONSTRAINT "Industry_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "LegalAgreements" DROP CONSTRAINT "LegalAgreements_identityVerificationId_fkey";

-- DropForeignKey
ALTER TABLE "LegalAgreements" DROP CONSTRAINT "LegalAgreements_workAuthorizationId_fkey";

-- DropForeignKey
ALTER TABLE "Milestone" DROP CONSTRAINT "Milestone_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_availabilityWorkflowId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_certificationsId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_coreRoleId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_domainExperienceId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_eliteSkillCardsId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_industryExperienceId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_legalAgreementsId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_projectQuotingId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_softSkillsId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_toolstackProficiencyId_fkey";

-- DropForeignKey
ALTER TABLE "Profile" DROP CONSTRAINT "Profile_whoYouAreId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_clientWhoPostedThisProjectForeignId_fkey";

-- DropForeignKey
ALTER TABLE "ProjectRequest" DROP CONSTRAINT "ProjectRequest_userId_fkey";

-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "Technology" DROP CONSTRAINT "Technology_submissionId_fkey";

-- DropForeignKey
ALTER TABLE "_InterestedFreelancers" DROP CONSTRAINT "_InterestedFreelancers_A_fkey";

-- DropForeignKey
ALTER TABLE "_InterestedFreelancers" DROP CONSTRAINT "_InterestedFreelancers_B_fkey";

-- DropForeignKey
ALTER TABLE "_InterestedProjectBuilderFreelancers" DROP CONSTRAINT "_InterestedProjectBuilderFreelancers_A_fkey";

-- DropForeignKey
ALTER TABLE "_InterestedProjectBuilderFreelancers" DROP CONSTRAINT "_InterestedProjectBuilderFreelancers_B_fkey";

-- DropForeignKey
ALTER TABLE "_SelectedFreelancers" DROP CONSTRAINT "_SelectedFreelancers_A_fkey";

-- DropForeignKey
ALTER TABLE "_SelectedFreelancers" DROP CONSTRAINT "_SelectedFreelancers_B_fkey";

-- DropForeignKey
ALTER TABLE "_SelectedProjectBuilderFreelancers" DROP CONSTRAINT "_SelectedProjectBuilderFreelancers_A_fkey";

-- DropForeignKey
ALTER TABLE "_SelectedProjectBuilderFreelancers" DROP CONSTRAINT "_SelectedProjectBuilderFreelancers_B_fkey";

-- DropIndex
DROP INDEX "LegalAgreements_identityVerificationId_key";

-- DropIndex
DROP INDEX "LegalAgreements_workAuthorizationId_key";

-- DropIndex
DROP INDEX "Milestone_createdAt_idx";

-- DropIndex
DROP INDEX "Milestone_id_idx";

-- DropIndex
DROP INDEX "Milestone_mileStoneName_idx";

-- DropIndex
DROP INDEX "Milestone_mileStoneName_key";

-- DropIndex
DROP INDEX "Milestone_priorityRank_idx";

-- DropIndex
DROP INDEX "Milestone_progress_idx";

-- DropIndex
DROP INDEX "Project_clientWhoPostedThisProjectForeignId_idx";

-- DropIndex
DROP INDEX "Project_deadline_idx";

-- DropIndex
DROP INDEX "Project_difficultyLevel_idx";

-- DropIndex
DROP INDEX "Project_id_idx";

-- DropIndex
DROP INDEX "Project_progressPercentage_idx";

-- DropIndex
DROP INDEX "Project_projectSlug_key";

-- DropIndex
DROP INDEX "Project_title_idx";

-- DropIndex
DROP INDEX "Project_title_key";

-- DropIndex
DROP INDEX "Project_trashedAt_idx";

-- DropIndex
DROP INDEX "Project_trashedBy_idx";

-- AlterTable
ALTER TABLE "LegalAgreements" DROP COLUMN "agreements",
DROP COLUMN "identityVerificationId",
DROP COLUMN "workAuthorizationId",
ADD COLUMN     "codeOfConductAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "codeOfConductUrl" VARCHAR(2048) NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "finalCertificationAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "finalCertificationAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "freelancerId" TEXT NOT NULL,
ADD COLUMN     "identityDocType" "LegalIdentityDocType",
ADD COLUMN     "identityDocUrl" VARCHAR(2048),
ADD COLUMN     "interestedInWorkAuthorization" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "ipAddress" VARCHAR(45),
ADD COLUMN     "locale" VARCHAR(35),
ADD COLUMN     "nonSolicitationAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nonSolicitationUrl" VARCHAR(2048) NOT NULL,
ADD COLUMN     "paymentTermsAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentTermsUrl" VARCHAR(2048) NOT NULL,
ADD COLUMN     "projectIpBoundariesAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "projectIpBoundariesUrl" VARCHAR(2048) NOT NULL,
ADD COLUMN     "projectScopeDeliverablesAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "projectScopeDeliverablesUrl" VARCHAR(2048) NOT NULL,
ADD COLUMN     "projectSpecificNdaAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "projectSpecificNdaUrl" VARCHAR(2048) NOT NULL,
ADD COLUMN     "proofOfAddressProvided" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "proofOfAddressUrl" VARCHAR(2048),
ADD COLUMN     "securityComplianceAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "securityComplianceUrl" VARCHAR(2048),
ADD COLUMN     "taxDocType" "LegalTaxDocType",
ADD COLUMN     "taxDocUrl" VARCHAR(2048),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userAgent" TEXT,
ADD COLUMN     "workForHireAccepted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "workForHireUrl" VARCHAR(2048) NOT NULL;

-- AlterTable
ALTER TABLE "Milestone" DROP CONSTRAINT "Milestone_pkey",
DROP COLUMN "mileStoneName",
DROP COLUMN "priorityRank",
DROP COLUMN "totalProgressPoints",
ADD COLUMN     "actualCost" DECIMAL(18,2),
ADD COLUMN     "actualHours" INTEGER,
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedBy" TEXT,
ADD COLUMN     "assigneeEmail" TEXT,
ADD COLUMN     "assigneeName" TEXT,
ADD COLUMN     "blocked" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "blockerReason" TEXT,
ADD COLUMN     "budgetEstimate" DECIMAL(18,2),
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deliverableUrl" TEXT,
ADD COLUMN     "estimatedHours" INTEGER,
ADD COLUMN     "milestoneName" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "phase" "MilestonePhase",
ADD COLUMN     "priority" "MilestonePriority",
ADD COLUMN     "riskLevel" "MilestoneRiskLevel",
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "status" "MilestoneStatus" NOT NULL DEFAULT 'PLANNED',
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "projectId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Milestone_id_seq";

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "projectId" TEXT,
ADD COLUMN     "visitorId" TEXT;

-- AlterTable
ALTER TABLE "Project" DROP CONSTRAINT "Project_pkey",
DROP COLUMN "bounty",
DROP COLUMN "clientWhoPostedThisProjectForeignId",
DROP COLUMN "commentByClientAfterProjectCompletion",
DROP COLUMN "deadline",
DROP COLUMN "detail",
DROP COLUMN "difficultyLevel",
DROP COLUMN "isDeadlineNeedToBeExtend",
DROP COLUMN "niche",
DROP COLUMN "progressPercentage",
DROP COLUMN "projectCompletedOn",
DROP COLUMN "projectSlug",
DROP COLUMN "projectStatus",
DROP COLUMN "projectType",
DROP COLUMN "starsByClientAfterProjectCompletion",
DROP COLUMN "title",
DROP COLUMN "trashedAt",
DROP COLUMN "trashedBy",
ADD COLUMN     "clientId" TEXT NOT NULL,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "discordChatUrl" VARCHAR(2048),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "visitorId" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Project_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Project_id_seq";

-- AlterTable
ALTER TABLE "_InterestedFreelancers" DROP CONSTRAINT "_InterestedFreelancers_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE TEXT,
ADD CONSTRAINT "_InterestedFreelancers_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "_SelectedFreelancers" DROP CONSTRAINT "_SelectedFreelancers_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE TEXT,
ADD CONSTRAINT "_SelectedFreelancers_AB_pkey" PRIMARY KEY ("A", "B");

-- DropTable
DROP TABLE "AvailabilityWorkflow";

-- DropTable
DROP TABLE "Certifications";

-- DropTable
DROP TABLE "CoreRole";

-- DropTable
DROP TABLE "CreateServicesForQuote";

-- DropTable
DROP TABLE "DomainExperience";

-- DropTable
DROP TABLE "EliteSkillCards";

-- DropTable
DROP TABLE "Feature";

-- DropTable
DROP TABLE "FreeLancersRequest";

-- DropTable
DROP TABLE "IdentityVerification";

-- DropTable
DROP TABLE "Industry";

-- DropTable
DROP TABLE "IndustryExperience";

-- DropTable
DROP TABLE "NichesForFreelancers";

-- DropTable
DROP TABLE "Profile";

-- DropTable
DROP TABLE "ProjectBuilder";

-- DropTable
DROP TABLE "ProjectQuoting";

-- DropTable
DROP TABLE "ProjectRequest";

-- DropTable
DROP TABLE "Service";

-- DropTable
DROP TABLE "SoftSkills";

-- DropTable
DROP TABLE "Technology";

-- DropTable
DROP TABLE "ToolstackProficiency";

-- DropTable
DROP TABLE "Visitors";

-- DropTable
DROP TABLE "WhoYouAre";

-- DropTable
DROP TABLE "WorkAuthorization";

-- DropTable
DROP TABLE "_InterestedProjectBuilderFreelancers";

-- DropTable
DROP TABLE "_SelectedProjectBuilderFreelancers";

-- DropEnum
DROP TYPE "DIFFICULTY_LEVEL";

-- DropEnum
DROP TYPE "PROJECT_STATUS";

-- DropEnum
DROP TYPE "PROJECT_TYPE";

-- CreateTable
CREATE TABLE "Visitor" (
    "id" TEXT NOT NULL,
    "clientId" TEXT,
    "ipAddress" VARCHAR(45),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Visitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitorDetails" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "fullName" VARCHAR(200) NOT NULL,
    "businessEmail" VARCHAR(254) NOT NULL,
    "phoneNumber" VARCHAR(32),
    "companyName" VARCHAR(200) NOT NULL,
    "companyWebsite" VARCHAR(2048),
    "businessAddress" TEXT,
    "businessType" VARCHAR(200) NOT NULL,
    "referralSource" VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "VisitorDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitorService" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "name" "ServiceCategory" NOT NULL,
    "childServices" TEXT[],
    "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "VisitorService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitorIndustries" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "category" "IndustryCategory" NOT NULL,
    "subIndustries" "IndustrySubIndustry"[],
    "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "VisitorIndustries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitorTechnologies" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "category" "TechnologyCategory" NOT NULL,
    "technologies" "TechnologyItem"[],
    "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "VisitorTechnologies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitorFeatures" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "category" "FeatureCategory" NOT NULL,
    "features" "FeatureItem"[],
    "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "VisitorFeatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitorDiscount" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "type" "DiscountType" NOT NULL,
    "percent" SMALLINT NOT NULL,
    "notes" TEXT,
    "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "VisitorDiscount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitorTimeline" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "option" "TimelineOption" NOT NULL,
    "rushFeePercent" SMALLINT NOT NULL,
    "estimatedDays" SMALLINT NOT NULL,
    "description" TEXT,
    "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "VisitorTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitorEstimate" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "estimateAccepted" BOOLEAN NOT NULL DEFAULT false,
    "estimateFinalPriceMin" DECIMAL(18,2) NOT NULL,
    "estimateFinalPriceMax" DECIMAL(18,2) NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "VisitorEstimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisitorServiceAgreement" (
    "id" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
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

    CONSTRAINT "VisitorServiceAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectDetails" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "fullName" VARCHAR(200) NOT NULL,
    "businessEmail" VARCHAR(254) NOT NULL,
    "phoneNumber" VARCHAR(32),
    "companyName" VARCHAR(200) NOT NULL,
    "companyWebsite" VARCHAR(2048),
    "businessAddress" TEXT,
    "businessType" VARCHAR(200) NOT NULL,
    "referralSource" VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProjectDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectService" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" "ServiceCategory" NOT NULL,
    "childServices" TEXT[],
    "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProjectService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectIndustries" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "category" "IndustryCategory" NOT NULL,
    "subIndustries" "IndustrySubIndustry"[],
    "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProjectIndustries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectTechnologies" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "category" "TechnologyCategory" NOT NULL,
    "technologies" "TechnologyItem"[],
    "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProjectTechnologies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectFeatures" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "category" "FeatureCategory" NOT NULL,
    "features" "FeatureItem"[],
    "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProjectFeatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectDiscount" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" "DiscountType" NOT NULL,
    "percent" SMALLINT NOT NULL,
    "notes" TEXT,
    "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProjectDiscount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectTimeline" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "option" "TimelineOption" NOT NULL,
    "rushFeePercent" SMALLINT NOT NULL,
    "estimatedDays" SMALLINT NOT NULL,
    "description" TEXT,
    "selectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProjectTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectEstimate" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "estimateAccepted" BOOLEAN NOT NULL DEFAULT false,
    "estimateFinalPriceMin" DECIMAL(18,2) NOT NULL,
    "estimateFinalPriceMax" DECIMAL(18,2) NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProjectEstimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectServiceAgreement" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
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

    CONSTRAINT "ProjectServiceAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Freelancer" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Freelancer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreelancerAvailabilityWorkflow" (
    "id" TEXT NOT NULL,
    "freelancerId" TEXT NOT NULL,
    "weeklyCommitmentMinHours" SMALLINT NOT NULL,
    "weeklyCommitmentMaxHours" SMALLINT,
    "weeklyCommitmentIsPlus" BOOLEAN NOT NULL DEFAULT false,
    "timeZone" VARCHAR(100) NOT NULL,
    "workingWindows" "AvailabilityWindow"[],
    "collaborationTools" "CollaborationTool"[],
    "preferredTeamStyle" "PreferredTeamStyle" NOT NULL,
    "liveScreenSharingPreference" "LiveScreenSharingPreference" NOT NULL,
    "liveScreenSharingNotes" TEXT,
    "shortTermAvailabilityExceptions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FreelancerAvailabilityWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreelancerDetails" (
    "id" TEXT NOT NULL,
    "freelancerId" TEXT NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "fullName" VARCHAR(200) NOT NULL,
    "professionalLinks" TEXT[],
    "timeZone" VARCHAR(100) NOT NULL,
    "eliteSkillCards" TEXT[],
    "tools" "ToolstackItem"[],
    "otherNote" TEXT,
    "selectedIndustries" "FreelancerIndustry"[],
    "primaryDomain" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FreelancerDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreelancerDomainExperience" (
    "id" TEXT NOT NULL,
    "freelancerId" TEXT NOT NULL,
    "roleTitle" VARCHAR(200) NOT NULL,
    "years" SMALLINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FreelancerDomainExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreelancerSoftSkills" (
    "id" TEXT NOT NULL,
    "freelancerId" TEXT NOT NULL,
    "preferredCollaborationStyle" "PreferredCollaborationStyle" NOT NULL,
    "communicationFrequency" "CommunicationFrequencyPreference" NOT NULL,
    "conflictResolutionStyle" "ConflictResolutionStyle" NOT NULL,
    "languages" "LanguageFluency"[],
    "otherLanguage" VARCHAR(100),
    "teamVsSoloPreference" "TeamVsSoloPreference" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FreelancerSoftSkills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreelancerCertification" (
    "id" TEXT NOT NULL,
    "freelancerId" TEXT NOT NULL,
    "certificateName" VARCHAR(200) NOT NULL,
    "certificateUrl" VARCHAR(2048) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FreelancerCertification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FreelancerProjectBidding" (
    "id" TEXT NOT NULL,
    "freelancerId" TEXT NOT NULL,
    "compensationPreference" "ProjectCompensationPreference" NOT NULL,
    "smallProjectMin" DECIMAL(18,2),
    "smallProjectMax" DECIMAL(18,2),
    "midProjectMin" DECIMAL(18,2),
    "midProjectMax" DECIMAL(18,2),
    "longTermMin" DECIMAL(18,2),
    "longTermMax" DECIMAL(18,2),
    "milestonePaymentTerms" "MilestonePaymentTerms" NOT NULL,
    "customPaymentTerms" TEXT,
    "proposalSubmission" "ProposalSubmissionPreference" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FreelancerProjectBidding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Visitor_clientId_idx" ON "Visitor"("clientId");

-- CreateIndex
CREATE INDEX "Visitor_createdAt_idx" ON "Visitor"("createdAt");

-- CreateIndex
CREATE INDEX "Visitor_deletedAt_idx" ON "Visitor"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "VisitorDetails_visitorId_key" ON "VisitorDetails"("visitorId");

-- CreateIndex
CREATE INDEX "VisitorDetails_businessEmail_idx" ON "VisitorDetails"("businessEmail");

-- CreateIndex
CREATE INDEX "VisitorDetails_phoneNumber_idx" ON "VisitorDetails"("phoneNumber");

-- CreateIndex
CREATE INDEX "VisitorDetails_companyName_idx" ON "VisitorDetails"("companyName");

-- CreateIndex
CREATE INDEX "VisitorService_visitorId_idx" ON "VisitorService"("visitorId");

-- CreateIndex
CREATE INDEX "VisitorService_deletedAt_idx" ON "VisitorService"("deletedAt");

-- CreateIndex
CREATE INDEX "VisitorIndustries_visitorId_idx" ON "VisitorIndustries"("visitorId");

-- CreateIndex
CREATE INDEX "VisitorIndustries_deletedAt_idx" ON "VisitorIndustries"("deletedAt");

-- CreateIndex
CREATE INDEX "VisitorIndustries_category_idx" ON "VisitorIndustries"("category");

-- CreateIndex
CREATE INDEX "VisitorTechnologies_visitorId_idx" ON "VisitorTechnologies"("visitorId");

-- CreateIndex
CREATE INDEX "VisitorTechnologies_deletedAt_idx" ON "VisitorTechnologies"("deletedAt");

-- CreateIndex
CREATE INDEX "VisitorTechnologies_category_idx" ON "VisitorTechnologies"("category");

-- CreateIndex
CREATE UNIQUE INDEX "VisitorTechnologies_visitorId_category_key" ON "VisitorTechnologies"("visitorId", "category");

-- CreateIndex
CREATE INDEX "VisitorFeatures_visitorId_idx" ON "VisitorFeatures"("visitorId");

-- CreateIndex
CREATE INDEX "VisitorFeatures_deletedAt_idx" ON "VisitorFeatures"("deletedAt");

-- CreateIndex
CREATE INDEX "VisitorFeatures_category_idx" ON "VisitorFeatures"("category");

-- CreateIndex
CREATE UNIQUE INDEX "VisitorFeatures_visitorId_category_key" ON "VisitorFeatures"("visitorId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "VisitorDiscount_visitorId_key" ON "VisitorDiscount"("visitorId");

-- CreateIndex
CREATE INDEX "VisitorDiscount_deletedAt_idx" ON "VisitorDiscount"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "VisitorTimeline_visitorId_key" ON "VisitorTimeline"("visitorId");

-- CreateIndex
CREATE INDEX "VisitorTimeline_deletedAt_idx" ON "VisitorTimeline"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "VisitorEstimate_visitorId_key" ON "VisitorEstimate"("visitorId");

-- CreateIndex
CREATE INDEX "VisitorEstimate_deletedAt_idx" ON "VisitorEstimate"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "VisitorServiceAgreement_visitorId_key" ON "VisitorServiceAgreement"("visitorId");

-- CreateIndex
CREATE INDEX "VisitorServiceAgreement_acceptedAt_idx" ON "VisitorServiceAgreement"("acceptedAt");

-- CreateIndex
CREATE INDEX "VisitorServiceAgreement_deletedAt_idx" ON "VisitorServiceAgreement"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectDetails_projectId_key" ON "ProjectDetails"("projectId");

-- CreateIndex
CREATE INDEX "ProjectDetails_businessEmail_idx" ON "ProjectDetails"("businessEmail");

-- CreateIndex
CREATE INDEX "ProjectDetails_phoneNumber_idx" ON "ProjectDetails"("phoneNumber");

-- CreateIndex
CREATE INDEX "ProjectDetails_companyName_idx" ON "ProjectDetails"("companyName");

-- CreateIndex
CREATE INDEX "ProjectService_projectId_idx" ON "ProjectService"("projectId");

-- CreateIndex
CREATE INDEX "ProjectService_deletedAt_idx" ON "ProjectService"("deletedAt");

-- CreateIndex
CREATE INDEX "ProjectIndustries_projectId_idx" ON "ProjectIndustries"("projectId");

-- CreateIndex
CREATE INDEX "ProjectIndustries_deletedAt_idx" ON "ProjectIndustries"("deletedAt");

-- CreateIndex
CREATE INDEX "ProjectIndustries_category_idx" ON "ProjectIndustries"("category");

-- CreateIndex
CREATE INDEX "ProjectTechnologies_projectId_idx" ON "ProjectTechnologies"("projectId");

-- CreateIndex
CREATE INDEX "ProjectTechnologies_deletedAt_idx" ON "ProjectTechnologies"("deletedAt");

-- CreateIndex
CREATE INDEX "ProjectTechnologies_category_idx" ON "ProjectTechnologies"("category");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectTechnologies_projectId_category_key" ON "ProjectTechnologies"("projectId", "category");

-- CreateIndex
CREATE INDEX "ProjectFeatures_projectId_idx" ON "ProjectFeatures"("projectId");

-- CreateIndex
CREATE INDEX "ProjectFeatures_deletedAt_idx" ON "ProjectFeatures"("deletedAt");

-- CreateIndex
CREATE INDEX "ProjectFeatures_category_idx" ON "ProjectFeatures"("category");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectFeatures_projectId_category_key" ON "ProjectFeatures"("projectId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectDiscount_projectId_key" ON "ProjectDiscount"("projectId");

-- CreateIndex
CREATE INDEX "ProjectDiscount_deletedAt_idx" ON "ProjectDiscount"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectTimeline_projectId_key" ON "ProjectTimeline"("projectId");

-- CreateIndex
CREATE INDEX "ProjectTimeline_deletedAt_idx" ON "ProjectTimeline"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectEstimate_projectId_key" ON "ProjectEstimate"("projectId");

-- CreateIndex
CREATE INDEX "ProjectEstimate_deletedAt_idx" ON "ProjectEstimate"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectServiceAgreement_projectId_key" ON "ProjectServiceAgreement"("projectId");

-- CreateIndex
CREATE INDEX "ProjectServiceAgreement_acceptedAt_idx" ON "ProjectServiceAgreement"("acceptedAt");

-- CreateIndex
CREATE INDEX "ProjectServiceAgreement_deletedAt_idx" ON "ProjectServiceAgreement"("deletedAt");

-- CreateIndex
CREATE INDEX "Freelancer_createdAt_idx" ON "Freelancer"("createdAt");

-- CreateIndex
CREATE INDEX "Freelancer_deletedAt_idx" ON "Freelancer"("deletedAt");

-- CreateIndex
CREATE INDEX "FreelancerAvailabilityWorkflow_preferredTeamStyle_idx" ON "FreelancerAvailabilityWorkflow"("preferredTeamStyle");

-- CreateIndex
CREATE INDEX "FreelancerAvailabilityWorkflow_liveScreenSharingPreference_idx" ON "FreelancerAvailabilityWorkflow"("liveScreenSharingPreference");

-- CreateIndex
CREATE INDEX "FreelancerAvailabilityWorkflow_deletedAt_idx" ON "FreelancerAvailabilityWorkflow"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "FreelancerAvailabilityWorkflow_freelancerId_key" ON "FreelancerAvailabilityWorkflow"("freelancerId");

-- CreateIndex
CREATE UNIQUE INDEX "FreelancerDetails_freelancerId_key" ON "FreelancerDetails"("freelancerId");

-- CreateIndex
CREATE INDEX "FreelancerDetails_email_idx" ON "FreelancerDetails"("email");

-- CreateIndex
CREATE INDEX "FreelancerDetails_country_idx" ON "FreelancerDetails"("country");

-- CreateIndex
CREATE INDEX "FreelancerDetails_deletedAt_idx" ON "FreelancerDetails"("deletedAt");

-- CreateIndex
CREATE INDEX "FreelancerDomainExperience_freelancerId_idx" ON "FreelancerDomainExperience"("freelancerId");

-- CreateIndex
CREATE INDEX "FreelancerDomainExperience_roleTitle_idx" ON "FreelancerDomainExperience"("roleTitle");

-- CreateIndex
CREATE INDEX "FreelancerDomainExperience_deletedAt_idx" ON "FreelancerDomainExperience"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "FreelancerSoftSkills_freelancerId_key" ON "FreelancerSoftSkills"("freelancerId");

-- CreateIndex
CREATE INDEX "FreelancerSoftSkills_deletedAt_idx" ON "FreelancerSoftSkills"("deletedAt");

-- CreateIndex
CREATE INDEX "FreelancerCertification_freelancerId_idx" ON "FreelancerCertification"("freelancerId");

-- CreateIndex
CREATE INDEX "FreelancerCertification_deletedAt_idx" ON "FreelancerCertification"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "FreelancerCertification_freelancerId_certificateName_key" ON "FreelancerCertification"("freelancerId", "certificateName");

-- CreateIndex
CREATE UNIQUE INDEX "FreelancerProjectBidding_freelancerId_key" ON "FreelancerProjectBidding"("freelancerId");

-- CreateIndex
CREATE INDEX "FreelancerProjectBidding_deletedAt_idx" ON "FreelancerProjectBidding"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "LegalAgreements_freelancerId_key" ON "LegalAgreements"("freelancerId");

-- CreateIndex
CREATE INDEX "LegalAgreements_deletedAt_idx" ON "LegalAgreements"("deletedAt");

-- CreateIndex
CREATE INDEX "Milestone_status_idx" ON "Milestone"("status");

-- CreateIndex
CREATE INDEX "Milestone_deletedAt_idx" ON "Milestone"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Milestone_projectId_milestoneName_key" ON "Milestone"("projectId", "milestoneName");

-- CreateIndex
CREATE INDEX "Payment_projectId_idx" ON "Payment"("projectId");

-- CreateIndex
CREATE INDEX "Payment_visitorId_idx" ON "Payment"("visitorId");

-- CreateIndex
CREATE INDEX "Project_clientId_idx" ON "Project"("clientId");

-- CreateIndex
CREATE INDEX "Project_visitorId_idx" ON "Project"("visitorId");

-- CreateIndex
CREATE INDEX "Project_deletedAt_idx" ON "Project"("deletedAt");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visitor" ADD CONSTRAINT "Visitor_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitorDetails" ADD CONSTRAINT "VisitorDetails_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitorService" ADD CONSTRAINT "VisitorService_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitorIndustries" ADD CONSTRAINT "VisitorIndustries_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitorTechnologies" ADD CONSTRAINT "VisitorTechnologies_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitorFeatures" ADD CONSTRAINT "VisitorFeatures_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitorDiscount" ADD CONSTRAINT "VisitorDiscount_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitorTimeline" ADD CONSTRAINT "VisitorTimeline_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitorEstimate" ADD CONSTRAINT "VisitorEstimate_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitorServiceAgreement" ADD CONSTRAINT "VisitorServiceAgreement_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("uid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "Visitor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDetails" ADD CONSTRAINT "ProjectDetails_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectService" ADD CONSTRAINT "ProjectService_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectIndustries" ADD CONSTRAINT "ProjectIndustries_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTechnologies" ADD CONSTRAINT "ProjectTechnologies_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectFeatures" ADD CONSTRAINT "ProjectFeatures_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDiscount" ADD CONSTRAINT "ProjectDiscount_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTimeline" ADD CONSTRAINT "ProjectTimeline_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectEstimate" ADD CONSTRAINT "ProjectEstimate_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectServiceAgreement" ADD CONSTRAINT "ProjectServiceAgreement_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreelancerAvailabilityWorkflow" ADD CONSTRAINT "FreelancerAvailabilityWorkflow_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreelancerDetails" ADD CONSTRAINT "FreelancerDetails_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreelancerDomainExperience" ADD CONSTRAINT "FreelancerDomainExperience_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreelancerSoftSkills" ADD CONSTRAINT "FreelancerSoftSkills_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreelancerCertification" ADD CONSTRAINT "FreelancerCertification_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FreelancerProjectBidding" ADD CONSTRAINT "FreelancerProjectBidding_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LegalAgreements" ADD CONSTRAINT "LegalAgreements_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InterestedFreelancers" ADD CONSTRAINT "_InterestedFreelancers_A_fkey" FOREIGN KEY ("A") REFERENCES "Freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InterestedFreelancers" ADD CONSTRAINT "_InterestedFreelancers_B_fkey" FOREIGN KEY ("B") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SelectedFreelancers" ADD CONSTRAINT "_SelectedFreelancers_A_fkey" FOREIGN KEY ("A") REFERENCES "Freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SelectedFreelancers" ADD CONSTRAINT "_SelectedFreelancers_B_fkey" FOREIGN KEY ("B") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
