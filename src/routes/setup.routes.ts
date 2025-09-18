import { Router } from "express";
import {
  createFirstAdmin,
  checkSetupStatus,
} from "../handler/public-auth.handler";

const router = Router();

router.get("/status", checkSetupStatus);
router.post("/admin", createFirstAdmin);

export { router as setupRoutes };
