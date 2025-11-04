import { db } from "../database/db";
import ProjectPaymentService from "./projectPaymentService";
import logger from "../utils/loggerUtils";

class VisitorConversionService {
  /**
   * Convert a visitor to a project
   * Copies all visitor data to a new project and marks visitor as converted
   * Returns project data with payment checkout URL
   *
   * NOTE: Project creation is resilient - it will proceed even if:
   * - Service agreement is missing or not accepted
   * - Estimate is missing or not accepted
   * - Email sending fails
   * This ensures projects are created "at any cost"
   */
  async convertVisitorToProject(
    visitorId: string,
    clientId: string,
    paymentRedirectUrls?: { successUrl: string; cancelUrl: string },
  ): Promise<any> {
    // Track warnings about missing/incomplete data
    const warnings: string[] = [];

    // Fetch complete visitor data
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

    // Check if already converted (only hard requirement)
    if (visitor.isConverted) {
      throw new Error("Visitor has already been converted to a project");
    }

    // Log warnings for missing data but don't fail
    if (!visitor.estimate) {
      warnings.push("No estimate data found");
      logger.warn(`Converting visitor ${visitorId} without estimate data`);
    } else if (!visitor.estimate.estimateAccepted) {
      warnings.push("Estimate not accepted");
      logger.warn(`Converting visitor ${visitorId} with unaccepted estimate`);
    }

    if (!visitor.serviceAgreement) {
      warnings.push("No service agreement found");
      logger.warn(`Converting visitor ${visitorId} without service agreement`);
    } else if (!visitor.serviceAgreement.accepted) {
      warnings.push("Service agreement not accepted");
      logger.warn(
        `Converting visitor ${visitorId} with unaccepted service agreement`,
      );
    }

    // Create project with all visitor data
    const project = await db.project.create({
      data: {
        clientId,
        visitorId,
        // Create project details
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
        // Copy services
        services: visitor.services
          ? {
              createMany: {
                data: visitor.services.map((s) => ({
                  name: s.name,
                  childServices: s.childServices,
                })),
              },
            }
          : undefined,
        // Copy industries
        industries: visitor.industries
          ? {
              createMany: {
                data: visitor.industries.map((i) => ({
                  category: i.category,
                  subIndustries: i.subIndustries,
                })),
              },
            }
          : undefined,
        // Copy technologies
        technologies: visitor.technologies
          ? {
              createMany: {
                data: visitor.technologies.map((t) => ({
                  category: t.category,
                  technologies: t.technologies,
                })),
              },
            }
          : undefined,
        // Copy features
        features: visitor.features
          ? {
              createMany: {
                data: visitor.features.map((f) => ({
                  category: f.category,
                  features: f.features,
                })),
              },
            }
          : undefined,
        // Copy discount
        discount: visitor.discount
          ? {
              create: {
                type: visitor.discount.type,
                percent: visitor.discount.percent,
                notes: visitor.discount.notes,
              },
            }
          : undefined,
        // Copy timeline
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
        // Copy estimate
        estimate: visitor.estimate
          ? {
              create: {
                estimateAccepted: visitor.estimate.estimateAccepted,
                estimateFinalPriceMin: visitor.estimate.estimateFinalPriceMin,
                estimateFinalPriceMax: visitor.estimate.estimateFinalPriceMax,
                isManuallyAdjusted: visitor.estimate.isManuallyAdjusted,
                baseCost: visitor.estimate.baseCost,
                discountAmount: visitor.estimate.discountAmount,
                rushFeeAmount: visitor.estimate.rushFeeAmount,
                calculatedTotal: visitor.estimate.calculatedTotal,
              },
            }
          : undefined,
        // Copy service agreement
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

    // Mark visitor as converted and link to client
    await db.visitor.update({
      where: { id: visitorId },
      data: {
        isConverted: true,
        convertedAt: new Date(),
        clientId,
      },
    });

    // Create payment checkout session if redirect URLs are provided
    let checkoutSession = null;
    if (paymentRedirectUrls) {
      try {
        checkoutSession =
          await ProjectPaymentService.createProjectCheckoutSession({
            projectId: project.id,
            successUrl: paymentRedirectUrls.successUrl,
            cancelUrl: paymentRedirectUrls.cancelUrl,
          });

        logger.info(
          `Payment checkout session created for project: ${project.id}`,
          {
            projectId: project.id,
            sessionId: checkoutSession.sessionId,
          },
        );
      } catch (error) {
        logger.error(
          "Error creating checkout session during conversion:",
          error,
        );
        // Don't fail the conversion if payment session creation fails
        // The project is already created, payment can be initiated later
      }
    }

    return {
      project,
      checkoutSession,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  /**
   * Check if visitor can be converted
   */
  async canConvertVisitor(visitorId: string): Promise<{
    canConvert: boolean;
    reason?: string;
  }> {
    const visitor = await db.visitor.findUnique({
      where: { id: visitorId },
      include: {
        estimate: true,
        serviceAgreement: true,
      },
    });

    if (!visitor) {
      return { canConvert: false, reason: "Visitor not found" };
    }

    if (visitor.isConverted) {
      return { canConvert: false, reason: "Visitor already converted" };
    }

    if (!visitor.estimate) {
      return { canConvert: false, reason: "No estimate found" };
    }

    if (!visitor.estimate.estimateAccepted) {
      return { canConvert: false, reason: "Estimate not accepted" };
    }

    if (!visitor.serviceAgreement) {
      return { canConvert: false, reason: "Service agreement not signed" };
    }

    if (!visitor.serviceAgreement.accepted) {
      return { canConvert: false, reason: "Service agreement not accepted" };
    }

    return { canConvert: true };
  }
}

export const visitorConversionService = new VisitorConversionService();
