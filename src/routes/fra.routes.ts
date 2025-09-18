import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../middleware/auth.middleware";
import { approveClaim, verifyClaim, rejectClaim } from "../handler/fra.handler";

const router = Router();

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
