import { Router } from "express";
import freelancerRouter from "./freelancerRouter";
import adminFreelancerRouter from "./adminFreelancerRouter";

const router = Router();

// ============================================
// FREELANCER ROUTES
// ============================================
// Base path: /api/freelancer
// Public registration and authenticated freelancer endpoints
router.use("/", freelancerRouter);

// ============================================
// ADMIN ROUTES
// ============================================
// Base path: /api/freelancer/admin
// Admin-only endpoints for managing freelancers and bids
router.use("/admin", adminFreelancerRouter);

export default router;
