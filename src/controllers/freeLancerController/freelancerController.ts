/**
 * FreelancerController.ts
 * Handles public and freelancer-authenticated routes
 */

import type { Request, Response } from "express";
import fs from "node:fs/promises";
import path from "node:path";
import freelancerService from "../../services/freelancerService";
import {
  FreelancerRegistrationSchema,
  CreateFreelancerBidSchema,
  GetBidsQuerySchema,
} from "../../validation/freelancerValidation";
import { sendFreelancerRegistrationEmail } from "../../services/globalMailService";
import { uploadOnCloudinary } from "../../services/cloudinaryService";
import { ZodError } from "zod";

interface AcceptPlatformAgreementBody {
  freelancerEmail: string;
  fullName: string;
  country: string;
  accepted: boolean;
}

interface UploadRegistrationDocumentBody {
  documentPurpose?: string;
  documentType?: string;
}

const DOCUMENT_PURPOSES = ["IDENTITY", "TAX", "ADDRESS"] as const;
type DocumentPurpose = (typeof DOCUMENT_PURPOSES)[number];

const DOCUMENT_PURPOSE_ALIASES: Record<string, DocumentPurpose> = {
  identity: "IDENTITY",
  identitydoc: "IDENTITY",
  proofidentity: "IDENTITY",
  tax: "TAX",
  taxdoc: "TAX",
  taxdocumentation: "TAX",
  address: "ADDRESS",
  addressverification: "ADDRESS",
  proofofaddress: "ADDRESS",
};

const normalizeDocumentPurpose = (value?: string): DocumentPurpose | null => {
  if (!value) return null;
  const trimmed = value.trim();
  const upper = trimmed.toUpperCase();
  if (DOCUMENT_PURPOSES.includes(upper as DocumentPurpose)) {
    return upper as DocumentPurpose;
  }

  const aliasKey = trimmed.toLowerCase();
  if (DOCUMENT_PURPOSE_ALIASES[aliasKey]) {
    return DOCUMENT_PURPOSE_ALIASES[aliasKey];
  }

  return null;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error";
};

const parseIntOrDefault = (value: unknown, fallback: number): number => {
  const candidate =
    typeof value === "string"
      ? value
      : Array.isArray(value) && value.length > 0
        ? value[0]
        : null;

  if (!candidate) return fallback;
  const parsed = parseInt(candidate, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

// ============================================
// PUBLIC ROUTES
// ============================================

/**
 * POST /api/freelancer/accept-platform-agreement
 * Accept platform agreement during registration (Step 1)
 * Public access (no auth required as it's during registration)
 */
export const acceptPlatformAgreement = async (
  req: Request<Record<string, never>, unknown, AcceptPlatformAgreementBody>,
  res: Response,
): Promise<void> => {
  try {
    const { freelancerEmail, fullName, country, accepted } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress || "Unknown";
    const userAgent = req.get("user-agent") || "Unknown";

    // Validation
    if (!freelancerEmail || !fullName || !country) {
      res.status(400).json({
        success: false,
        message: "Email, full name, and country are required",
      });
      return;
    }

    if (!accepted) {
      res.status(400).json({
        success: false,
        message: "You must accept the platform agreement to proceed",
      });
      return;
    }

    // Generate agreement PDF and upload to Cloudinary
    const { legalAgreementService, AgreementType } = await import(
      "../../services/legalAgreementService"
    );

    type FreelancerPlatformAgreementData =
      import("../../services/legalAgreementService").FreelancerPlatformAgreementData;

    const agreementData: FreelancerPlatformAgreementData = {
      recipientName: fullName,
      recipientEmail: freelancerEmail,
      country,
      ipAddress,
      userAgent,
      acceptedAt: new Date(),
    };

    const result = await legalAgreementService.createAndStoreAgreement(
      AgreementType.FREELANCER_PLATFORM,
      agreementData,
    );

    res.status(200).json({
      success: true,
      message:
        "Platform agreement accepted successfully. PDF generated and sent to your email.",
      data: {
        documentUrl: result.documentUrl,
        agreementVersion: result.agreementVersion,
        pdfBase64: result.pdfBase64,
        fileName: result.fileName,
        acceptedAt: new Date(),
        message: "You can now proceed with your freelancer registration.",
      },
    });
  } catch (error: unknown) {
    console.error("Error in acceptPlatformAgreement:", error);

    res.status(500).json({
      success: false,
      message: getErrorMessage(error) || "Failed to process platform agreement",
    });
  }
};

/**
 * POST /api/freelancer/registration-documents/upload
 * Upload supporting documents (identity, tax, proof of address) for registration
 * Public access
 */
export const uploadRegistrationDocument = async (
  req: Request<Record<string, never>, unknown, UploadRegistrationDocumentBody>,
  res: Response,
): Promise<void> => {
  const file = req.file;
  const { documentPurpose, documentType } = req.body;

  try {
    const normalizedPurpose = normalizeDocumentPurpose(documentPurpose);

    if (!normalizedPurpose) {
      res.status(400).json({
        success: false,
        message:
          "documentPurpose is required and must be one of IDENTITY, TAX, or ADDRESS.",
      });
      return;
    }

    if (!file) {
      res.status(400).json({
        success: false,
        message: "A PDF document is required.",
      });
      return;
    }

    const fileExtension = path.extname(file.originalname).toLowerCase();
    const isPdfExtension = fileExtension === ".pdf";
    const isPdfMime =
      !file.mimetype || file.mimetype.toLowerCase() === "application/pdf";

    if (!isPdfExtension || !isPdfMime) {
      res.status(400).json({
        success: false,
        message: "Only PDF files are supported for freelancer verification.",
      });
      await fs.unlink(file.path).catch(() => null);
      return;
    }

    const sanitizedBaseName = file.originalname
      .replace(fileExtension, "")
      .replace(/[^a-zA-Z0-9]/g, "_")
      .replace(/_+/g, "_")
      .toLowerCase();

    const cloudinaryFileName = `${normalizedPurpose.toLowerCase()}_${sanitizedBaseName}_${Date.now()}`;

    type UploadResponse = Awaited<ReturnType<typeof uploadOnCloudinary>>;
    let uploadResponse: UploadResponse | null = null;
    try {
      uploadResponse = await uploadOnCloudinary(
        file.path,
        cloudinaryFileName,
        "pdf",
        {
          folder: `freelancerDocuments/${normalizedPurpose.toLowerCase()}`,
        },
      );
    } finally {
      await fs.unlink(file.path).catch(() => null);
    }

    if (!uploadResponse || !uploadResponse.secure_url) {
      res.status(500).json({
        success: false,
        message: "Failed to upload document. Please try again.",
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully.",
      data: {
        documentPurpose: normalizedPurpose,
        documentType: documentType ?? null,
        documentUrl: uploadResponse.secure_url,
        publicId: uploadResponse.public_id,
        bytes: uploadResponse.bytes,
        format: uploadResponse.format,
        originalFileName: file.originalname,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error("Error in uploadRegistrationDocument:", error);
    res.status(500).json({
      success: false,
      message: getErrorMessage(error) || "Failed to upload document",
    });
  }
};

/**
 * POST /api/freelancer/register
 * Register as a freelancer
 * Public access
 */
export const registerFreelancer = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const validated = FreelancerRegistrationSchema.parse(req.body);
    const newFreelancer = await freelancerService.registerFreelancer(validated);

    if (!newFreelancer) {
      res.status(500).json({
        success: false,
        message: "Failed to create freelancer",
      });
      return;
    }

    // Send registration confirmation email
    let emailSent = false;
    try {
      if (newFreelancer?.details) {
        await sendFreelancerRegistrationEmail(
          newFreelancer.details.email,
          newFreelancer.details.fullName,
          newFreelancer.details.primaryDomain,
        );
        emailSent = true;

        // Update the registrationEmailSent flag
        await freelancerService.updateFreelancerEmailStatus(
          newFreelancer.id,
          "registrationEmailSent",
          true,
        );
      }
    } catch (emailError) {
      console.error("Failed to send registration email:", emailError);
      // Don't fail the registration if email fails
    }

    res.status(201).json({
      success: true,
      message: emailSent
        ? "Registration successful! We've sent a confirmation email. We will review your profile and get back to you soon."
        : "Registration successful! We will review your profile and get back to you via email.",
      data: {
        freelancerId: newFreelancer.id,
        status: newFreelancer.status,
        emailSent,
      },
    });
  } catch (error: unknown) {
    console.error("Error in registerFreelancer:", error);

    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: getErrorMessage(error) || "Failed to register freelancer",
    });
  }
};

// ============================================
// PROTECTED ROUTES (FREELANCER ONLY)
// ============================================

/**
 * GET /api/freelancer/profile
 * Get current freelancer's profile
 * Requires authentication - freelancer role
 */
export const getMyProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).userFromToken?.uid;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - No user ID found",
      });
      return;
    }

    const freelancer = await freelancerService.getFreelancerByUserId(userId);

    res.status(200).json({
      success: true,
      data: freelancer,
    });
  } catch (error: unknown) {
    console.error("Error in getMyProfile:", error);
    const message = getErrorMessage(error);
    res.status(message === "Freelancer not found" ? 404 : 500).json({
      success: false,
      message: message || "Failed to fetch profile",
    });
  }
};

/**
 * GET /api/freelancer/projects
 * Get all available projects for bidding
 * Requires authentication - freelancer role
 */
export const getAvailableProjects = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).userFromToken?.uid;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - No user ID found",
      });
      return;
    }

    // Pass userId to service so it can check if freelancer is assigned
    const projects = await freelancerService.getAvailableProjects(userId);

    res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error: unknown) {
    console.error("Error in getAvailableProjects:", error);
    res.status(500).json({
      success: false,
      message: getErrorMessage(error) || "Failed to fetch available projects",
    });
  }
};

/**
 * GET /api/freelancer/projects/:projectId
 * Get project details (without pricing) for bidding
 * Requires authentication - freelancer role
 */
export const getProjectDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const userId = (req as any).userFromToken?.uid;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - No user ID found",
      });
      return;
    }

    // Pass userId to service so it can check if freelancer is assigned
    const project = await freelancerService.getProjectForBidding(
      projectId!,
      userId,
    );

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error: unknown) {
    console.error("Error in getProjectDetails:", error);
    const message = getErrorMessage(error);
    const notFound =
      message === "Project not found" ||
      (typeof message === "string" && message.includes("not available"));
    res.status(notFound ? 404 : 500).json({
      success: false,
      message: message || "Failed to fetch project details",
    });
  }
};

/**
 * POST /api/freelancer/bids
 * Submit a bid on a project
 * Requires authentication - freelancer role
 */
export const createBid = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userFromToken?.uid;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - No user ID found",
      });
      return;
    }

    const validated = CreateFreelancerBidSchema.parse(req.body);

    // Get freelancer by userId
    const freelancer = await freelancerService.getFreelancerByUserId(userId);

    if (!freelancer) {
      res.status(404).json({
        success: false,
        message: "Freelancer profile not found",
      });
      return;
    }

    const newBid = await freelancerService.createBid(freelancer.id, validated);

    res.status(201).json({
      success: true,
      message: "Bid submitted successfully",
      data: newBid,
    });
  } catch (error: unknown) {
    console.error("Error in createBid:", error);

    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: getErrorMessage(error) || "Failed to create bid",
    });
  }
};

/**
 * GET /api/freelancer/bids
 * Get all bids submitted by the current freelancer
 * Requires authentication - freelancer role
 */
export const getMyBids = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userFromToken?.uid;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - No user ID found",
      });
      return;
    }

    // Get freelancer by userId
    const freelancer = await freelancerService.getFreelancerByUserId(userId);

    if (!freelancer) {
      res.status(404).json({
        success: false,
        message: "Freelancer profile not found",
      });
      return;
    }

    // Parse query parameters (status, page, limit)
    const query = GetBidsQuerySchema.parse(req.query);

    const bids = await freelancerService.getFreelancerBids(
      freelancer.id,
      query,
    );

    res.status(200).json({
      success: true,
      data: bids,
    });
  } catch (error: unknown) {
    console.error("Error in getMyBids:", error);

    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: getErrorMessage(error) || "Failed to fetch bids",
    });
  }
};

/**
 * GET /api/freelancer/bids/:bidId
 * Get details of a specific bid
 * Requires authentication - freelancer role
 */
export const getBidDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { bidId } = req.params;
    const userId = (req as any).userFromToken?.uid;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - No user ID found",
      });
      return;
    }

    if (!bidId) {
      res.status(400).json({
        success: false,
        message: "Bid ID is required",
      });
      return;
    }

    const bid = await freelancerService.getBidById(bidId);

    // Verify this bid belongs to the current freelancer
    const freelancer = await freelancerService.getFreelancerByUserId(userId);

    if (!freelancer) {
      res.status(404).json({
        success: false,
        message: "Freelancer profile not found",
      });
      return;
    }

    if (bid.freelancerId !== freelancer.id) {
      res.status(403).json({
        success: false,
        message: "You are not authorized to view this bid",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: bid,
    });
  } catch (error: unknown) {
    console.error("Error in getBidDetails:", error);
    const message = getErrorMessage(error);
    res.status(message === "Bid not found" ? 404 : 500).json({
      success: false,
      message: message || "Failed to fetch bid details",
    });
  }
};

/**
 * DELETE /api/freelancer/bids/:bidId
 * Withdraw a pending bid
 * Requires authentication - freelancer role
 */
export const withdrawBid = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { bidId } = req.params;
    const userId = (req as any).userFromToken?.uid;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - No user ID found",
      });
      return;
    }

    if (!bidId) {
      res.status(400).json({
        success: false,
        message: "Bid ID is required",
      });
      return;
    }

    // Get freelancer by userId
    const freelancer = await freelancerService.getFreelancerByUserId(userId);

    if (!freelancer) {
      res.status(404).json({
        success: false,
        message: "Freelancer profile not found",
      });
      return;
    }

    // Verify this bid belongs to the current freelancer
    const bid = await freelancerService.getBidById(bidId);
    if (bid.freelancerId !== freelancer.id) {
      res.status(403).json({
        success: false,
        message: "You are not authorized to withdraw this bid",
      });
      return;
    }

    const updatedBid = await freelancerService.withdrawBid(
      bidId,
      freelancer.id,
    );

    res.status(200).json({
      success: true,
      message: "Bid withdrawn successfully",
      data: updatedBid,
    });
  } catch (error: unknown) {
    console.error("Error in withdrawBid:", error);
    res.status(500).json({
      success: false,
      message: getErrorMessage(error) || "Failed to withdraw bid",
    });
  }
};

// ============================================
// SELECTED PROJECTS & MILESTONES
// ============================================

/**
 * GET /api/freelancer/my-projects
 * Get all projects where the freelancer is selected/assigned
 * Requires authentication - freelancer role
 */
export const getMySelectedProjects = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = (req as any).userFromToken?.uid;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - No user ID found",
      });
      return;
    }

    const page = parseIntOrDefault(req.query.page, 1);
    const limit = parseIntOrDefault(req.query.limit, 10);

    const result = await freelancerService.getMySelectedProjects(
      userId,
      page,
      limit,
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    console.error("Error in getMySelectedProjects:", error);
    res.status(500).json({
      success: false,
      message: getErrorMessage(error) || "Failed to fetch selected projects",
    });
  }
};

/**
 * GET /api/freelancer/my-projects/:projectId
 * Get detailed view of a specific project the freelancer is selected for
 * Requires authentication - freelancer role
 */
export const getMySelectedProjectDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const userId = (req as any).userFromToken?.uid;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - No user ID found",
      });
      return;
    }

    if (!projectId) {
      res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
      return;
    }

    const project = await freelancerService.getMySelectedProjectDetails(
      projectId,
      userId,
    );

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error: unknown) {
    console.error("Error in getMySelectedProjectDetails:", error);
    const message = getErrorMessage(error);
    const notFound =
      typeof message === "string" &&
      (message.includes("not found") || message.includes("not assigned"));
    res.status(notFound ? 404 : 500).json({
      success: false,
      message: message || "Failed to fetch project details",
    });
  }
};

/**
 * GET /api/freelancer/my-projects/:projectId/milestones
 * Get all milestones for a project the freelancer is selected for
 * Requires authentication - freelancer role
 */
export const getProjectMilestones = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { projectId } = req.params;
    const userId = (req as any).userFromToken?.uid;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - No user ID found",
      });
      return;
    }

    if (!projectId) {
      res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
      return;
    }

    const milestones = await freelancerService.getProjectMilestones(
      projectId,
      userId,
    );

    res.status(200).json({
      success: true,
      data: milestones,
    });
  } catch (error: unknown) {
    console.error("Error in getProjectMilestones:", error);
    const message = getErrorMessage(error);
    const notFound =
      typeof message === "string" &&
      (message.includes("not found") || message.includes("not assigned"));
    res.status(notFound ? 404 : 500).json({
      success: false,
      message: message || "Failed to fetch project milestones",
    });
  }
};

/**
 * GET /api/freelancer/my-projects/:projectId/milestones/:milestoneId
 * Get specific milestone details for a project the freelancer is selected for
 * Requires authentication - freelancer role
 */
export const getMilestoneDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { projectId, milestoneId } = req.params;
    const userId = (req as any).userFromToken?.uid;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized - No user ID found",
      });
      return;
    }

    if (!projectId || !milestoneId) {
      res.status(400).json({
        success: false,
        message: "Project ID and Milestone ID are required",
      });
      return;
    }

    const milestone = await freelancerService.getMilestoneDetails(
      projectId,
      milestoneId,
      userId,
    );

    res.status(200).json({
      success: true,
      data: milestone,
    });
  } catch (error: unknown) {
    console.error("Error in getMilestoneDetails:", error);
    const message = getErrorMessage(error);
    const notFound =
      typeof message === "string" &&
      (message.includes("not found") || message.includes("not assigned"));
    res.status(notFound ? 404 : 500).json({
      success: false,
      message: message || "Failed to fetch milestone details",
    });
  }
};

export default {
  acceptPlatformAgreement,
  uploadRegistrationDocument,
  registerFreelancer,
  getMyProfile,
  getAvailableProjects,
  getProjectDetails,
  createBid,
  getMyBids,
  getBidDetails,
  withdrawBid,
  getMySelectedProjects,
  getMySelectedProjectDetails,
  getProjectMilestones,
  getMilestoneDetails,
};
