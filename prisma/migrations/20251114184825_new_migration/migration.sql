-- DropIndex
DROP INDEX "FreelancerBid_freelancerId_projectId_key";

-- DropIndex
DROP INDEX "blogposts_blogBody_idx";

-- CreateIndex
CREATE INDEX "FreelancerBid_freelancerId_projectId_idx" ON "FreelancerBid"("freelancerId", "projectId");
