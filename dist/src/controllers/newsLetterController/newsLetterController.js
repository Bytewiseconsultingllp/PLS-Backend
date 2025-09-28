"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../constants");
const db_1 = require("../../database/db");
const globalMailService_1 = require("../../services/globalMailService");
const sendNewsLetterToSubscribersService_1 = require("../../services/sendNewsLetterToSubscribersService");
const apiResponseUtils_1 = require("../../utils/apiResponseUtils");
const asyncHandlerUtils_1 = require("../../utils/asyncHandlerUtils");
const filterAdminUtils_1 = require("../../utils/filterAdminUtils");
exports.default = {
    subscribeToTheNewsLetter: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { email } = req.body;
        const isSubscribed = yield db_1.db.newsletter.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!isSubscribed) {
            yield db_1.db.newsletter.create({
                data: {
                    email: email.toLowerCase(),
                },
            });
        }
        if (isSubscribed === null || isSubscribed === void 0 ? void 0 : isSubscribed.subscriptionStatus)
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "You have are already subscribed",
            };
        if (!(isSubscribed === null || isSubscribed === void 0 ? void 0 : isSubscribed.subscriptionStatus)) {
            yield db_1.db.newsletter.update({
                where: { email: email.toLowerCase() },
                data: { subscriptionStatus: true },
            });
        }
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "You have  subscribed to our newsletter", { email, isSubscribed: true });
    })),
    unsubscribedFromNewsLetter: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { email } = req.body;
        const isSubscribed = yield db_1.db.newsletter.findUnique({
            where: { subscriptionStatus: true, email: email.toLowerCase() },
        });
        if (!isSubscribed)
            throw { status: constants_1.BADREQUESTCODE, message: "You are not subscribed" };
        yield db_1.db.newsletter.update({
            where: { email: email.toLowerCase() },
            data: { subscriptionStatus: false },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "You have unsubscribed from our newsletter");
    })),
    sendNewsLetterToSingleSubscriber: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { email, newsLetter } = req.body;
        const isSubscribed = yield db_1.db.newsletter.findUnique({
            where: { email: email.toLowerCase(), subscriptionStatus: true },
        });
        if ((0, filterAdminUtils_1.filterAdmin)(email))
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "Cannot send newsletter to admin",
            };
        if (!isSubscribed)
            throw { status: constants_1.BADREQUESTCODE, message: "You are not subscribed" };
        yield (0, sendNewsLetterToSubscribersService_1.sendNewsLetterToSubscribers)(email, newsLetter);
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "News letter sent successfully");
    })),
    sendNewsLetterToAllSubscribers: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { newsLetter } = req.body;
        const allSubscribers = yield db_1.db.newsletter.findMany({
            where: { subscriptionStatus: true },
        });
        yield Promise.all(allSubscribers.map((subscriber) => (0, globalMailService_1.gloabalMailMessage)(subscriber.email, newsLetter, "Prime Logic Solutions", `Dear ${subscriber.email}`)));
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "News letter sent successfully");
    })),
    listAllSubscribedMails: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { page = 1, limit = 10 } = req.query;
        const pageNumber = Number(page);
        const pageLimit = Number(limit);
        if (isNaN(pageNumber) ||
            isNaN(pageLimit) ||
            pageNumber <= 0 ||
            pageLimit <= 0) {
            throw { status: 400, message: "Invalid pagination parameters!!" };
        }
        const skip = (pageNumber - 1) * pageLimit;
        const take = pageLimit;
        const allSubscribers = yield db_1.db.newsletter.findMany({
            select: { email: true },
            skip,
            take,
            orderBy: {
                createdAt: "asc",
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "Subscribed Mails", allSubscribers);
    })),
};
