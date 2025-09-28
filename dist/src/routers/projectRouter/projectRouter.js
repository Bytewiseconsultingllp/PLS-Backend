"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectRouter = void 0;
const express_1 = require("express");
const validationMiddleware_1 = require("../../middlewares/validationMiddleware");
const zod_1 = require("../../validation/zod");
const projectController_1 = __importDefault(require("../../controllers/projectController/projectController"));
const updateProjectController_1 = __importDefault(require("../../controllers/projectController/updateProjectController"));
const authMiddleware_1 = __importDefault(require("../../middlewares/authMiddleware"));
const getProjectController_1 = __importDefault(require("../../controllers/projectController/getProjectController"));
exports.projectRouter = (0, express_1.Router)();
exports.projectRouter
    .route("/createProject")
    .post((0, validationMiddleware_1.validateDataMiddleware)(zod_1.projectSchema), authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, projectController_1.default.createProject);
exports.projectRouter
    .route("/getSingleProject/:projectSlug")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdminModeratorOrFreeLancer, projectController_1.default.getSingleProject);
exports.projectRouter
    .route("/getAllOutsourcedProjects")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdminModeratorOrFreeLancer, getProjectController_1.default.getAllOutsourcedProjects);
exports.projectRouter
    .route("/getAllProjects")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdminModeratorOrFreeLancer, getProjectController_1.default.getAllProjects);
exports.projectRouter
    .route("/getAllProjectsWithThierClient/:clientId")
    .get(authMiddleware_1.default.checkToken, getProjectController_1.default.getAllProjectsWithThierClient);
exports.projectRouter
    .route("/deleteProject/:id")
    .delete(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdmin, projectController_1.default.deleteProject);
exports.projectRouter
    .route("/getProjectForSelectedFreelancers")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdminModeratorOrFreeLancer, getProjectController_1.default.getProjectForSelectedFreelancers);
exports.projectRouter
    .route("/createInterestedFreelancers/:projectSlug")
    .patch(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdminModeratorOrFreeLancer, updateProjectController_1.default.createInterestedFreelancers);
exports.projectRouter
    .route("/removeFreelancerFromInterestedList/:projectSlug")
    .patch(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdminModeratorOrFreeLancer, updateProjectController_1.default.removeFreelancerFromInterestedList);
exports.projectRouter
    .route("/listInterestedFreelancersInSingleProject/:projectSlug")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, updateProjectController_1.default.listInterestedFreelancersInSingleProject);
exports.projectRouter
    .route("/selectFreelancerForProject/:projectSlug")
    .patch(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, updateProjectController_1.default.selectFreelancerForProject);
exports.projectRouter
    .route("/removeSelectedFreelancer/:projectSlug")
    .patch(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, updateProjectController_1.default.removeSelectedFreelancer);
exports.projectRouter.route("/updateProgressOfProject/:projectSlug").patch(updateProjectController_1.default.updateProgressOfProject);
exports.projectRouter.route("/changeProjectStatus/:projectSlug").patch(updateProjectController_1.default.changeProjectStatus);
exports.projectRouter.route("/changeProjectType/:projectSlug").patch(updateProjectController_1.default.changeProjectType);
exports.projectRouter.route("/writeReviewAndGiveRating/:projectSlug").patch(updateProjectController_1.default.writeReviewAndGiveRating);
exports.projectRouter.route("/updateProjectBySlug/:projectSlug").patch((0, validationMiddleware_1.validateDataMiddleware)(zod_1.projectSchema), updateProjectController_1.default.updateProjectBySlug);
exports.projectRouter.route("/makeProjectOutsource/:projectSlug").patch(updateProjectController_1.default.makeProjectOutsource);
