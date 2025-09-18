import { Router } from "express";
import {
  createFRAClaim,
  deleteFRAClaim,
  getFRAClaimById,
  getFRAClaims,
  updateFRAClaim,
  trackClaimStatus,
} from "../handler/fra-claim.handler";
import { validate } from "../middleware/validate.middleware";
import {
  createFRAClaimSchema,
  updateFRAClaimSchema,
} from "../schemas/fra-claim.schema";
import { authenticateJWT, authorizeRoles } from "../middleware/auth.middleware";

const router = Router();

router.get("/track/:claimId", trackClaimStatus);

router.get("/", authenticateJWT, getFRAClaims);
router.get("/:id", authenticateJWT, getFRAClaimById);

router.post(
  "/",
  authenticateJWT,
  authorizeRoles([
    "VillagePerson",
    "GramSabha",
    "SubDivisionalCommittee",
    "DistrictCommittee",
  ]),
  validate(createFRAClaimSchema),
  createFRAClaim,
);

router.put(
  "/:id",
  authenticateJWT,
  authorizeRoles(["GramSabha", "SubDivisionalCommittee", "DistrictCommittee"]),
  validate(updateFRAClaimSchema),
  updateFRAClaim,
);
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles(["DistrictCommittee"]),
  deleteFRAClaim,
);

export { router as fraClaimRoutes };
