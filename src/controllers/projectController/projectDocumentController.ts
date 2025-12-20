import type { Response } from "express";
import path from "node:path";
import fs from "node:fs/promises";
import { uploadOnCloudinary } from "../../services/cloudinaryService";
import { db } from "../../database/db";
import type { _Request } from "../../middlewares/authMiddleware";

/**
 * POST /api/v1/project/:projectId/client-brief/upload
 * Client uploads their project brief/requirements document (ONE-TIME ONLY)
 * Auth: CLIENT (project owner only)
 */
export const uploadClientBrief = async (
  req: _Request,
  res: Response,
): Promise<void> => {
  const { projectId } = req.params;
  const file = req.file;
  const userUid = req.userFromToken?.uid;

  try {
    // 1. Validate project exists and get project details
    const project = await db.project.findUnique({
      where: { id: projectId, deletedAt: null },
      select: {
        id: true,
        clientId: true,
        clientBriefDocumentUrl: true,
      },
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: "Project not found",
      });
      return;
    }

    // 2. Authorization: ONLY project owner (CLIENT) can upload
    const isProjectOwner = project.clientId === userUid;

    if (!isProjectOwner) {
      res.status(403).json({
        success: false,
        message: "Only the project owner can upload the client brief document",
      });
      return;
    }

    // 3. Check if document already uploaded (IMMUTABLE - one-time only)
    if (project.clientBriefDocumentUrl) {
      res.status(400).json({
        success: false,
        message:
          "Document already uploaded and cannot be replaced. This document is permanent and immutable.",
      });
      return;
    }

    // 4. Validate file exists
    if (!file) {
      res.status(400).json({
        success: false,
        message: "A PDF document is required",
      });
      return;
    }

    // 5. Validate file type (PDF only)
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const isPdfExtension = fileExtension === ".pdf";
    const isPdfMime =
      !file.mimetype || file.mimetype.toLowerCase() === "application/pdf";

    if (!isPdfExtension || !isPdfMime) {
      res.status(400).json({
        success: false,
        message: "Only PDF files are supported for client brief documents",
      });
      await fs.unlink(file.path).catch(() => null);
      return;
    }

    // 6. Sanitize filename for Cloudinary
    const sanitizedBaseName = file.originalname
      .replace(fileExtension, "")
      .replace(/[^a-zA-Z0-9]/g, "_")
      .replace(/_+/g, "_")
      .toLowerCase();

    const cloudinaryFileName = `client_brief_${sanitizedBaseName}_${Date.now()}`;

    // 7. Upload to Cloudinary (resource_type auto-detected from file)
    let uploadResponse;
    try {
      uploadResponse = await uploadOnCloudinary(
        file.path,
        cloudinaryFileName,
        "", // Let Cloudinary auto-detect format
        {
          folder: `projectClientBriefs/${projectId}`,
          resourceType: "raw", // Explicitly set resource type for non-image files
        },
      );
    } finally {
      // Always cleanup temp file
      await fs.unlink(file.path).catch(() => null);
    }

    if (!uploadResponse || !uploadResponse.secure_url) {
      res.status(500).json({
        success: false,
        message: "Failed to upload document. Please try again",
      });
      return;
    }

    // 8. Update project with document URL (PERMANENT)
    await db.project.update({
      where: { id: projectId },
      data: {
        clientBriefDocumentUrl: uploadResponse.secure_url,
      },
    });

    res.status(201).json({
      success: true,
      message:
        "Client brief document uploaded successfully. This document is now permanent and cannot be modified.",
      data: {
        projectId,
        documentUrl: uploadResponse.secure_url,
        fileName: file.originalname,
        uploadedAt: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error("Error in uploadClientBrief:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to upload document",
    });
  }
};

/**
 * GET /api/v1/project/:projectId/client-brief
 * Get client brief document for a project
 * Auth: CLIENT (owner), ADMIN, MODERATOR, FREELANCER (if assigned to project)
 */
export const getClientBrief = async (
  req: _Request,
  res: Response,
): Promise<void> => {
  const { projectId } = req.params;
  const userUid = req.userFromToken?.uid;
  const userRole = req.userFromToken?.role;

  try {
    // 1. Get project with freelancer assignments
    const project = await db.project.findUnique({
      where: { id: projectId, deletedAt: null },
      select: {
        id: true,
        clientId: true,
        clientBriefDocumentUrl: true,
        selectedFreelancers: {
          where: { userId: userUid },
          select: { id: true },
        },
      },
    });

    if (!project) {
      res.status(404).json({
        success: false,
        message: "Project not found",
      });
      return;
    }

    // 2. Check authorization
    const isProjectOwner = project.clientId === userUid;
    const isAdminOrModerator = userRole === "ADMIN" || userRole === "MODERATOR";
    const isAssignedFreelancer =
      userRole === "FREELANCER" && project.selectedFreelancers.length > 0;

    if (!isProjectOwner && !isAdminOrModerator && !isAssignedFreelancer) {
      res.status(403).json({
        success: false,
        message:
          "You don't have permission to view this project's client brief",
      });
      return;
    }

    // 3. Check if document exists
    if (!project.clientBriefDocumentUrl) {
      res.status(404).json({
        success: false,
        message: "No client brief document uploaded for this project yet",
      });
      return;
    }

    // 4. Return document URL
    res.status(200).json({
      success: true,
      message: "Client brief document retrieved successfully",
      data: {
        projectId,
        documentUrl: project.clientBriefDocumentUrl,
        message: "Use this URL to download or view the document in browser",
      },
    });
  } catch (error: unknown) {
    console.error("Error in getClientBrief:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to retrieve document",
    });
  }
};

export default {
  uploadClientBrief,
  getClientBrief,
};
