-- Custom script to clear specific data
-- Run this with: psql -d your_database -f scripts/clear-data.sql

-- Clear all data from all tables (in correct order to respect foreign keys)
TRUNCATE TABLE "RateLimiterFlexible" CASCADE;
TRUNCATE TABLE "Payment" CASCADE;
TRUNCATE TABLE "Visitors" CASCADE;
TRUNCATE TABLE "ProjectBuilder" CASCADE;
TRUNCATE TABLE "Feature" CASCADE;
TRUNCATE TABLE "Technology" CASCADE;
TRUNCATE TABLE "Industry" CASCADE;
TRUNCATE TABLE "Service" CASCADE;
TRUNCATE TABLE "WorkAuthorization" CASCADE;
TRUNCATE TABLE "IdentityVerification" CASCADE;
TRUNCATE TABLE "LegalAgreements" CASCADE;
TRUNCATE TABLE "ProjectQuoting" CASCADE;
TRUNCATE TABLE "Certifications" CASCADE;
TRUNCATE TABLE "SoftSkills" CASCADE;
TRUNCATE TABLE "AvailabilityWorkflow" CASCADE;
TRUNCATE TABLE "IndustryExperience" CASCADE;
TRUNCATE TABLE "DomainExperience" CASCADE;
TRUNCATE TABLE "ToolstackProficiency" CASCADE;
TRUNCATE TABLE "EliteSkillCards" CASCADE;
TRUNCATE TABLE "CoreRole" CASCADE;
TRUNCATE TABLE "WhoYouAre" CASCADE;
TRUNCATE TABLE "Profile" CASCADE;
TRUNCATE TABLE "BlogPost" CASCADE;
TRUNCATE TABLE "NichesForFreelancers" CASCADE;
TRUNCATE TABLE "FreeLancersRequest" CASCADE;
TRUNCATE TABLE "HireUs" CASCADE;
TRUNCATE TABLE "ConsultationBooking" CASCADE;
TRUNCATE TABLE "CreateServicesForQuote" CASCADE;
TRUNCATE TABLE "GetQuote" CASCADE;
TRUNCATE TABLE "MenuItem" CASCADE;
TRUNCATE TABLE "Newsletter" CASCADE;
TRUNCATE TABLE "ContactUs" CASCADE;
TRUNCATE TABLE "Milestone" CASCADE;
TRUNCATE TABLE "Project" CASCADE;
TRUNCATE TABLE "User" CASCADE;

-- Reset sequences (if using auto-increment)
-- Note: PostgreSQL doesn't use sequences for most of these tables, but if you have any, uncomment:
-- ALTER SEQUENCE "Project_id_seq" RESTART WITH 1;
-- ALTER SEQUENCE "Milestone_id_seq" RESTART WITH 1;

-- Optional: Keep admin users (uncomment and modify as needed)
-- INSERT INTO "User" (uid, username, "fullName", email, password, role, "emailVerifiedAt", "createdAt", "updatedAt")
-- VALUES ('admin-uid', 'admin', 'Admin User', 'admin@example.com', '$2b$10$hashedpassword', 'ADMIN', NOW(), NOW(), NOW());

COMMIT;


