import { Router } from "express";
import {
  createVillage,
  deleteVillage,
  getVillageById,
  getVillages,
  updateVillage,
} from "../handler/village.handler";
import { validate } from "../middleware/validate.middleware";
import {
  createVillageSchema,
  updateVillageSchema,
} from "../schemas/village.schema";
import {
  authenticateJWT,
  authorizeRoles,
} from "../middleware/auth.middleware";

const router = Router();

// public routes
router.get("/", getVillages);
router.get("/:id", getVillageById);

// protected routes
router.post(
  "/",
  authenticateJWT,
  authorizeRoles(["GramSabha", "SubDivisionalCommittee", "DistrictCommittee"]),
  validate(createVillageSchema),
  createVillage
);
router.put(
  "/:id",
  authenticateJWT,
  authorizeRoles(["GramSabha", "SubDivisionalCommittee", "DistrictCommittee"]),
  validate(updateVillageSchema),
  updateVillage
);
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles(["DistrictCommittee"]),
  deleteVillage
);

export { router as villageRoutes };
