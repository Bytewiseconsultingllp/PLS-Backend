import { Router } from "express";
import endpoint from "../constants/endpoint";
import { authRouter } from "./authRouter/authRouter";
import { blogRouter } from "./blogRouter/blogRouter";
import { consultationRouter } from "./consultationRouter/consultationRouter";
import { contactUsRouter } from "./contactUsRouter/contactUsRouter";
// OLD ROUTERS (Deprecated - kept for backward compatibility)
// import { freeLancerRouter } from "./freelancerRouter/freeLancerRouter";
// import projectRequestRouter from "./projectRequestRouter/projectRequestRouter";
// import { projectRouter } from "./projectRouter/projectRouter";
// import { projectBuilderRouter } from "./projectBuilderRouter/projectBuilderRouter";
// import { visitorsRouter } from "./visitorsRouter/visitorsRouter";

// NEW ROUTERS (Rebuilt schema)
import newVisitorsRouter from "./visitorsRouter/newVisitorsRouter";
import newProjectRouter from "./projectRouter/newProjectRouter";
import clientProjectDraftRouter from "./clientProjectDraftRouter";
import newFreelancerRouter from "./freelancerRouter/newFreelancerRouter";
import freelancerPaymentRouter from "./freelancerRouter/freelancerPaymentRouter";
import freelancerStripeConnectRouter from "./freelancerRouter/freelancerStripeConnectRouter";
import adminModeratorRouter from "./moderatorRouter/adminModeratorRouter";
import moderatorRouter from "./moderatorRouter/moderatorRouter";
import paymentAgreementRouter from "./paymentAgreementRouter/paymentAgreementRouter";
import kpiRouter from "./kpiRouter/kpiRouter";
import pricingRouter from "./pricingRouter/pricingRouter";
import adminRouter from "./adminRouter/adminRouter";
import referenceDataRouter from "./referenceDataRouter";

// OLD - Uses deprecated CreateServicesForQuote model
// import { getQuoteRouter } from "./getQuoteRouter/getQuoteRouter";
import { healthRouter } from "./healthRouter/healthRouter";
import { hireUsRouter } from "./hireUsRouter/hireUsRouter";
// import { milestoneRouter } from "./mileStoneRouter/mileStoneRouter"; // Deprecated - milestones now part of project
import { navigationPagesRouter } from "./navigationPagesRouter/navigationPagesRouter";
import { newsLetterRouter } from "./newsLetterRouter/newsLetterRouter";
import { trashRouter } from "./trashRouter/trashRouter";
import { paymentRouter } from "./paymentRouter/paymentRouter";
export const defaultRouter: Router = Router();

defaultRouter.use(endpoint.AUTHROUTE, authRouter);

// ** Health route
defaultRouter.use(endpoint.HEALTHROUTE, healthRouter);

// ** Contact Us Route
defaultRouter.use(endpoint.CONTACTUSROUTE, contactUsRouter);

// ** Newsletter Router
defaultRouter.use(endpoint.NEWSLETTERROUTE, newsLetterRouter);

// **  Trash Router
defaultRouter.use(endpoint.TRASHROUTE, trashRouter);

// ** Navigation Pages Router
defaultRouter.use(endpoint.NAVIGATIONPAGESROUTE, navigationPagesRouter);
// ** Reference Data Router (Public - Provides all enum values for frontend)
defaultRouter.use(endpoint.REFERENCEDATAROUTE, referenceDataRouter);
// ** Get Quotes Router (OLD - DEPRECATED - Uses removed CreateServicesForQuote model)
// defaultRouter.use(endpoint.GETQUOTESROUTE, getQuoteRouter);

// ** Consultation Router
defaultRouter.use(endpoint.CONSULTATIONROUTE, consultationRouter);

// **   HIRE US ROUTER
defaultRouter.use(endpoint.HIREUSROUTE, hireUsRouter);

// **   BLOG  ROUTER
defaultRouter.use(endpoint.BLOG, blogRouter);

// **   PAYMENT  ROUTER
defaultRouter.use(endpoint.PAYMENTROUTE, paymentRouter);

// ============================================
// NEW ROUTERS (Rebuilt Schema)
// ============================================

// **   VISITORS ROUTER (NEW)
defaultRouter.use(endpoint.VISITORSROUTE, newVisitorsRouter);

// **   PROJECTS ROUTER (NEW) - includes milestones
defaultRouter.use(endpoint.PROJECT, newProjectRouter);

// **   CLIENT PROJECT DRAFT ROUTER (NEW) - step-by-step project creation for existing clients
defaultRouter.use(`${endpoint.PROJECT}/draft`, clientProjectDraftRouter);

// **   FREELANCERS ROUTER (NEW) - MUST be first to handle /admin routes before other middleware
defaultRouter.use(endpoint.FREELANCER, newFreelancerRouter);

// **   FREELANCER STRIPE CONNECT ROUTER (OAuth flow)
defaultRouter.use(endpoint.FREELANCER, freelancerStripeConnectRouter);

// **   FREELANCER PAYMENT ROUTER (Freelancer manages their own payment details)
defaultRouter.use(endpoint.FREELANCER, freelancerPaymentRouter);

// **   MODERATORS ROUTER (NEW)
defaultRouter.use(endpoint.ADMINMODERATORROUTE, adminModeratorRouter);
defaultRouter.use(endpoint.MODERATORROUTE, moderatorRouter);

// **   PAYMENT AGREEMENTS ROUTER (NEW)
defaultRouter.use(endpoint.ADMINROUTE, paymentAgreementRouter);

// **   KPI ROUTER (NEW)
defaultRouter.use(endpoint.ADMINROUTE, kpiRouter); // For admin KPI endpoints
defaultRouter.use("/", kpiRouter); // For public/general KPI endpoints

// **   PRICING ROUTER (Admin only)
defaultRouter.use(`${endpoint.ADMINROUTE}/pricing`, pricingRouter);

// **   ADMIN ROUTER (Admin only - comprehensive admin endpoints)
defaultRouter.use(endpoint.ADMINROUTE, adminRouter);

// ============================================
// OLD DEPRECATED ROUTES (Commented out)
// ============================================
// These routes are replaced by the new schema implementation above
// Uncomment temporarily if you need backward compatibility during migration

// defaultRouter.use(endpoint.PROJECTREQUESTROUTE, projectRequestRouter);
// defaultRouter.use(endpoint.FREELANCER, freeLancerRouter);
// defaultRouter.use(endpoint.PROJECT, projectRouter);
// defaultRouter.use(endpoint.MILESTONE, milestoneRouter);
// defaultRouter.use(endpoint.PROJECTBUILDERROUTE, projectBuilderRouter);
// defaultRouter.use(endpoint.VISITORSROUTE, visitorsRouter);
