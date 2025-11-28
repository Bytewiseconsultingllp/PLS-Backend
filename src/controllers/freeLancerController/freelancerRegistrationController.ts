import type { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import {
  BADREQUESTCODE,
  COMPANY_NAME,
  NOTFOUNDCODE,
  NOTFOUNDMSG,
  SUCCESSCODE,
  SUCCESSMSG,
  WELCOMEMESSAGEFORFREELANCER,
} from "../../constants";
import { db } from "../../database/db";
import type { _Request } from "../../middlewares/authMiddleware";
import { gloabalMailMessage } from "../../services/globalMailService";
import { passwordHasher } from "../../services/passwordHasherService";
import {
  generateRandomStrings,
  generateUsername,
} from "../../services/slugStringGeneratorService";
import { httpResponse } from "../../utils/apiResponseUtils";
import { asyncHandler } from "../../utils/asyncHandlerUtils";

// Type for the freelancer registration data matching the JSON structure
interface FreelancerRegistrationData {
  whoYouAre: {
    fullName: string;
    email: string;
    timeZone: string;
    country: string;
    professionalLinks: {
      github?: string;
      gitlab?: string;
      dribbble?: string;
      behance?: string;
      medium?: string;
      stackoverflow?: string;
      kaggle?: string;
      personalSite?: string;
      linkedin?: string;
    };
  };
  coreRole: {
    primaryDomain: string;
  };
  eliteSkillCards: {
    selectedSkills: string[];
  };
  toolstackProficiency: {
    selectedTools: {
      category: string;
      tools: string[];
    }[];
  };
  domainExperience: {
    roles: {
      title: string;
      years: number;
    }[];
  };
  industryExperience: {
    selectedIndustries: string[];
  };
  availabilityWorkflow: {
    weeklyCommitment: number;
    workingHours: string[];
    collaborationTools: string[];
    teamStyle: string;
    screenSharing: string;
    availabilityExceptions: string;
  };
  softSkills: {
    collaborationStyle: string;
    communicationFrequency: string;
    conflictResolution: string;
    languages: string[];
    teamVsSolo: string;
  };
  certifications: {
    certificates: {
      name: string;
      url: string;
    }[];
  };
  projectQuoting: {
    compensationPreference: string;
    smallProjectPrice: number;
    midProjectPrice: number;
    longTermPrice: number;
    milestoneTerms: string;
    willSubmitProposals: string;
  };
  legalAgreements: {
    agreements: {
      id: string;
      accepted: boolean;
    }[];
    identityVerification?: {
      idType?: string;
      taxDocType?: string;
      addressVerified?: boolean;
    };
    workAuthorization?: {
      interested?: boolean;
    };
  };
}

const freelancerRegistrationController = {
  // Register freelancer with the new structure
  registerFreelancer: asyncHandler(async (req: Request, res: Response) => {
    const freelancerData = req.body as FreelancerRegistrationData;

    // Validate required fields
    if (!freelancerData.whoYouAre?.email) {
      throw {
        status: BADREQUESTCODE,
        message: "Email is required for freelancer registration.",
      };
    }

    // Check if freelancer already exists by email
    const existingProfile = await db.profile.findFirst({
      where: {
        whoYouAre: { email: freelancerData.whoYouAre.email },
      },
    });

    if (existingProfile) {
      throw {
        status: BADREQUESTCODE,
        message: "A freelancer profile with this email already exists.",
      };
    }

    // Check if user already exists in User table
    const existingUser = await db.user.findUnique({
      where: { email: freelancerData.whoYouAre.email },
    });

    if (existingUser) {
      throw {
        status: BADREQUESTCODE,
        message: "A user with this email already exists.",
      };
    }

    // Get userId from token if available
    const userId = (req as _Request).userFromToken?.uid ?? null;

    // Prepare legalAgreements create input
    const identityVerificationInput =
      freelancerData.legalAgreements.identityVerification;
    const shouldCreateIdentityVerification = !!(
      identityVerificationInput &&
      identityVerificationInput.idType &&
      identityVerificationInput.taxDocType
    );

    const legalAgreementsCreate: Prisma.LegalAgreementsCreateNestedOneWithoutProfileInput =
      {
        create: {
          agreements: (freelancerData.legalAgreements.agreements ||
            []) as Prisma.InputJsonValue,
          identityVerification: shouldCreateIdentityVerification
            ? {
                create: {
                  idType: identityVerificationInput.idType,
                  taxDocType: identityVerificationInput.taxDocType,
                  addressVerified:
                    identityVerificationInput.addressVerified ?? false,
                },
              }
            : undefined,
          workAuthorization: {
            create: {
              interested:
                freelancerData.legalAgreements.workAuthorization?.interested ??
                false,
            },
          },
        },
      };

    // Create the profile with all related data
    const profileData: Prisma.ProfileCreateInput = {
      userId,
      whoYouAre: {
        create: {
          fullName: freelancerData.whoYouAre.fullName,
          email: freelancerData.whoYouAre.email,
          timeZone: freelancerData.whoYouAre.timeZone,
          country: freelancerData.whoYouAre.country,
          professionalLinks: freelancerData.whoYouAre
            .professionalLinks as Prisma.InputJsonValue,
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
            .selectedSkills as Prisma.InputJsonValue,
        },
      },
      toolstackProficiency: {
        create: {
          selectedTools: freelancerData.toolstackProficiency
            .selectedTools as Prisma.InputJsonValue,
        },
      },
      domainExperience: {
        create: {
          roles: freelancerData.domainExperience.roles as Prisma.InputJsonValue,
        },
      },
      industryExperience: {
        create: {
          selectedIndustries: freelancerData.industryExperience
            .selectedIndustries as Prisma.InputJsonValue,
        },
      },
      availabilityWorkflow: {
        create: {
          weeklyCommitment:
            freelancerData.availabilityWorkflow.weeklyCommitment,
          workingHours: freelancerData.availabilityWorkflow
            .workingHours as Prisma.InputJsonValue,
          collaborationTools: freelancerData.availabilityWorkflow
            .collaborationTools as Prisma.InputJsonValue,
          teamStyle: freelancerData.availabilityWorkflow.teamStyle,
          screenSharing: freelancerData.availabilityWorkflow.screenSharing,
          availabilityExceptions:
            freelancerData.availabilityWorkflow.availabilityExceptions,
        },
      },
      softSkills: {
        create: {
          collaborationStyle: freelancerData.softSkills.collaborationStyle,
          communicationFrequency:
            freelancerData.softSkills.communicationFrequency,
          conflictResolution: freelancerData.softSkills.conflictResolution,
          languages: freelancerData.softSkills
            .languages as Prisma.InputJsonValue,
          teamVsSolo: freelancerData.softSkills.teamVsSolo,
        },
      },
      certifications: {
        create: {
          certificates: freelancerData.certifications
            .certificates as Prisma.InputJsonValue,
        },
      },
      projectQuoting: {
        create: {
          compensationPreference:
            freelancerData.projectQuoting.compensationPreference,
          smallProjectPrice: freelancerData.projectQuoting.smallProjectPrice,
          midProjectPrice: freelancerData.projectQuoting.midProjectPrice,
          longTermPrice: freelancerData.projectQuoting.longTermPrice,
          milestoneTerms: freelancerData.projectQuoting.milestoneTerms,
          willSubmitProposals:
            freelancerData.projectQuoting.willSubmitProposals,
        },
      },
      legalAgreements: legalAgreementsCreate,
    };

    // Create the profile
    const createdProfile = await db.profile.create({
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

    httpResponse(
      req,
      res,
      SUCCESSCODE,
      "Freelancer registration submitted successfully. We will review your application and get back to you soon.",
      {
        profileId: createdProfile.id,
        email: createdProfile.whoYouAre.email,
        fullName: createdProfile.whoYouAre.fullName,
      },
    );
  }),

  // Get all freelancer registrations (admin only)
  getAllFreelancerRegistrations: asyncHandler(
    async (req: _Request, res: Response) => {
      const profiles = await db.profile.findMany({
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
        return httpResponse(
          req,
          res,
          SUCCESSCODE,
          "No freelancer registrations found",
          [],
        );
      }

      return httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, profiles);
    },
  ),

  // Get single freelancer registration (admin only)
  getSingleFreelancerRegistration: asyncHandler(
    async (req: _Request, res: Response) => {
      const { id } = req.params;

      if (!id) {
        throw { status: BADREQUESTCODE, message: "Profile ID is required." };
      }

      const profile = await db.profile.findFirst({
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
        throw { status: NOTFOUNDCODE, message: NOTFOUNDMSG };
      }

      httpResponse(req, res, SUCCESSCODE, SUCCESSMSG, profile);
    },
  ),

  // Accept freelancer registration (admin only)
  acceptFreelancerRegistration: asyncHandler(
    async (req: _Request, res: Response) => {
      const { id } = req.params;

      if (!id) {
        throw { status: BADREQUESTCODE, message: "Profile ID is required." };
      }

      const profile = await db.profile.findUnique({
        where: { id },
        include: { whoYouAre: true },
      });

      if (!profile || !profile.whoYouAre) {
        throw { status: NOTFOUNDCODE, message: NOTFOUNDMSG };
      }

      // Mark profile as accepted
      await db.profile.update({
        where: { id },
        data: { isAccepted: true },
      });

      // Generate random password for the freelancer
      const randomPassword = generateRandomStrings(8);
      const hashedPassword = await passwordHasher(randomPassword, res);

      // Check if user already exists
      const existingUser = await db.user.findUnique({
        where: { email: profile.whoYouAre.email },
      });

      if (existingUser) {
        // Update existing user to freelancer role
        await db.user.update({
          where: { email: profile.whoYouAre.email },
          data: { role: "FREELANCER" },
        });

        // Delete the profile since user already exists
        await db.profile.delete({ where: { id } });

        return httpResponse(
          req,
          res,
          SUCCESSCODE,
          "User already exists. Role updated to freelancer.",
          { userId: existingUser.uid },
        );
      }

      // Create new freelancer user
      const createdFreelancer = await db.user.create({
        data: {
          username:
            `${generateUsername(profile.whoYouAre.fullName)}_${generateRandomStrings(4)}`.toLowerCase(),
          email: profile.whoYouAre.email,
          fullName: profile.whoYouAre.fullName,
          role: "FREELANCER",
          password: hashedPassword as string,
          emailVerifiedAt: new Date(),
        },
      });

      // Send welcome email
      await gloabalMailMessage(
        createdFreelancer.email,
        `${WELCOMEMESSAGEFORFREELANCER} <p>Please use the following credentials to access your Dashboard:</p>
      <br>
      Username: <p style="color:blue;font-weight:bold;">${createdFreelancer.username}</p>
      Password: <p style="color:blue;font-weight:bold;">${randomPassword}</p>
      <p>Best Regards,</p> ${COMPANY_NAME}`,
        "Welcome to Our Freelancer Platform",
        `Dear ${createdFreelancer.fullName}`,
      );

      // Delete the profile after creating the user
      await db.profile.delete({ where: { id } });

      return httpResponse(
        req,
        res,
        SUCCESSCODE,
        "Freelancer registration accepted successfully. Welcome email sent.",
        {
          userId: createdFreelancer.uid,
          username: createdFreelancer.username,
          email: createdFreelancer.email,
        },
      );
    },
  ),

  // Reject freelancer registration (admin only)
  rejectFreelancerRegistration: asyncHandler(
    async (req: _Request, res: Response) => {
      const { id } = req.params;

      if (!id) {
        throw { status: BADREQUESTCODE, message: "Profile ID is required." };
      }

      const profile = await db.profile.findUnique({
        where: { id },
        include: { whoYouAre: true },
      });

      if (!profile) {
        throw { status: NOTFOUNDCODE, message: NOTFOUNDMSG };
      }

      // Delete the profile (reject the application)
      await db.profile.delete({ where: { id } });

      httpResponse(
        req,
        res,
        SUCCESSCODE,
        "Freelancer registration rejected and removed from the system.",
        null,
      );
    },
  ),

  // Trash freelancer registration (admin only)
  trashFreelancerRegistration: asyncHandler(
    async (req: _Request, res: Response) => {
      const { id } = req.params;

      if (!id) {
        throw { status: BADREQUESTCODE, message: "Profile ID is required." };
      }

      const uid = req.userFromToken?.uid as string;
      const userWhoTrashed = await db.user.findUnique({ where: { uid } });

      if (!userWhoTrashed) {
        throw { status: BADREQUESTCODE, message: "User not found" };
      }

      await db.profile.update({
        where: { id },
        data: {
          trashedBy: `@${userWhoTrashed.username}-${userWhoTrashed.fullName}-${userWhoTrashed.role}`,
          trashedAt: new Date(),
        },
      });

      httpResponse(
        req,
        res,
        SUCCESSCODE,
        "Freelancer registration moved to trash successfully.",
      );
    },
  ),

  // Untrash freelancer registration (admin only)
  untrashFreelancerRegistration: asyncHandler(
    async (req: _Request, res: Response) => {
      const { id } = req.params;

      if (!id) {
        throw { status: BADREQUESTCODE, message: "Profile ID is required." };
      }

      await db.profile.update({
        where: { id },
        data: {
          trashedBy: null,
          trashedAt: null,
        },
      });

      httpResponse(
        req,
        res,
        SUCCESSCODE,
        "Freelancer registration restored from trash successfully.",
      );
    },
  ),
};

export default freelancerRegistrationController;
