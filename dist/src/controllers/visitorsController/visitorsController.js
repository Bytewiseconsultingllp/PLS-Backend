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
const apiResponseUtils_1 = require("../../utils/apiResponseUtils");
const asyncHandlerUtils_1 = require("../../utils/asyncHandlerUtils");
exports.default = {
    createVisitor: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        const visitorData = req.body;
        const existingVisitor = yield db_1.db.visitors.findFirst({
            where: {
                businessEmail: visitorData.businessEmail,
                trashedAt: null,
                trashedBy: null,
            },
        });
        if (existingVisitor) {
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "A visitor with this business email already exists.",
            };
        }
        const createdVisitor = yield db_1.db.visitors.create({
            data: {
                fullName: visitorData.fullName,
                businessEmail: visitorData.businessEmail,
                phoneNumber: (_a = visitorData.phoneNumber) !== null && _a !== void 0 ? _a : null,
                companyName: (_b = visitorData.companyName) !== null && _b !== void 0 ? _b : null,
                companyWebsite: (_c = visitorData.companyWebsite) !== null && _c !== void 0 ? _c : null,
                businessAddress: visitorData.businessAddress,
                businessType: visitorData.businessType,
                referralSource: visitorData.referralSource,
            },
            select: {
                id: true,
                fullName: true,
                businessEmail: true,
                phoneNumber: true,
                companyName: true,
                companyWebsite: true,
                businessAddress: true,
                businessType: true,
                referralSource: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, createdVisitor);
    })),
    getAllVisitors: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { page = "1", limit = "10", businessType, referralSource, } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;
        const whereClause = {
            trashedAt: null,
            trashedBy: null,
        };
        if (businessType) {
            whereClause.businessType = businessType;
        }
        if (referralSource) {
            whereClause.referralSource = referralSource;
        }
        const [visitors, totalCount] = yield Promise.all([
            db_1.db.visitors.findMany({
                where: whereClause,
                select: {
                    id: true,
                    fullName: true,
                    businessEmail: true,
                    phoneNumber: true,
                    companyName: true,
                    companyWebsite: true,
                    businessAddress: true,
                    businessType: true,
                    referralSource: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limitNum,
            }),
            db_1.db.visitors.count({ where: whereClause }),
        ]);
        const totalPages = Math.ceil(totalCount / limitNum);
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, {
            visitors,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalCount,
                limit: limitNum,
            },
        });
    })),
    getSingleVisitor: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        if (!id)
            throw { status: constants_1.BADREQUESTCODE, message: "Visitor ID is required." };
        const visitor = yield db_1.db.visitors.findUnique({
            where: {
                id: id,
                trashedAt: null,
                trashedBy: null,
            },
            select: {
                id: true,
                fullName: true,
                businessEmail: true,
                phoneNumber: true,
                companyName: true,
                companyWebsite: true,
                businessAddress: true,
                businessType: true,
                referralSource: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!visitor) {
            throw { status: constants_1.NOTFOUNDCODE, message: "Visitor not found." };
        }
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, visitor);
    })),
    updateVisitor: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const updateData = req.body;
        if (!id)
            throw { status: constants_1.BADREQUESTCODE, message: "Visitor ID is required." };
        const existingVisitor = yield db_1.db.visitors.findUnique({
            where: { id: id, trashedAt: null, trashedBy: null },
        });
        if (!existingVisitor) {
            throw { status: constants_1.NOTFOUNDCODE, message: "Visitor not found." };
        }
        if (updateData.businessEmail &&
            updateData.businessEmail !== existingVisitor.businessEmail) {
            const duplicateVisitor = yield db_1.db.visitors.findFirst({
                where: {
                    businessEmail: updateData.businessEmail,
                    id: { not: id },
                    trashedAt: null,
                    trashedBy: null,
                },
            });
            if (duplicateVisitor) {
                throw {
                    status: constants_1.BADREQUESTCODE,
                    message: "A visitor with this business email already exists.",
                };
            }
        }
        const prismaData = Object.assign(Object.assign({}, updateData), { updatedAt: new Date() });
        if (prismaData.phoneNumber === undefined)
            prismaData.phoneNumber = null;
        if (prismaData.companyName === undefined)
            prismaData.companyName = null;
        if (prismaData.companyWebsite === undefined)
            prismaData.companyWebsite = null;
        const updatedVisitor = yield db_1.db.visitors.update({
            where: { id: id },
            data: prismaData,
            select: {
                id: true,
                fullName: true,
                businessEmail: true,
                phoneNumber: true,
                companyName: true,
                companyWebsite: true,
                businessAddress: true,
                businessType: true,
                referralSource: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, updatedVisitor);
    })),
    deleteVisitor: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { id } = req.params;
        const uid = (_a = req.userFromToken) === null || _a === void 0 ? void 0 : _a.uid;
        if (!uid)
            throw { status: constants_1.BADREQUESTCODE, message: "User ID is required." };
        if (!id)
            throw { status: constants_1.BADREQUESTCODE, message: "Visitor ID is required." };
        const existingVisitor = yield db_1.db.visitors.findUnique({
            where: { id: id, trashedAt: null, trashedBy: null },
        });
        if (!existingVisitor) {
            throw { status: constants_1.NOTFOUNDCODE, message: "Visitor not found." };
        }
        yield db_1.db.visitors.update({
            where: { id: id },
            data: {
                trashedAt: new Date(),
                trashedBy: uid,
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "Visitor deleted successfully", null);
    })),
};
