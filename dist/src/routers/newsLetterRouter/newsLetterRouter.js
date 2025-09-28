"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsLetterRouter = void 0;
const express_1 = require("express");
const authMiddleware_1 = __importDefault(require("../../middlewares/authMiddleware"));
const newsLetterController_1 = __importDefault(require("../../controllers/newsLetterController/newsLetterController"));
const rateLimiterMiddleware_1 = __importDefault(require("../../middlewares/rateLimiterMiddleware"));
const validationMiddleware_1 = require("../../middlewares/validationMiddleware");
const zod_1 = require("../../validation/zod");
exports.newsLetterRouter = (0, express_1.Router)();
exports.newsLetterRouter
    .route("/subscribeToNewsLetter")
    .post((0, validationMiddleware_1.validateDataMiddleware)(zod_1.SubscribeORunsubscribeToNewsLetterSchema), authMiddleware_1.default.checkToken, newsLetterController_1.default.subscribeToTheNewsLetter);
exports.newsLetterRouter
    .route("/unSubscribeToNewsLetter")
    .post((0, validationMiddleware_1.validateDataMiddleware)(zod_1.SubscribeORunsubscribeToNewsLetterSchema), authMiddleware_1.default.checkToken, newsLetterController_1.default.unsubscribedFromNewsLetter);
exports.newsLetterRouter
    .route("/sendNewsLetterToSingleSubscriber")
    .post((0, validationMiddleware_1.validateDataMiddleware)(zod_1.sendNewsLetterToSingleUserSchema), authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, (req, res, next) => rateLimiterMiddleware_1.default.handle(req, res, next, 1), newsLetterController_1.default.sendNewsLetterToSingleSubscriber);
exports.newsLetterRouter
    .route("/sendNewsLetterToAllSubscribers")
    .post((0, validationMiddleware_1.validateDataMiddleware)(zod_1.sendNewsLetterToAllUsersSchema), authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIAdminOrModerator, newsLetterController_1.default.sendNewsLetterToAllSubscribers);
exports.newsLetterRouter
    .route("/listAllSubscribedMails")
    .get(authMiddleware_1.default.checkToken, authMiddleware_1.default.checkIfUserIsAdmin, newsLetterController_1.default.listAllSubscribedMails);
