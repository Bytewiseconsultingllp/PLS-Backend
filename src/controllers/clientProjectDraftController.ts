import {
  BADREQUESTCODE,
  NOTFOUNDCODE,
  SUCCESSCODE,
  UNAUTHORIZEDCODE,
} from "../constants";
import { clientProjectDraftService } from "../services/clientProjectDraftService";
import type {
  TVISITOR_SERVICE,
  TVISITOR_INDUSTRY,
  TVISITOR_TECHNOLOGY,
  TVISITOR_FEATURE,
  TVISITOR_DISCOUNT,
  TVISITOR_TIMELINE,
} from "../types";
import { httpResponse } from "../utils/apiResponseUtils";
import { asyncHandler } from "../utils/asyncHandlerUtils";
import type { _Request } from "../middlewares/authMiddleware";

export default {
  /**
   * Step 1: Create draft with business details
   * Personal details (fullName, businessEmail, phone) auto-populated from User
   * Client provides: companyName, companyWebsite, businessAddress, businessType
   */
  createDraft: asyncHandler(async (req: _Request, res) => {
    const clientId = req.userFromToken?.uid;

    if (!clientId) {
      throw { status: UNAUTHORIZEDCODE, message: "Client ID is required" };
    }

    const businessDetails = req.body as {
      companyName: string;
      companyWebsite?: string;
      businessAddress?: string;
      businessType: string;
    };

    const ipAddress = req.ip || req.socket.remoteAddress;

    const draft = await clientProjectDraftService.createDraft(
      clientId,
      businessDetails,
      ipAddress,
    );

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Project draft created successfully. Proceed to add services.",
      draft,
    );
  }),

  /**
   * Get single draft by ID
   */
  getDraft: asyncHandler(async (req: _Request, res) => {
    const { draftId } = req.params;
    const clientId = req.userFromToken?.uid;

    if (!clientId) {
      throw { status: UNAUTHORIZEDCODE, message: "Client ID is required" };
    }

    if (!draftId) {
      throw { status: BADREQUESTCODE, message: "Draft ID is required" };
    }

    const draft = await clientProjectDraftService.getDraftById(
      draftId,
      clientId,
    );

    if (!draft) {
      throw { status: NOTFOUNDCODE, message: "Draft not found" };
    }

    httpResponse(req, res, SUCCESSCODE, "Draft retrieved successfully", draft);
  }),

  /**
   * Get all drafts for authenticated client
   */
  getMyDrafts: asyncHandler(async (req: _Request, res) => {
    const clientId = req.userFromToken?.uid;

    if (!clientId) {
      throw { status: UNAUTHORIZEDCODE, message: "Client ID is required" };
    }

    const drafts = await clientProjectDraftService.getClientDrafts(clientId);

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Drafts retrieved successfully",
      drafts,
    );
  }),

  /**
   * Step 2: Add services to draft
   */
  addDraftServices: asyncHandler(async (req: _Request, res) => {
    const { draftId } = req.params;
    const clientId = req.userFromToken?.uid;
    const { services } = req.body as { services: TVISITOR_SERVICE[] };

    if (!clientId) {
      throw { status: UNAUTHORIZEDCODE, message: "Client ID is required" };
    }

    if (!draftId) {
      throw { status: BADREQUESTCODE, message: "Draft ID is required" };
    }

    // Verify draft belongs to client
    const draft = await clientProjectDraftService.getDraftById(
      draftId,
      clientId,
    );

    if (!draft) {
      throw { status: NOTFOUNDCODE, message: "Draft not found" };
    }

    if (draft.isFinalized) {
      throw {
        status: BADREQUESTCODE,
        message: "Cannot modify a finalized draft",
      };
    }

    const updatedDraft = await clientProjectDraftService.upsertDraftServices(
      draftId,
      services,
    );

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Services added successfully. Proceed to add industries.",
      updatedDraft,
    );
  }),

  /**
   * Step 3: Add industries to draft
   */
  addDraftIndustries: asyncHandler(async (req: _Request, res) => {
    const { draftId } = req.params;
    const clientId = req.userFromToken?.uid;
    const { industries } = req.body as { industries: TVISITOR_INDUSTRY[] };

    if (!clientId) {
      throw { status: UNAUTHORIZEDCODE, message: "Client ID is required" };
    }

    if (!draftId) {
      throw { status: BADREQUESTCODE, message: "Draft ID is required" };
    }

    const draft = await clientProjectDraftService.getDraftById(
      draftId,
      clientId,
    );

    if (!draft) {
      throw { status: NOTFOUNDCODE, message: "Draft not found" };
    }

    if (draft.isFinalized) {
      throw {
        status: BADREQUESTCODE,
        message: "Cannot modify a finalized draft",
      };
    }

    const updatedDraft = await clientProjectDraftService.upsertDraftIndustries(
      draftId,
      industries,
    );

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Industries added successfully. Proceed to add technologies.",
      updatedDraft,
    );
  }),

  /**
   * Step 4: Add technologies to draft
   */
  addDraftTechnologies: asyncHandler(async (req: _Request, res) => {
    const { draftId } = req.params;
    const clientId = req.userFromToken?.uid;
    const { technologies } = req.body as {
      technologies: TVISITOR_TECHNOLOGY[];
    };

    if (!clientId) {
      throw { status: UNAUTHORIZEDCODE, message: "Client ID is required" };
    }

    if (!draftId) {
      throw { status: BADREQUESTCODE, message: "Draft ID is required" };
    }

    const draft = await clientProjectDraftService.getDraftById(
      draftId,
      clientId,
    );

    if (!draft) {
      throw { status: NOTFOUNDCODE, message: "Draft not found" };
    }

    if (draft.isFinalized) {
      throw {
        status: BADREQUESTCODE,
        message: "Cannot modify a finalized draft",
      };
    }

    const updatedDraft =
      await clientProjectDraftService.upsertDraftTechnologies(
        draftId,
        technologies,
      );

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Technologies added successfully. Proceed to add features.",
      updatedDraft,
    );
  }),

  /**
   * Step 5: Add features to draft
   */
  addDraftFeatures: asyncHandler(async (req: _Request, res) => {
    const { draftId } = req.params;
    const clientId = req.userFromToken?.uid;
    const { features } = req.body as { features: TVISITOR_FEATURE[] };

    if (!clientId) {
      throw { status: UNAUTHORIZEDCODE, message: "Client ID is required" };
    }

    if (!draftId) {
      throw { status: BADREQUESTCODE, message: "Draft ID is required" };
    }

    const draft = await clientProjectDraftService.getDraftById(
      draftId,
      clientId,
    );

    if (!draft) {
      throw { status: NOTFOUNDCODE, message: "Draft not found" };
    }

    if (draft.isFinalized) {
      throw {
        status: BADREQUESTCODE,
        message: "Cannot modify a finalized draft",
      };
    }

    const updatedDraft = await clientProjectDraftService.upsertDraftFeatures(
      draftId,
      features,
    );

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Features added successfully. Proceed to add discount.",
      updatedDraft,
    );
  }),

  /**
   * Step 6: Add discount to draft
   */
  addDraftDiscount: asyncHandler(async (req: _Request, res) => {
    const { draftId } = req.params;
    const clientId = req.userFromToken?.uid;
    const discount = req.body as TVISITOR_DISCOUNT;

    if (!clientId) {
      throw { status: UNAUTHORIZEDCODE, message: "Client ID is required" };
    }

    if (!draftId) {
      throw { status: BADREQUESTCODE, message: "Draft ID is required" };
    }

    const draft = await clientProjectDraftService.getDraftById(
      draftId,
      clientId,
    );

    if (!draft) {
      throw { status: NOTFOUNDCODE, message: "Draft not found" };
    }

    if (draft.isFinalized) {
      throw {
        status: BADREQUESTCODE,
        message: "Cannot modify a finalized draft",
      };
    }

    const updatedDraft = await clientProjectDraftService.upsertDraftDiscount(
      draftId,
      discount,
    );

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Discount added successfully. Proceed to add timeline.",
      updatedDraft,
    );
  }),

  /**
   * Step 7: Add timeline to draft
   * This triggers automatic estimate calculation
   */
  addDraftTimeline: asyncHandler(async (req: _Request, res) => {
    const { draftId } = req.params;
    const clientId = req.userFromToken?.uid;
    const timeline = req.body as TVISITOR_TIMELINE;

    if (!clientId) {
      throw { status: UNAUTHORIZEDCODE, message: "Client ID is required" };
    }

    if (!draftId) {
      throw { status: BADREQUESTCODE, message: "Draft ID is required" };
    }

    const draft = await clientProjectDraftService.getDraftById(
      draftId,
      clientId,
    );

    if (!draft) {
      throw { status: NOTFOUNDCODE, message: "Draft not found" };
    }

    if (draft.isFinalized) {
      throw {
        status: BADREQUESTCODE,
        message: "Cannot modify a finalized draft",
      };
    }

    await clientProjectDraftService.upsertDraftTimeline(draftId, timeline);

    // Auto-calculate estimate after timeline is added
    try {
      const calculation =
        await clientProjectDraftService.calculateDraftEstimate(draftId);

      if (calculation) {
        await clientProjectDraftService.saveDraftEstimate(draftId, calculation);
      }
    } catch (error) {
      console.error("Error auto-calculating estimate:", error);
      // Don't fail the request if estimate calculation fails
    }

    const updatedDraft = await clientProjectDraftService.getDraftById(draftId);

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Timeline added successfully. Estimate has been calculated. Please review and accept.",
      updatedDraft,
    );
  }),

  /**
   * Get draft estimate
   */
  getDraftEstimate: asyncHandler(async (req: _Request, res) => {
    const { draftId } = req.params;
    const clientId = req.userFromToken?.uid;

    if (!clientId) {
      throw { status: UNAUTHORIZEDCODE, message: "Client ID is required" };
    }

    if (!draftId) {
      throw { status: BADREQUESTCODE, message: "Draft ID is required" };
    }

    const draft = await clientProjectDraftService.getDraftById(
      draftId,
      clientId,
    );

    if (!draft) {
      throw { status: NOTFOUNDCODE, message: "Draft not found" };
    }

    const estimate = await clientProjectDraftService.getDraftEstimate(draftId);

    if (!estimate) {
      throw {
        status: NOTFOUNDCODE,
        message:
          "Estimate not found. Please complete timeline step to generate estimate.",
      };
    }

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Estimate retrieved successfully",
      estimate,
    );
  }),

  /**
   * Accept draft estimate
   */
  acceptDraftEstimate: asyncHandler(async (req: _Request, res) => {
    const { draftId } = req.params;
    const clientId = req.userFromToken?.uid;

    if (!clientId) {
      throw { status: UNAUTHORIZEDCODE, message: "Client ID is required" };
    }

    if (!draftId) {
      throw { status: BADREQUESTCODE, message: "Draft ID is required" };
    }

    const draft = await clientProjectDraftService.getDraftById(
      draftId,
      clientId,
    );

    if (!draft) {
      throw { status: NOTFOUNDCODE, message: "Draft not found" };
    }

    if (draft.isFinalized) {
      throw {
        status: BADREQUESTCODE,
        message: "Cannot modify a finalized draft",
      };
    }

    const estimate =
      await clientProjectDraftService.acceptDraftEstimate(draftId);

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Estimate accepted successfully. Proceed to accept service agreement.",
      estimate,
    );
  }),

  /**
   * Step 8: Add service agreement to draft
   * Generates a new PDF agreement specific to this draft/project
   */
  addDraftServiceAgreement: asyncHandler(async (req: _Request, res) => {
    const { draftId } = req.params;
    const clientId = req.userFromToken?.uid;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get("user-agent");

    if (!clientId) {
      throw { status: UNAUTHORIZEDCODE, message: "Client ID is required" };
    }

    if (!draftId) {
      throw { status: BADREQUESTCODE, message: "Draft ID is required" };
    }

    const draft = await clientProjectDraftService.getDraftById(
      draftId,
      clientId,
    );

    if (!draft) {
      throw { status: NOTFOUNDCODE, message: "Draft not found" };
    }

    if (draft.isFinalized) {
      throw {
        status: BADREQUESTCODE,
        message: "Cannot modify a finalized draft",
      };
    }

    // Verify estimate is accepted
    if (!draft.estimate?.estimateAccepted) {
      throw {
        status: BADREQUESTCODE,
        message: "Estimate must be accepted before accepting service agreement",
      };
    }

    // Verify required data exists
    if (!draft.details || !draft.estimate) {
      throw {
        status: BADREQUESTCODE,
        message: "Draft details and estimate are required",
      };
    }

    // Import legal agreement service
    const { legalAgreementService, AgreementType } = await import(
      "../services/legalAgreementService"
    );

    type ClientServiceAgreementData =
      import("../services/legalAgreementService").ClientServiceAgreementData;

    // Prepare agreement data
    const agreementData: ClientServiceAgreementData = {
      recipientName: draft.details.fullName,
      recipientEmail: draft.details.businessEmail,
      estimatedPriceMin: Number(draft.estimate.estimateFinalPriceMin),
      estimatedPriceMax: Number(draft.estimate.estimateFinalPriceMax),
      ipAddress: ipAddress || "unknown",
      userAgent: userAgent || "unknown",
      acceptedAt: new Date(),
    };

    // Generate and store agreement (creates PDF, uploads to Cloudinary, sends email)
    const result = await legalAgreementService.createAndStoreAgreement(
      AgreementType.CLIENT_SERVICE,
      agreementData,
    );

    // Store agreement in draft
    const updatedDraft =
      await clientProjectDraftService.upsertDraftServiceAgreement(draftId, {
        documentUrl: result.documentUrl,
        agreementVersion: result.agreementVersion,
        accepted: true,
        ipAddress,
        userAgent,
      });

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Service agreement generated and accepted successfully. PDF sent to your email. You can now finalize your project.",
      {
        draft: updatedDraft,
        documentUrl: result.documentUrl,
        agreementVersion: result.agreementVersion,
        pdfBase64: result.pdfBase64,
        fileName: result.fileName,
      },
    );
  }),

  /**
   * Finalize draft and create actual project
   */
  finalizeDraft: asyncHandler(async (req: _Request, res) => {
    const { draftId } = req.params;
    const clientId = req.userFromToken?.uid;

    if (!clientId) {
      throw { status: UNAUTHORIZEDCODE, message: "Client ID is required" };
    }

    if (!draftId) {
      throw { status: BADREQUESTCODE, message: "Draft ID is required" };
    }

    const project = await clientProjectDraftService.finalizeDraft(
      draftId,
      clientId,
    );

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Project created successfully! Your project is now active.",
      project,
    );
  }),

  /**
   * Request Formal Quote - Generate and download PDF
   */
  requestDraftQuote: asyncHandler(async (req: _Request, res) => {
    const { draftId } = req.params;
    const clientId = req.userFromToken?.uid;

    if (!clientId) {
      throw { status: UNAUTHORIZEDCODE, message: "Client ID is required" };
    }

    if (!draftId) {
      throw { status: BADREQUESTCODE, message: "Draft ID is required" };
    }

    // Get draft and verify ownership
    const draft = await clientProjectDraftService.getDraftById(
      draftId,
      clientId,
    );
    if (!draft) {
      throw { status: NOTFOUNDCODE, message: "Draft not found" };
    }

    // Check if service agreement is accepted
    const agreement = draft.serviceAgreement;

    if (!agreement || !agreement.accepted) {
      throw {
        status: BADREQUESTCODE,
        message: "Service agreement must be accepted before requesting quote",
      };
    }

    try {
      const { pdfGenerationService } = await import(
        "../services/pdfGenerationService"
      );
      const pdfBuffer =
        await pdfGenerationService.generateClientDraftQuotePDF(draftId);

      // Set headers for PDF download
      const filename = `quote-draft-${draftId}-${Date.now()}.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${filename}"`,
      );
      res.setHeader("Content-Length", pdfBuffer.length);

      // Send PDF
      res.send(pdfBuffer);

      // TODO: Also send PDF via email
      // Implement email sending in future iteration
    } catch (error) {
      console.error("Error generating draft quote PDF:", error);
      throw {
        status: 500,
        message: "Failed to generate quote PDF",
      };
    }
  }),

  /**
   * Delete a draft
   */
  deleteDraft: asyncHandler(async (req: _Request, res) => {
    const { draftId } = req.params;
    const clientId = req.userFromToken?.uid;

    if (!clientId) {
      throw { status: UNAUTHORIZEDCODE, message: "Client ID is required" };
    }

    if (!draftId) {
      throw { status: BADREQUESTCODE, message: "Draft ID is required" };
    }

    const result = await clientProjectDraftService.deleteDraft(
      draftId,
      clientId,
    );

    httpResponse(req, res, SUCCESSCODE, result.message, result);
  }),
};
