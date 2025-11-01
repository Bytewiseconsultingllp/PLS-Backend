import { z } from "zod";

// ============================================
// ENUM SCHEMAS
// ============================================

export const FreelancerStatusSchema = z.enum([
  "PENDING_REVIEW",
  "ACCEPTED",
  "REJECTED",
]);

export const BidStatusSchema = z.enum([
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
]);

export const AvailabilityWindowSchema = z.enum([
  "EIGHT_AM_TO_TWELVE_PM",
  "TWELVE_PM_TO_FOUR_PM",
  "FOUR_PM_TO_EIGHT_PM",
  "EIGHT_PM_TO_TWELVE_AM",
  "TWELVE_AM_TO_SIX_AM",
]);

export const CollaborationToolSchema = z.enum([
  "SLACK",
  "NOTION",
  "GITHUB",
  "JIRA",
  "ZOOM",
  "GOOGLE_MEET",
  "DISCORD",
  "TRELLO",
  "ASANA",
  "FIGMA",
  "MIRO",
]);

export const PreferredTeamStyleSchema = z.enum([
  "ASYNC_ONLY",
  "SCHEDULED_STANDUPS",
  "REAL_TIME_RESPONSIVE",
]);

export const LiveScreenSharingPreferenceSchema = z.enum([
  "YES_COMFORTABLE",
  "YES_SPECIFIC_HOURS",
  "NO_OFFLINE_ASYNC",
]);

export const ToolstackItemSchema = z.enum([
  "PROJECT_MANAGEMENT",
  "COMMUNICATION",
  "DOCUMENTATION",
  "DESIGN",
  "PRODUCTIVITY",
  "VERSION_CONTROL",
  "ANALYTICS",
  "CRM",
  "OTHER",
  "JIRA",
  "ASANA",
  "TRELLO",
  "MONDAY_COM",
  "CLICKUP",
  "SLACK",
  "MICROSOFT_TEAMS",
  "DISCORD",
  "ZOOM",
  "GOOGLE_MEET",
  "NOTION",
  "CONFLUENCE",
  "GOOGLE_DOCS",
  "CODA",
  "OBSIDIAN",
  "FIGMA",
  "ADOBE_CREATIVE_SUITE",
  "CANVA",
  "SKETCH",
  "MIRO",
  "TODOIST",
  "EVERNOTE",
  "ROAM_RESEARCH",
  "GIT",
  "GITHUB",
  "GITLAB",
  "BITBUCKET",
  "AZURE_DEVOPS",
  "GOOGLE_ANALYTICS",
  "MIXPANEL",
  "AMPLITUDE",
  "HOTJAR",
  "LOOKER",
  "SALESFORCE",
  "HUBSPOT",
  "ZOHO",
  "PIPEDRIVE",
  "MONDAY_SALES_CRM",
]);

export const FreelancerIndustrySchema = z.enum([
  "FINTECH",
  "HEALTHTECH",
  "GOVTECH_FEMA_DEFENSE",
  "E_COMMERCE",
  "SAAS_B2B_B2C",
  "EDTECH",
  "AI_AND_MACHINE_LEARNING",
  "REAL_ESTATE_PROPTECH",
  "BLOCKCHAIN_WEB3",
  "MEDIA_PUBLISHING",
  "CLIMATETECH_ENERGY",
  "MANUFACTURING_IOT",
  "LEGALTECH",
  "NGOS_NONPROFITS",
  "MARKETING_ADTECH",
  "TRANSPORTATION_LOGISTICS",
  "TRAVEL_HOSPITALITY",
  "SPORTSTECH_GAMING",
]);

export const PreferredCollaborationStyleSchema = z.enum([
  "AGILE_SCRUM",
  "ASYNC_DOCUMENT_FIRST",
  "STRUCTURED_PROCESS_ORIENTED",
  "FLEXIBLE_CONTEXT_DRIVEN",
]);

export const CommunicationFrequencyPreferenceSchema = z.enum([
  "DAILY_CHECK_INS",
  "WEEKLY_MILESTONE_REVIEWS",
  "AD_HOC_ONLY",
  "ADAPT_TO_PREFERENCE",
]);

export const ConflictResolutionStyleSchema = z.enum([
  "DIRECT_CLEAR",
  "EMPATHIC_REFLECTIVE",
  "NEUTRAL_SYSTEMIC",
  "ADAPTIVE",
]);

export const LanguageFluencySchema = z.enum([
  "ENGLISH",
  "HINDI_URDU",
  "SPANISH",
  "ARABIC",
  "MANDARIN",
  "FRENCH",
  "GERMAN",
  "KASHMIRI",
]);

export const TeamVsSoloPreferenceSchema = z.enum([
  "INDEPENDENT",
  "TEAM_ORIENTED",
  "FLEXIBLE_BOTH",
]);

export const ProjectCompensationPreferenceSchema = z.enum([
  "FIXED_PRICE",
  "OPEN_TO_BIDDING",
  "HOURLY_OR_RETAINER_ONLY",
]);

export const MilestonePaymentTermsSchema = z.enum([
  "FIFTY_FIFTY",
  "THIRTY_FORTY_THIRTY",
  "CUSTOM",
]);

export const ProposalSubmissionPreferenceSchema = z.enum([
  "YES_HAVE_TEMPLATE",
  "YES_NEED_HELP_FROM_PLS",
  "NO_PRICING_ONLY",
]);

export const LegalIdentityDocTypeSchema = z.enum([
  "PASSPORT",
  "NATIONAL_ID",
  "DRIVERS_LICENSE",
  "UTILITY_BILL",
]);

export const LegalTaxDocTypeSchema = z.enum(["W9", "W8BEN"]);

// ============================================
// SUB-MODEL SCHEMAS
// ============================================

export const FreelancerDetailsSchema = z.object({
  country: z.string().min(1).max(100),
  email: z.string().email().max(254),
  fullName: z.string().min(1).max(200),
  professionalLinks: z.array(z.string().url()).optional().default([]),
  timeZone: z.string().min(1).max(100),
  eliteSkillCards: z.array(z.string()).optional().default([]),
  tools: z.array(ToolstackItemSchema).optional().default([]),
  otherNote: z.string().optional(),
  selectedIndustries: z.array(FreelancerIndustrySchema).optional().default([]),
  primaryDomain: z.string().min(1).max(100),
});

export const FreelancerAvailabilityWorkflowSchema = z.object({
  weeklyCommitmentMinHours: z.number().int().min(0).max(168),
  weeklyCommitmentMaxHours: z.number().int().min(0).max(168).optional(),
  weeklyCommitmentIsPlus: z.boolean().optional().default(false),
  timeZone: z.string().min(1).max(100),
  workingWindows: z.array(AvailabilityWindowSchema).min(1),
  collaborationTools: z.array(CollaborationToolSchema).min(1),
  preferredTeamStyle: PreferredTeamStyleSchema,
  liveScreenSharingPreference: LiveScreenSharingPreferenceSchema,
  liveScreenSharingNotes: z.string().optional(),
  shortTermAvailabilityExceptions: z.string().optional(),
});

export const FreelancerDomainExperienceSchema = z.object({
  roleTitle: z.string().min(1).max(200),
  years: z.number().int().min(0).max(100),
});

export const FreelancerSoftSkillsSchema = z.object({
  preferredCollaborationStyle: PreferredCollaborationStyleSchema,
  communicationFrequency: CommunicationFrequencyPreferenceSchema,
  conflictResolutionStyle: ConflictResolutionStyleSchema,
  languages: z.array(LanguageFluencySchema).min(1),
  otherLanguage: z.string().max(100).optional(),
  teamVsSoloPreference: TeamVsSoloPreferenceSchema,
});

export const FreelancerCertificationSchema = z.object({
  certificateName: z.string().min(1).max(200),
  certificateUrl: z.string().url().max(2048),
});

export const FreelancerProjectBiddingSchema = z.object({
  compensationPreference: ProjectCompensationPreferenceSchema,
  smallProjectMin: z.number().optional(),
  smallProjectMax: z.number().optional(),
  midProjectMin: z.number().optional(),
  midProjectMax: z.number().optional(),
  longTermMin: z.number().optional(),
  longTermMax: z.number().optional(),
  milestonePaymentTerms: MilestonePaymentTermsSchema,
  customPaymentTerms: z.string().optional(),
  proposalSubmission: ProposalSubmissionPreferenceSchema,
});

export const LegalAgreementsSchema = z.object({
  projectSpecificNdaAccepted: z.boolean(),
  projectSpecificNdaUrl: z.string().url().max(2048),
  workForHireAccepted: z.boolean(),
  workForHireUrl: z.string().url().max(2048),
  projectScopeDeliverablesAccepted: z.boolean(),
  projectScopeDeliverablesUrl: z.string().url().max(2048),
  paymentTermsAccepted: z.boolean(),
  paymentTermsUrl: z.string().url().max(2048),
  securityComplianceAccepted: z.boolean(),
  securityComplianceUrl: z.string().url().max(2048).optional(),
  nonSolicitationAccepted: z.boolean(),
  nonSolicitationUrl: z.string().url().max(2048),
  codeOfConductAccepted: z.boolean(),
  codeOfConductUrl: z.string().url().max(2048),
  projectIpBoundariesAccepted: z.boolean(),
  projectIpBoundariesUrl: z.string().url().max(2048),
  identityDocType: LegalIdentityDocTypeSchema.optional(),
  identityDocUrl: z.string().url().max(2048).optional(),
  taxDocType: LegalTaxDocTypeSchema.optional(),
  taxDocUrl: z.string().url().max(2048).optional(),
  proofOfAddressProvided: z.boolean().optional().default(false),
  proofOfAddressUrl: z.string().url().max(2048).optional(),
  interestedInWorkAuthorization: z.boolean().optional().default(false),
  finalCertificationAccepted: z.boolean(),
  ipAddress: z.string().max(45).optional(),
  userAgent: z.string().optional(),
  locale: z.string().max(35).optional(),
});

// ============================================
// MAIN FREELANCER REGISTRATION SCHEMA
// ============================================

export const FreelancerRegistrationSchema = z.object({
  details: FreelancerDetailsSchema,
  availabilityWorkflow: FreelancerAvailabilityWorkflowSchema,
  domainExperiences: z.array(FreelancerDomainExperienceSchema).min(1),
  softSkills: FreelancerSoftSkillsSchema,
  certifications: z.array(FreelancerCertificationSchema).optional().default([]),
  projectBidding: FreelancerProjectBiddingSchema,
  legalAgreements: LegalAgreementsSchema,
});

// ============================================
// FREELANCER BID SCHEMAS
// ============================================

export const CreateFreelancerBidSchema = z.object({
  projectId: z.string().uuid(),
  bidAmount: z.number().positive(),
  proposalText: z.string().optional(),
});

export const UpdateBidStatusSchema = z.object({
  status: BidStatusSchema,
  rejectionReason: z.string().optional(),
});

// ============================================
// ADMIN FREELANCER REVIEW SCHEMAS
// ============================================

export const ReviewFreelancerSchema = z.object({
  action: z.enum(["ACCEPT", "REJECT"]),
  rejectionReason: z.string().optional(),
  userId: z.string().optional(), // If accepting, optionally provide userId
});

export const ReviewBidSchema = z.object({
  action: z.enum(["ACCEPT", "REJECT"]),
  rejectionReason: z.string().optional(),
});

// ============================================
// QUERY SCHEMAS
// ============================================

export const GetFreelancersQuerySchema = z.object({
  status: FreelancerStatusSchema.optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().optional(),
});

export const GetBidsQuerySchema = z.object({
  projectId: z.string().uuid().optional(),
  status: BidStatusSchema.optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),
});

// ============================================
// TYPE EXPORTS
// ============================================

export type FreelancerRegistrationInput = z.infer<
  typeof FreelancerRegistrationSchema
>;
export type FreelancerDetailsInput = z.infer<typeof FreelancerDetailsSchema>;
export type FreelancerAvailabilityWorkflowInput = z.infer<
  typeof FreelancerAvailabilityWorkflowSchema
>;
export type FreelancerDomainExperienceInput = z.infer<
  typeof FreelancerDomainExperienceSchema
>;
export type FreelancerSoftSkillsInput = z.infer<
  typeof FreelancerSoftSkillsSchema
>;
export type FreelancerCertificationInput = z.infer<
  typeof FreelancerCertificationSchema
>;
export type FreelancerProjectBiddingInput = z.infer<
  typeof FreelancerProjectBiddingSchema
>;
export type LegalAgreementsInput = z.infer<typeof LegalAgreementsSchema>;
export type CreateFreelancerBidInput = z.infer<
  typeof CreateFreelancerBidSchema
>;
export type UpdateBidStatusInput = z.infer<typeof UpdateBidStatusSchema>;
export type ReviewFreelancerInput = z.infer<typeof ReviewFreelancerSchema>;
export type ReviewBidInput = z.infer<typeof ReviewBidSchema>;
export type GetFreelancersQuery = z.infer<typeof GetFreelancersQuerySchema>;
export type GetBidsQuery = z.infer<typeof GetBidsQuerySchema>;
