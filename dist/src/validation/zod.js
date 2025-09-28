"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentFilterSchema = exports.paymentStatusUpdateSchema = exports.createRefundSchema = exports.sessionIdSchema = exports.paymentIntentIdSchema = exports.createCheckoutSessionSchema = exports.createPaymentIntentSchema = exports.freelancerRegistrationSchema = exports.visitorsSchema = exports.projectBuilderSchema = exports.MilestoneFilterSchema = exports.MilestoneProgressSchema = exports.MultipleMilestoneSchema = exports.MilestoneSchema = exports.blogPostSchema = exports.projectSchema = exports.freeLancerSchema = exports.hireUsSchema = exports.consultationBookingSchema = exports.getQuoteSchema = exports.updateForgotPasswordSchema = exports.verifyForgotPasswordRequestSchema = exports.forgotPasswordRequestFromUserSchema = exports.sendNewsLetterToAllUsersSchema = exports.sendNewsLetterToSingleUserSchema = exports.SubscribeORunsubscribeToNewsLetterSchema = exports.sendMessagaeToUserSchema = exports.contactUsSchema = exports.getSingleUserSChema = exports.userDeleteSchema = exports.userUpdatePasswordSchema = exports.userUpdateEmailSchema = exports.userUpdateSchema = exports.sendOTPSchema = exports.verifyUserSchema = exports.userLoginSchema = exports.userRegistrationSchema = void 0;
const zod_1 = require("zod");
exports.userRegistrationSchema = zod_1.z.object({
    username: zod_1.z
        .string({ message: "username is required!!" })
        .min(1, { message: "username is required!!" })
        .min(3, {
        message: "Username must be at least 3 characters long. e.g: user123",
    })
        .max(50, {
        message: "Username can be at most 50 characters long. e.g: user123",
    })
        .regex(/^[a-z0-9_.]{1,20}$/, {
        message: "Username can only contain lowercase letters, numbers, underscores, and periods. e.g: user123",
    }),
    fullName: zod_1.z
        .string({ message: "fullName is required!!" })
        .min(1, { message: "fullName is required!!" })
        .min(3, {
        message: "Full name must be at least 3 characters long. e.g: John Doe",
    })
        .max(50, {
        message: "Full name can be at most 50 characters long. e.g: John Doe",
    })
        .regex(/^[a-zA-Z ]{3,20}$/, {
        message: "Full name can only contain letters and spaces. e.g: John Doe",
    }),
    email: zod_1.z
        .string({ message: "email is required!!" })
        .min(1, { message: "email is required!!" })
        .min(3, { message: "email must be at least 3 characters long." })
        .max(150, { message: "email can be at most 150 characters long." })
        .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
        message: "Invalid email format. e.g: john.doe@example.com",
    }),
    password: zod_1.z
        .string({ message: "password is required!!" })
        .min(1, { message: "password is required!!" })
        .min(6, { message: "password must be at least 6 characters long." })
        .max(50, { message: "password can be at most 50 characters long." }),
});
exports.userLoginSchema = zod_1.z.object({
    username: zod_1.z
        .string({ message: "username is required!!" })
        .min(1, { message: "username is required!!" })
        .max(100, { message: "username can be at most 100 characters long." }),
    password: zod_1.z
        .string({ message: "password is required!!" })
        .min(1, { message: "password is required!!" })
        .max(100, { message: "password can be at most 100 characters long." }),
});
exports.verifyUserSchema = zod_1.z.object({
    email: zod_1.z
        .string({ message: "email is required!!" })
        .min(1, { message: "email is required!!" })
        .email({ message: "Invalid email format. e.g: john.doe@example.com" }),
    OTP: zod_1.z
        .string({ message: "OTP is required!!" })
        .min(1, { message: "OTP is required!!" })
        .min(6, { message: "OTP must be at least 6 characters long." })
        .max(6, { message: "OTP can be at most 6 characters long." }),
});
exports.sendOTPSchema = zod_1.z.object({
    email: zod_1.z
        .string({ message: "email is required!!" })
        .min(1, { message: "email is required!!" })
        .email({ message: "Invalid email format. e.g: john.doe@example.com" }),
});
exports.userUpdateSchema = zod_1.z.object({
    uid: zod_1.z
        .string({ message: "uid is required!!" })
        .min(1, { message: "uid is required!!" }),
    username: zod_1.z
        .string({ message: "username is required!!" })
        .min(1, { message: "username is required!!" })
        .min(3, {
        message: "Username must be at least 3 characters long. e.g: user123",
    })
        .max(50, {
        message: "Username can be at most 50 characters long. e.g: user123",
    })
        .regex(/^[a-z0-9_.]{1,20}$/, {
        message: "Username can only contain lowercase letters, numbers, underscores, and periods. e.g: user123",
    }),
    fullName: zod_1.z
        .string({ message: "fullName is required!!" })
        .min(1, { message: "fullName is required!!" })
        .min(3, {
        message: "Full name must be at least 3 characters long. e.g: John Doe",
    })
        .max(50, {
        message: "Full name can be at most 50 characters long. e.g: John Doe",
    })
        .regex(/^[a-zA-Z ]{3,20}$/, {
        message: "Full name can only contain letters and spaces. e.g: John Doe",
    }),
});
exports.userUpdateEmailSchema = zod_1.z.object({
    uid: zod_1.z
        .string({ message: "uid is required!!" })
        .min(1, { message: "uid is required!!" }),
    email: zod_1.z
        .string({ message: "email is required!!" })
        .min(1, { message: "email is required!!" })
        .min(3, { message: "email must be at least 3 characters long." })
        .max(150, { message: "email can be at most 150 characters long." })
        .email({ message: "Invalid email format. e.g: john.doe@example.com" })
        .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
        message: "Invalid email format. e.g: john.doe@example.com",
    }),
});
exports.userUpdatePasswordSchema = zod_1.z.object({
    uid: zod_1.z
        .string({ message: "uid is required!!" })
        .min(1, { message: "uid is required!!" }),
    oldPassword: zod_1.z
        .string({ message: "oldPassword  is required" })
        .min(1, { message: "oldPassword  is required" })
        .max(50, { message: "oldPassword  can be at most 50 characters long." }),
    newPassword: zod_1.z
        .string({ message: "newPassword is required!!" })
        .min(1, { message: "newPassword is required!!" })
        .min(6, { message: " newPassword must be at least 6 characters long." })
        .max(50, { message: " newPassword can be at most 50 characters long." }),
});
exports.userDeleteSchema = zod_1.z.object({
    username: zod_1.z
        .string({ message: "uid is required!!" })
        .min(1, { message: "uid is required!!" }),
});
exports.getSingleUserSChema = zod_1.z.object({
    username: zod_1.z
        .string({ message: "username is required!!" })
        .min(1, { message: "username is required!!" })
        .min(3, {
        message: "Username must be at least 3 characters long. e.g: user123",
    })
        .max(50, {
        message: "Username can be at most 50 characters long. e.g: user123",
    })
        .regex(/^[a-z0-9_.]{1,20}$/, {
        message: "Username can only contain lowercase letters, numbers, underscores, and periods. e.g: user123",
    }),
});
exports.contactUsSchema = zod_1.z.object({
    firstName: zod_1.z
        .string({ message: "firstName is required!!" })
        .min(1, { message: "firstName is required!!" })
        .min(2, { message: "firstName must be at least 2 characters long." })
        .max(50, { message: "firstName can be at most 50 characters long." }),
    lastName: zod_1.z
        .string({ message: "lastName is required!!" })
        .min(1, { message: "lastName is required!!" })
        .min(3, { message: "lastName must be at least 3 characters long." })
        .max(50, { message: "lastName can be at most 50 characters long." }),
    email: zod_1.z
        .string({ message: "email is required!!" })
        .min(1, { message: "email is required!!" })
        .min(3, { message: "email must be at least 3 characters long." })
        .max(150, { message: "email can be at most 150 characters long." })
        .email({ message: "Invalid email format. e.g: john.doe@example.com" }),
    message: zod_1.z
        .string({ message: "message is required!!" })
        .min(1, { message: "message is required!!" })
        .min(3, { message: "message must be at least 3 characters long." })
        .max(500, { message: "message can be at most 500 characters long." }),
});
exports.sendMessagaeToUserSchema = zod_1.z.object({
    id: zod_1.z
        .number({ message: "id is required!!" })
        .min(1, { message: "id is required!!" }),
    message: zod_1.z
        .string({ message: "message is required!!" })
        .min(1, { message: "message is required!!" }),
});
exports.SubscribeORunsubscribeToNewsLetterSchema = zod_1.z.object({
    email: zod_1.z
        .string({ message: "email is required!!" })
        .min(1, { message: "email is required!!" })
        .min(3, { message: "email must be at least 3 characters long." })
        .max(150, { message: "email can be at most 150 characters long." })
        .email({ message: "Invalid email format. e.g: john.doe@example.com" })
        .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
        message: "Invalid email format. e.g: john.doe@example.com",
    }),
});
exports.sendNewsLetterToSingleUserSchema = zod_1.z.object({
    email: zod_1.z
        .string({ message: "email is required!!" })
        .min(1, { message: "email is required!!" })
        .min(3, { message: "email must be at least 3 characters long." })
        .max(150, { message: "email can be at most 150 characters long." })
        .email({ message: "Invalid email format. e.g: john.doe@example.com" })
        .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
        message: "Invalid email format. e.g: john.doe@example.com",
    }),
    newsLetter: zod_1.z
        .string({ message: "newsLetter is required!!" })
        .min(1, { message: "newsLetter is required!!" }),
});
exports.sendNewsLetterToAllUsersSchema = zod_1.z.object({
    newsLetter: zod_1.z
        .string({ message: "newsLetter is required!!" })
        .min(1, { message: "newsLetter is required!!" }),
});
exports.forgotPasswordRequestFromUserSchema = zod_1.z.object({
    email: zod_1.z
        .string({ message: "email is required!!" })
        .min(1, { message: "email is required!!" })
        .min(3, { message: "email must be at least 3 characters long." })
        .max(150, { message: "email can be at most 150 characters long." })
        .email({ message: "Invalid email format. e.g: john.doe@example.com" })
        .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
        message: "Invalid email format. e.g: john.doe@example.com",
    }),
});
exports.verifyForgotPasswordRequestSchema = zod_1.z.object({
    OTP: zod_1.z
        .string({ message: "OTP is required!!" })
        .min(1, { message: "OTP is required!!" })
        .min(6, { message: "OTP must be at least 6 characters long." })
        .max(6, { message: "OTP can be at most 6 characters long." }),
});
exports.updateForgotPasswordSchema = zod_1.z.object({
    newPassword: zod_1.z
        .string({ message: "newPassword is required!!" })
        .min(1, { message: "newPassword is required!!" })
        .min(6, { message: "newPassword must be at least 6 characters long." })
        .max(50, { message: "newPassword can be at most 50 characters long." }),
});
exports.getQuoteSchema = zod_1.z.object({
    name: zod_1.z
        .string({ message: "name is required!!" })
        .min(1, { message: "name is required!!" })
        .min(3, { message: "name must be at least 3 characters long." })
        .max(150, { message: "name can be at most 150 characters long." }),
    email: zod_1.z
        .string({ message: "email is required!!" })
        .min(1, { message: "email is required!!" })
        .min(3, { message: "email must be at least 3 characters long." })
        .max(150, { message: "email can be at most 150 characters long." })
        .email({ message: "Invalid email format. e.g: john.doe@example.com" })
        .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
        message: "Invalid email format. e.g: john.doe@example.com",
    }),
    phone: zod_1.z
        .string({ message: "phone is required!!" })
        .min(1, { message: "phone is required!!" })
        .min(3, { message: "phone must be at least 3 characters long." })
        .max(150, { message: "phone can be at most 150 characters long." }),
    address: zod_1.z
        .string({ message: "address is required!!" })
        .min(1, { message: "address is required!!" })
        .min(3, { message: "address must be at least 3 characters long." })
        .max(450, { message: "address can be at most 150 characters long." }),
    detail: zod_1.z
        .string({ message: "detail is required!!" })
        .min(1, { message: "detail is required!!" })
        .min(3, { message: "detail must be at least 3 characters long." })
        .max(1000, { message: "detail can be at most 150 characters long." }),
    services: zod_1.z
        .string({ message: "services is required!!" })
        .min(1, { message: "services is required!!" }),
});
exports.consultationBookingSchema = zod_1.z.object({
    name: zod_1.z
        .string({ message: "name is required!!" })
        .min(1, { message: "name is required!!" })
        .min(3, { message: "name must be at least 3 characters long." })
        .max(150, { message: "name can be at most 150 characters long." }),
    email: zod_1.z
        .string({ message: "email is required!!" })
        .min(1, { message: "email is required!!" })
        .min(3, { message: "email must be at least 3 characters long." })
        .max(150, { message: "email can be at most 150 characters long." })
        .email({ message: "Invalid email format. e.g: john.doe@example.com" })
        .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
        message: "Invalid email format. e.g: john.doe@example.com",
    }),
    phone: zod_1.z
        .string({ message: "phone is required!!" })
        .min(1, { message: "phone is required!!" })
        .min(3, { message: "phone must be at least 3 characters long." })
        .max(150, { message: "phone can be at most 150 characters long." }),
    message: zod_1.z
        .string({ message: "message is required!!" })
        .min(1, { message: "message is required!!" })
        .min(3, { message: "message must be at least 3 characters long." })
        .max(1000, { message: "message can be at most 150 characters long." }),
    bookingDate: zod_1.z
        .string({ message: "bookingDate is required!!" })
        .min(1, { message: "bookingDate is required!!" }),
    address: zod_1.z
        .string({ message: "address is required!!" })
        .min(1, { message: "address is required!!" })
        .min(3, { message: "address must be at least 3 characters long." })
        .max(450, { message: "address can be at most 150 characters long." }),
    subject: zod_1.z
        .string({ message: "subject is required!!" })
        .min(1, { message: "subject is required!!" })
        .min(3, { message: "subject must be at least 3 characters long." })
        .max(450, { message: "subject can be at most 150 characters long." }),
});
exports.hireUsSchema = zod_1.z.object({
    name: zod_1.z
        .string({ message: "name is required!!" })
        .min(1, { message: "name is required!!" })
        .min(3, { message: "name must be at least 3 characters long." })
        .max(150, { message: "name can be at most 150 characters long." }),
    email: zod_1.z
        .string({ message: "email is required!!" })
        .min(1, { message: "email is required!!" })
        .min(3, { message: "email must be at least 3 characters long." })
        .max(150, { message: "email can be at most 150 characters long." })
        .email({ message: "Invalid email format. e.g: john.doe@example.com" })
        .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
        message: "Invalid email format. e.g: john.doe@example.com",
    }),
    phone: zod_1.z
        .string({ message: "phone is required!!" })
        .min(1, { message: "phone is required!!" })
        .min(3, { message: "phone must be at least 3 characters long." })
        .max(150, { message: "phone can be at most 150 characters long." }),
    detail: zod_1.z
        .string({ message: "detail is required!!" })
        .min(1, { message: "detail is required!!" })
        .min(3, { message: "detail must be at least 3 characters long." })
        .max(1000, { message: "detail can be at most 1000 characters long." }),
    address: zod_1.z
        .string({ message: "address is required!!" })
        .min(1, { message: "address is required!!" })
        .min(3, { message: "address must be at least 3 characters long." })
        .max(450, { message: "address can be at most 150 characters long." }),
});
exports.freeLancerSchema = zod_1.z.object({
    name: zod_1.z
        .string({ message: "name is required!!" })
        .min(1, { message: "name is required!!" })
        .min(3, { message: "name must be at least 3 characters long." })
        .max(150, { message: "name can be at most 150 characters long." }),
    email: zod_1.z
        .string({ message: "email is required!!" })
        .min(1, { message: "email is required!!" })
        .min(3, { message: "email must be at least 3 characters long." })
        .max(150, { message: "email can be at most 150 characters long." })
        .email({ message: "Invalid email format. e.g: john.doe@example.com" })
        .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
        message: "Invalid email format. e.g: john.doe@example.com",
    }),
    phone: zod_1.z
        .string({ message: "phone is required!!" })
        .min(1, { message: "phone is required!!" })
        .min(3, { message: "phone must be at least 3 characters long." })
        .max(150, { message: "phone can be at most 150 characters long." }),
    detail: zod_1.z
        .string({ message: "detail is required!!" })
        .min(1, { message: "detail is required!!" })
        .min(3, { message: "detail must be at least 3 characters long." })
        .max(1000, { message: "detail can be at most 1000 characters long." }),
    niche: zod_1.z
        .string({ message: "niche is required!!" })
        .min(1, { message: "niche is required!!" })
        .min(3, { message: "niche must be at least 3 characters long." })
        .max(450, { message: "niche can be at most 450 characters long." }),
    address: zod_1.z
        .string({ message: "address is required!!" })
        .min(1, { message: "address is required!!" })
        .min(3, { message: "address must be at least 3 characters long." })
        .max(450, { message: "address can be at most 450 characters long." }),
    yourPortfolio: zod_1.z
        .string({ message: "yourPortfolio is required!!" })
        .min(1, { message: "yourPortfolio is required!!" })
        .min(3, { message: "yourPortfolio must be at least 3 characters long." })
        .max(450, { message: "yourPortfolio can be at most 450 characters long." }),
    yourTopProject1: zod_1.z
        .string({ message: "yourTopProject1 is required!!" })
        .min(1, { message: "yourTopProject1 is required!!" })
        .min(3, { message: "yourTopProject1 must be at least 3 characters long." })
        .max(450, {
        message: "yourTopProject1 can be at most 450 characters long.",
    }),
    yourTopProject2: zod_1.z
        .string({ message: "yourTopProject2 is required!!" })
        .min(1, { message: "yourTopProject2 is required!!" })
        .min(3, { message: "yourTopProject2 must be at least 3 characters long." })
        .max(450, {
        message: "yourTopProject2 can be at most 450 characters long.",
    }),
    yourTopProject3: zod_1.z
        .string({ message: "yourTopProject3 is required!!" })
        .min(1, { message: "yourTopProject3 is required!!" })
        .min(3, { message: "yourTopProject3 must be at least 3 characters long." })
        .max(450, {
        message: "yourTopProject3 can be at most 450 characters long.",
    }),
});
exports.projectSchema = zod_1.z.object({
    title: zod_1.z
        .string({ message: "title is required!!" })
        .min(1, { message: "title is required!!" })
        .min(3, { message: "title must be at least 3 characters long." })
        .max(150, { message: "title can be at most 150 characters long." }),
    detail: zod_1.z
        .string({ message: "detail is required!!" })
        .min(1, { message: "detail is required!!" })
        .min(3, { message: "detail must be at least 3 characters long." }),
    niche: zod_1.z
        .string({ message: "niche is required!!" })
        .min(1, { message: "niche is required!!" })
        .min(3, { message: "niche must be at least 3 characters long." })
        .max(450, { message: "niche can be at most 450 characters long." }),
    bounty: zod_1.z
        .number({ message: "bounty is required!!" })
        .min(1, { message: "bounty is required!!" }),
    deadline: zod_1.z
        .string({ message: "deadline is required!!" })
        .min(1, { message: "deadline is required!!" })
        .min(3, { message: "deadline must be at least 3 characters long." })
        .max(450, { message: "deadline can be at most 450 characters long." }),
});
exports.blogPostSchema = zod_1.z.object({
    blogTitle: zod_1.z
        .string({ message: "blogTitle is required!!" })
        .min(1, { message: "blogTitle is required!!" })
        .min(3, { message: "blogTitle must be at least 3 characters long." })
        .max(450, { message: "blogTitle can be at most 450 characters long." }),
    blogThumbnail: zod_1.z
        .string({ message: "blogThumbnail is required!!" })
        .min(1, { message: "blogThumbnail is required!!" })
        .min(3, { message: "blogThumbnail must be at least 3 characters long." })
        .max(450, { message: "blogThumbnail can be at most 450 characters long." }),
    blogOverview: zod_1.z
        .string({ message: "blogOverview is required!!" })
        .min(1, { message: "blogOverview is required!!" })
        .min(3, { message: "blogOverview must be at least 3 characters long." })
        .max(650, { message: "blogOverview can be at most 450 characters long." }),
    blogBody: zod_1.z
        .string({ message: "blogBody is required!!" })
        .min(1, { message: "blogBody is required!!" })
        .min(3, { message: "blogBody must be at least 3 characters long." }),
});
exports.MilestoneSchema = zod_1.z.object({
    mileStoneName: zod_1.z
        .string({ message: "mileStoneName is required!!" })
        .min(1, { message: "mileStoneName is required!!" })
        .min(3, { message: "mileStoneName must be at least 3 characters long." })
        .max(100, { message: "mileStoneName can be at most 100 characters long." }),
    description: zod_1.z.string({ message: "description must be a string" }).optional(),
    deadline: zod_1.z
        .string({ message: "deadline is required!!" })
        .min(1, { message: "deadline is required!!" })
        .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format for deadline",
    }),
    priorityRank: zod_1.z
        .number({ message: "priorityRank is required!!" })
        .min(1, { message: "priorityRank must be at least 1" })
        .int({ message: "priorityRank must be an integer" }),
    totalProgressPoints: zod_1.z
        .number({ message: "totalProgressPoints must be a number" })
        .optional(),
    progress: zod_1.z.number({ message: "progress must be a number" }).default(0),
    isMilestoneCompleted: zod_1.z
        .boolean({ message: "isMilestoneCompleted must be a boolean" })
        .default(false),
});
exports.MultipleMilestoneSchema = zod_1.z.object({
    milestones: zod_1.z
        .array(exports.MilestoneSchema, { message: "Invalid milestone data format" })
        .min(1, { message: "At least one milestone must be provided" }),
});
exports.MilestoneProgressSchema = zod_1.z.object({
    progress: zod_1.z
        .number({ message: "progress is required!!" })
        .min(0, { message: "progress cannot be negative" }),
});
exports.MilestoneFilterSchema = zod_1.z.object({
    projectId: zod_1.z.string({ message: "projectId must be a string" }).optional(),
    isCompleted: zod_1.z
        .enum(["true", "false"], {
        message: "isCompleted must be 'true' or 'false'",
    })
        .optional(),
    priorityRank: zod_1.z
        .string({ message: "priorityRank must be a string" })
        .optional(),
    sortBy: zod_1.z
        .enum(["deadline", "priorityRank", "progress", "createdAt"], {
        message: "sortBy must be one of: deadline, priorityRank, progress, createdAt",
    })
        .optional()
        .default("priorityRank"),
    sortOrder: zod_1.z
        .enum(["asc", "desc"], { message: "sortOrder must be 'asc' or 'desc'" })
        .optional()
        .default("asc"),
    page: zod_1.z
        .string({ message: "page must be a string" })
        .optional()
        .refine((val) => !val || !isNaN(Number(val)), {
        message: "page must be a valid number",
    }),
    limit: zod_1.z
        .string({ message: "limit must be a string" })
        .optional()
        .refine((val) => !val || !isNaN(Number(val)), {
        message: "limit must be a valid number",
    }),
});
exports.projectBuilderSchema = zod_1.z.object({
    projectName: zod_1.z
        .string({ message: "projectName is required!!" })
        .min(1, { message: "projectName is required!!" })
        .min(3, { message: "projectName must be at least 3 characters long." })
        .max(150, { message: "projectName can be at most 150 characters long." }),
    projectDescription: zod_1.z
        .string({ message: "projectDescription is required!!" })
        .min(1, { message: "projectDescription is required!!" })
        .min(10, {
        message: "projectDescription must be at least 10 characters long.",
    })
        .max(2000, {
        message: "projectDescription can be at most 2000 characters long.",
    }),
    projectType: zod_1.z
        .string({ message: "projectType is required!!" })
        .min(1, { message: "projectType is required!!" })
        .min(3, { message: "projectType must be at least 3 characters long." })
        .max(100, { message: "projectType can be at most 100 characters long." }),
    technologies: zod_1.z
        .array(zod_1.z.string(), { message: "technologies must be an array of strings" })
        .min(1, { message: "At least one technology must be specified" })
        .max(20, { message: "Maximum 20 technologies allowed" }),
    features: zod_1.z
        .array(zod_1.z.string(), { message: "features must be an array of strings" })
        .min(1, { message: "At least one feature must be specified" })
        .max(30, { message: "Maximum 30 features allowed" }),
    budget: zod_1.z
        .number({ message: "budget must be a number" })
        .min(0, { message: "budget cannot be negative" })
        .optional(),
    timeline: zod_1.z
        .string({ message: "timeline must be a string" })
        .min(1, { message: "timeline is required if provided" })
        .max(100, { message: "timeline can be at most 100 characters long." })
        .optional(),
    priority: zod_1.z
        .enum(["LOW", "MEDIUM", "HIGH", "URGENT"], {
        message: "priority must be one of: LOW, MEDIUM, HIGH, URGENT",
    })
        .optional()
        .default("MEDIUM"),
    status: zod_1.z
        .enum([
        "DRAFT",
        "SUBMITTED",
        "IN_REVIEW",
        "APPROVED",
        "REJECTED",
        "IN_PROGRESS",
        "COMPLETED",
    ], {
        message: "status must be one of: DRAFT, SUBMITTED, IN_REVIEW, APPROVED, REJECTED, IN_PROGRESS, COMPLETED",
    })
        .optional()
        .default("DRAFT"),
    clientName: zod_1.z
        .string({ message: "clientName is required!!" })
        .min(1, { message: "clientName is required!!" })
        .min(3, { message: "clientName must be at least 3 characters long." })
        .max(100, { message: "clientName can be at most 100 characters long." }),
    clientEmail: zod_1.z
        .string({ message: "clientEmail is required!!" })
        .min(1, { message: "clientEmail is required!!" })
        .min(3, { message: "clientEmail must be at least 3 characters long." })
        .max(150, { message: "clientEmail can be at most 150 characters long." })
        .email({ message: "Invalid email format. e.g: john.doe@example.com" })
        .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
        message: "Invalid email format. e.g: john.doe@example.com",
    }),
    clientPhone: zod_1.z
        .string({ message: "clientPhone must be a string" })
        .min(1, { message: "clientPhone is required if provided" })
        .min(10, { message: "clientPhone must be at least 10 characters long." })
        .max(20, { message: "clientPhone can be at most 20 characters long." })
        .optional(),
    clientCompany: zod_1.z
        .string({ message: "clientCompany must be a string" })
        .min(1, { message: "clientCompany is required if provided" })
        .min(2, { message: "clientCompany must be at least 2 characters long." })
        .max(100, { message: "clientCompany can be at most 100 characters long." })
        .optional(),
    additionalNotes: zod_1.z
        .string({ message: "additionalNotes must be a string" })
        .min(1, { message: "additionalNotes is required if provided" })
        .max(1000, {
        message: "additionalNotes can be at most 1000 characters long.",
    })
        .optional(),
});
exports.visitorsSchema = zod_1.z.object({
    fullName: zod_1.z
        .string({ message: "fullName is required!!" })
        .min(1, { message: "fullName is required!!" })
        .min(2, { message: "fullName must be at least 2 characters long." })
        .max(100, { message: "fullName can be at most 100 characters long." }),
    businessEmail: zod_1.z
        .string({ message: "businessEmail is required!!" })
        .min(1, { message: "businessEmail is required!!" })
        .min(3, { message: "businessEmail must be at least 3 characters long." })
        .max(150, { message: "businessEmail can be at most 150 characters long." })
        .email({ message: "Invalid email format. e.g: john.doe@example.com" })
        .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
        message: "Invalid email format. e.g: john.doe@example.com",
    }),
    phoneNumber: zod_1.z
        .string({ message: "phoneNumber must be a string" })
        .min(1, { message: "phoneNumber is required if provided" })
        .min(10, { message: "phoneNumber must be at least 10 characters long." })
        .max(20, { message: "phoneNumber can be at most 20 characters long." })
        .optional(),
    companyName: zod_1.z
        .string({ message: "companyName must be a string" })
        .min(1, { message: "companyName is required if provided" })
        .min(2, { message: "companyName must be at least 2 characters long." })
        .max(100, { message: "companyName can be at most 100 characters long." })
        .optional(),
    companyWebsite: zod_1.z
        .string({ message: "companyWebsite must be a string" })
        .min(1, { message: "companyWebsite is required if provided" })
        .min(3, { message: "companyWebsite must be at least 3 characters long." })
        .max(200, { message: "companyWebsite can be at most 200 characters long." })
        .url({ message: "companyWebsite must be a valid URL" })
        .optional(),
    businessAddress: zod_1.z
        .string({ message: "businessAddress is required!!" })
        .min(1, { message: "businessAddress is required!!" })
        .min(5, { message: "businessAddress must be at least 5 characters long." })
        .max(500, {
        message: "businessAddress can be at most 500 characters long.",
    }),
    businessType: zod_1.z
        .string({ message: "businessType is required!!" })
        .min(1, { message: "businessType is required!!" })
        .min(2, { message: "businessType must be at least 2 characters long." })
        .max(100, { message: "businessType can be at most 100 characters long." }),
    referralSource: zod_1.z
        .string({ message: "referralSource is required!!" })
        .min(1, { message: "referralSource is required!!" })
        .min(2, { message: "referralSource must be at least 2 characters long." })
        .max(100, {
        message: "referralSource can be at most 100 characters long.",
    }),
});
exports.freelancerRegistrationSchema = zod_1.z.object({
    whoYouAre: zod_1.z.object({
        fullName: zod_1.z
            .string({ message: "fullName is required!!" })
            .min(1, { message: "fullName is required!!" })
            .min(2, { message: "fullName must be at least 2 characters long." })
            .max(100, { message: "fullName can be at most 100 characters long." }),
        email: zod_1.z
            .string({ message: "email is required!!" })
            .min(1, { message: "email is required!!" })
            .email({ message: "Invalid email format. e.g: john.doe@example.com" })
            .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
            message: "Invalid email format. e.g: john.doe@example.com",
        }),
        timeZone: zod_1.z
            .string({ message: "timeZone is required!!" })
            .min(1, { message: "timeZone is required!!" }),
        country: zod_1.z
            .string({ message: "country is required!!" })
            .min(1, { message: "country is required!!" })
            .max(10, { message: "country code can be at most 10 characters long." }),
        professionalLinks: zod_1.z.object({
            github: zod_1.z
                .string()
                .url({ message: "GitHub URL must be valid" })
                .optional(),
            gitlab: zod_1.z
                .string()
                .url({ message: "GitLab URL must be valid" })
                .optional(),
            dribbble: zod_1.z
                .string()
                .url({ message: "Dribbble URL must be valid" })
                .optional(),
            behance: zod_1.z
                .string()
                .url({ message: "Behance URL must be valid" })
                .optional(),
            medium: zod_1.z
                .string()
                .url({ message: "Medium URL must be valid" })
                .optional(),
            stackoverflow: zod_1.z
                .string()
                .url({ message: "StackOverflow URL must be valid" })
                .optional(),
            kaggle: zod_1.z
                .string()
                .url({ message: "Kaggle URL must be valid" })
                .optional(),
            personalSite: zod_1.z
                .string()
                .url({ message: "Personal site URL must be valid" })
                .optional(),
            linkedin: zod_1.z
                .string()
                .url({ message: "LinkedIn URL must be valid" })
                .optional(),
        }),
    }),
    coreRole: zod_1.z.object({
        primaryDomain: zod_1.z
            .string({ message: "primaryDomain is required!!" })
            .min(1, { message: "primaryDomain is required!!" })
            .max(100, {
            message: "primaryDomain can be at most 100 characters long.",
        }),
    }),
    eliteSkillCards: zod_1.z.object({
        selectedSkills: zod_1.z
            .array(zod_1.z.string(), {
            message: "selectedSkills must be an array of strings",
        })
            .min(1, { message: "At least one skill must be selected" })
            .max(20, { message: "Maximum 20 skills allowed" }),
    }),
    toolstackProficiency: zod_1.z.object({
        selectedTools: zod_1.z
            .array(zod_1.z.object({
            category: zod_1.z.string({ message: "category is required!!" }),
            tools: zod_1.z
                .array(zod_1.z.string(), { message: "tools must be an array of strings" })
                .min(1, { message: "At least one tool must be specified" }),
        }), { message: "selectedTools must be an array of tool objects" })
            .min(1, { message: "At least one tool category must be selected" }),
    }),
    domainExperience: zod_1.z.object({
        roles: zod_1.z
            .array(zod_1.z.object({
            title: zod_1.z.string({ message: "title is required!!" }),
            years: zod_1.z
                .number({ message: "years must be a number" })
                .min(0, { message: "years cannot be negative" })
                .max(50, { message: "years cannot exceed 50" }),
        }), { message: "roles must be an array of role objects" })
            .min(1, { message: "At least one role must be specified" }),
    }),
    industryExperience: zod_1.z.object({
        selectedIndustries: zod_1.z
            .array(zod_1.z.string(), {
            message: "selectedIndustries must be an array of strings",
        })
            .min(1, { message: "At least one industry must be selected" })
            .max(20, { message: "Maximum 20 industries allowed" }),
    }),
    availabilityWorkflow: zod_1.z.object({
        weeklyCommitment: zod_1.z
            .number({ message: "weeklyCommitment must be a number" })
            .min(0, { message: "weeklyCommitment cannot be negative" })
            .max(168, { message: "weeklyCommitment cannot exceed 168 hours" }),
        workingHours: zod_1.z
            .array(zod_1.z.string(), {
            message: "workingHours must be an array of strings",
        })
            .min(1, { message: "At least one working hour must be specified" }),
        collaborationTools: zod_1.z
            .array(zod_1.z.string(), {
            message: "collaborationTools must be an array of strings",
        })
            .min(1, { message: "At least one collaboration tool must be specified" }),
        teamStyle: zod_1.z
            .string({ message: "teamStyle is required!!" })
            .min(1, { message: "teamStyle is required!!" }),
        screenSharing: zod_1.z
            .string({ message: "screenSharing is required!!" })
            .min(1, { message: "screenSharing is required!!" }),
        availabilityExceptions: zod_1.z
            .string({ message: "availabilityExceptions is required!!" })
            .min(1, { message: "availabilityExceptions is required!!" }),
    }),
    softSkills: zod_1.z.object({
        collaborationStyle: zod_1.z
            .string({ message: "collaborationStyle is required!!" })
            .min(1, { message: "collaborationStyle is required!!" }),
        communicationFrequency: zod_1.z
            .string({ message: "communicationFrequency is required!!" })
            .min(1, { message: "communicationFrequency is required!!" }),
        conflictResolution: zod_1.z
            .string({ message: "conflictResolution is required!!" })
            .min(1, { message: "conflictResolution is required!!" }),
        languages: zod_1.z
            .array(zod_1.z.string(), { message: "languages must be an array of strings" })
            .min(1, { message: "At least one language must be specified" }),
        teamVsSolo: zod_1.z
            .string({ message: "teamVsSolo is required!!" })
            .min(1, { message: "teamVsSolo is required!!" }),
    }),
    certifications: zod_1.z.object({
        certificates: zod_1.z
            .array(zod_1.z.object({
            name: zod_1.z.string({ message: "certificate name is required!!" }),
            url: zod_1.z.string().url({ message: "certificate URL must be valid" }),
        }), { message: "certificates must be an array of certificate objects" })
            .optional(),
    }),
    projectQuoting: zod_1.z.object({
        compensationPreference: zod_1.z
            .string({ message: "compensationPreference is required!!" })
            .min(1, { message: "compensationPreference is required!!" }),
        smallProjectPrice: zod_1.z
            .number({ message: "smallProjectPrice must be a number" })
            .min(0, { message: "smallProjectPrice cannot be negative" }),
        midProjectPrice: zod_1.z
            .number({ message: "midProjectPrice must be a number" })
            .min(0, { message: "midProjectPrice cannot be negative" }),
        longTermPrice: zod_1.z
            .number({ message: "longTermPrice must be a number" })
            .min(0, { message: "longTermPrice cannot be negative" }),
        milestoneTerms: zod_1.z
            .string({ message: "milestoneTerms is required!!" })
            .min(1, { message: "milestoneTerms is required!!" }),
        willSubmitProposals: zod_1.z
            .string({ message: "willSubmitProposals is required!!" })
            .min(1, { message: "willSubmitProposals is required!!" }),
    }),
    legalAgreements: zod_1.z.object({
        agreements: zod_1.z
            .array(zod_1.z.object({
            id: zod_1.z.string({ message: "agreement id is required!!" }),
            accepted: zod_1.z.boolean({ message: "accepted must be a boolean" }),
        }), { message: "agreements must be an array of agreement objects" })
            .min(1, { message: "At least one agreement must be specified" }),
        identityVerification: zod_1.z.object({
            idType: zod_1.z
                .string({ message: "idType is required!!" })
                .min(1, { message: "idType is required!!" }),
            taxDocType: zod_1.z
                .string({ message: "taxDocType is required!!" })
                .min(1, { message: "taxDocType is required!!" }),
            addressVerified: zod_1.z.boolean({
                message: "addressVerified must be a boolean",
            }),
        }),
        workAuthorization: zod_1.z.object({
            interested: zod_1.z.boolean({ message: "interested must be a boolean" }),
        }),
    }),
});
exports.createPaymentIntentSchema = zod_1.z.object({
    amount: zod_1.z
        .number({ message: "amount is required!!" })
        .min(1, { message: "amount must be at least 1 cent" })
        .max(99999999, { message: "amount cannot exceed 99999999 cents" }),
    currency: zod_1.z
        .string({ message: "currency is required!!" })
        .min(3, { message: "currency must be at least 3 characters long" })
        .max(3, { message: "currency can be at most 3 characters long" })
        .default("usd"),
    customerEmail: zod_1.z
        .string({ message: "customerEmail is required!!" })
        .min(1, { message: "customerEmail is required!!" })
        .email({ message: "Invalid email format. e.g: john.doe@example.com" })
        .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
        message: "Invalid email format. e.g: john.doe@example.com",
    }),
    customerName: zod_1.z
        .string({ message: "customerName must be a string" })
        .min(1, { message: "customerName is required if provided" })
        .min(2, { message: "customerName must be at least 2 characters long" })
        .max(100, { message: "customerName can be at most 100 characters long" })
        .optional(),
    customerPhone: zod_1.z
        .string({ message: "customerPhone must be a string" })
        .min(1, { message: "customerPhone is required if provided" })
        .min(10, { message: "customerPhone must be at least 10 characters long" })
        .max(20, { message: "customerPhone can be at most 20 characters long" })
        .optional(),
    description: zod_1.z
        .string({ message: "description must be a string" })
        .min(1, { message: "description is required if provided" })
        .max(500, { message: "description can be at most 500 characters long" })
        .optional(),
});
exports.createCheckoutSessionSchema = zod_1.z.object({
    amount: zod_1.z
        .number({ message: "amount is required!!" })
        .min(1, { message: "amount must be at least 1 cent" })
        .max(99999999, { message: "amount cannot exceed 99999999 cents" }),
    currency: zod_1.z
        .string({ message: "currency is required!!" })
        .min(3, { message: "currency must be at least 3 characters long" })
        .max(3, { message: "currency can be at most 3 characters long" })
        .default("usd"),
    customerEmail: zod_1.z
        .string({ message: "customerEmail is required!!" })
        .min(1, { message: "customerEmail is required!!" })
        .email({ message: "Invalid email format. e.g: john.doe@example.com" })
        .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
        message: "Invalid email format. e.g: john.doe@example.com",
    }),
    customerName: zod_1.z
        .string({ message: "customerName must be a string" })
        .min(1, { message: "customerName is required if provided" })
        .min(2, { message: "customerName must be at least 2 characters long" })
        .max(100, { message: "customerName can be at most 100 characters long" })
        .optional(),
    successUrl: zod_1.z
        .string({ message: "successUrl is required!!" })
        .min(1, { message: "successUrl is required!!" })
        .url({ message: "successUrl must be a valid URL" }),
    cancelUrl: zod_1.z
        .string({ message: "cancelUrl is required!!" })
        .min(1, { message: "cancelUrl is required!!" })
        .url({ message: "cancelUrl must be a valid URL" }),
    description: zod_1.z
        .string({ message: "description must be a string" })
        .min(1, { message: "description is required if provided" })
        .max(500, { message: "description can be at most 500 characters long" })
        .optional(),
});
exports.paymentIntentIdSchema = zod_1.z.object({
    paymentIntentId: zod_1.z
        .string({ message: "paymentIntentId is required!!" })
        .min(1, { message: "paymentIntentId is required!!" })
        .min(3, { message: "paymentIntentId must be at least 3 characters long" })
        .max(100, {
        message: "paymentIntentId can be at most 100 characters long",
    }),
});
exports.sessionIdSchema = zod_1.z.object({
    sessionId: zod_1.z
        .string({ message: "sessionId is required!!" })
        .min(1, { message: "sessionId is required!!" })
        .min(3, { message: "sessionId must be at least 3 characters long" })
        .max(100, { message: "sessionId can be at most 100 characters long" }),
});
exports.createRefundSchema = zod_1.z.object({
    paymentIntentId: zod_1.z
        .string({ message: "paymentIntentId is required!!" })
        .min(1, { message: "paymentIntentId is required!!" })
        .min(3, { message: "paymentIntentId must be at least 3 characters long" })
        .max(100, {
        message: "paymentIntentId can be at most 100 characters long",
    }),
    amount: zod_1.z
        .number({ message: "amount must be a number" })
        .min(1, { message: "amount must be at least 1 cent" })
        .max(99999999, { message: "amount cannot exceed 99999999 cents" })
        .optional(),
});
exports.paymentStatusUpdateSchema = zod_1.z.object({
    paymentId: zod_1.z
        .string({ message: "paymentId is required!!" })
        .min(1, { message: "paymentId is required!!" })
        .min(3, { message: "paymentId must be at least 3 characters long" })
        .max(100, { message: "paymentId can be at most 100 characters long" }),
    status: zod_1.z.enum(["PENDING", "SUCCEEDED", "FAILED", "CANCELED", "REFUNDED"], {
        message: "status must be one of: PENDING, SUCCEEDED, FAILED, CANCELED, REFUNDED",
    }),
});
exports.paymentFilterSchema = zod_1.z.object({
    status: zod_1.z
        .enum(["PENDING", "SUCCEEDED", "FAILED", "CANCELED", "REFUNDED"], {
        message: "status must be one of: PENDING, SUCCEEDED, FAILED, CANCELED, REFUNDED",
    })
        .optional(),
    customerEmail: zod_1.z
        .string({ message: "customerEmail must be a string" })
        .min(1, { message: "customerEmail is required if provided" })
        .email({ message: "Invalid email format. e.g: john.doe@example.com" })
        .optional(),
    startDate: zod_1.z
        .string({ message: "startDate must be a string" })
        .min(1, { message: "startDate is required if provided" })
        .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format for startDate",
    })
        .optional(),
    endDate: zod_1.z
        .string({ message: "endDate must be a string" })
        .min(1, { message: "endDate is required if provided" })
        .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format for endDate",
    })
        .optional(),
    page: zod_1.z
        .string({ message: "page must be a string" })
        .optional()
        .refine((val) => !val || !isNaN(Number(val)), {
        message: "page must be a valid number",
    }),
    limit: zod_1.z
        .string({ message: "limit must be a string" })
        .optional()
        .refine((val) => !val || !isNaN(Number(val)), {
        message: "limit must be a valid number",
    }),
});
