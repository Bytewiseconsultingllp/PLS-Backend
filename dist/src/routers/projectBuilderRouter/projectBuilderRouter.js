"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectBuilderRouter = void 0;
const express_1 = require("express");
const validationMiddleware_1 = require("../../middlewares/validationMiddleware");
const zod_1 = require("../../validation/zod");
const projectBuilderController_1 = __importDefault(require("../../controllers/projectBuilderController/projectBuilderController"));
const authMiddleware_1 = __importDefault(require("../../middlewares/authMiddleware"));
exports.projectBuilderRouter = (0, express_1.Router)();
exports.projectBuilderRouter
    .route("/")
    .post((0, validationMiddleware_1.validateDataMiddleware)(zod_1.projectBuilderSchema), authMiddleware_1.default.checkToken, projectBuilderController_1.default.createProjectBuilder);
exports.projectBuilderRouter
    .route("/")
    .get(authMiddleware_1.default.checkToken, projectBuilderController_1.default.getAllProjectBuilders);
exports.projectBuilderRouter
    .route("/:id")
    .get(authMiddleware_1.default.checkToken, projectBuilderController_1.default.getSingleProjectBuilder);
exports.projectBuilderRouter
    .route("/:id")
    .put((0, validationMiddleware_1.validateDataMiddleware)(zod_1.projectBuilderSchema), authMiddleware_1.default.checkToken, projectBuilderController_1.default.updateProjectBuilder);
exports.projectBuilderRouter
    .route("/:id")
    .delete(authMiddleware_1.default.checkToken, projectBuilderController_1.default.deleteProjectBuilder);
exports.projectBuilderRouter
    .route("/:id/freelancers")
    .get(authMiddleware_1.default.checkToken, projectBuilderController_1.default.getProjectBuilderWithFreelancers);
exports.projectBuilderRouter
    .route("/:id/interested-freelancers")
    .post(authMiddleware_1.default.checkToken, projectBuilderController_1.default.addInterestedFreelancers);
exports.projectBuilderRouter
    .route("/:id/interested-freelancers")
    .delete(authMiddleware_1.default.checkToken, projectBuilderController_1.default.removeInterestedFreelancer);
exports.projectBuilderRouter
    .route("/:id/selected-freelancers")
    .post(authMiddleware_1.default.checkToken, projectBuilderController_1.default.selectFreelancers);
exports.projectBuilderRouter
    .route("/:id/selected-freelancers")
    .delete(authMiddleware_1.default.checkToken, projectBuilderController_1.default.removeSelectedFreelancer);
