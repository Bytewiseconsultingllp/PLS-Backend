"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuoteRouter = void 0;
const express_1 = require("express");
const getQuoteController_1 = __importDefault(require("../../controllers/getQuoteController/getQuoteController"));
const validationMiddleware_1 = require("../../middlewares/validationMiddleware");
const zod_1 = require("../../validation/zod");
const authMiddleware_1 = __importDefault(require("../../middlewares/authMiddleware"));
const rateLimiterMiddleware_1 = __importDefault(require("../../middlewares/rateLimiterMiddleware"));
exports.getQuoteRouter = (0, express_1.Router)();
exports.getQuoteRouter.route("/createQuote").post((0, validationMiddleware_1.validateDataMiddleware)(zod_1.getQuoteSchema), (req, res, next) => rateLimiterMiddleware_1.default.handle(req, res, next, 10), getQuoteController_1.default.createQuote);
exports.getQuoteRouter
    .route("/createServicesForQuote")
    .post(getQuoteController_1.default.createServicesForQuote);
exports.getQuoteRouter
    .route("/deleteServicesForQuote/:id")
    .delete(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, getQuoteController_1.default.deleteServicesForQuote);
exports.getQuoteRouter
    .route("/getSingleQuote/:id")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, getQuoteController_1.default.getSingleQuote);
exports.getQuoteRouter
    .route("/getAllQuotes")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, getQuoteController_1.default.getAllQuote);
exports.getQuoteRouter
    .route("/trashQuote/:id")
    .patch(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, getQuoteController_1.default.trashQuote);
exports.getQuoteRouter
    .route("/unTrashQuote/:id")
    .patch(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdmin, getQuoteController_1.default.unTrashQuote);
exports.getQuoteRouter
    .route("/deleteQuote/:id")
    .delete(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdmin, getQuoteController_1.default.deleteQuote);
