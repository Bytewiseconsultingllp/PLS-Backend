"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.freeLancerRouter = void 0;
const express_1 = require("express");
const freeLancerController_1 = __importDefault(require("../../controllers/freeLancerController/freeLancerController"));
const freeLancerControllerV2_1 = __importDefault(require("../../controllers/freeLancerController/freeLancerControllerV2"));
const freelancerRegistrationController_1 = __importDefault(require("../../controllers/freeLancerController/freelancerRegistrationController"));
const authMiddleware_1 = __importDefault(require("../../middlewares/authMiddleware"));
const rateLimiterMiddleware_1 = __importDefault(require("../../middlewares/rateLimiterMiddleware"));
const validationMiddleware_1 = require("../../middlewares/validationMiddleware");
const zod_1 = require("../../validation/zod");
exports.freeLancerRouter = (0, express_1.Router)();
exports.freeLancerRouter
    .route("/getFreeLancerJoinUsRequest")
    .post((0, validationMiddleware_1.validateDataMiddleware)(zod_1.freeLancerSchema), (req, res, next) => rateLimiterMiddleware_1.default.handle(req, res, next, 10, undefined, 10, 300), freeLancerController_1.default.getFreeLancerJoinUsRequest);
exports.freeLancerRouter
    .route("/getAllFreeLancerRequest")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, freeLancerController_1.default.getAllFreeLancerRequest);
exports.freeLancerRouter
    .route("/getSingleFreeLancerRequest/:id")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, freeLancerController_1.default.getSingleFreeLancerRequest);
exports.freeLancerRouter
    .route("/deleteFreeLancerRequest/:id")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, freeLancerController_1.default.deleteFreeLancerRequest);
exports.freeLancerRouter
    .route("/trashFreeLancerRequest/:id")
    .patch(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, freeLancerController_1.default.trashFreeLancerRequest);
exports.freeLancerRouter
    .route("/untrashFreeLancerRequest/:id")
    .patch(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdmin, freeLancerController_1.default.untrashFreeLancerRequest);
exports.freeLancerRouter.route("/getFreeLancerJoinUsRequestV2").post(freeLancerControllerV2_1.default.getFreeLancerJoinUsRequest);
exports.freeLancerRouter
    .route("/getAllFreeLancerRequestV2")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, freeLancerControllerV2_1.default.getAllFreeLancerRequest);
exports.freeLancerRouter
    .route("/getSingleFreeLancerRequestV2/:id")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, freeLancerControllerV2_1.default.getSingleFreeLancerRequest);
exports.freeLancerRouter
    .route("/deleteFreeLancerRequestV2/:id")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, freeLancerControllerV2_1.default.deleteFreeLancerRequest);
exports.freeLancerRouter
    .route("/trashFreeLancerRequestV2/:id")
    .patch(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, freeLancerControllerV2_1.default.trashFreeLancerRequest);
exports.freeLancerRouter
    .route("/untrashFreeLancerRequestV2/:id")
    .patch(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdmin, freeLancerControllerV2_1.default.untrashFreeLancerRequest);
exports.freeLancerRouter
    .route("/createNicheListForFreelancer/")
    .post(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, freeLancerController_1.default.createNicheListForFreelancer);
exports.freeLancerRouter
    .route("/deleteNicheForFreelancer/:id")
    .delete(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, freeLancerController_1.default.deleteNicheForFreelancer);
exports.freeLancerRouter
    .route("/listAllNichesForFreelancer")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, freeLancerController_1.default.listAllNichesForFreelancer);
exports.freeLancerRouter
    .route("/listSingleNicheForFreelancer/:id")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, freeLancerController_1.default.listSingleNicheForFreelancer);
exports.freeLancerRouter
    .route("/updateNicheForFreelancer/:id")
    .put(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, freeLancerController_1.default.updateNicheForFreelancer);
exports.freeLancerRouter
    .route("/acceptFreeLancerRequest/:id")
    .patch(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, freeLancerController_1.default.acceptFreeLancerRequest);
exports.freeLancerRouter
    .route("/listAllFreelancers")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdminModeratorOrFreeLancer, freeLancerController_1.default.listAllTheFreelancers);
exports.freeLancerRouter
    .route("/listSingleFreelancer/:username")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdminModeratorOrFreeLancer, freeLancerController_1.default.listSingleFreelancer);
exports.freeLancerRouter
    .route("/register")
    .post((0, validationMiddleware_1.validateDataMiddleware)(zod_1.freelancerRegistrationSchema), (req, res, next) => rateLimiterMiddleware_1.default.handle(req, res, next, 5, undefined, 10, 300), freelancerRegistrationController_1.default.registerFreelancer);
exports.freeLancerRouter
    .route("/registrations")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, freelancerRegistrationController_1.default.getAllFreelancerRegistrations);
exports.freeLancerRouter
    .route("/registrations/:id")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, freelancerRegistrationController_1.default.getSingleFreelancerRegistration);
exports.freeLancerRouter
    .route("/registrations/:id/accept")
    .patch(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, freelancerRegistrationController_1.default.acceptFreelancerRegistration);
exports.freeLancerRouter
    .route("/registrations/:id/reject")
    .delete(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, freelancerRegistrationController_1.default.rejectFreelancerRegistration);
exports.freeLancerRouter
    .route("/registrations/:id/trash")
    .patch(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, freelancerRegistrationController_1.default.trashFreelancerRegistration);
exports.freeLancerRouter
    .route("/registrations/:id/untrash")
    .patch(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdmin, freelancerRegistrationController_1.default.untrashFreelancerRegistration);
