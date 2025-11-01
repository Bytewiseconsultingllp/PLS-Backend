import type { Request, Response } from "express";
import freelancerService from "../../services/freelancerService";
import {
  GetFreelancersQuerySchema,
  ReviewFreelancerSchema,
  ReviewBidSchema,
  GetBidsQuerySchema,
} from "../../validation/freelancerValidation";
import {
  sendFreelancerAcceptanceEmail,
  sendFreelancerRejectionEmail,
} from "../../services/globalMailService";

// ============================================
// FREELANCER MANAGEMENT
// ============================================

/**
 * GET /api/admin/freelancers
 * Get all freelancers with filtering
 * Requires authentication - admin role
 */
export const getAllFreelancers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Parse and validate query parameters
    const query = GetFreelancersQuerySchema.parse(req.query);

    // Get freelancers
    const result = await freelancerService.getFreelancers(query);

    res.status(200).json({
      success: true,
      data: result.freelancers,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error("Error in getAllFreelancers:", error);

    if (error.name === "ZodError") {
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch freelancers",
    });
  }
};

/**
 * GET /api/admin/freelancers/:freelancerId
 * Get detailed information about a specific freelancer
 * Requires authentication - admin role
 */
export const getFreelancerDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { freelancerId } = req.params;

    if (!freelancerId) {
      res.status(400).json({
        success: false,
        message: "Freelancer ID is required",
      });
      return;
    }

    const freelancer = await freelancerService.getFreelancerById(freelancerId);

    res.status(200).json({
      success: true,
      data: freelancer,
    });
  } catch (error: any) {
    console.error("Error in getFreelancerDetails:", error);
    res.status(error.message === "Freelancer not found" ? 404 : 500).json({
      success: false,
      message: error.message || "Failed to fetch freelancer details",
    });
  }
};

/**
 * POST /api/admin/freelancers/:freelancerId/review
 * Accept or reject a freelancer
 * Requires authentication - admin role
 */
export const reviewFreelancer = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { freelancerId } = req.params;
    const adminUserId = (req as any).userFromToken?.uid;

    if (!freelancerId) {
      res.status(400).json({
        success: false,
        message: "Freelancer ID is required",
      });
      return;
    }

    if (!adminUserId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    // Validate request body and normalize action to uppercase
    const reviewData = ReviewFreelancerSchema.parse({
      ...req.body,
      action: req.body.action?.toUpperCase(), // ✅ Normalize to uppercase
    });

    // Review freelancer
    const result = await freelancerService.reviewFreelancer(
      freelancerId,
      reviewData,
      adminUserId,
    );

    if (reviewData.action === "ACCEPT" && "tempPassword" in result) {
      // Send acceptance email with credentials
      try {
        if (result.freelancer.details) {
          await sendFreelancerAcceptanceEmail(
            result.freelancer.details.email,
            result.freelancer.details.fullName,
            result.freelancer.user?.username || "",
            result.tempPassword,
            process.env.FRONTEND_URL || "https://yourplatform.com/login",
          );

          // Update email sent flag
          await freelancerService.updateFreelancerEmailStatus(
            freelancerId,
            "acceptanceEmailSent",
            true,
          );
        }
      } catch (emailError) {
        console.error("Failed to send acceptance email:", emailError);
        // Don't fail the acceptance if email fails
      }

      res.status(200).json({
        success: true,
        message: "Freelancer accepted successfully",
        data: {
          freelancer: result.freelancer,
          credentials: {
            username: result.freelancer.user?.username,
            tempPassword: result.tempPassword,
            email: result.freelancer.details?.email,
          },
        },
      });
    } else {
      // Send rejection email
      try {
        if (result.freelancer.details) {
          await sendFreelancerRejectionEmail(
            result.freelancer.details.email,
            result.freelancer.details.fullName,
            reviewData.rejectionReason,
          );

          // Update email sent flag
          await freelancerService.updateFreelancerEmailStatus(
            freelancerId,
            "rejectionEmailSent",
            true,
          );
        }
      } catch (emailError) {
        console.error("Failed to send rejection email:", emailError);
        // Don't fail the rejection if email fails
      }

      res.status(200).json({
        success: true,
        message: "Freelancer rejected successfully",
        data: {
          freelancer: result.freelancer,
        },
      });
    }
  } catch (error: any) {
    console.error("Error in reviewFreelancer:", error);

    if (error.name === "ZodError") {
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
      return; // ✅ Added return to prevent "headers already sent" error
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to review freelancer",
    });
  }
};

// ============================================
// BID MANAGEMENT
// ============================================

/**
 * GET /api/admin/projects/:projectId/bids
 * Get all bids for a specific project
 * Requires authentication - admin role
 */
export const getProjectBids = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      res.status(400).json({
        success: false,
        message: "Project ID is required",
      });
      return;
    }

    // Parse query parameters
    const query = GetBidsQuerySchema.parse(req.query);

    // Get bids
    const result = await freelancerService.getProjectBids(projectId, query);

    res.status(200).json({
      success: true,
      data: result.bids,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error("Error in getProjectBids:", error);

    if (error.name === "ZodError") {
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
      return; // ✅ Added return
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch project bids",
    });
  }
};

/**
 * GET /api/admin/bids/:bidId
 * Get detailed information about a specific bid
 * Requires authentication - admin role
 */
export const getBidDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { bidId } = req.params;

    if (!bidId) {
      res.status(400).json({
        success: false,
        message: "Bid ID is required",
      });
      return;
    }

    const bid = await freelancerService.getBidById(bidId);

    res.status(200).json({
      success: true,
      data: bid,
    });
  } catch (error: any) {
    console.error("Error in getBidDetails:", error);
    res.status(error.message === "Bid not found" ? 404 : 500).json({
      success: false,
      message: error.message || "Failed to fetch bid details",
    });
  }
};

/**
 * POST /api/admin/bids/:bidId/review
 * Accept or reject a bid
 * Requires authentication - admin role
 */
export const reviewBid = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bidId } = req.params;
    const adminUserId = (req as any).userFromToken?.uid;

    if (!bidId) {
      res.status(400).json({
        success: false,
        message: "Bid ID is required",
      });
      return;
    }

    if (!adminUserId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    // Validate request body and normalize action to uppercase
    const reviewData = ReviewBidSchema.parse({
      ...req.body,
      action: req.body.action?.toUpperCase(), // ✅ Normalize to uppercase
    });

    // Review bid
    const bid = await freelancerService.reviewBid(
      bidId,
      reviewData,
      adminUserId,
    );

    if (reviewData.action === "ACCEPT") {
      // TODO: Send acceptance email to freelancer
      // Notify freelancer that their bid was accepted

      res.status(200).json({
        success: true,
        message: "Bid accepted successfully. Freelancer added to project.",
        data: bid,
      });
    } else {
      // TODO: Send rejection email to freelancer
      // Notify freelancer that their bid was rejected

      res.status(200).json({
        success: true,
        message: "Bid rejected successfully",
        data: bid,
      });
    }
  } catch (error: any) {
    console.error("Error in reviewBid:", error);

    if (error.name === "ZodError") {
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
      return; // ✅ Added return
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to review bid",
    });
  }
};

// ============================================
// STATISTICS & ANALYTICS
// ============================================

/**
 * GET /api/admin/freelancers/stats
 * Get freelancer statistics
 * Requires authentication - admin role
 */
export const getFreelancerStats = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Get counts for each status
    const [pending, accepted, rejected, totalBids, pendingBids] =
      await Promise.all([
        (
          await freelancerService.getFreelancers({
            status: "PENDING_REVIEW",
            page: 1,
            limit: 1,
          })
        ).pagination.total,
        (
          await freelancerService.getFreelancers({
            status: "ACCEPTED",
            page: 1,
            limit: 1,
          })
        ).pagination.total,
        (
          await freelancerService.getFreelancers({
            status: "REJECTED",
            page: 1,
            limit: 1,
          })
        ).pagination.total,
        // You can add more stats here as needed
        0, // Placeholder for total bids
        0, // Placeholder for pending bids
      ]);

    res.status(200).json({
      success: true,
      data: {
        freelancers: {
          pending,
          accepted,
          rejected,
          total: pending + accepted + rejected,
        },
        bids: {
          total: totalBids,
          pending: pendingBids,
        },
      },
    });
  } catch (error: any) {
    console.error("Error in getFreelancerStats:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch statistics",
    });
  }
};

export default {
  getAllFreelancers,
  getFreelancerDetails,
  reviewFreelancer,
  getProjectBids,
  getBidDetails,
  reviewBid,
  getFreelancerStats,
};
