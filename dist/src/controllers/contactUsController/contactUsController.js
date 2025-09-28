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
const config_1 = require("../../config/config");
const constants_1 = require("../../constants");
const db_1 = require("../../database/db");
const recieveMessageFromUserService_1 = require("../../services/recieveMessageFromUserService");
const sendMessageToUserService_1 = require("../../services/sendMessageToUserService");
const apiResponseUtils_1 = require("../../utils/apiResponseUtils");
const asyncHandlerUtils_1 = require("../../utils/asyncHandlerUtils");
const findUniqueUtils_1 = require("../../utils/findUniqueUtils");
exports.default = {
    createMessage: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { firstName, lastName, email, message } = req.body;
        yield (0, recieveMessageFromUserService_1.recieveMessageFromUser)(email, config_1.HOST_EMAIL, message, `${firstName} ${lastName}`);
        yield db_1.db.contactUs.create({
            data: {
                firstName,
                lastName,
                email,
                message,
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, {
            firstName,
            lastName,
            email,
            message,
        });
    })),
    getAllMessages: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [messages, totalMessages] = yield Promise.all([
            db_1.db.contactUs.findMany({
                where: { trashedBy: null },
                skip,
                take: limit,
                orderBy: {
                    createdAt: "desc",
                },
                select: {
                    id: true,
                    email: true,
                    message: true,
                    firstName: true,
                    lastName: true,
                    createdAt: true,
                },
            }),
            db_1.db.contactUs.count({ where: { trashedBy: null } }),
        ]);
        const totalPages = Math.ceil(totalMessages / limit);
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, {
            page,
            totalPages,
            limit,
            totalMessages,
            messages,
        });
    })),
    getSingleMessage: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        if (!id)
            throw { status: constants_1.BADREQUESTCODE, message: "Id is required!" };
        const message = yield db_1.db.contactUs.findUnique({
            where: {
                id: Number(id),
                trashedBy: null,
            },
            select: {
                id: true,
                email: true,
                message: true,
                firstName: true,
                lastName: true,
                createdAt: true,
            },
        });
        if (!message)
            throw { status: constants_1.NOTFOUNDCODE, message: constants_1.NOTFOUNDMSG };
        else {
            (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, message);
        }
    })),
    sendMessageToUser: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        if (!id)
            throw { status: constants_1.BADREQUESTCODE, message: "Id is required!" };
        const { message: messageByAdmin } = req.body;
        const message = yield db_1.db.contactUs.findUnique({
            where: {
                id: Number(id),
            },
        });
        if (!message)
            throw { status: constants_1.NOTFOUNDCODE, message: constants_1.NOTFOUNDMSG };
        yield (0, sendMessageToUserService_1.sendMessageToTheUserService)(message.email, messageByAdmin, `${message.firstName} ${message.lastName}`);
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, {
            messageByAdmin,
            message: `Replied to this message: ${message.message}`,
        });
    })),
    deleteMessage: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const deletedMessage = yield db_1.db.contactUs.delete({
            where: {
                id: Number(id),
            },
        });
        if (!deletedMessage)
            throw { status: constants_1.NOTFOUNDCODE, message: constants_1.NOTFOUNDMSG };
        else {
            (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "Message deleted successfully", deletedMessage);
        }
    })),
    trashMessage: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { victimUid: idOfMessageWhichIsGoingToTrashed } = req.body;
        const trashedBy = (_a = req.userFromToken) === null || _a === void 0 ? void 0 : _a.uid;
        if (!trashedBy)
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "Please Send the id of user who want to trash it",
            };
        const user = yield (0, findUniqueUtils_1.findUniqueUser)(trashedBy);
        if (!idOfMessageWhichIsGoingToTrashed)
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "Please send the id of message",
            };
        yield db_1.db.contactUs.update({
            where: {
                id: Number(idOfMessageWhichIsGoingToTrashed),
            },
            data: {
                trashedBy: `@${user === null || user === void 0 ? void 0 : user.username} - ${user === null || user === void 0 ? void 0 : user.fullName} - ${user === null || user === void 0 ? void 0 : user.role}`,
                trashedAt: new Date(),
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "Message trashed successfully");
    })),
    unTrashMessage: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { victimUid: idOfMessageWhichIsGoingToUnTrashed } = req.body;
        if (!idOfMessageWhichIsGoingToUnTrashed)
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "Please send the id of message",
            };
        yield db_1.db.contactUs.update({
            where: {
                id: Number(idOfMessageWhichIsGoingToUnTrashed),
            },
            data: {
                trashedBy: null,
                trashedAt: null,
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "Message untrashed successfully");
    })),
};
