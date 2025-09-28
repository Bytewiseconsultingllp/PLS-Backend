"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectRequestController_1 = __importDefault(require("../../controllers/projectRequestController/projectRequestController"));
const authMiddleware_1 = __importDefault(require("../../middlewares/authMiddleware"));
const rateLimiterMiddleware_1 = __importDefault(require("../../middlewares/rateLimiterMiddleware"));
const projectRequestRouter = (0, express_1.Router)();
projectRequestRouter.route("/create").post((req, res, next) => rateLimiterMiddleware_1.default.handle(req, res, next, 10, undefined, 10, 300), projectRequestController_1.default.create);
projectRequestRouter
    .route("/")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, projectRequestController_1.default.findAll);
projectRequestRouter
    .route("/:id")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, projectRequestController_1.default.findById);
projectRequestRouter
    .route("/:id")
    .delete(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, projectRequestController_1.default.delete);
exports.default = projectRequestRouter;
