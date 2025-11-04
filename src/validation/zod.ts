import { z } from "zod";
/*                                                       Authentication Schema                                                               */
// ** user registration schema
export const userRegistrationSchema = z.object({
  username: z
    .string({ message: "username is required!!" })
    .min(1, { message: "username is required!!" })
    .min(3, {
      message: "Username must be at least 3 characters long. e.g: user123",
    })
    .max(50, {
      message: "Username can be at most 50 characters long. e.g: user123",
    })
    .regex(/^[a-z0-9_.]{1,20}$/, {
      message:
        "Username can only contain lowercase letters, numbers, underscores, and periods. e.g: user123",
    }),
  fullName: z
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
  email: z
    .string({ message: "email is required!!" })
    .min(1, { message: "email is required!!" })
    .min(3, { message: "email must be at least 3 characters long." })
    .max(150, { message: "email can be at most 150 characters long." })
    .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
      message: "Invalid email format. e.g: john.doe@example.com",
    }),
  password: z
    .string({ message: "password is required!!" })
    .min(1, { message: "password is required!!" })
    .min(6, { message: "password must be at least 6 characters long." })
    .max(50, { message: "password can be at most 50 characters long." }),
});

// ** user login schema
export const userLoginSchema = z.object({
  username: z
    .string({ message: "username is required!!" })
    .min(1, { message: "username is required!!" })
    .max(100, { message: "username can be at most 100 characters long." }),
  password: z
    .string({ message: "password is required!!" })
    .min(1, { message: "password is required!!" })
    .max(100, { message: "password can be at most 100 characters long." }),
});

// ** verify user schema
export const verifyUserSchema = z.object({
  email: z
    .string({ message: "email is required!!" })
    .min(1, { message: "email is required!!" })
    .email({ message: "Invalid email format. e.g: john.doe@example.com" }),
  OTP: z
    .string({ message: "OTP is required!!" })
    .min(1, { message: "OTP is required!!" })
    .min(6, { message: "OTP must be at least 6 characters long." })
    .max(6, { message: "OTP can be at most 6 characters long." }),
});

export const sendOTPSchema = z.object({
  email: z
    .string({ message: "email is required!!" })
    .min(1, { message: "email is required!!" })
    .email({ message: "Invalid email format. e.g: john.doe@example.com" }),
});

export const userUpdateSchema = z.object({
  uid: z
    .string({ message: "uid is required!!" })
    .min(1, { message: "uid is required!!" }),
  username: z
    .string({ message: "username is required!!" })
    .min(1, { message: "username is required!!" })
    .min(3, {
      message: "Username must be at least 3 characters long. e.g: user123",
    })
    .max(50, {
      message: "Username can be at most 50 characters long. e.g: user123",
    })
    .regex(/^[a-z0-9_.]{1,20}$/, {
      message:
        "Username can only contain lowercase letters, numbers, underscores, and periods. e.g: user123",
    }),
  fullName: z
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
export const userUpdateEmailSchema = z.object({
  uid: z
    .string({ message: "uid is required!!" })
    .min(1, { message: "uid is required!!" }),
  email: z
    .string({ message: "email is required!!" })
    .min(1, { message: "email is required!!" })
    .min(3, { message: "email must be at least 3 characters long." })
    .max(150, { message: "email can be at most 150 characters long." })
    .email({ message: "Invalid email format. e.g: john.doe@example.com" })
    .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
      message: "Invalid email format. e.g: john.doe@example.com",
    }),
});

export const userUpdatePasswordSchema = z.object({
  uid: z
    .string({ message: "uid is required!!" })
    .min(1, { message: "uid is required!!" }),
  oldPassword: z
    .string({ message: "oldPassword  is required" })
    .min(1, { message: "oldPassword  is required" })
    .max(50, { message: "oldPassword  can be at most 50 characters long." }),
  newPassword: z
    .string({ message: "newPassword is required!!" })
    .min(1, { message: "newPassword is required!!" })
    .min(6, { message: " newPassword must be at least 6 characters long." })
    .max(50, { message: " newPassword can be at most 50 characters long." }),
});
export const userDeleteSchema = z.object({
  username: z
    .string({ message: "uid is required!!" })
    .min(1, { message: "uid is required!!" }),
});

export const getSingleUserSChema = z.object({
  username: z
    .string({ message: "username is required!!" })
    .min(1, { message: "username is required!!" })
    .min(3, {
      message: "Username must be at least 3 characters long. e.g: user123",
    })
    .max(50, {
      message: "Username can be at most 50 characters long. e.g: user123",
    })
    .regex(/^[a-z0-9_.]{1,20}$/, {
      message:
        "Username can only contain lowercase letters, numbers, underscores, and periods. e.g: user123",
    }),
});
/*                                                       Contact US Schema                                                               */

export const contactUsSchema = z.object({
  firstName: z
    .string({ message: "firstName is required!!" })
    .min(1, { message: "firstName is required!!" })
    .min(2, { message: "firstName must be at least 2 characters long." })
    .max(50, { message: "firstName can be at most 50 characters long." }),

  lastName: z
    .string({ message: "lastName is required!!" })
    .min(1, { message: "lastName is required!!" })
    .min(3, { message: "lastName must be at least 3 characters long." })
    .max(50, { message: "lastName can be at most 50 characters long." }),
  email: z
    .string({ message: "email is required!!" })
    .min(1, { message: "email is required!!" })
    .min(3, { message: "email must be at least 3 characters long." })
    .max(150, { message: "email can be at most 150 characters long." })
    .email({ message: "Invalid email format. e.g: john.doe@example.com" }),
  message: z
    .string({ message: "message is required!!" })
    .min(1, { message: "message is required!!" })
    .min(3, { message: "message must be at least 3 characters long." })
    .max(500, { message: "message can be at most 500 characters long." }),
});

export const sendMessagaeToUserSchema = z.object({
  id: z
    .number({ message: "id is required!!" })
    .min(1, { message: "id is required!!" }),
  message: z
    .string({ message: "message is required!!" })
    .min(1, { message: "message is required!!" }),
});
/*                                                 news letter schema                                                    */
export const SubscribeORunsubscribeToNewsLetterSchema = z.object({
  email: z
    .string({ message: "email is required!!" })
    .min(1, { message: "email is required!!" })
    .min(3, { message: "email must be at least 3 characters long." })
    .max(150, { message: "email can be at most 150 characters long." })
    .email({ message: "Invalid email format. e.g: john.doe@example.com" })
    .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
      message: "Invalid email format. e.g: john.doe@example.com",
    }),
});
export const sendNewsLetterToSingleUserSchema = z.object({
  email: z
    .string({ message: "email is required!!" })
    .min(1, { message: "email is required!!" })
    .min(3, { message: "email must be at least 3 characters long." })
    .max(150, { message: "email can be at most 150 characters long." })
    .email({ message: "Invalid email format. e.g: john.doe@example.com" })
    .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
      message: "Invalid email format. e.g: john.doe@example.com",
    }),
  newsLetter: z
    .string({ message: "newsLetter is required!!" })
    .min(1, { message: "newsLetter is required!!" }),
});
export const sendNewsLetterToAllUsersSchema = z.object({
  newsLetter: z
    .string({ message: "newsLetter is required!!" })
    .min(1, { message: "newsLetter is required!!" }),
});
// **** forgot password schema
export const forgotPasswordRequestFromUserSchema = z.object({
  email: z
    .string({ message: "email is required!!" })
    .min(1, { message: "email is required!!" })
    .min(3, { message: "email must be at least 3 characters long." })
    .max(150, { message: "email can be at most 150 characters long." })
    .email({ message: "Invalid email format. e.g: john.doe@example.com" })
    .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
      message: "Invalid email format. e.g: john.doe@example.com",
    }),
});
export const verifyForgotPasswordRequestSchema = z.object({
  OTP: z
    .string({ message: "OTP is required!!" })
    .min(1, { message: "OTP is required!!" })
    .min(6, { message: "OTP must be at least 6 characters long." })
    .max(6, { message: "OTP can be at most 6 characters long." }),
});
export const updateForgotPasswordSchema = z.object({
  newPassword: z
    .string({ message: "newPassword is required!!" })
    .min(1, { message: "newPassword is required!!" })
    .min(6, { message: "newPassword must be at least 6 characters long." })
    .max(50, { message: "newPassword can be at most 50 characters long." }),
});

// *** Get a Quote

export const getQuoteSchema = z.object({
  name: z
    .string({ message: "name is required!!" })
    .min(1, { message: "name is required!!" })
    .min(3, { message: "name must be at least 3 characters long." })
    .max(150, { message: "name can be at most 150 characters long." }),
  email: z
    .string({ message: "email is required!!" })
    .min(1, { message: "email is required!!" })
    .min(3, { message: "email must be at least 3 characters long." })
    .max(150, { message: "email can be at most 150 characters long." })
    .email({ message: "Invalid email format. e.g: john.doe@example.com" })
    .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
      message: "Invalid email format. e.g: john.doe@example.com",
    }),
  phone: z
    .string({ message: "phone is required!!" })
    .min(1, { message: "phone is required!!" })
    .min(3, { message: "phone must be at least 3 characters long." })
    .max(150, { message: "phone can be at most 150 characters long." }),
  address: z
    .string({ message: "address is required!!" })
    .min(1, { message: "address is required!!" })
    .min(3, { message: "address must be at least 3 characters long." })
    .max(450, { message: "address can be at most 150 characters long." }),
  detail: z
    .string({ message: "detail is required!!" })
    .min(1, { message: "detail is required!!" })
    .min(3, { message: "detail must be at least 3 characters long." })
    .max(1000, { message: "detail can be at most 150 characters long." }),
  services: z
    .string({ message: "services is required!!" })
    .min(1, { message: "services is required!!" }),
});

// ** Consultation booking schema

export const consultationBookingSchema = z.object({
  name: z
    .string({ message: "name is required!!" })
    .min(1, { message: "name is required!!" })
    .min(3, { message: "name must be at least 3 characters long." })
    .max(150, { message: "name can be at most 150 characters long." }),
  email: z
    .string({ message: "email is required!!" })
    .min(1, { message: "email is required!!" })
    .min(3, { message: "email must be at least 3 characters long." })
    .max(150, { message: "email can be at most 150 characters long." })
    .email({ message: "Invalid email format. e.g: john.doe@example.com" })
    .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
      message: "Invalid email format. e.g: john.doe@example.com",
    }),
  phone: z
    .string({ message: "phone is required!!" })
    .min(1, { message: "phone is required!!" })
    .min(3, { message: "phone must be at least 3 characters long." })
    .max(150, { message: "phone can be at most 150 characters long." }),
  message: z
    .string({ message: "message is required!!" })
    .min(1, { message: "message is required!!" })
    .min(3, { message: "message must be at least 3 characters long." })
    .max(1000, { message: "message can be at most 150 characters long." }),
  bookingDate: z
    .string({ message: "bookingDate is required!!" })
    .min(1, { message: "bookingDate is required!!" }),
  address: z
    .string({ message: "address is required!!" })
    .min(1, { message: "address is required!!" })
    .min(3, { message: "address must be at least 3 characters long." })
    .max(450, { message: "address can be at most 150 characters long." }),
  subject: z
    .string({ message: "subject is required!!" })
    .min(1, { message: "subject is required!!" })
    .min(3, { message: "subject must be at least 3 characters long." })
    .max(450, { message: "subject can be at most 150 characters long." }),
});

export const hireUsSchema = z.object({
  name: z
    .string({ message: "name is required!!" })
    .min(1, { message: "name is required!!" })
    .min(3, { message: "name must be at least 3 characters long." })
    .max(150, { message: "name can be at most 150 characters long." }),
  email: z
    .string({ message: "email is required!!" })
    .min(1, { message: "email is required!!" })
    .min(3, { message: "email must be at least 3 characters long." })
    .max(150, { message: "email can be at most 150 characters long." })
    .email({ message: "Invalid email format. e.g: john.doe@example.com" })
    .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
      message: "Invalid email format. e.g: john.doe@example.com",
    }),
  phone: z
    .string({ message: "phone is required!!" })
    .min(1, { message: "phone is required!!" })
    .min(3, { message: "phone must be at least 3 characters long." })
    .max(150, { message: "phone can be at most 150 characters long." }),
  detail: z
    .string({ message: "detail is required!!" })
    .min(1, { message: "detail is required!!" })
    .min(3, { message: "detail must be at least 3 characters long." })
    .max(1000, { message: "detail can be at most 1000 characters long." }),
  address: z
    .string({ message: "address is required!!" })
    .min(1, { message: "address is required!!" })
    .min(3, { message: "address must be at least 3 characters long." })
    .max(450, { message: "address can be at most 150 characters long." }),
});
//** Freelancer Schema
export const freeLancerSchema = z.object({
  name: z
    .string({ message: "name is required!!" })
    .min(1, { message: "name is required!!" })
    .min(3, { message: "name must be at least 3 characters long." })
    .max(150, { message: "name can be at most 150 characters long." }),
  email: z
    .string({ message: "email is required!!" })
    .min(1, { message: "email is required!!" })
    .min(3, { message: "email must be at least 3 characters long." })
    .max(150, { message: "email can be at most 150 characters long." })
    .email({ message: "Invalid email format. e.g: john.doe@example.com" })
    .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
      message: "Invalid email format. e.g: john.doe@example.com",
    }),
  phone: z
    .string({ message: "phone is required!!" })
    .min(1, { message: "phone is required!!" })
    .min(3, { message: "phone must be at least 3 characters long." })
    .max(150, { message: "phone can be at most 150 characters long." }),
  detail: z
    .string({ message: "detail is required!!" })
    .min(1, { message: "detail is required!!" })
    .min(3, { message: "detail must be at least 3 characters long." })
    .max(1000, { message: "detail can be at most 1000 characters long." }),
  niche: z
    .string({ message: "niche is required!!" })
    .min(1, { message: "niche is required!!" })
    .min(3, { message: "niche must be at least 3 characters long." })
    .max(450, { message: "niche can be at most 450 characters long." }),
  address: z
    .string({ message: "address is required!!" })
    .min(1, { message: "address is required!!" })
    .min(3, { message: "address must be at least 3 characters long." })
    .max(450, { message: "address can be at most 450 characters long." }),
  yourPortfolio: z
    .string({ message: "yourPortfolio is required!!" })
    .min(1, { message: "yourPortfolio is required!!" })
    .min(3, { message: "yourPortfolio must be at least 3 characters long." })
    .max(450, { message: "yourPortfolio can be at most 450 characters long." }),
  yourTopProject1: z
    .string({ message: "yourTopProject1 is required!!" })
    .min(1, { message: "yourTopProject1 is required!!" })
    .min(3, { message: "yourTopProject1 must be at least 3 characters long." })
    .max(450, {
      message: "yourTopProject1 can be at most 450 characters long.",
    }),
  yourTopProject2: z
    .string({ message: "yourTopProject2 is required!!" })
    .min(1, { message: "yourTopProject2 is required!!" })
    .min(3, { message: "yourTopProject2 must be at least 3 characters long." })
    .max(450, {
      message: "yourTopProject2 can be at most 450 characters long.",
    }),
  yourTopProject3: z
    .string({ message: "yourTopProject3 is required!!" })
    .min(1, { message: "yourTopProject3 is required!!" })
    .min(3, { message: "yourTopProject3 must be at least 3 characters long." })
    .max(450, {
      message: "yourTopProject3 can be at most 450 characters long.",
    }),
});
// ** Project Schema
export const projectSchema = z.object({
  title: z
    .string({ message: "title is required!!" })
    .min(1, { message: "title is required!!" })
    .min(3, { message: "title must be at least 3 characters long." })
    .max(150, { message: "title can be at most 150 characters long." }),
  detail: z
    .string({ message: "detail is required!!" })
    .min(1, { message: "detail is required!!" })
    .min(3, { message: "detail must be at least 3 characters long." }),
  niche: z
    .string({ message: "niche is required!!" })
    .min(1, { message: "niche is required!!" })
    .min(3, { message: "niche must be at least 3 characters long." })
    .max(450, { message: "niche can be at most 450 characters long." }),
  bounty: z
    .number({ message: "bounty is required!!" })
    .min(1, { message: "bounty is required!!" }),
  deadline: z
    .string({ message: "deadline is required!!" })
    .min(1, { message: "deadline is required!!" })
    .min(3, { message: "deadline must be at least 3 characters long." })
    .max(450, { message: "deadline can be at most 450 characters long." }),
});

// ** Blog post schema

export const blogPostSchema = z.object({
  blogTitle: z
    .string({ message: "blogTitle is required!!" })
    .min(1, { message: "blogTitle is required!!" })
    .min(3, { message: "blogTitle must be at least 3 characters long." })
    .max(450, { message: "blogTitle can be at most 450 characters long." }),
  blogThumbnail: z
    .string({ message: "blogThumbnail is required!!" })
    .min(1, { message: "blogThumbnail is required!!" })
    .min(3, { message: "blogThumbnail must be at least 3 characters long." })
    .max(450, { message: "blogThumbnail can be at most 450 characters long." }),
  blogOverview: z
    .string({ message: "blogOverview is required!!" })
    .min(1, { message: "blogOverview is required!!" })
    .min(3, { message: "blogOverview must be at least 3 characters long." })
    .max(650, { message: "blogOverview can be at most 450 characters long." }),
  blogBody: z
    .string({ message: "blogBody is required!!" })
    .min(1, { message: "blogBody is required!!" })
    .min(3, { message: "blogBody must be at least 3 characters long." }),
});
// ** MileStone Schema (NEW - Updated with freelancer and moderator fields)
export const MilestoneSchema = z.object({
  milestoneName: z
    .string({ message: "milestoneName is required!!" })
    .min(1, { message: "milestoneName is required!!" })
    .min(3, { message: "milestoneName must be at least 3 characters long." })
    .max(100, { message: "milestoneName can be at most 100 characters long." }),

  description: z.string({ message: "description must be a string" }).optional(),

  deadline: z
    .string({ message: "deadline is required!!" })
    .min(1, { message: "deadline is required!!" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format for deadline",
    }),

  progress: z
    .number({ message: "progress must be a number" })
    .min(0, { message: "progress cannot be negative" })
    .max(100, { message: "progress cannot exceed 100" })
    .default(0),

  isMilestoneCompleted: z
    .boolean({ message: "isMilestoneCompleted must be a boolean" })
    .default(false),

  // Status and workflow
  status: z
    .enum(["PLANNED", "IN_PROGRESS", "BLOCKED", "COMPLETED", "CANCELLED"], {
      message: "Invalid status value",
    })
    .optional(),

  priority: z
    .enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"], {
      message: "Invalid priority value",
    })
    .optional(),

  phase: z
    .enum(["DISCOVERY", "DESIGN", "IMPLEMENTATION", "TESTING", "DEPLOYMENT"], {
      message: "Invalid phase value",
    })
    .optional(),

  riskLevel: z
    .enum(["LOW", "MEDIUM", "HIGH"], {
      message: "Invalid risk level value",
    })
    .optional(),

  // Freelancer assignment (NEW)
  assignedFreelancerId: z
    .string({ message: "assignedFreelancerId must be a string" })
    .uuid({ message: "assignedFreelancerId must be a valid UUID" })
    .optional(),

  // Budget and time tracking
  estimatedHours: z
    .number({ message: "estimatedHours must be a number" })
    .min(0, { message: "estimatedHours cannot be negative" })
    .optional(),

  actualHours: z
    .number({ message: "actualHours must be a number" })
    .min(0, { message: "actualHours cannot be negative" })
    .optional(),

  budgetEstimate: z
    .number({ message: "budgetEstimate must be a number" })
    .min(0, { message: "budgetEstimate cannot be negative" })
    .optional(),

  actualCost: z
    .number({ message: "actualCost must be a number" })
    .min(0, { message: "actualCost cannot be negative" })
    .optional(),

  // Blocking
  blocked: z.boolean({ message: "blocked must be a boolean" }).optional(),

  blockerReason: z
    .string({ message: "blockerReason must be a string" })
    .optional(),

  // Deliverables
  deliverableUrl: z
    .string({ message: "deliverableUrl must be a string" })
    .url({ message: "deliverableUrl must be a valid URL" })
    .optional(),

  tags: z
    .array(z.string(), { message: "tags must be an array of strings" })
    .optional(),

  notes: z.string({ message: "notes must be a string" }).optional(),

  // Legacy fields (backward compatibility)
  assigneeName: z
    .string({ message: "assigneeName must be a string" })
    .optional(),

  assigneeEmail: z
    .string({ message: "assigneeEmail must be a string" })
    .email({ message: "assigneeEmail must be a valid email" })
    .optional(),
});

// Schema for updating milestone (partial)
export const MilestoneUpdateSchema = MilestoneSchema.partial();

// Schema for moderator approval
export const MilestoneModeratorApprovalSchema = z.object({
  moderatorApproved: z.boolean({
    message: "moderatorApproved must be a boolean",
  }),
  moderatorNotes: z
    .string({ message: "moderatorNotes must be a string" })
    .optional(),
});

// Schema for toggling accepting bids
export const AcceptingBidsSchema = z.object({
  acceptingBids: z.boolean({
    message: "acceptingBids must be a boolean",
  }),
});

// ** Schema for multiple milestones
export const MultipleMilestoneSchema = z.object({
  milestones: z
    .array(MilestoneSchema, { message: "Invalid milestone data format" })
    .min(1, { message: "At least one milestone must be provided" }),
});

// ** Schema for updating milestone progress
export const MilestoneProgressSchema = z.object({
  progress: z
    .number({ message: "progress is required!!" })
    .min(0, { message: "progress cannot be negative" }),
});

// ** Schema for filtering milestones
export const MilestoneFilterSchema = z.object({
  projectId: z.string({ message: "projectId must be a string" }).optional(),

  isCompleted: z
    .enum(["true", "false"], {
      message: "isCompleted must be 'true' or 'false'",
    })
    .optional(),

  priorityRank: z
    .string({ message: "priorityRank must be a string" })
    .optional(),

  sortBy: z
    .enum(["deadline", "priorityRank", "progress", "createdAt"], {
      message:
        "sortBy must be one of: deadline, priorityRank, progress, createdAt",
    })
    .optional()
    .default("priorityRank"),

  sortOrder: z
    .enum(["asc", "desc"], { message: "sortOrder must be 'asc' or 'desc'" })
    .optional()
    .default("asc"),

  page: z
    .string({ message: "page must be a string" })
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: "page must be a valid number",
    }),

  limit: z
    .string({ message: "limit must be a string" })
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: "limit must be a valid number",
    }),
});

// ** ProjectBuilder Schema
export const projectBuilderSchema = z.object({
  projectName: z
    .string({ message: "projectName is required!!" })
    .min(1, { message: "projectName is required!!" })
    .min(3, { message: "projectName must be at least 3 characters long." })
    .max(150, { message: "projectName can be at most 150 characters long." }),

  projectDescription: z
    .string({ message: "projectDescription is required!!" })
    .min(1, { message: "projectDescription is required!!" })
    .min(10, {
      message: "projectDescription must be at least 10 characters long.",
    })
    .max(2000, {
      message: "projectDescription can be at most 2000 characters long.",
    }),

  projectType: z
    .string({ message: "projectType is required!!" })
    .min(1, { message: "projectType is required!!" })
    .min(3, { message: "projectType must be at least 3 characters long." })
    .max(100, { message: "projectType can be at most 100 characters long." }),

  technologies: z
    .array(z.string(), { message: "technologies must be an array of strings" })
    .min(1, { message: "At least one technology must be specified" })
    .max(20, { message: "Maximum 20 technologies allowed" }),

  features: z
    .array(z.string(), { message: "features must be an array of strings" })
    .min(1, { message: "At least one feature must be specified" })
    .max(30, { message: "Maximum 30 features allowed" }),

  budget: z
    .number({ message: "budget must be a number" })
    .min(0, { message: "budget cannot be negative" })
    .optional(),

  timeline: z
    .string({ message: "timeline must be a string" })
    .min(1, { message: "timeline is required if provided" })
    .max(100, { message: "timeline can be at most 100 characters long." })
    .optional(),

  priority: z
    .enum(["LOW", "MEDIUM", "HIGH", "URGENT"], {
      message: "priority must be one of: LOW, MEDIUM, HIGH, URGENT",
    })
    .optional()
    .default("MEDIUM"),

  status: z
    .enum(
      [
        "DRAFT",
        "SUBMITTED",
        "IN_REVIEW",
        "APPROVED",
        "REJECTED",
        "IN_PROGRESS",
        "COMPLETED",
      ],
      {
        message:
          "status must be one of: DRAFT, SUBMITTED, IN_REVIEW, APPROVED, REJECTED, IN_PROGRESS, COMPLETED",
      },
    )
    .optional()
    .default("DRAFT"),

  clientName: z
    .string({ message: "clientName is required!!" })
    .min(1, { message: "clientName is required!!" })
    .min(3, { message: "clientName must be at least 3 characters long." })
    .max(100, { message: "clientName can be at most 100 characters long." }),

  clientEmail: z
    .string({ message: "clientEmail is required!!" })
    .min(1, { message: "clientEmail is required!!" })
    .min(3, { message: "clientEmail must be at least 3 characters long." })
    .max(150, { message: "clientEmail can be at most 150 characters long." })
    .email({ message: "Invalid email format. e.g: john.doe@example.com" })
    .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
      message: "Invalid email format. e.g: john.doe@example.com",
    }),

  clientPhone: z
    .string({ message: "clientPhone must be a string" })
    .min(1, { message: "clientPhone is required if provided" })
    .min(10, { message: "clientPhone must be at least 10 characters long." })
    .max(20, { message: "clientPhone can be at most 20 characters long." })
    .optional(),

  clientCompany: z
    .string({ message: "clientCompany must be a string" })
    .min(1, { message: "clientCompany is required if provided" })
    .min(2, { message: "clientCompany must be at least 2 characters long." })
    .max(100, { message: "clientCompany can be at most 100 characters long." })
    .optional(),

  additionalNotes: z
    .string({ message: "additionalNotes must be a string" })
    .min(1, { message: "additionalNotes is required if provided" })
    .max(1000, {
      message: "additionalNotes can be at most 1000 characters long.",
    })
    .optional(),
});

// ** Visitors Schema
export const visitorsSchema = z.object({
  fullName: z
    .string({ message: "fullName is required!!" })
    .min(1, { message: "fullName is required!!" })
    .min(2, { message: "fullName must be at least 2 characters long." })
    .max(100, { message: "fullName can be at most 100 characters long." }),

  businessEmail: z
    .string({ message: "businessEmail is required!!" })
    .min(1, { message: "businessEmail is required!!" })
    .min(3, { message: "businessEmail must be at least 3 characters long." })
    .max(150, { message: "businessEmail can be at most 150 characters long." })
    .email({ message: "Invalid email format. e.g: john.doe@example.com" })
    .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
      message: "Invalid email format. e.g: john.doe@example.com",
    }),

  phoneNumber: z
    .string({ message: "phoneNumber must be a string" })
    .min(1, { message: "phoneNumber is required if provided" })
    .min(10, { message: "phoneNumber must be at least 10 characters long." })
    .max(20, { message: "phoneNumber can be at most 20 characters long." })
    .optional(),

  companyName: z
    .string({ message: "companyName must be a string" })
    .min(1, { message: "companyName is required if provided" })
    .min(2, { message: "companyName must be at least 2 characters long." })
    .max(100, { message: "companyName can be at most 100 characters long." })
    .optional(),

  companyWebsite: z
    .string({ message: "companyWebsite must be a string" })
    .min(1, { message: "companyWebsite is required if provided" })
    .min(3, { message: "companyWebsite must be at least 3 characters long." })
    .max(200, { message: "companyWebsite can be at most 200 characters long." })
    .url({ message: "companyWebsite must be a valid URL" })
    .optional(),

  businessAddress: z
    .string({ message: "businessAddress is required!!" })
    .min(1, { message: "businessAddress is required!!" })
    .min(5, { message: "businessAddress must be at least 5 characters long." })
    .max(500, {
      message: "businessAddress can be at most 500 characters long.",
    }),

  businessType: z
    .string({ message: "businessType is required!!" })
    .min(1, { message: "businessType is required!!" })
    .min(2, { message: "businessType must be at least 2 characters long." })
    .max(100, { message: "businessType can be at most 100 characters long." }),

  referralSource: z
    .string({ message: "referralSource is required!!" })
    .min(1, { message: "referralSource is required!!" })
    .min(2, { message: "referralSource must be at least 2 characters long." })
    .max(100, {
      message: "referralSource can be at most 100 characters long.",
    }),
});

// ** New Freelancer Registration Schema (matching JSON structure)
export const freelancerRegistrationSchema = z.object({
  whoYouAre: z.object({
    fullName: z
      .string({ message: "fullName is required!!" })
      .min(1, { message: "fullName is required!!" })
      .min(2, { message: "fullName must be at least 2 characters long." })
      .max(100, { message: "fullName can be at most 100 characters long." }),
    email: z
      .string({ message: "email is required!!" })
      .min(1, { message: "email is required!!" })
      .email({ message: "Invalid email format. e.g: john.doe@example.com" })
      .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
        message: "Invalid email format. e.g: john.doe@example.com",
      }),
    timeZone: z
      .string({ message: "timeZone is required!!" })
      .min(1, { message: "timeZone is required!!" }),
    country: z
      .string({ message: "country is required!!" })
      .min(1, { message: "country is required!!" })
      .max(10, { message: "country code can be at most 10 characters long." }),
    professionalLinks: z.object({
      github: z
        .string()
        .url({ message: "GitHub URL must be valid" })
        .optional(),
      gitlab: z
        .string()
        .url({ message: "GitLab URL must be valid" })
        .optional(),
      dribbble: z
        .string()
        .url({ message: "Dribbble URL must be valid" })
        .optional(),
      behance: z
        .string()
        .url({ message: "Behance URL must be valid" })
        .optional(),
      medium: z
        .string()
        .url({ message: "Medium URL must be valid" })
        .optional(),
      stackoverflow: z
        .string()
        .url({ message: "StackOverflow URL must be valid" })
        .optional(),
      kaggle: z
        .string()
        .url({ message: "Kaggle URL must be valid" })
        .optional(),
      personalSite: z
        .string()
        .url({ message: "Personal site URL must be valid" })
        .optional(),
      linkedin: z
        .string()
        .url({ message: "LinkedIn URL must be valid" })
        .optional(),
    }),
  }),
  coreRole: z.object({
    primaryDomain: z
      .string({ message: "primaryDomain is required!!" })
      .min(1, { message: "primaryDomain is required!!" })
      .max(100, {
        message: "primaryDomain can be at most 100 characters long.",
      }),
  }),
  eliteSkillCards: z.object({
    selectedSkills: z
      .array(z.string(), {
        message: "selectedSkills must be an array of strings",
      })
      .min(1, { message: "At least one skill must be selected" })
      .max(20, { message: "Maximum 20 skills allowed" }),
  }),
  toolstackProficiency: z.object({
    selectedTools: z
      .array(
        z.object({
          category: z.string({ message: "category is required!!" }),
          tools: z
            .array(z.string(), { message: "tools must be an array of strings" })
            .min(1, { message: "At least one tool must be specified" }),
        }),
        { message: "selectedTools must be an array of tool objects" },
      )
      .min(1, { message: "At least one tool category must be selected" }),
  }),
  domainExperience: z.object({
    roles: z
      .array(
        z.object({
          title: z.string({ message: "title is required!!" }),
          years: z
            .number({ message: "years must be a number" })
            .min(0, { message: "years cannot be negative" })
            .max(50, { message: "years cannot exceed 50" }),
        }),
        { message: "roles must be an array of role objects" },
      )
      .min(1, { message: "At least one role must be specified" }),
  }),
  industryExperience: z.object({
    selectedIndustries: z
      .array(z.string(), {
        message: "selectedIndustries must be an array of strings",
      })
      .min(1, { message: "At least one industry must be selected" })
      .max(20, { message: "Maximum 20 industries allowed" }),
  }),
  availabilityWorkflow: z.object({
    weeklyCommitment: z
      .number({ message: "weeklyCommitment must be a number" })
      .min(0, { message: "weeklyCommitment cannot be negative" })
      .max(168, { message: "weeklyCommitment cannot exceed 168 hours" }),
    workingHours: z
      .array(z.string(), {
        message: "workingHours must be an array of strings",
      })
      .min(1, { message: "At least one working hour must be specified" }),
    collaborationTools: z
      .array(z.string(), {
        message: "collaborationTools must be an array of strings",
      })
      .min(1, { message: "At least one collaboration tool must be specified" }),
    teamStyle: z
      .string({ message: "teamStyle is required!!" })
      .min(1, { message: "teamStyle is required!!" }),
    screenSharing: z
      .string({ message: "screenSharing is required!!" })
      .min(1, { message: "screenSharing is required!!" }),
    availabilityExceptions: z
      .string({ message: "availabilityExceptions is required!!" })
      .min(1, { message: "availabilityExceptions is required!!" }),
  }),
  softSkills: z.object({
    collaborationStyle: z
      .string({ message: "collaborationStyle is required!!" })
      .min(1, { message: "collaborationStyle is required!!" }),
    communicationFrequency: z
      .string({ message: "communicationFrequency is required!!" })
      .min(1, { message: "communicationFrequency is required!!" }),
    conflictResolution: z
      .string({ message: "conflictResolution is required!!" })
      .min(1, { message: "conflictResolution is required!!" }),
    languages: z
      .array(z.string(), { message: "languages must be an array of strings" })
      .min(1, { message: "At least one language must be specified" }),
    teamVsSolo: z
      .string({ message: "teamVsSolo is required!!" })
      .min(1, { message: "teamVsSolo is required!!" }),
  }),
  certifications: z.object({
    certificates: z
      .array(
        z.object({
          name: z.string({ message: "certificate name is required!!" }),
          url: z.string().url({ message: "certificate URL must be valid" }),
        }),
        { message: "certificates must be an array of certificate objects" },
      )
      .optional(),
  }),
  projectQuoting: z.object({
    compensationPreference: z
      .string({ message: "compensationPreference is required!!" })
      .min(1, { message: "compensationPreference is required!!" }),
    smallProjectPrice: z
      .number({ message: "smallProjectPrice must be a number" })
      .min(0, { message: "smallProjectPrice cannot be negative" }),
    midProjectPrice: z
      .number({ message: "midProjectPrice must be a number" })
      .min(0, { message: "midProjectPrice cannot be negative" }),
    longTermPrice: z
      .number({ message: "longTermPrice must be a number" })
      .min(0, { message: "longTermPrice cannot be negative" }),
    milestoneTerms: z
      .string({ message: "milestoneTerms is required!!" })
      .min(1, { message: "milestoneTerms is required!!" }),
    willSubmitProposals: z
      .string({ message: "willSubmitProposals is required!!" })
      .min(1, { message: "willSubmitProposals is required!!" }),
  }),
  legalAgreements: z.object({
    agreements: z
      .array(
        z.object({
          id: z.string({ message: "agreement id is required!!" }),
          accepted: z.boolean({ message: "accepted must be a boolean" }),
        }),
        { message: "agreements must be an array of agreement objects" },
      )
      .min(1, { message: "At least one agreement must be specified" }),
    identityVerification: z.object({
      idType: z
        .string({ message: "idType is required!!" })
        .min(1, { message: "idType is required!!" }),
      taxDocType: z
        .string({ message: "taxDocType is required!!" })
        .min(1, { message: "taxDocType is required!!" }),
      addressVerified: z.boolean({
        message: "addressVerified must be a boolean",
      }),
    }),
    workAuthorization: z.object({
      interested: z.boolean({ message: "interested must be a boolean" }),
    }),
  }),
});

// ** Payment Schemas
export const createPaymentIntentSchema = z.object({
  amount: z
    .number({ message: "amount is required!!" })
    .min(1, { message: "amount must be at least 1 cent" })
    .max(99999999, { message: "amount cannot exceed 99999999 cents" }),
  currency: z
    .string({ message: "currency is required!!" })
    .min(3, { message: "currency must be at least 3 characters long" })
    .max(3, { message: "currency can be at most 3 characters long" })
    .default("usd"),
  customerEmail: z
    .string({ message: "customerEmail is required!!" })
    .min(1, { message: "customerEmail is required!!" })
    .email({ message: "Invalid email format. e.g: john.doe@example.com" })
    .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
      message: "Invalid email format. e.g: john.doe@example.com",
    }),
  customerName: z
    .string({ message: "customerName must be a string" })
    .min(1, { message: "customerName is required if provided" })
    .min(2, { message: "customerName must be at least 2 characters long" })
    .max(100, { message: "customerName can be at most 100 characters long" })
    .optional(),
  customerPhone: z
    .string({ message: "customerPhone must be a string" })
    .min(1, { message: "customerPhone is required if provided" })
    .min(10, { message: "customerPhone must be at least 10 characters long" })
    .max(20, { message: "customerPhone can be at most 20 characters long" })
    .optional(),
  description: z
    .string({ message: "description must be a string" })
    .min(1, { message: "description is required if provided" })
    .max(500, { message: "description can be at most 500 characters long" })
    .optional(),
});

export const createCheckoutSessionSchema = z.object({
  amount: z
    .number({ message: "amount is required!!" })
    .min(1, { message: "amount must be at least 1 cent" })
    .max(99999999, { message: "amount cannot exceed 99999999 cents" }),
  currency: z
    .string({ message: "currency is required!!" })
    .min(3, { message: "currency must be at least 3 characters long" })
    .max(3, { message: "currency can be at most 3 characters long" })
    .default("usd"),
  customerEmail: z
    .string({ message: "customerEmail is required!!" })
    .min(1, { message: "customerEmail is required!!" })
    .email({ message: "Invalid email format. e.g: john.doe@example.com" })
    .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
      message: "Invalid email format. e.g: john.doe@example.com",
    }),
  customerName: z
    .string({ message: "customerName must be a string" })
    .min(1, { message: "customerName is required if provided" })
    .min(2, { message: "customerName must be at least 2 characters long" })
    .max(100, { message: "customerName can be at most 100 characters long" })
    .optional(),
  successUrl: z
    .string({ message: "successUrl is required!!" })
    .min(1, { message: "successUrl is required!!" })
    .url({ message: "successUrl must be a valid URL" }),
  cancelUrl: z
    .string({ message: "cancelUrl is required!!" })
    .min(1, { message: "cancelUrl is required!!" })
    .url({ message: "cancelUrl must be a valid URL" }),
  description: z
    .string({ message: "description must be a string" })
    .min(1, { message: "description is required if provided" })
    .max(500, { message: "description can be at most 500 characters long" })
    .optional(),
});

export const paymentIntentIdSchema = z.object({
  paymentIntentId: z
    .string({ message: "paymentIntentId is required!!" })
    .min(1, { message: "paymentIntentId is required!!" })
    .min(3, { message: "paymentIntentId must be at least 3 characters long" })
    .max(100, {
      message: "paymentIntentId can be at most 100 characters long",
    }),
});

export const sessionIdSchema = z.object({
  sessionId: z
    .string({ message: "sessionId is required!!" })
    .min(1, { message: "sessionId is required!!" })
    .min(3, { message: "sessionId must be at least 3 characters long" })
    .max(100, { message: "sessionId can be at most 100 characters long" }),
});

export const createRefundSchema = z.object({
  paymentIntentId: z
    .string({ message: "paymentIntentId is required!!" })
    .min(1, { message: "paymentIntentId is required!!" })
    .min(3, { message: "paymentIntentId must be at least 3 characters long" })
    .max(100, {
      message: "paymentIntentId can be at most 100 characters long",
    }),
  amount: z
    .number({ message: "amount must be a number" })
    .min(1, { message: "amount must be at least 1 cent" })
    .max(99999999, { message: "amount cannot exceed 99999999 cents" })
    .optional(),
});

export const paymentStatusUpdateSchema = z.object({
  paymentId: z
    .string({ message: "paymentId is required!!" })
    .min(1, { message: "paymentId is required!!" })
    .min(3, { message: "paymentId must be at least 3 characters long" })
    .max(100, { message: "paymentId can be at most 100 characters long" }),
  status: z.enum(["PENDING", "SUCCEEDED", "FAILED", "CANCELED", "REFUNDED"], {
    message:
      "status must be one of: PENDING, SUCCEEDED, FAILED, CANCELED, REFUNDED",
  }),
});

export const paymentFilterSchema = z.object({
  status: z
    .enum(["PENDING", "SUCCEEDED", "FAILED", "CANCELED", "REFUNDED"], {
      message:
        "status must be one of: PENDING, SUCCEEDED, FAILED, CANCELED, REFUNDED",
    })
    .optional(),
  customerEmail: z
    .string({ message: "customerEmail must be a string" })
    .min(1, { message: "customerEmail is required if provided" })
    .email({ message: "Invalid email format. e.g: john.doe@example.com" })
    .optional(),
  startDate: z
    .string({ message: "startDate must be a string" })
    .min(1, { message: "startDate is required if provided" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format for startDate",
    })
    .optional(),
  endDate: z
    .string({ message: "endDate must be a string" })
    .min(1, { message: "endDate is required if provided" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format for endDate",
    })
    .optional(),
  page: z
    .string({ message: "page must be a string" })
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: "page must be a valid number",
    }),
  limit: z
    .string({ message: "limit must be a string" })
    .optional()
    .refine((val) => !val || !isNaN(Number(val)), {
      message: "limit must be a valid number",
    }),
});

// ============================================
// CLIENT PROJECT CREATION SCHEMAS (NEW SYSTEM)
// ============================================

// Schema for project details
export const clientProjectDetailsSchema = z.object({
  fullName: z
    .string({ message: "fullName is required!!" })
    .min(1, { message: "fullName is required!!" })
    .min(2, { message: "fullName must be at least 2 characters long." })
    .max(200, { message: "fullName can be at most 200 characters long." }),
  businessEmail: z
    .string({ message: "businessEmail is required!!" })
    .min(1, { message: "businessEmail is required!!" })
    .email({ message: "Invalid email format. e.g: john.doe@example.com" })
    .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
      message: "Invalid email format. e.g: john.doe@example.com",
    }),
  phoneNumber: z
    .string({ message: "phoneNumber must be a string" })
    .min(10, { message: "phoneNumber must be at least 10 characters long." })
    .max(32, { message: "phoneNumber can be at most 32 characters long." })
    .optional(),
  companyName: z
    .string({ message: "companyName is required!!" })
    .min(1, { message: "companyName is required!!" })
    .min(2, { message: "companyName must be at least 2 characters long." })
    .max(200, { message: "companyName can be at most 200 characters long." }),
  companyWebsite: z
    .string({ message: "companyWebsite must be a string" })
    .url({ message: "companyWebsite must be a valid URL" })
    .max(2048, {
      message: "companyWebsite can be at most 2048 characters long.",
    })
    .optional(),
  businessAddress: z
    .string({ message: "businessAddress must be a string" })
    .max(500, {
      message: "businessAddress can be at most 500 characters long.",
    })
    .optional(),
  businessType: z
    .string({ message: "businessType is required!!" })
    .min(1, { message: "businessType is required!!" })
    .max(200, { message: "businessType can be at most 200 characters long." }),
  referralSource: z
    .string({ message: "referralSource is required!!" })
    .min(1, { message: "referralSource is required!!" })
    .max(200, {
      message: "referralSource can be at most 200 characters long.",
    }),
});

// Schema for service item
export const clientProjectServiceSchema = z.object({
  name: z.string({ message: "service name is required!!" }),
  childServices: z
    .array(z.string(), { message: "childServices must be an array of strings" })
    .default([]),
});

// Schema for industry item
export const clientProjectIndustrySchema = z.object({
  category: z.string({ message: "industry category is required!!" }),
  subIndustries: z
    .array(z.string(), {
      message: "subIndustries must be an array of strings",
    })
    .default([]),
});

// Schema for technology item
export const clientProjectTechnologySchema = z.object({
  category: z.string({ message: "technology category is required!!" }),
  technologies: z
    .array(z.string(), {
      message: "technologies must be an array of strings",
    })
    .min(1, { message: "At least one technology must be specified" }),
});

// Schema for feature item
export const clientProjectFeatureSchema = z.object({
  category: z.string({ message: "feature category is required!!" }),
  features: z
    .array(z.string(), { message: "features must be an array of strings" })
    .min(1, { message: "At least one feature must be specified" }),
});

// Schema for discount
export const clientProjectDiscountSchema = z.object({
  type: z.enum(
    [
      "STARTUP_FOUNDER",
      "VETERAN_OWNED_BUSINESS",
      "NONPROFIT_ORGANIZATION",
      "NOT_ELIGIBLE",
    ],
    { message: "Invalid discount type" },
  ),
  percent: z
    .number({ message: "percent must be a number" })
    .min(0, { message: "percent cannot be negative" })
    .max(100, { message: "percent cannot exceed 100" }),
  notes: z
    .string({ message: "notes must be a string" })
    .max(500, { message: "notes can be at most 500 characters long." })
    .optional(),
});

// Schema for timeline
export const clientProjectTimelineSchema = z.object({
  option: z.enum(
    [
      "STANDARD_BUILD",
      "PRIORITY_BUILD",
      "ACCELERATED_BUILD",
      "RAPID_BUILD",
      "FAST_TRACK_BUILD",
    ],
    { message: "Invalid timeline option" },
  ),
  rushFeePercent: z
    .number({ message: "rushFeePercent must be a number" })
    .min(0, { message: "rushFeePercent cannot be negative" })
    .max(100, { message: "rushFeePercent cannot exceed 100" }),
  estimatedDays: z
    .number({ message: "estimatedDays must be a number" })
    .min(1, { message: "estimatedDays must be at least 1" }),
  description: z
    .string({ message: "description must be a string" })
    .max(500, { message: "description can be at most 500 characters long." })
    .optional(),
});

// Schema for estimate
export const clientProjectEstimateSchema = z.object({
  estimateAccepted: z.boolean({
    message: "estimateAccepted must be a boolean",
  }),
  estimateFinalPriceMin: z
    .number({ message: "estimateFinalPriceMin must be a number" })
    .min(0, { message: "estimateFinalPriceMin cannot be negative" }),
  estimateFinalPriceMax: z
    .number({ message: "estimateFinalPriceMax must be a number" })
    .min(0, { message: "estimateFinalPriceMax cannot be negative" }),
});

// Schema for service agreement
export const clientProjectServiceAgreementSchema = z.object({
  documentUrl: z
    .string({ message: "documentUrl is required!!" })
    .url({ message: "documentUrl must be a valid URL" })
    .max(2048, { message: "documentUrl can be at most 2048 characters long." }),
  agreementVersion: z
    .string({ message: "agreementVersion must be a string" })
    .max(100, {
      message: "agreementVersion can be at most 100 characters long.",
    })
    .optional(),
  accepted: z.boolean({ message: "accepted must be a boolean" }).default(true),
  ipAddress: z
    .string({ message: "ipAddress must be a string" })
    .max(45, { message: "ipAddress can be at most 45 characters long." })
    .optional(),
  userAgent: z.string({ message: "userAgent must be a string" }).optional(),
  locale: z
    .string({ message: "locale must be a string" })
    .max(35, { message: "locale can be at most 35 characters long." })
    .optional(),
});

// Main schema for creating a project (matching visitor flow requirements)
export const clientProjectCreateSchema = z.object({
  details: clientProjectDetailsSchema,
  services: z
    .array(clientProjectServiceSchema, {
      message: "services must be an array of service objects",
    })
    .min(1, { message: "At least one service must be selected" }),
  industries: z
    .array(clientProjectIndustrySchema, {
      message: "industries must be an array of industry objects",
    })
    .min(1, { message: "At least one industry must be selected" }),
  technologies: z
    .array(clientProjectTechnologySchema, {
      message: "technologies must be an array of technology objects",
    })
    .min(1, { message: "At least one technology category must be selected" }),
  features: z
    .array(clientProjectFeatureSchema, {
      message: "features must be an array of feature objects",
    })
    .min(1, { message: "At least one feature category must be selected" }),
  discount: clientProjectDiscountSchema,
  timeline: clientProjectTimelineSchema,
  estimate: clientProjectEstimateSchema,
  serviceAgreement: clientProjectServiceAgreementSchema,
  discordChatUrl: z
    .string({ message: "discordChatUrl must be a string" })
    .url({ message: "discordChatUrl must be a valid URL" })
    .max(2048, {
      message: "discordChatUrl can be at most 2048 characters long.",
    })
    .optional(),
});

// Schema for updating a project (all fields optional for partial updates)
export const clientProjectUpdateSchema = z.object({
  details: clientProjectDetailsSchema.partial().optional(),
  services: z
    .array(clientProjectServiceSchema, {
      message: "services must be an array of service objects",
    })
    .min(1, { message: "At least one service must be selected" })
    .optional(),
  industries: z
    .array(clientProjectIndustrySchema, {
      message: "industries must be an array of industry objects",
    })
    .min(1, { message: "At least one industry must be selected" })
    .optional(),
  technologies: z
    .array(clientProjectTechnologySchema, {
      message: "technologies must be an array of technology objects",
    })
    .min(1, { message: "At least one technology category must be selected" })
    .optional(),
  features: z
    .array(clientProjectFeatureSchema, {
      message: "features must be an array of feature objects",
    })
    .min(1, { message: "At least one feature category must be selected" })
    .optional(),
  discount: clientProjectDiscountSchema.optional(),
  timeline: clientProjectTimelineSchema.optional(),
  estimate: clientProjectEstimateSchema.optional(),
  discordChatUrl: z
    .string({ message: "discordChatUrl must be a string" })
    .url({ message: "discordChatUrl must be a valid URL" })
    .max(2048, {
      message: "discordChatUrl can be at most 2048 characters long.",
    })
    .optional(),
});

// ============================================
// MODERATOR MANAGEMENT SCHEMAS
// ============================================

// ** Create moderator schema
export const createModeratorSchema = z.object({
  email: z
    .string({ message: "email is required" })
    .email({ message: "Invalid email format" })
    .max(254, { message: "Email can be at most 254 characters long" }),
  fullName: z
    .string({ message: "fullName is required" })
    .min(2, { message: "fullName must be at least 2 characters long" })
    .max(100, { message: "fullName can be at most 100 characters long" }),
});

// ** Update moderator schema
export const updateModeratorSchema = z.object({
  fullName: z
    .string({ message: "fullName must be a string" })
    .min(2, { message: "fullName must be at least 2 characters long" })
    .max(100, { message: "fullName can be at most 100 characters long" })
    .optional(),
  email: z
    .string({ message: "email must be a string" })
    .email({ message: "Invalid email format" })
    .max(254, { message: "Email can be at most 254 characters long" })
    .optional(),
  phone: z
    .string({ message: "phone must be a string" })
    .max(32, { message: "phone can be at most 32 characters long" })
    .optional(),
});

// ** Toggle moderator status schema
export const toggleModeratorStatusSchema = z.object({
  isActive: z.boolean({ message: "isActive must be a boolean" }),
});

// ** Assign moderator to project schema
export const assignModeratorToProjectSchema = z.object({
  moderatorId: z
    .string({ message: "moderatorId is required" })
    .min(1, { message: "moderatorId is required" }),
});

// ============================================
// MILESTONE PAYMENT AGREEMENT SCHEMAS
// ============================================

// ** Create payment agreement schema
export const createPaymentAgreementSchema = z.object({
  agreementDocumentUrl: z
    .string({ message: "agreementDocumentUrl is required" })
    .url({ message: "agreementDocumentUrl must be a valid URL" })
    .max(2048, {
      message: "agreementDocumentUrl can be at most 2048 characters long",
    }),
  milestoneAmount: z
    .number({ message: "milestoneAmount is required" })
    .positive({ message: "milestoneAmount must be positive" })
    .or(
      z
        .string()
        .regex(/^\d+(\.\d{1,2})?$/, {
          message: "milestoneAmount must be a valid decimal number",
        })
        .transform((val) => parseFloat(val)),
    ),
  distributionDetails: z
    .record(
      z.object({
        id: z.string().optional(),
        name: z.string().optional(),
        percentage: z
          .number()
          .min(0, { message: "percentage must be at least 0" })
          .max(100, { message: "percentage must be at most 100" })
          .optional(),
        amount: z
          .number()
          .min(0, { message: "amount must be at least 0" })
          .optional(),
      }),
    )
    .refine(
      (details) => {
        const totalPercentage = Object.values(details).reduce(
          (sum, item) => sum + (item.percentage || 0),
          0,
        );
        return totalPercentage <= 100;
      },
      { message: "Total percentage cannot exceed 100%" },
    ),
  status: z
    .enum(["DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"], {
      message: "status must be one of: DRAFT, ACTIVE, COMPLETED, CANCELLED",
    })
    .optional(),
  notes: z
    .string()
    .max(5000, { message: "notes can be at most 5000 characters long" })
    .optional(),
});

// ** Update payment agreement schema (all fields optional)
export const updatePaymentAgreementSchema = z.object({
  agreementDocumentUrl: z
    .string({ message: "agreementDocumentUrl must be a string" })
    .url({ message: "agreementDocumentUrl must be a valid URL" })
    .max(2048, {
      message: "agreementDocumentUrl can be at most 2048 characters long",
    })
    .optional(),
  milestoneAmount: z
    .number({ message: "milestoneAmount must be a number" })
    .positive({ message: "milestoneAmount must be positive" })
    .or(
      z
        .string()
        .regex(/^\d+(\.\d{1,2})?$/, {
          message: "milestoneAmount must be a valid decimal number",
        })
        .transform((val) => parseFloat(val)),
    )
    .optional(),
  distributionDetails: z
    .record(
      z.object({
        id: z.string().optional(),
        name: z.string().optional(),
        percentage: z
          .number()
          .min(0, { message: "percentage must be at least 0" })
          .max(100, { message: "percentage must be at most 100" })
          .optional(),
        amount: z
          .number()
          .min(0, { message: "amount must be at least 0" })
          .optional(),
      }),
    )
    .refine(
      (details) => {
        const totalPercentage = Object.values(details).reduce(
          (sum, item) => sum + (item.percentage || 0),
          0,
        );
        return totalPercentage <= 100;
      },
      { message: "Total percentage cannot exceed 100%" },
    )
    .optional(),
  status: z
    .enum(["DRAFT", "ACTIVE", "COMPLETED", "CANCELLED"], {
      message: "status must be one of: DRAFT, ACTIVE, COMPLETED, CANCELLED",
    })
    .optional(),
  notes: z
    .string()
    .max(5000, { message: "notes can be at most 5000 characters long" })
    .optional(),
});

// ============================================
// KPI MANAGEMENT SCHEMAS
// ============================================

// ** Assign KPI points schema
export const assignKPIPointsSchema = z.object({
  points: z
    .number({ message: "points is required" })
    .int({ message: "points must be an integer" })
    .refine((val) => val !== 0, { message: "points cannot be zero" }),
  note: z
    .string({ message: "note is required" })
    .min(5, { message: "note must be at least 5 characters long" })
    .max(500, { message: "note can be at most 500 characters long" }),
  projectId: z
    .string({ message: "projectId must be a string" })
    .uuid({ message: "projectId must be a valid UUID" })
    .optional(), // Required for Moderator/Client, optional for Admin
});

// ============================================
// PRICING MANAGEMENT SCHEMAS (Admin only)
// ============================================

// ** Update Service Category
export const updateServiceCategorySchema = z.object({
  basePrice: z
    .number({ message: "basePrice must be a number" })
    .positive({ message: "basePrice must be positive" })
    .optional(),
  description: z
    .string()
    .min(5, { message: "description must be at least 5 characters" })
    .max(500, { message: "description can be at most 500 characters" })
    .optional(),
});

// ** Create/Update Technology
export const createTechnologySchema = z.object({
  technology: z
    .string({ message: "technology is required" })
    .min(2, { message: "technology must be at least 2 characters" })
    .max(100, { message: "technology can be at most 100 characters" }),
  additionalCost: z
    .number({ message: "additionalCost is required" })
    .min(0, { message: "additionalCost must be at least 0" }),
});

export const updateTechnologySchema = z.object({
  technology: z
    .string()
    .min(2, { message: "technology must be at least 2 characters" })
    .max(100, { message: "technology can be at most 100 characters" })
    .optional(),
  additionalCost: z
    .number({ message: "additionalCost must be a number" })
    .min(0, { message: "additionalCost must be at least 0" })
    .optional(),
});

// ** Create/Update Feature
export const createFeatureSchema = z.object({
  feature: z
    .string({ message: "feature is required" })
    .min(2, { message: "feature must be at least 2 characters" })
    .max(200, { message: "feature can be at most 200 characters" }),
  additionalCost: z
    .number({ message: "additionalCost is required" })
    .min(0, { message: "additionalCost must be at least 0" }),
});

export const updateFeatureSchema = z.object({
  feature: z
    .string()
    .min(2, { message: "feature must be at least 2 characters" })
    .max(200, { message: "feature can be at most 200 characters" })
    .optional(),
  additionalCost: z
    .number({ message: "additionalCost must be a number" })
    .min(0, { message: "additionalCost must be at least 0" })
    .optional(),
});

// ** Bulk Update Schemas
export const bulkUpdateServiceCategoriesSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string().uuid({ message: "id must be a valid UUID" }),
      basePrice: z.number().positive({ message: "basePrice must be positive" }),
      description: z.string().max(500).optional(),
    }),
  ),
});

export const bulkUpdateTechnologiesSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string().uuid({ message: "id must be a valid UUID" }),
      technology: z.string().min(2).max(100).optional(),
      additionalCost: z.number().min(0),
    }),
  ),
});

export const bulkUpdateFeaturesSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string().uuid({ message: "id must be a valid UUID" }),
      feature: z.string().min(2).max(200).optional(),
      additionalCost: z.number().min(0),
    }),
  ),
});

// ** Agreement Acceptance Schemas
export const acceptVisitorServiceAgreementSchema = z.object({
  accepted: z
    .boolean({ message: "accepted must be a boolean" })
    .refine((val) => val === true, {
      message: "You must accept the service agreement to proceed",
    }),
});

export const acceptFreelancerPlatformAgreementSchema = z.object({
  freelancerEmail: z
    .string({ message: "freelancerEmail is required!!" })
    .min(1, { message: "freelancerEmail is required!!" })
    .email({ message: "Invalid email format. e.g: john.doe@example.com" })
    .regex(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/, {
      message: "Invalid email format. e.g: john.doe@example.com",
    }),
  fullName: z
    .string({ message: "fullName is required!!" })
    .min(1, { message: "fullName is required!!" })
    .min(2, { message: "Full name must be at least 2 characters long" })
    .max(200, { message: "Full name can be at most 200 characters long" }),
  country: z
    .string({ message: "country is required!!" })
    .min(1, { message: "country is required!!" })
    .min(2, { message: "Country must be at least 2 characters long" })
    .max(100, { message: "Country can be at most 100 characters long" }),
  accepted: z
    .boolean({ message: "accepted must be a boolean" })
    .refine((val) => val === true, {
      message: "You must accept the platform agreement to proceed",
    }),
});
