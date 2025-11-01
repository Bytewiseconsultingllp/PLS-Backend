// Single line types
export type TENV = "DEVELOPMENT" | "PRODUCTION";

export type TROLE = "CLIENT" | "ADMIN" | "MODERATOR" | "FREELANCER";

export type TEXPIRESIN = "14m" | "1d" | "2d" | "3d" | "4d" | "5d" | "6d" | "7d";
// Multiline types
export type TPAYLOAD = {
  uid: string;
  tokenVersion: number;
  role: TROLE;
  isVerified: Date | null;
};

export type httpResponseType = {
  success: boolean;
  status: number;
  message: string;
  data: unknown;
  requestInfo: {
    ip?: string | null;
    url: string | null;
    method: string | null;
  };
};
export type TUSER = {
  uid: string;
  username: string;
  fullName: string;
  email: string;
  emailVerifiedAt: Date | null;
  role: TROLE;
  createdAt?: Date;
  updatedAt?: Date;
};
export type TUSERREGISTER = {
  uid?: string;
  username: string;
  fullName: string;
  email: string;
  password: string;

  role: TROLE;
  otpPassword?: string | null;
  otpExpiry?: Date | null;
  emailVerifiedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
};

export type TUSERUPDATE = {
  uid: string;
  username: string;
  fullName: string;
  email: string;
  oldPassword: string;
  newPassword: string;
  role: TROLE;
};
export type TUSERLOGIN = {
  username: string;
  password: string;
};

export type TTRASH = {
  victimUid: string;
};

export type TVERIFYUSER = {
  email: string;
  OTP: string;
};

export type TCOOKIEOPTIONS = {
  httpOnly: true;
  secure: boolean;
  sameSite: "none";
  expires: Date;
};

export type TSENDOTP = {
  email: string;
};

export type TCONTACTUS = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
};

export type TSUBSCRIBENEWSLETTER = {
  email: string;
  newsLetter: string;
};
export type IMENUITEM = {
  title: string;
  description?: string;
  href?: string;
  image?: string;
  children?: IMENUITEM[];
};

export type TGETQUOTE = {
  name: string;
  email: string;
  phone: string;
  company?: string;
  address: string;
  deadline?: string;
  services: string;
  detail?: string;
  trashedBy?: string;
  trashedAt?: Date;
};
export type TSERVICESFORQUOTE = {
  services: string;
};

export type TCONSULTATIONSTATUS =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "FINISHED";
export type TCONSULTATION = {
  name: string;
  email: string;
  phone: string;
  message: string;
  address: string;
  bookingDate: string;
  subject: string;
};

export type THIREUS = {
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  detail: string;
};

type THIREUSDOCUMENT = {
  url?: string;
  name?: string;
};

export type THIREUSDATA = {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  address: string;
  detail: string;
  docs: Document[];
  createdAt: string; // ISO date string format
  trashedBy: string | null;
  trashedAt: string | null;
};

export type THIREUSRESPONSE = THIREUSDATA[];

// ============================================
// VISITOR TYPES
// ============================================

export type TVISITOR_DETAILS = {
  fullName: string;
  businessEmail: string;
  phoneNumber?: string;
  companyName: string;
  companyWebsite?: string;
  businessAddress?: string;
  businessType: string;
  referralSource: string;
};

export type TVISITOR_SERVICE = {
  name: string; // ServiceCategory enum
  childServices: string[];
};

export type TVISITOR_INDUSTRY = {
  category: string; // IndustryCategory enum
  subIndustries: string[]; // IndustrySubIndustry enum array
};

export type TVISITOR_TECHNOLOGY = {
  category: string; // TechnologyCategory enum
  technologies: string[]; // TechnologyItem enum array
};

export type TVISITOR_FEATURE = {
  category: string; // FeatureCategory enum
  features: string[]; // FeatureItem enum array
};

export type TVISITOR_DISCOUNT = {
  type: string; // DiscountType enum
  percent: number;
  notes?: string;
};

export type TVISITOR_TIMELINE = {
  option: string; // TimelineOption enum
  rushFeePercent: number;
  estimatedDays: number;
  description?: string;
};

export type TVISITOR_ESTIMATE = {
  estimateAccepted: boolean;
  estimateFinalPriceMin: number;
  estimateFinalPriceMax: number;
};

export type TVISITOR_SERVICE_AGREEMENT = {
  documentUrl: string;
  agreementVersion?: string;
  accepted: boolean;
  ipAddress?: string;
  userAgent?: string;
  locale?: string;
};

export type TVISITOR_CREATE = {
  clientId?: string;
  ipAddress?: string;
  details: TVISITOR_DETAILS;
  services?: TVISITOR_SERVICE[];
  industries?: TVISITOR_INDUSTRY[];
  technologies?: TVISITOR_TECHNOLOGY[];
  features?: TVISITOR_FEATURE[];
  discount?: TVISITOR_DISCOUNT;
  timeline?: TVISITOR_TIMELINE;
  estimate?: TVISITOR_ESTIMATE;
  serviceAgreement?: TVISITOR_SERVICE_AGREEMENT;
};

export type TVISITOR = {
  id: string;
  clientId?: string;
  ipAddress?: string;
  details?: TVISITOR_DETAILS & { id: string };
  services?: (TVISITOR_SERVICE & { id: string })[];
  industries?: (TVISITOR_INDUSTRY & { id: string })[];
  technologies?: (TVISITOR_TECHNOLOGY & { id: string })[];
  features?: (TVISITOR_FEATURE & { id: string })[];
  discount?: TVISITOR_DISCOUNT & { id: string };
  timeline?: TVISITOR_TIMELINE & { id: string };
  estimate?: TVISITOR_ESTIMATE & { id: string };
  serviceAgreement?: TVISITOR_SERVICE_AGREEMENT & { id: string };
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

// ============================================
// PROJECT TYPES
// ============================================

export type TPROJECT_DETAILS = TVISITOR_DETAILS;
export type TPROJECT_SERVICE = TVISITOR_SERVICE;
export type TPROJECT_INDUSTRY = TVISITOR_INDUSTRY;
export type TPROJECT_TECHNOLOGY = TVISITOR_TECHNOLOGY;
export type TPROJECT_FEATURE = TVISITOR_FEATURE;
export type TPROJECT_DISCOUNT = TVISITOR_DISCOUNT;
export type TPROJECT_TIMELINE = TVISITOR_TIMELINE;
export type TPROJECT_ESTIMATE = TVISITOR_ESTIMATE;
export type TPROJECT_SERVICE_AGREEMENT = TVISITOR_SERVICE_AGREEMENT;

export type TMILESTONE_STATUS =
  | "PLANNED"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "COMPLETED"
  | "CANCELLED";
export type TMILESTONE_PRIORITY = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type TMILESTONE_PHASE =
  | "DISCOVERY"
  | "DESIGN"
  | "IMPLEMENTATION"
  | "TESTING"
  | "DEPLOYMENT";
export type TMILESTONE_RISK_LEVEL = "LOW" | "MEDIUM" | "HIGH";

export type TMILESTONE = {
  id?: string;
  projectId: string;
  milestoneName: string;
  description?: string;
  deadline: Date | string;
  progress?: number;
  isMilestoneCompleted?: boolean;
  status?: TMILESTONE_STATUS;
  startedAt?: Date | string;
  completedAt?: Date | string;
  priority?: TMILESTONE_PRIORITY;
  phase?: TMILESTONE_PHASE;
  riskLevel?: TMILESTONE_RISK_LEVEL;
  blocked?: boolean;
  blockerReason?: string;
  deliverableUrl?: string;
  tags?: string[];
  estimatedHours?: number;
  actualHours?: number;
  budgetEstimate?: number;
  actualCost?: number;
  assignedFreelancerId?: string; // NEW: Freelancer assignment
  assigneeName?: string;
  assigneeEmail?: string;
  notes?: string;
  approvedBy?: string;
  approvedAt?: Date | string;
};

export type TPROJECT_CREATE = {
  clientId: string;
  visitorId?: string;
  discordChatUrl?: string;
  details: TPROJECT_DETAILS;
  services?: TPROJECT_SERVICE[];
  industries?: TPROJECT_INDUSTRY[];
  technologies?: TPROJECT_TECHNOLOGY[];
  features?: TPROJECT_FEATURE[];
  discount?: TPROJECT_DISCOUNT;
  timeline?: TPROJECT_TIMELINE;
  estimate?: TPROJECT_ESTIMATE;
  serviceAgreement?: TPROJECT_SERVICE_AGREEMENT;
  milestones?: TMILESTONE[];
};

export type TPROJECT = {
  id: string;
  clientId: string;
  visitorId?: string;
  discordChatUrl?: string;
  details?: TPROJECT_DETAILS & { id: string };
  services?: (TPROJECT_SERVICE & { id: string })[];
  industries?: (TPROJECT_INDUSTRY & { id: string })[];
  technologies?: (TPROJECT_TECHNOLOGY & { id: string })[];
  features?: (TPROJECT_FEATURE & { id: string })[];
  discount?: TPROJECT_DISCOUNT & { id: string };
  timeline?: TPROJECT_TIMELINE & { id: string };
  estimate?: TPROJECT_ESTIMATE & { id: string };
  serviceAgreement?: TPROJECT_SERVICE_AGREEMENT & { id: string };
  milestones?: TMILESTONE[];
  interestedFreelancers?: { id: string }[];
  selectedFreelancers?: { id: string }[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

// ============================================
// FREELANCER TYPES
// ============================================

export type TFREELANCER_DETAILS = {
  country: string;
  email: string;
  fullName: string;
  professionalLinks: string[]; // Array of URLs
  timeZone: string;
  eliteSkillCards: string[];
  tools: string[]; // ToolstackItem enum array
  otherNote?: string;
  selectedIndustries: string[]; // FreelancerIndustry enum array
  primaryDomain: string;
};

export type TFREELANCER_DOMAIN_EXPERIENCE = {
  roleTitle: string;
  years: number;
};

export type TFREELANCER_AVAILABILITY = {
  weeklyCommitmentMinHours: number;
  weeklyCommitmentMaxHours?: number;
  weeklyCommitmentIsPlus: boolean;
  timeZone: string;
  workingWindows: string[]; // AvailabilityWindow enum array
  collaborationTools: string[]; // CollaborationTool enum array
  preferredTeamStyle: string; // PreferredTeamStyle enum
  liveScreenSharingPreference: string; // LiveScreenSharingPreference enum
  liveScreenSharingNotes?: string;
  shortTermAvailabilityExceptions?: string;
};

export type TFREELANCER_SOFT_SKILLS = {
  preferredCollaborationStyle: string; // PreferredCollaborationStyle enum
  communicationFrequency: string; // CommunicationFrequencyPreference enum
  conflictResolutionStyle: string; // ConflictResolutionStyle enum
  languages: string[]; // LanguageFluency enum array
  otherLanguage?: string;
  teamVsSoloPreference: string; // TeamVsSoloPreference enum
};

export type TFREELANCER_CERTIFICATION = {
  certificateName: string;
  certificateUrl: string;
};

export type TFREELANCER_PROJECT_BIDDING = {
  compensationPreference: string; // ProjectCompensationPreference enum
  smallProjectMin?: number;
  smallProjectMax?: number;
  midProjectMin?: number;
  midProjectMax?: number;
  longTermMin?: number;
  longTermMax?: number;
  milestonePaymentTerms: string; // MilestonePaymentTerms enum
  customPaymentTerms?: string;
  proposalSubmission: string; // ProposalSubmissionPreference enum
};

export type TFREELANCER_LEGAL_AGREEMENTS = {
  projectSpecificNdaAccepted: boolean;
  projectSpecificNdaUrl: string;
  workForHireAccepted: boolean;
  workForHireUrl: string;
  projectScopeDeliverablesAccepted: boolean;
  projectScopeDeliverablesUrl: string;
  paymentTermsAccepted: boolean;
  paymentTermsUrl: string;
  securityComplianceAccepted: boolean;
  securityComplianceUrl?: string;
  nonSolicitationAccepted: boolean;
  nonSolicitationUrl: string;
  codeOfConductAccepted: boolean;
  codeOfConductUrl: string;
  projectIpBoundariesAccepted: boolean;
  projectIpBoundariesUrl: string;
  identityDocType?: string; // LegalIdentityDocType enum
  identityDocUrl?: string;
  taxDocType?: string; // LegalTaxDocType enum
  taxDocUrl?: string;
  proofOfAddressProvided: boolean;
  proofOfAddressUrl?: string;
  interestedInWorkAuthorization: boolean;
  finalCertificationAccepted: boolean;
  finalCertificationAcceptedAt?: Date | string;
  ipAddress?: string;
  userAgent?: string;
  locale?: string;
};

export type TFREELANCER_CREATE = {
  details: TFREELANCER_DETAILS;
  domainExperiences?: TFREELANCER_DOMAIN_EXPERIENCE[];
  availabilityWorkflow?: TFREELANCER_AVAILABILITY;
  softSkills?: TFREELANCER_SOFT_SKILLS;
  certifications?: TFREELANCER_CERTIFICATION[];
  projectBidding?: TFREELANCER_PROJECT_BIDDING;
  legalAgreements?: TFREELANCER_LEGAL_AGREEMENTS;
};

export type TFREELANCER = {
  id: string;
  details?: TFREELANCER_DETAILS & { id: string };
  domainExperiences?: (TFREELANCER_DOMAIN_EXPERIENCE & { id: string })[];
  availabilityWorkflow?: TFREELANCER_AVAILABILITY & { id: string };
  softSkills?: TFREELANCER_SOFT_SKILLS & { id: string };
  certifications?: (TFREELANCER_CERTIFICATION & { id: string })[];
  projectBidding?: TFREELANCER_PROJECT_BIDDING & { id: string };
  legalAgreements?: TFREELANCER_LEGAL_AGREEMENTS & { id: string };
  interestedProjects?: { id: string }[];
  selectedProjects?: { id: string }[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
};

// Legacy types (deprecated - for backward compatibility during migration)
export type TFREELANCER_OLD = {
  name: string;
  email: string;
  phone: string;
  yourPortfolio: string;
  yourTopProject1: string;
  yourTopProject2: string;
  yourTopProject3: string;
  address: string;
  detail: string;
  niche: string;
  createdAt: string;
  trashedBy: string | null;
  trashedAt: string | null;
};

// ============================================
// LEGACY TYPES (DEPRECATED - for backward compatibility)
// ============================================

export type TPROJECTSTATUS_OLD =
  | "PENDING"
  | "CANCELLED"
  | "ONGOING"
  | "COMPLETED";
export type TKPIRANK =
  | "BRONZE"
  | "SILVER"
  | "GOLD"
  | "PLATINIUM"
  | "DIAMOND"
  | "CROWN"
  | "ACE"
  | "CONQUERER";
export type TDIFFICULTYLEVEL_OLD = "EASY" | "MEDIUM" | "HARD";
export type TPROJECTTYPE_OLD = "INHOUSE" | "OUTSOURCE";

// Old project types (deprecated)
export type TUPDATE_PROJECT_OLD = {
  title: string;
  detail: string;
  projectType: TPROJECTTYPE_OLD;
  niche: string;
  bounty: number;
  deadline: string;
  projectStatus: TPROJECTSTATUS_OLD;
  progressPercentage: number;
  isDeadlineNeedToBeExtend: boolean;
  difficultyLevel: "EASY" | "MEDIUM" | "HARD";
};

export type TPROJECT_OLD = TUPDATE_PROJECT_OLD & {
  clientWhoPostedThisProjectForeignId?: string;
  selectedFreelancersForThisProject: string[];
  interestedFreelancerWhoWantToWorkOnThisProject: string[];
  commentByClientAfterProjectCompletion?: string;
  starsByClientAfterProjectCompletion?: string;
};

// ** type for blog post
export type TBLOGPOST = {
  blogTitle: string;
  blogThumbnail: string;
  blogOverview: string;
  blogBody: string;
  isPublished?: boolean;
};
