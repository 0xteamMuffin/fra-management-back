import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../middleware/auth.middleware";
import { approveClaim, verifyClaim, rejectClaim, forwardClaim, getDashboardStats } from "../handler/fra.handler";

const router = Router();

// Stats route
router.get("/stats", authenticateJWT, getDashboardStats);

// Route to move claims through the workflow
router.post(
  "/forward/:id",
  authenticateJWT,
  authorizeRoles(["GramSabha", "SubDivisionalCommittee"]),
  forwardClaim
);

// only GramSabha and higher can verify FRA claims
router.post(
  "/verify/:id",
  authenticateJWT,
  authorizeRoles(["GramSabha", "SubDivisionalCommittee", "DistrictCommittee"]),
  verifyClaim
);

// only District Committee can approve or reject final claims
router.post(
  "/approve/:id",
  authenticateJWT,
  authorizeRoles(["DistrictCommittee"]),
  approveClaim
);

router.post(
  "/reject/:id",
  authenticateJWT,
  authorizeRoles(["DistrictCommittee"]),
  rejectClaim
);

export { router as fraRoutes };
