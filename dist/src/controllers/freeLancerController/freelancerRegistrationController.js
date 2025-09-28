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
const freelancerRegistrationController = {
    registerFreelancer: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        const freelancerData = req.body;
        if (!((_a = freelancerData.whoYouAre) === null || _a === void 0 ? void 0 : _a.email)) {
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "Email is required for freelancer registration.",
            };
        }
        const existingProfile = yield db_1.db.profile.findFirst({
            where: {
                whoYouAre: { email: freelancerData.whoYouAre.email },
            },
        });
        if (existingProfile) {
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "A freelancer profile with this email already exists.",
            };
        }
        const existingUser = yield db_1.db.user.findUnique({
            where: { email: freelancerData.whoYouAre.email },
        });
        if (existingUser) {
            throw {
                status: constants_1.BADREQUESTCODE,
                message: "A user with this email already exists.",
            };
        }
        const userId = (_c = (_b = req.userFromToken) === null || _b === void 0 ? void 0 : _b.uid) !== null && _c !== void 0 ? _c : null;
        const legalAgreementsCreate = {
            create: {
                agreements: (freelancerData.legalAgreements.agreements ||
                    []),
                identityVerification: {
                    create: {
                        idType: freelancerData.legalAgreements.identityVerification.idType,
                        taxDocType: freelancerData.legalAgreements.identityVerification.taxDocType,
                        addressVerified: freelancerData.legalAgreements.identityVerification
                            .addressVerified,
                    },
                },
                workAuthorization: {
                    create: {
                        interested: freelancerData.legalAgreements.workAuthorization.interested,
                    },
                },
            },
        };
        const profileData = {
            userId,
            whoYouAre: {
                create: {
                    fullName: freelancerData.whoYouAre.fullName,
                    email: freelancerData.whoYouAre.email,
                    timeZone: freelancerData.whoYouAre.timeZone,
                    country: freelancerData.whoYouAre.country,
                    professionalLinks: freelancerData.whoYouAre
                        .professionalLinks,
                },
            },
            coreRole: {
                create: {
                    primaryDomain: freelancerData.coreRole.primaryDomain,
                },
            },
            eliteSkillCards: {
                create: {
                    selectedSkills: freelancerData.eliteSkillCards
                        .selectedSkills,
                },
            },
            toolstackProficiency: {
                create: {
                    selectedTools: freelancerData.toolstackProficiency
                        .selectedTools,
                },
            },
            domainExperience: {
                create: {
                    roles: freelancerData.domainExperience.roles,
                },
            },
            industryExperience: {
                create: {
                    selectedIndustries: freelancerData.industryExperience
                        .selectedIndustries,
                },
            },
            availabilityWorkflow: {
                create: {
                    weeklyCommitment: freelancerData.availabilityWorkflow.weeklyCommitment,
                    workingHours: freelancerData.availabilityWorkflow
                        .workingHours,
                    collaborationTools: freelancerData.availabilityWorkflow
                        .collaborationTools,
                    teamStyle: freelancerData.availabilityWorkflow.teamStyle,
                    screenSharing: freelancerData.availabilityWorkflow.screenSharing,
                    availabilityExceptions: freelancerData.availabilityWorkflow.availabilityExceptions,
                },
            },
            softSkills: {
                create: {
                    collaborationStyle: freelancerData.softSkills.collaborationStyle,
                    communicationFrequency: freelancerData.softSkills.communicationFrequency,
                    conflictResolution: freelancerData.softSkills.conflictResolution,
                    languages: freelancerData.softSkills
                        .languages,
                    teamVsSolo: freelancerData.softSkills.teamVsSolo,
                },
            },
            certifications: {
                create: {
                    certificates: freelancerData.certifications
                        .certificates,
                },
            },
            projectQuoting: {
                create: {
                    compensationPreference: freelancerData.projectQuoting.compensationPreference,
                    smallProjectPrice: freelancerData.projectQuoting.smallProjectPrice,
                    midProjectPrice: freelancerData.projectQuoting.midProjectPrice,
                    longTermPrice: freelancerData.projectQuoting.longTermPrice,
                    milestoneTerms: freelancerData.projectQuoting.milestoneTerms,
                    willSubmitProposals: freelancerData.projectQuoting.willSubmitProposals,
                },
            },
            legalAgreements: legalAgreementsCreate,
        };
        const createdProfile = yield db_1.db.profile.create({
            data: profileData,
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
                legalAgreements: {
                    include: {
                        identityVerification: true,
                        workAuthorization: true,
                    },
                },
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "Freelancer registration submitted successfully. We will review your application and get back to you soon.", {
            profileId: createdProfile.id,
            email: createdProfile.whoYouAre.email,
            fullName: createdProfile.whoYouAre.fullName,
        });
    })),
    getAllFreelancerRegistrations: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
                legalAgreements: {
                    include: {
                        identityVerification: true,
                        workAuthorization: true,
                    },
                },
            },
            orderBy: {
                id: "desc",
            },
        });
        if (profiles.length === 0) {
            return (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "No freelancer registrations found", []);
        }
        return (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, profiles);
    })),
    getSingleFreelancerRegistration: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        if (!id) {
            throw { status: constants_1.BADREQUESTCODE, message: "Profile ID is required." };
        }
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
                legalAgreements: {
                    include: {
                        identityVerification: true,
                        workAuthorization: true,
                    },
                },
            },
        });
        if (!profile) {
            throw { status: constants_1.NOTFOUNDCODE, message: constants_1.NOTFOUNDMSG };
        }
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, constants_1.SUCCESSMSG, profile);
    })),
    acceptFreelancerRegistration: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        if (!id) {
            throw { status: constants_1.BADREQUESTCODE, message: "Profile ID is required." };
        }
        const profile = yield db_1.db.profile.findUnique({
            where: { id },
            include: { whoYouAre: true },
        });
        if (!profile || !profile.whoYouAre) {
            throw { status: constants_1.NOTFOUNDCODE, message: constants_1.NOTFOUNDMSG };
        }
        yield db_1.db.profile.update({
            where: { id },
            data: { isAccepted: true },
        });
        const randomPassword = (0, slugStringGeneratorService_1.generateRandomStrings)(8);
        const hashedPassword = yield (0, passwordHasherService_1.passwordHasher)(randomPassword, res);
        const existingUser = yield db_1.db.user.findUnique({
            where: { email: profile.whoYouAre.email },
        });
        if (existingUser) {
            yield db_1.db.user.update({
                where: { email: profile.whoYouAre.email },
                data: { role: "FREELANCER" },
            });
            yield db_1.db.profile.delete({ where: { id } });
            return (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "User already exists. Role updated to freelancer.", { userId: existingUser.uid });
        }
        const createdFreelancer = yield db_1.db.user.create({
            data: {
                username: `${(0, slugStringGeneratorService_1.generateUsername)(profile.whoYouAre.fullName)}_${(0, slugStringGeneratorService_1.generateRandomStrings)(4)}`.toLowerCase(),
                email: profile.whoYouAre.email,
                fullName: profile.whoYouAre.fullName,
                role: "FREELANCER",
                password: hashedPassword,
                emailVerifiedAt: new Date(),
            },
        });
        yield (0, globalMailService_1.gloabalMailMessage)(createdFreelancer.email, `${constants_1.WELCOMEMESSAGEFORFREELANCER} <p>Please use the following credentials to access your Dashboard:</p>
      <br>
      Username: <p style="color:blue;font-weight:bold;">${createdFreelancer.username}</p>
      Password: <p style="color:blue;font-weight:bold;">${randomPassword}</p>
      <p>Best Regards,</p> ${constants_1.COMPANY_NAME}`, "Welcome to Our Freelancer Platform", `Dear ${createdFreelancer.fullName}`);
        yield db_1.db.profile.delete({ where: { id } });
        return (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "Freelancer registration accepted successfully. Welcome email sent.", {
            userId: createdFreelancer.uid,
            username: createdFreelancer.username,
            email: createdFreelancer.email,
        });
    })),
    rejectFreelancerRegistration: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        if (!id) {
            throw { status: constants_1.BADREQUESTCODE, message: "Profile ID is required." };
        }
        const profile = yield db_1.db.profile.findUnique({
            where: { id },
            include: { whoYouAre: true },
        });
        if (!profile) {
            throw { status: constants_1.NOTFOUNDCODE, message: constants_1.NOTFOUNDMSG };
        }
        yield db_1.db.profile.delete({ where: { id } });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "Freelancer registration rejected and removed from the system.", null);
    })),
    trashFreelancerRegistration: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const { id } = req.params;
        if (!id) {
            throw { status: constants_1.BADREQUESTCODE, message: "Profile ID is required." };
        }
        const uid = (_a = req.userFromToken) === null || _a === void 0 ? void 0 : _a.uid;
        const userWhoTrashed = yield db_1.db.user.findUnique({ where: { uid } });
        if (!userWhoTrashed) {
            throw { status: constants_1.BADREQUESTCODE, message: "User not found" };
        }
        yield db_1.db.profile.update({
            where: { id },
            data: {
                trashedBy: `@${userWhoTrashed.username}-${userWhoTrashed.fullName}-${userWhoTrashed.role}`,
                trashedAt: new Date(),
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "Freelancer registration moved to trash successfully.");
    })),
    untrashFreelancerRegistration: (0, asyncHandlerUtils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        if (!id) {
            throw { status: constants_1.BADREQUESTCODE, message: "Profile ID is required." };
        }
        yield db_1.db.profile.update({
            where: { id },
            data: {
                trashedBy: null,
                trashedAt: null,
            },
        });
        (0, apiResponseUtils_1.httpResponse)(req, res, constants_1.SUCCESSCODE, "Freelancer registration restored from trash successfully.");
    })),
};
exports.default = freelancerRegistrationController;
