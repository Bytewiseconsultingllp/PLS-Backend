import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================
// ADMIN CLIENT MANAGEMENT SERVICE
// ============================================

interface GetAllClientsParams {
  page?: number;
  limit?: number;
  searchQuery?: string; // Search by name, email, username
}

/**
 * Get all clients with basic info (Admin only)
 */
export const getAllClients = async (params: GetAllClientsParams) => {
  const { page = 1, limit = 10, searchQuery } = params;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {
    role: Role.CLIENT,
    trashedAt: null,
  };

  // Add search filter
  if (searchQuery) {
    where.OR = [
      { fullName: { contains: searchQuery, mode: "insensitive" } },
      { email: { contains: searchQuery, mode: "insensitive" } },
      { username: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  const [clients, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        uid: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        address: true,
        detail: true,
        portfolioUrl: true,
        niche: true,
        kpiRank: true,
        kpiRankPoints: true,
        emailVerifiedAt: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            projects: {
              where: { deletedAt: null },
            },
            payments: {
              where: { trashedAt: null },
            },
            visitors: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    clients,
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
 * Get single client with all comprehensive details (Admin only)
 */
export const getClientById = async (clientId: string) => {
  const client = await prisma.user.findFirst({
    where: {
      uid: clientId,
      role: Role.CLIENT,
      trashedAt: null,
    },
    select: {
      uid: true,
      username: true,
      fullName: true,
      email: true,
      phone: true,
      address: true,
      detail: true,
      portfolioUrl: true,
      niche: true,
      topProjects: true,
      kpi: true,
      kpiHistory: true,
      kpiRank: true,
      kpiRankPoints: true,
      emailVerifiedAt: true,
      isActive: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      // Include all projects with comprehensive data
      projects: {
        where: { deletedAt: null },
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
          assignedModerator: {
            select: {
              uid: true,
              fullName: true,
              email: true,
            },
          },
          milestones: {
            where: { deletedAt: null },
            select: {
              id: true,
              milestoneName: true,
              description: true,
              deadline: true,
              progress: true,
              status: true,
              isMilestoneCompleted: true,
              budgetEstimate: true,
              actualCost: true,
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
          selectedFreelancers: {
            where: { deletedAt: null },
            select: {
              id: true,
              status: true,
              details: {
                select: {
                  fullName: true,
                  email: true,
                  country: true,
                  primaryDomain: true,
                },
              },
            },
          },
          bids: {
            where: { deletedAt: null },
            select: {
              id: true,
              bidAmount: true,
              status: true,
              submittedAt: true,
              freelancer: {
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
            orderBy: { submittedAt: "desc" },
          },
          payments: {
            where: { trashedAt: null },
            orderBy: { createdAt: "desc" },
          },
          paymentAgreements: {
            where: { deletedAt: null },
            select: {
              id: true,
              milestoneId: true,
              milestoneAmount: true,
              distributionDetails: true,
              status: true,
              createdAt: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      // Include all payments
      payments: {
        where: { trashedAt: null },
        include: {
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
          visitor: {
            select: {
              id: true,
              details: {
                select: {
                  companyName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      // Include visitors that converted to this client
      visitors: {
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
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!client) {
    throw new Error("Client not found");
  }

  return client;
};

/**
 * Get client statistics (Admin only)
 */
export const getClientStats = async () => {
  const [
    totalClients,
    activeClients,
    verifiedClients,
    totalProjectsByClients,
    totalPaymentsByClients,
  ] = await Promise.all([
    prisma.user.count({
      where: { role: Role.CLIENT, trashedAt: null },
    }),
    prisma.user.count({
      where: { role: Role.CLIENT, trashedAt: null, isActive: true },
    }),
    prisma.user.count({
      where: {
        role: Role.CLIENT,
        trashedAt: null,
        emailVerifiedAt: { not: null },
      },
    }),
    prisma.project.count({
      where: {
        deletedAt: null,
        client: { role: Role.CLIENT, trashedAt: null },
      },
    }),
    prisma.payment.count({
      where: {
        trashedAt: null,
        user: { role: Role.CLIENT, trashedAt: null },
      },
    }),
  ]);

  return {
    clients: {
      total: totalClients,
      active: activeClients,
      inactive: totalClients - activeClients,
      verified: verifiedClients,
      unverified: totalClients - verifiedClients,
    },
    projects: {
      total: totalProjectsByClients,
      averagePerClient:
        totalClients > 0
          ? parseFloat((totalProjectsByClients / totalClients).toFixed(2))
          : 0,
    },
    payments: {
      total: totalPaymentsByClients,
      averagePerClient:
        totalClients > 0
          ? parseFloat((totalPaymentsByClients / totalClients).toFixed(2))
          : 0,
    },
  };
};

export default {
  getAllClients,
  getClientById,
  getClientStats,
};
