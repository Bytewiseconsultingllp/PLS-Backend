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
const slugStringGeneratorService_1 = require("../../services/slugStringGeneratorService");
const db_1 = require("../../database/db");
const passwordHasherService_1 = require("../../services/passwordHasherService");
const slugStringGeneratorService_2 = require("../../services/slugStringGeneratorService");
const apiResponseUtils_1 = require("../../utils/apiResponseUtils");
const asyncHandlerUtils_1 = require("../../utils/asyncHandlerUtils");
const globalMailService_1 = require("../../services/globalMailService");
exports.default = {
    getFreeLancerJoinUsRequest: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const freeLancer = req.body;
        const isExist = yield db_1.db.freeLancersRequest.findUnique({
            where: {
                email: freeLancer.email,
                phone: freeLancer.phone,
            },
        });
        if (isExist)
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "You've already requested for joining us",
            };
        yield db_1.db.freeLancersRequest.create({
            data: freeLancer,
        });
        yield (0, globalMailService_1.gloabalMailMessage)(freeLancer.email, constants_1.THANKYOUMESSAGE, `Your Request Join us`, `Dear, ${freeLancer.name}`);
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG);
    })),
    getAllFreeLancerRequest: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const freelancers = yield db_1.db.freeLancersRequest.findMany({
            where: {
                trashedAt: null,
                trashedBy: null,
                isAccepted: false,
            },
        });
        if (freelancers.length === 0)
            (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.NOTFOUNDMSG, null);
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, freelancers);
    })),
    getSingleFreeLancerRequest: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const freelancer = yield db_1.db.freeLancersRequest.findUnique({
            where: {
                id: Number(id),
                trashedAt: null,
                trashedBy: null,
            },
        });
        if (!freelancer)
            throw { status: constants_1.NOTFOUNDCODE, message: constants_1.NOTFOUNDMSG };
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, freelancer);
    })),
    trashFreeLancerRequest: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { id } = req.params;
        const uid = (_a = req.userFromToken) === null || _a === void 0 ? void 0 : _a.uid;
        const userWhoTrashed = yield db_1.db.user.findUnique({ where: { uid: uid } });
        if (!userWhoTrashed)
            throw { status: constants_1.BADREQUESTCODE, message: "User not found" };
        yield db_1.db.freeLancersRequest.update({
            where: {
                id: Number(id),
            },
            data: {
                trashedBy: `@${userWhoTrashed.username}-${userWhoTrashed.fullName}-${userWhoTrashed.role}`,
                trashedAt: new Date(),
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG);
    })),
    untrashFreeLancerRequest: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        yield db_1.db.freeLancersRequest.update({
            where: {
                id: Number(id),
            },
            data: {
                trashedBy: null,
                trashedAt: null,
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG);
    })),
    deleteFreeLancerRequest: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const isRequestExist = yield db_1.db.freeLancersRequest.findUnique({
            where: { id: Number(id) },
            select: { id: true },
        });
        if (!isRequestExist)
            throw { status: constants_1.NOTFOUNDCODE, message: constants_1.NOTFOUNDMSG };
        yield db_1.db.freeLancersRequest.delete({
            where: {
                id: Number(id),
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG);
    })),
    acceptFreeLancerRequest: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const isRequestExist = yield db_1.db.freeLancersRequest.findUnique({
            where: { id: Number(id) },
        });
        if (!isRequestExist)
            throw { status: constants_1.NOTFOUNDCODE, message: constants_1.NOTFOUNDMSG };
        yield db_1.db.freeLancersRequest.update({
            where: {
                id: Number(id),
            },
            data: {
                isAccepted: true,
            },
        });
        const randomPassword = (0, slugStringGeneratorService_2.generateRandomStrings)(6);
        const hashedPassword = (yield (0, passwordHasherService_1.passwordHasher)(randomPassword, res));
        const isFreelancerAlreadyExist = yield db_1.db.user.findUnique({
            where: {
                email: isRequestExist === null || isRequestExist === void 0 ? void 0 : isRequestExist.email,
            },
        });
        if (isFreelancerAlreadyExist) {
            yield db_1.db.user.update({
                where: {
                    email: isRequestExist === null || isRequestExist === void 0 ? void 0 : isRequestExist.email,
                },
                data: {
                    role: "FREELANCER",
                },
            });
            return res
                .status(constants_1.SUCCESSCODE)
                .json({
                success: true,
                status: constants_1.SUCCESSCODE,
                message: "As user already exists so its role changed to freelancer",
            })
                .end();
        }
        const createdFreelancer = yield db_1.db.user.create({
            data: {
                username: `${(0, slugStringGeneratorService_1.generateUsername)(isRequestExist.name)}_${(0, slugStringGeneratorService_2.generateRandomStrings)(4)}`.toLowerCase(),
                email: isRequestExist.email,
                fullName: isRequestExist.name,
                role: "FREELANCER",
                phone: isRequestExist.phone,
                password: hashedPassword,
                emailVerifiedAt: new Date(),
            },
        });
        yield (0, globalMailService_1.gloabalMailMessage)(createdFreelancer.email, `${constants_1.WELCOMEMESSAGEFORFREELANCER} <p>Please use the following credintials to get access of your Dashboard from where you can see the list of all the projects.</p>
      <br>
      Username:<p style="color:blue;font-weight:bold;">${createdFreelancer.username}</p>
      Password:<p style="color:blue;font-weight:bold;">${randomPassword}</p>
      <p>Best Regard,</p> ${constants_1.COMPANY_NAME}`, `Congratulations For Joining Us`, `Dear, ${createdFreelancer.fullName}`);
        yield db_1.db.freeLancersRequest.delete({
            where: {
                id: Number(id),
            },
        });
        return res
            .status(constants_1.SUCCESSCODE)
            .json({
            success: true,
            status: constants_1.SUCCESSCODE,
            message: "Request Accepted Successfully",
            createdFreelancer: createdFreelancer.uid,
        })
            .end();
    })),
    createNicheListForFreelancer: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { niche } = req.body;
        if (!niche)
            throw { status: constants_1.BADREQUESTCODE, message: "Niche is required" };
        yield db_1.db.nichesForFreelancers.create({ data: { niche } });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG);
    })),
    deleteNicheForFreelancer: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        yield db_1.db.nichesForFreelancers.delete({ where: { id: Number(id) } });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG);
    })),
    listAllNichesForFreelancer: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const niches = yield db_1.db.nichesForFreelancers.findMany();
        if (niches.length === 0)
            throw { status: constants_1.NOTFOUNDCODE, message: constants_1.NOTFOUNDMSG };
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, niches);
    })),
    updateNicheForFreelancer: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const { niche } = req.body;
        yield db_1.db.nichesForFreelancers.update({
            where: { id: Number(id) },
            data: { niche },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG);
    })),
    listSingleNicheForFreelancer: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const niche = yield db_1.db.nichesForFreelancers.findUnique({
            where: { id: Number(id) },
        });
        if (!niche)
            throw { status: constants_1.NOTFOUNDCODE, message: constants_1.NOTFOUNDMSG };
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, niche);
    })),
    listAllTheFreelancers: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const totalCount = yield db_1.db.user.count({
            where: {
                role: "FREELANCER",
                emailVerifiedAt: { not: null },
                trashedAt: null,
            },
        });
        const freelancers = yield db_1.db.user.findMany({
            where: {
                role: "FREELANCER",
                emailVerifiedAt: { not: null },
                trashedAt: null,
            },
            select: {
                username: true,
                fullName: true,
                niche: true,
                detail: true,
                kpiRankPoints: true,
                kpiRank: true,
                portfolioUrl: true,
                projects: {
                    select: {
                        projectStatus: true,
                        projectSlug: true,
                        progressPercentage: true,
                    },
                },
            },
            skip,
            take: limit,
            orderBy: {
                kpiRankPoints: "desc",
            },
        });
        if (freelancers.length === 0)
            throw { status: constants_1.NOTFOUNDCODE, message: constants_1.NOTFOUNDMSG };
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, {
            data: freelancers,
            pagination: {
                currentPage: page,
                totalPages,
                totalItems: totalCount,
                itemsPerPage: limit,
                hasNextPage,
                hasPrevPage,
            },
        });
    })),
    listSingleFreelancer: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { username } = req.params;
        if (!username)
            throw { status: constants_1.BADREQUESTCODE, message: "Username is required" };
        const freelancer = yield db_1.db.user.findFirst({
            where: {
                username,
                role: "FREELANCER",
                emailVerifiedAt: { not: null },
                trashedAt: null,
            },
            select: {
                username: true,
                fullName: true,
                email: true,
                niche: true,
                detail: true,
                kpiRankPoints: true,
                kpiRank: true,
                portfolioUrl: true,
                projects: {
                    where: {
                        trashedAt: null,
                    },
                    select: {
                        projectStatus: true,
                        projectSlug: true,
                        progressPercentage: true,
                        title: true,
                    },
                },
            },
        });
        if (!freelancer) {
            throw {
                status: constants_1.NOTFOUNDCODE,
                message: "Freelancer not found with the provided username",
            };
        }
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, freelancer);
    })),
};
