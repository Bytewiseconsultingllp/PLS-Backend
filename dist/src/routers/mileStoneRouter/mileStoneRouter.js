"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.milestoneRouter = void 0;
const express_1 = require("express");
const validationMiddleware_1 = require("../../middlewares/validationMiddleware");
const zod_1 = require("../../validation/zod");
const authMiddleware_1 = __importDefault(require("../../middlewares/authMiddleware"));
const milestoneController_1 = __importDefault(require("../../controllers/milestoneController/milestoneController"));
exports.milestoneRouter = (0, express_1.Router)();
exports.milestoneRouter
    .route("/createMilestone/:projectId")
    .post((0, validationMiddleware_1.validateDataMiddleware)(zod_1.MilestoneSchema), authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, milestoneController_1.default.createSingleProjectMilestone);
exports.milestoneRouter
    .route("/createMultipleMilestones/:projectId")
    .post((0, validationMiddleware_1.validateDataMiddleware)(zod_1.MultipleMilestoneSchema), authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, milestoneController_1.default.createMultipleMileStones);
exports.milestoneRouter
    .route("/updateMilestone/:milestoneId")
    .patch((0, validationMiddleware_1.validateDataMiddleware)(zod_1.MilestoneSchema), authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, milestoneController_1.default.updateMileStone);
exports.milestoneRouter
    .route("/deleteMilestone/:milestoneId")
    .delete(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, milestoneController_1.default.deleteMileStone);
exports.milestoneRouter
    .route("/completeMilestone/:milestoneId")
    .patch(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdminModeratorOrFreeLancer, milestoneController_1.default.completeMileStone);
exports.milestoneRouter
    .route("/updateMilestoneProgress/:milestoneId")
    .patch((0, validationMiddleware_1.validateDataMiddleware)(zod_1.MilestoneProgressSchema), authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdminModeratorOrFreeLancer, milestoneController_1.default.updateMilestoneProgress);
