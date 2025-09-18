import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../middleware/auth.middleware";
import {
  approveClaim,
  verifyClaim,
  rejectClaim,
  forwardClaim,
  getDashboardStats,
} from "../handler/fra.handler";

const router = Router();

router.get("/stats", authenticateJWT, getDashboardStats);

router.post(
  "/forward/:id",
  authenticateJWT,
  authorizeRoles(["GramSabha", "SubDivisionalCommittee"]),
  forwardClaim,
);

router.post(
  "/verify/:id",
  authenticateJWT,
  authorizeRoles(["GramSabha", "SubDivisionalCommittee", "DistrictCommittee"]),
  verifyClaim,
);

router.post(
  "/approve/:id",
  authenticateJWT,
  authorizeRoles(["DistrictCommittee"]),
  approveClaim,
);

router.post(
  "/reject/:id",
  authenticateJWT,
  authorizeRoles(["DistrictCommittee"]),
  rejectClaim,
);

export { router as fraRoutes };
