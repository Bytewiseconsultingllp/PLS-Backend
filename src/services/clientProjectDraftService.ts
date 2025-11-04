import { db } from "../database/db";
import type {
  TVISITOR_SERVICE,
  TVISITOR_INDUSTRY,
  TVISITOR_TECHNOLOGY,
  TVISITOR_FEATURE,
  TVISITOR_DISCOUNT,
  TVISITOR_TIMELINE,
  TVISITOR_SERVICE_AGREEMENT,
} from "../types";

export class ClientProjectDraftService {
  /**
   * Step 1: Create a new draft with business details
   * Auto-populates personal info from User model
   */
  async createDraft(
    clientId: string,
    businessDetails: {
      companyName: string;
      companyWebsite?: string;
      businessAddress?: string;
      businessType: string;
    },
    ipAddress?: string,
  ) {
    // Get user details to auto-populate
    const user = await db.user.findUnique({
      where: { uid: clientId },
      select: {
        fullName: true,
        email: true,
        phone: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Create draft with details
    const draft = await db.clientProjectDraft.create({
      data: {
        clientId,
        ipAddress,
        details: {
          create: {
            // Auto-populated from User
            fullName: user.fullName,
            businessEmail: user.email,
            phoneNumber: user.phone || undefined,
            // Client-provided business details
            companyName: businessDetails.companyName,
            companyWebsite: businessDetails.companyWebsite,
            businessAddress: businessDetails.businessAddress,
            businessType: businessDetails.businessType,
          },
        },
      },
      include: {
        details: true,
      },
    });

    return draft;
  }

  /**
   * Get draft by ID with all relations
   */
  async getDraftById(draftId: string, clientId?: string) {
    const where: any = { id: draftId, deletedAt: null };
    if (clientId) {
      where.clientId = clientId;
    }

    return await db.clientProjectDraft.findUnique({
      where,
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
          },
        },
      },
    });
  }

  /**
   * Get all drafts for a client
   */
  async getClientDrafts(clientId: string) {
    return await db.clientProjectDraft.findMany({
      where: {
        clientId,
        deletedAt: null,
      },
      include: {
        details: true,
        estimate: true,
        serviceAgreement: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * Step 2: Add services to draft
   */
  async upsertDraftServices(draftId: string, services: TVISITOR_SERVICE[]) {
    // Delete existing services
    await db.clientProjectDraftService.deleteMany({
      where: { draftId },
    });

    // Create new services
    await db.clientProjectDraftService.createMany({
      data: services.map((service) => ({
        draftId,
        name: service.name as any,
        childServices: service.childServices || [],
      })),
    });

    return await this.getDraftById(draftId);
  }

  /**
   * Step 3: Add industries to draft
   */
  async upsertDraftIndustries(
    draftId: string,
    industries: TVISITOR_INDUSTRY[],
  ) {
    // Delete existing industries
    await db.clientProjectDraftIndustries.deleteMany({
      where: { draftId },
    });

    // Create new industries
    await db.clientProjectDraftIndustries.createMany({
      data: industries.map((industry) => ({
        draftId,
        category: industry.category as any,
        subIndustries: industry.subIndustries as any[],
      })),
    });

    return await this.getDraftById(draftId);
  }

  /**
   * Step 4: Add technologies to draft
   */
  async upsertDraftTechnologies(
    draftId: string,
    technologies: TVISITOR_TECHNOLOGY[],
  ) {
    // Delete existing technologies
    await db.clientProjectDraftTechnologies.deleteMany({
      where: { draftId },
    });

    // Create new technologies
    for (const tech of technologies) {
      await db.clientProjectDraftTechnologies.create({
        data: {
          draftId,
          category: tech.category as any,
          technologies: tech.technologies as any[],
        },
      });
    }

    return await this.getDraftById(draftId);
  }

  /**
   * Step 5: Add features to draft
   */
  async upsertDraftFeatures(draftId: string, features: TVISITOR_FEATURE[]) {
    // Delete existing features
    await db.clientProjectDraftFeatures.deleteMany({
      where: { draftId },
    });

    // Create new features
    for (const feature of features) {
      await db.clientProjectDraftFeatures.create({
        data: {
          draftId,
          category: feature.category as any,
          features: feature.features as any[],
        },
      });
    }

    return await this.getDraftById(draftId);
  }

  /**
   * Step 6: Add discount to draft
   */
  async upsertDraftDiscount(draftId: string, discount: TVISITOR_DISCOUNT) {
    await db.clientProjectDraftDiscount.upsert({
      where: { draftId },
      create: {
        draftId,
        type: discount.type as any,
        percent: discount.percent,
        notes: discount.notes,
      },
      update: {
        type: discount.type as any,
        percent: discount.percent,
        notes: discount.notes,
      },
    });

    return await this.getDraftById(draftId);
  }

  /**
   * Step 7: Add timeline to draft
   * This will trigger estimate calculation
   */
  async upsertDraftTimeline(draftId: string, timeline: TVISITOR_TIMELINE) {
    await db.clientProjectDraftTimeline.upsert({
      where: { draftId },
      create: {
        draftId,
        option: timeline.option as any,
        rushFeePercent: timeline.rushFeePercent,
        estimatedDays: timeline.estimatedDays,
        description: timeline.description,
      },
      update: {
        option: timeline.option as any,
        rushFeePercent: timeline.rushFeePercent,
        estimatedDays: timeline.estimatedDays,
        description: timeline.description,
      },
    });

    return await this.getDraftById(draftId);
  }

  /**
   * Save calculated estimate to draft
   */
  async saveDraftEstimate(
    draftId: string,
    calculation: {
      baseCost: number;
      discountAmount: number;
      rushFeeAmount: number;
      calculatedTotal: number;
      estimateFinalPriceMin: number;
      estimateFinalPriceMax: number;
    },
  ) {
    await db.clientProjectDraftEstimate.upsert({
      where: { draftId },
      create: {
        draftId,
        estimateAccepted: false,
        estimateFinalPriceMin: calculation.estimateFinalPriceMin,
        estimateFinalPriceMax: calculation.estimateFinalPriceMax,
        isManuallyAdjusted: false,
        baseCost: calculation.baseCost,
        discountAmount: calculation.discountAmount,
        rushFeeAmount: calculation.rushFeeAmount,
        calculatedTotal: calculation.calculatedTotal,
      },
      update: {
        estimateFinalPriceMin: calculation.estimateFinalPriceMin,
        estimateFinalPriceMax: calculation.estimateFinalPriceMax,
        baseCost: calculation.baseCost,
        discountAmount: calculation.discountAmount,
        rushFeeAmount: calculation.rushFeeAmount,
        calculatedTotal: calculation.calculatedTotal,
        calculatedAt: new Date(),
      },
    });

    return await this.getDraftById(draftId);
  }

  /**
   * Get draft estimate
   */
  async getDraftEstimate(draftId: string) {
    return await db.clientProjectDraftEstimate.findUnique({
      where: { draftId },
    });
  }

  /**
   * Accept draft estimate
   */
  async acceptDraftEstimate(draftId: string) {
    await db.clientProjectDraftEstimate.update({
      where: { draftId },
      data: {
        estimateAccepted: true,
      },
    });

    return await this.getDraftEstimate(draftId);
  }

  /**
   * Step 8: Add service agreement to draft
   */
  async upsertDraftServiceAgreement(
    draftId: string,
    agreement: TVISITOR_SERVICE_AGREEMENT,
  ) {
    await db.clientProjectDraftServiceAgreement.upsert({
      where: { draftId },
      create: {
        draftId,
        documentUrl: agreement.documentUrl,
        agreementVersion: agreement.agreementVersion,
        accepted: agreement.accepted ?? true,
        ipAddress: agreement.ipAddress,
        userAgent: agreement.userAgent,
        locale: agreement.locale,
      },
      update: {
        documentUrl: agreement.documentUrl,
        agreementVersion: agreement.agreementVersion,
        accepted: agreement.accepted ?? true,
        ipAddress: agreement.ipAddress,
        userAgent: agreement.userAgent,
        locale: agreement.locale,
        acceptedAt: new Date(),
      },
    });

    return await this.getDraftById(draftId);
  }

  /**
   * Finalize draft and create actual project
   */
  async finalizeDraft(draftId: string, clientId: string) {
    const draft = await this.getDraftById(draftId, clientId);

    if (!draft) {
      throw new Error("Draft not found");
    }

    if (draft.isFinalized) {
      throw new Error("Draft has already been finalized");
    }

    // Validate that all required steps are completed
    if (!draft.estimate?.estimateAccepted) {
      throw new Error("Estimate must be accepted before finalizing");
    }

    if (!draft.serviceAgreement?.accepted) {
      throw new Error("Service agreement must be accepted before finalizing");
    }

    // Create project from draft
    const project = await db.project.create({
      data: {
        clientId,
        details: draft.details
          ? {
              create: {
                fullName: draft.details.fullName,
                businessEmail: draft.details.businessEmail,
                phoneNumber: draft.details.phoneNumber,
                companyName: draft.details.companyName,
                companyWebsite: draft.details.companyWebsite,
                businessAddress: draft.details.businessAddress,
                businessType: draft.details.businessType,
                referralSource: "CLIENT_DRAFT",
              },
            }
          : undefined,
        services: {
          createMany: {
            data: draft.services.map((s) => ({
              name: s.name,
              childServices: s.childServices,
            })),
          },
        },
        industries: {
          createMany: {
            data: draft.industries.map((i) => ({
              category: i.category,
              subIndustries: i.subIndustries,
            })),
          },
        },
        technologies: {
          createMany: {
            data: draft.technologies.map((t) => ({
              category: t.category,
              technologies: t.technologies,
            })),
          },
        },
        features: {
          createMany: {
            data: draft.features.map((f) => ({
              category: f.category,
              features: f.features,
            })),
          },
        },
        discount: draft.discount
          ? {
              create: {
                type: draft.discount.type,
                percent: draft.discount.percent,
                notes: draft.discount.notes,
              },
            }
          : undefined,
        timeline: draft.timeline
          ? {
              create: {
                option: draft.timeline.option,
                rushFeePercent: draft.timeline.rushFeePercent,
                estimatedDays: draft.timeline.estimatedDays,
                description: draft.timeline.description,
              },
            }
          : undefined,
        estimate: draft.estimate
          ? {
              create: {
                estimateAccepted: draft.estimate.estimateAccepted,
                estimateFinalPriceMin: draft.estimate.estimateFinalPriceMin,
                estimateFinalPriceMax: draft.estimate.estimateFinalPriceMax,
                isManuallyAdjusted: draft.estimate.isManuallyAdjusted,
                baseCost: draft.estimate.baseCost,
                discountAmount: draft.estimate.discountAmount,
                rushFeeAmount: draft.estimate.rushFeeAmount,
                calculatedTotal: draft.estimate.calculatedTotal,
              },
            }
          : undefined,
        serviceAgreement: draft.serviceAgreement
          ? {
              create: {
                documentUrl: draft.serviceAgreement.documentUrl,
                agreementVersion: draft.serviceAgreement.agreementVersion,
                accepted: draft.serviceAgreement.accepted,
                ipAddress: draft.serviceAgreement.ipAddress,
                userAgent: draft.serviceAgreement.userAgent,
                locale: draft.serviceAgreement.locale,
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

    // Mark draft as finalized
    await db.clientProjectDraft.update({
      where: { id: draftId },
      data: {
        isFinalized: true,
        finalizedAt: new Date(),
        projectId: project.id,
      },
    });

    return project;
  }

  /**
   * Delete a draft
   */
  async deleteDraft(draftId: string, clientId: string) {
    const draft = await this.getDraftById(draftId, clientId);

    if (!draft) {
      throw new Error("Draft not found");
    }

    if (draft.isFinalized) {
      throw new Error("Cannot delete a finalized draft");
    }

    await db.clientProjectDraft.update({
      where: { id: draftId },
      data: {
        deletedAt: new Date(),
      },
    });

    return { success: true, message: "Draft deleted successfully" };
  }

  /**
   * Calculate estimate for draft
   * This method delegates to EstimateCalculationService
   */
  async calculateDraftEstimate(draftId: string) {
    const draft = await this.getDraftById(draftId);

    if (!draft) {
      return null;
    }

    // Check if we have minimum required data
    if (!draft.services || draft.services.length === 0 || !draft.timeline) {
      return null;
    }

    // Flatten technologies and features arrays
    const allTechnologies =
      draft.technologies?.flatMap((t) => t.technologies) || [];
    const allFeatures = draft.features?.flatMap((f) => f.features) || [];

    // Import and use estimate calculation service
    const { estimateCalculationService } = await import(
      "./estimateCalculationService"
    );

    const serviceCategories = draft.services.map((s) => s.name);

    // Use the private method through a public interface
    return await (estimateCalculationService as any).calculateEstimate(
      serviceCategories,
      allTechnologies,
      allFeatures,
      draft.discount?.type || "NOT_ELIGIBLE",
      draft.timeline.option,
    );
  }
}

export const clientProjectDraftService = new ClientProjectDraftService();
