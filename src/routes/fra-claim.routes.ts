import { Router } from "express";
import {
  createFRAClaim,
  deleteFRAClaim,
  getFRAClaimById,
  getFRAClaims,
  updateFRAClaim,
} from "../handler/fra-claim.handler";
import { validate } from "../middleware/validate.middleware";
import {
  createFRAClaimSchema,
  updateFRAClaimSchema,
} from "../schemas/fra-claim.schema";
import {
  authenticateJWT,
  authorizeRoles,
} from "../middleware/auth.middleware";

const router = Router();

// all users can view claims
router.get("/", authenticateJWT, getFRAClaims);
router.get("/:id", authenticateJWT, getFRAClaimById);

// a village person can create a claim
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
  createFRAClaim
);

// only higher-level users can update or delete
router.put(
  "/:id",
  authenticateJWT,
  authorizeRoles(["GramSabha", "SubDivisionalCommittee", "DistrictCommittee"]),
  validate(updateFRAClaimSchema),
  updateFRAClaim
);
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles(["DistrictCommittee"]),
  deleteFRAClaim
);

export { router as fraClaimRoutes };
