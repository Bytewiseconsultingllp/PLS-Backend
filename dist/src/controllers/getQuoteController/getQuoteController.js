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
const ThankYouForQuoteService_1 = require("../../services/ThankYouForQuoteService");
const apiResponseUtils_1 = require("../../utils/apiResponseUtils");
const asyncHandlerUtils_1 = require("../../utils/asyncHandlerUtils");
exports.default = {
    createQuote: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { name, email, phone, company, address, deadline, detail, services } = req.body;
        const data = {
            name,
            email,
            phone,
            address,
            services,
            company: company !== null && company !== void 0 ? company : "",
            detail: detail !== null && detail !== void 0 ? detail : "",
            deadline: deadline || "",
        };
        const createdQuote = yield db_1.db.getQuote.create({ data });
        yield (0, ThankYouForQuoteService_1.sendThankYouForQuote)(createdQuote.email, createdQuote.name);
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, data);
    })),
    createServicesForQuote: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { services } = req.body;
        if (!services)
            throw { status: constants_1.BADREQUESTCODE, message: constants_1.BADREQUESTMSG };
        yield db_1.db.createServicesForQuote.create({ data: { services } });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, { services });
    })),
    deleteServicesForQuote: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        if (!id)
            throw { status: constants_1.BADREQUESTCODE, message: constants_1.BADREQUESTMSG };
        const checkIfServiceExist = yield db_1.db.createServicesForQuote.findUnique({
            where: { id: Number(id) },
        });
        if (!checkIfServiceExist)
            throw { status: constants_1.NOTFOUNDCODE, message: constants_1.NOTFOUNDMSG };
        yield db_1.db.createServicesForQuote.delete({ where: { id: Number(id) } });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG);
    })),
    getSingleQuote: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const quote = yield db_1.db.getQuote.findUnique({
            where: { id: Number(req.params.id), trashedBy: null, trashedAt: null },
        });
        if (!quote)
            throw { status: constants_1.NOTFOUNDCODE, message: constants_1.NOTFOUNDMSG };
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, quote);
    })),
    getAllQuote: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const quotes = yield db_1.db.getQuote.findMany({
            where: { trashedAt: null, trashedBy: null },
        });
        if (quotes.length === 0)
            (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.NOTFOUNDMSG, null);
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, quotes);
    })),
    trashQuote: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const uid = (_a = req.userFromToken) === null || _a === void 0 ? void 0 : _a.uid;
        if (!uid)
            throw { status: constants_1.BADREQUESTCODE, message: constants_1.BADREQUESTMSG };
        const user = yield db_1.db.user.findUnique({ where: { uid } });
        const quote = yield db_1.db.getQuote.update({
            where: { id: Number(req.params.id) },
            data: {
                trashedBy: `@${user === null || user === void 0 ? void 0 : user.username} ${user === null || user === void 0 ? void 0 : user.fullName}-${user === null || user === void 0 ? void 0 : user.role}`,
                trashedAt: new Date(),
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, quote);
    })),
    unTrashQuote: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        yield db_1.db.getQuote.update({
            where: { id: Number(req.params.id) },
            data: { trashedBy: null, trashedAt: null },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG);
    })),
    deleteQuote: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const quote = yield db_1.db.getQuote.delete({
            where: { id: Number(req.params.id) },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, quote);
    })),
};
