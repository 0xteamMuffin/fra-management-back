import { Router } from "express";
import {
  createState,
  deleteState,
  getStateById,
  getStates,
  updateState,
} from "../handler/state.handler";
import { validate } from "../middleware/validate.middleware";
import { createStateSchema, updateStateSchema } from "../schemas/state.schema";
import { authenticateJWT, authorizeRoles } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getStates);
router.get("/:id", getStateById);

router.post(
  "/",
  authenticateJWT,
  authorizeRoles(["SubDivisionalCommittee", "DistrictCommittee"]),
  validate(createStateSchema),
  createState,
);
router.put(
  "/:id",
  authenticateJWT,
  authorizeRoles(["SubDivisionalCommittee", "DistrictCommittee"]),
  validate(updateStateSchema),
  updateState,
);
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles(["DistrictCommittee"]),
  deleteState,
);

export { router as stateRoutes };
