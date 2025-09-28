import { Router } from "express";
import freeLancerController from "../../controllers/freeLancerController/freeLancerController";
import freeLancerControllerV2 from "../../controllers/freeLancerController/freeLancerControllerV2";
import freelancerRegistrationController from "../../controllers/freeLancerController/freelancerRegistrationController";
import authMiddleware from "../../middlewares/authMiddleware";
import rateLimiterMiddleware from "../../middlewares/rateLimiterMiddleware";
import { validateDataMiddleware } from "../../middlewares/validationMiddleware";
import {
  freeLancerSchema,
  freelancerRegistrationSchema,
} from "../../validation/zod";
export const freeLancerRouter = Router();

freeLancerRouter
  .route("/getFreeLancerJoinUsRequest")
  .post(
    validateDataMiddleware(freeLancerSchema),
    (req, res, next) =>
      rateLimiterMiddleware.handle(req, res, next, 10, undefined, 10, 300),
    freeLancerController.getFreeLancerJoinUsRequest,
  );
freeLancerRouter
  .route("/getAllFreeLancerRequest")
  .get(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIAdminOrModerator,
    freeLancerController.getAllFreeLancerRequest,
  );
freeLancerRouter
  .route("/getSingleFreeLancerRequest/:id")
  .get(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIAdminOrModerator,
    freeLancerController.getSingleFreeLancerRequest,
  );
freeLancerRouter
  .route("/deleteFreeLancerRequest/:id")
  .get(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIAdminOrModerator,
    freeLancerController.deleteFreeLancerRequest,
  );
freeLancerRouter
  .route("/trashFreeLancerRequest/:id")
  .patch(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIAdminOrModerator,
    freeLancerController.trashFreeLancerRequest,
  );
freeLancerRouter
  .route("/untrashFreeLancerRequest/:id")
  .patch(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIsAdmin,
    freeLancerController.untrashFreeLancerRequest,
  );
/**
 * version 2
 */
freeLancerRouter.route("/getFreeLancerJoinUsRequestV2").post(
  // validateDataMiddleware(freeLancerSchema),
  // (req, res, next) => rateLimiterMiddleware.handle(req, res, next, 10, undefined, 10, 300),
  freeLancerControllerV2.getFreeLancerJoinUsRequest,
);
freeLancerRouter
  .route("/getAllFreeLancerRequestV2")
  .get(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIAdminOrModerator,
    freeLancerControllerV2.getAllFreeLancerRequest,
  );
freeLancerRouter
  .route("/getSingleFreeLancerRequestV2/:id")
  .get(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIAdminOrModerator,
    freeLancerControllerV2.getSingleFreeLancerRequest,
  );
freeLancerRouter
  .route("/deleteFreeLancerRequestV2/:id")
  .get(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIAdminOrModerator,
    freeLancerControllerV2.deleteFreeLancerRequest,
  );
freeLancerRouter
  .route("/trashFreeLancerRequestV2/:id")
  .patch(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIAdminOrModerator,
    freeLancerControllerV2.trashFreeLancerRequest,
  );
freeLancerRouter
  .route("/untrashFreeLancerRequestV2/:id")
  .patch(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIsAdmin,
    freeLancerControllerV2.untrashFreeLancerRequest,
  );
/**
 * Create a niche list for a freelancer
 */

freeLancerRouter
  .route("/createNicheListForFreelancer/")
  .post(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIAdminOrModerator,
    freeLancerController.createNicheListForFreelancer,
  );
freeLancerRouter
  .route("/deleteNicheForFreelancer/:id")
  .delete(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIAdminOrModerator,
    freeLancerController.deleteNicheForFreelancer,
  );
freeLancerRouter
  .route("/listAllNichesForFreelancer")
  .get(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIAdminOrModerator,
    freeLancerController.listAllNichesForFreelancer,
  );
freeLancerRouter
  .route("/listSingleNicheForFreelancer/:id")
  .get(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIAdminOrModerator,
    freeLancerController.listSingleNicheForFreelancer,
  );
freeLancerRouter
  .route("/updateNicheForFreelancer/:id")
  .put(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIAdminOrModerator,
    freeLancerController.updateNicheForFreelancer,
  );
freeLancerRouter
  .route("/acceptFreeLancerRequest/:id")
  .patch(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIAdminOrModerator,
    freeLancerController.acceptFreeLancerRequest,
  );
freeLancerRouter
  .route("/listAllFreelancers")
  .get(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIsAdminModeratorOrFreeLancer,
    freeLancerController.listAllTheFreelancers,
  );
freeLancerRouter
  .route("/listSingleFreelancer/:username")
  .get(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIsAdminModeratorOrFreeLancer,
    freeLancerController.listSingleFreelancer,
  );

/**
 * New Freelancer Registration Routes (matching JSON structure)
 */
freeLancerRouter
  .route("/register")
  .post(
    validateDataMiddleware(freelancerRegistrationSchema),
    (req, res, next) =>
      rateLimiterMiddleware.handle(req, res, next, 5, undefined, 10, 300),
    freelancerRegistrationController.registerFreelancer,
  );

freeLancerRouter
  .route("/registrations")
  .get(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIAdminOrModerator,
    freelancerRegistrationController.getAllFreelancerRegistrations,
  );

freeLancerRouter
  .route("/registrations/:id")
  .get(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIAdminOrModerator,
    freelancerRegistrationController.getSingleFreelancerRegistration,
  );

freeLancerRouter
  .route("/registrations/:id/accept")
  .patch(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIAdminOrModerator,
    freelancerRegistrationController.acceptFreelancerRegistration,
  );

freeLancerRouter
  .route("/registrations/:id/reject")
  .delete(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIAdminOrModerator,
    freelancerRegistrationController.rejectFreelancerRegistration,
  );

freeLancerRouter
  .route("/registrations/:id/trash")
  .patch(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIAdminOrModerator,
    freelancerRegistrationController.trashFreelancerRegistration,
  );

freeLancerRouter
  .route("/registrations/:id/untrash")
  .patch(
    authMiddleware.checkToken,
    authMiddleware.checkIfUserIsAdmin,
    freelancerRegistrationController.untrashFreelancerRegistration,
  );
