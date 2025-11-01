/**
 * FreelancerController.ts
 * Handles public and freelancer-authenticated routes
 */

import type { Request, Response } from "express";
import freelancerService from "../../services/freelancerService";
import {
  FreelancerRegistrationSchema,
  CreateFreelancerBidSchema,
} from "../../validation/freelancerValidation";
import { sendFreelancerRegistrationEmail } from "../../services/globalMailService";

// ============================================
// PUBLIC ROUTES
// ============================================

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
  } catch (error: any) {
    console.error("Error in registerFreelancer:", error);

    if (error.name === "ZodError") {
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to register freelancer",
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
  } catch (error: any) {
    console.error("Error in getMyProfile:", error);
    res.status(error.message === "Freelancer not found" ? 404 : 500).json({
      success: false,
      message: error.message || "Failed to fetch profile",
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
  } catch (error: any) {
    console.error("Error in getAvailableProjects:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch available projects",
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
  } catch (error: any) {
    console.error("Error in getProjectDetails:", error);
    res
      .status(
        error.message === "Project not found" ||
          error.message.includes("not available")
          ? 404
          : 500,
      )
      .json({
        success: false,
        message: error.message || "Failed to fetch project details",
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
  } catch (error: any) {
    console.error("Error in createBid:", error);

    if (error.name === "ZodError") {
      res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create bid",
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

    const bids = await freelancerService.getFreelancerBids(freelancer.id, {
      page: 1,
      limit: 100,
    });

    res.status(200).json({
      success: true,
      data: bids,
    });
  } catch (error: any) {
    console.error("Error in getMyBids:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch bids",
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
  } catch (error: any) {
    console.error("Error in getBidDetails:", error);
    res.status(error.message === "Bid not found" ? 404 : 500).json({
      success: false,
      message: error.message || "Failed to fetch bid details",
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
  } catch (error: any) {
    console.error("Error in withdrawBid:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to withdraw bid",
    });
  }
};

export default {
  registerFreelancer,
  getMyProfile,
  getAvailableProjects,
  getProjectDetails,
  createBid,
  getMyBids,
  getBidDetails,
  withdrawBid,
};
