import { Router } from "express";
import {
  createState,
  deleteState,
  getStateById,
  getStates,
  updateState,
} from "../handler/state.handler";
import { validate } from "../middleware/validate.middleware";
import {
  createStateSchema,
  updateStateSchema,
} from "../schemas/state.schema";
import {
  authenticateJWT,
  authorizeRoles,
} from "../middleware/auth.middleware";

const router = Router();

// public routes
router.get("/", getStates);
router.get("/:id", getStateById);

// protected routes - only higher-level users can modify state data
router.post(
  "/",
  authenticateJWT,
  authorizeRoles(["SubDivisionalCommittee", "DistrictCommittee"]),
  validate(createStateSchema),
  createState
);
router.put(
  "/:id",
  authenticateJWT,
  authorizeRoles(["SubDivisionalCommittee", "DistrictCommittee"]),
  validate(updateStateSchema),
  updateState
);
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles(["DistrictCommittee"]), // only district committee can delete
  deleteState
);

export { router as stateRoutes };
