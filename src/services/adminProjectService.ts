import { PrismaClient, PaymentStatus } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================
// ADMIN PROJECT MANAGEMENT SERVICE
// ============================================

interface GetAllProjectsParams {
  page?: number;
  limit?: number;
  paymentStatus?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  acceptingBids?: boolean;
}

/**
 * Get all projects with comprehensive data (Admin only)
 * Includes filters for status, payment status, date range
 */
export const getAllProjects = async (params: GetAllProjectsParams) => {
  const {
    page = 1,
    limit = 10,
    paymentStatus,
    startDate,
    endDate,
    acceptingBids,
  } = params;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {
    deletedAt: null,
  };

  // Filter by payment status
  if (paymentStatus) {
    where.paymentStatus = paymentStatus;
  }

  // Filter by acceptingBids
  if (acceptingBids !== undefined) {
    where.acceptingBids = acceptingBids;
  }

  // Filter by date range
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      where.createdAt.gte = new Date(startDate);
    }
    if (endDate) {
      where.createdAt.lte = new Date(endDate);
    }
  }

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take: limit,
      include: {
        details: true,
        services: true,
        industries: true,
        technologies: true,
        features: true,
        discount: true,
        timeline: true,
        estimate: true,
        serviceAgreement: true,
        client: {
          select: {
            uid: true,
            username: true,
            fullName: true,
            email: true,
            phone: true,
            role: true,
            createdAt: true,
          },
        },
        assignedModerator: {
          select: {
            uid: true,
            username: true,
            fullName: true,
            email: true,
          },
        },
        milestones: {
          where: { deletedAt: null },
          include: {
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
          },
          orderBy: { deadline: "asc" },
        },
        bids: {
          where: { deletedAt: null },
          include: {
            freelancer: {
              select: {
                id: true,
                status: true,
                details: {
                  select: {
                    fullName: true,
                    email: true,
                    primaryDomain: true,
                  },
                },
              },
            },
          },
          orderBy: { submittedAt: "desc" },
        },
        selectedFreelancers: {
          where: { deletedAt: null },
          select: {
            id: true,
            status: true,
            details: {
              select: {
                fullName: true,
                email: true,
                primaryDomain: true,
                country: true,
              },
            },
          },
        },
        payments: {
          where: { trashedAt: null },
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            paymentMethod: true,
            createdAt: true,
            paidAt: true,
          },
          orderBy: { createdAt: "desc" },
        },
        paymentAgreements: {
          where: { deletedAt: null },
          select: {
            id: true,
            milestoneId: true,
            milestoneAmount: true,
            status: true,
            distributionDetails: true,
            createdAt: true,
          },
        },
        visitor: {
          select: {
            id: true,
            isConverted: true,
            convertedAt: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.count({ where }),
  ]);

  return {
    projects,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1,
    },
  };
};

/**
 * Get single project with all comprehensive details (Admin only)
 */
export const getProjectById = async (projectId: string) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId, deletedAt: null },
    include: {
      details: true,
      services: true,
      industries: true,
      technologies: true,
      features: true,
      discount: true,
      timeline: true,
      estimate: true,
      serviceAgreement: true,
      client: {
        select: {
          uid: true,
          username: true,
          fullName: true,
          email: true,
          phone: true,
          address: true,
          detail: true,
          portfolioUrl: true,
          role: true,
          kpi: true,
          kpiRank: true,
          kpiRankPoints: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      assignedModerator: {
        select: {
          uid: true,
          username: true,
          fullName: true,
          email: true,
          phone: true,
          createdAt: true,
        },
      },
      milestones: {
        where: { deletedAt: null },
        include: {
          assignedFreelancer: {
            include: {
              details: {
                select: {
                  fullName: true,
                  email: true,
                  country: true,
                  primaryDomain: true,
                  timeZone: true,
                },
              },
            },
          },
          paymentAgreement: {
            select: {
              id: true,
              milestoneAmount: true,
              distributionDetails: true,
              status: true,
              agreementDocumentUrl: true,
              notes: true,
              createdAt: true,
            },
          },
        },
        orderBy: { deadline: "asc" },
      },
      bids: {
        where: { deletedAt: null },
        include: {
          freelancer: {
            include: {
              details: {
                select: {
                  fullName: true,
                  email: true,
                  country: true,
                  primaryDomain: true,
                  professionalLinks: true,
                  eliteSkillCards: true,
                  tools: true,
                },
              },
              domainExperiences: {
                where: { deletedAt: null },
              },
            },
          },
        },
        orderBy: { submittedAt: "desc" },
      },
      selectedFreelancers: {
        where: { deletedAt: null },
        include: {
          details: true,
          domainExperiences: {
            where: { deletedAt: null },
          },
          availabilityWorkflow: true,
        },
      },
      payments: {
        where: { trashedAt: null },
        orderBy: { createdAt: "desc" },
      },
      paymentAgreements: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
      },
      visitor: {
        include: {
          details: true,
          services: true,
          industries: true,
          technologies: true,
          features: true,
          discount: true,
          timeline: true,
          estimate: true,
          serviceAgreement: true,
        },
      },
    },
  });

  if (!project) {
    throw new Error("Project not found");
  }

  return project;
};

/**
 * Get project statistics (Admin only)
 */
export const getProjectStats = async () => {
  const [
    totalProjects,
    pendingPaymentProjects,
    succeededPaymentProjects,
    acceptingBidsCount,
    totalMilestones,
    completedMilestones,
    totalBids,
    pendingBids,
  ] = await Promise.all([
    prisma.project.count({ where: { deletedAt: null } }),
    prisma.project.count({
      where: { deletedAt: null, paymentStatus: PaymentStatus.PENDING },
    }),
    prisma.project.count({
      where: { deletedAt: null, paymentStatus: PaymentStatus.SUCCEEDED },
    }),
    prisma.project.count({
      where: { deletedAt: null, acceptingBids: true },
    }),
    prisma.milestone.count({ where: { deletedAt: null } }),
    prisma.milestone.count({
      where: { deletedAt: null, isMilestoneCompleted: true },
    }),
    prisma.freelancerBid.count({ where: { deletedAt: null } }),
    prisma.freelancerBid.count({
      where: { deletedAt: null, status: "PENDING" },
    }),
  ]);

  return {
    projects: {
      total: totalProjects,
      pendingPayment: pendingPaymentProjects,
      succeededPayment: succeededPaymentProjects,
      acceptingBids: acceptingBidsCount,
    },
    milestones: {
      total: totalMilestones,
      completed: completedMilestones,
      pending: totalMilestones - completedMilestones,
    },
    bids: {
      total: totalBids,
      pending: pendingBids,
      reviewed: totalBids - pendingBids,
    },
  };
};

export default {
  getAllProjects,
  getProjectById,
  getProjectStats,
};
