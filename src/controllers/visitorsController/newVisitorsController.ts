import {
  BADREQUESTCODE,
  NOTFOUNDCODE,
  SUCCESSCODE,
  SUCCESSMSG,
  CONFLICTCODE,
} from "../../constants";
import { db } from "../../database/db";
import { visitorService } from "../../services/visitorService";
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
} from "../../types";
import { httpResponse } from "../../utils/apiResponseUtils";
import { asyncHandler } from "../../utils/asyncHandlerUtils";
import type { _Request } from "../../middlewares/authMiddleware";

export default {
  /**
   * Step 1: Create visitor and add details
   * This is the first step where visitor provides their business information
   */
  createVisitorWithDetails: asyncHandler(async (req, res) => {
    const details = req.body as TVISITOR_DETAILS;
    const ipAddress = req.ip || req.socket.remoteAddress;

    // Check if email already exists in User table (is a client)
    const existingClient = await visitorService.checkIfEmailIsClient(
      details.businessEmail,
    );

    if (existingClient && existingClient.role === "CLIENT") {
      httpResponse(
        req,
        res,
        CONFLICTCODE,
        "Email already registered as client. Please login to add a new project.",
        {
          isExistingClient: true,
          clientId: existingClient.uid,
        },
      );
      return;
    }

    // Check if visitor with this email already exists
    const existingVisitor = await visitorService.getVisitorByEmail(
      details.businessEmail,
    );

    if (existingVisitor) {
      httpResponse(
        req,
        res,
        CONFLICTCODE,
        "Visitor with this email already exists",
        {
          visitorId: existingVisitor.id,
          existingVisitor: existingVisitor,
        },
      );
      return;
    }

    // Create new visitor
    const visitor = await visitorService.createVisitor({ ipAddress });

    // Add visitor details
    await visitorService.upsertVisitorDetails(visitor.id, details);

    // Fetch complete visitor data
    const completeVisitor = await visitorService.getVisitorById(visitor.id);

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Visitor created successfully",
      completeVisitor,
    );
  }),

  /**
   * Step 2: Add service selections
   */
  addVisitorServices: asyncHandler(async (req, res) => {
    const { visitorId } = req.params;
    const services = req.body as TVISITOR_SERVICE[];

    if (!visitorId) {
      throw { status: BADREQUESTCODE, message: "Visitor ID is required" };
    }

    // Validate request format
    if (!Array.isArray(services) || services.length === 0) {
      throw {
        status: BADREQUESTCODE,
        message: "Services must be a non-empty array",
      };
    }

    // Validate each service object
    for (const service of services) {
      if (!service.name) {
        throw {
          status: BADREQUESTCODE,
          message:
            "Each service must have a 'name' field (e.g., 'WEB_DEVELOPMENT')",
        };
      }
      if (!service.childServices || !Array.isArray(service.childServices)) {
        throw {
          status: BADREQUESTCODE,
          message:
            "Each service must have a 'childServices' array (e.g., ['CUSTOM_WEB_APPLICATION', 'API_DEVELOPMENT'])",
        };
      }
    }

    // Verify visitor exists
    const visitor = await visitorService.getVisitorById(visitorId);
    if (!visitor) {
      throw { status: NOTFOUNDCODE, message: "Visitor not found" };
    }

    await visitorService.addVisitorServices(visitorId, services);

    const updatedVisitor = await visitorService.getVisitorById(visitorId);
    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Services added successfully",
      updatedVisitor,
    );
  }),

  /**
   * Step 3: Add industry selections
   */
  addVisitorIndustries: asyncHandler(async (req, res) => {
    const { visitorId } = req.params;
    const industries = req.body as TVISITOR_INDUSTRY[];

    if (!visitorId) {
      throw { status: BADREQUESTCODE, message: "Visitor ID is required" };
    }

    // Validate request format
    if (!Array.isArray(industries) || industries.length === 0) {
      throw {
        status: BADREQUESTCODE,
        message: "Industries must be a non-empty array",
      };
    }

    // Validate each industry object
    for (const industry of industries) {
      if (!industry.category) {
        throw {
          status: BADREQUESTCODE,
          message:
            "Each industry must have a 'category' field (e.g., 'HEALTHCARE_AND_LIFE_SCIENCES')",
        };
      }
      if (!industry.subIndustries || !Array.isArray(industry.subIndustries)) {
        throw {
          status: BADREQUESTCODE,
          message:
            "Each industry must have a 'subIndustries' array (e.g., ['HEALTHCARE_PROVIDERS', 'PHARMACEUTICALS'])",
        };
      }
    }

    const visitor = await visitorService.getVisitorById(visitorId);
    if (!visitor) {
      throw { status: NOTFOUNDCODE, message: "Visitor not found" };
    }

    await visitorService.addVisitorIndustries(visitorId, industries);

    const updatedVisitor = await visitorService.getVisitorById(visitorId);
    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Industries added successfully",
      updatedVisitor,
    );
  }),

  /**
   * Step 4: Add technology selections
   */
  addVisitorTechnologies: asyncHandler(async (req, res) => {
    const { visitorId } = req.params;
    const technologies = req.body as TVISITOR_TECHNOLOGY[];

    if (!visitorId) {
      throw { status: BADREQUESTCODE, message: "Visitor ID is required" };
    }

    const visitor = await visitorService.getVisitorById(visitorId);
    if (!visitor) {
      throw { status: NOTFOUNDCODE, message: "Visitor not found" };
    }

    await visitorService.addVisitorTechnologies(visitorId, technologies);

    const updatedVisitor = await visitorService.getVisitorById(visitorId);
    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Technologies added successfully",
      updatedVisitor,
    );
  }),

  /**
   * Step 5: Add feature selections
   */
  addVisitorFeatures: asyncHandler(async (req, res) => {
    const { visitorId } = req.params;
    const features = req.body as TVISITOR_FEATURE[];

    if (!visitorId) {
      throw { status: BADREQUESTCODE, message: "Visitor ID is required" };
    }

    const visitor = await visitorService.getVisitorById(visitorId);
    if (!visitor) {
      throw { status: NOTFOUNDCODE, message: "Visitor not found" };
    }

    await visitorService.addVisitorFeatures(visitorId, features);

    const updatedVisitor = await visitorService.getVisitorById(visitorId);
    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Features added successfully",
      updatedVisitor,
    );
  }),

  /**
   * Step 6: Add discount selection
   */
  addVisitorDiscount: asyncHandler(async (req, res) => {
    const { visitorId } = req.params;
    const discount = req.body as TVISITOR_DISCOUNT;

    if (!visitorId) {
      throw { status: BADREQUESTCODE, message: "Visitor ID is required" };
    }

    // Validate request format
    if (!discount.type) {
      throw {
        status: BADREQUESTCODE,
        message:
          "Discount 'type' is required (e.g., 'STARTUP_FOUNDER', 'VETERAN_OWNED_BUSINESS', 'NONPROFIT_ORGANIZATION', 'NOT_ELIGIBLE')",
      };
    }

    if (discount.percent === undefined || discount.percent === null) {
      throw {
        status: BADREQUESTCODE,
        message: "Discount 'percent' is required (0-100)",
      };
    }

    if (discount.percent < 0 || discount.percent > 100) {
      throw {
        status: BADREQUESTCODE,
        message: "Discount percent must be between 0 and 100",
      };
    }

    const visitor = await visitorService.getVisitorById(visitorId);
    if (!visitor) {
      throw { status: NOTFOUNDCODE, message: "Visitor not found" };
    }

    await visitorService.upsertVisitorDiscount(visitorId, discount);

    const updatedVisitor = await visitorService.getVisitorById(visitorId);
    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Discount added successfully",
      updatedVisitor,
    );
  }),

  /**
   * Step 7: Add timeline selection
   */
  addVisitorTimeline: asyncHandler(async (req, res) => {
    const { visitorId } = req.params;
    const timeline = req.body as TVISITOR_TIMELINE;

    if (!visitorId) {
      throw { status: BADREQUESTCODE, message: "Visitor ID is required" };
    }

    // Validate request format
    if (!timeline.option) {
      throw {
        status: BADREQUESTCODE,
        message:
          "Timeline 'option' is required (e.g., 'STANDARD_BUILD', 'PRIORITY_BUILD', 'ACCELERATED_BUILD', 'RAPID_BUILD', 'FAST_TRACK_BUILD')",
      };
    }

    if (
      timeline.rushFeePercent === undefined ||
      timeline.rushFeePercent === null
    ) {
      throw {
        status: BADREQUESTCODE,
        message: "Timeline 'rushFeePercent' is required (0-100)",
      };
    }

    if (timeline.rushFeePercent < 0 || timeline.rushFeePercent > 100) {
      throw {
        status: BADREQUESTCODE,
        message: "Rush fee percent must be between 0 and 100",
      };
    }

    if (!timeline.estimatedDays || timeline.estimatedDays <= 0) {
      throw {
        status: BADREQUESTCODE,
        message:
          "Timeline 'estimatedDays' is required and must be greater than 0",
      };
    }

    const visitor = await visitorService.getVisitorById(visitorId);
    if (!visitor) {
      throw { status: NOTFOUNDCODE, message: "Visitor not found" };
    }

    await visitorService.upsertVisitorTimeline(visitorId, timeline);

    // Auto-calculate estimate after timeline is added
    try {
      const { estimateCalculationService } = await import(
        "../../services/estimateCalculationService"
      );
      const calculation =
        await estimateCalculationService.calculateVisitorEstimate(visitorId);
      if (calculation) {
        await estimateCalculationService.saveVisitorEstimate(
          visitorId,
          calculation,
        );
      }
    } catch (error) {
      console.error("Error auto-calculating estimate:", error);
      // Don't fail the request if estimate calculation fails
    }

    const updatedVisitor = await visitorService.getVisitorById(visitorId);
    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Timeline added successfully and estimate calculated",
      updatedVisitor,
    );
  }),

  /**
   * Step 8: Add estimate
   */
  addVisitorEstimate: asyncHandler(async (req, res) => {
    const { visitorId } = req.params;
    const estimate = req.body as TVISITOR_ESTIMATE;

    if (!visitorId) {
      throw { status: BADREQUESTCODE, message: "Visitor ID is required" };
    }

    // Validate request format
    if (
      estimate.estimateAccepted === undefined ||
      estimate.estimateAccepted === null
    ) {
      throw {
        status: BADREQUESTCODE,
        message: "'estimateAccepted' is required (must be true or false)",
      };
    }

    if (
      estimate.estimateFinalPriceMin === undefined ||
      estimate.estimateFinalPriceMin === null
    ) {
      throw {
        status: BADREQUESTCODE,
        message: "'estimateFinalPriceMin' is required",
      };
    }

    if (
      estimate.estimateFinalPriceMax === undefined ||
      estimate.estimateFinalPriceMax === null
    ) {
      throw {
        status: BADREQUESTCODE,
        message: "'estimateFinalPriceMax' is required",
      };
    }

    if (estimate.estimateFinalPriceMin < 0) {
      throw {
        status: BADREQUESTCODE,
        message: "Minimum price must be greater than or equal to 0",
      };
    }

    if (estimate.estimateFinalPriceMax < estimate.estimateFinalPriceMin) {
      throw {
        status: BADREQUESTCODE,
        message: "Maximum price must be greater than or equal to minimum price",
      };
    }

    const visitor = await visitorService.getVisitorById(visitorId);
    if (!visitor) {
      throw { status: NOTFOUNDCODE, message: "Visitor not found" };
    }

    await visitorService.upsertVisitorEstimate(visitorId, estimate);

    const updatedVisitor = await visitorService.getVisitorById(visitorId);
    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Estimate added successfully",
      updatedVisitor,
    );
  }),

  /**
   * Step 9: Add service agreement (final step)
   */
  addVisitorServiceAgreement: asyncHandler(async (req, res) => {
    const { visitorId } = req.params;
    const agreement = req.body as TVISITOR_SERVICE_AGREEMENT;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get("user-agent");

    if (!visitorId) {
      throw { status: BADREQUESTCODE, message: "Visitor ID is required" };
    }

    const visitor = await visitorService.getVisitorById(visitorId);
    if (!visitor) {
      throw { status: NOTFOUNDCODE, message: "Visitor not found" };
    }

    // Add IP and user agent to agreement
    const agreementWithMetadata = {
      ...agreement,
      ipAddress,
      userAgent,
    };

    await visitorService.upsertVisitorServiceAgreement(
      visitorId,
      agreementWithMetadata,
    );

    const updatedVisitor = await visitorService.getVisitorById(visitorId);
    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Service agreement completed successfully. You can now register as a client.",
      updatedVisitor,
    );
  }),

  /**
   * Get single visitor by ID
   */
  getSingleVisitor: asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
      throw { status: BADREQUESTCODE, message: "Visitor ID is required" };
    }

    const visitor = await visitorService.getVisitorById(id);

    if (!visitor) {
      throw { status: NOTFOUNDCODE, message: "Visitor not found" };
    }

    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, visitor);
  }),

  /**
   * Get all visitors (Admin only)
   */
  getAllVisitors: asyncHandler(async (req, res) => {
    const { page = "1", limit = "10", clientId } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);

    const result = await visitorService.getAllVisitors({
      page: pageNum,
      limit: limitNum,
      clientId: clientId as string,
    });

    httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, result);
  }),

  /**
   * Check if visitor email exists and whether it's a client
   */
  checkVisitorEmail: asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      throw { status: BADREQUESTCODE, message: "Email is required" };
    }

    // Check if email is already a client
    const existingClient = await visitorService.checkIfEmailIsClient(email);

    if (existingClient) {
      httpResponse(req, res, SUCCESSCODE, "Email found", {
        isClient: existingClient.role === "CLIENT",
        clientId: existingClient.uid,
        message: "Please login to add a new project",
      });
      return;
    }

    // Check if visitor with this email exists
    const existingVisitor = await visitorService.getVisitorByEmail(email);

    if (existingVisitor) {
      httpResponse(req, res, SUCCESSCODE, "Visitor found", {
        isClient: false,
        isVisitor: true,
        visitorId: existingVisitor.id,
        message:
          "Visitor data found. You can continue from where you left off.",
      });
      return;
    }

    httpResponse(req, res, SUCCESSCODE, "Email available", {
      isClient: false,
      isVisitor: false,
      message: "Email is available for registration",
    });
  }),

  /**
   * Get visitor estimate details
   */
  getVisitorEstimate: asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
      throw { status: BADREQUESTCODE, message: "Visitor ID is required" };
    }

    const estimate = await db.visitorEstimate.findUnique({
      where: { visitorId: id },
    });

    if (!estimate) {
      throw {
        status: NOTFOUNDCODE,
        message: "Estimate not found for this visitor",
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
   * Accept visitor estimate
   */
  acceptVisitorEstimate: asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
      throw { status: BADREQUESTCODE, message: "Visitor ID is required" };
    }

    const estimate = await db.visitorEstimate.findUnique({
      where: { visitorId: id },
    });

    if (!estimate) {
      throw {
        status: NOTFOUNDCODE,
        message: "Estimate not found for this visitor",
      };
    }

    const { estimateCalculationService } = await import(
      "../../services/estimateCalculationService"
    );
    const updated = await estimateCalculationService.acceptVisitorEstimate(id);

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Estimate accepted successfully",
      updated,
    );
  }),

  /**
   * Admin override visitor estimate
   */
  adminOverrideVisitorEstimate: asyncHandler(async (req: _Request, res) => {
    const { id } = req.params;
    const { estimateFinalPriceMin, estimateFinalPriceMax } = req.body;

    if (!id) {
      throw { status: BADREQUESTCODE, message: "Visitor ID is required" };
    }

    if (
      estimateFinalPriceMin === undefined ||
      estimateFinalPriceMin === null ||
      estimateFinalPriceMax === undefined ||
      estimateFinalPriceMax === null
    ) {
      throw {
        status: BADREQUESTCODE,
        message:
          "Both estimateFinalPriceMin and estimateFinalPriceMax are required",
      };
    }

    if (estimateFinalPriceMin < 0 || estimateFinalPriceMax < 0) {
      throw {
        status: BADREQUESTCODE,
        message: "Prices must be greater than or equal to 0",
      };
    }

    if (estimateFinalPriceMax < estimateFinalPriceMin) {
      throw {
        status: BADREQUESTCODE,
        message: "Maximum price must be greater than or equal to minimum price",
      };
    }

    const estimate = await db.visitorEstimate.findUnique({
      where: { visitorId: id },
    });

    if (!estimate) {
      throw {
        status: NOTFOUNDCODE,
        message: "Estimate not found for this visitor",
      };
    }

    const { estimateCalculationService } = await import(
      "../../services/estimateCalculationService"
    );
    const updated =
      await estimateCalculationService.adminOverrideVisitorEstimate(
        id,
        estimateFinalPriceMin,
        estimateFinalPriceMax,
      );

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Estimate overridden successfully by admin",
      updated,
    );
  }),

  /**
   * Request Formal Quote - Generate and download PDF
   */
  requestFormalQuote: asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!id) {
      throw { status: BADREQUESTCODE, message: "Visitor ID is required" };
    }

    const visitor = await visitorService.getVisitorById(id);
    if (!visitor) {
      throw { status: NOTFOUNDCODE, message: "Visitor not found" };
    }

    // Check if service agreement is accepted
    const agreement = await db.visitorServiceAgreement.findUnique({
      where: { visitorId: id },
    });

    if (!agreement || !agreement.accepted) {
      throw {
        status: BADREQUESTCODE,
        message: "Service agreement must be accepted before requesting quote",
      };
    }

    try {
      const { pdfGenerationService } = await import(
        "../../services/pdfGenerationService"
      );
      const pdfBuffer = await pdfGenerationService.generateQuotePDF(id);

      // Set headers for PDF download
      const filename = `quote-${id}-${Date.now()}.pdf`;
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
      console.error("Error generating PDF:", error);
      throw {
        status: 500,
        message: "Failed to generate quote PDF",
      };
    }
  }),

  /**
   * Convert visitor to project (manual endpoint)
   */
  convertVisitorToProject: asyncHandler(async (req: _Request, res) => {
    const { id } = req.params;
    const { clientId } = req.body;

    if (!id) {
      throw { status: BADREQUESTCODE, message: "Visitor ID is required" };
    }

    if (!clientId) {
      throw { status: BADREQUESTCODE, message: "Client ID is required" };
    }

    // Check if can convert
    const { visitorConversionService } = await import(
      "../../services/visitorConversionService"
    );
    const checkResult = await visitorConversionService.canConvertVisitor(id);

    if (!checkResult.canConvert) {
      throw {
        status: BADREQUESTCODE,
        message: checkResult.reason || "Cannot convert visitor to project",
      };
    }

    try {
      const project = await visitorConversionService.convertVisitorToProject(
        id,
        clientId,
      );

      httpResponse(
        req,
        res,
        SUCCESSCODE,
        "Visitor converted to project successfully",
        project,
      );
    } catch (error: any) {
      console.error("Error converting visitor:", error);
      throw {
        status: 500,
        message: error.message || "Failed to convert visitor to project",
      };
    }
  }),

  /**
   * Delete visitor (soft delete) - Admin only
   */
  deleteVisitor: asyncHandler(async (req: _Request, res) => {
    const { id } = req.params;

    if (!id) {
      throw { status: BADREQUESTCODE, message: "Visitor ID is required" };
    }

    const visitor = await visitorService.getVisitorById(id);
    if (!visitor) {
      throw { status: NOTFOUNDCODE, message: "Visitor not found" };
    }

    await visitorService.deleteVisitor(id);

    httpResponse(req, res, SUCCESSCODE, "Visitor deleted successfully", null);
  }),
};
