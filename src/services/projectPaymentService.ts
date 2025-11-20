import { db } from "../database/db";
import type { Payment } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import StripeService from "./stripeService";
import CurrencyDetectionService from "./currencyDetectionService";
import CurrencyConversionService from "./currencyConversionService";
import { PLATFORM_CURRENCY } from "../constants/currency";
import logger from "../utils/loggerUtils";

interface CreateProjectCheckoutSessionData {
  projectId: string;
  successUrl: string;
  cancelUrl: string;
  currency?: string;
  depositPercentage?: number; // e.g., 25 for 25%
  customAmount?: number; // Custom amount in dollars
}

interface ProjectCheckoutSessionResponse {
  sessionId: string;
  checkoutUrl: string;
  paymentId: string;
}

export class ProjectPaymentService {
  /**
   * Create a checkout session for a project payment
   * Supports full payment, deposit (percentage), or custom amount
   */
  static async createProjectCheckoutSession(
    data: CreateProjectCheckoutSessionData,
  ): Promise<ProjectCheckoutSessionResponse> {
    const {
      projectId,
      successUrl,
      cancelUrl,
      currency = "usd",
      depositPercentage,
      customAmount,
    } = data;

    try {
      // Fetch project with estimate and details
      const project = await db.project.findUnique({
        where: { id: projectId },
        include: {
          estimate: true,
          details: true,
          client: true,
        },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      if (!project.estimate) {
        throw new Error("Project estimate not found");
      }

      // Calculate total if it's missing or zero
      let calculatedTotal = project.estimate.calculatedTotal;

      if (!calculatedTotal || Number(calculatedTotal) <= 0) {
        // Calculate from components: baseCost - discountAmount + rushFeeAmount
        const baseCost = Number(project.estimate.baseCost || 0);
        const discountAmount = Number(project.estimate.discountAmount || 0);
        const rushFeeAmount = Number(project.estimate.rushFeeAmount || 0);

        const recalculatedAmount = baseCost - discountAmount + rushFeeAmount;

        logger.warn(
          `Project ${projectId} had calculatedTotal of ${project.estimate.calculatedTotal?.toString() || 0}, recalculated to ${recalculatedAmount}`,
        );

        // Update the estimate with the calculated total
        await db.projectEstimate.update({
          where: { projectId },
          data: { calculatedTotal: new Decimal(recalculatedAmount) },
        });

        calculatedTotal = new Decimal(recalculatedAmount);
      }

      // Check if this is the first payment
      const currentTotalPaid = Number(project.totalAmountPaid || 0);
      const isFirstPayment = currentTotalPaid === 0;

      // Calculate payment amount based on type
      const fullProjectAmountInPlatformCurrency = Number(calculatedTotal);
      let amountInPlatformCurrency: number;
      let actualDepositPercentage: number;
      let paymentType: "FULL" | "DEPOSIT" | "INSTALLMENT";
      let paymentLabel: string;

      if (customAmount !== undefined && customAmount > 0) {
        // Custom amount specified
        amountInPlatformCurrency = customAmount;
        actualDepositPercentage =
          fullProjectAmountInPlatformCurrency > 0
            ? (customAmount / fullProjectAmountInPlatformCurrency) * 100
            : 0;
        paymentType = actualDepositPercentage >= 100 ? "FULL" : "INSTALLMENT";
        paymentLabel = `Payment (${actualDepositPercentage.toFixed(2)}%)`;
      } else if (depositPercentage !== undefined && depositPercentage > 0) {
        // Percentage specified
        actualDepositPercentage = depositPercentage;
        amountInPlatformCurrency =
          (fullProjectAmountInPlatformCurrency * depositPercentage) / 100;
        paymentType = depositPercentage >= 100 ? "FULL" : "DEPOSIT";
        paymentLabel =
          depositPercentage >= 100
            ? "Full Payment"
            : `Deposit (${depositPercentage}%)`;
      } else {
        // Default to 25% deposit
        actualDepositPercentage = 25;
        amountInPlatformCurrency =
          (fullProjectAmountInPlatformCurrency * 25) / 100;
        paymentType = "DEPOSIT";
        paymentLabel = "Initial Deposit (25%)";
      }

      // ✅ VALIDATION: First payment must be at least 25%
      if (isFirstPayment && actualDepositPercentage < 25) {
        throw new Error(
          `First payment must be at least 25% of the project total. ` +
            `You attempted to pay ${actualDepositPercentage.toFixed(
              2,
            )}% (${amountInPlatformCurrency.toFixed(2)} ${PLATFORM_CURRENCY.toUpperCase()}). ` +
            `Minimum required: ${(fullProjectAmountInPlatformCurrency * 0.25).toFixed(2)} ${PLATFORM_CURRENCY.toUpperCase()} (25%)`,
        );
      }

      // Normalize currency code for Stripe
      const normalizedCurrency =
        CurrencyDetectionService.normalizeCurrency(currency) || "usd";

      // Convert platform amount to client currency if needed
      let clientCurrencyAmount = amountInPlatformCurrency;
      let appliedExchangeRate: number | undefined =
        normalizedCurrency === PLATFORM_CURRENCY ? 1 : undefined;

      if (normalizedCurrency !== PLATFORM_CURRENCY) {
        try {
          const conversion = await CurrencyConversionService.convert({
            amount: amountInPlatformCurrency,
            fromCurrency: PLATFORM_CURRENCY,
            toCurrency: normalizedCurrency,
          });
          clientCurrencyAmount = conversion.convertedAmount;
          appliedExchangeRate = conversion.exchangeRate;
        } catch (conversionError) {
          logger.warn(
            "Currency conversion failed, falling back to platform amount",
            {
              projectId,
              fromCurrency: PLATFORM_CURRENCY,
              toCurrency: normalizedCurrency,
              error: conversionError,
            },
          );
          clientCurrencyAmount = amountInPlatformCurrency;
          appliedExchangeRate = undefined;
        }
      }

      const roundedClientAmount = CurrencyDetectionService.isZeroDecimal(
        normalizedCurrency,
      )
        ? Math.round(clientCurrencyAmount)
        : Number(clientCurrencyAmount.toFixed(2));

      // Convert to minor units for Stripe
      const amountInMinorUnits = CurrencyDetectionService.convertToMinorUnits(
        roundedClientAmount,
        normalizedCurrency,
      );

      if (amountInMinorUnits <= 0) {
        throw new Error(
          `Invalid payment amount: ${roundedClientAmount} ${normalizedCurrency.toUpperCase()} (${amountInMinorUnits} minor units)`,
        );
      }

      const formatAmountForDisplay = (
        amount: number,
        currencyCode: string,
      ): string => {
        try {
          return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currencyCode.toUpperCase(),
            minimumFractionDigits: CurrencyDetectionService.isZeroDecimal(
              currencyCode,
            )
              ? 0
              : 2,
            maximumFractionDigits: CurrencyDetectionService.isZeroDecimal(
              currencyCode,
            )
              ? 0
              : 2,
          }).format(amount);
        } catch {
          const fallbackAmount = CurrencyDetectionService.isZeroDecimal(
            currencyCode,
          )
            ? Math.round(amount).toString()
            : amount.toFixed(2);
          return `${fallbackAmount} ${currencyCode.toUpperCase()}`;
        }
      };

      const paymentDescription = `${paymentLabel} - ${formatAmountForDisplay(
        roundedClientAmount,
        normalizedCurrency,
      )}`;

      logger.info(`Creating checkout session for project ${projectId}`, {
        fullAmount: fullProjectAmountInPlatformCurrency,
        platformPaymentAmount: amountInPlatformCurrency,
        clientCurrencyAmount: roundedClientAmount,
        percentage: actualDepositPercentage,
        paymentType,
        currency: normalizedCurrency,
        exchangeRate: appliedExchangeRate,
      });

      // Get customer details
      const customerEmail =
        project.details?.businessEmail || project.client.email;
      const customerName = project.details?.fullName || project.client.fullName;
      const companyName = project.details?.companyName || "";

      // Create checkout session in Stripe
      const session = await StripeService.createCheckoutSession({
        amount: amountInMinorUnits,
        currency: normalizedCurrency,
        customerEmail,
        customerName,
        successUrl,
        cancelUrl,
        description: `${paymentDescription} - ${companyName}`,
        metadata: {
          projectId: project.id,
          clientId: project.clientId,
          visitorId: project.visitorId || "",
          type: "project_payment",
          paymentType,
          depositPercentage: actualDepositPercentage.toString(),
          platformCurrency: PLATFORM_CURRENCY,
          platformAmount: amountInPlatformCurrency.toString(),
          clientCurrencyAmount: roundedClientAmount.toString(),
          clientCurrency: normalizedCurrency,
          exchangeRate: appliedExchangeRate?.toString() || "",
          fullProjectAmount: fullProjectAmountInPlatformCurrency.toString(),
        },
      });

      // Save payment record to database
      const payment = await db.payment.create({
        data: {
          stripeSessionId: session.id,
          amount: amountInMinorUnits,
          currency: normalizedCurrency,
          originalCurrency: normalizedCurrency,
          originalAmount: new Decimal(
            CurrencyDetectionService.isZeroDecimal(normalizedCurrency)
              ? Math.round(roundedClientAmount).toString()
              : roundedClientAmount.toFixed(2),
          ),
          platformCurrency: PLATFORM_CURRENCY,
          platformAmount: new Decimal(amountInPlatformCurrency.toFixed(2)),
          ...(appliedExchangeRate
            ? {
                exchangeRate: new Decimal(appliedExchangeRate.toFixed(6)),
              }
            : {}),
          clientEmail: customerEmail,
          clientName: customerName,
          status: "PENDING",
          description: `${paymentDescription} - ${companyName}`,
          paymentType,
          depositPercentage: new Decimal(actualDepositPercentage),
          fullProjectAmount: new Decimal(fullProjectAmountInPlatformCurrency),
          metadata: {
            projectId: project.id,
            clientId: project.clientId,
            visitorId: project.visitorId || "",
            type: "project_payment",
            paymentType,
            depositPercentage: actualDepositPercentage.toString(),
            platformCurrency: PLATFORM_CURRENCY,
            platformAmount: amountInPlatformCurrency.toString(),
            clientCurrencyAmount: roundedClientAmount.toString(),
            clientCurrency: normalizedCurrency,
            exchangeRate: appliedExchangeRate?.toString() || "",
            fullProjectAmount: fullProjectAmountInPlatformCurrency.toString(),
          },
          userId: project.clientId,
          projectId: project.id,
          visitorId: project.visitorId,
        },
      });

      logger.info(`Checkout session created for project: ${projectId}`, {
        sessionId: session.id,
        paymentId: payment.id,
        amount: amountInMinorUnits,
        projectId,
      });

      return {
        sessionId: session.id,
        checkoutUrl: session.url || "",
        paymentId: payment.id,
      };
    } catch (error) {
      logger.error("Error creating project checkout session:", error);
      throw error;
    }
  }

  /**
   * Update project payment status
   */
  static async updateProjectPaymentStatus(
    projectId: string,
    status: "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELED" | "REFUNDED",
  ): Promise<void> {
    try {
      await db.project.update({
        where: { id: projectId },
        data: {
          paymentStatus: status,
        },
      });

      logger.info(`Updated project payment status: ${projectId}`, {
        projectId,
        status,
      });
    } catch (error) {
      logger.error("Error updating project payment status:", error);
      throw error;
    }
  }

  /**
   * Get project payment status
   */
  static async getProjectPaymentStatus(projectId: string): Promise<{
    paymentStatus: string;
    payments: Payment[];
  }> {
    try {
      const project = await db.project.findUnique({
        where: { id: projectId },
        include: {
          payments: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

      if (!project) {
        throw new Error("Project not found");
      }

      return {
        paymentStatus: project.paymentStatus,
        payments: project.payments,
      };
    } catch (error) {
      logger.error("Error getting project payment status:", error);
      throw error;
    }
  }

  /**
   * Check if project payment is completed
   */
  static async isProjectPaid(projectId: string): Promise<boolean> {
    try {
      const project = await db.project.findUnique({
        where: { id: projectId },
        select: {
          paymentStatus: true,
        },
      });

      return project?.paymentStatus === "SUCCEEDED";
    } catch (error) {
      logger.error("Error checking if project is paid:", error);
      return false;
    }
  }
}

export default ProjectPaymentService;
