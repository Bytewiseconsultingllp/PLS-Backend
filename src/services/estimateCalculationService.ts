import { db } from "../database/db";
import { Decimal } from "@prisma/client/runtime/library";

interface EstimateCalculation {
  baseCost: number;
  discountAmount: number;
  discountPercent: number;
  rushFeeAmount: number;
  rushFeePercent: number;
  calculatedTotal: number;
  estimateFinalPriceMin: number;
  estimateFinalPriceMax: number;
  breakdown: {
    services: Array<{ category: string; cost: number }>;
    technologies: Array<{ name: string; cost: number }>;
    features: Array<{ name: string; cost: number }>;
  };
}

class EstimateCalculationService {
  /**
   * Get discount percentage based on discount type
   */
  private getDiscountPercentage(discountType: string): number {
    const discountMap: Record<string, number> = {
      STARTUP_FOUNDER: 10,
      VETERAN_OWNED_BUSINESS: 15,
      NONPROFIT_ORGANIZATION: 15,
      NOT_ELIGIBLE: 0,
    };
    return discountMap[discountType] || 0;
  }

  /**
   * Get rush fee percentage based on timeline option
   */
  private getRushFeePercentage(timelineOption: string): number {
    const rushFeeMap: Record<string, number> = {
      STANDARD_BUILD: 0,
      PRIORITY_BUILD: 5,
      ACCELERATED_BUILD: 10,
      RAPID_BUILD: 15,
      FAST_TRACK_BUILD: 20,
    };
    return rushFeeMap[timelineOption] || 0;
  }

  /**
   * Calculate estimate for a visitor
   */
  async calculateVisitorEstimate(
    visitorId: string,
  ): Promise<EstimateCalculation | null> {
    // Fetch visitor with all related data
    const visitor = await db.visitor.findUnique({
      where: { id: visitorId },
      include: {
        services: true,
        technologies: true,
        features: true,
        discount: true,
        timeline: true,
      },
    });

    if (!visitor) {
      return null;
    }

    // Check if we have minimum required data (services and timeline)
    if (
      !visitor.services ||
      visitor.services.length === 0 ||
      !visitor.timeline
    ) {
      return null;
    }

    // Flatten technologies and features arrays
    const allTechnologies =
      visitor.technologies?.flatMap((t) => t.technologies) || [];
    const allFeatures = visitor.features?.flatMap((f) => f.features) || [];

    return this.calculateEstimate(
      visitor.services.map((s) => s.name),
      allTechnologies,
      allFeatures,
      visitor.discount?.type || "NOT_ELIGIBLE",
      visitor.timeline.option,
    );
  }

  /**
   * Calculate estimate for a project
   */
  async calculateProjectEstimate(
    projectId: string,
  ): Promise<EstimateCalculation | null> {
    // Fetch project with all related data
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        services: true,
        technologies: true,
        features: true,
        discount: true,
        timeline: true,
      },
    });

    if (!project) {
      return null;
    }

    // Check if we have minimum required data
    if (
      !project.services ||
      project.services.length === 0 ||
      !project.timeline
    ) {
      return null;
    }

    // Flatten technologies and features arrays
    const allTechnologies =
      project.technologies?.flatMap((t) => t.technologies) || [];
    const allFeatures = project.features?.flatMap((f) => f.features) || [];

    return this.calculateEstimate(
      project.services.map((s) => s.name),
      allTechnologies,
      allFeatures,
      project.discount?.type || "NOT_ELIGIBLE",
      project.timeline.option,
    );
  }

  /**
   * Core calculation logic
   */
  private async calculateEstimate(
    serviceCategories: string[],
    technologies: string[],
    features: string[],
    discountType: string,
    timelineOption: string,
  ): Promise<EstimateCalculation> {
    let baseCost = 0;
    const breakdown = {
      services: [] as Array<{ category: string; cost: number }>,
      technologies: [] as Array<{ name: string; cost: number }>,
      features: [] as Array<{ name: string; cost: number }>,
    };

    // Calculate service costs
    for (const category of serviceCategories) {
      const pricingData = await db.pricingServiceCategory.findUnique({
        where: { category: category as any, isActive: true },
      });
      if (pricingData) {
        const cost = Number(pricingData.basePrice);
        baseCost += cost;
        breakdown.services.push({ category, cost });
      }
    }

    // Add technology costs
    for (const tech of technologies) {
      const pricingData = await db.pricingTechnology.findFirst({
        where: { technology: tech, isActive: true },
      });
      if (pricingData) {
        const cost = Number(pricingData.additionalCost);
        baseCost += cost;
        breakdown.technologies.push({ name: tech, cost });
      }
    }

    // Add feature costs
    for (const feature of features) {
      const pricingData = await db.pricingFeature.findFirst({
        where: { feature: feature, isActive: true },
      });
      if (pricingData) {
        const cost = Number(pricingData.additionalCost);
        baseCost += cost;
        breakdown.features.push({ name: feature, cost });
      }
    }

    // Calculate discount
    const discountPercent = this.getDiscountPercentage(discountType);
    const discountAmount = (baseCost * discountPercent) / 100;

    // Calculate rush fee (applied after discount)
    const rushFeePercent = this.getRushFeePercentage(timelineOption);
    const afterDiscount = baseCost - discountAmount;
    const rushFeeAmount = (afterDiscount * rushFeePercent) / 100;

    // Calculate total
    const calculatedTotal = afterDiscount + rushFeeAmount;

    // Calculate min/max with 10% variance
    const estimateFinalPriceMin = calculatedTotal * 0.9; // -10%
    const estimateFinalPriceMax = calculatedTotal * 1.1; // +10%

    return {
      baseCost: Math.round(baseCost * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      discountPercent,
      rushFeeAmount: Math.round(rushFeeAmount * 100) / 100,
      rushFeePercent,
      calculatedTotal: Math.round(calculatedTotal * 100) / 100,
      estimateFinalPriceMin: Math.round(estimateFinalPriceMin * 100) / 100,
      estimateFinalPriceMax: Math.round(estimateFinalPriceMax * 100) / 100,
      breakdown,
    };
  }

  /**
   * Save calculated estimate to database (for visitors)
   */
  async saveVisitorEstimate(
    visitorId: string,
    calculation: EstimateCalculation,
  ) {
    return await db.visitorEstimate.upsert({
      where: { visitorId },
      create: {
        visitorId,
        estimateAccepted: false,
        estimateFinalPriceMin: new Decimal(calculation.estimateFinalPriceMin),
        estimateFinalPriceMax: new Decimal(calculation.estimateFinalPriceMax),
        isManuallyAdjusted: false,
        baseCost: new Decimal(calculation.baseCost),
        discountAmount: new Decimal(calculation.discountAmount),
        rushFeeAmount: new Decimal(calculation.rushFeeAmount),
        calculatedTotal: new Decimal(calculation.calculatedTotal),
      },
      update: {
        estimateAccepted: false,
        estimateFinalPriceMin: new Decimal(calculation.estimateFinalPriceMin),
        estimateFinalPriceMax: new Decimal(calculation.estimateFinalPriceMax),
        isManuallyAdjusted: false,
        baseCost: new Decimal(calculation.baseCost),
        discountAmount: new Decimal(calculation.discountAmount),
        rushFeeAmount: new Decimal(calculation.rushFeeAmount),
        calculatedTotal: new Decimal(calculation.calculatedTotal),
        calculatedAt: new Date(),
      },
    });
  }

  /**
   * Save calculated estimate to database (for projects)
   */
  async saveProjectEstimate(
    projectId: string,
    calculation: EstimateCalculation,
  ) {
    return await db.projectEstimate.upsert({
      where: { projectId },
      create: {
        projectId,
        estimateAccepted: false,
        estimateFinalPriceMin: new Decimal(calculation.estimateFinalPriceMin),
        estimateFinalPriceMax: new Decimal(calculation.estimateFinalPriceMax),
        isManuallyAdjusted: false,
        baseCost: new Decimal(calculation.baseCost),
        discountAmount: new Decimal(calculation.discountAmount),
        rushFeeAmount: new Decimal(calculation.rushFeeAmount),
        calculatedTotal: new Decimal(calculation.calculatedTotal),
      },
      update: {
        estimateAccepted: false,
        estimateFinalPriceMin: new Decimal(calculation.estimateFinalPriceMin),
        estimateFinalPriceMax: new Decimal(calculation.estimateFinalPriceMax),
        isManuallyAdjusted: false,
        baseCost: new Decimal(calculation.baseCost),
        discountAmount: new Decimal(calculation.discountAmount),
        rushFeeAmount: new Decimal(calculation.rushFeeAmount),
        calculatedTotal: new Decimal(calculation.calculatedTotal),
        calculatedAt: new Date(),
      },
    });
  }

  /**
   * Admin override estimate (for visitors)
   */
  async adminOverrideVisitorEstimate(
    visitorId: string,
    minPrice: number,
    maxPrice: number,
  ) {
    return await db.visitorEstimate.update({
      where: { visitorId },
      data: {
        estimateFinalPriceMin: new Decimal(minPrice),
        estimateFinalPriceMax: new Decimal(maxPrice),
        isManuallyAdjusted: true,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Admin override estimate (for projects)
   */
  async adminOverrideProjectEstimate(
    projectId: string,
    minPrice: number,
    maxPrice: number,
  ) {
    return await db.projectEstimate.update({
      where: { projectId },
      data: {
        estimateFinalPriceMin: new Decimal(minPrice),
        estimateFinalPriceMax: new Decimal(maxPrice),
        isManuallyAdjusted: true,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Accept estimate (for visitors)
   */
  async acceptVisitorEstimate(visitorId: string) {
    return await db.visitorEstimate.update({
      where: { visitorId },
      data: {
        estimateAccepted: true,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Accept estimate (for projects)
   */
  async acceptProjectEstimate(projectId: string) {
    return await db.projectEstimate.update({
      where: { projectId },
      data: {
        estimateAccepted: true,
        updatedAt: new Date(),
      },
    });
  }
}

export const estimateCalculationService = new EstimateCalculationService();
