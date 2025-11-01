import { db } from "../database/db";
import type {
  TVISITOR_DETAILS,
  TVISITOR_SERVICE,
  TVISITOR_INDUSTRY,
  TVISITOR_TECHNOLOGY,
  TVISITOR_FEATURE,
  TVISITOR_DISCOUNT,
  TVISITOR_TIMELINE,
  TVISITOR_ESTIMATE,
  TVISITOR_SERVICE_AGREEMENT,
} from "../types";

export class VisitorService {
  /**
   * Create a new visitor with basic details
   */
  async createVisitor(data: { clientId?: string; ipAddress?: string }) {
    return await db.visitor.create({
      data: {
        clientId: data.clientId,
        ipAddress: data.ipAddress,
      },
      select: {
        id: true,
        clientId: true,
        ipAddress: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Add or update visitor details
   */
  async upsertVisitorDetails(visitorId: string, details: TVISITOR_DETAILS) {
    return await db.visitorDetails.upsert({
      where: { visitorId },
      create: {
        visitorId,
        ...details,
      },
      update: details,
    });
  }

  /**
   * Add visitor service selections
   */
  async addVisitorServices(visitorId: string, services: TVISITOR_SERVICE[]) {
    // Delete existing services for this visitor
    await db.visitorService.deleteMany({
      where: { visitorId },
    });

    // Create new services
    return await db.visitorService.createMany({
      data: services.map((service) => ({
        visitorId,
        name: service.name as any, // ServiceCategory enum
        childServices: service.childServices,
      })),
    });
  }

  /**
   * Add visitor industry selections
   */
  async addVisitorIndustries(
    visitorId: string,
    industries: TVISITOR_INDUSTRY[],
  ) {
    // Delete existing industries for this visitor
    await db.visitorIndustries.deleteMany({
      where: { visitorId },
    });

    // Create new industries
    return await db.visitorIndustries.createMany({
      data: industries.map((industry) => ({
        visitorId,
        category: industry.category as any,
        subIndustries: industry.subIndustries as any[],
      })),
    });
  }

  /**
   * Add visitor technology selections
   */
  async addVisitorTechnologies(
    visitorId: string,
    technologies: TVISITOR_TECHNOLOGY[],
  ) {
    // Delete existing technologies
    await db.visitorTechnologies.deleteMany({
      where: { visitorId },
    });

    // Create new technologies
    return await db.visitorTechnologies.createMany({
      data: technologies.map((tech) => ({
        visitorId,
        category: tech.category as any,
        technologies: tech.technologies as any[],
      })),
    });
  }

  /**
   * Add visitor feature selections
   */
  async addVisitorFeatures(visitorId: string, features: TVISITOR_FEATURE[]) {
    // Delete existing features
    await db.visitorFeatures.deleteMany({
      where: { visitorId },
    });

    // Create new features
    return await db.visitorFeatures.createMany({
      data: features.map((feature) => ({
        visitorId,
        category: feature.category as any,
        features: feature.features as any[],
      })),
    });
  }

  /**
   * Add or update visitor discount
   */
  async upsertVisitorDiscount(visitorId: string, discount: TVISITOR_DISCOUNT) {
    return await db.visitorDiscount.upsert({
      where: { visitorId },
      create: {
        visitorId,
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
  }

  /**
   * Add or update visitor timeline
   */
  async upsertVisitorTimeline(visitorId: string, timeline: TVISITOR_TIMELINE) {
    return await db.visitorTimeline.upsert({
      where: { visitorId },
      create: {
        visitorId,
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
  }

  /**
   * Add or update visitor estimate
   */
  async upsertVisitorEstimate(visitorId: string, estimate: TVISITOR_ESTIMATE) {
    return await db.visitorEstimate.upsert({
      where: { visitorId },
      create: {
        visitorId,
        estimateAccepted: estimate.estimateAccepted,
        estimateFinalPriceMin: estimate.estimateFinalPriceMin,
        estimateFinalPriceMax: estimate.estimateFinalPriceMax,
      },
      update: {
        estimateAccepted: estimate.estimateAccepted,
        estimateFinalPriceMin: estimate.estimateFinalPriceMin,
        estimateFinalPriceMax: estimate.estimateFinalPriceMax,
      },
    });
  }

  /**
   * Add or update visitor service agreement
   */
  async upsertVisitorServiceAgreement(
    visitorId: string,
    agreement: TVISITOR_SERVICE_AGREEMENT,
  ) {
    return await db.visitorServiceAgreement.upsert({
      where: { visitorId },
      create: {
        visitorId,
        documentUrl: agreement.documentUrl,
        agreementVersion: agreement.agreementVersion,
        accepted: agreement.accepted,
        ipAddress: agreement.ipAddress,
        userAgent: agreement.userAgent,
        locale: agreement.locale,
      },
      update: {
        documentUrl: agreement.documentUrl,
        agreementVersion: agreement.agreementVersion,
        accepted: agreement.accepted,
        ipAddress: agreement.ipAddress,
        userAgent: agreement.userAgent,
        locale: agreement.locale,
      },
    });
  }

  /**
   * Get visitor by ID with all related data
   */
  async getVisitorById(visitorId: string) {
    return await db.visitor.findUnique({
      where: { id: visitorId, deletedAt: null },
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
   * Get visitor by email
   */
  async getVisitorByEmail(email: string) {
    return await db.visitor.findFirst({
      where: {
        details: {
          businessEmail: email,
        },
        deletedAt: null,
      },
      include: {
        details: true,
        client: {
          select: {
            uid: true,
            email: true,
            fullName: true,
          },
        },
      },
    });
  }

  /**
   * Get all visitors with pagination
   */
  async getAllVisitors(params: {
    page?: number;
    limit?: number;
    clientId?: string;
  }) {
    const { page = 1, limit = 10, clientId } = params;
    const skip = (page - 1) * limit;

    const whereClause: any = { deletedAt: null };
    if (clientId) {
      whereClause.clientId = clientId;
    }

    const [visitors, totalCount] = await Promise.all([
      db.visitor.findMany({
        where: whereClause,
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
        skip,
        take: limit,
      }),
      db.visitor.count({ where: whereClause }),
    ]);

    return {
      visitors,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        limit,
      },
    };
  }

  /**
   * Link visitor to client
   */
  async linkVisitorToClient(visitorId: string, clientId: string) {
    return await db.visitor.update({
      where: { id: visitorId },
      data: { clientId },
    });
  }

  /**
   * Delete visitor (soft delete)
   */
  async deleteVisitor(visitorId: string) {
    return await db.visitor.update({
      where: { id: visitorId },
      data: { deletedAt: new Date() },
    });
  }

  /**
   * Check if visitor email already exists in User table (is a client)
   */
  async checkIfEmailIsClient(email: string) {
    const user = await db.user.findUnique({
      where: { email },
      select: {
        uid: true,
        email: true,
        fullName: true,
        role: true,
      },
    });

    return user;
  }
}

export const visitorService = new VisitorService();
