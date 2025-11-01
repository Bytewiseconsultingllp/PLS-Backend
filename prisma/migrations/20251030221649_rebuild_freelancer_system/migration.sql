-- =====================================================
-- FREELANCER SYSTEM REBUILD MIGRATION
-- =====================================================

-- Step 1: Drop existing freelancer-related tables (in correct order to handle dependencies)
DROP TABLE IF EXISTS "LegalAgreements" CASCADE;
DROP TABLE IF EXISTS "FreelancerProjectBidding" CASCADE;
DROP TABLE IF EXISTS "FreelancerCertification" CASCADE;
DROP TABLE IF EXISTS "FreelancerSoftSkills" CASCADE;
DROP TABLE IF EXISTS "FreelancerDomainExperience" CASCADE;
DROP TABLE IF EXISTS "FreelancerDetails" CASCADE;
DROP TABLE IF EXISTS "FreelancerAvailabilityWorkflow" CASCADE;

-- Step 2: Drop the old many-to-many join tables
DROP TABLE IF EXISTS "_InterestedFreelancers" CASCADE;
DROP TABLE IF EXISTS "_SelectedFreelancers" CASCADE;

-- Step 3: Drop the Freelancer table
DROP TABLE IF EXISTS "Freelancer" CASCADE;

-- Step 4: Create new enums
CREATE TYPE "FreelancerStatus" AS ENUM ('PENDING_REVIEW', 'ACCEPTED', 'REJECTED');
CREATE TYPE "BidStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- Step 5: Create new Freelancer table with updated structure
CREATE TABLE "Freelancer" (
    "id" TEXT NOT NULL,
    "status" "FreelancerStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "userId" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "registrationEmailSent" BOOLEAN NOT NULL DEFAULT false,
    "acceptanceEmailSent" BOOLEAN NOT NULL DEFAULT false,
    "rejectionEmailSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Freelancer_pkey" PRIMARY KEY ("id")
);

-- Step 6: Create FreelancerBid table
CREATE TABLE "FreelancerBid" (
    "id" TEXT NOT NULL,
    "freelancerId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "bidAmount" DECIMAL(18,2) NOT NULL,
    "proposalText" TEXT,
    "status" "BidStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "reviewedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FreelancerBid_pkey" PRIMARY KEY ("id")
);

-- Step 7: Create FreelancerAvailabilityWorkflow table
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

-- Step 8: Create FreelancerDetails table
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

-- Step 9: Create FreelancerDomainExperience table
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

-- Step 10: Create FreelancerSoftSkills table
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

-- Step 11: Create FreelancerCertification table
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

-- Step 12: Create FreelancerProjectBidding table
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

-- Step 13: Create LegalAgreements table
CREATE TABLE "LegalAgreements" (
    "id" TEXT NOT NULL,
    "freelancerId" TEXT NOT NULL,
    "projectSpecificNdaAccepted" BOOLEAN NOT NULL DEFAULT false,
    "projectSpecificNdaUrl" VARCHAR(2048) NOT NULL,
    "workForHireAccepted" BOOLEAN NOT NULL DEFAULT false,
    "workForHireUrl" VARCHAR(2048) NOT NULL,
    "projectScopeDeliverablesAccepted" BOOLEAN NOT NULL DEFAULT false,
    "projectScopeDeliverablesUrl" VARCHAR(2048) NOT NULL,
    "paymentTermsAccepted" BOOLEAN NOT NULL DEFAULT false,
    "paymentTermsUrl" VARCHAR(2048) NOT NULL,
    "securityComplianceAccepted" BOOLEAN NOT NULL DEFAULT false,
    "securityComplianceUrl" VARCHAR(2048),
    "nonSolicitationAccepted" BOOLEAN NOT NULL DEFAULT false,
    "nonSolicitationUrl" VARCHAR(2048) NOT NULL,
    "codeOfConductAccepted" BOOLEAN NOT NULL DEFAULT false,
    "codeOfConductUrl" VARCHAR(2048) NOT NULL,
    "projectIpBoundariesAccepted" BOOLEAN NOT NULL DEFAULT false,
    "projectIpBoundariesUrl" VARCHAR(2048) NOT NULL,
    "identityDocType" "LegalIdentityDocType",
    "identityDocUrl" VARCHAR(2048),
    "taxDocType" "LegalTaxDocType",
    "taxDocUrl" VARCHAR(2048),
    "proofOfAddressProvided" BOOLEAN NOT NULL DEFAULT false,
    "proofOfAddressUrl" VARCHAR(2048),
    "interestedInWorkAuthorization" BOOLEAN NOT NULL DEFAULT false,
    "finalCertificationAccepted" BOOLEAN NOT NULL DEFAULT false,
    "finalCertificationAcceptedAt" TIMESTAMP(3),
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "locale" VARCHAR(35),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "LegalAgreements_pkey" PRIMARY KEY ("id")
);

-- Step 14: Create new _SelectedFreelancers join table (many-to-many)
CREATE TABLE "_SelectedFreelancers" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- Step 15: Create unique constraints
CREATE UNIQUE INDEX "Freelancer_userId_key" ON "Freelancer"("userId");
CREATE UNIQUE INDEX "FreelancerBid_freelancerId_projectId_key" ON "FreelancerBid"("freelancerId", "projectId");
CREATE UNIQUE INDEX "FreelancerAvailabilityWorkflow_freelancerId_key" ON "FreelancerAvailabilityWorkflow"("freelancerId");
CREATE UNIQUE INDEX "FreelancerDetails_freelancerId_key" ON "FreelancerDetails"("freelancerId");
CREATE UNIQUE INDEX "FreelancerSoftSkills_freelancerId_key" ON "FreelancerSoftSkills"("freelancerId");
CREATE UNIQUE INDEX "FreelancerCertification_freelancerId_certificateName_key" ON "FreelancerCertification"("freelancerId", "certificateName");
CREATE UNIQUE INDEX "FreelancerProjectBidding_freelancerId_key" ON "FreelancerProjectBidding"("freelancerId");
CREATE UNIQUE INDEX "LegalAgreements_freelancerId_key" ON "LegalAgreements"("freelancerId");

-- Step 16: Create indexes for Freelancer table
CREATE INDEX "Freelancer_status_idx" ON "Freelancer"("status");
CREATE INDEX "Freelancer_userId_idx" ON "Freelancer"("userId");
CREATE INDEX "Freelancer_reviewedBy_idx" ON "Freelancer"("reviewedBy");
CREATE INDEX "Freelancer_createdAt_idx" ON "Freelancer"("createdAt");
CREATE INDEX "Freelancer_deletedAt_idx" ON "Freelancer"("deletedAt");

-- Step 17: Create indexes for FreelancerBid table
CREATE INDEX "FreelancerBid_freelancerId_idx" ON "FreelancerBid"("freelancerId");
CREATE INDEX "FreelancerBid_projectId_idx" ON "FreelancerBid"("projectId");
CREATE INDEX "FreelancerBid_status_idx" ON "FreelancerBid"("status");
CREATE INDEX "FreelancerBid_submittedAt_idx" ON "FreelancerBid"("submittedAt");
CREATE INDEX "FreelancerBid_deletedAt_idx" ON "FreelancerBid"("deletedAt");

-- Step 18: Create indexes for other freelancer tables
CREATE INDEX "FreelancerAvailabilityWorkflow_preferredTeamStyle_idx" ON "FreelancerAvailabilityWorkflow"("preferredTeamStyle");
CREATE INDEX "FreelancerAvailabilityWorkflow_liveScreenSharingPreference_idx" ON "FreelancerAvailabilityWorkflow"("liveScreenSharingPreference");
CREATE INDEX "FreelancerAvailabilityWorkflow_deletedAt_idx" ON "FreelancerAvailabilityWorkflow"("deletedAt");

CREATE INDEX "FreelancerDetails_email_idx" ON "FreelancerDetails"("email");
CREATE INDEX "FreelancerDetails_country_idx" ON "FreelancerDetails"("country");
CREATE INDEX "FreelancerDetails_deletedAt_idx" ON "FreelancerDetails"("deletedAt");

CREATE INDEX "FreelancerDomainExperience_freelancerId_idx" ON "FreelancerDomainExperience"("freelancerId");
CREATE INDEX "FreelancerDomainExperience_roleTitle_idx" ON "FreelancerDomainExperience"("roleTitle");
CREATE INDEX "FreelancerDomainExperience_deletedAt_idx" ON "FreelancerDomainExperience"("deletedAt");

CREATE INDEX "FreelancerSoftSkills_deletedAt_idx" ON "FreelancerSoftSkills"("deletedAt");

CREATE INDEX "FreelancerCertification_freelancerId_idx" ON "FreelancerCertification"("freelancerId");
CREATE INDEX "FreelancerCertification_deletedAt_idx" ON "FreelancerCertification"("deletedAt");

CREATE INDEX "FreelancerProjectBidding_deletedAt_idx" ON "FreelancerProjectBidding"("deletedAt");

CREATE INDEX "LegalAgreements_deletedAt_idx" ON "LegalAgreements"("deletedAt");

-- Step 19: Create indexes for _SelectedFreelancers join table
CREATE UNIQUE INDEX "_SelectedFreelancers_AB_unique" ON "_SelectedFreelancers"("A", "B");
CREATE INDEX "_SelectedFreelancers_B_index" ON "_SelectedFreelancers"("B");

-- Step 20: Add foreign key constraints
ALTER TABLE "Freelancer" ADD CONSTRAINT "Freelancer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("uid") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "FreelancerBid" ADD CONSTRAINT "FreelancerBid_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FreelancerBid" ADD CONSTRAINT "FreelancerBid_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FreelancerAvailabilityWorkflow" ADD CONSTRAINT "FreelancerAvailabilityWorkflow_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FreelancerDetails" ADD CONSTRAINT "FreelancerDetails_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FreelancerDomainExperience" ADD CONSTRAINT "FreelancerDomainExperience_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FreelancerSoftSkills" ADD CONSTRAINT "FreelancerSoftSkills_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FreelancerCertification" ADD CONSTRAINT "FreelancerCertification_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FreelancerProjectBidding" ADD CONSTRAINT "FreelancerProjectBidding_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "LegalAgreements" ADD CONSTRAINT "LegalAgreements_freelancerId_fkey" FOREIGN KEY ("freelancerId") REFERENCES "Freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_SelectedFreelancers" ADD CONSTRAINT "_SelectedFreelancers_A_fkey" FOREIGN KEY ("A") REFERENCES "Freelancer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_SelectedFreelancers" ADD CONSTRAINT "_SelectedFreelancers_B_fkey" FOREIGN KEY ("B") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

