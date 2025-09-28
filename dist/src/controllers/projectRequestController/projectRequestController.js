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
const client_1 = require("@prisma/client");
const constants_1 = require("../../constants");
const db_1 = require("../../database/db");
const apiResponseUtils_1 = require("../../utils/apiResponseUtils");
const asyncHandlerUtils_1 = require("../../utils/asyncHandlerUtils");
const ProjectRequestController = {
    create: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
        const { registerYourself, services, industries, technologies, features, specialOffers, timeline, budget, estimate, agreement, proceedOptions, } = req.body;
        const userId = (_a = req.userFromToken) === null || _a === void 0 ? void 0 : _a.uid;
        yield db_1.db.projectRequest.create({
            data: {
                userId,
                fullName: registerYourself.fullName,
                businessEmail: registerYourself.businessEmail,
                phoneNumber: registerYourself.phoneNumber || null,
                companyName: registerYourself.companyName || null,
                companyWebsite: registerYourself.companyWebsite || null,
                businessAddress: registerYourself.businessAddress || null,
                businessType: registerYourself.businessType || null,
                referralSource: registerYourself.referralSource || null,
                appliedDiscount: (specialOffers === null || specialOffers === void 0 ? void 0 : specialOffers.appliedDiscount) || null,
                timeline: timeline || null,
                paymentMethod: (budget === null || budget === void 0 ? void 0 : budget.paymentMethod) || null,
                estimateAccepted: (_b = estimate === null || estimate === void 0 ? void 0 : estimate.accepted) !== null && _b !== void 0 ? _b : false,
                comparisonVisible: (_c = estimate === null || estimate === void 0 ? void 0 : estimate.comparisonVisible) !== null && _c !== void 0 ? _c : false,
                estimateFinalPriceMin: ((_d = estimate === null || estimate === void 0 ? void 0 : estimate.finalPrice) === null || _d === void 0 ? void 0 : _d.min) || null,
                estimateFinalPriceMax: ((_e = estimate === null || estimate === void 0 ? void 0 : estimate.finalPrice) === null || _e === void 0 ? void 0 : _e.max) || null,
                estimateBasePriceMin: ((_f = estimate === null || estimate === void 0 ? void 0 : estimate.basePrice) === null || _f === void 0 ? void 0 : _f.min) || null,
                estimateBasePriceMax: ((_g = estimate === null || estimate === void 0 ? void 0 : estimate.basePrice) === null || _g === void 0 ? void 0 : _g.max) || null,
                discountPercentage: ((_h = estimate === null || estimate === void 0 ? void 0 : estimate.discount) === null || _h === void 0 ? void 0 : _h.percentage) || null,
                discountAmountMin: ((_k = (_j = estimate === null || estimate === void 0 ? void 0 : estimate.discount) === null || _j === void 0 ? void 0 : _j.amount) === null || _k === void 0 ? void 0 : _k.min) || null,
                discountAmountMax: ((_m = (_l = estimate === null || estimate === void 0 ? void 0 : estimate.discount) === null || _l === void 0 ? void 0 : _l.amount) === null || _m === void 0 ? void 0 : _m.max) || null,
                rushFeePercentage: ((_o = estimate === null || estimate === void 0 ? void 0 : estimate.rushFee) === null || _o === void 0 ? void 0 : _o.percentage) || null,
                rushFeeAmountMin: ((_q = (_p = estimate === null || estimate === void 0 ? void 0 : estimate.rushFee) === null || _p === void 0 ? void 0 : _p.amount) === null || _q === void 0 ? void 0 : _q.min) || null,
                rushFeeAmountMax: ((_s = (_r = estimate === null || estimate === void 0 ? void 0 : estimate.rushFee) === null || _r === void 0 ? void 0 : _r.amount) === null || _s === void 0 ? void 0 : _s.max) || null,
                agreementAccepted: (_t = agreement === null || agreement === void 0 ? void 0 : agreement.accepted) !== null && _t !== void 0 ? _t : false,
                selectedOption: (proceedOptions === null || proceedOptions === void 0 ? void 0 : proceedOptions.selectedOption) || null,
                completed: (_u = proceedOptions === null || proceedOptions === void 0 ? void 0 : proceedOptions.completed) !== null && _u !== void 0 ? _u : false,
                services: {
                    create: services === null || services === void 0 ? void 0 : services.map((s) => ({
                        category: s.category,
                        service: s.service,
                    })),
                },
                industries: {
                    create: industries === null || industries === void 0 ? void 0 : industries.map((i) => ({
                        category: i.category,
                        industry: i.industry,
                    })),
                },
                technologies: {
                    create: technologies === null || technologies === void 0 ? void 0 : technologies.map((t) => ({
                        category: t.category,
                        technology: t.technology,
                    })),
                },
                features: {
                    create: features === null || features === void 0 ? void 0 : features.map((f) => ({
                        category: f.category,
                        feature: f.feature,
                    })),
                },
            },
            include: {
                services: true,
                industries: true,
                technologies: true,
                features: true,
            },
        });
        return (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG);
    })),
    findAll: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { search } = req.query;
        const projectRequests = yield db_1.db.projectRequest.findMany({
            where: search
                ? {
                    OR: [
                        {
                            fullName: {
                                contains: search,
                                mode: client_1.Prisma.QueryMode.insensitive,
                            },
                        },
                        {
                            businessEmail: {
                                contains: search,
                                mode: client_1.Prisma.QueryMode.insensitive,
                            },
                        },
                        {
                            businessType: {
                                contains: search,
                                mode: client_1.Prisma.QueryMode.insensitive,
                            },
                        },
                        {
                            companyName: {
                                contains: search,
                                mode: client_1.Prisma.QueryMode.insensitive,
                            },
                        },
                    ],
                }
                : {},
            include: {
                services: true,
                industries: true,
                technologies: true,
                features: true,
            },
        });
        return (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, projectRequests);
    })),
    findById: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "ID is required" });
        }
        const projectRequest = yield db_1.db.projectRequest.findUnique({
            where: { id },
            include: {
                services: true,
                industries: true,
                technologies: true,
                features: true,
                user: true,
            },
        });
        if (!projectRequest) {
            return res.status(404).json({ error: "Project request not found" });
        }
        return (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, projectRequest);
    })),
    delete: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ error: "ID is required" });
        }
        yield db_1.db.projectRequest.delete({
            where: { id },
        });
        return (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG);
    })),
};
exports.default = ProjectRequestController;
