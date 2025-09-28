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
const passwordHasherService_1 = require("../../services/passwordHasherService");
const slugStringGeneratorService_1 = require("../../services/slugStringGeneratorService");
const apiResponseUtils_1 = require("../../utils/apiResponseUtils");
const asyncHandlerUtils_1 = require("../../utils/asyncHandlerUtils");
const freeLancerControllerV2 = {
    getFreeLancerJoinUsRequest: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        const freeLancer = req.body;
        if (!freeLancer.whoYouAre.email) {
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "Email is required for sending confirmation.",
            };
        }
        const isExist = yield db_1.db.profile.findFirst({
            where: {
                whoYouAre: { email: freeLancer.whoYouAre.email },
            },
        });
        if (isExist) {
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "You've already requested for joining us",
            };
        }
        const userId = (_b = (_a = req.userFromToken) === null || _a === void 0 ? void 0 : _a.uid) !== null && _b !== void 0 ? _b : null;
        const legalAgreementsCreate = freeLancer.legalAgreements
            ? {
                create: Object.assign(Object.assign({ agreements: freeLancer.legalAgreements.agreements || [] }, (((_c = freeLancer.legalAgreements.identityVerification) === null || _c === void 0 ? void 0 : _c.idType) &&
                    freeLancer.legalAgreements.identityVerification.taxDocType &&
                    typeof freeLancer.legalAgreements.identityVerification
                        .addressVerified === "boolean"
                    ? {
                        identityVerification: {
                            create: {
                                idType: freeLancer.legalAgreements.identityVerification.idType,
                                taxDocType: freeLancer.legalAgreements.identityVerification
                                    .taxDocType,
                                addressVerified: freeLancer.legalAgreements.identityVerification
                                    .addressVerified,
                            },
                        },
                    }
                    : {})), (freeLancer.legalAgreements.workAuthorization
                    ? {
                        workAuthorization: {
                            create: {
                                interested: freeLancer.legalAgreements.workAuthorization
                                    .interested || false,
                            },
                        },
                    }
                    : {})),
            }
            : undefined;
        const profileData = {
            userId,
            whoYouAre: {
                create: {
                    fullName: freeLancer.whoYouAre.fullName || "",
                    email: freeLancer.whoYouAre.email,
                    timeZone: freeLancer.whoYouAre.timeZone || "UTC",
                    country: freeLancer.whoYouAre.country || null,
                    professionalLinks: freeLancer.whoYouAre.professionalLinks || {},
                    phone: freeLancer.whoYouAre.phone || null,
                },
            },
        };
        if (freeLancer.coreRole) {
            profileData.coreRole = {
                create: {
                    primaryDomain: freeLancer.coreRole.primaryDomain || "",
                },
            };
        }
        if (freeLancer.eliteSkillCards) {
            profileData.eliteSkillCards = {
                create: {
                    selectedSkills: freeLancer.eliteSkillCards.selectedSkills || [],
                },
            };
        }
        if (freeLancer.toolstackProficiency) {
            profileData.toolstackProficiency = {
                create: {
                    selectedTools: freeLancer.toolstackProficiency.selectedTools || [],
                },
            };
        }
        if (freeLancer.domainExperience) {
            profileData.domainExperience = {
                create: {
                    roles: freeLancer.domainExperience.roles || [],
                },
            };
        }
        if (freeLancer.industryExperience) {
            profileData.industryExperience = {
                create: {
                    selectedIndustries: freeLancer.industryExperience.selectedIndustries || [],
                },
            };
        }
        if (freeLancer.availabilityWorkflow) {
            profileData.availabilityWorkflow = {
                create: {
                    weeklyCommitment: freeLancer.availabilityWorkflow.weeklyCommitment || 0,
                    workingHours: freeLancer.availabilityWorkflow.workingHours || [],
                    collaborationTools: freeLancer.availabilityWorkflow.collaborationTools || [],
                    teamStyle: freeLancer.availabilityWorkflow.teamStyle || "",
                    screenSharing: freeLancer.availabilityWorkflow.screenSharing || "",
                    availabilityExceptions: freeLancer.availabilityWorkflow.availabilityExceptions || "",
                },
            };
        }
        if (freeLancer.softSkills) {
            profileData.softSkills = {
                create: {
                    collaborationStyle: freeLancer.softSkills.collaborationStyle || "",
                    communicationFrequency: freeLancer.softSkills.communicationFrequency || "",
                    conflictResolution: freeLancer.softSkills.conflictResolution || "",
                    languages: freeLancer.softSkills.languages || [],
                    teamVsSolo: freeLancer.softSkills.teamVsSolo || "",
                },
            };
        }
        if (freeLancer.certifications) {
            profileData.certifications = {
                create: {
                    certificates: freeLancer.certifications.certificates || [],
                },
            };
        }
        if (freeLancer.projectQuoting) {
            profileData.projectQuoting = {
                create: {
                    compensationPreference: freeLancer.projectQuoting.compensationPreference || "",
                    smallProjectPrice: freeLancer.projectQuoting.smallProjectPrice || 0,
                    midProjectPrice: freeLancer.projectQuoting.midProjectPrice || 0,
                    longTermPrice: freeLancer.projectQuoting.longTermPrice || 0,
                    milestoneTerms: freeLancer.projectQuoting.milestoneTerms || "",
                    willSubmitProposals: freeLancer.projectQuoting.willSubmitProposals || "",
                },
            };
        }
        if (legalAgreementsCreate) {
            profileData.legalAgreements = legalAgreementsCreate;
        }
        yield db_1.db.profile.create({
            data: profileData,
        });
        res
            .status(201)
            .json({ message: "Freelancer profile created successfully" });
    })),
    getAllFreeLancerRequest: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const profiles = yield db_1.db.profile.findMany({
            where: {
                trashedAt: null,
                trashedBy: null,
                isAccepted: false,
            },
            include: {
                whoYouAre: true,
                coreRole: true,
                eliteSkillCards: true,
                toolstackProficiency: true,
                domainExperience: true,
                industryExperience: true,
                availabilityWorkflow: true,
                softSkills: true,
                certifications: true,
                projectQuoting: true,
                legalAgreements: true,
            },
        });
        if (profiles.length === 0) {
            (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.NOTFOUNDMSG, null);
        }
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, profiles);
    })),
    getSingleFreeLancerRequest: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        if (!id)
            throw { status: constants_1.BADREQUESTCODE, message: "Profile id is required." };
        const profile = yield db_1.db.profile.findFirst({
            where: {
                id,
                trashedAt: null,
                trashedBy: null,
            },
            include: {
                whoYouAre: true,
                coreRole: true,
                eliteSkillCards: true,
                toolstackProficiency: true,
                domainExperience: true,
                industryExperience: true,
                availabilityWorkflow: true,
                softSkills: true,
                certifications: true,
                projectQuoting: true,
                legalAgreements: true,
            },
        });
        if (!profile)
            throw { status: constants_1.NOTFOUNDCODE, message: constants_1.NOTFOUNDMSG };
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, profile);
    })),
    trashFreeLancerRequest: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { id } = req.params;
        if (!id)
            throw { status: constants_1.BADREQUESTCODE, message: "Profile id is required." };
        const uid = (_a = req.userFromToken) === null || _a === void 0 ? void 0 : _a.uid;
        const userWhoTrashed = yield db_1.db.user.findUnique({ where: { uid } });
        if (!userWhoTrashed)
            throw { status: constants_1.BADREQUESTCODE, message: "User not found" };
        yield db_1.db.profile.update({
            where: { id: id },
            data: {
                trashedBy: `@${userWhoTrashed.username}-${userWhoTrashed.fullName}-${userWhoTrashed.role}`,
                trashedAt: new Date(),
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG);
    })),
    untrashFreeLancerRequest: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        if (!id)
            throw { status: constants_1.BADREQUESTCODE, message: "Profile id is required." };
        yield db_1.db.profile.update({
            where: { id: id },
            data: {
                trashedBy: null,
                trashedAt: null,
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG);
    })),
    deleteFreeLancerRequest: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        if (!id)
            throw { status: constants_1.BADREQUESTCODE, message: "Profile id is required." };
        const isRequestExist = yield db_1.db.profile.findUnique({
            where: { id: id },
            select: { id: true },
        });
        if (!isRequestExist)
            throw { status: constants_1.NOTFOUNDCODE, message: constants_1.NOTFOUNDMSG };
        yield db_1.db.profile.delete({
            where: { id: id },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG);
    })),
    acceptFreeLancerRequest: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        if (!id)
            throw { status: constants_1.BADREQUESTCODE, message: "Profile id is required." };
        const profile = yield db_1.db.profile.findUnique({
            where: { id: id },
            include: { whoYouAre: true },
        });
        if (!profile || !profile.whoYouAre)
            throw { status: constants_1.NOTFOUNDCODE, message: constants_1.NOTFOUNDMSG };
        yield db_1.db.profile.update({
            where: { id },
            data: { isAccepted: true },
        });
        const randomPassword = (0, slugStringGeneratorService_1.generateRandomStrings)(6);
        const hashedPassword = yield (0, passwordHasherService_1.passwordHasher)(randomPassword, res);
        const isFreelancerAlreadyExist = yield db_1.db.user.findUnique({
            where: { email: profile.whoYouAre.email ? profile.whoYouAre.email : "" },
        });
        if (isFreelancerAlreadyExist && profile.whoYouAre.email) {
            yield db_1.db.user.update({
                where: { email: profile.whoYouAre.email },
                data: { role: "FREELANCER" },
            });
            return res
                .status(constants_1.SUCCESSCODE)
                .json({
                success: true,
                status: constants_1.SUCCESSCODE,
                message: "As user already exists, its role changed to freelancer",
            })
                .end();
        }
        const createdFreelancer = yield db_1.db.user.create({
            data: {
                username: `${(0, slugStringGeneratorService_1.generateUsername)(profile.whoYouAre.fullName || "freelancer")}_${(0, slugStringGeneratorService_1.generateRandomStrings)(4)}`.toLowerCase(),
                email: profile.whoYouAre.email,
                fullName: profile.whoYouAre.fullName || "Freelancer",
                role: "FREELANCER",
                phone: profile.whoYouAre.phone || null,
                password: hashedPassword,
                emailVerifiedAt: new Date(),
            },
        });
        yield (0, globalMailService_1.gloabalMailMessage)(createdFreelancer.email, `${constants_1.WELCOMEMESSAGEFORFREELANCER} <p>Please use the following credentials to access your Dashboard from where you can see the list of all the projects.</p>
      <br>
      Username:<p style="color:blue;font-weight:bold;">${createdFreelancer.username}</p>
      Password:<p style="color:blue;font-weight:bold;">${randomPassword}</p>
      <p>Best Regards,</p> ${constants_1.COMPANY_NAME}`, `Congratulations For Joining Us`, `Dear, ${createdFreelancer.fullName}`);
        yield db_1.db.profile.delete({ where: { id } });
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
};
exports.default = freeLancerControllerV2;
