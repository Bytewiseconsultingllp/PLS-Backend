import { db } from "../database/db";
import type { TPROJECT_CREATE, TMILESTONE } from "../types";

export class ProjectService {
  /**
   * Create a new project from visitor data
   * This copies all visitor data to project tables
   */
  async createProjectFromVisitor(clientId: string, visitorId: string) {
    // Get visitor with all related data
    const visitor = await db.visitor.findUnique({
      where: { id: visitorId },
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
    });

    if (!visitor) {
      throw new Error("Visitor not found");
    }

    // Create project with all nested data
    const project = await db.project.create({
      data: {
        clientId,
        visitorId,
        details: visitor.details
          ? {
              create: {
                fullName: visitor.details.fullName,
                businessEmail: visitor.details.businessEmail,
                phoneNumber: visitor.details.phoneNumber,
                companyName: visitor.details.companyName,
                companyWebsite: visitor.details.companyWebsite,
                businessAddress: visitor.details.businessAddress,
                businessType: visitor.details.businessType,
                referralSource: visitor.details.referralSource,
              },
            }
          : undefined,
        services: {
          create: visitor.services.map((s) => ({
            name: s.name,
            childServices: s.childServices,
          })),
        },
        industries: {
          create: visitor.industries.map((i) => ({
            category: i.category,
            subIndustries: i.subIndustries,
          })),
        },
        technologies: {
          create: visitor.technologies.map((t) => ({
            category: t.category,
            technologies: t.technologies,
          })),
        },
        features: {
          create: visitor.features.map((f) => ({
            category: f.category,
            features: f.features,
          })),
        },
        discount: visitor.discount
          ? {
              create: {
                type: visitor.discount.type,
                percent: visitor.discount.percent,
                notes: visitor.discount.notes,
              },
            }
          : undefined,
        timeline: visitor.timeline
          ? {
              create: {
                option: visitor.timeline.option,
                rushFeePercent: visitor.timeline.rushFeePercent,
                estimatedDays: visitor.timeline.estimatedDays,
                description: visitor.timeline.description,
              },
            }
          : undefined,
        estimate: visitor.estimate
          ? {
              create: {
                estimateAccepted: visitor.estimate.estimateAccepted,
                estimateFinalPriceMin: visitor.estimate.estimateFinalPriceMin,
                estimateFinalPriceMax: visitor.estimate.estimateFinalPriceMax,
              },
            }
          : undefined,
        serviceAgreement: visitor.serviceAgreement
          ? {
              create: {
                documentUrl: visitor.serviceAgreement.documentUrl,
                agreementVersion: visitor.serviceAgreement.agreementVersion,
                accepted: visitor.serviceAgreement.accepted,
                ipAddress: visitor.serviceAgreement.ipAddress,
                userAgent: visitor.serviceAgreement.userAgent,
                locale: visitor.serviceAgreement.locale,
              },
            }
          : undefined,
      },
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
    });

    // Link visitor to client
    await db.visitor.update({
      where: { id: visitorId },
      data: { clientId },
    });

    return project;
  }

  /**
   * Create a project directly (for existing clients)
   */
  async createProject(data: TPROJECT_CREATE) {
    return await db.project.create({
      data: {
        clientId: data.clientId,
        visitorId: data.visitorId,
        discordChatUrl: data.discordChatUrl,
        details: data.details
          ? {
              create: data.details,
            }
          : undefined,
        services: data.services
          ? {
              create: data.services.map((s) => ({
                name: s.name as any,
                childServices: s.childServices,
              })),
            }
          : undefined,
        industries: data.industries
          ? {
              create: data.industries.map((i) => ({
                category: i.category as any,
                subIndustries: i.subIndustries as any[],
              })),
            }
          : undefined,
        technologies: data.technologies
          ? {
              create: data.technologies.map((t) => ({
                category: t.category as any,
                technologies: t.technologies as any[],
              })),
            }
          : undefined,
        features: data.features
          ? {
              create: data.features.map((f) => ({
                category: f.category as any,
                features: f.features as any[],
              })),
            }
          : undefined,
        discount: data.discount
          ? {
              create: {
                type: data.discount.type as any,
                percent: data.discount.percent,
                notes: data.discount.notes,
              },
            }
          : undefined,
        timeline: data.timeline
          ? {
              create: {
                option: data.timeline.option as any,
                rushFeePercent: data.timeline.rushFeePercent,
                estimatedDays: data.timeline.estimatedDays,
                description: data.timeline.description,
              },
            }
          : undefined,
        estimate: data.estimate
          ? {
              create: {
                estimateAccepted: data.estimate.estimateAccepted,
                estimateFinalPriceMin: data.estimate.estimateFinalPriceMin,
                estimateFinalPriceMax: data.estimate.estimateFinalPriceMax,
              },
            }
          : undefined,
        serviceAgreement: data.serviceAgreement
          ? {
              create: {
                documentUrl: data.serviceAgreement.documentUrl,
                agreementVersion: data.serviceAgreement.agreementVersion,
                accepted: data.serviceAgreement.accepted,
                ipAddress: data.serviceAgreement.ipAddress,
                userAgent: data.serviceAgreement.userAgent,
                locale: data.serviceAgreement.locale,
              },
            }
          : undefined,
      },
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
        milestones: true,
      },
    });
  }

  /**
   * Get project by ID with all related data
   */
  async getProjectById(projectId: string) {
    return await db.project.findUnique({
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
        milestones: {
          where: { deletedAt: null },
          orderBy: { deadline: "asc" },
        },
        client: {
          select: {
            uid: true,
            username: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        selectedFreelancers: {
          select: {
            id: true,
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
    });
  }

  /**
   * Get all projects for a client
   */
  async getProjectsByClientId(
    clientId: string,
    params: { page?: number; limit?: number },
  ) {
    const { page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const [projects, totalCount] = await Promise.all([
      db.project.findMany({
        where: { clientId, deletedAt: null },
        include: {
          details: true,
          services: true,
          industries: true,
          technologies: true,
          features: true,
          discount: true,
          timeline: true,
          estimate: true,
          milestones: {
            where: { deletedAt: null },
            orderBy: { deadline: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.project.count({ where: { clientId, deletedAt: null } }),
    ]);

    return {
      projects,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
      },
    };
  }

  /**
   * Get all projects (Admin)
   */
  async getAllProjects(params: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const [projects, totalCount] = await Promise.all([
      db.project.findMany({
        where: { deletedAt: null },
        include: {
          details: true,
          client: {
            select: {
              uid: true,
              fullName: true,
              email: true,
            },
          },
          milestones: {
            where: { deletedAt: null },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.project.count({ where: { deletedAt: null } }),
    ]);

    return {
      projects,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
      },
    };
  }

  /**
   * Update project discord chat URL
   */
  async updateProjectDiscordUrl(projectId: string, discordChatUrl: string) {
    return await db.project.update({
      where: { id: projectId },
      data: { discordChatUrl },
    });
  }

  /**
   * Add milestone to project
   */
  async addMilestone(projectId: string, milestone: TMILESTONE) {
    return await db.milestone.create({
      data: {
        projectId,
        milestoneName: milestone.milestoneName,
        description: milestone.description,
        deadline: new Date(milestone.deadline),
        progress: milestone.progress || 0,
        isMilestoneCompleted: milestone.isMilestoneCompleted || false,
        status: (milestone.status || "PLANNED") as any,
        startedAt: milestone.startedAt ? new Date(milestone.startedAt) : null,
        completedAt: milestone.completedAt
          ? new Date(milestone.completedAt)
          : null,
        priority: milestone.priority as any,
        phase: milestone.phase as any,
        riskLevel: milestone.riskLevel as any,
        blocked: milestone.blocked || false,
        blockerReason: milestone.blockerReason,
        deliverableUrl: milestone.deliverableUrl,
        tags: milestone.tags || [],
        estimatedHours: milestone.estimatedHours,
        actualHours: milestone.actualHours,
        budgetEstimate: milestone.budgetEstimate,
        actualCost: milestone.actualCost,
        assignedFreelancerId: milestone.assignedFreelancerId,
        assigneeName: milestone.assigneeName,
        assigneeEmail: milestone.assigneeEmail,
        notes: milestone.notes,
        approvedBy: milestone.approvedBy,
        approvedAt: milestone.approvedAt
          ? new Date(milestone.approvedAt)
          : null,
      },
    });
  }

  /**
   * Update milestone
   */
  async updateMilestone(milestoneId: string, data: Partial<TMILESTONE>) {
    return await db.milestone.update({
      where: { id: milestoneId },
      data: {
        ...(data.milestoneName && { milestoneName: data.milestoneName }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.deadline && { deadline: new Date(data.deadline) }),
        ...(data.progress !== undefined && { progress: data.progress }),
        ...(data.isMilestoneCompleted !== undefined && {
          isMilestoneCompleted: data.isMilestoneCompleted,
        }),
        ...(data.status && { status: data.status as any }),
        ...(data.startedAt && { startedAt: new Date(data.startedAt) }),
        ...(data.completedAt && { completedAt: new Date(data.completedAt) }),
        ...(data.priority && { priority: data.priority as any }),
        ...(data.phase && { phase: data.phase as any }),
        ...(data.riskLevel && { riskLevel: data.riskLevel as any }),
        ...(data.blocked !== undefined && { blocked: data.blocked }),
        ...(data.blockerReason !== undefined && {
          blockerReason: data.blockerReason,
        }),
        ...(data.deliverableUrl !== undefined && {
          deliverableUrl: data.deliverableUrl,
        }),
        ...(data.tags && { tags: data.tags }),
        ...(data.estimatedHours !== undefined && {
          estimatedHours: data.estimatedHours,
        }),
        ...(data.actualHours !== undefined && {
          actualHours: data.actualHours,
        }),
        ...(data.budgetEstimate !== undefined && {
          budgetEstimate: data.budgetEstimate,
        }),
        ...(data.actualCost !== undefined && { actualCost: data.actualCost }),
        ...(data.assignedFreelancerId !== undefined && {
          assignedFreelancerId: data.assignedFreelancerId,
        }),
        ...(data.assigneeName !== undefined && {
          assigneeName: data.assigneeName,
        }),
        ...(data.assigneeEmail !== undefined && {
          assigneeEmail: data.assigneeEmail,
        }),
        ...(data.notes !== undefined && { notes: data.notes }),
        ...(data.approvedBy !== undefined && { approvedBy: data.approvedBy }),
        ...(data.approvedAt && { approvedAt: new Date(data.approvedAt) }),
      },
    });
  }

  /**
   * Delete milestone (soft delete)
   */
  async deleteMilestone(milestoneId: string) {
    return await db.milestone.update({
      where: { id: milestoneId },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Moderator approve/disapprove milestone
   */
  async moderatorApproveMilestone(
    milestoneId: string,
    approved: boolean,
    moderatorId: string,
    notes?: string,
  ) {
    return await db.milestone.update({
      where: { id: milestoneId },
      data: {
        moderatorApproved: approved,
        moderatorApprovedBy: approved ? moderatorId : null,
        moderatorApprovedAt: approved ? new Date() : null,
        moderatorNotes: notes,
        // Auto-complete milestone when approved
        isMilestoneCompleted: approved ? true : undefined,
        completedAt: approved ? new Date() : undefined,
        status: approved ? "COMPLETED" : undefined,
      },
    });
  }

  /**
   * Assign interested freelancer to project
   */
  async addInterestedFreelancer(projectId: string, freelancerId: string) {
    return await db.project.update({
      where: { id: projectId },
      data: {
        selectedFreelancers: {
          connect: { id: freelancerId },
        },
      },
    });
  }

  /**
   * Select freelancer for project
   */
  async selectFreelancer(projectId: string, freelancerId: string) {
    return await db.project.update({
      where: { id: projectId },
      data: {
        selectedFreelancers: {
          connect: { id: freelancerId },
        },
      },
    });
  }

  /**
   * Remove interested freelancer
   */
  async removeInterestedFreelancer(projectId: string, freelancerId: string) {
    return await db.project.update({
      where: { id: projectId },
      data: {
        selectedFreelancers: {
          disconnect: { id: freelancerId },
        },
      },
    });
  }

  /**
   * Remove selected freelancer
   */
  async removeSelectedFreelancer(projectId: string, freelancerId: string) {
    return await db.project.update({
      where: { id: projectId },
      data: {
        selectedFreelancers: {
          disconnect: { id: freelancerId },
        },
      },
    });
  }

  /**
   * Update project details
   */
  async updateProject(projectId: string, data: any) {
    // Build the update data object
    const updateData: any = {};

    // Update details if provided
    if (data.details) {
      updateData.details = {
        update: data.details,
      };
    }

    // Update services if provided (replace all)
    if (data.services) {
      // First delete existing services, then create new ones
      updateData.services = {
        deleteMany: {},
        create: data.services.map((s: any) => ({
          name: s.name,
          childServices: s.childServices || [],
        })),
      };
    }

    // Update industries if provided (replace all)
    if (data.industries) {
      updateData.industries = {
        deleteMany: {},
        create: data.industries.map((i: any) => ({
          category: i.category,
          subIndustries: i.subIndustries || [],
        })),
      };
    }

    // Update technologies if provided (replace all)
    if (data.technologies) {
      updateData.technologies = {
        deleteMany: {},
        create: data.technologies.map((t: any) => ({
          category: t.category,
          technologies: t.technologies,
        })),
      };
    }

    // Update features if provided (replace all)
    if (data.features) {
      updateData.features = {
        deleteMany: {},
        create: data.features.map((f: any) => ({
          category: f.category,
          features: f.features,
        })),
      };
    }

    // Update discount if provided
    if (data.discount) {
      updateData.discount = {
        upsert: {
          create: {
            type: data.discount.type,
            percent: data.discount.percent,
            notes: data.discount.notes,
          },
          update: {
            type: data.discount.type,
            percent: data.discount.percent,
            notes: data.discount.notes,
          },
        },
      };
    }

    // Update timeline if provided
    if (data.timeline) {
      updateData.timeline = {
        upsert: {
          create: {
            option: data.timeline.option,
            rushFeePercent: data.timeline.rushFeePercent,
            estimatedDays: data.timeline.estimatedDays,
            description: data.timeline.description,
          },
          update: {
            option: data.timeline.option,
            rushFeePercent: data.timeline.rushFeePercent,
            estimatedDays: data.timeline.estimatedDays,
            description: data.timeline.description,
          },
        },
      };
    }

    // Update estimate if provided
    if (data.estimate) {
      updateData.estimate = {
        upsert: {
          create: {
            estimateAccepted: data.estimate.estimateAccepted,
            estimateFinalPriceMin: data.estimate.estimateFinalPriceMin,
            estimateFinalPriceMax: data.estimate.estimateFinalPriceMax,
          },
          update: {
            estimateAccepted: data.estimate.estimateAccepted,
            estimateFinalPriceMin: data.estimate.estimateFinalPriceMin,
            estimateFinalPriceMax: data.estimate.estimateFinalPriceMax,
          },
        },
      };
    }

    // Update discord URL if provided
    if (data.discordChatUrl !== undefined) {
      updateData.discordChatUrl = data.discordChatUrl;
    }

    // Perform the update
    return await db.project.update({
      where: { id: projectId },
      data: updateData,
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
        milestones: {
          where: { deletedAt: null },
          orderBy: { deadline: "asc" },
        },
        client: {
          select: {
            uid: true,
            username: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Delete project (soft delete)
   */
  async deleteProject(projectId: string) {
    return await db.project.update({
      where: { id: projectId },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Toggle acceptingBids status
   */
  async toggleAcceptingBids(projectId: string, acceptingBids: boolean) {
    return await db.project.update({
      where: { id: projectId },
      data: { acceptingBids },
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
        milestones: true,
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
      },
    });
  }
}

export const projectService = new ProjectService();
