import { Router } from "express";
import { validateDataMiddleware } from "../../middlewares/validationMiddleware";
import { projectBuilderSchema } from "../../validation/zod";
import projectBuilderController from "../../controllers/projectBuilderController/projectBuilderController";
import authMiddleware from "../../middlewares/authMiddleware";

export const projectBuilderRouter = Router();

// ** Create ProjectBuilder
projectBuilderRouter
  .route("/")
  .post(
    validateDataMiddleware(projectBuilderSchema),
    authMiddleware.checkToken,
    projectBuilderController.createProjectBuilder,
  );

// ** Get All ProjectBuilders
projectBuilderRouter
  .route("/")
  .get(
    authMiddleware.checkToken,
    projectBuilderController.getAllProjectBuilders,
  );

// ** Get Single ProjectBuilder by ID
projectBuilderRouter
  .route("/:id")
  .get(
    authMiddleware.checkToken,
    projectBuilderController.getSingleProjectBuilder,
  );

// ** Update ProjectBuilder
projectBuilderRouter
  .route("/:id")
  .put(
    validateDataMiddleware(projectBuilderSchema),
    authMiddleware.checkToken,
    projectBuilderController.updateProjectBuilder,
  );

// ** Delete ProjectBuilder (Soft Delete)
projectBuilderRouter
  .route("/:id")
  .delete(
    authMiddleware.checkToken,
    projectBuilderController.deleteProjectBuilder,
  );
