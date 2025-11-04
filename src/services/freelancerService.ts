import {
  PrismaClient,
  FreelancerStatus,
  BidStatus,
  Role,
  PaymentStatus,
} from "@prisma/client";
import type {
  FreelancerRegistrationInput,
  CreateFreelancerBidInput,
  ReviewFreelancerInput,
  ReviewBidInput,
  GetFreelancersQuery,
  GetBidsQuery,
} from "../validation/freelancerValidation";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ============================================
// FREELANCER REGISTRATION & MANAGEMENT
// ============================================

/**
 * Register a new freelancer with all their details
 * Initial status: PENDING_REVIEW
 */
export const registerFreelancer = async (data: FreelancerRegistrationInput) => {
  try {
    // Check if email already exists in FreelancerDetails
    const existingFreelancer = await prisma.freelancerDetails.findFirst({
      where: {
        email: data.details.email,
        deletedAt: null,
      },
    });

    if (existingFreelancer) {
      throw new Error("A freelancer with this email already exists");
    }

    // Create freelancer with all related data in a transaction
    const freelancer = await prisma.$transaction(async (tx) => {
      // 1. Create main Freelancer record
      const newFreelancer = await tx.freelancer.create({
        data: {
          status: FreelancerStatus.PENDING_REVIEW,
          registrationEmailSent: false,
        },
      });

      // 2. Create FreelancerDetails
      await tx.freelancerDetails.create({
        data: {
          freelancerId: newFreelancer.id,
          ...data.details,
        },
      });

      // 3. Create FreelancerAvailabilityWorkflow
      await tx.freelancerAvailabilityWorkflow.create({
        data: {
          freelancerId: newFreelancer.id,
          ...data.availabilityWorkflow,
        },
      });

      // 4. Create FreelancerDomainExperience entries
      if (data.domainExperiences && data.domainExperiences.length > 0) {
        await tx.freelancerDomainExperience.createMany({
          data: data.domainExperiences.map((exp) => ({
            freelancerId: newFreelancer.id,
            ...exp,
          })),
        });
      }

      // 5. Create FreelancerSoftSkills
      await tx.freelancerSoftSkills.create({
        data: {
          freelancerId: newFreelancer.id,
          ...data.softSkills,
        },
      });

      // 6. Create FreelancerCertification entries
      if (data.certifications && data.certifications.length > 0) {
        await tx.freelancerCertification.createMany({
          data: data.certifications.map((cert) => ({
            freelancerId: newFreelancer.id,
            ...cert,
          })),
        });
      }

      // 7. Create FreelancerProjectBidding
      await tx.freelancerProjectBidding.create({
        data: {
          freelancerId: newFreelancer.id,
          ...data.projectBidding,
        },
      });

      // 8. Create LegalAgreements
      await tx.legalAgreements.create({
        data: {
          freelancerId: newFreelancer.id,
          ...data.legalAgreements,
        },
      });

      // Return the complete freelancer with all relations
      return tx.freelancer.findUnique({
        where: { id: newFreelancer.id },
        include: {
          details: true,
          availabilityWorkflow: true,
          domainExperiences: true,
          softSkills: true,
          certifications: true,
          projectBidding: true,
          legalAgreements: true,
        },
      });
    });

    return freelancer;
  } catch (error) {
    console.error("Error registering freelancer:", error);
    throw error;
  }
};

/**
 * Update email status flags for a freelancer
 * Used to track which emails have been sent
 */
export const updateFreelancerEmailStatus = async (
  freelancerId: string,
  emailField:
    | "registrationEmailSent"
    | "acceptanceEmailSent"
    | "rejectionEmailSent",
  status: boolean,
) => {
  return await prisma.freelancer.update({
    where: { id: freelancerId },
    data: { [emailField]: status },
  });
};

/**
 * Get all freelancers with filtering and pagination
 * Used by admin to view and manage freelancers
 */
export const getFreelancers = async (query: GetFreelancersQuery) => {
  const { status, page = 1, limit = 10, search } = query;
  const skip = (page - 1) * limit;

  const where: any = {
    deletedAt: null,
  };

  if (status) {
    where.status = status;
  }

  if (search) {
    where.details = {
      OR: [
        { fullName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { country: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  const [freelancers, total] = await Promise.all([
    prisma.freelancer.findMany({
      where,
      skip,
      take: limit,
      include: {
        details: true,
        user: {
          select: {
            uid: true,
            username: true,
            email: true,
            role: true,
            kpiRankPoints: true,
            kpiRank: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.freelancer.count({ where }),
  ]);

  return {
    freelancers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single freelancer by ID with all details
 */
export const getFreelancerById = async (freelancerId: string) => {
  const freelancer = await prisma.freelancer.findUnique({
    where: {
      id: freelancerId,
      deletedAt: null,
    },
    include: {
      details: true,
      availabilityWorkflow: true,
      domainExperiences: true,
      softSkills: true,
      certifications: true,
      projectBidding: true,
      legalAgreements: true,
      user: {
        select: {
          uid: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
        },
      },
      bids: {
        where: { deletedAt: null },
        include: {
          project: {
            select: {
              id: true,
              createdAt: true,
              details: true,
            },
          },
        },
        orderBy: {
          submittedAt: "desc",
        },
      },
    },
  });

  if (!freelancer) {
    throw new Error("Freelancer not found");
  }

  return freelancer;
};

/**
 * Admin: Review a freelancer (Accept or Reject)
 * - If accepted: Create User account with FREELANCER role
 * - If rejected: Soft delete the freelancer
 */
export const reviewFreelancer = async (
  freelancerId: string,
  reviewData: ReviewFreelancerInput,
  adminUserId: string,
) => {
  try {
    const freelancer = await prisma.freelancer.findUnique({
      where: { id: freelancerId },
      include: { details: true },
    });

    if (!freelancer) {
      throw new Error("Freelancer not found");
    }

    if (freelancer.status !== FreelancerStatus.PENDING_REVIEW) {
      throw new Error("Freelancer has already been reviewed");
    }

    if (reviewData.action === "ACCEPT") {
      // Generate temporary password
      const tempPassword = generateTemporaryPassword();
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      // Create user account and update freelancer in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create User account
        const user = await tx.user.create({
          data: {
            username:
              freelancer.details!.email.split("@")[0] + "_" + Date.now(),
            fullName: freelancer.details!.fullName,
            email: freelancer.details!.email,
            password: hashedPassword,
            role: Role.FREELANCER,
            emailVerifiedAt: new Date(),
          },
        });

        // Update Freelancer
        const updatedFreelancer = await tx.freelancer.update({
          where: { id: freelancerId },
          data: {
            status: FreelancerStatus.ACCEPTED,
            userId: user.uid,
            reviewedBy: adminUserId,
            reviewedAt: new Date(),
            acceptanceEmailSent: false, // Will be set to true after email is sent
          },
          include: {
            details: true,
            user: true,
          },
        });

        return { freelancer: updatedFreelancer, tempPassword };
      });

      return result;
    } else {
      // Reject freelancer
      const updatedFreelancer = await prisma.freelancer.update({
        where: { id: freelancerId },
        data: {
          status: FreelancerStatus.REJECTED,
          reviewedBy: adminUserId,
          reviewedAt: new Date(),
          rejectionReason: reviewData.rejectionReason,
          rejectionEmailSent: false, // Will be set to true after email is sent
          deletedAt: new Date(), // Soft delete
        },
        include: {
          details: true,
        },
      });

      return { freelancer: updatedFreelancer };
    }
  } catch (error) {
    console.error("Error reviewing freelancer:", error);
    throw error;
  }
};

/**
 * Update email sent flags
 */
export const updateEmailSentFlags = async (
  freelancerId: string,
  flags: {
    registrationEmailSent?: boolean;
    acceptanceEmailSent?: boolean;
    rejectionEmailSent?: boolean;
  },
) => {
  return prisma.freelancer.update({
    where: { id: freelancerId },
    data: flags,
  });
};

// ============================================
// FREELANCER BIDDING SYSTEM
// ============================================

/**
 * Create a bid for a project
 * Freelancer can only bid once per project
 */
export const createBid = async (
  freelancerId: string,
  bidData: CreateFreelancerBidInput,
) => {
  try {
    // Check if freelancer is accepted
    const freelancer = await prisma.freelancer.findUnique({
      where: { id: freelancerId },
    });

    if (!freelancer || freelancer.status !== FreelancerStatus.ACCEPTED) {
      throw new Error("Only accepted freelancers can submit bids");
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: bidData.projectId },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    // ✅ Check if payment is completed before allowing bids
    if (project.paymentStatus !== PaymentStatus.SUCCEEDED) {
      throw new Error(
        "Cannot bid on projects with pending payment. Payment must be completed first.",
      );
    }

    // ✅ Check if project is accepting bids
    if (!project.acceptingBids) {
      throw new Error("This project is not currently accepting new bids.");
    }

    // Check if bid already exists
    const existingBid = await prisma.freelancerBid.findUnique({
      where: {
        // eslint-disable-next-line camelcase
        freelancerId_projectId: {
          freelancerId,
          projectId: bidData.projectId,
        },
      },
    });

    if (existingBid) {
      throw new Error("You have already submitted a bid for this project");
    }

    // Create the bid
    const bid = await prisma.freelancerBid.create({
      data: {
        freelancerId,
        projectId: bidData.projectId,
        bidAmount: bidData.bidAmount,
        proposalText: bidData.proposalText,
        status: BidStatus.PENDING,
      },
      include: {
        freelancer: {
          include: {
            details: true,
          },
        },
        project: {
          include: {
            details: true,
          },
        },
      },
    });

    return bid;
  } catch (error) {
    console.error("Error creating bid:", error);
    throw error;
  }
};

/**
 * Get all bids for a freelancer
 */
export const getFreelancerBids = async (
  freelancerId: string,
  query: GetBidsQuery,
) => {
  const { status, page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  const where: any = {
    freelancerId,
    deletedAt: null,
  };

  if (status) {
    where.status = status;
  }

  const [bids, total] = await Promise.all([
    prisma.freelancerBid.findMany({
      where,
      skip,
      take: limit,
      include: {
        project: {
          select: {
            id: true,
            createdAt: true,
            updatedAt: true,
            paymentStatus: true,
            acceptingBids: true,
            discordChatUrl: true,
            // Include project details but exclude client personal info
            details: {
              select: {
                // ❌ Exclude client personal info
                // fullName: false,
                // businessEmail: false,
                // phoneNumber: false,
                // ✅ Include business/company info
                companyName: true,
                companyWebsite: true,
                businessAddress: true,
                businessType: true,
                referralSource: true,
              },
            },
            services: true,
            industries: true,
            technologies: true,
            features: true,
            timeline: true,
            // Exclude pricing/estimate
            // Exclude client relation
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    }),
    prisma.freelancerBid.count({ where }),
  ]);

  return {
    bids,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get all bids for a project
 * Used by admin to review bids
 */
export const getProjectBids = async (
  projectId: string,
  query: GetBidsQuery,
) => {
  const { status, page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  const where: any = {
    projectId,
    deletedAt: null,
  };

  if (status) {
    where.status = status;
  }

  const [bids, total] = await Promise.all([
    prisma.freelancerBid.findMany({
      where,
      skip,
      take: limit,
      include: {
        freelancer: {
          include: {
            details: true,
            domainExperiences: true,
            softSkills: true,
            user: {
              select: {
                uid: true,
                username: true,
                fullName: true,
                kpiRankPoints: true,
                kpiRank: true,
              },
            },
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    }),
    prisma.freelancerBid.count({ where }),
  ]);

  return {
    bids,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single bid by ID
 */
export const getBidById = async (bidId: string) => {
  const bid = await prisma.freelancerBid.findUnique({
    where: {
      id: bidId,
      deletedAt: null,
    },
    include: {
      freelancer: {
        include: {
          details: true,
          domainExperiences: true,
          softSkills: true,
          availabilityWorkflow: true,
          user: {
            select: {
              uid: true,
              username: true,
              fullName: true,
              kpiRankPoints: true,
              kpiRank: true,
            },
          },
        },
      },
      project: {
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          paymentStatus: true,
          acceptingBids: true,
          discordChatUrl: true,
          // Include project details but exclude client personal info
          details: {
            select: {
              // ❌ Exclude client personal info
              // fullName: false,
              // businessEmail: false,
              // phoneNumber: false,
              // ✅ Include business/company info
              companyName: true,
              companyWebsite: true,
              businessAddress: true,
              businessType: true,
              referralSource: true,
            },
          },
          services: true,
          industries: true,
          technologies: true,
          features: true,
          timeline: true,
          // Exclude pricing/estimate
          // Exclude client relation
        },
      },
    },
  });

  if (!bid) {
    throw new Error("Bid not found");
  }

  return bid;
};

/**
 * Admin: Review a bid (Accept or Reject)
 * If accepted, add freelancer to selectedFreelancers for the project
 */
export const reviewBid = async (
  bidId: string,
  reviewData: ReviewBidInput,
  adminUserId: string,
) => {
  try {
    const bid = await prisma.freelancerBid.findUnique({
      where: { id: bidId },
      include: {
        freelancer: true,
        project: true,
      },
    });

    if (!bid) {
      throw new Error("Bid not found");
    }

    if (bid.status !== BidStatus.PENDING) {
      throw new Error("Bid has already been reviewed");
    }

    if (reviewData.action === "ACCEPT") {
      // Accept the bid and add freelancer to project
      const result = await prisma.$transaction(async (tx) => {
        // Update bid status
        const updatedBid = await tx.freelancerBid.update({
          where: { id: bidId },
          data: {
            status: BidStatus.ACCEPTED,
            reviewedBy: adminUserId,
            reviewedAt: new Date(),
          },
        });

        // Add freelancer to selectedFreelancers for the project
        await tx.project.update({
          where: { id: bid.projectId },
          data: {
            selectedFreelancers: {
              connect: { id: bid.freelancerId },
            },
          },
        });

        return updatedBid;
      });

      return result;
    } else {
      // Reject the bid
      const updatedBid = await prisma.freelancerBid.update({
        where: { id: bidId },
        data: {
          status: BidStatus.REJECTED,
          reviewedBy: adminUserId,
          reviewedAt: new Date(),
        },
      });

      return updatedBid;
    }
  } catch (error) {
    console.error("Error reviewing bid:", error);
    throw error;
  }
};

/**
 * Freelancer: Withdraw a pending bid
 */
export const withdrawBid = async (bidId: string, freelancerId: string) => {
  try {
    const bid = await prisma.freelancerBid.findUnique({
      where: { id: bidId },
    });

    if (!bid) {
      throw new Error("Bid not found");
    }

    if (bid.freelancerId !== freelancerId) {
      throw new Error("You can only withdraw your own bids");
    }

    if (bid.status !== BidStatus.PENDING) {
      throw new Error("Only pending bids can be withdrawn");
    }

    const updatedBid = await prisma.freelancerBid.update({
      where: { id: bidId },
      data: {
        status: BidStatus.WITHDRAWN,
      },
    });

    return updatedBid;
  } catch (error) {
    console.error("Error withdrawing bid:", error);
    throw error;
  }
};

// ============================================
// PROJECT LISTING FOR FREELANCERS
// ============================================

/**
 * Get all available projects for freelancers
 * Freelancers should NOT see the project estimate prices
 *
 * Visibility Logic:
 * - Assigned freelancers: Can ALWAYS see their projects (regardless of acceptingBids/paymentStatus)
 * - Non-assigned freelancers: Can only see if paymentStatus = "SUCCEEDED" AND acceptingBids = true
 */
export const getAvailableProjects = async (
  freelancerUserId: string,
  page = 1,
  limit = 10,
) => {
  const skip = (page - 1) * limit;

  // First, get the freelancer record to access their ID
  const freelancer = await prisma.freelancer.findUnique({
    where: { userId: freelancerUserId },
    select: { id: true },
  });

  if (!freelancer) {
    throw new Error("Freelancer profile not found");
  }

  // Build the where clause with OR condition:
  // 1. Projects where freelancer is assigned (always visible)
  // 2. Projects accepting bids with payment succeeded (visible to all)
  const whereClause = {
    deletedAt: null,
    OR: [
      {
        // Projects where this freelancer is assigned (always visible)
        selectedFreelancers: {
          some: {
            id: freelancer.id,
          },
        },
      },
      {
        // Projects accepting bids with payment succeeded (visible to all)
        paymentStatus: PaymentStatus.SUCCEEDED,
        acceptingBids: true,
      },
    ],
  };

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where: whereClause,
      skip,
      take: limit,
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        paymentStatus: true,
        acceptingBids: true,
        discordChatUrl: true,
        // Include project details but exclude client personal info
        details: {
          select: {
            // ❌ Exclude client personal info (fullName, businessEmail, phoneNumber)
            // ✅ Include business/company info only
            companyName: true,
            companyWebsite: true,
            businessAddress: true,
            businessType: true,
            referralSource: true,
          },
        },
        services: true,
        industries: true,
        technologies: true,
        features: true,
        timeline: true,
        // Explicitly exclude estimate to hide pricing from freelancers
        // Explicitly exclude client relation to hide client personal info
        selectedFreelancers: {
          select: {
            id: true,
            details: {
              select: {
                fullName: true,
              },
            },
          },
        },
        bids: {
          select: {
            id: true,
            status: true,
            freelancerId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.project.count({
      where: whereClause,
    }),
  ]);

  return {
    projects,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get project details for bidding (without pricing)
 *
 * Visibility Logic:
 * - Assigned freelancers: Can ALWAYS see their projects (regardless of acceptingBids/paymentStatus)
 * - Non-assigned freelancers: Can only see if paymentStatus = "SUCCEEDED" AND acceptingBids = true
 */
export const getProjectForBidding = async (
  projectId: string,
  freelancerUserId: string,
) => {
  // First, get the freelancer record to access their ID
  const freelancer = await prisma.freelancer.findUnique({
    where: { userId: freelancerUserId },
    select: { id: true },
  });

  if (!freelancer) {
    throw new Error("Freelancer profile not found");
  }

  // Build the where clause with OR condition:
  // 1. Projects where freelancer is assigned (always visible)
  // 2. Projects accepting bids with payment succeeded (visible to all)
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      deletedAt: null,
      OR: [
        {
          // Projects where this freelancer is assigned (always visible)
          selectedFreelancers: {
            some: {
              id: freelancer.id,
            },
          },
        },
        {
          // Projects accepting bids with payment succeeded (visible to all)
          paymentStatus: PaymentStatus.SUCCEEDED,
          acceptingBids: true,
        },
      ],
    },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      paymentStatus: true,
      acceptingBids: true,
      discordChatUrl: true,
      // Include project details but exclude client personal info
      details: {
        select: {
          // ❌ Exclude client personal info (fullName, businessEmail, phoneNumber)
          // ✅ Include business/company info only
          companyName: true,
          companyWebsite: true,
          businessAddress: true,
          businessType: true,
          referralSource: true,
        },
      },
      services: true,
      industries: true,
      technologies: true,
      features: true,
      timeline: true,
      selectedFreelancers: {
        select: {
          id: true,
          details: {
            select: {
              fullName: true,
            },
          },
        },
      },
      // Exclude estimate to hide pricing
      // Exclude client relation to hide client personal info
    },
  });

  if (!project) {
    throw new Error(
      "Project not found or not available for bidding (payment not completed or not accepting bids)",
    );
  }

  return project;
};

// ============================================
// FREELANCER SELECTED PROJECTS & MILESTONES
// ============================================

/**
 * Get all projects where the freelancer is selected/assigned
 * Only shows projects they're actively working on
 */
export const getMySelectedProjects = async (
  freelancerUserId: string,
  page = 1,
  limit = 10,
) => {
  const skip = (page - 1) * limit;

  // First, get the freelancer record to access their ID
  const freelancer = await prisma.freelancer.findUnique({
    where: { userId: freelancerUserId },
    select: { id: true },
  });

  if (!freelancer) {
    throw new Error("Freelancer profile not found");
  }

  // Only get projects where this freelancer is in selectedFreelancers
  const whereClause = {
    deletedAt: null,
    selectedFreelancers: {
      some: {
        id: freelancer.id,
      },
    },
  };

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where: whereClause,
      skip,
      take: limit,
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        paymentStatus: true,
        acceptingBids: true,
        discordChatUrl: true,
        // Include project details but exclude client personal info
        details: {
          select: {
            companyName: true,
            companyWebsite: true,
            businessAddress: true,
            businessType: true,
            referralSource: true,
          },
        },
        services: true,
        industries: true,
        technologies: true,
        features: true,
        timeline: true,
        selectedFreelancers: {
          select: {
            id: true,
            details: {
              select: {
                fullName: true,
              },
            },
          },
        },
        // Include milestones summary for overview
        milestones: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            milestoneName: true,
            status: true,
            progress: true,
            deadline: true,
            isMilestoneCompleted: true,
            assignedFreelancerId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.project.count({
      where: whereClause,
    }),
  ]);

  return {
    projects,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get detailed view of a specific project the freelancer is selected for
 */
export const getMySelectedProjectDetails = async (
  projectId: string,
  freelancerUserId: string,
) => {
  // First, get the freelancer record to access their ID
  const freelancer = await prisma.freelancer.findUnique({
    where: { userId: freelancerUserId },
    select: { id: true },
  });

  if (!freelancer) {
    throw new Error("Freelancer profile not found");
  }

  // Get project only if freelancer is selected for it
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      deletedAt: null,
      selectedFreelancers: {
        some: {
          id: freelancer.id,
        },
      },
    },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      paymentStatus: true,
      acceptingBids: true,
      discordChatUrl: true,
      details: {
        select: {
          companyName: true,
          companyWebsite: true,
          businessAddress: true,
          businessType: true,
          referralSource: true,
        },
      },
      services: true,
      industries: true,
      technologies: true,
      features: true,
      timeline: true,
      selectedFreelancers: {
        select: {
          id: true,
          details: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      },
      milestones: {
        where: {
          deletedAt: null,
        },
        select: {
          id: true,
          milestoneName: true,
          description: true,
          status: true,
          progress: true,
          deadline: true,
          isMilestoneCompleted: true,
          priority: true,
          phase: true,
          assignedFreelancerId: true,
          estimatedHours: true,
          actualHours: true,
          tags: true,
          deliverableUrl: true,
          completedAt: true,
        },
        orderBy: {
          deadline: "asc",
        },
      },
    },
  });

  if (!project) {
    throw new Error(
      "Project not found or you are not assigned to this project",
    );
  }

  return project;
};

/**
 * Get all milestones for a project the freelancer is selected for
 */
export const getProjectMilestones = async (
  projectId: string,
  freelancerUserId: string,
) => {
  // First, verify freelancer is selected for this project
  const freelancer = await prisma.freelancer.findUnique({
    where: { userId: freelancerUserId },
    select: { id: true },
  });

  if (!freelancer) {
    throw new Error("Freelancer profile not found");
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      deletedAt: null,
      selectedFreelancers: {
        some: {
          id: freelancer.id,
        },
      },
    },
    select: { id: true },
  });

  if (!project) {
    throw new Error(
      "Project not found or you are not assigned to this project",
    );
  }

  // Get all milestones for this project
  const milestones = await prisma.milestone.findMany({
    where: {
      projectId,
      deletedAt: null,
    },
    select: {
      id: true,
      milestoneName: true,
      description: true,
      status: true,
      progress: true,
      deadline: true,
      startedAt: true,
      completedAt: true,
      isMilestoneCompleted: true,
      priority: true,
      phase: true,
      riskLevel: true,
      blocked: true,
      blockerReason: true,
      assignedFreelancerId: true,
      assignedFreelancer: {
        select: {
          id: true,
          details: {
            select: {
              fullName: true,
            },
          },
        },
      },
      estimatedHours: true,
      actualHours: true,
      budgetEstimate: true,
      actualCost: true,
      tags: true,
      deliverableUrl: true,
      notes: true,
      moderatorApprovalRequired: true,
      moderatorApproved: true,
      moderatorApprovedAt: true,
      moderatorNotes: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      deadline: "asc",
    },
  });

  return milestones;
};

/**
 * Get specific milestone details for a project the freelancer is selected for
 */
export const getMilestoneDetails = async (
  projectId: string,
  milestoneId: string,
  freelancerUserId: string,
) => {
  // First, verify freelancer is selected for this project
  const freelancer = await prisma.freelancer.findUnique({
    where: { userId: freelancerUserId },
    select: { id: true },
  });

  if (!freelancer) {
    throw new Error("Freelancer profile not found");
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      deletedAt: null,
      selectedFreelancers: {
        some: {
          id: freelancer.id,
        },
      },
    },
    select: { id: true },
  });

  if (!project) {
    throw new Error(
      "Project not found or you are not assigned to this project",
    );
  }

  // Get milestone details
  const milestone = await prisma.milestone.findFirst({
    where: {
      id: milestoneId,
      projectId,
      deletedAt: null,
    },
    select: {
      id: true,
      milestoneName: true,
      description: true,
      status: true,
      progress: true,
      deadline: true,
      startedAt: true,
      completedAt: true,
      isMilestoneCompleted: true,
      priority: true,
      phase: true,
      riskLevel: true,
      blocked: true,
      blockerReason: true,
      assignedFreelancerId: true,
      assignedFreelancer: {
        select: {
          id: true,
          details: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      },
      estimatedHours: true,
      actualHours: true,
      budgetEstimate: true,
      actualCost: true,
      tags: true,
      deliverableUrl: true,
      notes: true,
      moderatorApprovalRequired: true,
      moderatorApproved: true,
      moderatorApprovedBy: true,
      moderatorApprovedAt: true,
      moderatorNotes: true,
      project: {
        select: {
          id: true,
          details: {
            select: {
              companyName: true,
            },
          },
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!milestone) {
    throw new Error("Milestone not found");
  }

  return milestone;
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Generate a temporary password for new freelancer users
 */
function generateTemporaryPassword(): string {
  const length = 12;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

/**
 * Get freelancer by user ID
 */
export const getFreelancerByUserId = async (userId: string) => {
  const freelancer = await prisma.freelancer.findUnique({
    where: {
      userId,
      deletedAt: null,
    },
    include: {
      details: true,
      availabilityWorkflow: true,
      domainExperiences: true,
      softSkills: true,
      certifications: true,
      projectBidding: true,
    },
  });

  return freelancer;
};

export default {
  registerFreelancer,
  updateFreelancerEmailStatus,
  getFreelancers,
  getFreelancerById,
  reviewFreelancer,
  updateEmailSentFlags,
  createBid,
  getFreelancerBids,
  getProjectBids,
  getBidById,
  reviewBid,
  withdrawBid,
  getAvailableProjects,
  getProjectForBidding,
  getFreelancerByUserId,
  getMySelectedProjects,
  getMySelectedProjectDetails,
  getProjectMilestones,
  getMilestoneDetails,
};
