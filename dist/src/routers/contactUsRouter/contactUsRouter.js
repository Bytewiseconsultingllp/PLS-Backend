"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.contactUsRouter = void 0;
const express_1 = require("express");
const contactUsController_1 = __importDefault(require("../../controllers/contactUsController/contactUsController"));
const rateLimiterMiddleware_1 = __importDefault(require("../../middlewares/rateLimiterMiddleware"));
const zod_1 = require("../../validation/zod");
const validationMiddleware_1 = require("../../middlewares/validationMiddleware");
const authMiddleware_1 = __importDefault(require("../../middlewares/authMiddleware"));
exports.contactUsRouter = (0, express_1.Router)();
exports.contactUsRouter
    .route("/createMessage")
    .post((0, validationMiddleware_1.validateDataMiddleware)(zod_1.contactUsSchema), (req, res, next) => rateLimiterMiddleware_1.default.handle(req, res, next, 5), contactUsController_1.default.createMessage);
exports.contactUsRouter
    .route("/getAllMessages")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, contactUsController_1.default.getAllMessages);
exports.contactUsRouter
    .route("/getSingleMessage/:id")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, contactUsController_1.default.getSingleMessage);
exports.contactUsRouter
    .route("/deleteMessage/:id")
    .delete(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdmin, contactUsController_1.default.deleteMessage);
exports.contactUsRouter
    .route("/sendMessageToUser/:id")
    .post(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, contactUsController_1.default.sendMessageToUser);
exports.contactUsRouter
    .route("/moveMessageToTrash")
    .patch(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, contactUsController_1.default.trashMessage);
exports.contactUsRouter
    .route("/unTrashMessage")
    .patch(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdmin, contactUsController_1.default.unTrashMessage);
