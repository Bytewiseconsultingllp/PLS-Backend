/**
 * Payment Agreement Service
 *
 * This service handles all business logic for milestone payment agreements.
 * These agreements store the distribution decisions made by admin and freelancers
 * regarding milestone payments, including links to DocuSign agreements.
 */

import { db } from "../database/db";
import { Prisma } from "@prisma/client";

// ============================================
// TYPES
// ============================================

interface CreatePaymentAgreementData {
  agreementDocumentUrl: string;
  milestoneAmount: number;
  distributionDetails: Record<string, any>;
  status?: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  notes?: string;
}

interface UpdatePaymentAgreementData {
  agreementDocumentUrl?: string;
  milestoneAmount?: number;
  distributionDetails?: Record<string, any>;
  status?: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  notes?: string;
}

// ============================================
// CREATE PAYMENT AGREEMENT
// ============================================

/**
 * Create a new payment agreement for a milestone
 * @param milestoneId - ID of the milestone
 * @param projectId - ID of the project
 * @param data - Agreement data
 * @param createdBy - User ID of who created it (Admin/Moderator)
 * @returns Created payment agreement
 */
export const createPaymentAgreement = async (
  milestoneId: string,
  projectId: string,
  data: CreatePaymentAgreementData,
  createdBy: string,
) => {
  // Check if milestone exists and belongs to the project
  const milestone = await db.milestone.findFirst({
    where: {
      id: milestoneId,
      projectId: projectId,
      deletedAt: null,
    },
  });

  if (!milestone) {
    throw new Error("Milestone not found or doesn't belong to this project");
  }

  // Check if agreement already exists for this milestone
  const existingAgreement = await db.milestonePaymentAgreement.findFirst({
    where: {
      milestoneId: milestoneId,
      deletedAt: null,
    },
  });

  if (existingAgreement) {
    throw new Error(
      "Payment agreement already exists for this milestone. Update the existing one instead.",
    );
  }

  // Create the payment agreement
  const agreement = await db.milestonePaymentAgreement.create({
    data: {
      milestoneId,
      projectId,
      agreementDocumentUrl: data.agreementDocumentUrl,
      milestoneAmount: new Prisma.Decimal(data.milestoneAmount),
      distributionDetails: data.distributionDetails,
      status: data.status || "ACTIVE",
      notes: data.notes,
      createdBy,
    },
    include: {
      milestone: {
        select: {
          id: true,
          milestoneName: true,
          deadline: true,
          status: true,
        },
      },
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
    },
  });

  return agreement;
};

// ============================================
// GET PAYMENT AGREEMENT BY MILESTONE
// ============================================

/**
 * Get payment agreement for a specific milestone
 * @param milestoneId - ID of the milestone
 * @returns Payment agreement or null
 */
export const getPaymentAgreementByMilestone = async (milestoneId: string) => {
  const agreement = await db.milestonePaymentAgreement.findFirst({
    where: {
      milestoneId,
      deletedAt: null,
    },
    include: {
      milestone: {
        select: {
          id: true,
          milestoneName: true,
          description: true,
          deadline: true,
          status: true,
          progress: true,
          isMilestoneCompleted: true,
        },
      },
      project: {
        select: {
          id: true,
          details: {
            select: {
              companyName: true,
            },
          },
          client: {
            select: {
              uid: true,
              fullName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return agreement;
};

// ============================================
// GET ALL PAYMENT AGREEMENTS FOR PROJECT
// ============================================

/**
 * Get all payment agreements for a project
 * @param projectId - ID of the project
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 10)
 * @returns Paginated payment agreements
 */
export const getPaymentAgreementsByProject = async (
  projectId: string,
  page = 1,
  limit = 10,
) => {
  const skip = (page - 1) * limit;

  const [agreements, total] = await Promise.all([
    db.milestonePaymentAgreement.findMany({
      where: {
        projectId,
        deletedAt: null,
      },
      skip,
      take: limit,
      include: {
        milestone: {
          select: {
            id: true,
            milestoneName: true,
            deadline: true,
            status: true,
            progress: true,
            isMilestoneCompleted: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    db.milestonePaymentAgreement.count({
      where: {
        projectId,
        deletedAt: null,
      },
    }),
  ]);

  return {
    agreements,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ============================================
// UPDATE PAYMENT AGREEMENT
// ============================================

/**
 * Update an existing payment agreement
 * @param milestoneId - ID of the milestone
 * @param data - Updated agreement data
 * @returns Updated payment agreement
 */
export const updatePaymentAgreement = async (
  milestoneId: string,
  data: UpdatePaymentAgreementData,
) => {
  // Check if agreement exists
  const existingAgreement = await db.milestonePaymentAgreement.findFirst({
    where: {
      milestoneId,
      deletedAt: null,
    },
  });

  if (!existingAgreement) {
    throw new Error("Payment agreement not found for this milestone");
  }

  // Prepare update data
  const updateData: any = {};

  if (data.agreementDocumentUrl !== undefined) {
    updateData.agreementDocumentUrl = data.agreementDocumentUrl;
  }
  if (data.milestoneAmount !== undefined) {
    updateData.milestoneAmount = new Prisma.Decimal(data.milestoneAmount);
  }
  if (data.distributionDetails !== undefined) {
    updateData.distributionDetails = data.distributionDetails;
  }
  if (data.status !== undefined) {
    updateData.status = data.status;
  }
  if (data.notes !== undefined) {
    updateData.notes = data.notes;
  }

  // Update the agreement
  const agreement = await db.milestonePaymentAgreement.update({
    where: {
      id: existingAgreement.id,
    },
    data: updateData,
    include: {
      milestone: {
        select: {
          id: true,
          milestoneName: true,
          deadline: true,
          status: true,
        },
      },
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
    },
  });

  return agreement;
};

// ============================================
// DELETE PAYMENT AGREEMENT (SOFT DELETE)
// ============================================

/**
 * Soft delete a payment agreement
 * @param milestoneId - ID of the milestone
 * @returns Deleted payment agreement
 */
export const deletePaymentAgreement = async (milestoneId: string) => {
  // Check if agreement exists
  const existingAgreement = await db.milestonePaymentAgreement.findFirst({
    where: {
      milestoneId,
      deletedAt: null,
    },
  });

  if (!existingAgreement) {
    throw new Error("Payment agreement not found for this milestone");
  }

  // Soft delete
  const agreement = await db.milestonePaymentAgreement.update({
    where: {
      id: existingAgreement.id,
    },
    data: {
      deletedAt: new Date(),
    },
  });

  return agreement;
};

// ============================================
// GET PAYMENT AGREEMENT BY ID
// ============================================

/**
 * Get payment agreement by ID
 * @param agreementId - ID of the agreement
 * @returns Payment agreement or null
 */
export const getPaymentAgreementById = async (agreementId: string) => {
  const agreement = await db.milestonePaymentAgreement.findFirst({
    where: {
      id: agreementId,
      deletedAt: null,
    },
    include: {
      milestone: {
        select: {
          id: true,
          milestoneName: true,
          description: true,
          deadline: true,
          status: true,
          progress: true,
          isMilestoneCompleted: true,
        },
      },
      project: {
        select: {
          id: true,
          details: {
            select: {
              companyName: true,
            },
          },
          client: {
            select: {
              uid: true,
              fullName: true,
              email: true,
            },
          },
        },
      },
    },
  });

  return agreement;
};

// ============================================
// EXPORTS
// ============================================

export default {
  createPaymentAgreement,
  getPaymentAgreementByMilestone,
  getPaymentAgreementsByProject,
  updatePaymentAgreement,
  deletePaymentAgreement,
  getPaymentAgreementById,
};
