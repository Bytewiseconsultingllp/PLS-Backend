import { Router } from "express";
import { validateDataMiddleware } from "../../middlewares/validationMiddleware";
import { visitorsSchema } from "../../validation/zod";
import visitorsController from "../../controllers/visitorsController/visitorsController";
import authMiddleware from "../../middlewares/authMiddleware";

export const visitorsRouter = Router();

// ** Create Visitor
visitorsRouter
  .route("/")
  .post(
    validateDataMiddleware(visitorsSchema),
    visitorsController.createVisitor,
  );

// ** Test endpoint for validation testing
visitorsRouter
  .route("/test")
  .post(
    validateDataMiddleware(visitorsSchema),
    visitorsController.createVisitor,
  );

// ** Get All Visitors
visitorsRouter
  .route("/")
  .get(authMiddleware.checkToken, visitorsController.getAllVisitors);

// ** Get Single Visitor by ID
visitorsRouter
  .route("/:id")
  .get(authMiddleware.checkToken, visitorsController.getSingleVisitor);

// ** Update Visitor
visitorsRouter
  .route("/:id")
  .put(
    validateDataMiddleware(visitorsSchema),
    authMiddleware.checkToken,
    visitorsController.updateVisitor,
  );

// ** Delete Visitor (Soft Delete)
visitorsRouter
  .route("/:id")
  .delete(authMiddleware.checkToken, visitorsController.deleteVisitor);
