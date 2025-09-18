import { Router } from "express";
import {
  getAdminStats,
  bulkCreateStates,
  bulkCreateDistricts,
  bulkCreateVillages,
  getAllUsers,
  createUserAdmin,
  deleteUser,
  seedDemoData,
  exportData,
} from "../handler/admin.handler";
import { authenticateJWT, authorizeRoles } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles(["DistrictCommittee"]));

router.get("/stats", getAdminStats);

router.post("/bulk/states", bulkCreateStates);
router.post("/bulk/districts", bulkCreateDistricts);
router.post("/bulk/villages", bulkCreateVillages);

router.get("/users", getAllUsers);
router.post("/users", createUserAdmin);
router.delete("/users/:userId", deleteUser);

router.post("/seed", seedDemoData);

router.get("/export", exportData);

export { router as adminRoutes };
