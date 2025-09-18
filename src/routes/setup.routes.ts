import { Router } from "express";
import { createFirstAdmin, checkSetupStatus } from "../handler/public-auth.handler";

const router = Router();

// Public routes for initial system setup - no authentication required
router.get("/status", checkSetupStatus);
router.post("/admin", createFirstAdmin);

export { router as setupRoutes };
