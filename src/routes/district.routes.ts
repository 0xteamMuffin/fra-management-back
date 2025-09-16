import { Router } from "express";
import {
  createDistrict,
  deleteDistrict,
  getDistrictById,
  getDistricts,
  updateDistrict,
} from "../handler/district.handler";
import { validate } from "../middleware/validate.middleware";
import {
  createDistrictSchema,
  updateDistrictSchema,
} from "../schemas/district.schema";
import {
  authenticateJWT,
  authorizeRoles,
} from "../middleware/auth.middleware";

const router = Router();

// public routes
router.get("/", getDistricts);
router.get("/:id", getDistrictById);

// protected routes
router.post(
  "/",
  authenticateJWT,
  authorizeRoles(["SubDivisionalCommittee", "DistrictCommittee"]),
  validate(createDistrictSchema),
  createDistrict
);
router.put(
  "/:id",
  authenticateJWT,
  authorizeRoles(["SubDivisionalCommittee", "DistrictCommittee"]),
  validate(updateDistrictSchema),
  updateDistrict
);
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles(["DistrictCommittee"]),
  deleteDistrict
);

export { router as districtRoutes };
