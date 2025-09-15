import { Router } from "express";
import { authenticateJWT, authorizeRoles } from "../middleware/auth.middleware";
import { approveClaim, verifyClaim } from "../handler/fra.handler";

const router = Router();

// only GramSabha and higher can verify FRA claims
router.post(
  "/verify/:id",
  authenticateJWT,
  authorizeRoles(["GramSabha", "SubDivisionalCommittee", "DistrictCommittee"]),
  verifyClaim
);

// only District Committee can approve final claims
router.post(
  "/approve/:id",
  authenticateJWT,
  authorizeRoles(["DistrictCommittee"]),
  approveClaim
);

export { router as fraRoutes };
